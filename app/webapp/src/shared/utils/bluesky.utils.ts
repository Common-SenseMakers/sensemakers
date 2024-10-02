export function extractRKeyFromURI(uri: string): string | null {
  try {
    // Validate the URI starts with the correct protocol
    if (!uri.startsWith('at://')) {
      throw new Error('Invalid URI: must start with "at://".');
    }

    // Split the URI into its components
    const parts = uri.split('/');

    // Ensure the URI has the expected number of parts
    if (parts.length < 4) {
      throw new Error('Invalid URI: expected at least 4 parts.');
    }

    // The last part is the rkey
    const rkey = parts[parts.length - 1];

    // Return the rkey
    return rkey;
  } catch (error: any) {
    console.error(error.message);
    return null;
  }
}
