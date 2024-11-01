export const isValidMastodonDomain = (input: string): boolean => {
  const mastodonServerRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return mastodonServerRegex.test(input);
};
