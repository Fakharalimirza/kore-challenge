import { appEnv as env } from './env';
import fs from 'node:fs';
import path from 'node:path';

type Row = { id: number; owner: string; revision: number; data: string };

function dataFile(): string {
  const fromEnv =
    (env as any)?.DATA_FILE ||
    (typeof process !== 'undefined' ? process.env?.DATA_FILE : '');
  const file = fromEnv || './data/event.json';
  return path.isAbsolute(file) ? file : path.resolve(file);
}

function readRow(): Row | null {
  try {
    const raw = fs.readFileSync(dataFile(), 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.row) return parsed.row;
    return null;
  } catch {
    return null;
  }
}

function writeRow(row: Row | null) {
  fs.mkdirSync(path.dirname(dataFile()), { recursive: true });
  fs.writeFileSync(dataFile(), JSON.stringify({ row }));
}

function fileBackend() {
  return {
    prepare(sql: string) {
      let args: any[] = [];
      return {
        bind(...a: any[]) {
          args = a;
          return this;
        },
        async first() {
          const row = readRow();
          return row ? JSON.parse(JSON.stringify(row)) : null;
        },
        async run() {
          if (sql.startsWith('CREATE TABLE')) return { meta: { changes: 0 } };
          if (sql.startsWith('INSERT')) {
            if (!readRow()) {
              writeRow({ id: 1, owner: args[0], revision: 0, data: args[1] });
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.startsWith('UPDATE')) {
            const row = readRow();
            if (!row) return { meta: { changes: 0 } };
            if (args.length > 1 && row.revision !== args[1])
              return { meta: { changes: 0 } };
            row.data = args[0];
            row.revision++;
            writeRow(row);
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 0 } };
        },
      };
    },
  };
}

let fileDb: ReturnType<typeof fileBackend> | null = null;

export function getDb(): any {
  if (env.DB) return env.DB;
  if (!fileDb) fileDb = fileBackend();
  return fileDb;
}
