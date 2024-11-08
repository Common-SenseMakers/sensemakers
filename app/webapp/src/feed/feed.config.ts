import { SCIENCE_TOPIC_URI } from '../shared/utils/semantics.helper';

export interface FeedTabConfig {
  id: string;
  title: string;
  tooltip: string;
  labels: string[];
  topic?: string;
}

export const feedTabs: FeedTabConfig[] = [
  {
    id: 'all',
    title: 'All',
    tooltip: '',
    labels: [],
  },
  {
    id: 'recommendations',
    title: 'Recommendations',
    tooltip: '',
    labels: [
      'https://sense-nets.xyz/recommends',
      'https://sense-nets.xyz/endorses',
      'https://sense-nets.xyz/mentionsListeningStatus',
      'https://sense-nets.xyz/mentionsWatchingStatus',
      'https://sense-nets.xyz/mentionsReadingStatus',
      'https://sense-nets.xyz/indicatesInterest',
      'http://purl.org/spar/cito/agreesWith',
    ],
    topic: SCIENCE_TOPIC_URI,
  },
  {
    id: 'new-research',
    title: 'New research',
    tooltip: '',
    labels: [
      'https://sense-nets.xyz/announcesResource',
      'https://sense-nets.xyz/summarizes',
    ],
    topic: SCIENCE_TOPIC_URI,
  },
  {
    id: 'opportunities',
    title: 'Opportunities',
    tooltip: '',
    labels: [
      'https://sense-nets.xyz/announcesEvent',
      'https://sense-nets.xyz/announcesJob',
      'https://sense-nets.xyz/mentionsCallForPapers',
      'https://sense-nets.xyz/mentionsFundingOpportunity',
    ],
    topic: SCIENCE_TOPIC_URI,
  },
  {
    id: 'discussions',
    title: 'Discussions',
    tooltip: '',
    labels: [
      'http://purl.org/spar/cito/disagreesWith',
      'http://purl.org/spar/cito/agreesWith',
      'http://purl.org/spar/cito/reviews',
      'https://sense-nets.xyz/asksQuestionAbout',
      'http://purl.org/spar/cito/includesQuotationFrom',
      'http://purl.org/spar/cito/discusses',
    ],
    topic: SCIENCE_TOPIC_URI,
  },
];
