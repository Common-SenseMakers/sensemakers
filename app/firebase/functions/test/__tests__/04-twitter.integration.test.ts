import { expect } from 'chai';
import puppeteer, { Browser, Page } from 'puppeteer';
import { IOAuth2RequestTokenResult } from 'twitter-api-v2';

import { PLATFORM } from '../../src/@shared/types';
import { TwitterGetContextParams } from '../../src/@shared/types.twitter';
import { IdentityServicesMap } from '../../src/platforms/platforms.service';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersService } from '../../src/users/users.service';
import { resetDB } from '../__tests_support__/db';
import { userRepo } from './test.services';

const logger = (global as any).logger;

const TWITTER_ACCOUNT = 'sense_nets_bot';
const CALLBACK_URL = 'http://127.0.0.1:3000/';
const NEXT_BUTTON_TEXT = 'Next';
const LOG_IN_BUTTON_TEXT = 'Log in';
const AUTHORIZE_APP_BUTTON_TEXT = 'Authorize app';
const TEST_ACCOUNTS_MAP = JSON.parse(
  process.env.TEST_USER_TWITTER_CREDENTIALS as string
);

describe('twitter integration', () => {
  const identityServices: IdentityServicesMap = new Map();
  const twitter = new TwitterService({
    clientId: process.env.TWITTER_CLIENT_ID as string,
    clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
  });
  identityServices.set(PLATFORM.Twitter, twitter);
  const usersService = new UsersService(userRepo, identityServices, {
    tokenSecret: process.env.OUR_TOKEN_SECRET as string,
    expiresIn: '30d',
  });
  let twitterOAuthTokenRequestResult:
    | (IOAuth2RequestTokenResult & TwitterGetContextParams)
    | undefined;
  let twitterOAuthCode: string | undefined;
  let browser: Browser | undefined;
  let page: Page | undefined;
  let testAccount: {
    user_id: string;
    username: string;
    password: string;
  } = TEST_ACCOUNTS_MAP[TWITTER_ACCOUNT];
  if (!testAccount) {
    throw new Error('testAccount undefined');
  }

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
  });

  describe('connect twitter', () => {
    it('get twitter oauth details', async () => {
      const details = await usersService.getSignupContext(
        PLATFORM.Twitter,
        undefined,
        {
          callback_url: CALLBACK_URL,
        }
      );

      logger.debug(`details:`, { details });
      expect(details).to.not.be.undefined;

      expect(details.callback_url).to.not.be.undefined;
      expect(details.codeChallenge).to.not.be.undefined;
      expect(details.codeVerifier).to.not.be.undefined;
      expect(details.state).to.not.be.undefined;
      expect(details.url.startsWith('https://twitter.com')).to.be.true;

      twitterOAuthTokenRequestResult = details;
    });
    it('authenticate twitter account when navigating to the generated oauth link', async () => {
      if (!twitterOAuthTokenRequestResult || !browser || !page) {
        throw new Error('unexpected');
      }

      const usernameInputSelector = 'input[autocomplete="username"]';
      const passwordInputSelector = 'input[autocomplete="current-password"]';

      await page.goto(twitterOAuthTokenRequestResult.url);
      await page.waitForSelector(usernameInputSelector);
      await page.type(usernameInputSelector, testAccount.username);
      await page.evaluate((nextButtonText) => {
        const elements = [...document.querySelectorAll('span')];
        const targetElement = elements.find(
          (e) => e.innerText == nextButtonText
        );
        if (targetElement) targetElement.click();
      }, NEXT_BUTTON_TEXT);

      await page.waitForSelector(passwordInputSelector);
      await page.type(passwordInputSelector, testAccount.password);
      await page.evaluate((logInButtonText) => {
        const elements = [...document.querySelectorAll('span')];
        const targetElement = elements.find(
          (e) => e.innerText == logInButtonText
        );
        if (targetElement) targetElement.click();
      }, LOG_IN_BUTTON_TEXT);

      await page.waitForNavigation();
      await page.waitForFunction(
        (authorizeAppButtonText) =>
          document.body.textContent?.includes(authorizeAppButtonText),
        {},
        AUTHORIZE_APP_BUTTON_TEXT
      );
      await page.evaluate((authorizeAppButtonText) => {
        const elements = [...document.querySelectorAll('span')];
        const targetElement = elements.find(
          (e) => e.innerText == authorizeAppButtonText
        );
        if (targetElement) targetElement.click();
      }, AUTHORIZE_APP_BUTTON_TEXT);

      await page.waitForNavigation();
      const currentUrl = page.url();

      const queryParams = new URLSearchParams(new URL(currentUrl).search);

      const code = queryParams.get('code');
      twitterOAuthCode = code ? code : undefined;
    });

    it('handle twitter signup after authenticating the account', async () => {
      const signupResult = await usersService.handleSignup(
        PLATFORM.Twitter,
        {
          ...twitterOAuthTokenRequestResult,
          code: twitterOAuthCode,
        },
        undefined
      );

      if (!signupResult) {
        throw new Error('signupResult undefined');
      }
      const user = await usersService.repo.getUser(signupResult.userId);

      if (!user) {
        throw new Error('user undefined');
      }

      const twitterDetails = user[PLATFORM.Twitter];
      if (!twitterDetails) {
        throw new Error('twitterDetails undefined');
      }

      expect(twitterDetails[0].user_id).to.eq(testAccount.user_id);
    });
  });
});
