import { describe, it, expect } from 'vitest';
import { MetaClient } from './meta-client';

describe('MetaClient & Messenger Platform Unit Tests', () => {
  it('correctly builds Meta OAuth dialog URL with required Messenger and Page scopes', () => {
    process.env.META_APP_ID = '987654321012345';
    process.env.META_APP_SECRET = 'secret12345';
    process.env.META_GRAPH_API_VERSION = 'v21.0';

    const client = new MetaClient();
    const state = 'state_test_token_123';
    const redirect = 'https://app.bongosell.ai/dashboard/pages';

    const url = client.getAuthorizationUrl(state, redirect);
    expect(url).toContain('https://www.facebook.com/v21.0/dialog/oauth');
    expect(url).toContain('client_id=987654321012345');
    expect(url).toContain('state=state_test_token_123');
    expect(url).toContain('pages_messaging');
    expect(url).toContain('pages_show_list');
    expect(url).toContain('pages_manage_metadata');
  });

  it('maps known Meta Graph API error codes to merchant guidance', () => {
    const client = new MetaClient();
    expect(client.getFriendlyErrorHelp(190)).toContain('expired');
    expect(client.getFriendlyErrorHelp(10)).toContain('Development Mode');
    expect(client.getFriendlyErrorHelp(2018278)).toContain('24-hour messaging window');
    expect(client.getFriendlyErrorHelp(368)).toContain('frequency');
    expect(client.getFriendlyErrorHelp(9999)).toBeNull();
  });
});
