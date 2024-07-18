/** gets the plain text and creates HTML compatible with Prosemirror schema */
export const textToHtml = (text: string) => {
  const paragraphs = text.split('---');
  let html = paragraphs?.map((p, i) => `<p>${p}</p>`).join('');

  const urlRegex =
    /\bhttps?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

  html = html.replace(urlRegex, (url) => {
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

    return `<a href="${url}">${urlClean}</a>${endsWithPeriod ? '.' : ''}`;
  });

  return html;
};
