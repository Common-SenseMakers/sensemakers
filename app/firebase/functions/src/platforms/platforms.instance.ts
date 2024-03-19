import { PLATFORM } from '../@shared/types';
import { OrcidService } from './orcid/orcid.service';
import { AppIdentityPlatforms } from './platforms.interface';
import {
  TwitterApiCredentials,
  TwitterService,
} from './twitter/twitter.service';

export interface Credentials {
  twitter: TwitterApiCredentials;
}

export const appPlatforms = (credentials: Credentials) => {
  const platforms: AppIdentityPlatforms = new Map();

  platforms.set(PLATFORM.Orcid, new OrcidService());
  platforms.set(PLATFORM.Twitter, new TwitterService(credentials.twitter));

  return platforms;
};
