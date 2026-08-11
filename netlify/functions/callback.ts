import {
  assignRole,
  exchangeCode,
  getConfig,
  getDiscordUser,
  isValidState,
  joinGuild,
  redirectToGateway,
  type NetlifyEvent,
  type NetlifyResponse,
} from './_shared';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  let config: ReturnType<typeof getConfig> | undefined;

  try {
    config = getConfig();
    const params = event.queryStringParameters ?? {};
    const code = params.code;
    const state = params.state;

    if (!code || !isValidState(state, config.clientSecret)) {
      return redirectToGateway(config.redirectUri, 'error');
    }

    const token = await exchangeCode(
      code,
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );
    if (!token.access_token) {
      throw new Error('Discord did not return an access token');
    }

    const user = await getDiscordUser(token.access_token);
    if (!user.id) {
      throw new Error('Discord did not return a user id');
    }

    await joinGuild(config.botToken, config.guildId, user.id, token.access_token);
    await assignRole(config.botToken, config.guildId, user.id, config.roleId);
    return redirectToGateway(config.redirectUri, 'success');
  } catch {
    if (!config) {
      return {
        statusCode: 302,
        headers: {
          Location: '/?status=error',
          'Cache-Control': 'no-store',
        },
        body: '',
      };
    }
    return redirectToGateway(config.redirectUri, 'error');
  }
}