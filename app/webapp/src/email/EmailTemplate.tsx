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

import { I18Keys } from '../i18n/i18n';
import { getPostStatuses } from '../post/posts.helper';
import { AbsoluteRoutes } from '../route.names';
import { NotificationFreq } from '../shared/types/types.notifications';
import {
  AppPostFull,
  AppPostReviewStatus,
  PostsQueryStatus,
} from '../shared/types/types.posts';
import { AutopostOption } from '../shared/types/types.user';
import { EmailRow } from './EmailRow';
import { PostCardEmail } from './PostCardEmail';
import { LOGO_URL, MAX_POSTS_IN_EMAIL } from './constants';
import { button, footerStyle, logoImg, main } from './email.styles';

interface EmailTemplateProps {
  posts: AppPostFull[];
  notificationFrequency: NotificationFreq;
  autopostOption: AutopostOption;
  appUrl: string;
}

export const EmailTemplate = ({
  posts,
  notificationFrequency,
  appUrl,
}: EmailTemplateProps) => {
  const pendingPosts = posts.filter(
    (post) => post.reviewedStatus === AppPostReviewStatus.PENDING
  );
  const publishedPosts = posts.filter(
    (post) => getPostStatuses(post).published
  );

  const emailSettingsLink = new URL(AbsoluteRoutes.Settings, appUrl).toString();
  const allPostsLink = new URL(AbsoluteRoutes.App, appUrl).toString();
  const reviewPostsLink = new URL(
    PostsQueryStatus.PENDING,
    allPostsLink
  ).toString();
  const ignoredPostsLink = new URL(
    PostsQueryStatus.IGNORED,
    allPostsLink
  ).toString();
  const publishedPostsLink = new URL(
    PostsQueryStatus.PUBLISHED,
    allPostsLink
  ).toString();
  const automationSettingsLink = new URL(
    AbsoluteRoutes.Settings,
    appUrl
  ).toString();

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

  const { previewHeader, footer } = (() => {
    if (pendingPosts.length > 0 && publishedPosts.length > 0) {
      return {
        previewHeader: `${t(I18Keys.recommendedNanopubEmailHeader, {
          count: pendingPosts.length,
          timeframe: t(headerTimeframeKey),
        })} & ${t(I18Keys.publishedNanopubEmailHeader, {
          count: publishedPosts.length,
          timeframe: t(headerTimeframeKey),
        })}`,
        footer: t(I18Keys.emailFooter, {
          timeframe: t(footerTimeframeKey),
          emailSettingsLink,
          ignoredPostsLink,
          publishedPostsLink,
        }),
      };
    } else if (pendingPosts.length === 0) {
      return {
        previewHeader: t(I18Keys.publishedNanopubEmailHeader, {
          count: publishedPosts.length,
          timeframe: t(headerTimeframeKey),
        }),
        footer: t(I18Keys.publishedNanopubEmailFooter, {
          automationSettingsLink,
          publishedPostsLink,
        }),
      };
    } else {
      return {
        previewHeader: t(I18Keys.recommendedNanopubEmailHeader, {
          count: pendingPosts.length,
          timeframe: t(headerTimeframeKey),
        }),
        footer: t(I18Keys.recommendedNanopubEmailFooter, {
          timeframe: t(footerTimeframeKey),
          emailSettingsLink,
          ignoredPostsLink,
        }),
      };
    }
  })();

  return (
    <Html>
      <Head />
      <Preview>{previewHeader}</Preview>
      <Body style={main}>
        <Container>
          <div style={{ margin: '30px 0px 0px' }}></div>
          <EmailRow>
            <Img src={LOGO_URL} style={logoImg} />
          </EmailRow>

          {publishedPosts.length > 0 && (
            <>
              <Row>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 26,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                  {t(I18Keys.publishedNanopubEmailHeader, {
                    count: publishedPosts.length,
                    timeframe: t(headerTimeframeKey),
                  })}
                </Heading>
              </Row>
              {publishedPosts.slice(0, MAX_POSTS_IN_EMAIL).map((post, idx) => {
                const postUrl = new URL(
                  AbsoluteRoutes.Post(post.id),
                  appUrl
                ).toString();
                return (
                  <Section key={idx} style={{ margin: '16px 0px 0px' }}>
                    <PostCardEmail post={post} />
                    <EmailRow>
                      <Button style={button} href={postUrl}>
                        {t(I18Keys.emailReviewPostButton)}
                      </Button>
                    </EmailRow>
                  </Section>
                );
              })}
              {publishedPosts.length > MAX_POSTS_IN_EMAIL && (
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
                        count: publishedPosts.length - MAX_POSTS_IN_EMAIL,
                      })}
                    </Text>
                  </EmailRow>
                  <EmailRow>
                    <Button style={button} href={publishedPostsLink}>
                      {t(I18Keys.emailSeeAllButton)}
                    </Button>
                  </EmailRow>
                </>
              )}
            </>
          )}
          {pendingPosts.length > 0 && (
            <>
              <Row>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 26,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                  {t(I18Keys.recommendedNanopubEmailHeader, {
                    count: pendingPosts.length,
                    timeframe: t(headerTimeframeKey),
                  })}
                </Heading>
              </Row>
              {pendingPosts.slice(0, MAX_POSTS_IN_EMAIL).map((post, idx) => {
                const postUrl = new URL(
                  AbsoluteRoutes.Post(post.id),
                  appUrl
                ).toString();
                return (
                  <Section key={idx} style={{ margin: '16px 0px 0px' }}>
                    <PostCardEmail post={post} />
                    <EmailRow>
                      <Button style={button} href={postUrl}>
                        {t(I18Keys.emailReviewPostButton)}
                      </Button>
                    </EmailRow>
                  </Section>
                );
              })}
              {pendingPosts.length > MAX_POSTS_IN_EMAIL && (
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
                        count: pendingPosts.length - MAX_POSTS_IN_EMAIL,
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
  posts: [] as AppPostFull[],
  notificationFrequency: NotificationFreq.Monthly,
  autopostOption: AutopostOption.AI,
  appUrl: 'https://sample.com/',
};
