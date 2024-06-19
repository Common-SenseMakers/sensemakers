import {
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  GenericThread,
} from '../../src/@shared/types/types.posts';
import { PLATFORM } from '../../src/@shared/types/types.user';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';

export const getMockPost = (refPost: Partial<AppPostFull>) => {
  const authorId = refPost.authorId || 'test-author-id';
  const createdAtMs = refPost.createdAtMs || Date.now();

  const defaultThread: GenericThread['thread'] = [
    {
      content: 'test content',
    },
  ];

  const post: AppPostFull = {
    id: refPost.id || 'post-id',
    createdAtMs: createdAtMs,
    authorId: authorId,
    thread: refPost.thread || defaultThread,
    semantics: refPost.semantics || '',
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
          user_id: TWITTER_USER_ID_MOCKS,
          post: {
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
