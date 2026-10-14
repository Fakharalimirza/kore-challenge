// Universal environment: Cloudflare Workers bindings when running on
// workerd (dev/prod), plain process.env when running on Node.js
// (e.g. `vinext start` / cPanel). The dynamic import keeps the
// `cloudflare:workers` specifier out of the static module graph so the
// production bundle also loads on runtimes that don't provide it.
let cfEnv: any = null;
try {
  const mod: any = await import('cloudflare:workers');
  cfEnv = mod?.env ?? null;
} catch {
  cfEnv = null;
}

const procEnv: any =
  typeof process !== 'undefined' ? process.env ?? {} : {};

export const appEnv: any =
  cfEnv && Object.keys(cfEnv).length ? cfEnv : procEnv;
