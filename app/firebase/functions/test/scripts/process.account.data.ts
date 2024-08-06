import fs from 'fs';
import { UserV2 } from 'twitter-api-v2';

(() => {
  const first1 = fs.readFileSync('[0,5]-accounts.json', 'utf8');
  const first2 = fs.readFileSync('[5,10]-accounts.json', 'utf8');
  const first3 = fs.readFileSync('[10,15]-accounts.json', 'utf8');

  const users1: UserV2[] = JSON.parse(first1);
  const users2: UserV2[] = JSON.parse(first2);
  const users3: UserV2[] = JSON.parse(first3);
  const allUsers = users1.concat(users2).concat(users3);

  fs.writeFileSync('testUsers.json', JSON.stringify(allUsers), 'utf8');
})();
