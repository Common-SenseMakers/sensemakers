import { Client, collectPaginatedAPI } from '@notionhq/client';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: './seed/.env.seed' });
const outputDir = './seed/output';

const token = process.env.NOTION_TOKEN as string;
const db_id = process.env.DB_ID as string;

interface AccountDetails {
  name?: string;
  clusters: string[];
  bluesky?: string;
  mastodon?: string;
  twitter?: string;
  chosen?: string;
}

(async () => {
  const notion = new Client({
    auth: token,
  });

  /** read the list of communities */
  const db = await notion.databases.retrieve({ database_id: db_id });

  const clusters: string[] = (
    db.properties['Clusters'] as any
  ).multi_select.options.map((option: any) => option.name as string);

  console.log('Clusters:', clusters);

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  clusters.forEach((cluster) => {
    const filePath = path.join(outputDir, `${cluster}.csv`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    fs.writeFileSync(filePath, 'account\n', 'utf-8');
  });

  /** read the entries in the DB */
  const entries = await collectPaginatedAPI(notion.databases.query, {
    database_id: db_id,
  });

  const accounts = entries
    .map((entry) => {
      const entryAny = entry as any;
      const chosenValue = entryAny.properties['chosen_profile'].formula;
      const clustersValue = entryAny.properties['Clusters'].multi_select;
      const nameValue = entryAny.properties['Name'];

      if (clustersValue === null) {
        return undefined;
      }

      const name =
        nameValue.title.length > 0 ? nameValue.title[0].plain_text : '';

      const chosen =
        chosenValue.string !== null
          ? (chosenValue.string as string)
          : undefined;

      const clusters = clustersValue.map((item: any) => item.name);

      return {
        name,
        clusters: clusters,
        bluesky: entryAny.properties['Bluesky']?.url,
        mastodon: entryAny.properties['Fediverse']?.url,
        twitter: entryAny.properties['Twitter']?.url,
        chosen,
      };
    })
    .filter((account) => account !== undefined) as AccountDetails[];

  accounts.forEach(async (account) => {
    account.clusters.forEach(async (community) => {
      const filePath = path.join(outputDir, `${community}.csv`);
      const accountUrl = (() => {
        if (account.chosen) return account.chosen;
        if (account.bluesky) return account.bluesky;
        if (account.mastodon) return account.mastodon;
        if (account.twitter) return account.twitter;
        return undefined;
      })();
      if (accountUrl) {
        const line = `${accountUrl}\n`;
        fs.appendFileSync(filePath, line, 'utf-8');
      }
    });
  });
})();
