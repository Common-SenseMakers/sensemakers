import {
  getMockAutoPublishedPost,
  getMockPendingPost,
  getMockPublishedPost,
} from '../shared/mocks/posts.mock';
import { NotificationFreq } from '../shared/types/types.notifications';
import { EmailTemplate } from './EmailTemplate';

EmailTemplate.PreviewProps = {
  posts: [
    getMockPendingPost(),
    // getMockPendingPost(),
    // getMockPendingPost(),
    // getMockPendingPost(),
    // getMockPendingPost(),
    // getMockPendingPost(),
    getMockPublishedPost(),
    // getMockPublishedPost(),
    // getMockPublishedPost(),
    // getMockPublishedPost(),
    // getMockPublishedPost(),
    // getMockPublishedPost(),
    // getMockPublishedPost(),
    // getMockPublishedPost(),
    getMockAutoPublishedPost(),
    // getMockAutoPublishedPost(),
    // getMockAutoPublishedPost(),
    // getMockAutoPublishedPost(),
  ],
  notificationFrequency: NotificationFreq.Weekly,
  appUrl: 'https://sample.com/',
};

export default EmailTemplate;
