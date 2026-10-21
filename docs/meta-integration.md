# Meta Messenger Platform Integration Guide for BongoSell AI

This document provides complete instructions for configuring Meta Developer App, Facebook Login/OAuth, Webhook subscriptions, and production security for BongoSell AI.

---

## 1. Overview of Architecture

BongoSell AI connects Bangladeshi Facebook commerce (F-Commerce) businesses with Meta's official Graph API and Messenger Platform.

Key architectural boundaries:
- **No Scraping / No Automation of Personal Accounts**: All interactions occur exclusively via official Meta Graph APIs and Page Access Tokens.
- **No Password Collection**: Users authorize access through official Meta OAuth (`dialog/oauth`). BongoSell AI never sees or stores Facebook passwords.
- **Encrypted Token Vault**: Page Access Tokens are stored encrypted at rest using **AES-256-GCM** with a secret server-side key (`META_TOKEN_ENCRYPTION_KEY`). Tokens are NEVER sent to the browser or client-side storage.
- **HMAC Webhook Verification**: All incoming webhooks are validated using HMAC-SHA256 signatures (`X-Hub-Signature-256`) against `META_APP_SECRET`.
- **Idempotent Ingestion**: Inbound message IDs (`mid`) are deduplicated with PostgreSQL constraints to handle Meta webhook retries safely.

---

## 2. Meta Developer App Setup Steps

### Step 2.1: Create a Meta App
1. Go to [Meta for Developers](https://developers.facebook.com/).
2. Click **My Apps** > **Create App**.
3. Select **Other** as the use case > Next.
4. Select App Type: **Business** > Next.
5. Provide App Name (e.g. `BongoSell AI Production`) and Contact Email.
6. Click **Create app**.

### Step 2.2: Add Products to Your App
Add the following products from the dashboard:
1. **Facebook Login for Business**
2. **Messenger**

---

## 3. Configuring Facebook Login for Business

1. In the left sidebar, navigate to **Facebook Login for Business** > **Settings**.
2. Set **Client OAuth Login**: `Yes`.
3. Set **Web OAuth Login**: `Yes`.
4. Add the **Valid OAuth Redirect URIs**:
   - For local development: `http://localhost:3000/dashboard/pages`
   - For production / Cloud Run: `https://<YOUR_APP_URL>/dashboard/pages`
5. Save changes.

### Required Permissions Requested During OAuth:
- `pages_show_list`: Allows BongoSell to display the merchant's Pages for selection.
- `pages_read_engagement`: Allows reading engagement metadata and Page status.
- `pages_manage_metadata`: Allows subscribing the Page to webhook apps.
- `pages_messaging`: Required to send and receive messages in Messenger on behalf of the Page.

---

## 4. Configuring Messenger Webhooks

1. Navigate to **Messenger** > **Instagram and Facebook Webhooks** (or **Webhooks**).
2. Click **Add Callback URL**:
   - **Callback URL**: `https://<YOUR_APP_URL>/api/meta/webhook`
   - **Verify Token**: Enter the exact string set in `META_WEBHOOK_VERIFY_TOKEN` (e.g. `bongosell_verify_token_2026`).
3. Click **Verify and Save**. Meta will send a `GET` request with `hub.challenge` which BongoSell AI verifies immediately.
4. Under **Page Subscriptions**, subscribe to the following fields:
   - `messages`: Inbound customer messages and attachments.
   - `messaging_postbacks`: Quick replies and CTA clicks.
   - `message_deliveries`: Delivery receipts (`delivered` status).
   - `message_reads`: Read watermarks.

---

## 5. Development Mode vs. Live Mode (App Review)

### Development Mode Restrictions:
- When a Meta App is in **Development Mode**, ONLY users listed in the app's **App Roles** (Administrators, Developers, Testers) can connect Pages or send/receive messages.
- If an outside user tries to connect or message the Page in Dev Mode, Meta returns Graph API Error Code 10 / 200 (`Permission Denied`).
- **For Testing**: Add your test Facebook accounts as **Testers** under **App Roles** in the Meta Developer Console.

### Transitioning to Live Mode:
1. Complete **Business Verification** in Meta Business Manager.
2. Submit for **App Review** for the `pages_messaging` permission with a screencast showing how messages are handled in BongoSell AI.
3. Once approved, switch the App toggle to **Live**.

---

## 6. 24-Hour Messaging Window Compliance

Meta enforces a strict **24-hour messaging window**:
- Sellers may reply freely to customer inquiries within 24 hours of the customer's last message.
- For messages sent outside 24 hours:
  - BongoSell AI tags transactional updates using supported Message Tags:
    - `POST_PURCHASE_UPDATE`: Order confirmation, shipping tracking, delivery updates.
    - `CONFIRMED_EVENT_UPDATE`: Appointment or scheduled pickup.
    - `ACCOUNT_UPDATE`: Customer profile changes.
  - Promotional / marketing messages outside the 24-hour window are strictly prohibited by Meta policy.

---

## 7. Environment Variables Reference

| Variable | Description | Location |
|---|---|---|
| `META_APP_ID` | Your Meta Developer App ID | Server-side |
| `META_APP_SECRET` | App Secret from Settings -> Basic | Server-side only (Secret) |
| `META_WEBHOOK_VERIFY_TOKEN` | Secret verify token matching Meta Console | Server-side |
| `META_TOKEN_ENCRYPTION_KEY` | 32-byte key for AES-256-GCM token encryption | Server-side only (Secret) |
| `META_GRAPH_API_VERSION` | Meta Graph API Version (e.g. `v21.0`) | Server-side |
