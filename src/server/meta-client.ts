/**
 * Centralized Meta Graph API & Messenger Platform Client
 * Uses configurable Graph API version (default v21.0)
 */

export interface MetaPageItem {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  tasks?: string[];
  is_published?: boolean;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export interface MetaGraphError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export interface MetaSendResult {
  recipient_id: string;
  message_id: string;
}

export class MetaClient {
  private apiVersion: string;
  private appId: string;
  private appSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiVersion = process.env.META_GRAPH_API_VERSION || 'v21.0';
    this.appId = process.env.META_APP_ID || '';
    this.appSecret = process.env.META_APP_SECRET || '';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  public getApiVersion(): string {
    return this.apiVersion;
  }

  public isConfigured(): boolean {
    return Boolean(this.appId && this.appSecret);
  }

  public getAppId(): string {
    return this.appId;
  }

  /**
   * Generates official Meta Login Dialog URL for Facebook Pages connection
   */
  public getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.appId) {
      throw new Error('META_APP_ID is not configured in server environment');
    }

    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_metadata',
      'pages_messaging',
    ];

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      state: state,
      scope: scopes.join(','),
      response_type: 'code',
      auth_type: 'rerequest',
    });

    return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for user access token server-side
   */
  public async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    if (!this.appId || !this.appSecret) {
      throw new Error('Meta App ID and Secret must be configured to exchange OAuth code');
    }

    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: redirectUri,
      code: code,
    });

    const response = await fetch(`${this.baseUrl}/oauth/access_token?${params.toString()}`, {
      method: 'GET',
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      const err = (data.error as MetaGraphError) || { message: 'Token exchange failed' };
      throw new Error(`Meta OAuth Error (${err.code || response.status}): ${err.message}`);
    }

    return data.access_token;
  }

  /**
   * Fetches Facebook Pages managed by user that have granted messaging permissions
   */
  public async getUserPages(userAccessToken: string): Promise<MetaPageItem[]> {
    const fields = 'id,name,access_token,category,tasks,is_published,picture{url}';
    const response = await fetch(`${this.baseUrl}/me/accounts?fields=${fields}&access_token=${encodeURIComponent(userAccessToken)}`);

    const data = await response.json();
    if (!response.ok || data.error) {
      const err = (data.error as MetaGraphError) || { message: 'Failed to retrieve Facebook Pages' };
      throw new Error(`Meta Accounts Error (${err.code || response.status}): ${err.message}`);
    }

    return (data.data || []) as MetaPageItem[];
  }

  /**
   * Subscribes a Facebook Page to BongoSell Messenger Webhooks
   */
  public async subscribePageToWebhooks(
    pageId: string,
    pageAccessToken: string,
    fields: string[] = ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads']
  ): Promise<{ success: boolean; subscribed_fields: string[] }> {
    const params = new URLSearchParams({
      subscribed_fields: fields.join(','),
      access_token: pageAccessToken,
    });

    const response = await fetch(`${this.baseUrl}/${pageId}/subscribed_apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      const err = (data.error as MetaGraphError) || { message: 'Webhook subscription failed' };
      throw new Error(`Meta Subscription Error (${err.code || response.status}): ${err.message}`);
    }

    return {
      success: data.success === true,
      subscribed_fields: fields,
    };
  }

  /**
   * Unsubscribes a Facebook Page from Webhooks upon disconnection
   */
  public async unsubscribePageFromWebhooks(pageId: string, pageAccessToken: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${pageId}/subscribed_apps?access_token=${encodeURIComponent(pageAccessToken)}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return data.success === true;
  }

  /**
   * Inspects current subscribed apps and fields for a Page
   */
  public async getSubscribedFields(pageId: string, pageAccessToken: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/${pageId}/subscribed_apps?access_token=${encodeURIComponent(pageAccessToken)}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      return [];
    }

    const apps = data.data || [];
    if (apps.length > 0 && Array.isArray(apps[0].subscribed_fields)) {
      return apps[0].subscribed_fields;
    }
    return [];
  }

  /**
   * Retrieves customer profile information given their Page-Scoped ID (PSID)
   */
  public async getCustomerProfile(
    psid: string,
    pageAccessToken: string
  ): Promise<{ name: string; firstName?: string; lastName?: string; profilePic?: string }> {
    try {
      const fields = 'first_name,last_name,name,profile_pic';
      const response = await fetch(`${this.baseUrl}/${psid}?fields=${fields}&access_token=${encodeURIComponent(pageAccessToken)}`);
      const data = await response.json();

      if (response.ok && !data.error) {
        return {
          name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || `Customer (${psid.slice(-4)})`,
          firstName: data.first_name,
          lastName: data.last_name,
          profilePic: data.profile_pic,
        };
      }
    } catch {
      // Ignore network errors fetching profile, fallback safely
    }

    return {
      name: `Customer (${psid.slice(-4)})`,
    };
  }

  /**
   * Sends an outbound message to a customer via the Meta Messenger Send API
   */
  public async sendTextMessage(
    pageAccessToken: string,
    recipientPSID: string,
    text: string,
    tag?: string
  ): Promise<MetaSendResult> {
    const payload: Record<string, any> = {
      recipient: {
        id: recipientPSID,
      },
      messaging_type: tag ? 'MESSAGE_TAG' : 'RESPONSE',
      message: {
        text: text,
      },
    };

    if (tag) {
      payload.tag = tag;
    }

    const response = await fetch(`${this.baseUrl}/me/messages?access_token=${encodeURIComponent(pageAccessToken)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      const err = (data.error as MetaGraphError) || { message: 'Failed to send Messenger message' };
      const friendlyHelp = this.getFriendlyErrorHelp(err.code);
      throw new Error(`Meta Send Error [Code ${err.code}]: ${err.message}${friendlyHelp ? ` (${friendlyHelp})` : ''}`);
    }

    return {
      recipient_id: data.recipient_id,
      message_id: data.message_id,
    };
  }

  /**
   * Explains common Meta error codes with merchant guidance
   */
  public getFriendlyErrorHelp(code?: number): string | null {
    if (!code) return null;
    switch (code) {
      case 190:
        return 'The Facebook Page token has expired or the password was changed. Reconnecting the Page is required.';
      case 10:
      case 200:
        return 'Permission denied. If your Meta App is in Development Mode, the recipient PSID must be an App Developer, Tester, or Admin.';
      case 2018278:
        return 'Outside 24-hour messaging window. Responses after 24h require approved Meta Message Tags or Human Agent permission.';
      case 368:
        return 'Temporarily blocked by Meta for message frequency. Please wait a few minutes before retrying.';
      default:
        return null;
    }
  }
}

export const metaClient = new MetaClient();
