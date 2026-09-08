# Online Solar Panel discovery

The existing Search Panels button opens the same modal directly to online discovery.
The modal has no database controls. Exact verified online matches can emit the
original Firestore panel through the existing selection event. The main page's
inline Firestore panel search, loading, selection and persistence remain intact.
No calculator formulas, Firestore schema, or other equipment code is changed.

## Files and packages

Changed: `src/components/modals/PanelSearchModal.vue`,
`src/components/steps/PanelSizing.vue` (modal wiring only), `firebase.json`,
`vite.config.js`.

Created: `src/components/modals/OnlinePanelSearch.vue`,
`src/services/onlinePanels.js`, `functions/index.js`,
`functions/solarSearch.js`, `functions/solarSearch.test.js`,
`functions/package.json`, `functions/package-lock.json`,
`functions/.gitignore`, and this guide.

Backend dependencies only: `firebase-functions` and its `firebase-admin` peer.
No frontend dependencies, SerpApi SDK, or Axios are needed. Node's built-in fetch
calls SerpApi. The function runtime is Node.js 22.

## Request and normalization

Browser GET `/api/solar-panels?q=...` -> Firebase Hosting rewrite -> second-generation
HTTPS function `onlineSolarPanels` in `asia-east1` -> SerpApi.

The server accepts 3 meaningful letters/numbers up to 120 total characters,
collapses whitespace, lowercases the query and appends ` solar panel`.
It calls `https://serpapi.com/search.json` with:

- `engine=google_shopping`
- `q=<normalized user query> solar panel`
- `gl=ph` (Philippines)
- `hl=en` (English)
- `api_key=<server secret>`

There is no automatic international fallback or pagination, and `no_cache` is not
enabled. Only `shopping_results` are used, screened, deduplicated and capped at 12.

Normalization uses actual provider values: product_id -> externalId;
title -> title; brand -> brand when explicitly present; thumbnail -> image;
price -> priceText; extracted_price -> priceValue; currency -> currency when
explicitly present; source -> seller; rating/reviews -> rating/reviews;
product_link (or link) -> productUrl. A URL or title/source pair supplies an ID
only when product_id is absent. Missing values stay null. Numeric strings are
not converted. Currency is not inferred from a symbol or Philippine targeting.

The backend's six electrical fields remain null and specificationsVerified is false,
even if the title contains wattage. The frontend may verify a listing against the
already loaded Firestore panels as described below. Images and links accept only HTTP(S) URLs
without embedded credentials. Links use a new tab with noopener/noreferrer.
Google may return a Google Shopping page rather than a direct merchant URL.

Titles must explicitly identify a solar panel/module, PV panel/module, or
photovoltaic panel/module. Titles mentioning batteries, inverters, controllers,
generators, power stations, mounting hardware, cables, connectors, chargers,
lights, accessories, kits, bundles, adapters, stands, clamps or rails are rejected.
This intentionally rejects some legitimate panels and is not perfect classification.
It does not certify seller authenticity, specifications, availability or shipping.

## Quota and failure isolation

- Search is submitted by button or Enter, never on typing or tab switching.
- Frontend caches up to 30 successful searches (including empty results) in memory
  for this page session; concurrent identical requests share one promise.
- Each warm function instance caches up to 30 searches for 15 minutes and shares
  simultaneous identical searches. Failed requests are not cached.
- An instance admits at most 5 uncached provider requests/minute; maxInstances is 1.
- Provider timeout: 20 seconds; browser timeout: 25 seconds; function timeout: 30 seconds.
- Provider error details, credentials and request URLs are never logged or returned.
- Unverified online results cannot change calculator selection or storage.

The endpoint is public because this application has no user authentication flow.
These in-memory limits are not a durable monthly budget or complete abuse protection;
restarts/instance replacement reset them. A public launch should add App Check or
another appropriate abuse control and monitor the provider's quota. CORS alone is
not authentication. No persistent cache or new Firestore collection is introduced.

## Local setup (PowerShell)

Use Node.js 22 and run these commands from the project directory:

```powershell
Set-Location 'D:\CODE\Solar Energy Calculation\solar-calculator'
npm ci
npm ci --prefix functions
npm install -g firebase-tools
```

If Firebase CLI is already installed, the last command is optional.
Do not run `firebase init`; the required configuration is already present.

Create `functions/.secret.local` locally in your editor with this line, replacing
the placeholder with your own SerpApi key:

```dotenv
SERPAPI_KEY=YOUR_SERPAPI_KEY
```

This file is ignored by Git and Functions uploads. Never put this value in Vue,
a VITE_* variable, a command-line argument, a screenshot, or a committed file.
Firebase's emulator uses this local override instead of the production secret.
Local valid searches still call real SerpApi and consume quota unless cached.

Terminal 1:

```powershell
npm run build
firebase emulators:start --only functions,hosting --project solar-calculator-rjb2026-cb70e
```

Terminal 2, from the same project directory:

```powershell
npm run dev
```

Open the URL Vite prints. Its `/api/solar-panels` proxy points to the Hosting
emulator at 127.0.0.1:5000, which rewrites to the Functions emulator on port 5001.
Alternatively open http://127.0.0.1:5000 to test the built frontend.
Only Functions and Hosting are emulated; the main page's inline panel search continues to
read the configured real Firestore collection, just as before.

To call the backend through Hosting directly:

```powershell
Invoke-RestMethod 'http://127.0.0.1:5000/api/solar-panels?q=Jinko%20550W'
```

To run deterministic tests without a key or external requests:

```powershell
npm test --prefix functions
```

## Manual verification

1. Use the main page's existing inline Firestore search to select a panel. Note
   calculator values. Open Search Panels: online search should appear immediately
   with no source buttons or database filters.
2. Fewer than three meaningful characters must produce validation
   feedback without a request. Typing alone must not request anything.
3. Submit Jinko Tiger Neo 550W using Enter and then the Search button. Inspect
   cards, links, error/empty/loading states and mobile scrolling.
4. Repeat the same query with different casing/spacing: no new browser request
   should occur in the same page session after a successful response.
5. Confirm unmatched/ambiguous cards have the incomplete-specifications notice and
   no Select action. A verified card must show all six Firestore specifications.
   SELECT PANEL must select the trusted record and close the modal. VIEW PRODUCT
   must not change calculator values.
6. Stop the emulator and search for a new, uncached query: only ONLINE should show
   an error. The main page's inline search must still work and its selected panel must remain intact.
7. Close and reopen the modal: it must return to the online idle state.
8. Inspect the browser Network panel: requests must target your own `/api` endpoint;
   no SerpApi key should occur in the response or frontend assets.

## Production setup and manual deployment

Nothing has been deployed automatically. Firebase Functions deployment requires
the Blaze billing plan, even when SerpApi usage is free. Firebase compute, builds,
artifact storage and Secret Manager have separate allowances/costs. If no billing
account is acceptable, use the local emulator for the capstone demo instead.

After choosing to enable billing and deploy, log in and create the secret using
the interactive prompt (do not append the key to the command):

```powershell
firebase login
firebase functions:secrets:set SERPAPI_KEY --project solar-calculator-rjb2026-cb70e
```

Then build, test and deploy only this function and Hosting:

```powershell
npm test --prefix functions
npm run build
firebase deploy --only "functions:onlineSolarPanels" --project solar-calculator-rjb2026-cb70e
firebase deploy --only hosting --project solar-calculator-rjb2026-cb70e
```

Run the same secret-setting command and redeploy the function when rotating the key.
The production secret is defined with defineSecret and bound only to this function.
No Firebase server credential files are needed; deployed Functions use their managed
runtime identity. The existing Hosting PR workflow does not deploy Functions, so
deploy the backend manually before expecting ONLINE to work on hosted previews.

References:
- https://firebase.google.com/docs/functions/config-env
- https://firebase.google.com/docs/hosting/functions
- https://serpapi.com/google-shopping-api

Live product quality and actual key/production configuration must be verified with
your account. Philippine targeting is not a guarantee of Philippine stock/delivery.

## Verification against trusted Firestore panels

`src/utils/verifiedOnlinePanel.js` matches online listings against the array already
loaded by PanelSizing. It makes no requests and does not modify the session cache.
Case, whitespace, hyphens and punctuation are normalized; decimal distinctions are
preserved. Generic panel/module wording is ignored. The remaining entire title
must equal the full stored brand/model, optionally followed by the stored wattage.
An explicit listing brand must agree. Brand plus watts alone is never sufficient.
Family names require explicit wattage; full model identifiers containing digits
can match without separate wattage text. Explicit title wattage must agree with
the stored wattage; it is never used to populate a technical field.

More than one identity candidate is rejected, even if a duplicate has invalid
specifications. A single match must have an ID and six finite positive numbers.
Additional variant/marketing wording is not removed and may prevent a match.
There are no fuzzy comparisons or brand aliases. These checks verify correspondence
to the trusted catalog, not the physical product or merchant's claims.

Verified view models keep listing metadata and a reference to the trusted panel
separate. Their six technical values come exclusively from that record. Selection
revalidates against current props, emits only that original panel, and flows through
PanelSearchModal to PanelSizing.selectPanel. The existing persistence stores the
trusted selection; shopping prices, sellers and URLs are displayed/session-cached
only, not added to calculator storage. Loading or failed Firestore data blocks
verification but does not block online discovery.

Run verification tests with:

```powershell
node --test tests/verifiedOnlinePanel.test.js
```

The live collection could not be inspected from the implementation environment
(Firestore returned PERMISSION_DENIED). Tests cover the application's expected
record schema with representative fixtures; check actual brand/model conventions
with the records loaded in your browser.
