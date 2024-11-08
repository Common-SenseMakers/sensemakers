import { anything, instance, spy, when } from 'ts-mockito';

import { OEmbed } from '../@shared/types/types.parser';
import { TransactionManager } from '../db/transaction.manager';
import { LinksMockConfig, LinksService } from './links.service';

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
    when(mocked.getOEmbed(anything(), anything())).thenCall(
      (url: string, manager: TransactionManager) => {
        const oembed: OEmbed = {
          url,
        };
        return oembed;
      }
    );

    when(mocked.setOEmbed(anything(), anything())).thenCall(
      (url: string, manager: TransactionManager) => {
        return;
      }
    );
  }
  return instance(mocked) as unknown as LinksService;
};
