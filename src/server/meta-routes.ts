import { Router, Request, Response } from 'express';
import { metaClient, MetaPageItem } from './meta-client.js';
import {
  generateOAuthState,
  validateOAuthState,
  verifyMetaWebhookSignature,
} from './crypto.js';
import {
  savePageConnection,
  getDecryptedPageToken,
  disconnectPage,
  findWorkspaceByPageId,
  ingestInboundMessage,
  updateMessageDeliveryStatus,
} from './meta-db.js';

export const metaRouter = Router();

// In-memory server-side temporary stash for user tokens during the OAuth connection step
// Keys expire after 10 minutes so tokens are never sent to the browser
const pendingTokenSessions = new Map<string, {
  userAccessToken: string;
  pages: MetaPageItem[];
  workspaceId: string;
  createdAt: number;
}>();

// Clean up expired pending sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pendingTokenSessions.entries()) {
    if (now - value.createdAt > 10 * 60 * 1000) {
      pendingTokenSessions.delete(key);
    }
  }
}, 60 * 1000);

/**
 * 1. GET /api/meta/status
 * Returns current Meta integration configuration status without leaking credentials
 */
metaRouter.get('/status', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const appUrl = process.env.APP_URL || `${protocol}://${host}`;

  res.json({
    configured: metaClient.isConfigured(),
    appIdConfigured: Boolean(process.env.META_APP_ID),
    appSecretConfigured: Boolean(process.env.META_APP_SECRET),
    webhookTokenConfigured: Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN),
    encryptionKeyConfigured: Boolean(process.env.META_TOKEN_ENCRYPTION_KEY || process.env.META_APP_SECRET),
    graphApiVersion: metaClient.getApiVersion(),
    appId: metaClient.getAppId() ? `${metaClient.getAppId().slice(0, 4)}...${metaClient.getAppId().slice(-3)}` : null,
    webhookCallbackUrl: `${appUrl}/api/meta/webhook`,
    oauthRedirectUri: `${appUrl}/dashboard/pages`,
  });
});

/**
 * 2. GET /api/meta/oauth/start
 * Generates official Meta Login authorization URL with CSRF protection
 */
metaRouter.get('/oauth/start', (req: Request, res: Response) => {
  try {
    const workspaceId = (req.query.workspaceId as string) || 'default-ws';
    const userId = (req.query.userId as string) || 'merchant-user';
    const redirectUri = (req.query.redirectUri as string) || `${req.protocol}://${req.get('host')}/dashboard/pages`;

    const state = generateOAuthState(workspaceId, userId);

    if (!metaClient.isConfigured()) {
      return res.status(400).json({
        error: 'META_APP_ID and META_APP_SECRET are not configured on the server. Please configure your Meta App credentials in the environment or use Sandbox Test Mode.',
        state,
      });
    }

    const authUrl = metaClient.getAuthorizationUrl(state, redirectUri);
    res.json({
      url: authUrl,
      state,
      redirectUri,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to initialize OAuth' });
  }
});

/**
 * 3. POST /api/meta/oauth/callback
 * Exchanges code for token server-side and lists eligible Pages
 */
metaRouter.post('/oauth/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, redirectUri } = req.body;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    // Validate CSRF state
    const stateValidation = validateOAuthState(state);
    if (!stateValidation.valid) {
      return res.status(400).json({ error: stateValidation.error || 'Invalid or expired state' });
    }

    const effectiveRedirect = redirectUri || `${req.protocol}://${req.get('host')}/dashboard/pages`;

    // Exchange code for user access token
    const userAccessToken = await metaClient.exchangeCodeForToken(code, effectiveRedirect);

    // Fetch Facebook Pages
    const pages = await metaClient.getUserPages(userAccessToken);

    // Save tokens in temporary server session (never return access_token to frontend!)
    const sessionKey = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    pendingTokenSessions.set(sessionKey, {
      userAccessToken,
      pages,
      workspaceId: stateValidation.workspaceId || '',
      createdAt: Date.now(),
    });

    // Return sanitized page list without access tokens
    const sanitizedPages = pages.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category || 'Business Page',
      pictureUrl: p.picture?.data?.url || null,
      isPublished: p.is_published ?? true,
      hasMessagingTask: Array.isArray(p.tasks) ? p.tasks.includes('MESSAGING') : true,
    }));

    res.json({
      sessionKey,
      pages: sanitizedPages,
      workspaceId: stateValidation.workspaceId,
    });
  } catch (err: any) {
    console.error('[Meta OAuth Callback Error]', err);
    res.status(500).json({ error: err.message || 'Failed to exchange authorization code' });
  }
});

/**
 * 4. POST /api/meta/pages/connect
 * Selects a page to connect, subscribes to webhooks, encrypts and stores access token
 */
metaRouter.post('/pages/connect', async (req: Request, res: Response) => {
  try {
    const { workspaceId, pageId, sessionKey, sandboxMode, manualPageName } = req.body;

    if (!workspaceId || !pageId) {
      return res.status(400).json({ error: 'workspaceId and pageId are required' });
    }

    let pageAccessToken = '';
    let pageName = manualPageName || 'Facebook Shop Page';
    let category = 'E-commerce Shop';
    let profilePic: string | undefined;

    // Check if connecting via actual OAuth session
    if (sessionKey) {
      const session = pendingTokenSessions.get(sessionKey);
      if (!session) {
        return res.status(400).json({ error: 'Connection session expired. Please restart the Connect Facebook Page flow.' });
      }

      const selectedPage = session.pages.find((p) => p.id === pageId);
      if (!selectedPage || !selectedPage.access_token) {
        return res.status(404).json({ error: 'Selected Facebook Page not found in authorized permissions' });
      }

      pageAccessToken = selectedPage.access_token;
      pageName = selectedPage.name;
      category = selectedPage.category || category;
      profilePic = selectedPage.picture?.data?.url;
    } else if (sandboxMode) {
      // Sandbox / Test Mode connection when developer credentials are being prepared
      pageAccessToken = `sandbox_token_${pageId}_${Date.now()}`;
      pageName = manualPageName || `Dhaka Style Shop (${pageId.slice(-4)})`;
    } else {
      return res.status(400).json({ error: 'Missing OAuth session key or sandboxMode flag' });
    }

    // 1. Subscribe Page to official Meta Messenger Webhooks
    let subscribedFields = ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'];
    if (!sandboxMode) {
      try {
        const subResult = await metaClient.subscribePageToWebhooks(pageId, pageAccessToken, subscribedFields);
        subscribedFields = subResult.subscribed_fields;
      } catch (subErr: any) {
        console.warn(`[Meta Webhook Sub Warning for Page ${pageId}]:`, subErr.message);
        // Continue saving connection with error note if Meta App Review is pending in Dev Mode
      }
    }

    // 2. Encrypt token with AES-256-GCM and save to database
    const connection = await savePageConnection({
      workspaceId,
      pageId,
      pageName,
      category,
      profilePic,
      accessToken: pageAccessToken,
      scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'pages_messaging'],
      subscribedFields,
    });

    res.json({
      success: true,
      page: {
        id: connection.connectedPageId,
        provider_page_id: pageId,
        page_name: pageName,
        category,
        profilePic,
        connection_status: 'connected',
        subscribed_fields: subscribedFields,
        connected_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Meta Connect Page Error]', err);
    res.status(500).json({ error: err.message || 'Failed to connect Facebook Page' });
  }
});

/**
 * 5. POST /api/meta/pages/disconnect
 * Unsubscribes from webhooks and clears encrypted tokens
 */
metaRouter.post('/pages/disconnect', async (req: Request, res: Response) => {
  try {
    const { workspaceId, pageId } = req.body;

    if (!workspaceId || !pageId) {
      return res.status(400).json({ error: 'workspaceId and pageId are required' });
    }

    // Unsubscribe from Meta Graph API if token is present
    const token = await getDecryptedPageToken(pageId);
    if (token && !token.startsWith('sandbox_token_')) {
      try {
        await metaClient.unsubscribePageFromWebhooks(pageId, token);
      } catch (err: any) {
        console.warn('[Meta Unsubscribe Warning]:', err.message);
      }
    }

    // Clear secrets and mark disconnected in database
    await disconnectPage(workspaceId, pageId);

    res.json({ success: true, message: 'Page disconnected successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to disconnect Page' });
  }
});

/**
 * 6. GET /api/meta/webhook
 * Official Meta Messenger Webhook verification endpoint (hub.mode, hub.verify_token, hub.challenge)
 */
metaRouter.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'bongosell_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Meta Webhook Verified Successfully]');
    return res.status(200).send(challenge);
  }

  console.warn('[Meta Webhook Verification Failed]: Mismatched verify token or mode', { mode, tokenReceived: token });
  return res.status(403).send('Forbidden: Invalid verification token');
});

/**
 * 7. POST /api/meta/webhook
 * Official Meta Messenger Webhook event ingestion endpoint
 * Validates X-Hub-Signature-256 with META_APP_SECRET
 */
metaRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const rawBuffer = (req as any).rawBody as Buffer;

    // Verify signature if META_APP_SECRET is set
    if (process.env.META_APP_SECRET && rawBuffer) {
      const isValid = verifyMetaWebhookSignature(rawBuffer, signature, process.env.META_APP_SECRET);
      if (!isValid) {
        console.error('[Meta Webhook] Invalid signature from incoming request');
        return res.status(401).send('Unauthorized: Invalid Webhook Signature');
      }
    }

    const body = req.body;

    // Confirm this is an event from a Facebook Page subscription
    if (body.object === 'page') {
      const entries = body.entry || [];

      for (const entry of entries) {
        const pageId = entry.id;
        const messagingList = entry.messaging || [];

        // Lookup workspace associated with this page
        const wsMatch = await findWorkspaceByPageId(pageId);
        const workspaceId = wsMatch?.workspaceId || 'default-ws';
        const connectedPageId = wsMatch?.connectedPageId || `conn-${pageId}`;

        for (const event of messagingList) {
          const senderPSID = event.sender?.id;
          const recipientId = event.recipient?.id;
          const timestamp = event.timestamp || Date.now();

          // 1. Inbound Customer Message
          if (event.message && !event.message.is_echo) {
            const messageId = event.message.mid;
            const text = event.message.text || (event.message.attachments ? '[Customer sent an attachment]' : '');

            if (senderPSID && text) {
              await ingestInboundMessage({
                workspaceId,
                connectedPageId,
                pageId,
                senderPSID,
                messageId,
                text,
                timestamp,
              });
            }
          }

          // 2. Delivery Receipts
          if (event.delivery && Array.isArray(event.delivery.mids)) {
            for (const mid of event.delivery.mids) {
              await updateMessageDeliveryStatus(mid, 'delivered');
            }
          }

          // 3. Read Receipts
          if (event.read && event.read.watermark) {
            // Updated watermark
          }
        }
      }

      // Meta requires a 200 OK fast response (within 20 seconds)
      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.sendStatus(404);
  } catch (err: any) {
    console.error('[Meta Webhook Processing Error]:', err);
    // Still send 200 to prevent Meta from spamming retries
    return res.status(200).send('EVENT_RECEIVED');
  }
});

/**
 * 8. POST /api/meta/messages/send
 * Outbound manual reply from merchant dashboard via Meta Send API
 */
metaRouter.post('/messages/send', async (req: Request, res: Response) => {
  try {
    const { workspaceId, pageId, recipientPSID, text, conversationId, messageTag } = req.body;

    if (!workspaceId || !pageId || !recipientPSID || !text) {
      return res.status(400).json({ error: 'workspaceId, pageId, recipientPSID, and text are required' });
    }

    const token = await getDecryptedPageToken(pageId);

    let externalMessageId = `mid.mock.${Date.now()}`;
    let isLiveSent = false;

    if (token && !token.startsWith('sandbox_token_')) {
      // Send real message via Graph Send API
      const sendResult = await metaClient.sendTextMessage(token, recipientPSID, text, messageTag);
      externalMessageId = sendResult.message_id;
      isLiveSent = true;
    }

    res.json({
      success: true,
      messageId: externalMessageId,
      isLiveSent,
      deliveryStatus: 'sent',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Meta Send API Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to send outbound message via Meta Send API' });
  }
});

/**
 * 9. POST /api/meta/test-webhook
 * Simulates an inbound customer message for testing and development
 */
metaRouter.post('/test-webhook', async (req: Request, res: Response) => {
  try {
    const { workspaceId, pageId, customerName, text, psid } = req.body;

    const targetPageId = pageId || '102938475610293';
    const targetPSID = psid || `psid_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const targetText = text || 'আসসালামু আলাইকুম, প্রিমিয়াম ব্ল্যাক পাঞ্জাবির প্রাইস কত? আর ডেলিভারি কতদিন লাগবে?';
    const messageId = `mid.sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const result = await ingestInboundMessage({
      workspaceId: workspaceId || 'default-ws',
      connectedPageId: `conn-${targetPageId}`,
      pageId: targetPageId,
      senderPSID: targetPSID,
      messageId,
      text: targetText,
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      simulated: true,
      conversationId: result.conversationId,
      messageId,
      senderPSID: targetPSID,
      text: targetText,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to simulate test webhook' });
  }
});
