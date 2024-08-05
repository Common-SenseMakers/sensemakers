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
import { AbsoluteRoutes } from '../route.names';
import { NotificationFreq } from '../shared/types/types.notifications';
import { AppPostFull, PostsQueryStatus } from '../shared/types/types.posts';
import { splitPostsByStatus } from '../utils/post.utils';
import { EmailRow } from './EmailRow';
import { PostCardEmail } from './PostCardEmail';
import { LOGO_URL, MAX_POSTS_IN_EMAIL } from './constants';
import {
  button,
  footerStyle,
  logoImg,
  main,
  summaryStyle,
} from './email.styles';

interface EmailTemplateProps {
  posts: AppPostFull[];
  notificationFrequency: NotificationFreq;
  appUrl: string;
}

export const EmailTemplate = ({
  posts,
  notificationFrequency,
  appUrl,
}: EmailTemplateProps) => {
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

  const headerTimeframeKey = (() => {
    switch (notificationFrequency) {
      case NotificationFreq.Daily:
        return I18Keys.today;
      case NotificationFreq.Weekly:
        return I18Keys.thisWeek;
      case NotificationFreq.Monthly:
        return I18Keys.thisMonth;
      default:
        return I18Keys.today;
    }
  })();

  const footerTimeframeKey = (() => {
    switch (notificationFrequency) {
      case NotificationFreq.Daily:
        return I18Keys.daily;
      case NotificationFreq.Weekly:
        return I18Keys.weekly;
      case NotificationFreq.Monthly:
        return I18Keys.monthly;
      default:
        return I18Keys.daily;
    }
  })();

  const { header, preview, summary, footer } = (() => {
    const header = t(I18Keys.emailHeader);
    const { pendingPosts, manuallyPublishedPosts, autoPublishedPosts } =
      splitPostsByStatus(posts);
    const preview = `${
      autoPublishedPosts.length > 0
        ? `${t(I18Keys.autoPublishedNanopubEmailPreview, { count: autoPublishedPosts.length })}, `
        : ''
    }${
      manuallyPublishedPosts.length > 0
        ? `${t(I18Keys.publishedNanopubEmailPreview, { count: manuallyPublishedPosts.length })}, `
        : ''
    }${
      pendingPosts.length > 0
        ? `${t(I18Keys.recommendedNanopubEmailPreview, { count: pendingPosts.length })}`
        : ''
    }`;
    let footer = t(I18Keys.emailFooter, {
      timeframe: t(footerTimeframeKey),
      emailSettingsLink,
      ignoredPostsLink,
      publishedPostsLink,
    });
    const summary = (
      <div style={{ margin: '0px 6px' }}>
        <Text style={{ marginTop: '8px', ...summaryStyle }}>
          {t(I18Keys.emailSummary, { timeframe: t(headerTimeframeKey) })}
        </Text>
        {Object.values(splitPostsByStatus(posts)).map((postsByStatus, idx) => {
          if (postsByStatus.length > 0) {
            const summaryByStatusKey = (() => {
              switch (idx) {
                case 0:
                  return I18Keys.recommendedNanopubEmailSummary;
                case 1:
                  return I18Keys.publishedNanopubEmailSummary;
                default:
                  return I18Keys.autoPublishedNanopubEmailSummary;
              }
            })();
            return (
              <Text style={summaryStyle}>
                {`• ${t(summaryByStatusKey, {
                  count: postsByStatus.length,
                })}`}
              </Text>
            );
          }
        })}
      </div>
    );
    return { header, preview, summary, footer };
  })();

  const postCardsEmailSection = (posts: AppPostFull[]) => {
    return Object.values(splitPostsByStatus(posts)).map(
      (postsByStatus, idx) => {
        if (postsByStatus.length === 0) {
          return <></>;
        }

        const { sectionHeaderKey, postLinkByStatus } = (() => {
          switch (idx) {
            case 0:
              return {
                sectionHeaderKey: I18Keys.recommendedNanopubEmailHeader,
                postLinkByStatus: reviewPostsLink,
              };
            case 1:
              return {
                sectionHeaderKey: I18Keys.publishedNanopubEmailHeader,
                postLinkByStatus: publishedPostsLink,
              };
            default:
              return {
                sectionHeaderKey: I18Keys.autoPublishedNanopubEmailHeader,
                postLinkByStatus: publishedPostsLink,
              };
          }
        })();
        const sectionHeader = t(sectionHeaderKey, {
          count: postsByStatus.length,
          timeframe: t(headerTimeframeKey),
        });
        return (
          <>
            <Row>
              <Heading
                as="h2"
                style={{
                  fontSize: 26,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                {sectionHeader}
              </Heading>
            </Row>
            {postsByStatus.slice(0, MAX_POSTS_IN_EMAIL).map((post, idx) => {
              const postUrl = new URL(
                AbsoluteRoutes.Post(post.id),
                appUrl
              ).toString();
              return (
                <Section key={idx} style={{ margin: '16px 0px 0px' }}>
                  <PostCardEmail post={post} />
                  <EmailRow>
                    <Button
                      style={{ marginTop: '16px', ...button }}
                      href={postUrl}>
                      {t(I18Keys.emailReviewPostButton)}
                    </Button>
                  </EmailRow>
                </Section>
              );
            })}
            {postsByStatus.length > MAX_POSTS_IN_EMAIL && (
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
                      count: postsByStatus.length - MAX_POSTS_IN_EMAIL,
                    })}
                  </Text>
                </EmailRow>
                <EmailRow>
                  <Button style={button} href={postLinkByStatus}>
                    {t(I18Keys.emailSeeAllButton)}
                  </Button>
                </EmailRow>
              </>
            )}
          </>
        );
      }
    );
  };

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container>
          <div style={{ margin: '30px 0px 0px' }}></div>
          <EmailRow>
            <Img src={LOGO_URL} style={logoImg} />
          </EmailRow>
          <Row>
            <Heading
              as="h1"
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              {header}
            </Heading>
          </Row>
          {summary}
          {postCardsEmailSection(posts)}
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
  appUrl: 'https://sample.com/',
};
