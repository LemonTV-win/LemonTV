import { syncAll } from '../src/lib/server/db/sync';
import { db } from './lib/db';

console.info('[Scripts][SyncDB] Syncing database...');
await syncAll(db);
console.info('[Scripts][SyncDB] Database synced');
