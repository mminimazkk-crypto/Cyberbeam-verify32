import {
  createState,
  getConfig,
  type NetlifyResponse,
} from './_shared';

export async function handler(): Promise<NetlifyResponse> {
  try {
    const { clientId, clientSecret, redirectUri } = getConfig();
    const state = createState(clientSecret);
    const authorizeUrl = new URL('https://discord.com/oauth2/authorize');
    authorizeUrl.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify guilds.join',
      state,
      prompt: 'consent',
    }).toString();

    return {
      statusCode: 302,
      headers: {
        Location: authorizeUrl.toString(),
        'Cache-Control': 'no-store',
      },
      body: '',
    };
  } catch {
    return {
      statusCode: 302,
      headers: {
        Location: '/?status=error',
        'Cache-Control': 'no-store',
      },
      body: '',
    };
  }
}