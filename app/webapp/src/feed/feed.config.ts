export interface FeedTabConfig {
  id: string;
  title: string;
  tooltip: string;
  labels: string[];
}

export const feedTabs: FeedTabConfig[] = [
  {
    id: 'all',
    title: 'All',
    tooltip: '',
    labels: [],
  },
  {
    id: 'research-announcements',
    title: 'Research Announcements',
    tooltip: '',
    labels: [
      'http://purl.org/spar/cito/linksTo',
      'http://purl.org/spar/cito/discusses',
    ],
  },
  {
    id: 'media-recommendations',
    title: 'Media Recommendations',
    tooltip: '',
    labels: [
      'https://sense-nets.xyz/asksQuestionAbout',
      'http://purl.org/spar/cito/includesQuotationFrom',
    ],
  },
];
