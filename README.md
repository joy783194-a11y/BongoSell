# BongoSell AI – Phase 1 & 2: Bangladeshi F-Commerce AI Sales Platform

**BongoSell AI** is a subscription-based AI Messenger sales assistant platform purpose-built for Bangladeshi Facebook Page sellers, online boutique shops, cosmetics retailers, gadget stores, and social commerce entrepreneurs.

---

## 🚀 Phase 2 Deliverables Overview

Phase 2 builds upon the public website and design system from Phase 1, introducing **production-oriented authentication, user account management, multi-tenant workspace foundations, an interactive 6-step onboarding wizard, and a protected merchant dashboard suite**.

### 1. Authentication Pages & Flows
- **/signup**: Full registration with Full Name, Email, Password (with strength checks), Confirm Password, and acceptance of Terms & Privacy Policy.
- **/login**: Secure sign-in with email, password, "Remember me", forgot password navigation, and open-redirect protected return paths.
- **/forgot-password**: Triggers expiring, single-use password reset links sent to the merchant's email.
- **/reset-password**: Secure password reset flow updating credentials with real-time strength validation.
- **/verify-email**: Dedicated email confirmation status page with cooldown-protected resend button.
- **/auth/callback**: Handles PKCE, email verification tokens, and recovery tokens with automatic safe redirection.

### 2. Multi-Tenant Workspace & Database Foundation (PostgreSQL + Supabase)
- **Versioned SQL Migrations**:
  - `supabase/migrations/20261019000001_create_profiles_and_workspaces.sql`: Creates `public.profiles`, `public.workspaces`, and `public.workspace_memberships` tables.
  - `supabase/migrations/20261019000002_rls_and_triggers.sql`: Enables strict Row Level Security (RLS) policies and a security-definer trigger (`handle_new_user`) that automatically provisions user profiles, initial personal business workspaces, and assigns workspace ownership on registration.
  - `supabase/schema.sql`: Consolidated script for one-click setup in Supabase SQL Editor.
  - `supabase/SETUP.md`: Full documentation on Supabase dashboard setup, redirect URLs, and security.
- **Tenant Isolation**: Row Level Security policies enforce that merchants can only access workspaces where they hold active membership (`owner`, `admin`, `member`). Anonymous users cannot query customer or store records.

### 3. 6-Step Onboarding Wizard (`/onboarding`)
- **Step 1**: Welcome to BongoSell AI.
- **Step 2**: Business / Shop Name and primary product category selection.
- **Step 3**: Preferred conversation language: Bangla, Banglish, or English.
- **Step 4**: Estimated monthly Facebook Page inbox message volume.
- **Step 5**: Transparent explanation of upcoming Phase 4 Meta Graph API integration (Zero-Password Policy).
- **Step 6**: Review submitted details and finish onboarding.
- Saves progress safely to `public.workspaces` and sets `onboarding_completed = true` in `public.profiles`.

### 4. Protected Dashboard Suite (`/dashboard`)
All dashboard routes are guarded by `ProtectedRoute`. Unauthenticated visitors are safely redirected to login with return parameters. Users with incomplete onboarding are routed to `/onboarding`.
- **/dashboard**: Real-time sales automation overview with metric cards (AI Status, Conversations, Captured Orders, Latency), quick setup checklist, and honest Facebook Page connection status.
- **/dashboard/pages**: Honest empty state for Facebook Page connections with detailed Meta permissions roadmap (`pages_messaging`, `pages_manage_metadata`). No fake connected accounts.
- **/dashboard/inbox**: Live conversation stream monitor with status filters (*All*, *AI Active*, *Human Takeover*, *Order Ready*).
- **/dashboard/ai-agent**: AI agent rules, tone selection (Polite Bangla, Casual Banglish, Formal), seller price floor guardrails, inside/outside Dhaka courier rates, and auto-takeover triggers.
- **/dashboard/products**: Product catalog and SKU manager with modal for adding new items with variant and stock tracking.
- **/dashboard/orders**: Captured Cash-on-Delivery (COD) orders queue with 11-digit mobile verification, Thana/District address parsing, and dispatch status tags.
- **/dashboard/analytics**: 24-hour message volume distribution (highlighting the 10 PM - 2 AM Bangladeshi peak shopping rush) and conversion metrics.
- **/dashboard/billing**: Subscription plan status, conversation usage meter (with soft limit warnings), and invoice history.
- **/dashboard/settings**: Profile management (name, business name, language), email verification status badge, password change, workspace role indicator, and an explicit account deletion request workflow with confirmation.

---

## 🎨 Design System & Theme

- **Palette**: Deep dark navy canvas (`#0E131B`), slate structural panels (`#131B26`), hairline borders (`#233044`), electric blue-violet accents (`#6366F1`), and high-contrast typography (`#F8FAFC`).
- **Typography**: Dual font hierarchy pairing `Plus Jakarta Sans` for geometric headings with `Hind Siliguri` for crisp, natural Bengali script.
- **Discipline**: Follows the universal frontend design constitution (zero-pill metadata discipline, single-elevation depth, no decorative pulsing dots, no code-comment headers, and Top Bar Contract adherence).

---

## ⚙️ Environment Variables & Setup

Update your `.env` file with your Supabase credentials:

```env
# Supabase Authentication & PostgreSQL Database (Phase 2)
# Obtain these from your Supabase Project Settings -> API.
# Use the publishable/anon key only. NEVER expose the service_role key to the browser.
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Refer to `supabase/SETUP.md` for full step-by-step instructions.

---

## 🛠️ Tech Stack & Scripts

- **Framework**: React 19 + TypeScript + Vite
- **Auth & Database SDK**: `@supabase/supabase-js`
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Unit Testing**: Vitest

### Available Commands

```bash
# Start development server on port 3000
npm run dev

# Run unit test suite (Vitest)
npm run test

# Run TypeScript linter
npm run lint

# Build for production
npm run build
```

---

## 📋 Scope Boundaries (Phase 2 vs Later Phases)

### Completed in Phase 2:
- [x] Full authentication flows: Sign-up, login, logout, password reset, email verification, and auth callback.
- [x] Versioned SQL migrations for profiles, workspaces, and workspace memberships with RLS.
- [x] Security-definer trigger for automatic and idempotent user profile and workspace provisioning.
- [x] Multi-tenant tenant/workspace foundation with role-based access control (`owner`, `admin`, `member`).
- [x] Protected routes with open-redirect sanitization and onboarding state checks.
- [x] 6-step interactive onboarding wizard with input validation and persistent database save.
- [x] Complete merchant dashboard suite with honest empty states for Facebook Pages.
- [x] Merchant account settings (profile edit, language toggle, email verification badge, password update, deletion request modal).
- [x] Unit test suite covering auth validation, password strength, open redirect defense, and RBAC permissions.

### Intentionally Deferred to Phase 3 & 4:
- Real-time Meta Graph API webhooks and Facebook OAuth Login dialog (Phase 4).
- Automated payment gateway integration for bKash, Nagad, and local cards (Phase 3).
- Live Courier API integration hooks (Pathao, Steadfast, RedX) (Phase 3/4).
- Real-time LLM inference streaming via Gemini API (Phase 4).
