import { getMockPublishedPost } from '../mocks/posts.mock';
import { NotificationFreq } from '../shared/types/types.notifications';
import { AutopostOption } from '../shared/types/types.user';
import { EmailTemplate } from './EmailTemplate';

EmailTemplate.PreviewProps = {
  posts: [
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
  autopostOption: AutopostOption.AI,
  appUrl: 'https://sample.com',
};

export default EmailTemplate;
