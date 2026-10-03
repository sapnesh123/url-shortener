# AI Log

Record of AI assistance (Claude Code) used in this project. Each entry lists the prompt, what the AI suggested, and what was actually changed or tested.

---

## 1. Basic Express server setup — 2026-10-03

**Prompt:**
> I've started a small URL shortener project. Backend is Node.js 24 with Express. I want to keep the backend structure simple for now. Can you help me set up the basic Express server? I need: server.js, dotenv, cors, express.json(), a simple GET / route to check whether the server is running, basic 404 handling, basic error handling. Please keep it clean and don't add anything that we don't need yet. For now, skip MongoDB, models, controllers and the actual URL shortening APIs. Also tell me what packages I need to install and what I should put in package.json for npm run dev.

**AI suggested:**
- `backend/server.js` already had dotenv, cors, `express.json()`, `GET /`, a 404 handler and an error handler. Suggested making the error handler use `err.status`/`err.statusCode`, so client errors like malformed JSON return 400 instead of 500.
- Packages: `express`, `cors`, `dotenv`, plus `nodemon` as a dev dependency (all already installed).
- Add the script `"dev": "nodemon server.js"` (alternative: `node --watch server.js`, built into Node 24).
- Noted that `mongoose` is installed but not needed yet, and that `backend/node_modules` is committed to git and there is no `.gitignore`.

**Changed:**
- `backend/server.js`: the error handler now uses `err.status || err.statusCode || 500` and returns `err.message` only for statuses below 500.
- `backend/package.json`: added the `"dev": "nodemon server.js"` script.
- Not changed: `mongoose` is still installed; `node_modules` is still tracked in git.

**Tested** (server run locally on port 5055 with curl):
- `GET /` → 200 `{"success":true,"message":"URL Shortener API is running"}`
- `GET /nope` → 404 `{"success":false,"message":"Route not found"}`
- `POST /` with invalid JSON body → 400 with the JSON parse error message

---

## 2. AI log process — 2026-10-03

**Prompt:**
> After every development step, automatically update AI_LOG.md with a short, factual entry containing the actual prompt/request, what you suggested, and what I actually changed or tested; never invent anything.

**AI suggested:** Add a project `CLAUDE.md` with this rule so it applies in future sessions, and write log entries for steps 1 and 2.

**Changed:** Created `CLAUDE.md` and wrote this file (`AI_LOG.md`).

**Tested:** Nothing (documentation only).

---

## 3. Url model and urlShortener controller — 2026-10-03

**Prompt:**
> I have completed the basic server and MongoDB setup. Now help me create the Url model and urlShortener controller. Model should have originalUrl, shortCode and createdAt, with shortCode unique. In the controller, add the basic logic to validate the URL, generate a unique 6-character shortCode, save it in MongoDB and return a JSON response. Also handle basic errors. For now, don't create routes or any extra architecture. Keep the code simple and clean.

**AI suggested:**
- `models/Url.js`: schema with `originalUrl` (required, trimmed), `shortCode` (required, unique index) and `createdAt` (default `Date.now`).
- `controllers/urlShortenerController.js` exporting `shortenUrl`:
  - Accepts only `http`/`https` URLs, checked with `new URL()`; anything else returns 400.
  - Generates a 6-character alphanumeric code with `crypto.randomInt`.
  - Relies on the unique index for uniqueness: on a duplicate-key error (11000) it retries with a new code, up to 5 attempts.
  - Returns 201 with `originalUrl`, `shortCode` and `createdAt`. Other errors are passed to the global error handler with `next(error)`.
- Pointed out that the backend has no MongoDB connection: `server.js` has no `mongoose.connect` call, there is no `.env`, and there is no db config file.

**Changed:**
- Created `backend/models/Url.js` and `backend/controllers/urlShortenerController.js`.
- No routes added; `server.js` not changed. The MongoDB connection is still missing.

**Tested** (controller run with `Url.create` stubbed; no real database was used):
- A valid URL with surrounding spaces → 201, URL trimmed, shortCode matches `^[A-Za-z0-9]{6}$`.
- Missing body, a non-string value, `"not a url"`, `ftp://`, `javascript:` → 400; `Url.create` was not called.
- One duplicate-key collision → retried and returned 201 (2 create calls).
- Collision on every attempt → `next()` called with "Could not generate a unique short code" after 5 attempts.
- Any other DB error → passed to `next()`.
- The schema's index list includes `{ shortCode: 1 }` with `{ unique: true }`.
- Not tested: saving to a real MongoDB, or the unique index being created in a real database.



