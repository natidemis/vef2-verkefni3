import { readFile } from 'fs/promises';
import faker from 'faker';
import { query, end, insertIntoTable } from './db.js';

const schemaFile = './sql/schema.sql';

async function create() {
  const data = await readFile(schemaFile);
  await query(data.toString('utf-8'));

  let i;
  const twoWeeks = 1000 * 60 * 60 * 24 * 14;
  const arr = [];
  for (i = 0; i < 500; i += 1) {
    const gogn = {
      name: faker.name.findName(),
      nationalId: Math.floor(100000000 + Math.random() * 900000000),
      comment: faker.lorem.sentence(),
      anonymous: Math.random() < 0.5,
      date: faker.date.between(
        new Date(new Date().getTime() - twoWeeks).toISOString().substring(0, 10),
        new Date().toISOString().substring(0, 10),
      ),
    };
    arr.push(gogn);
  }

  const primises = arr.map(insertIntoTable);
  await Promise.all(primises);

  await end();

  console.info('Schema created');
}

create().catch((err) => {
  console.error('Error creating schema', err);
});
