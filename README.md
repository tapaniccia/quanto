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


## Calendar reminders and optional background push

In-app reminders are active by default and update on opening, focus and every minute. Settings can optionally enable one system notification per local day while the app remains open; permission is requested only after a user action. Local preferences are per account and device.

Background push is prepared but intentionally disabled until `public/notifications` is provisioned by the sender. No service-account credential has been created and no sending schedule is enabled.

To activate later: deploy the owner-only notification rules in `firestore.rules`; configure GitHub Actions secrets `FIREBASE_SERVICE_ACCOUNT` (a dedicated credential for project `quanto-89274`), `VAPID_PUBLIC_KEY`, and `VAPID_PRIVATE_KEY`; run the **Calendar notifications** workflow manually; verify delivery on a consenting device; then enable its commented hourly schedule. Keep private keys and financial data out of the repository and logs. The sender's administrative credential can read Firestore data and must be restricted to the deployment maintainers. VAPID keys must remain stable across deployments.

Devices explicitly opt in, select a local summary hour and categories, and can hide amounts. Signing out disables this device's reminders for that account. The worker receives Web Push with the app closed; iOS requires adding the app to the Home Screen. Delivery is best effort, depends on browser support and connection, and GitHub schedules can be delayed or disabled after repository inactivity. Transactions lack a paid/unpaid state, so messages describe scheduled dates, not verified unpaid bills. Positive cycle closure uses the accumulated balance at the prior cycle boundary, includes fees and recurrence exceptions, and excludes other local members' private transactions.

No billing plan upgrade or paid Firebase feature is required for this public-repository scheduler. It is not a guaranteed-time alarm service.
