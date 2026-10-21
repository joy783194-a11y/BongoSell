import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { encryptToken, decryptToken } from './crypto.js';
import { metaClient } from './meta-client.js';

let serverSupabase: SupabaseClient | null = null;

function getServerSupabase(): SupabaseClient | null {
  if (serverSupabase) return serverSupabase;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Use service role key if available for administrative / webhook bypass; otherwise anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    serverSupabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverSupabase;
}

// In-memory server-side cache for secure tokens when operating in local demo / dev fallback mode
const memorySecureTokens = new Map<string, {
  workspaceId: string;
  pageId: string;
  encrypted: string;
  iv: string;
  authTag: string;
  scopes: string[];
  pageName: string;
}>();

export interface SavePageConnectionParams {
  workspaceId: string;
  pageId: string;
  pageName: string;
  category?: string;
  profilePic?: string;
  accessToken: string;
  scopes?: string[];
  subscribedFields?: string[];
}

/**
 * Stores a connected Facebook Page and encrypts its access token
 */
export async function savePageConnection(params: SavePageConnectionParams): Promise<{
  connectedPageId: string;
  pageName: string;
  pageId: string;
}> {
  const { workspaceId, pageId, pageName, category, profilePic, accessToken, scopes, subscribedFields } = params;

  // 1. Encrypt token using AES-256-GCM
  const { encrypted, iv, authTag } = encryptToken(accessToken);

  const supabase = getServerSupabase();
  let connectedPageId = `conn-${pageId}-${Date.now()}`;

  if (supabase) {
    try {
      // Upsert into connected_pages
      const { data: pageRecord, error: pageErr } = await supabase
        .from('connected_pages')
        .upsert(
          {
            workspace_id: workspaceId,
            provider: 'meta',
            provider_page_id: pageId,
            page_name: pageName,
            page_category: category || 'E-commerce Shop',
            page_profile_picture_url: profilePic || null,
            connection_status: 'connected',
            scopes_granted: scopes || ['pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'pages_messaging'],
            subscribed_fields: subscribedFields || ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'],
            connected_at: new Date().toISOString(),
            last_synced_at: new Date().toISOString(),
            error_message: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'workspace_id,provider,provider_page_id' }
        )
        .select()
        .single();

      if (!pageErr && pageRecord) {
        connectedPageId = pageRecord.id;

        // Upsert encrypted token into private page_secure_tokens table
        await supabase
          .from('page_secure_tokens')
          .upsert(
            {
              workspace_id: workspaceId,
              connected_page_id: connectedPageId,
              token_encrypted: encrypted,
              token_iv: iv,
              token_auth_tag: authTag,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'connected_page_id' }
          );
      }
    } catch (err) {
      console.warn('[Meta DB] Could not write directly to Supabase tables, falling back to memory vault:', err);
    }
  }

  // Always keep in server-side memory cache for active webhook routing
  memorySecureTokens.set(pageId, {
    workspaceId,
    pageId,
    encrypted,
    iv,
    authTag,
    scopes: scopes || [],
    pageName,
  });

  return {
    connectedPageId,
    pageName,
    pageId,
  };
}

/**
 * Retrieves and decrypts the Page Access Token for a given Facebook Page ID
 */
export async function getDecryptedPageToken(pageId: string): Promise<string | null> {
  // Check memory vault first
  const cached = memorySecureTokens.get(pageId);
  if (cached) {
    try {
      return decryptToken(cached.encrypted, cached.iv, cached.authTag);
    } catch (err) {
      console.error('[Meta DB] Failed to decrypt cached page token:', err);
    }
  }

  // Check Supabase
  const supabase = getServerSupabase();
  if (!supabase) return null;

  try {
    const { data: pageRecord } = await supabase
      .from('connected_pages')
      .select('id, workspace_id')
      .eq('provider_page_id', pageId)
      .eq('connection_status', 'connected')
      .maybeSingle();

    if (!pageRecord) return null;

    const { data: tokenRecord } = await supabase
      .from('page_secure_tokens')
      .select('token_encrypted, token_iv, token_auth_tag')
      .eq('connected_page_id', pageRecord.id)
      .maybeSingle();

    if (!tokenRecord) return null;

    return decryptToken(tokenRecord.token_encrypted, tokenRecord.token_iv, tokenRecord.token_auth_tag);
  } catch (err) {
    console.error('[Meta DB] Error retrieving decrypted token from Supabase:', err);
    return null;
  }
}

/**
 * Disconnects a Facebook Page and removes secret tokens
 */
export async function disconnectPage(workspaceId: string, pageId: string): Promise<boolean> {
  memorySecureTokens.delete(pageId);

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data: pageRecord } = await supabase
        .from('connected_pages')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('provider_page_id', pageId)
        .maybeSingle();

      if (pageRecord) {
        // Delete encrypted token
        await supabase
          .from('page_secure_tokens')
          .delete()
          .eq('connected_page_id', pageRecord.id);

        // Update connection status
        await supabase
          .from('connected_pages')
          .update({
            connection_status: 'disconnected',
            updated_at: new Date().toISOString(),
          })
          .eq('id', pageRecord.id);
      }
    } catch (err) {
      console.warn('[Meta DB] Error updating disconnect status in Supabase:', err);
    }
  }

  return true;
}

/**
 * Finds workspace and connected page record for an inbound Facebook Page ID
 */
export async function findWorkspaceByPageId(pageId: string): Promise<{
  workspaceId: string;
  connectedPageId: string;
  pageName: string;
} | null> {
  const cached = memorySecureTokens.get(pageId);
  if (cached) {
    return {
      workspaceId: cached.workspaceId,
      connectedPageId: `conn-${pageId}`,
      pageName: cached.pageName,
    };
  }

  const supabase = getServerSupabase();
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from('connected_pages')
      .select('id, workspace_id, page_name')
      .eq('provider_page_id', pageId)
      .eq('connection_status', 'connected')
      .maybeSingle();

    if (data) {
      return {
        workspaceId: data.workspace_id,
        connectedPageId: data.id,
        pageName: data.page_name,
      };
    }
  } catch (err) {
    console.warn('[Meta DB] Error looking up page in Supabase:', err);
  }

  return null;
}

/**
 * Ingests an inbound Messenger message idempotently into conversations and messages tables
 */
export async function ingestInboundMessage(params: {
  workspaceId: string;
  connectedPageId: string;
  pageId: string;
  senderPSID: string;
  messageId: string;
  text: string;
  timestamp: number;
}): Promise<{ conversationId: string; isDuplicate: boolean }> {
  const { workspaceId, connectedPageId, pageId, senderPSID, messageId, text, timestamp } = params;
  const supabase = getServerSupabase();

  let conversationId = '';
  let customerDisplayName = `Facebook Customer (${senderPSID.slice(-4)})`;
  let customerProfilePic: string | undefined;

  // Try fetching customer name from Meta Graph API
  const token = await getDecryptedPageToken(pageId);
  if (token) {
    const profile = await metaClient.getCustomerProfile(senderPSID, token);
    if (profile.name) customerDisplayName = profile.name;
    if (profile.profilePic) customerProfilePic = profile.profilePic;
  }

  if (supabase) {
    try {
      // 1. Find or create conversation for this PSID
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id, customer_display_name')
        .eq('workspace_id', workspaceId)
        .eq('customer_external_id', senderPSID)
        .maybeSingle();

      if (existingConv) {
        conversationId = existingConv.id;
        // Update conversation last_message_at
        await supabase
          .from('conversations')
          .update({
            last_message_at: new Date(timestamp).toISOString(),
            status: 'open',
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversationId);
      } else {
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert({
            workspace_id: workspaceId,
            connected_page_id: connectedPageId,
            customer_display_name: customerDisplayName,
            customer_external_id: senderPSID,
            customer_profile_pic: customerProfilePic || null,
            status: 'open',
            human_takeover_enabled: false,
            last_message_at: new Date(timestamp).toISOString(),
          })
          .select()
          .single();

        if (newConv && !convErr) {
          conversationId = newConv.id;
        }
      }

      // 2. Check if message already ingested (idempotency check via external_message_id)
      if (conversationId) {
        const { data: existingMsg } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conversationId)
          .eq('external_message_id', messageId)
          .maybeSingle();

        if (existingMsg) {
          return { conversationId, isDuplicate: true };
        }

        // Insert message
        await supabase.from('messages').insert({
          workspace_id: workspaceId,
          conversation_id: conversationId,
          direction: 'inbound',
          sender_type: 'customer',
          content: text,
          message_type: 'text',
          external_message_id: messageId,
          delivery_status: 'delivered',
          created_at: new Date(timestamp).toISOString(),
        });

        // Log webhook delivery
        await supabase.from('webhook_delivery_logs').insert({
          workspace_id: workspaceId,
          page_id: pageId,
          event_type: 'messages',
          sender_psid: senderPSID,
          message_mid: messageId,
          status: 'processed',
        });

        return { conversationId, isDuplicate: false };
      }
    } catch (err: any) {
      console.warn('[Meta DB] Database error during message ingestion, logging audit event:', err.message);
    }
  }

  // Fallback fallback return
  return { conversationId: conversationId || `conv-local-${senderPSID}`, isDuplicate: false };
}

/**
 * Updates message delivery or read status
 */
export async function updateMessageDeliveryStatus(
  messageMid: string,
  status: 'delivered' | 'read'
): Promise<void> {
  const supabase = getServerSupabase();
  if (!supabase || !messageMid) return;

  try {
    await supabase
      .from('messages')
      .update({ delivery_status: status })
      .eq('external_message_id', messageMid);
  } catch (err) {
    console.warn('[Meta DB] Could not update message status:', err);
  }
}
