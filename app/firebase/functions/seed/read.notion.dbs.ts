import { Client, collectPaginatedAPI } from '@notionhq/client';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: './seed/.env.seed' });
const outputDir = './seed/output';

const token = process.env.NOTION_TOKEN as string;
const db_id = process.env.DB_ID as string;

interface AccountDetails {
  communities: string[];
  bluesky?: string;
  mastodon?: string;
  twitter?: string;
  chosen: string[];
}

(async () => {
  const notion = new Client({
    auth: token,
  });

  /** read the list of communities */
  const db = await notion.databases.retrieve({ database_id: db_id });

  const communities: string[] = (
    db.properties['Communities'] as any
  ).multi_select.options.map((option: any) => option.name as string);

  console.log('Communities:', communities);

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  communities.forEach((community) => {
    const filePath = path.join(outputDir, `${community}.csv`);
    fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, 'account\n', 'utf-8');
  });

  /** read the entries in the DB */
  const entries = await collectPaginatedAPI(notion.databases.query, {
    database_id: db_id,
  });

  const accounts: AccountDetails[] = entries.map((entry) => {
    const entryAny = entry as any;
    const chosen = entryAny.properties['Chosen'].multi_select.map(
      (item: any) => item.name
    );

    return {
      communities: entryAny.properties['Communities'].multi_select.map(
        (item: any) => item.name
      ),
      bluesky: entryAny.properties['Bluesky']?.url,
      mastodon: entryAny.properties['Mastodon']?.url,
      twitter: entryAny.properties['Twitter']?.url,
      chosen,
    };
  });

  accounts.forEach(async (account) => {
    account.communities.forEach(async (community) => {
      const filePath = path.join(outputDir, `${community}.csv`);
      const accountUrl = (() => {
        if (account.bluesky) return account.bluesky;
        if (account.mastodon) return account.mastodon;
        if (account.twitter) return account.twitter;
        throw new Error('No account URL found');
      })();
      const line = `${accountUrl}\n`;
      fs.appendFileSync(filePath, line, 'utf-8');
    });
  });
})();
