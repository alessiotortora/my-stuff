# Findings: Varlock, TanStack Start server functions, and Cloudflare Workers (`www`)

This document records **why** a minimal Vite setup (`varlockVitePlugin` + `@cloudflare/vite-plugin` + `tanstackStart`) is often **not enough** for secrets used inside **`createServerFn`** handlers (e.g. Spotify in `src/server/spotify.ts`).

## 1. Varlock `ENV` and TanStack server-fn split bundles

`@varlock/vite-integration` with `ssrInjectMode: "resolved-env"` prepends initialization (including `globalThis.__varlockLoadedEnv` and `initVarlockEnv()`) to what it treats as the **first** SSR entry module.

TanStack Start **splits server functions** into **separate chunks** (e.g. server-fn / `tss-serverfn-split` bundles). Code in those chunks imports `varlock/env` **without** that injected bootstrap.

Typical outcomes:

- `initVarlockEnv({ allowFail: true })` finds no `__VARLOCK_ENV` / `__varlockLoadedEnv` in that isolate.
- `initializedEnv` stays false.
- Accessing **`ENV.SOME_KEY` throws** (`varlock ENV not initialized`), or config never appears where you expect.

So **`ENV` in a server function file is not equivalent to `ENV` in the “main” SSR entry** unless Varlock (or TanStack) changes how every server-fn chunk is built.

## 2. Cloudflare Worker (`workerd`) vs Node (Vite / Varlock)

Varlock resolves `.env.schema` (including Bitwarden) in the **Node** process that runs Vite and the Varlock CLI/plugin. That populates **host** `process.env` (and serialized `__VARLOCK_ENV` where applicable).

With `@cloudflare/vite-plugin`, SSR and server functions run in **workerd**, not in that Node process. The Worker runtime **does not automatically mirror** the same `process.env` as the Vite parent.

Effects:

- Relying on **dynamic** `process.env[key]` or `const e = process.env; e?.SPOTIFY_*` inside the Worker bundle can still see **empty** values even when Node had them.
- **Vite `define`** only rewrites **static** identifiers (e.g. `process.env.SPOTIFY_CLIENT_ID`). Dynamic access is not rewritten.

## 3. `loadEnv`, monorepos, and `.env.local`

Vite’s `loadEnv(mode, dir, prefix)` only sees files under the given `dir`. With **Turbo** or mixed **cwd**, secrets in **repo root** `.env.local` may not be merged with **app** `.env.local` unless you load/merge explicitly (e.g. multiple dirs or a small `fs` parser for known paths).

This is orthogonal to Varlock but shows up as “variables missing” during local dev.

## 4. Spotify / API token flow (application errors vs env)

Separate from the above:

- **`invalid_client`** on the token endpoint points at **Client ID + Client Secret** (Basic auth), not the refresh token.
- **`invalid_grant`** usually points at a bad/expired/revoked **refresh token**, or a token from another app. An **authorization `code`** is not a refresh token.
- **Empty `items` / null `track`** on recently-played, or **missing `album.images[0]`**, can throw if the handler assumes a happy path.

## 5. Operational notes

- **`varlock run --`** before `vite dev` / production `vite build` is required when resolution depends on the Varlock CLI (e.g. Bitwarden). A plain `vite build` without `varlock run` may not see the same resolved values.
- Anything injected with **`define` is fixed at the time the dev server or build runs**; restart after changing env files.
- **Production**: values baked by `define` or embedded in the Worker artifact reflect the **build environment**. Plan CI secrets / Wrangler **secrets** accordingly.

---

## Solution (what actually works together)

Use **Varlock for Node-side resolution** and a **separate bridge into the Worker bundle** for anything that runs in `createServerFn` on Cloudflare.

### A. Scripts

- **`dev` / `deploy`**: prefix with **`varlock run --`** so `.env.schema` (and Bitwarden) resolve the same way the Varlock plugin expects.
- **`build`**: use **`varlock run -- vite build`** whenever the schema uses Bitwarden or non-trivial Varlock sources; otherwise CI may build with empty secrets.

### B. `vite.config.ts` (recommended pattern)

1. **Import** `@varlock/vite-integration` so its side effect can run Varlock load into **`process.env`** before you compute any merged env object (optional but helps Bitwarden-on-disk flow).

2. **Merge env from files** (predictable in monorepos):
   - `loadEnv(mode, repoRoot, "")` and `loadEnv(mode, wwwDir, "")` (or your app directory), then
   - Optionally parse **`.env` / `.env.local`** from **repo root** and **`apps/www`** with a small **`fs`** reader so Turbo/cwd never hides files.

3. **Overlay Varlock into the merged map** for keys you need in the Worker (e.g. `SPOTIFY_*`, `PUBLIC_APP_URL`, `APP_ENV`): if a key is **missing or empty** after file merge, copy from **`process.env`** (Varlock often filled it on the host). Let **non-empty `.env.local` values override** Bitwarden when you want local overrides.

4. **`environments.ssr.define`**: for each critical key, set  
   `"process.env.SPOTIFY_CLIENT_ID": JSON.stringify(merged.SPOTIFY_CLIENT_ID ?? "")`  
   (and the same for secret, refresh token, plus `PUBLIC_*` / `APP_ENV` if the Worker reads them). This **inlines** values into the SSR/worker bundle so server functions see them.

5. **`cloudflare({ viteEnvironment: { name: "ssr" }, config: () => ({ vars: { … } }) })`**: pass the same subset (`SPOTIFY_*`, `PUBLIC_*`, `APP_ENV`) as Wrangler **vars** so local dev tooling and bindings stay aligned (`vars` alone may still not populate `process.env` the way you expect; **`define` + static reads** is the reliable combo).

Plugin order: **`varlockVitePlugin({ ssrInjectMode: "resolved-env" })` first**, then Tailwind, Cloudflare, TanStack Start, etc.

### C. `src/server/spotify.ts` (or any secret-using server fn)

1. **`initVarlockEnv({ allowFail: true })`**, then try **`ENV.*` inside `try/catch`** (covers main SSR entry when Varlock init runs).

2. **Fallback**: read **`process.env.SPOTIFY_CLIENT_ID`** (and secret / refresh) using **static property access** — not `const x = process.env; x.SPOTIFY_*` — so Vite **`define`** can rewrite them.

3. **Optional**: if `process.env.__VARLOCK_ENV` exists as JSON (from `varlock run`), parse and read `config.SPOTIFY_* .value` as a third fallback.

4. **`.trim()`** on credentials (Bitwarden / copy-paste often adds trailing newlines → **`invalid_client`**).

5. **Spotify API robustness**: handle **non-OK** recently-played responses, **empty `items`**, **`track: null`**, and **missing `album.images[0]`** so you return a structured error instead of a generic `catch`.

### D. Alternatives (same security model)

- **HTTP route** in the Worker (e.g. `GET /api/now-playing`) that reads `env` / vars; the route **`fetch`es** from the client or loader. You still need **Worker-visible** secrets (`vars`, `define`, or `.dev.vars`).
- **`.dev.vars`** next to `wrangler.jsonc` with the same keys (Cloudflare’s documented local path). Combine with **`define`** if `process.env` in the bundle is still empty.

### E. What you should not rely on alone

- **`ENV` only** inside server-fn chunks on this stack.
- **Dynamic `process.env[variable]`** in the Worker bundle if you depend on Vite **`define`**.
- **`loadEnv` only** without considering **repo root vs app dir** in a workspace.

## Related files (this app)

- `apps/www/vite.config.ts` — Varlock + Cloudflare + TanStack plugins
- `apps/www/src/server/spotify.ts` — Spotify server function
- `apps/www/.env.schema` — Varlock schema (e.g. Bitwarden-backed keys)
- `apps/www/wrangler.jsonc` — Worker config (`nodejs_compat`, etc.)
