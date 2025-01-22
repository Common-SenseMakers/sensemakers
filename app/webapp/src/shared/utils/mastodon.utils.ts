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

    if (parts.length === 7) {
      const [, , server, , username, , postId] = parts;

      return { server, username, postId };
    }
    if (parts.length === 8) {
      const [, , server, , username, , postId] = parts;

      return { server, username, postId };
    }
    throw new Error('Invalid URI: unexpected number of components.');
  } catch (error) {
    console.error((error as { message: string }).message);
    throw new Error(
      `Error parsing mastodon uri ${uri}: ${(error as { message: string }).message}`
    );
  }
}

export const buildMastodonPostUri = (
  username: string,
  server: string,
  postId: string
) => {
  return `https://${server}/users/${username}/statuses/${postId}`;
};
