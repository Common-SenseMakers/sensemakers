import { Message } from 'postmark';
import { anything, instance, spy, when } from 'ts-mockito';

import { EmailSenderService } from './email.sender.service';

export type EmailSenderMockConfig = 'real' | 'spy' | 'mock';

export const getEmailSenderMock = (
  emailSender: EmailSenderService,
  type: EmailSenderMockConfig
): { instance: EmailSenderService; mock?: EmailSenderService } => {
  if (type === 'real') {
    return { instance: emailSender };
  }

  type MockedType = Omit<EmailSenderService, 'callSendEmail'> & {
    callSendEmail: EmailSenderService['callSendEmail'];
  };

  const Mocked = spy(emailSender);

  /** spy will return the mock to track calls to the methods as part of tests */
  if (type === 'spy') {
    return {
      instance: instance(Mocked),
      mock: Mocked,
    };
  }

  /** mock will replace the sendDigest function */
  when((Mocked as unknown as MockedType).callSendEmail(anything())).thenCall(
    (message: Message) => {
      console.log(`Sending email message`, { message });
    }
  );

  return {
    instance: instance(Mocked),
    mock: Mocked,
  };
};
