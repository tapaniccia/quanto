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


## Interest-free debt, savings and adjustable budgets

The **Debts and goals** tab models outstanding balances, agreed installment amounts, actual next-due dates and user-defined day intervals, without interest. Cashea and international cards are available payment methods. Debt strategies always fund agreed installments before extra payments; unpaid amounts carry forward. The simulation begins next pay cycle, repeats confirmed income/expense/reserve assumptions, uses cents internally, and shows both the chart and cycle table. Planner data lives inside the existing private `finance-records` document. Saving a plan does not create transactions or change ledger debts; users update balances explicitly. A recorded liability can be copied into a plan without duplicating it in the ledger.

Budget settings now support income overrides, percentages or explicit amounts, fixed-expense detection (including scheduled recurring instances), an editable emergency-fund baseline and total target, and independent emergency/investment contributions. Blank override fields use displayed automatic values. Changes are saved explicitly, avoiding cloud writes on each keystroke. The planner can import the confirmed budget and reserve emergency/investment contributions first.

The calendar transaction form supports income, expense, savings, asset and debt. Savings is represented as an asset tagged `ahorro`; the new savings-goal category is compatible with existing records. Historical records retain their saved rate.

BCV references are fetched client-side from the documented public DolarVZLA endpoint `https://rates.dolarvzla.com/bcv/current.json` without credentials. An explicit save imports separate USD and EUR references; manual rates remain. If a future current snapshot is published and a previous applicable snapshot exists, the applicable one is displayed and saved. Only USD-quoted references can populate USD/Bs transaction conversions. EUR/USDT references are kept distinct; they are not silently treated as USD. The authenticated USDT API is not connected, and no API key or paid service is used.
