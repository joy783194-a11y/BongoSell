-- Migration: 20261019000003_phase3_business_tables.sql
-- Description: Phase 3 multi-tenant SaaS schema for BongoSell AI
-- Includes: workspaces reconciliation, connected_pages, products, conversations, messages,
-- orders, order_items, ai_agent_settings, knowledge_documents, subscriptions, and usage_events with RLS.

-- 1. Reconcile Workspaces (add slug and owner_user_id alias if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'slug') THEN
        ALTER TABLE public.workspaces ADD COLUMN slug TEXT;
        UPDATE public.workspaces SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8) WHERE slug IS NULL;
        ALTER TABLE public.workspaces ALTER COLUMN slug SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'owner_user_id') THEN
        ALTER TABLE public.workspaces ADD COLUMN owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        UPDATE public.workspaces SET owner_user_id = owner_id WHERE owner_user_id IS NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'business_category') THEN
        ALTER TABLE public.workspaces ADD COLUMN business_category TEXT DEFAULT 'clothing';
        UPDATE public.workspaces SET business_category = category WHERE business_category IS NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'preferred_language') THEN
        ALTER TABLE public.workspaces ADD COLUMN preferred_language TEXT DEFAULT 'bn' CHECK (preferred_language IN ('bn', 'banglish', 'en'));
    END IF;
END $$;

-- 2. Create workspace_members view / alias for backward compatibility
CREATE OR REPLACE VIEW public.workspace_members AS
SELECT id, workspace_id, user_id, role, created_at
FROM public.workspace_memberships;

-- 3. Helper Function for Row-Level Security checks
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

-- 4. Connected Pages Table
CREATE TABLE IF NOT EXISTS public.connected_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'meta' CHECK (provider IN ('meta', 'instagram', 'whatsapp')),
    provider_page_id TEXT,
    page_name TEXT NOT NULL,
    connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('disconnected', 'pending', 'connected', 'error')),
    connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_connected_pages_ws ON public.connected_pages(workspace_id);

-- 5. Product Catalog Table
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

-- 6. Conversations Table
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

-- 7. Messages Table
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

-- 8. Orders Table
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

-- 9. Order Items Table
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

-- 10. AI Agent Settings Table (1 per workspace)
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

-- 11. Knowledge Documents Table
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

-- 12. Subscriptions Table
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

-- 13. Usage Events Table
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

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all Phase 3 tables
ALTER TABLE public.connected_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Connected Pages Policies
DROP POLICY IF EXISTS "Members can view connected pages" ON public.connected_pages;
CREATE POLICY "Members can view connected pages" ON public.connected_pages
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can manage connected pages" ON public.connected_pages;
CREATE POLICY "Admins can manage connected pages" ON public.connected_pages
    FOR ALL USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

-- Products Policies
DROP POLICY IF EXISTS "Members can view products" ON public.products;
CREATE POLICY "Members can view products" ON public.products
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT WITH CHECK (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']))
    WITH CHECK (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

-- Conversations Policies
DROP POLICY IF EXISTS "Members can view conversations" ON public.conversations;
CREATE POLICY "Members can view conversations" ON public.conversations
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can update conversations" ON public.conversations;
CREATE POLICY "Members can update conversations" ON public.conversations
    FOR UPDATE USING (public.user_has_workspace_access(workspace_id))
    WITH CHECK (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can insert conversations" ON public.conversations;
CREATE POLICY "Members can insert conversations" ON public.conversations
    FOR INSERT WITH CHECK (public.user_has_workspace_access(workspace_id));

-- Messages Policies
DROP POLICY IF EXISTS "Members can view messages" ON public.messages;
CREATE POLICY "Members can view messages" ON public.messages
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can insert messages" ON public.messages;
CREATE POLICY "Members can insert messages" ON public.messages
    FOR INSERT WITH CHECK (public.user_has_workspace_access(workspace_id));

-- Orders Policies
DROP POLICY IF EXISTS "Members can view orders" ON public.orders;
CREATE POLICY "Members can view orders" ON public.orders
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can insert orders" ON public.orders;
CREATE POLICY "Members can insert orders" ON public.orders
    FOR INSERT WITH CHECK (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can update orders" ON public.orders;
CREATE POLICY "Members can update orders" ON public.orders
    FOR UPDATE USING (public.user_has_workspace_access(workspace_id))
    WITH CHECK (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
    FOR DELETE USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

-- Order Items Policies
DROP POLICY IF EXISTS "Members can view order items" ON public.order_items;
CREATE POLICY "Members can view order items" ON public.order_items
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can insert order items" ON public.order_items;
CREATE POLICY "Members can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (public.user_has_workspace_access(workspace_id));

-- AI Agent Settings Policies
DROP POLICY IF EXISTS "Members can view agent settings" ON public.ai_agent_settings;
CREATE POLICY "Members can view agent settings" ON public.ai_agent_settings
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can update agent settings" ON public.ai_agent_settings;
CREATE POLICY "Admins can update agent settings" ON public.ai_agent_settings
    FOR UPDATE USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']))
    WITH CHECK (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Admins can insert agent settings" ON public.ai_agent_settings;
CREATE POLICY "Admins can insert agent settings" ON public.ai_agent_settings
    FOR INSERT WITH CHECK (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

-- Knowledge Documents Policies
DROP POLICY IF EXISTS "Members can view knowledge docs" ON public.knowledge_documents;
CREATE POLICY "Members can view knowledge docs" ON public.knowledge_documents
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Admins can manage knowledge docs" ON public.knowledge_documents;
CREATE POLICY "Admins can manage knowledge docs" ON public.knowledge_documents
    FOR ALL USING (public.user_has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

-- Subscriptions Policies
DROP POLICY IF EXISTS "Members can view subscription" ON public.subscriptions;
CREATE POLICY "Members can view subscription" ON public.subscriptions
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

-- Usage Events Policies
DROP POLICY IF EXISTS "Members can view usage events" ON public.usage_events;
CREATE POLICY "Members can view usage events" ON public.usage_events
    FOR SELECT USING (public.user_has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "Members can insert usage events" ON public.usage_events;
CREATE POLICY "Members can insert usage events" ON public.usage_events
    FOR INSERT WITH CHECK (public.user_has_workspace_access(workspace_id));
