import puppeteer from 'puppeteer';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';

const NEXT_BUTTON_TEXT = 'Next';
const LOG_IN_BUTTON_TEXT = 'Log in';
const AUTHORIZE_APP_BUTTON_TEXT = 'Authorize app';
const USERNAME_INPUT_SELECTOR = 'input[autocomplete="username"]';
const PASSWORD_INPUT_SELECTOR = 'input[autocomplete="current-password"]';

const DEBUG = false;
const DEBUG_PREFIX = 'authenticateTwitterUser';

export const runAuthenticateTwitterUser = async (
  url: string,
  username: string,
  password: string
): Promise<string> => {
  const browser = await puppeteer.launch({ headless: false });

  if (DEBUG) logger.debug('context', { context }, DEBUG_PREFIX);

  const page = await browser.newPage();

  if (DEBUG) {
    page
      .on('console', (message) =>
        logger.debug(
          `console: ${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
        )
      )
      .on('pageerror', ({ message }) => logger.debug(`pageerror: ${message}`))
      .on('response', (response) => {
        const status = response.status();
        if (status >= 400) {
          logger.debug(`response: ${status} ${response.url()}`);

          response.text().then((text) => {
            logger.debug(`async full response ${response.url()}: ${text}`);
          });
        }
      })
      .on('requestfailed', (request) => {
        const failure = request.failure();
        if (failure !== null) {
          logger.debug(`requestfailed: ${failure.errorText} ${request.url()}`);
        }
      });
  }

  await page.goto(url);

  if (DEBUG) logger.debug('waitForClick', undefined, DEBUG_PREFIX);

  await page.waitForSelector(USERNAME_INPUT_SELECTOR);
  await page.type(USERNAME_INPUT_SELECTOR, username);
  await page.evaluate((nextButtonText) => {
    const elements = [...document.querySelectorAll('span')];
    const targetElement = elements.find((e) => e.innerText == nextButtonText);
    if (targetElement) targetElement.click();
  }, NEXT_BUTTON_TEXT);

  await page.waitForSelector(PASSWORD_INPUT_SELECTOR);
  await page.type(PASSWORD_INPUT_SELECTOR, password);
  await page.evaluate((logInButtonText) => {
    const elements = [...document.querySelectorAll('span')];
    const targetElement = elements.find((e) => e.innerText == logInButtonText);
    if (targetElement) targetElement.click();
  }, LOG_IN_BUTTON_TEXT);

  if (DEBUG) logger.debug('waitForNavigation', undefined, DEBUG_PREFIX);
  await page.waitForNavigation();

  if (DEBUG) logger.debug('waitForFunction', undefined, DEBUG_PREFIX);
  await page.waitForFunction(
    (authorizeAppButtonText) =>
      document.body.textContent?.includes(authorizeAppButtonText),
    {},
    AUTHORIZE_APP_BUTTON_TEXT
  );

  if (DEBUG)
    logger.debug('wait for authorizeAppButton click', undefined, DEBUG_PREFIX);
  await page.evaluate((authorizeAppButtonText) => {
    const elements = [...document.querySelectorAll('span')];
    const targetElement = elements.find(
      (e) => e.innerText == authorizeAppButtonText
    );
    if (targetElement) targetElement.click();
  }, AUTHORIZE_APP_BUTTON_TEXT);

  if (DEBUG) logger.debug('waitForNavigation', undefined, DEBUG_PREFIX);
  await page.waitForNavigation();

  const currentUrl = page.url();

  if (DEBUG) logger.debug('closing page', undefined, DEBUG_PREFIX);
  await page.close();

  const queryParams = new URLSearchParams(new URL(currentUrl).search);

  const twitterOAuthCode = queryParams.get('code');
  if (!twitterOAuthCode) {
    throw new Error('twitterOAuthCode undefined');
  }

  if (DEBUG) logger.debug('closing browser', undefined, DEBUG_PREFIX);
  await browser.close();

  if (DEBUG) logger.debug('closed', undefined, DEBUG_PREFIX);
  return twitterOAuthCode;
};

export const checkOutdatedTwitterTokens = (appUsers: AppUser[]) => {
  // const fileContents = fs.readFileSync(TEST_USERS_FILE_PATH, 'utf8');
  // appUsers = JSON.parse(fileContents);
  const outdatedUsers = appUsers.filter(
    (user) =>
      user.accounts[PLATFORM.Twitter] &&
      user.accounts[PLATFORM.Twitter].some((twitterAccount) => {
        return (
          twitterAccount.credentials.read &&
          twitterAccount.credentials.read.expiresAtMs < Date.now()
        );
      })
  );
  return outdatedUsers.length > 0;
};
