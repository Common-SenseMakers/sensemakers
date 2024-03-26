import { AppUser, PLATFORM } from '../../src/@shared/types';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { resetDB } from '../__tests_support__/db';
import { services } from './test.services';

describe.only('post processing', () => {
  describe('fetch', () => {
    before(async () => {
      resetDB();

      /** store some real twitter users in the DB */
      const users: AppUser[] = ['sensemakergod'].map((handle): AppUser => {
        const userId = getPrefixedUserId(PLATFORM.Twitter, handle);
        return {
          userId,
          platformIds: [userId],
          twitter: [
            {
              user_id: handle,
            },
          ],
        };
      });

      await Promise.all(
        users.map((user) => services.users.repo.createUser(user.userId, user))
      );
    });

    it('fetch all posts from all platforms', async () => {
      /**
       * high-level trigger to process all new posts from
       * all registered users
       */
      await services.posts.process();
    });
  });
});
