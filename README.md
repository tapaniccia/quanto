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

Separate **Debts** and **Goals** pages share a capacity simulation to avoid allocating the same money twice. Each page has a getting-started guide and contextual suggestions. The simulator models outstanding planner balances, agreed installments, next-due dates and user-defined day intervals without interest. Projection horizons include 1, 2, 3, 6, 12, 24, 36 and 60 pay cycles; these differ from installment frequency in days. Saving a plan does not register payments or savings in the calendar. Users explicitly update planner balances after actual payments or contributions. Charts show the current page's allocation; the shared cycle table explains combined capacity.

Budget settings support income overrides, percentages or explicit amounts, fixed-expense detection (including scheduled recurring instances), editable emergency targets, and independent emergency/investment contributions. Blank overrides use displayed automatic values. Changes save explicitly. The planner can import the saved budget.

## Household ledger convention

At the owner's explicit request, all calendar debt records (legacy type `pasivo` as well as expense category `deudas`) count as cash outflows, including fees. They are labelled Debt / installment, and are included once in expense totals across the calendar, dashboard, budget, historical comparison and local reminders. They do not represent outstanding balance-sheet liabilities. Outstanding commitments can be modeled separately in the planner, which never affects ledger totals.

Savings assets reduce available cash and increase recorded assets by the same amount. Net worth is available cash plus recorded assets; payments already reduce cash and are not subtracted again. Other asset entries describe additional holdings, not cash already entered as income or capital. Avoid duplicating opening bank/cash balances as both an asset and an income/capital entry. Capital contributions and withdrawals are ordinary cash flows with explicit categories; the calendar also shows their cumulative net amount. All dated prior months carry forward. Undated entries are excluded and future calendar dates are projections. These are household tracking conventions, not double-entry accounting.

## Dated exchange references

BCV USD/EUR history is fetched from the documented public DolarVZLA annual endpoint `https://rates.dolarvzla.com/bcv/{year}/list.json` without credentials. On opening Quanto in Venezuela mode, it automatically archives the current year and years of existing dated transactions in the private finance record. The transaction form also fetches its selected year and the preceding year. Requests are cached per local day during an app session, time out after 12 seconds and allow retries. Failed requests preserve stored history; manual references remain available.

Bolivar transactions select USD, EUR or USDT references by effective date: exact day if available, otherwise the latest publication on or before it, with the actual publication date shown. Future references are never used before their date. Selecting EUR/USDT displays both the chosen currency equivalent and USD; totals always use the separately stored applicable Bs/USD rate. Both reference and USD conversion snapshots are fixed on save, with their dates. Editing preserves snapshots until the user changes date/reference or explicitly recalculates. Manual overrides remain available. Existing transactions are never repriced by a history refresh. Recurring projections retain their saved series rate until edited.

USDT history is not connected because the provider requires an API key. Saved dated USDT references or an explicit manual reference can be used; a dated USD rate is also needed for totals. No API key, credential or paid service was created. The Rates page filters the archived history by date and currency and retains existing manual editing.

## Cashea purchase schedules

Selecting Cashea on a new expense/debt transaction opens purchase-total (USD), down-payment percent or amount, 1–12 remaining installments, day interval, and optional first-due-date controls. A preview shows every dated payment before saving. Zero down creates no initial payment. Cent allocation conserves the exact purchase total, and a single finance-record write creates the finite set of independent transactions; no full-purchase duplicate or indefinite recurrence is added. Installments carry a plan id, original due date and purchase metadata, and are fixed expenses for budget calculations. Existing Cashea records stay unchanged. Editing one generated payment never regenerates its siblings; duplicating creates only one standalone transaction.

Obligations remain denominated in USD. Unpaid payments show indicative Bs using the latest available dated USD reference on or before the earlier of today and the due date. Future Bs amounts are marked estimates, and unavailable rates remain visibly pending. A user can record an already-made payment with its actual date and applicable USD rate or a manual actual rate. Its Bs amount/rate/date are snapshotted, never automatically repriced. The ledger transaction moves to the actual payment date (including early/late payments) while retaining the original due date. Settled payments are rescheduled only through editing their payment record, not calendar drag. Recording a payment never transfers money. Purchase-plan settings and sample Cashea terms are user inputs, not claims about provider policy.


Receipt images use owner-only `users/{uid}/receipts/{id}` Firestore documents, at most200KB compressed JPEG. They are lazy-loaded only when requested. Transaction rows contain a receipt id, never image bytes. Spark remains required; no Cloud Storage bucket or Blaze upgrade. `firestore.rules` matches deployed data+receipt policies. Optional future notification rule matches remain in `firestore.notifications-prepared.rules`; merge and review those separately before any later push activation. Unlinking one installment does not delete an image shared with other installments; full account removal must include the receipts subcollection.
