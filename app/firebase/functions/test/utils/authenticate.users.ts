import puppeteer, { Browser } from 'puppeteer';
import { IOAuth2RequestTokenResult } from 'twitter-api-v2';

import {
  TwitterGetContextParams,
  TwitterSignupData,
} from '../../src/@shared/types/types.twitter';
import { AppUser, HexStr, PLATFORM } from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { getNanopubProfile } from './nanopub.profile';

const CALLBACK_URL = 'https://sense-nets.xyz/';
const NEXT_BUTTON_TEXT = 'Next';
const LOG_IN_BUTTON_TEXT = 'Log in';
const AUTHORIZE_APP_BUTTON_TEXT = 'Authorize app';
const USERNAME_INPUT_SELECTOR = 'input[autocomplete="username"]';
const PASSWORD_INPUT_SELECTOR = 'input[autocomplete="current-password"]';

export interface TwitterAccountCredentials {
  username: string;
  password: string;
  type: 'read' | 'write';
}

export interface OrcidAccountCredentials {
  username: string;
  password: string;
}

export interface NanopubAccountCredentials {
  ethPrivateKey: HexStr;
}

export interface TestUserCredentials {
  twitter: TwitterAccountCredentials;
  nanopub: NanopubAccountCredentials;
}

export const authenticateTestUsers = async (
  credentials: TestUserCredentials[],
  services: Services,
  manager: TransactionManager
) => {
  return Promise.all(
    credentials.map((credential) =>
      authenticateTestUser(credential, services, manager)
    )
  );
};

export const authenticateTestUser = async (
  credentials: TestUserCredentials,
  services: Services,
  manager: TransactionManager
): Promise<AppUser> => {
  const user0 = await authenticateTwitterUser(
    credentials.twitter,
    services,
    manager
  );
  const user1 = await authenticateNanopub(user0, credentials.nanopub);
  return user1;
};

const authenticateNanopub = async (
  user: AppUser,
  credentials: NanopubAccountCredentials
): Promise<AppUser> => {
  const { profile } = await getNanopubProfile(credentials.ethPrivateKey);

  user.platformIds.push(
    getPrefixedUserId(PLATFORM.Nanopub, profile.ethAddress)
  );

  user[PLATFORM.Nanopub] = [
    {
      signupDate: 0,
      user_id: profile.ethAddress,
      profile: {
        ethAddress: profile.ethAddress,
        rsaPublickey: profile.rsaPublickey,
        ethToRsaSignature: profile.ethToRsaSignature,
      },
    },
  ];

  return user;
};

/**
 * From a set of platform credentials, authenticate the users and
 * return their full profiles
 */
export const authenticateTwitterUser = async (
  testAccount: TwitterAccountCredentials,
  services: Services,
  manager: TransactionManager
): Promise<AppUser> => {
  const browser = await puppeteer.launch({ headless: false });
  const signupData = await runAuthenticateTwitterUser(
    testAccount,
    services.platforms.get<TwitterService>(PLATFORM.Twitter),
    browser
  );
  await browser.close();

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
