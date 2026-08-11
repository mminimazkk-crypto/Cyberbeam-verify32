import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export type NetlifyEvent = {
  queryStringParameters?: Record<string, string | undefined> | null;
};

export type NetlifyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const DISCORD_API = 'https://discord.com/api/v10';
const STATE_TTL_MS = 10 * 60 * 1000;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getConfig() {
  return {
    clientId: requiredEnv('CLIENT_ID'),
    clientSecret: requiredEnv('CLIENT_SECRET'),
    botToken: requiredEnv('BOT_TOKEN'),
    guildId: requiredEnv('GUILD_ID'),
    roleId: requiredEnv('ROLE_ID'),
    redirectUri: requiredEnv('REDIRECT_URI'),
  };
}

export function createState(clientSecret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      iat: Date.now(),
      nonce: randomBytes(18).toString('base64url'),
    }),
  ).toString('base64url');
  const signature = createHmac('sha256', clientSecret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function isValidState(state: string | undefined, clientSecret: string): boolean {
  if (!state) return false;
  const separator = state.lastIndexOf('.');
  if (separator < 1) return false;

  const payload = state.slice(0, separator);
  const signature = state.slice(separator + 1);
  const expected = createHmac('sha256', clientSecret)
    .update(payload)
    .digest('base64url');

  const providedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (
    providedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(providedBytes, expectedBytes)
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      iat?: number;
    };
    return (
      typeof decoded.iat === 'number' &&
      Date.now() - decoded.iat >= 0 &&
      Date.now() - decoded.iat <= STATE_TTL_MS
    );
  } catch {
    return false;
  }
}

export function redirectToGateway(redirectUri: string, status: 'success' | 'error') {
  const destination = new URL(redirectUri);
  destination.pathname = destination.pathname.replace(/\/\.netlify\/functions\/callback\/?$/, '/');
  destination.search = '';
  destination.searchParams.set('status', status);
  return {
    statusCode: 302,
    headers: {
      Location: destination.toString(),
      'Cache-Control': 'no-store',
    },
    body: '',
  } satisfies NetlifyResponse;
}

export async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
) {
  const response = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord token exchange failed with status ${response.status}`);
  }

  return (await response.json()) as { access_token?: string };
}

export async function getDiscordUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Discord user lookup failed with status ${response.status}`);
  }

  return (await response.json()) as { id?: string };
}

export async function joinGuild(
  botToken: string,
  guildId: string,
  userId: string,
  accessToken: string,
) {
  const response = await fetch(
    `${DISCORD_API}/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    },
  );

  if (!response.ok && response.status !== 204) {
    throw new Error(`Discord guild membership failed with status ${response.status}`);
  }
}

export async function assignRole(
  botToken: string,
  guildId: string,
  userId: string,
  roleId: string,
) {
  const response = await fetch(
    `${DISCORD_API}/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Discord role assignment failed with status ${response.status}`);
  }
}