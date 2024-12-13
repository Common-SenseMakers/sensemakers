export const getGlobalMastodonUsername = (username: string, server: string) =>
  `${username}@${server}`;

export const parseMastodonGlobalUsername = (globalUsername: string) => {
  const [username, server] = globalUsername.split('@');
  if (!username || !server) {
    throw new Error(
      `Invalid Mastodon unique username: ${globalUsername}. Expected format: username@server.`
    );
  }
  return {
    localUsername: username,
    server,
    accountURL: `https://${server}/@${username}`,
  };
};

export function parseMastodonAccountURI(uri: string) {
  try {
    if (!uri.startsWith('https://')) {
      throw new Error('Invalid URL: must start with "https://".');
    }

    const parts = uri.split('/');

    if (parts.length !== 4) {
      throw new Error('Invalid URL: expected exactly 4 parts.');
    }

    const [, , server, localUsername] = parts;

    return {
      server,
      localUsername: localUsername.split('@')[1],
      globalUsername: getGlobalMastodonUsername(
        localUsername.split('@')[1],
        server
      ),
    };
  } catch (error) {
    console.error((error as { message: string }).message);
    throw new Error(`Error parsing mastodon uri ${uri}`);
  }
}

export function parseMastodonPostURI(uri: string) {
  try {
    if (!uri.startsWith('https://')) {
      throw new Error('Invalid URI: must start with "https://".');
    }

    const parts = uri.split('/');

    if (parts.length !== 7) {
      throw new Error('Invalid URI: expected exactly 7 parts.');
    }

    const [, , server, , username, , postId] = parts;

    return { server, username, postId };
  } catch (error) {
    console.error((error as { message: string }).message);
    throw new Error(`Error parsing mastodon uri ${uri}`);
  }
}
