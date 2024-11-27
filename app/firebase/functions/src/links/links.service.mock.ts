import { anything, instance, spy, when } from 'ts-mockito';

import { OEmbed } from '../@shared/types/types.references';
import { TransactionManager } from '../db/transaction.manager';
import { LinksMockConfig, LinksService } from './links.service';
import { normalizeUrl } from './links.utils';

/**
 * TwitterService mock that publish and fetches posts without really
 * hitting the API
 */
export const getLinksMock = (
  linksService: LinksService,
  type?: LinksMockConfig
) => {
  if (!type || Object.keys(type).length === 0) {
    return linksService;
  }

  const mocked = spy(linksService) as unknown as LinksService;

  if (type.enable) {
    when(mocked.fetchOEmbed(anything())).thenCall((url: string) => {
      const oembed: OEmbed = {
        original_url: url,
        url: normalizeUrl(url),
      };
      return oembed;
    });

    when(mocked.setOEmbed(anything(), anything())).thenCall(
      (url: string, manager: TransactionManager) => {
        return;
      }
    );
  }
  return instance(mocked) as unknown as LinksService;
};
