export interface BlueskyURI {
  did: string;
  collection: string;
  rkey: string;
}

export function parseBlueskyURI(uri: string): BlueskyURI {
  try {
    // Validate the URI starts with the correct protocol
    if (!uri.startsWith('at://')) {
      throw new Error('Invalid URI: must start with "at://".');
    }

    // Split the URI into its components
    const parts = uri.split('/');

    // Ensure the URI has the expected number of parts
    if (parts.length !== 5) {
      throw new Error('Invalid URI: expected exactly 5 parts.');
    }

    // Extract the components
    const [, , did, collection, rkey] = parts;

    // Return the parsed URI
    return { did, collection, rkey };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
