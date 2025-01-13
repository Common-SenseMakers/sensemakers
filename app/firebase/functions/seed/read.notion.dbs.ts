import { Client } from '@notionhq/client';

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

console.log('a', { notion });
