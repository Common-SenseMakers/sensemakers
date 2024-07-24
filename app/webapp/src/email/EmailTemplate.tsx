import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Markdown,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { t } from 'i18next';
import { CSSProperties, ReactNode } from 'react';

import { I18Keys } from '../i18n/i18n';
import { getMockPost } from '../mocks/posts.mock';
import { AbsoluteRoutes } from '../route.names';
import { NotificationFreq } from '../shared/types/types.notifications';
import { AppPostFull, PostsQueryStatus } from '../shared/types/types.posts';
import { AutopostOption } from '../shared/types/types.user';
import { PostCardEmail } from './PostCardEmail';

const MAX_POSTS_IN_EMAIL = 3;
const LOGO_URL =
  'https://development--sensemakers.netlify.app/icons/logo-192.png';

interface EmailTemplateProps {
  posts: AppPostFull[];
  notificationFrequency: NotificationFreq;
  autopostOption: AutopostOption;
  appUrl: string;
}

export const EmailTemplate = ({
  posts,
  notificationFrequency,
  autopostOption,
  appUrl,
}: EmailTemplateProps) => {
  const emailSettingsLink = `${appUrl}${AbsoluteRoutes.Settings}`;
  const allPostsLink = `${appUrl}${AbsoluteRoutes.App}`;
  const reviewPostsLink = `${allPostsLink}${PostsQueryStatus.PENDING}`;
  const ignoredPostsLink = `${allPostsLink}${PostsQueryStatus.IGNORED}`;
  const publishedPostsLink = `${allPostsLink}${PostsQueryStatus.PUBLISHED}`;
  const automationSettingsLink = `${appUrl}${AbsoluteRoutes.Settings}`;

  const headerTimeframeKey = (() => {
    switch (notificationFrequency) {
      case NotificationFreq.Daily:
        return I18Keys.emailHeaderDailyNotificationTimeframe;
      case NotificationFreq.Weekly:
        return I18Keys.emailHeaderWeeklyNotificationTimeframe;
      case NotificationFreq.Monthly:
        return I18Keys.emailHeaderMonthlyNotificationTimeframe;
      default:
        return I18Keys.emailHeaderDailyNotificationTimeframe;
    }
  })();

  const footerTimeframeKey = (() => {
    switch (notificationFrequency) {
      case NotificationFreq.Daily:
        return I18Keys.emailFooterDailyNotificationTimeframe;
      case NotificationFreq.Weekly:
        return I18Keys.emailFooterWeeklyNotificationTimeframe;
      case NotificationFreq.Monthly:
        return I18Keys.emailFooterMonthlyNotificationTimeframe;
      default:
        return I18Keys.emailFooterDailyNotificationTimeframe;
    }
  })();

  const { header, footer } = (() => {
    if (autopostOption === AutopostOption.MANUAL) {
      return {
        header: t(I18Keys.recommendedNanopubEmailHeader, {
          count: posts.length,
          timeframe: t(headerTimeframeKey),
        }),
        footer: t(I18Keys.recommendedNanopubEmailFooter, {
          timeframe: t(footerTimeframeKey),
          emailSettingsLink,
          ignoredPostsLink,
        }),
      };
    } else {
      return {
        header: t(I18Keys.publishedNanopubEmailHeader, {
          count: posts.length,
          timeframe: t(headerTimeframeKey),
        }),
        footer: t(I18Keys.publishedNanopubEmailFooter, {
          automationSettingsLink,
          publishedPostsLink,
        }),
      };
    }
  })();

  return (
    <Html>
      <Head />
      <Preview>{header}</Preview>
      <Body style={main}>
        <Container>
          <div style={{ margin: '30px 0px 0px' }}></div>
          <EmailRow>
            <Img src={LOGO_URL} style={logoImg} />
          </EmailRow>

          <Row>
            <Heading
              as="h2"
              style={{
                fontSize: 26,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              {header}
            </Heading>
          </Row>
          {posts.slice(0, MAX_POSTS_IN_EMAIL).map((post, idx) => {
            return (
              <Section key={idx} style={{ margin: '16px 0px 0px' }}>
                <PostCardEmail post={post} />
                <EmailRow>
                  <Button
                    style={button}
                    href={`${appUrl}${AbsoluteRoutes.Post(post.id)}`}>
                    {t(I18Keys.emailReviewPostButton)}
                  </Button>
                </EmailRow>
              </Section>
            );
          })}
          {posts.length > MAX_POSTS_IN_EMAIL && (
            <>
              <EmailRow style={{ marginTop: '0px' }}>
                <Text
                  style={{
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 18,
                  }}>
                  {t(I18Keys.emailMorePostsNote, {
                    count: posts.length - MAX_POSTS_IN_EMAIL,
                  })}
                </Text>
              </EmailRow>
              <EmailRow>
                <Button style={button} href={reviewPostsLink}>
                  {t(I18Keys.emailSeeAllButton)}
                </Button>
              </EmailRow>
            </>
          )}

          <Markdown markdownContainerStyles={footerStyle}>{footer}</Markdown>
          <Text style={footerStyle}>{t(I18Keys.copyright)}</Text>
          <Text
            style={{
              ...footerStyle,
              color: 'black',
              fontWeight: 'bold',
              marginTop: '2px',
            }}>
            sensenets
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

EmailTemplate.PreviewProps = {
  posts: [
    getMockPost(),
    getMockPost(),
    getMockPost(),
    getMockPost(),
    getMockPost(),
  ],
  notificationFrequency: NotificationFreq.Monthly,
  autopostOption: AutopostOption.AI,
  appUrl: 'https://sample.com',
};

export default EmailTemplate;

const footerStyle = {
  textAlign: 'center' as any,
  fontSize: 12,
  color: 'rgb(0,0,0, 0.7)',
};

const main = {
  backgroundColor: '#f3f4f6',
  fontFamily: '"Libre Franklin", sans-serif',
};

const logo = {
  padding: '30px 20px 0px',
  justifyContent: 'center',
  display: 'flex',
  alignItems: 'center',
};

const logoImg = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  backgroundColor: 'white',
  padding: '10px',
};

const button = {
  backgroundColor: 'black',
  borderRadius: 8,
  color: '#FFF',
  border: '1px solid rgb(0,0,0, 0.1)',
  cursor: 'pointer',
  padding: '12px 16px',
};

const EmailRow = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const defaultStyle: CSSProperties = {
    margin: '16px',
    textAlign: 'center',
  };

  const combinedStyle = { ...defaultStyle, ...style };

  return (
    <table
      role="presentation"
      width="100%"
      style={{ borderCollapse: 'collapse' }}>
      <tr>
        <td style={combinedStyle}>
          <table role="presentation" style={{ margin: '0 auto' }}>
            <tr>
              <td>{children}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
