function cleanUrlParams(url: string): string {
  const unnecessaryParams = new Set([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'sessionid',
    'PHPSESSID',
    'ASPSESSIONID',
    'sid',
    'gclid',
    'fbclid',
    'ref',
    'referrer',
    'hmb_campaign',
    'hmb_source',
    'hmb_medium',
    'error',
    'debug',
    'cachebuster',
    'clickid',
    'ws_ab_test',
    'igshid',
  ]);

  // Parse the URL
  const urlObject = new URL(url);

  // Iterate over the search parameters and remove the unnecessary ones
  urlObject.searchParams.forEach((value, key) => {
    if (unnecessaryParams.has(key)) {
      urlObject.searchParams.delete(key);
    }
  });

  // Return the cleaned URL
  return urlObject.toString();
}

/** gets the plain text and creates HTML compatible with Prosemirror schema */
export const styleUrls = (text: string, color?: string) => {
  text = text.replace(new RegExp('\n', 'g'), '<br>');

  const urlRegex =
    /\bhttps?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

  text = text.replace(urlRegex, (url) => replaceUrlCallback(url, color));

  return text;
};

const replaceUrlCallback = (url: string, color?: string) => {
  let endsWithPeriod = false;
  let urlClean = url;
  try {
    if (url.endsWith('.')) {
      endsWithPeriod = true;
      url = url.slice(0, -1);
    }

    if (url.endsWith('</p>')) {
      url = url.slice(0, -4);
    }

    const urlObj = new URL(url);
    urlClean = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    if (urlObj.search) {
      urlClean += urlObj.search;
    }
  } catch (e) {
    console.error(`Error parsing URL: ${url}`, e);
  }

  const noParametersUrl = cleanUrlParams(urlClean);
  const truncatedUrl =
    noParametersUrl.length > 50
      ? noParametersUrl.slice(0, 50) + '...'
      : noParametersUrl;

  return `<a href="${url}" target="_blank" style="${color ? `color: ${color}` : ''}">${truncatedUrl}</a>${endsWithPeriod ? '.' : ''}`;
};
