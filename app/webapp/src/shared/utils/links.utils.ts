import { AppPost } from '../types/types.posts';

export function normalizeUrl(url: string): string {
  const urlObj = new URL(url); // Add temporary protocol for parsing

  // Replace domain if it is twitter.com
  if (urlObj.hostname === 'twitter.com') {
    urlObj.hostname = 'x.com';
  }

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

export function handleQuotePostReference(reference: string, post: AppPost) {
  const quotedPostUrl = post.generic.thread[0].quotedThread?.thread[0].url;
  if (!quotedPostUrl) {
    return reference;
  }
  const normalizedQuotedPostUrl = normalizeUrl(quotedPostUrl);
  const lowercaseQuotedPostUrl = normalizedQuotedPostUrl.toLowerCase();
  if (reference === lowercaseQuotedPostUrl) {
    return normalizedQuotedPostUrl;
  }
  return reference;
}
