import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const result = execFileSync(
  process.execPath,
  ['node_modules/supabase/dist/supabase.js', 'gen', 'types', 'typescript', '--local', '--schema', 'public'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);
if (!result.includes('export type Database'))
  throw new Error('Database type generation did not return a schema.');
writeFileSync('src/server/database.types.ts', result);
console.log('Generated public database types from the running local schema.');
