import { anything, instance, spy, when } from 'ts-mockito';

import { AppUser } from '../@shared/types/types.user';
import { EmailPostDetails, EmailSenderService } from './email.sender.service';

export type EmailSenderMockConfig = 'real' | 'spy' | 'mock';

export const getEmailSenderMock = (
  emailSender: EmailSenderService,
  type: EmailSenderMockConfig
): { instance: EmailSenderService; mock?: EmailSenderService } => {
  if (type === 'real') {
    return { instance: emailSender };
  }

  const Mocked = spy(emailSender);

  /** spy will return the mock to track calls to the methods as part of tests */
  if (type === 'spy') {
    return {
      instance: instance(Mocked),
      mock: Mocked,
    };
  }

  /** mock will replace the sendDigest function */
  when(Mocked.sendUserDigest(anything(), anything())).thenCall(
    (user: AppUser, posts: EmailPostDetails[]) => {
      const template = `Your recent posts: ${JSON.stringify(posts)}`; // Email clients support templates that receive some parameters
      console.log(`Sending email to ${user.userId} with template: ${template}`);
    }
  );

  return {
    instance: instance(Mocked),
    mock: Mocked,
  };
};
