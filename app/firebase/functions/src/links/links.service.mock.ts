import { anything, instance, spy, when } from 'ts-mockito';

import { OEmbed } from '../@shared/types/types.references';
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
    when(mocked.fetchOEmbed(anything())).thenCall((url: string) => {
      const oembed: OEmbed = {
        url,
      };
      return { success: true, oembed };
    });
  }
  return instance(mocked) as unknown as LinksService;
};
