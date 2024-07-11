import {
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../shared/types/types.platform.posts';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  GenericThread,
} from '../shared/types/types.posts';
import { PLATFORM } from '../shared/types/types.user';

export const getMockPost = () => {
  const authorId = 'test-author-id';
  const createdAtMs = Date.now();

  const defaultGeneric: GenericThread = {
    thread: [
      {
        content: 'test content',
      },
    ],
    author: {
      id: '123456',
      name: 'test author',
      platformId: PLATFORM.Twitter,
      username: 'test_author',
    },
  };

  const post: AppPostFull = {
    id: 'post-id',
    createdAtMs: createdAtMs,
    authorId: authorId,
    generic: defaultGeneric,
    semantics:
      '@prefix ns1: <https://sense-nets.xyz/> .@prefix schema: <https://schema.org/> .<http://purl.org/nanopub/temp/mynanopub#assertion> schema:keywords "LHCb",        "charmonium-production",        "coherent-production",        "particle-physics",        "quarkonia-production",        "ultra-peripheral-collisions" ;    ns1:announcesResource <https://arxiv.org/abs/2301.00222> .',
    origin: PLATFORM.Twitter,
    parsedStatus: AppPostParsedStatus.PROCESSED,
    parsingStatus: AppPostParsingStatus.IDLE,
    reviewedStatus: AppPostReviewStatus.PENDING,
    republishedStatus: AppPostRepublishedStatus.PENDING,
    mirrors: [
      {
        id: 'pp-id',
        platformId: PLATFORM.Twitter,
        publishOrigin: PlatformPostPublishOrigin.FETCHED,
        publishStatus: PlatformPostPublishStatus.PUBLISHED,
        posted: {
          post_id: '123456',
          timestampMs: createdAtMs,
          user_id: '123412341234',
          post: {
            conversation_id: '123456',
            tweets: [],
            id: 'post-id',
            createdAtMs: createdAtMs,
            authorId: authorId,
            content: 'test content',
            semantics: `
                    @prefix ns1: <http://purl.org/spar/cito/> .
                    @prefix schema: <https://schema.org/> .
                    
                    <http://purl.org/nanopub/temp/mynanopub#assertion> 
                      ns1:discusses <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
                      ns1:includesQuotationFrom <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
                      schema:keywords "ExternalSecurity",        "Geopolitics",        "Israel",        "Kissinger",        "PoliticalScience",        "Security" .
                    `,

            origin: PLATFORM.Twitter,
            parsedStatus: AppPostParsedStatus.PROCESSED,
            parsingStatus: AppPostParsingStatus.IDLE,
            reviewedStatus: AppPostReviewStatus.PENDING,
            republishedStatus: AppPostRepublishedStatus.PENDING,
          },
        },
      },
    ],
  };
  return post;
};
