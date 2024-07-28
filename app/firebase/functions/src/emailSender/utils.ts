function decodeUnicodeEscapes(str: string) {
  // Replace individual Unicode escapes
  str = str.replace(/\\u([0-9a-fA-F]{4})/g, function (match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  });

  // Convert high and low surrogate pairs into characters
  return str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (match) {
    var high = match.charCodeAt(0);
    var low = match.charCodeAt(1);
    return String.fromCodePoint(
      (high - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000
    );
  });
}

export const cleanHtml = (html: string): string => {
  return decodeUnicodeEscapes(html);
};
