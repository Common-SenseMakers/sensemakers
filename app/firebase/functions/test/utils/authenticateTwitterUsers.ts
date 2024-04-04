import puppeteer, { Browser } from 'puppeteer';
import { IOAuth2RequestTokenResult } from 'twitter-api-v2';

import {
  TwitterGetContextParams,
  TwitterUserDetails,
} from '../../src/@shared/types.twitter';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { TimeService } from '../../src/time/time.service';
import { userRepo } from '../__tests__/test.services';

const CALLBACK_URL = 'https://sense-nets.xyz/';
const NEXT_BUTTON_TEXT = 'Next';
const LOG_IN_BUTTON_TEXT = 'Log in';
const AUTHORIZE_APP_BUTTON_TEXT = 'Authorize app';
const USERNAME_INPUT_SELECTOR = 'input[autocomplete="username"]';
const PASSWORD_INPUT_SELECTOR = 'input[autocomplete="current-password"]';

export interface TwitterAccountCredentials {
  user_id: string;
  username: string;
  password: string;
}

export const authenticateTwitterUsers = async (
  userCredentials: TwitterAccountCredentials[]
): Promise<TwitterUserDetails[]> => {
  const time = new TimeService();
  const twitterService = new TwitterService(time, userRepo, {
    clientId: process.env.TWITTER_CLIENT_ID as string,
    clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
  });

  const authenticatedUserPromises = userCredentials.map(async (testAccount) => {
    const browser = await puppeteer.launch({ headless: false });
    const userToken = await authenticateTwitterUser(
      testAccount,
      twitterService,
      browser,
      'read'
    );
    await browser.close();
    return userToken;
  });
  const authenticatedUsers = await Promise.all(authenticatedUserPromises);
  return authenticatedUsers;
};

export const authenticateTwitterUser = async (
  user: TwitterAccountCredentials,
  twitterService: TwitterService,
  browser: Browser,
  type: 'read' | 'write'
): Promise<TwitterUserDetails> => {
  const twitterOAuthTokenRequestResult: IOAuth2RequestTokenResult &
    TwitterGetContextParams = await twitterService.getSignupContext(undefined, {
    callback_url: CALLBACK_URL,
    type,
  });
  const page = await browser.newPage();
  await page.goto(twitterOAuthTokenRequestResult.url);
  await page.waitForSelector(USERNAME_INPUT_SELECTOR);
  await page.type(USERNAME_INPUT_SELECTOR, user.username);
  await page.evaluate((nextButtonText) => {
    const elements = [...document.querySelectorAll('span')];
    const targetElement = elements.find((e) => e.innerText == nextButtonText);
    if (targetElement) targetElement.click();
  }, NEXT_BUTTON_TEXT);

  await page.waitForSelector(PASSWORD_INPUT_SELECTOR);
  await page.type(PASSWORD_INPUT_SELECTOR, user.password);
  await page.evaluate((logInButtonText) => {
    const elements = [...document.querySelectorAll('span')];
    const targetElement = elements.find((e) => e.innerText == logInButtonText);
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
  await page.close();

  const queryParams = new URLSearchParams(new URL(currentUrl).search);

  const twitterOAuthCode = queryParams.get('code');
  if (!twitterOAuthCode) {
    throw new Error('twitterOAuthCode undefined');
  }

  const userDetails = await twitterService.handleSignupData({
    ...twitterOAuthTokenRequestResult,
    code: twitterOAuthCode,
  });

  return userDetails;
};
