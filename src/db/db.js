import Dexie from 'dexie';
import { DB_NAME, DB_SCHEMA, DB_VERSION } from 'src/db/configDB.js';

const db = new Dexie(DB_NAME);

db
  .version(DB_VERSION)
  .stores(DB_SCHEMA);

db.solves.mapToClass(class {
  constructor(sessionId, time, timestamp, scramble, solution, reconstruction) {
    this.sessionId = sessionId;
    this.time = time;
    this.timestamp = timestamp;
    this.scramble = scramble;
    this.solution = solution;
    this.reconstruction = reconstruction;
  }
});

export async function initializeDefaultSession() {
  const count = await db.sessions.count();
  if (count === 0) {
    await db.sessions.add({
      name: 'Default Session',
      createdAt: new Date(),
      solves: []
    });
  }
}

initializeDefaultSession().then(() => console.log('db initialized'));

export default db;
