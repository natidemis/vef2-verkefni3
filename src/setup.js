  
import { readFile } from 'fs/promises';
import { query, end, insertIntoTable } from './db.js';
import faker from 'faker';

const schemaFile = './sql/schema.sql';

async function create() {
  const data = await readFile(schemaFile);

  await query(data.toString('utf-8'));

  createFakeUsers().catch((err) => {
    console.error('Error inserting random signatures',err);
});

  await end();

  console.info('Schema created');
}

async function createFakeUsers() {
    var i;
    var twoWeeks = 1000 * 60 * 60 * 24 * 14;
    for(i = 0; i < 500;i++) {
        const data = {
            name: faker.name.findName(),
            nationalId: Math.floor(100000000 + Math.random() * 900000000),
            comment: faker.lorem.sentence(),
            anonymous: Math.random() < 0.5,
            date: faker.date.between(new Date(new Date().getTime() - twoWeeks).toISOString().substring(0,10), new Date().toISOString().substring(0,10))
        }
        await insertIntoTable(data);
    }
    console.log("exited");
}

create().catch((err) => {
  console.error('Error creating schema', err);
});