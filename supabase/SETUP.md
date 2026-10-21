# Supabase Database & Auth Setup Guide (Phase 1, 2 & 3)

This guide documents setting up Supabase Authentication and PostgreSQL multi-tenant database for **BongoSell AI**.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account.
2. Click **New Project** and choose an organization.
3. Fill in the project details:
   - **Name**: `bongosell-ai`
   - **Database Password**: Choose a strong, secure password.
   - **Region**: Choose a region closest to Bangladesh (e.g., `Singapore (ap-southeast-1)` or `Mumbai (ap-south-1)`).
4. Wait for the project database to finish provisioning (~1–2 minutes).

---

## 2. Run Database Migrations

1. Open your Supabase Project dashboard.
2. Navigate to the **SQL Editor** tab from the left sidebar.
3. Click **New Query**.
4. Copy and paste the entire contents of `supabase/schema.sql` (which includes all Phase 1, Phase 2, and Phase 3 tables, indexes, triggers, and Row Level Security policies).
5. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`).
6. Confirm the execution finishes with `Success. No rows returned`.

### What this sets up:
- **`public.profiles`**: Stores authenticated user profile details, language preference (`bn`, `banglish`, `en`), and `onboarding_completed` flag.
- **`public.workspaces`**: Multi-tenant customer business workspaces (slug, owner_user_id, business_category, preferred_language, plan_tier).
- **`public.workspace_memberships`**: Role-based access control (`owner`, `admin`, `member`).
- **`public.connected_pages`**: Facebook Pages connection registry with provider metadata and status (`disconnected`, `pending`, `connected`, `error`).
- **`public.products`**: Merchant product catalog with price, minimum floor price, discount limit, SKU, category, stock quantity, and status.
- **`public.conversations`**: Messenger chat threads with customer display names, status (`open`, `pending`, `resolved`), and one-click `human_takeover_enabled` flag.
- **`public.messages`**: Multi-directional conversation log (customer inbound, AI automated outbound, and human merchant responses).
- **`public.orders` & `public.order_items`**: Structured cash-on-delivery (COD) orders captured by AI in Messenger with customer phone, delivery address, inside/outside Dhaka charges, and line item snapshots.
- **`public.ai_agent_settings`**: Per-workspace AI behavior configuration (agent name, tone, greeting message, pricing rules, human handover triggers).
- **`public.knowledge_documents`**: Merchant FAQ, shipping policies, and size guides for AI question answering.
- **`public.subscriptions` & `public.usage_events`**: Subscription tier records and usage event auditing.
- **Row Level Security (RLS)**: Enforces tenant isolation so merchants can only access records belonging to workspaces they belong to.
- **Security Definer Trigger (`handle_new_user`)**: When a user registers through Supabase Auth, it automatically and idempotently provisions their user profile, business workspace, initial AI agent settings, 14-day trial subscription, and assigns ownership.

---

## 3. Configure Supabase Authentication Settings

In your Supabase dashboard:
1. Navigate to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your application domain:
   - For local development: `http://localhost:3000`
   - For Cloud Run preview: `<YOUR_APP_URL>` (e.g. `https://ais-dev-3obyrpwtlrnxkucgnbt4t6-739054531989.asia-northeast1.run.app`)
3. Add the following to **Redirect URLs**:
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/reset-password`
   - `<YOUR_APP_URL>/**`
   - `<YOUR_APP_URL>/auth/callback`
   - `<YOUR_APP_URL>/reset-password`
4. Navigate to **Authentication** -> **Providers** -> **Email**:
   - Ensure **Enable Email provider** is turned **ON**.
   - **Confirm email**: Recommended enabled in production. When testing, you can toggle "Confirm email" off if you want immediate login without verifying inbox.
5. Google Sign-In (Optional):
   - Only enable if Google Cloud OAuth Client ID & Secret have been provisioned in Supabase. Otherwise, keep it disabled.

---

## 4. Configure Application Environment Variables

In your project root, add your project credentials to `.env`:

```env
# Project URL from Supabase Project Settings -> API
VITE_SUPABASE_URL="https://your-project-id.supabase.co"

# Anon / Public Key from Supabase Project Settings -> API
# NEVER use the service_role secret key in frontend applications
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 5. Security & Isolation Verification

- **Anon Key Safety**: The frontend communicates strictly with `VITE_SUPABASE_ANON_KEY`.
- **Database Policies**: All `public` tables enforce Row Level Security (`user_has_workspace_access(workspace_id)` or `user_has_workspace_role(workspace_id, ARRAY['owner', 'admin'])`). Anonymous or unauthorized users cannot access merchant records.
- **Open Redirect Guard**: Frontend and backend callback routers validate redirect destinations against whitelist patterns.
