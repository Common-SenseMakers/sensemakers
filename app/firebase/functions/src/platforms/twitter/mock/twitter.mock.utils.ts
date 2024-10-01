import { AppTweet } from '../../../@shared/types/types.twitter';
import { UserDetailsBase } from '../../../@shared/types/types.user';

export const getSampleTweet = (
  id: string,
  authorId: string,
  createdAt: number,
  conversation_id: string,
  content: string
): AppTweet => {
  const date = new Date(createdAt);

  return {
    id: id,
    conversation_id,
    text: `This is an interesting paper https://arxiv.org/abs/2312.05230 ${id} | ${content}`,
    author_id: authorId,
    created_at: date.toISOString(),
    entities: {
      urls: [
        {
          start: 50,
          end: 73,
          url: 'https://t.co/gguJOKvN37',
          expanded_url: 'https://arxiv.org/abs/2312.05230',
          display_url: 'x.com/sense_nets_bot…',
          unwound_url: 'https://arxiv.org/abs/2312.05230',
        },
      ],
      annotations: [],
      hashtags: [],
      mentions: [],
      cashtags: [],
    },
  };
};

export const getTimelineMock = (userDetails: UserDetailsBase) => {
  return [
    {
      conversation_id: '500',
      tweets: [
        getSampleTweet('500', userDetails.user_id, Date.now() + 5, '500', ''),
      ],
      author: {
        id: userDetails.user_id,
        name: userDetails.profile.name,
        username: userDetails.profile.username,
      },
    },
    {
      conversation_id: '400',
      tweets: [
        getSampleTweet('400', userDetails.user_id, Date.now() + 4, '400', ''),
        getSampleTweet('401', userDetails.user_id, Date.now() + 4, '401', ''),
        getSampleTweet('402', userDetails.user_id, Date.now() + 4, '402', ''),
      ],
      author: {
        id: userDetails.user_id,
        name: userDetails.profile.name,
        username: userDetails.profile.username,
      },
    },
    {
      conversation_id: '300',
      tweets: [
        getSampleTweet('300', userDetails.user_id, Date.now() + 3, '300', ''),
        getSampleTweet('301', userDetails.user_id, Date.now() + 3, '301', ''),
      ],
      author: {
        id: userDetails.user_id,
        name: userDetails.profile.name,
        username: userDetails.profile.username,
      },
    },
    {
      conversation_id: '200',
      tweets: [
        getSampleTweet('200', userDetails.user_id, Date.now() + 2, '200', ''),
        getSampleTweet('201', userDetails.user_id, Date.now() + 2, '201', ''),
        getSampleTweet('202', userDetails.user_id, Date.now() + 2, '202', ''),
      ],
      author: {
        id: userDetails.user_id,
        name: userDetails.profile.name,
        username: userDetails.profile.username,
      },
    },
    {
      conversation_id: '100',
      tweets: [
        getSampleTweet('100', userDetails.user_id, Date.now() + 1, '100', ''),
        getSampleTweet('101', userDetails.user_id, Date.now() + 1, '101', ''),
        getSampleTweet('102', userDetails.user_id, Date.now() + 1, '102', ''),
      ],
      author: {
        id: userDetails.user_id,
        name: userDetails.profile.name,
        username: userDetails.profile.username,
      },
    },
  ];
};
