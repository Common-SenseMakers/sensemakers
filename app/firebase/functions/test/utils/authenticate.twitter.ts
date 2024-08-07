import { logger } from 'firebase-functions';
import puppeteer, { Browser } from 'puppeteer';
import { IOAuth2RequestTokenResult } from 'twitter-api-v2';

import {
  TwitterGetContextParams,
  TwitterSignupData,
} from '../../src/@shared/types/types.twitter';
import {
  AppUser,
  PLATFORM,
  TwitterAccountCredentials,
} from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';

const CALLBACK_URL = 'https://sense-nets.xyz/';
const NEXT_BUTTON_TEXT = 'Next';
const LOG_IN_BUTTON_TEXT = 'Log in';
const AUTHORIZE_APP_BUTTON_TEXT = 'Authorize app';
const USERNAME_INPUT_SELECTOR = 'input[autocomplete="username"]';
const PASSWORD_INPUT_SELECTOR = 'input[autocomplete="current-password"]';

/**
 * From a set of platform credentials, authenticate the users and
 * return their full profiles
 */
export const authenticateTwitterUser = async (
  testAccount: TwitterAccountCredentials,
  services: Services,
  manager: TransactionManager
): Promise<AppUser> => {
  logger.debug('authenticateTwitterUser', { testAccount });

  const browser = await puppeteer.launch({ headless: true });
  const signupData = await runAuthenticateTwitterUser(
    testAccount,
    services.platforms.get<TwitterService>(PLATFORM.Twitter),
    browser
  );
  await browser.close();

  logger.debug('authenticatedTwitterUser', { testAccount });

  /** create users using the Twitter profiles */
  /** store the user in the DB (build the user profile object and derive the ID) */
  const result = await services.users.handleSignup(
    PLATFORM.Twitter,
    signupData,
    manager
  );
  if (!result) {
    throw new Error('Unexpected');
  }

  /** read the just created user (will fail if not found) */
  const user = await services.users.repo.getUser(result.userId, manager, true);

  return user;
};

const runAuthenticateTwitterUser = async (
  user: TwitterAccountCredentials,
  twitterService: TwitterService,
  browser: Browser
): Promise<TwitterSignupData> => {
  const twitterOAuthTokenRequestResult: IOAuth2RequestTokenResult &
    TwitterGetContextParams = await twitterService.getSignupContext(undefined, {
    callback_url: CALLBACK_URL,
    type: user.type,
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

  return {
    code: twitterOAuthCode,
    callback_url: twitterOAuthTokenRequestResult.callback_url,
    codeChallenge: twitterOAuthTokenRequestResult.codeChallenge,
    codeVerifier: twitterOAuthTokenRequestResult.codeVerifier,
    state: twitterOAuthTokenRequestResult.state,
    type: twitterOAuthTokenRequestResult.type,
    url: twitterOAuthTokenRequestResult.url,
  };
};

export const checkOutdatedTwitterTokens = (appUsers: AppUser[]) => {
  // const fileContents = fs.readFileSync(TEST_USERS_FILE_PATH, 'utf8');
  // appUsers = JSON.parse(fileContents);
  const outdatedUsers = appUsers.filter(
    (user) =>
      user[PLATFORM.Twitter] &&
      user[PLATFORM.Twitter].some((twitterAccount) => {
        return (
          twitterAccount.read && twitterAccount.read.expiresAtMs < Date.now()
        );
      })
  );
  return outdatedUsers.length > 0;
};
