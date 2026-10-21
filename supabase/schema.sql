-- ==============================================================================
-- BongoSell AI: Master Consolidated Supabase Schema & Security Setup (Phase 1, 2 & 3)
-- Run this in your Supabase Project's SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    business_name TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'bn' CHECK (preferred_language IN ('bn', 'banglish', 'en')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);

-- 3. Multi-Tenant Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'clothing' CHECK (category IN ('clothing', 'gadgets', 'cosmetics', 'jewelry', 'food', 'general')),
    business_category TEXT DEFAULT 'clothing',
    preferred_language TEXT DEFAULT 'bn' CHECK (preferred_language IN ('bn', 'banglish', 'en')),
    monthly_message_volume TEXT DEFAULT '1k_to_5k' CHECK (monthly_message_volume IN ('under_1k', '1k_to_5k', '5k_to_15k', 'over_15k')),
    plan_tier TEXT DEFAULT 'starter' CHECK (plan_tier IN ('starter', 'growth', 'business')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);

-- 4. Multi-Tenant Workspace Memberships Table (RBAC)
CREATE TABLE IF NOT EXISTS public.workspace_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_workspace_user UNIQUE (workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_workspace ON public.workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.workspace_memberships(user_id);

-- Workspace Members View alias for compatibility
CREATE OR REPLACE VIEW public.workspace_members AS
SELECT id, workspace_id, user_id, role, created_at
FROM public.workspace_memberships;

-- 5. Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.user_has_workspace_access(check_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.workspace_memberships
        WHERE workspace_id = check_workspace_id
        AND user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.user_has_workspace_role(check_workspace_id UUID, required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.workspace_memberships
        WHERE workspace_id = check_workspace_id
        AND user_id = auth.uid()
        AND role = ANY(required_roles)
    );
$$;

-- 6. Connected Facebook / Social Pages Table
CREATE TABLE IF NOT EXISTS public.connected_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'meta' CHECK (provider IN ('meta', 'instagram', 'whatsapp')),
    provider_page_id TEXT,
    page_name TEXT NOT NULL,
    page_category TEXT DEFAULT 'E-commerce Shop',
    page_profile_picture_url TEXT,
    connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('disconnected', 'pending', 'connected', 'error')),
    scopes_granted TEXT[] DEFAULT ARRAY['pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'pages_messaging'],
    subscribed_fields TEXT[] DEFAULT ARRAY['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'],
    connected_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_connected_pages_ws ON public.connected_pages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_connected_pages_provider_page_id ON public.connected_pages(provider_page_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_connected_pages_unique_page ON public.connected_pages(workspace_id, provider, provider_page_id) WHERE provider_page_id IS NOT NULL;

-- 6.1. Dedicated Secure Server-Side Token Storage (Phase 4)
-- Tokens encrypted with AES-256-GCM at rest. Strict RLS with zero public access policies.
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
ALTER TABLE public.page_secure_tokens ENABLE ROW LEVEL SECURITY;

-- 7. Product Catalog Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    minimum_price NUMERIC(12, 2) CHECK (minimum_price IS NULL OR minimum_price >= 0),
    discount_limit NUMERIC(12, 2) CHECK (discount_limit IS NULL OR discount_limit >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_minimum_price_floor CHECK (minimum_price IS NULL OR minimum_price <= price)
);
CREATE INDEX IF NOT EXISTS idx_products_ws ON public.products(workspace_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- 8. Customer Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    connected_page_id UUID REFERENCES public.connected_pages(id) ON DELETE SET NULL,
    external_conversation_id TEXT,
    customer_display_name TEXT NOT NULL,
    customer_external_id TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved')),
    assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    human_takeover_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_conversations_ws ON public.conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);

-- 9. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'ai', 'human')),
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'order_card', 'quick_reply')),
    external_message_id TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'delivered' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id, created_at ASC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_unique_external_mid 
ON public.messages(conversation_id, external_message_id) 
WHERE external_message_id IS NOT NULL;

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_area TEXT,
    status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN ('draft', 'pending_confirmation', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    payment_method TEXT DEFAULT 'Cash on Delivery (COD)',
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_workspace_order_number UNIQUE (workspace_id, order_number)
);
CREATE INDEX IF NOT EXISTS idx_orders_ws ON public.orders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 11. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 12. AI Agent Settings Table
CREATE TABLE IF NOT EXISTS public.ai_agent_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
    agent_name TEXT NOT NULL DEFAULT 'BongoSell AI',
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_language TEXT NOT NULL DEFAULT 'bn' CHECK (preferred_language IN ('bn', 'banglish', 'en')),
    tone TEXT NOT NULL DEFAULT 'polite_bn' CHECK (tone IN ('polite_bn', 'banglish', 'formal')),
    business_instructions TEXT,
    greeting_message TEXT DEFAULT 'আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি?',
    minimum_price_enforcement_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    human_handover_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Knowledge Documents Table
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'faq' CHECK (document_type IN ('faq', 'policy', 'size_guide', 'shipping', 'other')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_ws ON public.knowledge_documents(workspace_id);

-- 14. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
    plan_code TEXT NOT NULL DEFAULT 'starter' CHECK (plan_code IN ('starter', 'growth', 'business')),
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '14 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. Usage Events Table
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('message_processed', 'order_captured', 'product_qa', 'human_escalation')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    estimated_cost NUMERIC(10, 4) DEFAULT 0,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_usage_events_ws_date ON public.usage_events(workspace_id, created_at DESC);

-- 16. Webhook Delivery & Event Audit Logs (Phase 4)
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

-- ==============================================================================
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspaces Policies
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;
CREATE POLICY "Members can view their workspaces" ON public.workspaces FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.workspace_memberships WHERE workspace_memberships.workspace_id = workspaces.id AND workspace_memberships.user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners and admins can update their workspace" ON public.workspaces;
CREATE POLICY "Owners and admins can update their workspace" ON public.workspaces FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.workspace_memberships WHERE workspace_memberships.workspace_id = workspaces.id AND workspace_memberships.user_id = auth.uid() AND workspace_memberships.role IN ('owner', 'admin')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_memberships WHERE workspace_memberships.workspace_id = workspaces.id AND workspace_memberships.user_id = auth.uid() AND workspace_memberships.role IN ('owner', 'admin')));

DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;
CREATE POLICY "Authenticated users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Workspace Memberships Policies
DROP POLICY IF EXISTS "Members can view co-members in same workspace" ON public.workspace_memberships;
CREATE POLICY "Members can view co-members in same workspace" ON public.workspace_memberships FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.workspace_memberships AS my_membership WHERE my_membership.workspace_id = workspace_memberships.workspace_id AND my_membership.user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners and admins can manage memberships" ON public.workspace_memberships;
CREATE POLICY "Owners and admins can manage memberships" ON public.workspace_memberships FOR ALL
    USING (EXISTS (SELECT 1 FROM public.workspace_memberships AS my_membership WHERE my_membership.workspace_id = workspace_memberships.workspace_id AND my_membership.user_id = auth.uid() AND my_membership.role IN ('owner', 'admin')));

-- Products Policies
DROP POLICY IF EXISTS "Members can view products" ON public.products;
CREATE POLICY "Members can view products" ON public.products FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

-- Orders & Order Items Policies
DROP POLICY IF EXISTS "Members can view orders" ON public.orders;
CREATE POLICY "Members can view orders" ON public.orders FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can manage orders" ON public.orders;
CREATE POLICY "Members can manage orders" ON public.orders FOR ALL USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can view order items" ON public.order_items;
CREATE POLICY "Members can view order items" ON public.order_items FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can manage order items" ON public.order_items;
CREATE POLICY "Members can manage order items" ON public.order_items FOR ALL USING (public.user_has_workspace_access(workspace_id));

-- Conversations & Messages Policies
DROP POLICY IF EXISTS "Members can view conversations" ON public.conversations;
CREATE POLICY "Members can view conversations" ON public.conversations FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can manage conversations" ON public.conversations;
CREATE POLICY "Members can manage conversations" ON public.conversations FOR ALL USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can view messages" ON public.messages;
CREATE POLICY "Members can view messages" ON public.messages FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can insert messages" ON public.messages;
CREATE POLICY "Members can insert messages" ON public.messages FOR INSERT WITH CHECK (public.user_has_workspace_access(workspace_id));

-- AI Agent Settings & Knowledge Policies
DROP POLICY IF EXISTS "Members can view agent settings" ON public.ai_agent_settings;
CREATE POLICY "Members can view agent settings" ON public.ai_agent_settings FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can manage agent settings" ON public.ai_agent_settings;
CREATE POLICY "Admins can manage agent settings" ON public.ai_agent_settings FOR ALL USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Members can view knowledge docs" ON public.knowledge_documents;
CREATE POLICY "Members can view knowledge docs" ON public.knowledge_documents FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can manage knowledge docs" ON public.knowledge_documents;
CREATE POLICY "Admins can manage knowledge docs" ON public.knowledge_documents FOR ALL USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

-- Connected Pages & Subscriptions Policies
DROP POLICY IF EXISTS "Members can view connected pages" ON public.connected_pages;
CREATE POLICY "Members can view connected pages" ON public.connected_pages FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can manage connected pages" ON public.connected_pages;
CREATE POLICY "Admins can manage connected pages" ON public.connected_pages FOR ALL USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Members can view subscription" ON public.subscriptions;
CREATE POLICY "Members can view subscription" ON public.subscriptions FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can view usage events" ON public.usage_events;
CREATE POLICY "Members can view usage events" ON public.usage_events FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can view webhook logs" ON public.webhook_delivery_logs;
CREATE POLICY "Members can view webhook logs" ON public.webhook_delivery_logs FOR SELECT USING (workspace_id IS NULL OR public.user_has_workspace_access(workspace_id));

-- ==============================================================================
-- 18. AUTOMATIC PROVISIONING TRIGGER (Idempotent)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_workspace_id UUID;
    user_full_name TEXT;
    user_business_name TEXT;
    user_lang TEXT;
    ws_slug TEXT;
BEGIN
    user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    user_business_name := new.raw_user_meta_data->>'business_name';
    user_lang := COALESCE(new.raw_user_meta_data->>'preferred_language', 'bn');

    -- Insert Profile
    INSERT INTO public.profiles (id, full_name, business_name, preferred_language, onboarding_completed)
    VALUES (new.id, user_full_name, user_business_name, user_lang, FALSE)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        updated_at = timezone('utc'::text, now());

    -- Create Initial Business Workspace if not exists
    IF NOT EXISTS (SELECT 1 FROM public.workspaces WHERE owner_id = new.id OR owner_user_id = new.id) THEN
        ws_slug := LOWER(REGEXP_REPLACE(COALESCE(user_business_name, user_full_name), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(new.id::text, 1, 6);
        
        INSERT INTO public.workspaces (name, slug, owner_id, owner_user_id, business_category, preferred_language)
        VALUES (
            COALESCE(user_business_name, user_full_name || '''s Shop'),
            ws_slug,
            new.id,
            new.id,
            'clothing',
            user_lang
        )
        RETURNING id INTO new_workspace_id;

        -- Assign Ownership
        INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
        VALUES (new_workspace_id, new.id, 'owner')
        ON CONFLICT (workspace_id, user_id) DO NOTHING;

        -- Seed Default AI Agent Settings
        INSERT INTO public.ai_agent_settings (workspace_id, agent_name, enabled, preferred_language, tone)
        VALUES (new_workspace_id, 'BongoSell AI', TRUE, user_lang, 'polite_bn')
        ON CONFLICT (workspace_id) DO NOTHING;

        -- Seed 14-day Free Trial Subscription
        INSERT INTO public.subscriptions (workspace_id, plan_code, status, billing_cycle)
        VALUES (new_workspace_id, 'starter', 'trial', 'monthly')
        ON CONFLICT (workspace_id) DO NOTHING;
    END IF;

    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user trigger for user %: %', new.id, SQLERRM;
        RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
