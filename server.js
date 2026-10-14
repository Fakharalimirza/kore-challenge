// Production entry point for plain Node.js hosting (e.g. cPanel "Setup Node.js App").
// Serves the `vinext build` output in ./dist. The host provides PORT.
// Boot progress is logged to stdout and ./data/startup.log for diagnosis.
import fs from 'node:fs';
import path from 'node:path';

const logFile = path.resolve('./data/startup.log');

function log(...parts) {
  const line =
    new Date().toISOString() + ' ' + parts.map((p) => String(p)).join(' ');
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, line + '\n');
  } catch {}
  console.log(line);
}

process.on('uncaughtException', (err) => {
  log('FATAL uncaughtException:', (err && err.stack) || err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  log('FATAL unhandledRejection:', (err && err.stack) || err);
});

log(
  'boot: node',
  process.version,
  'cwd',
  process.cwd(),
  'PORT',
  process.env.PORT || '(unset)',
);

const port = String(process.env.PORT || '3000');
process.argv = [process.execPath, 'server.js', 'start', '--port', port];
log('starting vinext production server on port', port);

import('./node_modules/vinext/dist/cli.js').then(
  () => log('vinext cli module loaded'),
  (err) => {
    log('FATAL importing vinext cli:', (err && err.stack) || err);
    process.exit(1);
  },
);
