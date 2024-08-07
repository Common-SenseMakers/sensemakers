import { getMockPendingPost, getMockPublishedPost } from '../mocks/posts.mock';
import { NotificationFreq } from '../shared/types/types.notifications';
import { AutopostOption } from '../shared/types/types.user';
import { EmailTemplate } from './EmailTemplate';

EmailTemplate.PreviewProps = {
  posts: [
    getMockPendingPost(),
    getMockPendingPost(),
    getMockPendingPost(),
    getMockPendingPost(),
    getMockPendingPost(),
    getMockPendingPost(),
    getMockPublishedPost(),
    getMockPublishedPost(),
    getMockPublishedPost(),
    getMockPublishedPost(),
    getMockPublishedPost(),
    getMockPublishedPost(),
    getMockPublishedPost(),
    getMockPublishedPost(),
  ],
  notificationFrequency: NotificationFreq.Daily,
  autopostOption: AutopostOption.MANUAL,
  appUrl: 'https://sample.com/',
};

export default EmailTemplate;
