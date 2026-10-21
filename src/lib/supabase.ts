import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface DatabaseProfile {
  id: string;
  full_name: string;
  business_name: string | null;
  preferred_language: 'bn' | 'banglish' | 'en';
  onboarding_completed: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWorkspace {
  id: string;
  name: string;
  slug?: string;
  owner_id: string;
  owner_user_id?: string;
  category: 'clothing' | 'gadgets' | 'cosmetics' | 'jewelry' | 'food' | 'general';
  business_category?: string;
  preferred_language?: 'bn' | 'banglish' | 'en';
  monthly_message_volume: 'under_1k' | '1k_to_5k' | '5k_to_15k' | 'over_15k';
  plan_tier: 'starter' | 'growth' | 'business';
  created_at: string;
  updated_at: string;
}

export interface DatabaseWorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface DatabaseConnectedPage {
  id: string;
  workspace_id: string;
  provider: 'meta' | 'instagram' | 'whatsapp';
  provider_page_id: string | null;
  page_name: string;
  page_category?: string;
  page_profile_picture_url?: string | null;
  connection_status: 'disconnected' | 'pending' | 'connected' | 'error';
  scopes_granted?: string[];
  subscribed_fields?: string[];
  connected_at: string | null;
  last_synced_at?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWebhookDeliveryLog {
  id: string;
  workspace_id: string | null;
  page_id: string | null;
  event_type: string;
  sender_psid: string | null;
  message_mid: string | null;
  status: 'processed' | 'ignored' | 'duplicate' | 'error';
  error_message: string | null;
  raw_payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface DatabaseProduct {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string;
  price: number;
  minimum_price: number | null;
  discount_limit: number | null;
  stock_quantity: number;
  image_url: string | null;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface DatabaseConversation {
  id: string;
  workspace_id: string;
  connected_page_id: string | null;
  external_conversation_id: string | null;
  customer_display_name: string;
  customer_external_id: string | null;
  status: 'open' | 'pending' | 'resolved';
  assigned_to_user_id: string | null;
  human_takeover_enabled: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMessage {
  id: string;
  workspace_id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  sender_type: 'customer' | 'ai' | 'human';
  content: string;
  message_type: 'text' | 'image' | 'order_card' | 'quick_reply';
  external_message_id: string | null;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}

export interface DatabaseOrder {
  id: string;
  workspace_id: string;
  conversation_id: string | null;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_area: string | null;
  status: 'draft' | 'pending_confirmation' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'unpaid' | 'pending' | 'paid' | 'refunded';
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: DatabaseOrderItem[];
}

export interface DatabaseOrderItem {
  id: string;
  workspace_id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface DatabaseAIAgentSettings {
  id: string;
  workspace_id: string;
  agent_name: string;
  enabled: boolean;
  preferred_language: 'bn' | 'banglish' | 'en';
  tone: 'polite_bn' | 'banglish' | 'formal';
  business_instructions: string | null;
  greeting_message: string;
  minimum_price_enforcement_enabled: boolean;
  human_handover_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseKnowledgeDocument {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  document_type: 'faq' | 'policy' | 'size_guide' | 'shipping' | 'other';
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface DatabaseSubscription {
  id: string;
  workspace_id: string;
  plan_code: 'starter' | 'growth' | 'business';
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'annual';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUsageEvent {
  id: string;
  workspace_id: string;
  event_type: 'message_processed' | 'order_captured' | 'product_qa' | 'human_escalation';
  quantity: number;
  estimated_cost: number;
  idempotency_key: string | null;
  created_at: string;
}

// Read public credentials from Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if valid credentials have been configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('...')
);

/**
 * Official Supabase Client
 * When unconfigured in local preview, uses fallback instance without crashing.
 */
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);
