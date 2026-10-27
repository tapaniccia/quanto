import React, { useState, useEffect, useMemo, useCallback, useContext, createContext, useRef } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, Landmark, CreditCard, ShieldCheck,
  Home, Car, Utensils, HeartPulse, GraduationCap, Film, Coins, Dog,
  ArrowRightLeft, Users, Lock, Globe, Settings as SettingsIcon, Plus, X,
  Check, Info, Calendar, LogOut, UserPlus, Banknote, Building2, Briefcase,
  Eye, EyeOff, Sparkles, Trash2, PiggyBank, KeyRound, LayoutGrid, Receipt,
  Scale, Pencil, Sun, Moon, Target,
} from "lucide-react";
import { ExtraFields, Comparison, Planning, CycleSettings, CustomRates, isDebtOrCashea } from "./Planning.jsx";
import { expandTransactions, transactionValue, periodBounds, inPeriod, availableBalance, iso, isExpense, positionSummary, spendingCategory, budgetBucket } from "./finance.js";
import quantoLogo from "./assets/quanto.png";
import {casheaSchedule} from "./cashea.js";
import {CasheaFields,CasheaAmount,CasheaSettlement} from "./CasheaFields.jsx";
import DebtPlanner from "./DebtPlanner.jsx";
import BudgetPlanner from "./BudgetPlanner.jsx";
import TransactionRate, {RateHistorySync} from "./TransactionRate.jsx";
import {mergeRateHistory} from "./exchangeRates.js";
import {isUsdRate} from "./exchangeRates.js";
import {usePreference} from "./preferences.js";
import Notifications, {LocalReminders} from "./Notifications.jsx";
import "./refinements.css";
import LabelSpending from './LabelSpending.jsx';
import MobileNav from './MobileNav.jsx';
import {chartCategory} from './labelSpending.js';
import TransactionClassification from "./TransactionClassification.jsx";
import {labelCategory,personalLabelCatalog,updateClassification} from "./classification.js";

/* ---------------------------------------------------------------------- */
/*  Design tokens (dark + light)                                           */
/* ---------------------------------------------------------------------- */
const BRAND_GOLD = "#B18F32";
const BRAND_GREEN = "#0F7C42";
const BRAND_GRAD = BRAND_GREEN;

const DARK = {
  bg: "#0A0B09",
  bgSoft: "#101813",
  card: "#141D19",
  card2: "#20332A",
  border: "rgba(255,255,255,0.09)",
  gold: "#D8A93F",
  goldSoft: "#EBCB7A",
  teal: "#22B573",
  red: "#E2665A",
  violet: "#6B8896",
  text: "#F5F5F0",
  muted: "#A7B9AC",
  grad: BRAND_GRAD,
};
const LIGHT = {
  bg: "#F4F3ED",
  bgSoft: "#FFFFFF",
  card: "#FFFFFF",
  card2: "rgba(20,18,10,0.055)",
  border: "rgba(20,18,10,0.10)",
  gold: "#8A6A1E",
  goldSoft: "#6E5416",
  teal: "#0E7C42",
  red: "#C2453A",
  violet: "#4C6672",
  text: "#17180F",
  muted: "#6E6C5A",
  grad: BRAND_GRAD,
};

const ThemeContext = createContext(null);
const useThemeCtx = () => useContext(ThemeContext);
const useC = () => useContext(ThemeContext).C;

const FONT_LINK_ID = "ff-import";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("style");
    link.id = FONT_LINK_ID;
    link.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
      ::selection{background:#0F7C4255;}
      input[type=range]{ accent-color: #0F7C42; }
      input[type=checkbox]{ accent-color: #0F7C42; width:16px; height:16px; }
      ::-webkit-scrollbar{ width:8px; height:8px; }
      ::-webkit-scrollbar-thumb{ background:rgba(255,255,255,0.12); border-radius:8px; }
      input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible {
        outline: 2px solid #0F7C42 !important; outline-offset: 2px;
      }
      @keyframes toastIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
    `;
    document.head.appendChild(link);
  }, []);
}

const display = { fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const body = { fontFamily: "'Inter', sans-serif" };

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const todayISO = () => iso(new Date());

/* ---------------------------------------------------------------------- */
/*  Copy                                                                    */
/* ---------------------------------------------------------------------- */
const STR = {
  es: {
    tagline: "El libro diario de casa",
    createHousehold: "Crear el hogar",
    joinHousehold: "Entrar al hogar",
    inviteCode: "Código de invitación",
    inviteCodeHelp: "Inventa un código y compártelo solo con tu pareja.",
    yourName: "Tu nombre",
    createBtn: "Crear hogar y entrar",
    enterCode: "Ingresa el código de invitación",
    wrongCode: "Ese código no coincide con el de este hogar.",
    continueBtn: "Continuar",
    whoAreYou: "¿Quién eres?",
    newMember: "+ Nuevo integrante",
    addMember: "Añadir integrante",
    memberName: "Nombre",
    chooseEmoji: "Elige un emoji para tu perfil",
    enterBtn: "Entrar",
    back: "Atrás",
    authNote: "Este prototipo usa un código de invitación como acceso simple — no es un inicio de sesión real de Google (eso requiere un servidor propio). Funciona igual de bien para uso familiar: solo quien tenga el código entra.",
    overview: "Resumen",
    transactions: "Movimientos",
    budget: "Presupuesto",
    rates: "Tasas Bs/USD",
    settings: "Ajustes",
    logout: "Cerrar sesión",
    income: "Ingresos",
    expenses: "Egresos",
    assets: "Activos",
    liabilities: "Deudas / cuotas",
    netWorth: "Patrimonio neto",
    thisMonth: "este mes",
    total: "total",
    addMovement: "Añadir movimiento",
    all: "Todos",
    date: "Fecha",
    description: "Descripción",
    category: "Categoría",
    amount: "Monto",
    owner: "Responsable",
    private: "Privado",
    privateHelp: "Solo tú puedes ver este movimiento. Lo demás se comparte con tu pareja.",
    currency: "Moneda",
    rateUsed: "Tasa usada",
    save: "Guardar",
    cancel: "Cancelar",
    noTx: "Todavía no hay movimientos aquí.",
    delete: "Eliminar",
    expensesByCategory: "Egresos por categoría (mes actual)",
    monthlyTrend: "Ingresos vs. egresos (últimos 6 meses)",
    budgetRule: "Regla de presupuesto",
    needs: "Necesidades",
    wants: "Gustos",
    savings: "Ahorro",
    needsHelp: "Gastos esenciales: vivienda, comida, salud, transporte, deudas.",
    wantsHelp: "Gastos flexibles: entretenimiento y otros no esenciales.",
    savingsHelp: "Lo que apartas para el futuro: fondo de emergencia e inversión.",
    emergencyMonths: "Meses de colchón",
    emergencyMonthsHelp: "Cuántos meses de tus egresos quieres cubiertos por el fondo de emergencia (recomendado 3 a 6).",
    recommendedFor: "Recomendación según tu ingreso mensual",
    monthlyIncome: "Ingreso mensual",
    recommended: "recomendado",
    actual: "actual",
    emergencyFund: "Fondo de emergencia",
    emergencyProgress: "de la meta cubierto",
    investmentSuggestion: "Sugerencia de inversión",
    investHelpFull: "Tu fondo de emergencia ya está completo: puedes destinar todo tu ahorro mensual a inversión.",
    investHelpPartial: "Aún estás llenando el fondo de emergencia: prioriza esto antes de invertir agresivamente.",
    spendingGuideline: "Guía de gasto mensual",
    exchangeRates: "Historial de tasas Bs/USD",
    exchangeRatesHelp: "Registra la tasa (BCV u otra) para cada fecha. Al anotar un gasto en bolívares, se usa la tasa más cercana a esa fecha para calcular su valor en dólares — así tu libro diario queda fiel a como gastaste en su momento.",
    addRate: "Añadir tasa",
    rateDate: "Fecha",
    rateValue: "Bs por USD",
    noRates: "Aún no has registrado tasas.",
    householdCurrency: "Moneda del hogar",
    currencySymbol: "Símbolo",
    currencyCode: "Código",
    venezuelaMode: "Modo Venezuela (USD + Bs)",
    venezuelaModeHelp: "Muestra todos los montos en dólares y en bolívares, usando la tasa histórica de cada movimiento.",
    members: "Integrantes",
    inviteCodeLabel: "Código de invitación del hogar",
    show: "Mostrar",
    hide: "Ocultar",
    language: "Idioma",
    resetBudget: "Restablecer a 50/30/20",
    percentTotal: "Suma de porcentajes",
    mustSum100: "Deben sumar 100%.",
    today: "hoy",
    latestRate: "Tasa más reciente",
    bsEquivalentNote: "Equivalente en Bs de hoy (referencia)",
    close: "Cerrar",
    editEntry: "Editar movimiento",
    edit: "Editar",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    myProfile: "Mi perfil",
    type: "Tipo",
    selectCategory: "Selecciona categoría",
    amountInCurrency: "Monto",
    optionalNote: "Nota opcional",
    tagLabel: "Etiqueta de presupuesto",
    noTag: "Sin etiqueta",
    incomeTip: "Dinero que entra: salario, negocio, inversiones u otros.",
    expenseTip: "Dinero que sale: todo lo que gastas.",
    assetTip: "Lo que posees: efectivo, cuentas, inversiones y bienes.",
    liabilityTip: "Deudas registradas como egresos; ya están incluidas en gastos.",
    netWorthTip: "Disponible más activos registrados. Las deudas/cuotas ya se restaron como egresos. No dupliques saldos entre activos e ingresos/capital.",
    heroSub: "Un solo lugar para ver de dónde viene tu dinero y a dónde va.",
    confirmDeleteTx: "¿Eliminar este movimiento? No se puede deshacer.",
    confirmDeleteRate: "¿Eliminar esta tasa? No se puede deshacer.",
    yesDelete: "Sí, eliminar",
    txSaved: "Movimiento guardado.",
    txDeleted: "Movimiento eliminado.",
    rateSaved: "Tasa añadida.",
    rateDeleted: "Tasa eliminada.",
    noTxHint: "Usa \"Añadir movimiento\" para registrar el primero.",
    noRatesHint: "Registra una tasa con la fecha y el valor de arriba.",
    editEntryTitle: "Editar",
    deleteEntry: "Eliminar movimiento",
    editEntryAction: "Editar movimiento",
    themeToggle: "Cambiar tema",
    langToggle: "Cambiar idioma",
    closeDialog: "Cerrar",
  },
  en: {
    tagline: "The household ledger",
    createHousehold: "Create your household",
    joinHousehold: "Join a household",
    inviteCode: "Invite code",
    inviteCodeHelp: "Make up a code and share it only with your partner.",
    yourName: "Your name",
    createBtn: "Create household & enter",
    enterCode: "Enter the invite code",
    wrongCode: "That code doesn't match this household.",
    continueBtn: "Continue",
    whoAreYou: "Who are you?",
    newMember: "+ New member",
    addMember: "Add member",
    memberName: "Name",
    chooseEmoji: "Pick a profile emoji",
    enterBtn: "Enter",
    back: "Back",
    authNote: "This prototype uses an invite code as lightweight access — it isn't real Google sign-in (that needs its own backend). It works just as well for household use: only someone with the code gets in.",
    overview: "Overview",
    transactions: "Transactions",
    budget: "Budget",
    rates: "Bs/USD rates",
    settings: "Settings",
    logout: "Sign out",
    income: "Income",
    expenses: "Expenses",
    assets: "Assets",
    liabilities: "Debt / installments",
    netWorth: "Net worth",
    thisMonth: "this month",
    total: "total",
    addMovement: "Add entry",
    all: "All",
    date: "Date",
    description: "Description",
    category: "Category",
    amount: "Amount",
    owner: "By",
    private: "Private",
    privateHelp: "Only you can see this entry. Everything else is shared with your partner.",
    currency: "Currency",
    rateUsed: "Rate used",
    save: "Save",
    cancel: "Cancel",
    noTx: "No entries here yet.",
    delete: "Delete",
    expensesByCategory: "Expenses by category (current month)",
    monthlyTrend: "Income vs. expenses (last 6 months)",
    budgetRule: "Budget rule",
    needs: "Needs",
    wants: "Wants",
    savings: "Savings",
    needsHelp: "Essential spending: housing, food, health, transport, debt.",
    wantsHelp: "Flexible spending: entertainment and other non-essentials.",
    savingsHelp: "What you set aside for the future: emergency fund and investing.",
    emergencyMonths: "Months of cushion",
    emergencyMonthsHelp: "How many months of expenses you want your emergency fund to cover (3–6 is typical).",
    recommendedFor: "Recommendation based on your monthly income",
    monthlyIncome: "Monthly income",
    recommended: "recommended",
    actual: "actual",
    emergencyFund: "Emergency fund",
    emergencyProgress: "of goal covered",
    investmentSuggestion: "Investment suggestion",
    investHelpFull: "Your emergency fund is fully funded: you can put your whole monthly savings toward investing.",
    investHelpPartial: "You're still filling your emergency fund: prioritize that before investing aggressively.",
    spendingGuideline: "Monthly spending guide",
    exchangeRates: "Bs/USD rate history",
    exchangeRatesHelp: "Log the exchange rate (BCV or other) for each date. When you log an expense in bolívares, the closest rate to that date is used to figure its dollar value — keeping your ledger true to what things cost that day.",
    addRate: "Add rate",
    rateDate: "Date",
    rateValue: "Bs per USD",
    noRates: "No rates logged yet.",
    householdCurrency: "Household currency",
    currencySymbol: "Symbol",
    currencyCode: "Code",
    venezuelaMode: "Venezuela mode (USD + Bs)",
    venezuelaModeHelp: "Shows every amount in both dollars and bolívares, using each entry's historical rate.",
    members: "Members",
    inviteCodeLabel: "Household invite code",
    show: "Show",
    hide: "Hide",
    language: "Language",
    resetBudget: "Reset to 50/30/20",
    percentTotal: "Percentage total",
    mustSum100: "Must add up to 100%.",
    today: "today",
    latestRate: "Latest rate",
    bsEquivalentNote: "Today's Bs equivalent (reference only)",
    close: "Close",
    editEntry: "Edit entry",
    edit: "Edit",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    myProfile: "My profile",
    type: "Type",
    selectCategory: "Select category",
    amountInCurrency: "Amount",
    optionalNote: "Optional note",
    tagLabel: "Budget tag",
    noTag: "No tag",
    incomeTip: "Money coming in: salary, business, investments, or other.",
    expenseTip: "Money going out: everything you spend.",
    assetTip: "What you own: cash, accounts, investments, and property.",
    liabilityTip: "Debt entries recorded as outflows; already included in expenses.",
    netWorthTip: "Available cash plus recorded assets. Debt installments already reduce cash. Do not duplicate assets and income/capital balances.",
    heroSub: "One place to see, together, where the money comes from and where it goes.",
    confirmDeleteTx: "Delete this entry? This can't be undone.",
    confirmDeleteRate: "Delete this rate? This can't be undone.",
    yesDelete: "Yes, delete",
    txSaved: "Entry saved.",
    txDeleted: "Entry deleted.",
    rateSaved: "Rate added.",
    rateDeleted: "Rate deleted.",
    noTxHint: "Use \"Add entry\" to log the first one.",
    noRatesHint: "Log a rate with the date and value above.",
    editEntryTitle: "Edit",
    deleteEntry: "Delete entry",
    editEntryAction: "Edit entry",
    themeToggle: "Toggle theme",
    langToggle: "Switch language",
    closeDialog: "Close",
  },
};

/* ---------------------------------------------------------------------- */
/*  Categories                                                             */
/* ---------------------------------------------------------------------- */
const CATS = {
  ingreso: [
    { id: "salario", icon: Briefcase, es: "Salario", en: "Salary", tipEs: "Pago fijo de tu empleo.", tipEn: "Fixed pay from your job." },
    { id: "negocio", icon: TrendingUp, es: "Freelance / Negocio", en: "Freelance / Business", tipEs: "Ingresos variables de tu propio trabajo o negocio.", tipEn: "Variable income from your own work or business." },
    { id: "inv_ingreso", icon: PiggyBank, es: "Rendimiento de inversión", en: "Investment returns", tipEs: "Dividendos, intereses o ganancias de tus inversiones.", tipEn: "Dividends, interest, or gains from your investments." },
    { id: "otro_ingreso", icon: Coins, es: "Otro ingreso", en: "Other income", tipEs: "Cualquier otro dinero que entra.", tipEn: "Any other money coming in." },
    { id: "aporte_capital", icon: Landmark, es: "Aporte de capital", en: "Capital contribution", tipEs: "Dinero propio previo que incorporas al saldo. No vuelvas a registrarlo como activo.", tipEn: "Existing own money added to your balance. Do not record it again as an asset." },
  ],
  egreso: [
    { id: "vivienda", icon: Home, es: "Vivienda", en: "Housing", tipEs: "Alquiler, cuota, servicios, mantenimiento.", tipEn: "Rent, mortgage payment, utilities, upkeep." },
    { id: "alimentacion", icon: Utensils, es: "Mercado", en: "Groceries", tipEs: "Compras de víveres, carnes, verduras y otros productos del mercado.", tipEn: "Groceries, meat, vegetables and other market purchases." },
    { id: "transporte", icon: Car, es: "Transporte", en: "Transportation", tipEs: "Gasolina, transporte público, mantenimiento del vehículo.", tipEn: "Gas, public transit, vehicle upkeep." },
    { id: "vehiculo", icon: Car, es: "Vehículo", en: "Vehicle", tipEs: "Compra, repuestos, reparaciones y accesorios del vehículo.", tipEn: "Vehicle purchase, parts, repairs and accessories." },
    { id: "salud", icon: HeartPulse, es: "Salud", en: "Health", tipEs: "Médicos, medicinas, seguro de salud.", tipEn: "Doctors, medicine, health insurance." },
    { id: "educacion", icon: GraduationCap, es: "Educación", en: "Education", tipEs: "Colegiaturas, cursos, materiales.", tipEn: "Tuition, courses, materials." },
    { id: "entretenimiento", icon: Film, es: "Entretenimiento", en: "Entertainment", tipEs: "Salidas, streaming, hobbies.", tipEn: "Outings, streaming, hobbies." },
    { id: "deudas", icon: CreditCard, es: "Pago de deudas", en: "Debt payments", tipEs: "Abonos a tarjetas o préstamos.", tipEn: "Payments toward cards or loans." },
    { id: "dogs", icon: Dog, es: "Dogs", en: "Dogs", tipEs: "Alimento, veterinario, cuidados y otros gastos de tus perros.", tipEn: "Food, vet visits, care and other expenses for your dogs." },
    { id: "business", icon: Briefcase, es: "Business", en: "Business", tipEs: "Herramientas, servicios y otros gastos de tu negocio.", tipEn: "Tools, services and other business expenses." },
    { id: "otro_egreso", icon: Banknote, es: "Otro egreso", en: "Other expense", tipEs: "Cualquier otro gasto.", tipEn: "Any other spending." },
    { id: "retiro_capital", icon: Landmark, es: "Retiro de capital", en: "Capital withdrawal", tipEs: "Dinero que retiras de este registro.", tipEn: "Money withdrawn from this ledger." },
  ],
  activo: [
    { id: "efectivo", icon: Wallet, es: "Efectivo", en: "Cash", tipEs: "Dinero físico o en cuentas de uso diario.", tipEn: "Physical cash or everyday spending accounts." },
    { id: "cuenta_bancaria", icon: Landmark, es: "Cuenta bancaria", en: "Bank account", tipEs: "Saldos en cuentas de ahorro o corriente.", tipEn: "Balances in savings or checking accounts." },
    { id: "ahorro_general", icon: PiggyBank, es: "Ahorro para una meta", en: "Savings goal", tipEs: "Dinero apartado para una meta.", tipEn: "Money set aside for a goal." },
    { id: "fondo_emergencia", icon: ShieldCheck, es: "Fondo de emergencia", en: "Emergency fund", tipEs: "Dinero apartado solo para imprevistos.", tipEn: "Money set aside only for emergencies." },
    { id: "inversion", icon: TrendingUp, es: "Inversiones", en: "Investments", tipEs: "Acciones, fondos, cripto, negocios propios.", tipEn: "Stocks, funds, crypto, your own ventures." },
    { id: "bienes", icon: Building2, es: "Bienes (propiedad / vehículo)", en: "Property / vehicles", tipEs: "Valor de propiedades o vehículos que posees.", tipEn: "Value of property or vehicles you own." },
    { id: "otro_activo", icon: Coins, es: "Otro activo", en: "Other asset", tipEs: "Cualquier otra cosa de valor que posees.", tipEn: "Anything else of value you own." },
  ],
  pasivo: [
    { id: "cashea", icon: Receipt, es: "Cashea", en: "Cashea", tipEs: "Pago de una compra en cuotas; se incluye en egresos.", tipEn: "Installment purchase payment; included in outflows." },
    { id: "tarjeta", icon: CreditCard, es: "Tarjeta de crédito", en: "Credit card", tipEs: "Pago o cuota de una tarjeta.", tipEn: "Card payment or installment." },
    { id: "prestamo", icon: Banknote, es: "Préstamo", en: "Loan", tipEs: "Pago de un préstamo personal o de estudio.", tipEn: "Personal or student loan payment." },
    { id: "hipoteca", icon: Home, es: "Hipoteca", en: "Mortgage", tipEs: "Pago o cuota de tu vivienda.", tipEn: "Home loan payment or installment." },
    { id: "otro_pasivo", icon: Coins, es: "Otro pasivo", en: "Other liability", tipEs: "Pago de otro compromiso; se incluye en egresos.", tipEn: "Payment of another commitment; included in outflows." },
  ],
};
const typeMeta = (C) => ({
  ingreso: { icon: TrendingUp, color: C.teal },
  egreso: { icon: TrendingDown, color: C.red },
  activo: { icon: Landmark, color: C.gold },
  pasivo: { icon: Scale, color: C.bg===DARK.bg?'#facc15':'#987400' },
});
const NEEDS_CATS = ["vehiculo","vivienda", "alimentacion", "salud", "transporte", "deudas"];
const SAVINGS_CATS = ["fondo_emergencia", "inversion", "ahorro_general"];
const MEMBER_COLORS = ["#B18F32", "#0F7C42", "#6B8896", "#C2453A", "#8A6A1E"];
const EMOJI_OPTIONS = ["🙂", "😎", "🤓", "🥳", "🦊", "🐼", "🐱", "🐶", "🦄", "🐸", "🌟", "🚀", "🌈", "🍀", "🥑", "🦁", "👩", "🧑", "👨", "🐧"];

// Budget tags: every egreso/activo entry can be tagged Necesidad / Gusto / Ahorro
const TAG_INFO = {
  necesidad: { labelKey: "needs", tipKey: "needsHelp" },
  gusto: { labelKey: "wants", tipKey: "wantsHelp" },
  ahorro: { labelKey: "savings", tipKey: "savingsHelp" },
};
const TAG_ORDER = ["necesidad", "gusto", "ahorro"];
const tagMeta = (C) => ({
  necesidad: { color: C.red },
  gusto: { color: C.gold },
  ahorro: { color: C.teal },
});
function suggestTag(type, catId) {
  if (type === "egreso" || type === "pasivo") return NEEDS_CATS.includes(catId) ? "necesidad" : "gusto";
  if (type === "activo") return SAVINGS_CATS.includes(catId) ? "ahorro" : null;
  return null;
}
function effTag(tx) {
  return tx.tag || ({needs:'necesidad',wants:'gusto',savings:'ahorro'}[budgetBucket(tx)]||null);
}

/* ---------------------------------------------------------------------- */
/*  Small shared UI bits                                                    */
/* ---------------------------------------------------------------------- */
function InfoTip({ text }) {
  const C = useC();
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex align-middle ml-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => { e.stopPropagation(); setShow((s) => !s); }}
    >
      <Info size={13} style={{ color: C.muted, cursor: "help" }} />
      {show && (
        <div
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-5 w-56 text-xs leading-snug p-2.5 rounded-lg shadow-xl"
          style={{ background: "#15170F", color: "#F5F5F0", border: "1px solid rgba(255,255,255,0.12)", ...body }}
        >
          {text}
        </div>
      )}
    </span>
  );
}

function Card({ children, style, tone, className = "" }) {
  const C = useC();
  return (
    <div
      data-tone={tone} className={`quanto-card rounded-[24px] p-6 ${className}`}
      style={{
        background: tone ? `var(--tone-${tone},${C.card})` : C.card,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", className = "", type = "button", disabled, ...rest }) {
  const C = useC();
  const styles = {
    primary: { background: C.grad, color: "#fff", boxShadow: "0 6px 20px -6px rgba(15,124,66,0.5)" },
    ghost: { background: C.card2, color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.red, border: `1px solid ${C.red}55` },
    dangerSolid: { background: "#C2453A", color: "#fff" },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:shadow-none ${className}`}
      style={{ ...styles[variant], ...body }}
      {...rest}
    >
      {children}
    </button>
  );
}

function Avatar({ m, size = 28, fontScale = 0.55 }) {
  if (!m) return null;
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: `${m.color}22`, border: `1.5px solid ${m.color}`, fontSize: size * fontScale, lineHeight: 1 }}
    >
      {m.emoji ? m.emoji : <span style={{ color: m.color, fontWeight: 700, fontSize: size * 0.42 }}>{m.name?.[0]?.toUpperCase()}</span>}
    </div>
  );
}

function EmojiPicker({ value, onChange }) {
  const C = useC();
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: C.card2, border: `1px solid ${C.border}` }}>
          {value || "🙂"}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.slice(-2))}
          placeholder="🙂"
          className="w-16 px-2 py-2 rounded-xl text-center text-lg outline-none"
          style={{ background: C.bgSoft, border: `1px solid ${C.border}`, color: C.text }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EMOJI_OPTIONS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className="w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-transform active:scale-90"
            style={{ background: value === e ? C.card2 : "transparent", border: `1px solid ${value === e ? C.violet : C.border}` }}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function Logo({ height = 32 }) {
  const C = useC();
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="flex items-center gap-2">
        <div className="rounded-xl flex items-center justify-center" style={{ width: height * 0.9, height: height * 0.9, background: C.grad }}>
          <Receipt size={height * 0.5} color="#fff" />
        </div>
        <span className="font-bold" style={{ ...display, color: C.text, fontSize: height * 0.55 }}>Quanto</span>
      </div>
    );
  }
  return (
    <img
      src={quantoLogo}
      alt="Quanto"
      style={{ height, width: "auto", objectFit: "contain" }}
      onError={() => setError(true)}
    />
  );
}

function ThemeToggle({ className = "", lang = "es" }) {
  const { theme, setTheme, C } = useThemeCtx();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={STR[lang].themeToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${className}`}
      style={{ color: C.muted, border: `1px solid ${C.border}`, background: C.card }}
    >
      {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
    </button>
  );
}

function fmt(n) {
  const v = Number(n) || 0;
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------------------------------------------------------------------- */
/*  Toast feedback (for save / delete actions)                             */
/* ---------------------------------------------------------------------- */
const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message) => {
    const id = uid();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastStack({ toasts }) {
  const { C } = useThemeCtx();
  if (!toasts.length) return null;
  return (
    <div className="fixed z-[100] bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none px-4 w-full" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="px-4 py-2.5 rounded-full text-sm shadow-xl flex items-center gap-2"
          style={{ background: C.bg === DARK.bg ? "#1C1F14" : "#20220F", color: "#F5F5F0", border: `1px solid ${C.border}`, animation: "toastIn 0.2s ease-out", ...body }}>
          <Check size={14} style={{ color: C.teal }} />
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Confirm dialog (for destructive actions)                               */
/* ---------------------------------------------------------------------- */
function ConfirmDialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  const C = useC();
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "#05090F99" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label={message}
        className="w-full max-w-sm rounded-2xl p-5" style={{ background: C.bg === DARK.bg ? "#15170F" : "#FFFFFF", border: `1px solid ${C.border}`, ...body }}>
        <p className="text-sm mb-5" style={{ color: C.text }}>{message}</p>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onCancel} className="flex-1">{cancelLabel}</Btn>
          <Btn variant="dangerSolid" onClick={onConfirm} className="flex-1">{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Gate (invite-only entry)                                               */
/* ---------------------------------------------------------------------- */
function Gate({ lang, setLang, householdExists, loading, onCreate, onJoin, error, config }) {
  const { C } = useThemeCtx();
  const t = (k) => STR[lang][k];
  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [addingNew, setAddingNew] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const handleCodeSubmit = () => {
    if (!householdExists) {
      if (code.trim().length < 3) { setLocalErr(lang === "es" ? "El código debe tener al menos 3 caracteres." : "Code must be at least 3 characters."); return; }
      setLocalErr(""); setStep("nameCreate");
      return;
    }
    const ok = onJoin.checkCode(code.trim());
    if (!ok) { setLocalErr(t("wrongCode")); return; }
    setLocalErr(""); setStep("who");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: C.bg, color: C.text, ...body }}>
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: C.grad }} />
      <div className="absolute -bottom-52 -right-40 w-[520px] h-[520px] rounded-full opacity-[0.12] blur-3xl pointer-events-none" style={{ background: C.teal }} />

      <div className="absolute top-5 right-5 flex items-center gap-2">
        <ThemeToggle lang={lang} />
        <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs backdrop-blur" style={{ color: C.muted, border: `1px solid ${C.border}`, background: C.card }}>
          <Globe size={13} /> {lang === "es" ? "English" : "Español"}
        </button>
      </div>

      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center mb-2">
          <Logo height={40} />
        </div>
        <p className="text-center text-sm mb-8" style={{ color: C.muted }}>{t("tagline")}</p>

        <Card>
          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: C.muted }}>···</div>
          ) : step === "code" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2" style={{ color: C.text }}>
                <KeyRound size={16} style={{ color: C.gold }} />
                <h2 className="font-medium">{householdExists ? t("enterCode") : t("createHousehold")}</h2>
              </div>
              <input
                autoFocus
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
                placeholder={t("inviteCode")}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }}
              />
              {!householdExists && <p className="text-xs" style={{ color: C.muted }}>{t("inviteCodeHelp")}</p>}
              {localErr && <p className="text-xs" style={{ color: C.red }}>{localErr}</p>}
              <Btn onClick={handleCodeSubmit} className="w-full">{t("continueBtn")}</Btn>
            </div>
          ) : step === "nameCreate" ? (
            <div className="space-y-4">
              <h2 className="font-medium" style={{ color: C.text }}>{t("yourName")}</h2>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t("yourName")}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />
              <div>
                <label className="text-xs" style={{ color: C.muted }}>{t("chooseEmoji")}</label>
                <div className="mt-1.5"><EmojiPicker value={emoji} onChange={setEmoji} /></div>
              </div>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => setStep("code")}>{t("back")}</Btn>
                <Btn className="flex-1" disabled={!name.trim()} onClick={() => onCreate(code.trim(), name.trim(), MEMBER_COLORS[0], emoji)}>{t("createBtn")}</Btn>
              </div>
            </div>
          ) : step === "who" && !addingNew ? (
            <div className="space-y-3">
              <h2 className="font-medium" style={{ color: C.text }}>{t("whoAreYou")}</h2>
              {config.members.map((m) => (
                <button key={m.id} onClick={() => onJoin.pick(m.id)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left"
                  style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}>
                  <Avatar m={m} size={28} />
                  <span style={{ color: C.text }}>{m.name}</span>
                </button>
              ))}
              <button onClick={() => setAddingNew(true)} className="text-sm" style={{ color: C.gold }}>{t("newMember")}</button>
              <div><Btn variant="ghost" onClick={() => setStep("code")}>{t("back")}</Btn></div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-medium" style={{ color: C.text }}>{t("addMember")}</h2>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t("memberName")}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />
              <div>
                <label className="text-xs" style={{ color: C.muted }}>{t("chooseEmoji")}</label>
                <div className="mt-1.5"><EmojiPicker value={emoji} onChange={setEmoji} /></div>
              </div>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => setAddingNew(false)}>{t("back")}</Btn>
                <Btn className="flex-1" disabled={!name.trim()} onClick={() => { onJoin.addNew(name.trim(), MEMBER_COLORS[config.members.length % MEMBER_COLORS.length], emoji); setAddingNew(false); }}>{t("enterBtn")}</Btn>
              </div>
            </div>
          )}
        </Card>
        <p className="text-xs text-center mt-5 px-4 leading-relaxed" style={{ color: C.muted }}>{t("authNote")}</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Add transaction modal                                                   */
/* ---------------------------------------------------------------------- */
function AddModal({ lang, type: initialType, config, members, currentUser, rates, editing, initialDate, onClose, onSave, onImportRates, onDelete, onDeleteOccurrence, occurrenceDate, onDuplicate, isCopy, onEditSeries }) {
  const C = useC();
  const t = (k) => STR[lang][k];
  const [type,setType]=useState(initialType==='capital'?'ingreso':initialType==='ahorro'?'activo':initialType);
  const [capitalMode,setCapitalMode]=useState(initialType==='capital'||editing?.catId==='aporte_capital');
  const [savingsMode,setSavingsMode]=useState(initialType==='ahorro'||(editing?.type==='activo'&&editing?.tag==='ahorro'&&SAVINGS_CATS.includes(editing?.catId)));
  const cats = capitalMode?CATS.ingreso.filter(c=>c.id==='aporte_capital'):savingsMode?CATS.activo.filter(c=>SAVINGS_CATS.includes(c.id)):CATS[type];
  const [extra, setExtra] = useState({...editing, repeatUnit: editing?.recurrence?.unit || "", repeatEvery: editing?.recurrence?.every || 1, repeatUntil: editing?.recurrence?.until || ""});
  const [catId, setCatId] = useState(editing?.catId || cats[0].id);
  const [purposeCategory,setPurposeCategory]=useState(()=>{const category=spendingCategory(editing||{});return CATS.egreso.some(c=>c.id===category&&!['deudas','retiro_capital'].includes(c.id))?category:'otro_egreso';});
  const [desc, setDesc] = useState(editing?.desc || "");
  const [date, setDate] = useState(editing ? (editing.date || "") : (initialDate ?? todayISO()));
  const [currency, setCurrency] = useState(editing?.currency || (config.isVenezuela ? "USD" : config.currency.code));
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [rate, setRate] = useState(editing?.rate ? String(editing.rate) : "");
  const [ownerId, setOwnerId] = useState(editing?.ownerId || currentUser.id);
  const [isPrivate, setIsPrivate] = useState(editing?.private || false);
  const [tag, setTagRaw] = useState(editing?.tag ?? suggestTag(type, editing?.catId || cats[0].id));
  const [tagTouched, setTagTouched] = useState(!!editing?.tag);
  const setTag = (v) => { setTagRaw(v); setTagTouched(true); };
  const showTags = type === "egreso" || type === "activo" || type === "pasivo";

  const purchaseCategory=type==='pasivo'||['deudas','cashea'].includes(catId)?purposeCategory:catId;
  useEffect(() => {
    if (!tagTouched) setTagRaw(suggestTag(type,purchaseCategory));
  }, [catId,purposeCategory,type]); // eslint-disable-line

  const [casheaPlan,setCasheaPlan]=useState({downMode:'percent',down:40,installments:2,everyDays:14,firstDue:''});
  const [settlement,setSettlement]=useState({paid:!!editing?.casheaSettlement,date:editing?.casheaSettlement?.date||todayISO(),manual:!!editing?.casheaSettlement,rate:editing?.casheaSettlement?.rate||'',effectiveRate:editing?.casheaSettlement?.rate||0,amountBS:editing?.casheaSettlement?.amountBS||0});
  const splitCashea=!editing&&['egreso','pasivo'].includes(type)&&extra.paymentMethod?.trim().toLowerCase()==='cashea';
  let casheaPreview=null;try{if(splitCashea)casheaPreview=casheaSchedule({...casheaPlan,total:amount,date});}catch{}
  useEffect(()=>{if(splitCashea)setCurrency('USD');},[splitCashea]);
  const handleRateSelection=useCallback(patch=>{setRate(patch.rate);setExtra(previous=>({...previous,...patch}));},[]);
  const TYPE_META = typeMeta(C);
  const TAG_META = tagMeta(C);
  const meta = isDebtOrCashea({...extra,type,catId})?{...TYPE_META[type],color:C.bg===DARK.bg?'#facc15':'#987400'}:TYPE_META[type];
  const validOrdinary = (currency!=='BS'||Number(extra.referenceRate)>0||(!extra.rateReference&&!!editing)) && Number.isFinite(Number(amount)) && Number(amount) > 0 && (currency !== "BS" || (Number.isFinite(Number(rate)) && Number(rate) > 0)) && [extra.feeFixed, extra.feePercent].every(v => !v || (Number.isFinite(Number(v)) && Number(v) >= 0)) && (type !== "ingreso" || Number(extra.feeFixed || 0) + Number(amount) * Number(extra.feePercent || 0) / 100 <= Number(amount)) && (!extra.repeatUnit || (!!date && Number.isInteger(Number(extra.repeatEvery)) && Number(extra.repeatEvery) >= 1 && (!extra.repeatUntil || extra.repeatUntil >= date)));

  const validSettlement=!editing?.cashea||!settlement.paid||(settlement.date&&settlement.date<=todayISO()&&settlement.date>=editing.cashea.purchaseDate&&Number.isFinite(settlement.effectiveRate)&&settlement.effectiveRate>0);
  const canSave=(splitCashea?!!casheaPreview:validOrdinary&&validSettlement)&&(!editing?.seriesId||!!date);
  const save = () => {
    if (!canSave) return;
    if(splitCashea){
      const plan=casheaSchedule({...casheaPlan,total:amount,date}),planId=uid();
      const transactions=plan.payments.map(payment=>({...extra,id:uid(),type:payment.role==='initial'?'egreso':'pasivo',catId:payment.role==='initial'?catId:'cashea',expenseCategory:purchaseCategory,desc:`${desc.trim()||'Cashea'} · ${payment.role==='initial'?(lang==='es'?'Inicial':'Down payment'):`${lang==='es'?'Cuota':'Installment'} ${payment.index}/${plan.installments}`}`,date:payment.date,currency:'USD',amount:payment.amount,rate:null,rateReference:null,referenceRate:null,selectedRate:null,fixedExpense:payment.role==='installment'?true:!!extra.fixedExpense,feeFixed:0,feePercent:0,recurrence:null,repeatUnit:'',paymentMethod:'Cashea',ownerId,private:isPrivate,tag:tag||'necesidad',cashea:{planId,purchaseDate:date,purchaseTotalUSD:plan.total,downUSD:plan.down,installments:plan.installments,everyDays:plan.everyDays,role:payment.role,index:payment.index,nominalUSD:payment.amount,dueDate:payment.date,purchaseCategory,purchaseName:desc.trim()||'Cashea'},casheaSettlement:null}));
      onSave(transactions);onClose();return;
    }
    const amt = Number(amount);
    const usedRate = currency === "BS" ? Number(rate) : null;
    onSave({
      ...extra, recurrence: extra.repeatUnit ? {unit: extra.repeatUnit, every: Number(extra.repeatEvery), until: extra.repeatUntil || null} : null,
      id: editing ? editing.id : uid(), type, catId, expenseCategory:['egreso','pasivo'].includes(type)?purchaseCategory:null, desc: desc.trim(), date, currency,
      amount: amt, ...(editing?.cashea?{currency:'USD',date:settlement.paid?settlement.date:(editing.casheaSettlement&&date===editing.date?editing.cashea.dueDate:date),cashea:{...editing.cashea,purchaseCategory,nominalUSD:amt,dueDate:settlement.paid?editing.cashea.dueDate:(editing.casheaSettlement&&date===editing.date?editing.cashea.dueDate:date)},casheaSettlement:settlement.paid?{date:settlement.date,rate:settlement.effectiveRate,rateDate:settlement.rateDate,amountBS:settlement.amountBS}:null}:{}), rate: usedRate, rateReference:currency==='BS'?(extra.rateReference||'USD'):null, referenceRate:currency==='BS'?(extra.referenceRate||usedRate):null, ownerId, private: isPrivate, tag: savingsMode ? "ahorro" : showTags ? tag : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#05090F99" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" className="quanto-transaction-modal w-full max-w-md rounded-2xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: C.bg === DARK.bg ? "#15170F" : "#FFFFFF", border: `1px solid ${C.border}`, ...body }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <meta.icon size={17} style={{ color: meta.color }} />
            <h3 className="font-medium" style={{ color: C.text }}>{isCopy ? (lang==='es'?'Nueva copia':'New copy') : editing ? t("editEntry") : t("addMovement")} · {savingsMode?t("savings"):t(type === "ingreso" ? "income" : type === "egreso" ? "expenses" : type === "activo" ? "assets" : "liabilities")}</h3>
          </div>
          <button onClick={onClose} aria-label={t("closeDialog")} className="p-1.5 -m-1.5 rounded-lg hover:bg-black/5"><X size={18} style={{ color: C.muted }} /></button>
        </div>

        <label htmlFor="tx-kind" className="text-xs" style={{color:C.muted}}>{lang==='es'?'Tipo de movimiento':'Transaction type'}</label><select id="tx-kind" disabled={!!editing?.cashea} className="w-full mt-1.5 mb-4 px-3 py-2 rounded-lg" style={{background:C.bgSoft,color:C.text,border:`1px solid ${C.border}`}} value={capitalMode?'capital':savingsMode?'ahorro':type} onChange={e=>{const capital=e.target.value==='capital',saving=e.target.value==='ahorro',next=capital?'ingreso':saving?'activo':e.target.value,list=capital?CATS.ingreso.filter(c=>c.id==='aporte_capital'):saving?CATS.activo.filter(c=>SAVINGS_CATS.includes(c.id)):CATS[next];setType(next);setCapitalMode(capital);setSavingsMode(saving);setCatId(list[0].id);setTagRaw(saving?'ahorro':suggestTag(next,list[0].id));setTagTouched(false);}}>{[['ingreso','Ingreso','Income'],['egreso','Gasto','Expense'],['ahorro','Ahorro','Savings'],['activo','Activo','Asset'],['pasivo','Deuda / cuota (egreso)','Debt / installment (outflow)'],['capital','Capital (aporte)','Capital contribution']].map(([value,es,en])=><option key={value} value={value}>{lang==='es'?es:en}</option>)}</select>
        <p className="text-xs mb-4" style={{color:C.muted,lineHeight:1.7}}>{lang==='es'?'Ingreso y capital suman al disponible. Gasto y deuda/cuota restan, incluidas comisiones. Ahorro mueve dinero del disponible a un activo, sin reducir el patrimonio. Activo registra bienes o saldos adicionales: no repitas dinero que ya registraste como ingreso o capital. El patrimonio es un total calculado, no otro movimiento.':'Income and capital increase available cash. Expenses and debt/installments reduce it, including fees. Savings moves available cash into assets without reducing net worth. Assets record additional holdings: do not duplicate income or capital. Net worth is calculated, not another transaction.'}</p>
        {type!=='pasivo'&&<><label className="text-xs" style={{ color: C.muted }}>{t("category")}</label>
        <div className="grid grid-cols-2 gap-2 mt-1.5 mb-3">
          {cats.map((c) => (
            <button key={c.id} onClick={() => setCatId(c.id)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left"
              style={{ background: catId === c.id ? `${meta.color}22` : C.bgSoft, border: `1px solid ${catId === c.id ? meta.color : C.border}`, color: C.text }}>
              <c.icon size={14} style={{ color: meta.color, flexShrink: 0 }} />
              <span>{lang === "es" ? c.es : c.en}</span>
            </button>
          ))}
        </div>

        </>}
        {(type==='pasivo'||type==='egreso'&&['deudas','cashea'].includes(catId))&&<div className="quanto-expense-purpose"><label htmlFor="tx-expense-purpose">{lang==='es'?'Categoría del gasto':'Expense category'}</label><select id="tx-expense-purpose" value={CATS.egreso.some(c=>c.id===purposeCategory)?purposeCategory:'otro_egreso'} onChange={e=>setPurposeCategory(e.target.value)}>{CATS.egreso.filter(c=>!['deudas','retiro_capital'].includes(c.id)).map(c=><option key={c.id} value={c.id}>{lang==='es'?c.es:c.en}</option>)}</select><p>{lang==='es'?'La categoría indica en qué gastaste. Cashea es el método de pago y Deuda / cuota indica que es un egreso financiado. Se registra una sola vez.':'The category describes what you bought. Cashea is the payment method and Debt / installment identifies a financed outflow. It is recorded only once.'}</p></div>}
        <label htmlFor="tx-desc" className="text-xs" style={{ color: C.muted }}>{t("description")} ({lang === "es" ? "opcional" : "optional"})</label>
        <input id="tx-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={lang==="es"?"Ej. Compra semanal (opcional)":"e.g. Weekly groceries (optional)"}
          className="w-full mt-1.5 mb-3 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label htmlFor="tx-date" className="text-xs" style={{ color: C.muted }}>{t("date")}</label>
            <input aria-describedby="tx-date-help" type="date" id="tx-date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />
            <p id="tx-date-help" className="text-xs mt-1" style={{color:C.muted}}>{lang==='es'?'Sin fecha: se guarda en pendientes del calendario.':'No date: saves to the calendar backlog.'}</p>
          </div>
          <div>
            <label htmlFor="tx-ownerId" className="text-xs" style={{ color: C.muted }}>{t("owner")}</label>
            <select id="tx-ownerId" disabled={!!editing?.seriesId} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className={`grid ${config.isVenezuela ? "grid-cols-3" : "grid-cols-1"} gap-2 mb-3`}>
          {config.isVenezuela && (
            <div>
              <label htmlFor="tx-currency" className="text-xs" style={{ color: C.muted }}>{t("currency")}</label>
              <select id="tx-currency" disabled={splitCashea||!!editing?.cashea} value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-1.5 px-2 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }}>
                <option value="USD">USD</option>
                <option value="BS">Bs</option>
              </select>
            </div>
          )}
          <div className={config.isVenezuela ? "col-span-1" : ""}>
            <label htmlFor="tx-amount" className="text-xs" style={{ color: C.muted }}>{splitCashea?(lang==='es'?'Total de la compra (USD)':"Purchase total (USD)"):t("amountInCurrency")} {!config.isVenezuela && `(${config.currency.symbol})`}</label>
            <input type="number" min="0" step="0.01" id="tx-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              className="w-full mt-1.5 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}`, ...mono }} />
          </div>
        </div>
        {config.isVenezuela&&currency==='BS'&&<><TransactionRate date={date} rates={rates} editing={editing} onChange={handleRateSelection} onHistory={onImportRates} lang={lang}/>{Number(rate)>0&&Number(amount)>0&&<p className="text-sm my-3" style={{color:C.text}}>{lang==='es'?'Equivalente antes de comisiones:':'Equivalent before fees:'} <strong>{(Number(amount)/Number(rate)).toFixed(2)} USD</strong>{extra.rateReference&&extra.rateReference!=='USD'&&Number(extra.referenceRate)>0&&<> · {(Number(amount)/Number(extra.referenceRate)).toFixed(2)} {extra.rateReference}</>}</p>}</>}

        {showTags && !savingsMode && (
          <div className="mb-4">
            <label className="text-xs flex items-center" style={{ color: C.muted }}>{t("tagLabel")}<InfoTip text={`${t("needsHelp")} / ${t("wantsHelp")} / ${t("savingsHelp")}`} /></label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {TAG_ORDER.map((tg) => (
                <button key={tg} onClick={() => setTag(tg)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: tag === tg ? `${TAG_META[tg].color}22` : C.bgSoft, border: `1px solid ${tag === tg ? TAG_META[tg].color : C.border}`, color: tag === tg ? TAG_META[tg].color : C.muted }}>
                  {t(TAG_INFO[tg].labelKey)}
                </button>
              ))}
              <button onClick={() => setTag(null)}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: !tag ? C.card2 : "transparent", border: `1px solid ${C.border}`, color: C.muted }}>
                {t("noTag")}
              </button>
            </div>
          </div>
        )}

        <ExtraFields type={type} value={extra} setValue={setExtra} rates={rates} venezuela={config.isVenezuela} lang={lang} installmentPlan={splitCashea}>
          {splitCashea&&<CasheaFields value={casheaPlan} onChange={setCasheaPlan} total={amount} date={date} rates={rates} lang={lang}/>}
          {editing?.cashea&&<CasheaSettlement tx={{...editing,...extra,amount:Number(amount),type}} rates={rates} value={settlement} onChange={setSettlement} lang={lang}/>}
        </ExtraFields>
        <p className="text-sm mb-3" style={{color:C.text}}>{lang === "es" ? "Comisión" : "Fee"}: {(Number(extra.feeFixed || 0) + Number(amount || 0) * Number(extra.feePercent || 0) / 100).toFixed(2)} {currency} · {lang === "es" ? "Total neto" : "Net total"}: {transactionValue({type,amount:Number(amount || 0),feeFixed:extra.feeFixed,feePercent:extra.feePercent,currency,rate:Number(rate)}, false).toFixed(2)} {currency}</p>
        <p className="text-xs mb-3" style={{color:C.muted}}>{lang === "es" ? "La descripción es opcional. Se requiere monto positivo y, en Bs, una tasa positiva. Puedes dejar la fecha vacía; los pagos recurrentes requieren fecha y frecuencia entera positiva. Las comisiones usan la moneda del movimiento." : "Description is optional. A positive amount and, for Bs, a positive rate are required. Leave the date blank to schedule later. Recurrence needs a date and positive whole-number frequency. Fees use the transaction currency."}</p>
        <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
          <input type="checkbox" disabled={!!editing?.seriesId} checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          <span className="text-sm flex items-center" style={{ color: C.text }}><Lock size={12} className="mr-1" style={{ color: C.muted }} />{t("private")}</span>
          <InfoTip text={t("privateHelp")} />
        </label>

        {isCopy&&<p className="text-xs mb-4" style={{color:C.muted}}>{lang==='es'?'Copia independiente. Ajusta la fecha y guarda para agregarla; no repite la serie ni el plan Cashea.':'Independent copy. Adjust the date and save to add it; it does not repeat the series or Cashea plan.'}</p>}
        {editing?.seriesId&&<p className="text-xs mb-4" style={{color:C.muted}}>{lang==='es'?'Los cambios se aplican solo a esta fecha. Para cambiar responsable o privacidad, usa Editar toda la serie.':'Changes apply only to this occurrence. Use Edit entire series to change owner or privacy.'}</p>}
        {isDebtOrCashea({...extra,type,catId})&&!editing?.cashea&&<label className="flex gap-2 mb-4"><input type="checkbox" checked={!!extra.debtPaid} onChange={e=>setExtra({...extra,debtPaid:e.target.checked})}/>{lang==='es'?'Ya pagué esta deuda / cuota':'I have paid this debt / installment'}</label>}
        {onEditSeries&&<button type="button" onClick={onEditSeries} className="w-full rounded-lg px-3 py-3 mb-4" style={{color:C.text,border:`1px solid ${C.border}`}}>{lang==='es'?'Editar toda la serie':'Edit entire series'}</button>}
        {onDuplicate&&<button type="button" onClick={onDuplicate} className="w-full rounded-lg px-3 py-3 mb-4" style={{color:C.text,border:`1px solid ${C.border}`,minHeight:48}}>{lang==='es'?'Duplicar transacción':'Duplicate transaction'}</button>}
        {onDelete&&<div className="mb-4 space-y-2" style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
          {onDeleteOccurrence&&<button type="button" onClick={onDeleteOccurrence} className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-3" style={{color:C.red,border:`1px solid ${C.red}66`,minHeight:48}}><Trash2 size={16}/>{lang==='es'?`Eliminar solo el ${occurrenceDate}`:`Delete only ${occurrenceDate}`}</button>}
          <button type="button" onClick={onDelete} className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-3" style={{color:C.red,border:`1px solid ${C.red}66`,minHeight:48}}><Trash2 size={16}/>{(editing?.recurrence||editing?.seriesId)?(lang==='es'?'Eliminar toda la serie':'Delete entire series'):(lang==='es'?'Eliminar transacción':'Delete transaction')}</button>
        </div>}
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose} className="flex-1">{t("cancel")}</Btn>
          <Btn onClick={save} disabled={!canSave} className="flex-1">{t("save")}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Dashboard                                                               */
/* ---------------------------------------------------------------------- */
function Dashboard({ lang, setLang, config, saveConfig, records, saveRecords, currentUser, onLogout }) {
  const latestRecords=useRef(records);latestRecords.current=records;
  const importRateHistory=useCallback(incoming=>{const current=latestRecords.current,merged=mergeRateHistory(current.rates||[],incoming);if(JSON.stringify(merged)!==JSON.stringify(current.rates||[])){const next={...current,rates:merged};latestRecords.current=next;saveRecords(next);}},[saveRecords]);
  const historyYears=[...new Set([todayISO().slice(0,4),...records.transactions.filter(tx=>tx.date&&tx.date<=todayISO()).map(tx=>tx.date.slice(0,4))])].sort().join(',');

  const { C, theme, setTheme } = useThemeCtx();
  const TYPE_META = typeMeta(C);
  const TAG_META = tagMeta(C);
  const t = (k) => STR[lang][k];
  const showToast = useToast();
  const [tab, setTab] = useState("overview");
  const [modalType, setModalType] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [initialDate,setInitialDate]=useState(undefined);
  const [search, setSearch] = useState("");
  const allVisible = useMemo(() => records.transactions.filter(tx => !tx.private || tx.ownerId === currentUser.id), [records.transactions, currentUser.id]);
  const [listMonth,setListMonth]=useState(todayISO().slice(0,7));
  const listVisible=useMemo(()=>{const b=periodBounds(`${listMonth}-01`);return [...expandTransactions(allVisible,b.start,b.end,records.exceptions||{}),...allVisible.filter(tx=>!tx.date)];},[allVisible,records.exceptions,listMonth]);
  const personalLabels=useMemo(()=>personalLabelCatalog(records,currentUser.id),[records.transactions,records.exceptions,records.labelCatalog,currentUser.id]);
  const [txFilter, setTxFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [confirmDeleteTxId, setConfirmDeleteTxId] = useState(null);
  const [calendarOccurrence,setCalendarOccurrence]=useState(null);
  const [confirmOccurrence,setConfirmOccurrence]=useState(null);

  const me = config.members.find((m) => m.id === currentUser.id) || currentUser;

  const visibleTx = useMemo(() => expandTransactions(allVisible, "1970-01-01", `${Number(todayISO().slice(0,4))+1}-01-01`, records.exceptions || {}).filter(tx => tx.date && tx.date <= todayISO()), [allVisible, records.exceptions]);
  const toUSD = useCallback(tx => transactionValue(tx, config.isVenezuela), [config.isVenezuela]);

  const latestRate = useMemo(() => {
    if (!records.rates.length) return null;
    return [...records.rates].filter(r=>isUsdRate(r)&&r.date<=todayISO()).sort((a, b) => (a.date < b.date ? 1 : -1))[0]?.rate || null;
  }, [records.rates]);

  const totals = useMemo(() => {
    const sums = { ingreso: 0, egreso: 0, activo: 0, pasivo: 0 };
    visibleTx.forEach((tx) => { sums[tx.type] += toUSD(tx); });
    return sums;
  }, [visibleTx, toUSD]);

  const monthKey = todayISO().slice(0, 7);
  const cycle = periodBounds(todayISO(), "cycle", config.cycleDay || 1);
  const monthTotals = useMemo(() => {
    const sums = { ingreso: 0, egreso: 0 };
    visibleTx.filter((tx) => inPeriod(tx, cycle)).forEach((tx) => {
      if (tx.type === "ingreso") sums.ingreso += toUSD(tx); else if(isExpense(tx)) sums.egreso += toUSD(tx);
    });
    return sums;
  }, [visibleTx, toUSD, monthKey, config.cycleDay]);

  const netWorth = positionSummary(visibleTx,config.isVenezuela).netWorth;
  const available = useMemo(() => availableBalance(visibleTx, config.isVenezuela, todayISO()), [visibleTx, config.isVenezuela]);

  const pieData = useMemo(() => {
    const byCat = {};
    visibleTx.filter((tx) => isExpense(tx) && inPeriod(tx, cycle)).forEach((tx) => {
      const key = chartCategory(tx); byCat[key] = (byCat[key] || 0) + toUSD(tx);
    });
    return Object.entries(byCat).map(([catId, value]) => {
      const cat = [...CATS.egreso,...CATS.pasivo].find((c) => c.id === catId);
      return { name: catId === "uncategorized" ? (lang === "es" ? "Sin categoría" : "Uncategorized") : cat ? (lang === "es" ? cat.es : cat.en) : catId, value: Number(value.toFixed(2)) };
    });
  }, [visibleTx, toUSD, monthKey, lang, config.cycleDay]);

  const PIE_COLORS = [C.violet, C.teal, C.gold, C.red, "#60A5FA", C.goldSoft, "#34D399", "#F472B6"];

  const trendData = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "short" });
      let inc = 0, exp = 0;
      visibleTx.filter((tx) => tx.date.slice(0, 7) === key).forEach((tx) => {
        if (tx.type === "ingreso") inc += toUSD(tx);
        if (isExpense(tx)) exp += toUSD(tx);
      });
      out.push({ month: label, [t("income")]: Number(inc.toFixed(2)), [t("expenses")]: Number(exp.toFixed(2)) });
    }
    return out;
  }, [visibleTx, toUSD, lang]);

  const memberOf = (id) => config.members.find((m) => m.id === id);
  const currSym = config.isVenezuela ? "$" : config.currency.symbol;

  const money = (v) => `${currSym}${fmt(v)}`;

  const NAV = [
    { id: "overview", label: t("overview"), icon: LayoutGrid },
    { id: "calendar", label: lang === "es" ? "Calendario" : "Calendar", icon: Calendar },
    { id: "transactions", label: t("transactions"), icon: Receipt },
    { id: "budget", label: t("budget"), icon: PiggyBank },
    { id: "planner", label: lang==='es'?'Deudas':'Debts', icon: CreditCard },
    { id: "goals", label: lang==='es'?'Metas':'Goals', icon: Target },
    ...(config.isVenezuela ? [{ id: "rates", label: t("rates"), icon: ArrowRightLeft }] : []),
    { id: "settings", label: t("settings"), icon: SettingsIcon },
  ];

  const saveTx = (input) => {
    const inputs=Array.isArray(input)?input:[input],payments=inputs.filter(tx=>!tx.seriesId),byId=new Map(payments.map(tx=>[tx.id,tx]));
    const current=latestRecords.current;
    const next=[...payments.filter(tx=>!current.transactions.some(old=>old.id===tx.id)),...current.transactions.map(tx=>byId.get(tx.id)||tx)];
    const exceptions={...current.exceptions};for(const tx of inputs.filter(tx=>tx.seriesId)){const {recurrence,repeatUnit,repeatEvery,repeatUntil,...patch}=tx;exceptions[tx.id]={...exceptions[tx.id],...patch};}const value={...current,transactions:next,exceptions};latestRecords.current=value;saveRecords(value);
    showToast(Array.isArray(input)?`${payments.length} ${lang==='es'?'pagos Cashea guardados.':'Cashea payments saved.'}`:t('txSaved'));
  };
  const saveClassification=(id,change)=>{const current=latestRecords.current,next=updateClassification(current,id,change,currentUser.id);if(next===current)return;latestRecords.current=next;saveRecords(next);showToast(t('txSaved'));};
  const openTx=tx=>{setCalendarOccurrence(tx.seriesId?tx:null);setInitialDate(undefined);setEditingTx(tx.seriesId?{...tx,recurrence:null,repeatUnit:''}:tx);setModalType(tx.type);};
  const duplicateTx=tx=>{const {seriesId,skipped,cashea,casheaSettlement,debtPaid,repeatUnit,repeatEvery,repeatUntil,...copy}=tx;setCalendarOccurrence(null);setInitialDate(undefined);setEditingTx({...copy,id:uid(),recurrence:null,repeatUnit:'',casheaSettlement:null,debtPaid:false});setModalType(tx.type);};
  const delTx = (id) => {
    const current=latestRecords.current;
    const next={ ...current, transactions: current.transactions.filter((tx) => tx.id !== id), exceptions: Object.fromEntries(Object.entries(current.exceptions || {}).filter(([key]) => !key.startsWith(`${id}@`))) };latestRecords.current=next;saveRecords(next);
    showToast(t("txDeleted"));
  };
  const addRate = (r) => { saveRecords({ ...records, rates: [...records.rates, r] }); showToast(t("rateSaved")); };
  const delRate = (idx) => { saveRecords({ ...records, rates: records.rates.filter((_, i) => i !== idx) }); showToast(t("rateDeleted")); };

  return (
    <div data-theme={theme} data-section={tab} className="quanto-app min-h-screen flex relative" style={{ background: C.bg, color: C.text, ...body }}>

      {/* Sidebar */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col p-5 relative" style={{ borderRight: `1px solid ${C.border}` }}>
        <div className="flex items-center px-1 mb-9">
          <Logo height={26} />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm text-left font-medium transition-colors"
              style={{ background: tab === n.id ? C.card2 : "transparent", color: tab === n.id ? C.text : C.muted }}>
              <n.icon size={16} style={{ color: tab === n.id ? C.violet : C.muted }} /> {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <header className="quanto-account-toolbar" aria-label={lang==='es'?'Cuenta y preferencias':'Account and preferences'}>
          <div className="quanto-mobile-brand md:hidden"><Logo height={28}/></div>
          <div className="quanto-account-profile"><Avatar m={me} size={24}/><span>{me.name}</span></div>
          <div className="quanto-account-actions"><LocalReminders records={records} config={config} uid={window.storage?.uid||currentUser.id} currentUserId={currentUser.id} lang={lang} onCalendar={()=>setTab("calendar")} onSettings={()=>setTab("settings")}/><button onClick={()=>setLang(lang==='es'?'en':'es')} aria-label={lang==='es'?'Switch to English':'Cambiar a español'}><Globe size={16}/>{lang==='es'?'EN':'ES'}</button><button onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={lang==='es'?'Cambiar tema':'Change theme'}>{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==='dark'?t('light'):t('dark')}</span></button><button onClick={onLogout}><LogOut size={16}/><span>{t('logout')}</span></button></div>
        </header>
        <MobileNav items={NAV} active={tab} onChange={setTab} lang={lang} C={C}/>

        {config.isVenezuela && latestRate && (
          <div className="mb-5 flex items-center gap-2 px-4 py-2 rounded-full text-xs w-fit" style={{ background: C.card2, color: C.goldSoft, ...mono }}>
            <ArrowRightLeft size={12} /> {t("latestRate")}: 1 USD = {fmt(latestRate)} Bs
          </div>
        )}

        {config.isVenezuela&&<RateHistorySync years={historyYears} onHistory={importRateHistory} lang={lang}/>}
        {tab === "calendar" && <Planning theme={theme} categoryLabel={tx=>{const c=(isExpense(tx)?[...CATS.egreso,...CATS.pasivo]:CATS[tx.type]||[]).find(c=>c.id===spendingCategory(tx));return c?(lang==="es"?c.es:c.en):"";}} records={records} saveRecords={saveRecords} config={config} lang={lang} currentUser={currentUser} onNew={options => {setInitialDate(options?.undated?"":options?.date);setCalendarOccurrence(null);setEditingTx(null); setModalType(options?.type||"egreso");}} onEdit={(tx,occurrence) => openTx(occurrence||tx)} />}
        {tab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold" style={{ ...display, color: C.text }}>{t("overview")}</h1>
              <p className="text-sm mt-1" style={{ color: C.muted }}>{t("heroSub")}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "ingreso", label: t("income"), tip: t("incomeTip"), val: monthTotals.ingreso, sub: `${cycle.start} → ${cycle.end}` },
                { key: "egreso", label: t("expenses"), tip: t("expenseTip"), val: monthTotals.egreso, sub: `${cycle.start} → ${cycle.end}` },
                { key: "activo", label: t("assets"), tip: t("assetTip"), val: totals.activo, sub: t("total") },
                { key: "pasivo", label: t("liabilities"), tip: t("liabilityTip"), val: totals.pasivo, sub: t("total") },
              ].map((card) => {
                const meta = TYPE_META[card.key];
                return (
                  <Card key={card.key} tone={card.key}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="quanto-bare-icon flex items-center justify-center" style={{ background: `${meta.color}22` }}>
                        <meta.icon size={15} style={{ color: meta.color }} />
                      </div>
                      <InfoTip text={card.tip} />
                    </div>
                    <p className="text-xs" style={{ color: C.muted }}>{card.label}</p>
                    <p className="text-xl font-semibold mt-0.5" style={{ ...mono, color: meta.color }}>{money(card.val)}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{card.sub}</p>
                    {config.isVenezuela && latestRate && (
                      <p className="text-[11px] mt-1" style={{ color: C.goldSoft }}>≈ {fmt(card.val * latestRate)} Bs</p>
                    )}
                  </Card>
                );
              })}
            </div>

            <Card tone="ingreso">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium" style={{color:C.text}}>{lang === "es" ? "Saldo disponible acumulado" : "Accumulated available balance"}</h2>
                  <p className="text-3xl font-semibold mt-2" style={{...display,color:available.balance >= 0 ? C.teal : C.red}}>{money(available.balance)}</p>
                </div>
                <Wallet size={28} style={{color:C.muted}} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm" style={{color:C.muted}}>
                <p>{lang === "es" ? "Ingresos acumulados" : "Accumulated income"}: <strong style={{color:C.teal}}>{money(available.income)}</strong></p>
                <p>{lang === "es" ? "Gastos acumulados" : "Accumulated expenses"}: <strong style={{color:C.red}}>{money(available.expenses)}</strong></p>
              </div>
              <p className="text-xs mt-3 leading-relaxed" style={{color:C.muted}}>{lang === "es" ? "Entradas menos egresos (incluidas deudas/cuotas y comisiones) y ahorro apartado hasta hoy. Conserva lo que queda de meses anteriores; no se reinicia al cambiar de mes o ciclo. Excluye movimientos futuros y sin fecha. El saldo depende de los movimientos que hayas registrado." : "Inflows minus outflows (including debt/installments and fees) and savings set aside through today. Carries forward previous months without resetting each month or pay cycle. Excludes future and undated entries. The balance depends on your recorded transactions."}</p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs flex items-center" style={{ color: C.muted }}>{t("netWorth")}<InfoTip text={t("netWorthTip")} /></p>
                  <p className="text-3xl font-semibold mt-1" style={{ ...display, color: netWorth >= 0 ? C.teal : C.red }}>{money(netWorth)}</p>
                </div>
                <Scale size={28} style={{ color: C.muted }} />
              </div>
            </Card>

            <Card><LabelSpending transactions={allVisible} exceptions={records.exceptions||{}} bounds={cycle} cycleDay={config.cycleDay||1} venezuela={config.isVenezuela} lang={lang} categories={CATS.egreso} C={C} money={money}/></Card>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <p className="text-sm font-medium mb-3" style={{ color: C.text }}>{t("expensesByCategory")}</p>
                {pieData.length === 0 ? (
                  <p className="text-xs py-8 text-center" style={{ color: C.muted }}>{t("noTx")}</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => money(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {pieData.map((d, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px]" style={{ color: C.muted }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{d.name}
                    </span>
                  ))}
                </div>
              </Card>
              <Card>
                <p className="text-sm font-medium mb-3" style={{ color: C.text }}>{t("monthlyTrend")}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="month" stroke={C.muted} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={C.muted} fontSize={11} tickLine={false} axisLine={false} />
                    <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => money(v)} />
                    <Bar dataKey={t("income")} fill={C.teal} radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t("expenses")} fill={C.red} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <Comparison theme={theme} transactions={visibleTx} config={config} lang={lang} />
          </div>
        )}

        {tab === "transactions" && (
          <div>
            <label className="quanto-search-field block text-sm">{lang === "es" ? "Buscar movimientos" : "Search transactions"}<input placeholder={lang==='es'?'Ej. supermercado, Dogs, Business o Zelle':'e.g. groceries, Dogs, Business or Zelle'} type="search" value={search} onChange={e=>setSearch(e.target.value)} className="block w-full p-3 mt-2 rounded-lg border bg-transparent" /></label>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h1 className="text-2xl font-semibold" style={{ ...display, color: C.text }}>{t("transactions")}</h1>
              <Btn onClick={() => { setModalType("egreso"); setEditingTx(null); }}><Plus size={14} className="inline -mt-0.5 mr-1" />{t("addMovement")}</Btn>
            </div>
            <div className="flex gap-2 mb-3 flex-wrap">
              {["all", "ingreso", "egreso", "activo", "pasivo"].map((f) => (
                <button key={f} onClick={() => setTxFilter(f)} className="px-3 py-1.5 rounded-full text-xs"
                  style={{ background: txFilter === f ? C.gold : C.card, color: txFilter === f ? "#1A1206" : C.muted }}>
                  {f === "all" ? t("all") : t(f === "ingreso" ? "income" : f === "egreso" ? "expenses" : f === "activo" ? "assets" : "liabilities")}
                </button>
              ))}
              <div className="flex-1" />
              {["ingreso", "egreso", "activo", "pasivo"].map((ty) => {
                const meta = TYPE_META[ty];
                const label = t(ty === "ingreso" ? "income" : ty === "egreso" ? "expenses" : ty === "activo" ? "assets" : "liabilities");
                return (
                  <button key={ty} onClick={() => { setModalType(ty); setEditingTx(null); }} aria-label={`${t("addMovement")} · ${label}`} title={label} className="quanto-icon-action w-8 h-8 flex items-center justify-center" style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55` }}>
                    <meta.icon size={13} style={{ color: meta.color }} />
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mb-4 flex-wrap items-center">
              <span className="text-xs mr-1" style={{ color: C.muted }}>{t("tagLabel")}:</span>
              <button onClick={() => setTagFilter("all")} className="px-3 py-1.5 rounded-full text-xs"
                style={{ background: tagFilter === "all" ? C.card2 : "transparent", border: `1px solid ${C.border}`, color: C.muted }}>
                {t("all")}
              </button>
              {TAG_ORDER.map((tg) => (
                <button key={tg} onClick={() => setTagFilter(tg)} className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: tagFilter === tg ? `${TAG_META[tg].color}22` : "transparent", border: `1px solid ${tagFilter === tg ? TAG_META[tg].color : C.border}`, color: tagFilter === tg ? TAG_META[tg].color : C.muted }}>
                  {t(TAG_INFO[tg].labelKey)}
                </button>
              ))}
            </div>

            <label className="flex gap-3 items-center mb-4">{lang==='es'?'Mes de los movimientos':'Transaction month'}<input type="month" value={listMonth} onChange={e=>{if(e.target.value)setListMonth(e.target.value);}} style={{background:C.card,color:C.text,border:`1px solid ${C.border}`,padding:10,borderRadius:8}}/></label>
            <p className="text-xs mb-4" style={{color:C.muted}}>{lang==='es'?'Mismos movimientos y fechas que el calendario, incluidas las recurrencias. Los pendientes sin fecha también aparecen aquí.':'Same transactions and dates as the calendar, including recurring occurrences. Undated transactions appear here too.'}</p>
            <Card style={{ padding: 0 }}>
              {listVisible.filter((tx) => (!search || [tx.desc,tx.customCategory,tx.beneficiary,tx.group,tx.labels,tx.paymentMethod,spendingCategory(tx),[...CATS.ingreso,...CATS.egreso,...CATS.activo,...CATS.pasivo].find(c=>c.id===spendingCategory(tx))?.[lang==='es'?'es':'en']].some(v => String(v || "").toLowerCase().includes(search.toLowerCase()))) && (txFilter === "all" || tx.type === txFilter) && (tagFilter === "all" || effTag(tx) === tagFilter)).length === 0 ? (
                <div className="py-12 text-center">
                  <Receipt size={24} className="mx-auto mb-2" style={{ color: C.muted, opacity: 0.6 }} />
                  <p className="text-sm" style={{ color: C.muted }}>{t("noTx")}</p>
                  <p className="text-xs mt-1" style={{ color: C.muted, opacity: 0.8 }}>{t("noTxHint")}</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {listVisible.filter((tx) => (!search || [tx.desc,tx.customCategory,tx.beneficiary,tx.group,tx.labels,tx.paymentMethod,spendingCategory(tx),[...CATS.ingreso,...CATS.egreso,...CATS.activo,...CATS.pasivo].find(c=>c.id===spendingCategory(tx))?.[lang==='es'?'es':'en']].some(v => String(v || "").toLowerCase().includes(search.toLowerCase()))) && (txFilter === "all" || tx.type === txFilter) && (tagFilter === "all" || effTag(tx) === tagFilter))
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .map((tx) => {
                      const cat = (isExpense(tx)?[...CATS.egreso,...CATS.pasivo]:CATS[tx.type]).find((c) => c.id === spendingCategory(tx));
                      const yellow=isDebtOrCashea(tx);
                      const meta = yellow?{...TYPE_META[tx.type],color:theme==='dark'?'#facc15':'#987400'}:TYPE_META[tx.type];
                      const owner = memberOf(tx.ownerId);
                      const usd = toUSD(tx);
                      const rowTag = effTag(tx);
                      return (
                        <div key={tx.id} className="quanto-transaction-row flex items-center gap-3 px-4 py-3" style={{ background:yellow?'#eab30814':undefined,borderLeft:`3px solid ${yellow?'#eab308':meta.color}`, borderTop: `1px solid ${C.border}` }}>
                          <div className="quanto-row-icon quanto-bare-icon flex items-center justify-center shrink-0" style={{ background: `${meta.color}22` }}>
                            {cat && <cat.icon size={15} style={{ color: meta.color }} />}
                          </div>
                          <div className="quanto-row-summary flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: C.text }}>{tx.desc || tx.customCategory || (cat ? (lang === "es" ? cat.es : cat.en) : "")}</p>
                            <div className="quanto-row-meta flex items-center gap-1.5 flex-wrap" style={{ color: C.muted }}>
                              {tx.date || (lang === "es" ? "Sin fecha" : "Unscheduled")} · {[tx.beneficiary,tx.group,tx.paymentMethod,tx.recurrence ? "↻" : ""].filter(Boolean).join(" · ")}
                              {tx.private && <Lock size={10} />}
                              {rowTag && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${TAG_META[rowTag].color}1F`, color: TAG_META[rowTag].color }}>
                                  {t(TAG_INFO[rowTag].labelKey)}
                                </span>
                              )}
                              {owner&&<div className="quanto-row-owner"><Avatar m={owner} size={18}/><span>{owner.name}</span></div>}
                            </div>
                          </div>
                          <div className="quanto-row-amount text-right shrink-0">
                            <p className="text-sm font-medium" style={{ ...mono, color: meta.color }}>
                              {tx.type === "egreso" || tx.type === "pasivo" ? "-" : "+"}{config.isVenezuela ? `$${fmt(usd)}` : money(usd)}
                            </p>
                            <CasheaAmount tx={tx} rates={records.rates} lang={lang}/>{config.isVenezuela && tx.currency === "BS" && <p className="text-[10px]" style={{ color: C.muted }}>{fmt(tx.amount)} Bs @ {fmt(tx.rate)} {tx.rateName || ""}</p>}
                            {config.isVenezuela&&tx.currency==='BS'&&tx.rateReference&&tx.rateReference!=='USD'&&tx.referenceRate>0&&<p className="text-[11px]" style={{color:C.muted}}>{fmt(usd*Number(tx.rate)/Number(tx.referenceRate))} {tx.rateReference}</p>}
                          </div>
                          <TransactionClassification tx={tx} lang={lang} categories={(isExpense(tx)?CATS.egreso:CATS[tx.type]).map(c=>({id:c.id,label:lang==='es'?c.es:c.en}))} categoryId={spendingCategory(tx)} categoryName={cat?(lang==='es'?cat.es:cat.en):(lang==='es'?'Sin categoría de gasto':'Uncategorized expense')} options={personalLabels[labelCategory(tx)]||[]} onChange={change=>saveClassification(tx.id,change)}/>
                          <div className="quanto-row-actions">
                          <button className="p-2 text-xs" aria-label={lang === "es" ? "Duplicar transacción" : "Duplicate transaction"} onClick={() => duplicateTx(tx)}>{lang === "es" ? "Duplicar" : "Duplicate"}</button>
                          <button onClick={() => openTx(tx)} aria-label={t("editEntryAction")}
                            className="shrink-0 p-2 -m-0.5 rounded-lg hover:bg-black/5 transition-colors"><Pencil size={14} style={{ color: C.muted }} /></button>
                          <button onClick={() => tx.seriesId?setConfirmOccurrence(tx):setConfirmDeleteTxId(tx.id)} aria-label={t("deleteEntry")}
                            className="shrink-0 p-2 -m-0.5 rounded-lg hover:bg-black/5 transition-colors"><Trash2 size={14} style={{ color: C.muted }} /></button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === "budget" && <BudgetPlanner key={config.cycleDay||1} records={records} config={config} saveConfig={saveConfig} lang={lang} currentUser={currentUser}/>}
        {(tab === "planner" || tab === "goals") && <DebtPlanner key={tab} view={tab==='goals'?'goals':'debts'} records={records} saveRecords={saveRecords} config={config} lang={lang} currentUser={currentUser} theme={theme} categoryLabel={tx=>{const category=[...CATS.egreso,...CATS.pasivo].find(c=>c.id===spendingCategory(tx));return category?(lang==='es'?category.es:category.en):'';}} onEdit={openTx}/>}

        {tab === "rates" && config.isVenezuela && (
          <CustomRates lang={lang} rates={records.rates} saveRates={rates => saveRecords({...records,rates})} />
        )}

        {tab === "settings" && (
          <><h1 className="text-2xl font-semibold mb-6">{t("settings")}</h1><Notifications lang={lang}/><CycleSettings config={config} saveConfig={saveConfig} lang={lang}/><SettingsTab lang={lang} t={t} config={config} saveConfig={saveConfig} setLang={setLang} currentUserId={currentUser.id} /></>
        )}
      </main>

      {modalType && (
        <AddModal key={editingTx?.id||modalType} onImportRates={importRateHistory} lang={lang} type={modalType} config={config} members={config.members} currentUser={currentUser}
          rates={records.rates} editing={editingTx} initialDate={initialDate} onClose={() => { setModalType(null); setEditingTx(null); setInitialDate(undefined);setCalendarOccurrence(null); }} onSave={saveTx}
          onEditSeries={editingTx?.seriesId?()=>openTx(records.transactions.find(tx=>tx.id===editingTx.seriesId)):undefined}
          isCopy={!!editingTx&&!editingTx.seriesId&&!records.transactions.some(tx=>tx.id===editingTx.id)} onDuplicate={editingTx&&(editingTx.seriesId||records.transactions.some(tx=>tx.id===editingTx.id))?()=>duplicateTx(calendarOccurrence||editingTx):undefined}
          onDelete={editingTx&&records.transactions.some(tx=>tx.id===(editingTx.seriesId||editingTx.id))?()=>setConfirmDeleteTxId(editingTx.seriesId||editingTx.id):undefined}
          onDeleteOccurrence={calendarOccurrence?()=>setConfirmOccurrence(calendarOccurrence):undefined} occurrenceDate={calendarOccurrence?.date} />
      )}
      {confirmOccurrence&&<ConfirmDialog message={lang==='es'?`¿Eliminar únicamente el movimiento del ${confirmOccurrence.date}? Las demás fechas de la serie se conservan.`:`Delete only the transaction on ${confirmOccurrence.date}? Other dates in the series are kept.`} confirmLabel={t('yesDelete')} cancelLabel={t('cancel')} onCancel={()=>setConfirmOccurrence(null)} onConfirm={()=>{const current=latestRecords.current,id=confirmOccurrence.id;const next={...current,exceptions:{...current.exceptions,[id]:{...current.exceptions?.[id],skipped:true}}};latestRecords.current=next;saveRecords(next);setConfirmOccurrence(null);setModalType(null);setEditingTx(null);setInitialDate(undefined);setCalendarOccurrence(null);showToast(t('txDeleted'));}}/>}
      {confirmDeleteTxId && (
        <ConfirmDialog
          message={records.transactions.find(tx=>tx.id===confirmDeleteTxId)?.recurrence?(lang==='es'?'¿Eliminar toda la serie recurrente y sus fechas programadas? No se puede deshacer.':'Delete the entire recurring series and its scheduled dates? This cannot be undone.'):records.transactions.find(tx=>tx.id===confirmDeleteTxId)?.cashea?(lang==='es'?'¿Eliminar solo este pago de Cashea? Las demás cuotas se conservan. No se puede deshacer.':'Delete only this Cashea payment? Other installments are kept. This cannot be undone.'):t("confirmDeleteTx")}
          confirmLabel={t("yesDelete")}
          cancelLabel={t("cancel")}
          onCancel={() => setConfirmDeleteTxId(null)}
          onConfirm={() => { delTx(confirmDeleteTxId); if((editingTx?.seriesId||editingTx?.id)===confirmDeleteTxId){setModalType(null);setEditingTx(null);setInitialDate(undefined);setCalendarOccurrence(null);}setConfirmDeleteTxId(null); }}
        />
      )}
    </div>
  );
}

function RatesTab({ lang, t, rates, addRate, delRate }) {
  const C = useC();
  const [date, setDate] = useState(todayISO());
  const [rate, setRate] = useState("");
  const [confirmIdx, setConfirmIdx] = useState(null);
  const sorted = [...rates].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold" style={{ ...display, color: C.text }}>{t("rates")}</h1>
      <Card>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: C.muted }}>{t("exchangeRatesHelp")}</p>
        <div className="flex gap-2 flex-wrap items-end">
          <div>
            <label className="text-xs" style={{ color: C.muted }}>{t("rateDate")}</label>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)}
              className="block mt-1.5 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />
          </div>
          <div>
            <label className="text-xs" style={{ color: C.muted }}>{t("rateValue")}</label>
            <input type="number" min="0" step="0.01" id="tx-rate" value={rate} onChange={(e) => setRate(e.target.value)}
              className="block mt-1.5 px-3 py-2 rounded-lg text-sm outline-none w-32" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}`, ...mono }} />
          </div>
          <Btn disabled={!rate || Number(rate) <= 0} onClick={() => { addRate({ date, rate: Number(rate) }); setRate(""); }}>
            <Plus size={14} className="inline -mt-0.5 mr-1" />{t("addRate")}
          </Btn>
        </div>
      </Card>
      <Card style={{ padding: 0 }}>
        {sorted.length === 0 ? (
          <div className="py-10 text-center">
            <ArrowRightLeft size={22} className="mx-auto mb-2" style={{ color: C.muted, opacity: 0.6 }} />
            <p className="text-sm" style={{ color: C.muted }}>{t("noRates")}</p>
            <p className="text-xs mt-1" style={{ color: C.muted, opacity: 0.8 }}>{t("noRatesHint")}</p>
          </div>
        ) : sorted.map((r, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
            <span className="text-sm" style={{ color: C.text }}>{r.date}</span>
            <span className="text-sm" style={{ ...mono, color: C.gold }}>{fmt(r.rate)} Bs</span>
            <button onClick={() => setConfirmIdx(rates.indexOf(r))} aria-label={t("deleteEntry")} className="p-2 -m-0.5 rounded-lg hover:bg-black/5 transition-colors">
              <Trash2 size={14} style={{ color: C.muted }} />
            </button>
          </div>
        ))}
      </Card>
      {confirmIdx !== null && (
        <ConfirmDialog
          message={t("confirmDeleteRate")}
          confirmLabel={t("yesDelete")}
          cancelLabel={t("cancel")}
          onCancel={() => setConfirmIdx(null)}
          onConfirm={() => { delRate(confirmIdx); setConfirmIdx(null); }}
        />
      )}
    </div>
  );
}

function SettingsTab({ lang, t, config, saveConfig, setLang, currentUserId }) {
  const { C, theme, setTheme } = useThemeCtx();
  const [showCode, setShowCode] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);

  const setMemberEmoji = (memberId, emoji) => {
    saveConfig({ ...config, members: config.members.map((m) => (m.id === memberId ? { ...m, emoji } : m)) });
  };

  return (
    <div className="quanto-settings space-y-6">

      <Card>
        <p className="text-sm font-medium mb-3" style={{ color: C.text }}>{t("language")}</p>
        <div className="flex gap-2">
          <Btn variant={lang === "es" ? "primary" : "ghost"} onClick={() => setLang("es")}>Español</Btn>
          <Btn variant={lang === "en" ? "primary" : "ghost"} onClick={() => setLang("en")}>English</Btn>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium mb-3" style={{ color: C.text }}>{t("theme")}</p>
        <div className="flex gap-2">
          <Btn variant={theme === "light" ? "primary" : "ghost"} onClick={() => setTheme("light")}><Sun size={14} className="inline -mt-0.5 mr-1" />{t("light")}</Btn>
          <Btn variant={theme === "dark" ? "primary" : "ghost"} onClick={() => setTheme("dark")}><Moon size={14} className="inline -mt-0.5 mr-1" />{t("dark")}</Btn>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium mb-1 flex items-center" style={{ color: C.text }}>{t("venezuelaMode")}<InfoTip text={t("venezuelaModeHelp")} /></p>
        <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
          <input type="checkbox" checked={config.isVenezuela} onChange={(e) => saveConfig({ ...config, isVenezuela: e.target.checked })} />
          <span className="text-sm" style={{ color: C.muted }}>{config.isVenezuela ? "USD + Bs" : t("householdCurrency")}</span>
        </label>
      </Card>

      {!config.isVenezuela && (
        <Card>
          <p className="text-sm font-medium mb-3" style={{ color: C.text }}>{t("householdCurrency")}</p>
          <div className="flex gap-3">
            <div>
              <label htmlFor="settings-symbol" className="text-xs" style={{ color: C.muted }}>{t("currencySymbol")}</label>
              <input id="settings-symbol" placeholder="$" value={config.currency.symbol} onChange={(e) => saveConfig({ ...config, currency: { ...config.currency, symbol: e.target.value } })}
                className="block mt-1.5 w-20 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div>
              <label htmlFor="settings-code" className="text-xs" style={{ color: C.muted }}>{t("currencyCode")}</label>
              <input id="settings-code" placeholder="USD" maxLength={3} value={config.currency.code} onChange={(e) => saveConfig({ ...config, currency: { ...config.currency, code: e.target.value.toUpperCase() } })}
                className="block mt-1.5 w-24 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
          </div>
        </Card>
      )}

      <Card>
        <p className="text-sm font-medium mb-3 flex items-center" style={{ color: C.text }}><Users size={15} className="mr-1.5" style={{ color: C.gold }} />{t("members")}</p>
        <div className="space-y-2">
          {config.members.map((m) => (
            <div key={m.id} className="rounded-xl" style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}>
              <button
                onClick={() => setEditingMemberId(editingMemberId === m.id ? null : m.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
              >
                <Avatar m={m} size={26} />
                <span className="text-sm flex-1" style={{ color: C.text }}>{m.name}</span>
                {m.id === currentUserId && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.card2, color: C.muted }}>{t("myProfile")}</span>}
                <Pencil size={13} style={{ color: C.muted }} />
              </button>
              {editingMemberId === m.id && (
                <div className="px-3 pb-3">
                  <EmojiPicker value={m.emoji || ""} onChange={(e) => setMemberEmoji(m.id, e)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium mb-2 flex items-center" style={{ color: C.text }}><KeyRound size={15} className="mr-1.5" style={{ color: C.gold }} />{t("inviteCodeLabel")}</p>
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 rounded-lg text-sm" style={{ background: C.bgSoft, color: C.text, ...mono, letterSpacing: 1 }}>
            {showCode ? config.inviteCode : "•".repeat(config.inviteCode.length)}
          </span>
          <button onClick={() => setShowCode((s) => !s)} aria-label={showCode ? t("hide") : t("show")} className="p-1.5 -m-1.5 rounded-lg" style={{ color: C.muted }}>{showCode ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Root                                                                    */
/* ---------------------------------------------------------------------- */
export default function App() {
  useFonts();
  const [lang, setLang] = usePreference("lang");
  const [theme, setTheme] = usePreference("theme");
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null); // null = no household yet
  const [records, setRecords] = useState({ transactions: [], rates: [] });
  const [currentUser, setCurrentUser] = useState(null);
  const [gateError, setGateError] = useState("");
  const themeValue = useMemo(() => ({ C: theme === "dark" ? DARK : LIGHT, theme, setTheme }), [theme]);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await window.storage.get("household-config", true);
        if (cfg) { const parsed = JSON.parse(cfg.value); setConfig(parsed); if (window.storage.cloud) setCurrentUser(parsed.members[0]); }
      } catch (e) { /* no household yet */ }
      try {
        const rec = await window.storage.get("finance-records", true);
        if (rec) setRecords(JSON.parse(rec.value));
      } catch (e) { /* none yet */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const receive = (event) => {
      try {
        if (event.detail["household-config"]) { const next = JSON.parse(event.detail["household-config"]); setConfig(next); setCurrentUser(current => next.members.find(member => member.id === current?.id) || next.members[0]); }
        if (event.detail["finance-records"]) setRecords(JSON.parse(event.detail["finance-records"]));
      } catch (error) { console.error("Cloud data could not be loaded", error); }
    };
    window.addEventListener("quanto-cloud-data", receive);
    return () => window.removeEventListener("quanto-cloud-data", receive);
  }, []);

  const saveConfig = useCallback(async (next) => {
    setConfig(next);
    try { await window.storage.set("household-config", JSON.stringify(next), true); } catch (e) { console.error(e); }
  }, []);

  const saveRecords = useCallback(async (next) => {
    setRecords(next);
    try { await window.storage.set("finance-records", JSON.stringify(next), true); } catch (e) { console.error(e); }
  }, []);

  const handleCreate = async (code, name, color, emoji) => {
    const member = { id: uid(), name, color, emoji };
    const next = {
      inviteCode: code,
      members: [member],
      currency: { symbol: "$", code: "USD" },
      isVenezuela: false,
      budget: { needsPct: 50, wantsPct: 30, savingsPct: 20, emergencyMonths: 6 },
    };
    await saveConfig(next);
    setCurrentUser(member);
  };

  const onJoin = {
    checkCode: (code) => !!config && code === config.inviteCode,
    pick: (memberId) => setCurrentUser(config.members.find((m) => m.id === memberId)),
    addNew: async (name, color, emoji) => {
      const member = { id: uid(), name, color, emoji };
      const next = { ...config, members: [...config.members, member] };
      await saveConfig(next);
      setCurrentUser(member);
    },
  };

  const screen = !currentUser ? (
    <Gate
      lang={lang} setLang={setLang}
      householdExists={!!config}
      loading={loading}
      onCreate={handleCreate}
      onJoin={onJoin}
      error={gateError}
      config={config}
    />
  ) : (
    <Dashboard
      lang={lang} setLang={setLang}
      config={config} saveConfig={saveConfig}
      records={records} saveRecords={saveRecords}
      currentUser={currentUser}
      onLogout={() => window.storage.cloud ? window.storage.signOut() : setCurrentUser(null)}
    />
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <ToastProvider>{screen}</ToastProvider>
    </ThemeContext.Provider>
  );
}
