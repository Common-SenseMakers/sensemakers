function normalizeUrl(url: string): string {
  let normalizedUrl = url.toLowerCase(); // Convert to lowercase

  const urlObj = new URL(`http://${normalizedUrl}`); // Add temporary protocol for parsing

  // Normalize path
  urlObj.pathname = urlObj.pathname.replace(/\/$/, '');

  // Normalize query parameters
  const paramsToRemove = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'ga_source',
    'ga_medium',
    'ga_campaign',
    'fbclid',
    'gclid',
    'msclkid',
    '_ga',
    'ref',
    't',
  ];
  paramsToRemove.forEach((param) => {
    urlObj.searchParams.delete(param);
  });

  // Sort remaining query parameters
  const sortedParams = Array.from(urlObj.searchParams.entries()).sort();
  urlObj.search = new URLSearchParams(sortedParams).toString();

  return urlObj.toString();
}
