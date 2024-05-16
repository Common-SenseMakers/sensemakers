export const TABS_CONFIG: {
  label: string;
  labelsUris: string[] | undefined;
}[] = [
  {
    label: 'Feed',
    labelsUris: undefined,
  },
  {
    label: 'Recommends',
    labelsUris: [
      'https://sense-nets.xyz/recommends',
      'https://sense-nets.xyz/endorses',

      'https://sense-nets.xyz/mentionsListeningStatus',
      'https://sense-nets.xyz/mentionsWatchingStatus',
      'https://sense-nets.xyz/mentionsReadingStatus',
      'http://purl.org/spar/cito/reviews',
      'https://sense-nets.xyz/indicatesInterest',
    ],
  },
  {
    label: 'Announces',
    labelsUris: ['https://sense-nets.xyz/announcesResource'],
  },
  {
    label: 'Opportunities',
    labelsUris: [
      'https://sense-nets.xyz/announcesEvent',
      'https://sense-nets.xyz/announcesJob',
      'https://sense-nets.xyz/mentionsCallForPapers',
      'https://sense-nets.xyz/mentionsFundingOpportunity',
    ],
  },
];

// ignored:
// 'http://purl.org/spar/cito/disagreesWith',
// 'https://schema.org/Question',
// 'http://purl.org/spar/cito/discusses',
// 'http://purl.org/spar/cito/includesQuotationFrom',
// 'https://sense-nets.xyz/asksQuestionAbout',
// 'http://purl.org/spar/cito/agreesWith',
// 'https://schema.org/Observation',
// 'https://schema.org/Claim',
// 'http://purl.org/spar/cito/linksTo',
