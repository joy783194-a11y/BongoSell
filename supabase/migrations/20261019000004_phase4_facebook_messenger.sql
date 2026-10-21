-- Migration: 20261019000004_phase4_facebook_messenger.sql
-- Description: Phase 4 Facebook Page & Meta Messenger Platform schema
-- Includes:
--   1. Secure token storage (page_secure_tokens) protected by strict RLS
--   2. Connected pages enhancements (page_category, picture, scopes, subscribed fields, sync timestamps)
--   3. Webhook delivery logging and auditing
--   4. Idempotent external message uniqueness constraints on messages
--   5. Fast lookup indexes for Meta Page ID and Page-Scoped ID (PSID)

-- 1. Enhance connected_pages table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'connected_pages' AND column_name = 'page_category') THEN
        ALTER TABLE public.connected_pages ADD COLUMN page_category TEXT DEFAULT 'E-commerce Shop';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'connected_pages' AND column_name = 'page_profile_picture_url') THEN
        ALTER TABLE public.connected_pages ADD COLUMN page_profile_picture_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'connected_pages' AND column_name = 'scopes_granted') THEN
        ALTER TABLE public.connected_pages ADD COLUMN scopes_granted TEXT[] DEFAULT ARRAY['pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'pages_messaging'];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'connected_pages' AND column_name = 'subscribed_fields') THEN
        ALTER TABLE public.connected_pages ADD COLUMN subscribed_fields TEXT[] DEFAULT ARRAY['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'connected_pages' AND column_name = 'last_synced_at') THEN
        ALTER TABLE public.connected_pages ADD COLUMN last_synced_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'connected_pages' AND column_name = 'error_message') THEN
        ALTER TABLE public.connected_pages ADD COLUMN error_message TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'connected_pages' AND column_name = 'metadata') THEN
        ALTER TABLE public.connected_pages ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Fast index for webhook ingestion by Facebook Page ID
CREATE INDEX IF NOT EXISTS idx_connected_pages_provider_page_id ON public.connected_pages(provider_page_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_connected_pages_unique_page ON public.connected_pages(workspace_id, provider, provider_page_id) WHERE provider_page_id IS NOT NULL;

-- 2. Dedicated Secure Server-Side Token Storage
-- Tokens are stored encrypted with AES-256-GCM.
-- RLS is enabled with NO public policies so client/browser anon sessions CANNOT read them.
CREATE TABLE IF NOT EXISTS public.page_secure_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    connected_page_id UUID NOT NULL REFERENCES public.connected_pages(id) ON DELETE CASCADE,
    token_encrypted TEXT NOT NULL,
    token_iv TEXT NOT NULL,
    token_auth_tag TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_page_token_entry UNIQUE (connected_page_id)
);

CREATE INDEX IF NOT EXISTS idx_page_secure_tokens_page ON public.page_secure_tokens(connected_page_id);
CREATE INDEX IF NOT EXISTS idx_page_secure_tokens_ws ON public.page_secure_tokens(workspace_id);

-- Strictly lock down RLS: zero policies for public/anon
ALTER TABLE public.page_secure_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Enhance conversations table with profile pic and external lookup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'customer_profile_pic') THEN
        ALTER TABLE public.conversations ADD COLUMN customer_profile_pic TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conversations_customer_lookup ON public.conversations(workspace_id, customer_external_id);
CREATE INDEX IF NOT EXISTS idx_conversations_page_lookup ON public.conversations(connected_page_id, customer_external_id);

-- 4. Idempotency Constraint on external_message_id in messages table
-- Meta webhooks can be retried; duplicate mid (message_id) must not create duplicate records
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_unique_external_mid 
ON public.messages(conversation_id, external_message_id) 
WHERE external_message_id IS NOT NULL;

-- 5. Webhook Delivery & Event Audit Logs
CREATE TABLE IF NOT EXISTS public.webhook_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    page_id TEXT,
    event_type TEXT NOT NULL,
    sender_psid TEXT,
    message_mid TEXT,
    status TEXT NOT NULL CHECK (status IN ('processed', 'ignored', 'duplicate', 'error')),
    error_message TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_page ON public.webhook_delivery_logs(page_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_ws ON public.webhook_delivery_logs(workspace_id, created_at DESC);

ALTER TABLE public.webhook_delivery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view webhook logs" ON public.webhook_delivery_logs;
CREATE POLICY "Members can view webhook logs" ON public.webhook_delivery_logs
    FOR SELECT USING (workspace_id IS NULL OR public.user_has_workspace_access(workspace_id));
