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
  // {
  //   id: 'recommendations',
  //   title: 'Recommendations',
  //   tooltip: '',
  //   labels: [
  //     'https://sense-nets.xyz/recommends',
  //     'https://sense-nets.xyz/endorses',
  //     'https://sense-nets.xyz/mentionsListeningStatus',
  //     'https://sense-nets.xyz/mentionsWatchingStatus',
  //     'https://sense-nets.xyz/mentionsReadingStatus',
  //     'https://sense-nets.xyz/mentionsStatus',
  //     'http://purl.org/spar/cito/reviews',
  //     'https://sense-nets.xyz/indicatesInterest',
  //   ],
  // },
  // {
  //   id: 'new-research',
  //   title: 'New research',
  //   tooltip: '',
  //   labels: ['https://sense-nets.xyz/announcesResource'],
  // },
  // {
  //   id: 'opportunities',
  //   title: 'Opportunities',
  //   tooltip: '',
  //   labels: [
  //     'https://sense-nets.xyz/announcesEvent',
  //     'https://sense-nets.xyz/announcesJob',
  //     'https://sense-nets.xyz/mentionsCallForPapers',
  //     'https://sense-nets.xyz/mentionsFundingOpportunity',
  //   ],
  // },
];
