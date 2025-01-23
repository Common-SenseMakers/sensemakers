import { TabsInfo } from '../types/types.posts';
import { SCIENCE_TOPIC_URI } from './semantics.helper';

export interface FeedTabConfig {
  index: number;
  id: string;
  title: string;
  tooltip: string;
  /** "labels" is used in the backend for indexing the tabs,
   * it cannot be modified once the app was deployed */
  labels: string[];
  topic?: string;
}

export interface TabQuery {
  tab: number;
  topic?: string;
  clusterId?: string;
}

export const feedTabs: FeedTabConfig[] = [
  {
    index: 1,
    id: 'all',
    title: 'All',
    tooltip: '',
    labels: [],
    topic: SCIENCE_TOPIC_URI,
  },
  {
    index: 2,
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
    index: 3,
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
    index: 4,
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
    index: 5,
    id: 'discussions',
    title: 'Discussions',
    tooltip: '',
    labels: [
      'http://purl.org/spar/cito/disagreesWith',
      'http://purl.org/spar/cito/agreesWith',
      'http://purl.org/spar/cito/reviews',
      'https://sense-nets.xyz/asksQuestionAbout',
      'http://purl.org/spar/cito/discusses',
    ],
    topic: SCIENCE_TOPIC_URI,
  },
];

export const getPostTabs = (labels: string[]): TabsInfo => {
  const tabsInfo: TabsInfo = {
    isTab01: false,
    isTab02: false,
    isTab03: false,
    isTab04: false,
    isTab05: false,
    isTab06: false,
  };

  if (feedTabs.length > 6) {
    throw new Error('Maximum of 6 tabs allowed');
  }

  for (let ix = 0; ix < feedTabs.length; ix++) {
    const tab = feedTabs[ix];

    /**
     * - if the tab labels are empty, include all posts
     * - if there is a label that is in the tab config labels mark that isTab as true
     * */
    if (
      tab.labels.length === 0 ||
      labels.some((label) => tab.labels.includes(label))
    ) {
      tabsInfo[`isTab0${ix + 1}` as keyof TabsInfo] = true;
    }
  }

  return tabsInfo;
};
