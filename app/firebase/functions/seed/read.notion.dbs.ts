import { Client, collectPaginatedAPI } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: './seed/.env.seed' });

const token = process.env.NOTION_TOKEN as string;
const db_id = process.env.DB_ID as string;

(async () => {
  const notion = new Client({
    auth: token,
  });

  const entries = await collectPaginatedAPI(notion.databases.query, {
    database_id: db_id,
  });

  console.log(entries);
})();
