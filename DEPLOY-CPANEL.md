# Deploy to cPanel — event.onplan.ae

Tested end-to-end: production build + plain Node 22 + file database.

## 1. Upload files
Upload the project into a folder **outside** public_html (e.g. `~/event-app`).
Exclude: `node_modules`, `dist`, `.wrangler`, `.sites-runtime`, `data`,
`.dev.vars`. A zip upload via File Manager is fastest.

## 2. Create the Node.js app
cPanel → **Setup Node.js App** → Create:
- Node.js version: **22.23.3** (24.21.0 also works)
- Application root: the folder from step 1
- Application URL: `https://event.onplan.ae`
- Application startup file: `server.js`

## 3. Install + build (cPanel Terminal or SSH, inside the app folder)
```
npm install
npm run build
```

## 4. Environment variables (Node app → Environment variables)
| Key | Value |
|---|---|
| `RESEND_API_KEY` | your Resend key |
| `EMAIL_FROM` | `Kore challenge <noreply@onplan.ae>` |
| `APP_URL` | `https://event.onplan.ae` |
| `NODE_ENV` | `production` |

`DATA_FILE` is optional (default `./data/event.json` inside the app root,
not web-accessible).

## 5. Start + first run
Start the app from the Node.js App panel. Open `https://event.onplan.ae`
and complete the **owner setup** screen once.

## 6. SSL
cPanel → SSL/TLS Status → run AutoSSL so the subdomain has HTTPS
(required for the coach camera scanner on phones).

## Where your data lives
Everything (registrations, teams, results, coaches, admins, sessions) is in
one file: `data/event.json` inside the app root. It is created automatically
when you complete owner setup. It is **not** web-accessible and is ignored by
git. Never upload, overwrite, or delete the `data/` folder.

## Safe updates — git pull (recommended)
The repo ignores secrets (`.dev.vars`), data (`data/`), `node_modules`,
and `dist`, so pulling code can never touch them.
1. First time only, in the cPanel terminal inside the app folder:
   ```
   git init
   git remote add origin https://github.com/YOU/kore-challenge.git
   git fetch origin
   git checkout -f main
   ```
   (`checkout -f` overwrites code files but leaves untracked `data/`,
   `node_modules`, and env vars alone.)
2. Every update:
   ```
   git pull origin main
   npm install --include=dev   # only if package.json changed
   npm run build               # only if app/, lib/, or public/ changed
   ```
   Then Restart the app from the Node.js App panel.
3. Never run `git clean -fd` on the server — it would delete `data/`.

## Safe updates — manual upload (alternative)
1. Upload **only** the changed files (I will always tell you exactly which
   files changed). Never upload `data/`, `node_modules`, or `dist`.
2. Rebuild **only if** a changed file is inside `app/`, `lib/`, `public/`,
   `server.js` needs no build — just restart. Pure doc files (`*.md`,
   `START-HERE.txt`) need nothing at all:
   ```
   npm run build
   ```
3. Restart the app from the Node.js App panel.
4. If anything looks wrong after an update, your data is still intact in
   `data/event.json` — tell me and we roll the code back, data untouched.

## Notes
- **Backups:** download `data/event.json` from the app root periodically —
  it holds everything. Copy it back to restore.
- QR codes encode the address in the browser — open admin pages via
  `https://event.onplan.ae` (not an IP) before printing posters.
- `npm install` (not `--omit=dev`): the production server needs packages
  listed under devDependencies.
- **Updates:** upload changed files, run `npm run build` again, restart app.
