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

export function isPlatformPost(ref: string) {
  // make a url object then check if the hostname matches a known list
  const urlObj = new URL(ref);
  const host = urlObj.hostname;
  return KNOWN_PLATFORM_URLS.includes(host);
}

export const KNOWN_PLATFORM_URLS = [
  /** TWITTER/X */
  'twitter.com',
  'x.com',
  /** BLUESKY */
  'bsky.app',
  /** MASTODON */
  'mastodon.social',
  'mastodon.online',
  'fosstodon.org',
  'mstdn.social',
  'mastodon.art',
  'techhub.social',
  'mas.to',
  'mastodon.lol',
  'mastodon.green',
  'mastodon.world',
  'cosocial.ca',
];
