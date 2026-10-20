# Quanto — Finanzas familiares

Household finance app with Firebase Authentication (email/password) and Cloud Firestore.

## Cloud accounts

Create an account or sign in with email/password. Signing in on another device loads the same account. Data is stored under `users/{uid}/data/{key}` and protected by owner-only rules. Separate accounts do not share household records.

On first sign-in, an empty account can import the previous browser-local configuration, transactions and rates. Import from the browser holding the original data. The original browser copy is retained. Existing cloud data is never replaced by first-run import.

Writes use revision checks to reject conflicts with another session. Pending changes have a local draft copy specific to the signed-in account. If saving fails, the UI offers a download before loading the cloud version. The cloud status bar distinguishes saved, saving and failed states.

## Free plan

Firebase project: `quanto-89274`, Spark plan. Uses email/password authentication and the default Standard Firestore database. No billing account, Blaze upgrade, Cloud Functions, Cloud Storage or paid backup schedules are required. Free quotas apply; exhausted quotas produce a visible error instead of a paid upgrade. Hosting remains GitHub Pages.

The identifiers in `src/firebaseConfig.js` are public client configuration. Security is enforced by Authentication and the owner-only `firestore.rules`. Deploy these rules only to the Quanto Firebase project.

## Development and deployment

Run `npm ci`, `npm run dev` or `npm run build`. GitHub Actions deploys `dist/` from main to https://tapaniccia.github.io/quanto/.

## Finance controls

Duplicate and recurring transactions, custom categories/tags/beneficiaries/groups, payment methods and fees, custom calendar colors, and named exchange rates. Calendar includes weekdays, month navigation and opening/daily/projected closing balances. Settings controls pay-cycle start day. Comparison supports week, month, quarter and pay cycle. Historical transactions retain their saved exchange rate.
