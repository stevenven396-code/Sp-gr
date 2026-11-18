# IELTS Speaking Auto-Grader — Unified Windows + iOS PWA

This single project contains the same assessment interface for Windows (Electron) and iPhone/iPad (PWA). Both clients call one Cloudflare Worker backend. The Anthropic API key stays in Cloudflare and is never stored in the public repository or browser.

## 1. Deploy the shared Claude backend (required once)

1. Create/sign in to a Cloudflare account: https://dash.cloudflare.com/.
2. Open **Workers & Pages** → **Create** → **Create Worker**. Name it, e.g. `ielts-grader-api`.
3. Choose **Edit code**, replace the sample code with the complete contents of `backend/worker.js`, then **Deploy**.
4. Open the Worker → **Settings** → **Variables and Secrets**. Add these as **Secrets** (not plain text variables):
   - `ANTHROPIC_API_KEY` = your Anthropic API key (`sk-ant-...`)
   - `APP_ACCESS_TOKEN` = a new long random access code (at least 16 characters; use a password manager to generate one).
5. Save/deploy the Worker again if prompted. Your backend URL is the Worker URL, e.g. `https://ielts-grader-api.<your-subdomain>.workers.dev`.
6. In Cloudflare, add a rate-limiting rule for this Worker (recommended): limit POST requests to `/grade` per IP. Monitor Anthropic usage and set billing/spend limits where available.

The Worker checks the app access code, validates requests, calls the Anthropic Messages API, and returns parsed JSON. Do not put the Anthropic key into GitHub, HTML, or either client app.

## 2. Publish the iOS PWA with GitHub Pages

1. Create a GitHub repository (public is simplest for GitHub Pages).
2. Upload the **contents of this project folder** to the repository root. Keep `.github/workflows/` (GitHub may hide dot-folders in some file pickers; GitHub Desktop is convenient).
3. Commit to the `main` branch.
4. In repository **Settings → Pages**, choose **GitHub Actions** as the source.
5. Open **Actions** and wait for **Deploy iOS PWA to GitHub Pages** to complete successfully.
6. Open `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/` in Safari on your iPhone.
7. In Settings inside the app, enter the Cloudflare Worker URL and the `APP_ACCESS_TOKEN` value. Tap **Save connection**.
8. In Safari, tap **Share → Add to Home Screen** (enable **Open as Web App** if shown) → **Add**.

The PWA shell can be cached for offline opening. AI grading requires internet and the backend.

## 3. Build the Windows installer

On Windows 10/11, install Node.js 22 LTS. Either double-click `build-windows.bat`, or open PowerShell in this project folder and run:

```powershell
npm install
npm run dist:win
```

The installer is created in `dist/IELTS Speaking Auto-Grader Setup 2.0.0.exe`.

Alternatively, push a tag such as `v2.0.0` to GitHub or manually run **Actions → Build Windows installer → Run workflow**. Download the generated artifact from the completed workflow.

After installing, open the app, enter the same Cloudflare Worker URL and `APP_ACCESS_TOKEN`, and save the connection. The Windows app encrypts those settings using Electron safeStorage. The PWA stores the access code in its browser's local storage; it is not the Anthropic API key.

## 4. Security and privacy notes

- `ANTHROPIC_API_KEY` exists only as a Cloudflare Worker secret.
- `APP_ACCESS_TOKEN` is a client access code. Users who know it can use your Worker, so keep it private and rotate it if exposed.
- The Worker currently allows cross-origin requests so both GitHub Pages and the Electron app can connect. Authentication is performed by the app access code.
- Add Cloudflare rate limiting before sharing the PWA with students or the public. For broader public distribution, add per-user authentication and quotas rather than sharing one app code.
- Transcripts are sent to Anthropic only when the user presses **Grade my speech**. The app does not create a transcript database.
- The indicative band is a practice estimate, not an official IELTS score.

## Files

- `index.html` — shared assessment UI and six-category checklist
- `main.js`, `preload.js`, `package.json` — Windows Electron app
- `manifest.webmanifest`, `service-worker.js`, `assets/` — installable PWA
- `backend/worker.js` — secure shared Anthropic API backend
- `.github/workflows/` — GitHub Pages deployment and Windows installer build
