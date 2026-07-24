import React, { useState, useEffect, useMemo, useCallback, useContext, createContext } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, Landmark, CreditCard, ShieldCheck,
  Home, Car, Utensils, HeartPulse, GraduationCap, Film, Coins,
  ArrowRightLeft, Users, Lock, Globe, Settings as SettingsIcon, Plus, X,
  Check, Info, Calendar, LogOut, UserPlus, Banknote, Building2, Briefcase,
  Eye, EyeOff, Sparkles, Trash2, PiggyBank, KeyRound, LayoutGrid, Receipt,
  Scale, Pencil, Sun, Moon,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  Design tokens (dark + light)                                           */
/* ---------------------------------------------------------------------- */
const BRAND_GOLD = "#B18F32";
const BRAND_GREEN = "#0F7C42";
const BRAND_GRAD = `linear-gradient(135deg, ${BRAND_GREEN} 0%, ${BRAND_GOLD} 100%)`;

const DARK = {
  bg: "#0A0B09",
  bgSoft: "#14160F",
  card: "rgba(255,255,255,0.035)",
  card2: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.09)",
  gold: "#D8A93F",
  goldSoft: "#EBCB7A",
  teal: "#22B573",
  red: "#E2665A",
  violet: "#6B8896",
  text: "#F5F5F0",
  muted: "#93917F",
  grad: BRAND_GRAD,
};
const LIGHT = {
  bg: "#F4F3ED",
  bgSoft: "#FFFFFF",
  card: "rgba(255,255,255,0.8)",
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
    `;
    document.head.appendChild(link);
  }, []);
}

const display = { fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const body = { fontFamily: "'Inter', sans-serif" };

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const todayISO = () => new Date().toISOString().slice(0, 10);

const LOGO_DATA_URI = "data:image/png;base64,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";

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
    logout: "Cambiar de usuario",
    income: "Ingresos",
    expenses: "Egresos",
    assets: "Activos",
    liabilities: "Pasivos",
    netWorth: "Patrimonio neto",
    thisMonth: "este mes",
    total: "total",
    addMovement: "Añadir movimiento",
    all: "Todos",
    date: "Fecha",
    description: "Descripción",
    category: "Categoría",
    amount: "Monto",
    owner: "De",
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
    liabilityTip: "Lo que debes: tarjetas, préstamos e hipotecas.",
    netWorthTip: "Activos menos pasivos: tu situación financiera real.",
    heroSub: "Un solo lugar para ver, en pareja, de dónde viene el dinero y a dónde va.",
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
    logout: "Switch user",
    income: "Income",
    expenses: "Expenses",
    assets: "Assets",
    liabilities: "Liabilities",
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
    liabilityTip: "What you owe: cards, loans, and mortgages.",
    netWorthTip: "Assets minus liabilities: your real financial position.",
    heroSub: "One place to see, together, where the money comes from and where it goes.",
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
  ],
  egreso: [
    { id: "vivienda", icon: Home, es: "Vivienda", en: "Housing", tipEs: "Alquiler, cuota, servicios, mantenimiento.", tipEn: "Rent, mortgage payment, utilities, upkeep." },
    { id: "alimentacion", icon: Utensils, es: "Alimentación", en: "Food", tipEs: "Mercado y comidas fuera de casa.", tipEn: "Groceries and eating out." },
    { id: "transporte", icon: Car, es: "Transporte", en: "Transportation", tipEs: "Gasolina, transporte público, mantenimiento del vehículo.", tipEn: "Gas, public transit, vehicle upkeep." },
    { id: "salud", icon: HeartPulse, es: "Salud", en: "Health", tipEs: "Médicos, medicinas, seguro de salud.", tipEn: "Doctors, medicine, health insurance." },
    { id: "educacion", icon: GraduationCap, es: "Educación", en: "Education", tipEs: "Colegiaturas, cursos, materiales.", tipEn: "Tuition, courses, materials." },
    { id: "entretenimiento", icon: Film, es: "Entretenimiento", en: "Entertainment", tipEs: "Salidas, streaming, hobbies.", tipEn: "Outings, streaming, hobbies." },
    { id: "deudas", icon: CreditCard, es: "Pago de deudas", en: "Debt payments", tipEs: "Abonos a tarjetas o préstamos.", tipEn: "Payments toward cards or loans." },
    { id: "otro_egreso", icon: Banknote, es: "Otro egreso", en: "Other expense", tipEs: "Cualquier otro gasto.", tipEn: "Any other spending." },
  ],
  activo: [
    { id: "efectivo", icon: Wallet, es: "Efectivo", en: "Cash", tipEs: "Dinero físico o en cuentas de uso diario.", tipEn: "Physical cash or everyday spending accounts." },
    { id: "cuenta_bancaria", icon: Landmark, es: "Cuenta bancaria", en: "Bank account", tipEs: "Saldos en cuentas de ahorro o corriente.", tipEn: "Balances in savings or checking accounts." },
    { id: "fondo_emergencia", icon: ShieldCheck, es: "Fondo de emergencia", en: "Emergency fund", tipEs: "Dinero apartado solo para imprevistos.", tipEn: "Money set aside only for emergencies." },
    { id: "inversion", icon: TrendingUp, es: "Inversiones", en: "Investments", tipEs: "Acciones, fondos, cripto, negocios propios.", tipEn: "Stocks, funds, crypto, your own ventures." },
    { id: "bienes", icon: Building2, es: "Bienes (propiedad / vehículo)", en: "Property / vehicles", tipEs: "Valor de propiedades o vehículos que posees.", tipEn: "Value of property or vehicles you own." },
    { id: "otro_activo", icon: Coins, es: "Otro activo", en: "Other asset", tipEs: "Cualquier otra cosa de valor que posees.", tipEn: "Anything else of value you own." },
  ],
  pasivo: [
    { id: "tarjeta", icon: CreditCard, es: "Tarjeta de crédito", en: "Credit card", tipEs: "Saldo pendiente en tarjetas.", tipEn: "Outstanding balance on cards." },
    { id: "prestamo", icon: Banknote, es: "Préstamo", en: "Loan", tipEs: "Deuda de préstamos personales o de estudio.", tipEn: "Personal or student loan debt." },
    { id: "hipoteca", icon: Home, es: "Hipoteca", en: "Mortgage", tipEs: "Saldo pendiente de tu vivienda.", tipEn: "Outstanding balance on your home." },
    { id: "otro_pasivo", icon: Coins, es: "Otro pasivo", en: "Other liability", tipEs: "Cualquier otra deuda.", tipEn: "Any other debt." },
  ],
};
const typeMeta = (C) => ({
  ingreso: { icon: TrendingUp, color: C.teal },
  egreso: { icon: TrendingDown, color: C.red },
  activo: { icon: Landmark, color: C.gold },
  pasivo: { icon: Scale, color: C.violet },
});
const NEEDS_CATS = ["vivienda", "alimentacion", "salud", "transporte", "deudas"];
const SAVINGS_CATS = ["fondo_emergencia", "inversion"];
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
  if (type === "egreso") return NEEDS_CATS.includes(catId) ? "necesidad" : "gusto";
  if (type === "activo") return SAVINGS_CATS.includes(catId) ? "ahorro" : null;
  return null;
}
function effTag(tx) {
  return tx.tag || suggestTag(tx.type, tx.catId);
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

function Card({ children, style, className = "" }) {
  const C = useC();
  return (
    <div
      className={`rounded-[28px] p-6 backdrop-blur-xl ${className}`}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", className = "", type = "button", disabled }) {
  const C = useC();
  const styles = {
    primary: { background: C.grad, color: "#fff", boxShadow: "0 6px 20px -6px rgba(15,124,66,0.5)" },
    ghost: { background: C.card2, color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.red, border: `1px solid ${C.red}55` },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:shadow-none ${className}`}
      style={{ ...styles[variant], ...body }}
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
      src={LOGO_DATA_URI}
      alt="Quanto"
      style={{ height, width: "auto", objectFit: "contain" }}
      onError={() => setError(true)}
    />
  );
}

function ThemeToggle({ className = "" }) {
  const { theme, setTheme, C } = useThemeCtx();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: C.bg, ...body }}>
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: C.grad }} />
      <div className="absolute -bottom-52 -right-40 w-[520px] h-[520px] rounded-full opacity-[0.12] blur-3xl pointer-events-none" style={{ background: C.teal }} />

      <div className="absolute top-5 right-5 flex items-center gap-2">
        <ThemeToggle />
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
function AddModal({ lang, type, config, members, currentUser, rates, editing, onClose, onSave }) {
  const C = useC();
  const t = (k) => STR[lang][k];
  const cats = CATS[type];
  const [catId, setCatId] = useState(editing?.catId || cats[0].id);
  const [desc, setDesc] = useState(editing?.desc || "");
  const [date, setDate] = useState(editing?.date || todayISO());
  const [currency, setCurrency] = useState(editing?.currency || (config.isVenezuela ? "USD" : config.currency.code));
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [rate, setRate] = useState(editing?.rate ? String(editing.rate) : "");
  const [ownerId, setOwnerId] = useState(editing?.ownerId || currentUser.id);
  const [isPrivate, setIsPrivate] = useState(editing?.private || false);
  const [tag, setTagRaw] = useState(editing?.tag ?? suggestTag(type, editing?.catId || cats[0].id));
  const [tagTouched, setTagTouched] = useState(!!editing?.tag);
  const setTag = (v) => { setTagRaw(v); setTagTouched(true); };
  const showTags = type === "egreso" || type === "activo";

  useEffect(() => {
    if (!tagTouched) setTagRaw(suggestTag(type, catId));
  }, [catId]); // eslint-disable-line

  useEffect(() => {
    if (editing) return; // don't auto-fill rate when editing an existing entry
    if (config.isVenezuela && currency === "BS") {
      const sorted = [...rates].filter((r) => r.date <= date).sort((a, b) => (a.date < b.date ? 1 : -1));
      const nearest = sorted[0] || [...rates].sort((a, b) => (a.date < b.date ? -1 : 1))[0];
      if (nearest) setRate(String(nearest.rate));
    }
  }, [currency, date]); // eslint-disable-line

  const TYPE_META = typeMeta(C);
  const TAG_META = tagMeta(C);
  const meta = TYPE_META[type];
  const canSave = desc.trim() && amount && Number(amount) > 0 && (currency !== "BS" || Number(rate) > 0);

  const save = () => {
    const amt = Number(amount);
    const usedRate = currency === "BS" ? Number(rate) : null;
    onSave({
      id: editing ? editing.id : uid(), type, catId, desc: desc.trim(), date, currency,
      amount: amt, rate: usedRate, ownerId, private: isPrivate, tag: showTags ? tag : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#05090F99" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: C.bg === DARK.bg ? "#15170F" : "#FFFFFF", border: `1px solid ${C.border}`, ...body }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <meta.icon size={17} style={{ color: meta.color }} />
            <h3 className="font-medium" style={{ color: C.text }}>{editing ? t("editEntry") : t("addMovement")} · {t(type === "ingreso" ? "income" : type === "egreso" ? "expenses" : type === "activo" ? "assets" : "liabilities")}</h3>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: C.muted }} /></button>
        </div>

        <label className="text-xs" style={{ color: C.muted }}>{t("category")}</label>
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

        <label className="text-xs" style={{ color: C.muted }}>{t("description")}</label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("optionalNote")}
          className="w-full mt-1.5 mb-3 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs" style={{ color: C.muted }}>{t("date")}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()}
              className="w-full mt-1.5 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />
          </div>
          <div>
            <label className="text-xs" style={{ color: C.muted }}>{t("owner")}</label>
            <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className={`grid ${config.isVenezuela ? "grid-cols-3" : "grid-cols-1"} gap-2 mb-3`}>
          {config.isVenezuela && (
            <div>
              <label className="text-xs" style={{ color: C.muted }}>{t("currency")}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-1.5 px-2 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }}>
                <option value="USD">USD</option>
                <option value="BS">Bs</option>
              </select>
            </div>
          )}
          <div className={config.isVenezuela ? "col-span-1" : ""}>
            <label className="text-xs" style={{ color: C.muted }}>{t("amountInCurrency")} {!config.isVenezuela && `(${config.currency.symbol})`}</label>
            <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              className="w-full mt-1.5 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}`, ...mono }} />
          </div>
          {config.isVenezuela && currency === "BS" && (
            <div>
              <label className="text-xs" style={{ color: C.muted }}>{t("rateUsed")}</label>
              <input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)}
                className="w-full mt-1.5 px-2 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}`, ...mono }} />
            </div>
          )}
        </div>

        {showTags && (
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

        <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          <span className="text-sm flex items-center" style={{ color: C.text }}><Lock size={12} className="mr-1" style={{ color: C.muted }} />{t("private")}</span>
          <InfoTip text={t("privateHelp")} />
        </label>

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
  const { C, theme, setTheme } = useThemeCtx();
  const TYPE_META = typeMeta(C);
  const TAG_META = tagMeta(C);
  const t = (k) => STR[lang][k];
  const [tab, setTab] = useState("overview");
  const [modalType, setModalType] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [txFilter, setTxFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const me = config.members.find((m) => m.id === currentUser.id) || currentUser;

  const visibleTx = useMemo(
    () => records.transactions.filter((tx) => !tx.private || tx.ownerId === currentUser.id),
    [records.transactions, currentUser.id]
  );

  const toUSD = useCallback((tx) => {
    if (!config.isVenezuela) return tx.amount;
    return tx.currency === "BS" ? tx.amount / (tx.rate || 1) : tx.amount;
  }, [config.isVenezuela]);

  const latestRate = useMemo(() => {
    if (!records.rates.length) return null;
    return [...records.rates].sort((a, b) => (a.date < b.date ? 1 : -1))[0].rate;
  }, [records.rates]);

  const totals = useMemo(() => {
    const sums = { ingreso: 0, egreso: 0, activo: 0, pasivo: 0 };
    visibleTx.forEach((tx) => { sums[tx.type] += toUSD(tx); });
    return sums;
  }, [visibleTx, toUSD]);

  const monthKey = todayISO().slice(0, 7);
  const monthTotals = useMemo(() => {
    const sums = { ingreso: 0, egreso: 0 };
    visibleTx.filter((tx) => tx.date.slice(0, 7) === monthKey).forEach((tx) => {
      if (sums[tx.type] !== undefined) sums[tx.type] += toUSD(tx);
    });
    return sums;
  }, [visibleTx, toUSD, monthKey]);

  const netWorth = totals.activo - totals.pasivo;

  const pieData = useMemo(() => {
    const byCat = {};
    visibleTx.filter((tx) => tx.type === "egreso" && tx.date.slice(0, 7) === monthKey).forEach((tx) => {
      byCat[tx.catId] = (byCat[tx.catId] || 0) + toUSD(tx);
    });
    return Object.entries(byCat).map(([catId, value]) => {
      const cat = CATS.egreso.find((c) => c.id === catId);
      return { name: cat ? (lang === "es" ? cat.es : cat.en) : catId, value: Number(value.toFixed(2)) };
    });
  }, [visibleTx, toUSD, monthKey, lang]);

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
        if (tx.type === "egreso") exp += toUSD(tx);
      });
      out.push({ month: label, [t("income")]: Number(inc.toFixed(2)), [t("expenses")]: Number(exp.toFixed(2)) });
    }
    return out;
  }, [visibleTx, toUSD, lang]);

  const memberOf = (id) => config.members.find((m) => m.id === id);
  const currSym = config.isVenezuela ? "$" : config.currency.symbol;

  const money = (v) => `${currSym}${fmt(v)}`;

  /* ---- budget math ---- */
  const b = config.budget;
  const emergencyTarget = monthTotals.egreso > 0 ? monthTotals.egreso * b.emergencyMonths : totals.egreso / 6 * b.emergencyMonths;
  const emergencyCurrent = visibleTx.filter((tx) => tx.type === "activo" && tx.catId === "fondo_emergencia").reduce((s, tx) => s + toUSD(tx), 0);
  const emergencyPct = emergencyTarget > 0 ? Math.min(100, (emergencyCurrent / emergencyTarget) * 100) : 0;
  const recNeeds = monthTotals.ingreso * (b.needsPct / 100);
  const recWants = monthTotals.ingreso * (b.wantsPct / 100);
  const recSavings = monthTotals.ingreso * (b.savingsPct / 100);
  const actualNeeds = visibleTx.filter((tx) => tx.type === "egreso" && tx.date.slice(0, 7) === monthKey && effTag(tx) === "necesidad").reduce((s, tx) => s + toUSD(tx), 0);
  const actualWants = visibleTx.filter((tx) => tx.type === "egreso" && tx.date.slice(0, 7) === monthKey && effTag(tx) === "gusto").reduce((s, tx) => s + toUSD(tx), 0);
  const actualSavings = visibleTx.filter((tx) => tx.type === "activo" && tx.date.slice(0, 7) === monthKey && effTag(tx) === "ahorro").reduce((s, tx) => s + toUSD(tx), 0);
  const emergencyFull = emergencyPct >= 100;

  const setBudget = (patch) => saveConfig({ ...config, budget: { ...config.budget, ...patch } });

  const NAV = [
    { id: "overview", label: t("overview"), icon: LayoutGrid },
    { id: "transactions", label: t("transactions"), icon: Receipt },
    { id: "budget", label: t("budget"), icon: PiggyBank },
    ...(config.isVenezuela ? [{ id: "rates", label: t("rates"), icon: ArrowRightLeft }] : []),
    { id: "settings", label: t("settings"), icon: SettingsIcon },
  ];

  const saveTx = (tx) => {
    const exists = records.transactions.some((t) => t.id === tx.id);
    const next = exists ? records.transactions.map((t) => (t.id === tx.id ? tx : t)) : [tx, ...records.transactions];
    saveRecords({ ...records, transactions: next });
  };
  const delTx = (id) => saveRecords({ ...records, transactions: records.transactions.filter((tx) => tx.id !== id) });
  const addRate = (r) => saveRecords({ ...records, rates: [...records.rates, r] });
  const delRate = (idx) => saveRecords({ ...records, rates: records.rates.filter((_, i) => i !== idx) });

  return (
    <div className="min-h-screen flex relative" style={{ background: C.bg, ...body }}>
      <div className="fixed -top-60 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: C.grad }} />
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
        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Avatar m={me} size={24} />
            <span className="text-sm font-medium" style={{ color: C.text }}>{me.name}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs" style={{ color: C.muted, border: `1px solid ${C.border}` }}>
              <Globe size={14} /> {lang === "es" ? "EN" : "ES"}
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs" style={{ color: C.muted, border: `1px solid ${C.border}` }}>
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} {theme === "dark" ? t("light") : t("dark")}
            </button>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs" style={{ color: C.muted }}>
            <LogOut size={14} /> {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* mobile top bar */}
        <div className="flex md:hidden items-center justify-between mb-4">
          <Logo height={22} />
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ color: C.muted }}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button onClick={() => setLang(lang === "es" ? "en" : "es")} style={{ color: C.muted }}><Globe size={16} /></button>
          </div>
        </div>
        <div className="flex md:hidden gap-1.5 mb-5 overflow-x-auto pb-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap font-medium"
              style={{ background: tab === n.id ? C.grad : C.card, color: tab === n.id ? "#fff" : C.muted, border: `1px solid ${C.border}` }}>
              <n.icon size={13} /> {n.label}
            </button>
          ))}
        </div>

        {config.isVenezuela && latestRate && (
          <div className="mb-5 flex items-center gap-2 px-4 py-2 rounded-full text-xs w-fit" style={{ background: C.card2, color: C.goldSoft, ...mono }}>
            <ArrowRightLeft size={12} /> {t("latestRate")}: 1 USD = {fmt(latestRate)} Bs
          </div>
        )}

        {tab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold" style={{ ...display, color: C.text }}>{t("overview")}</h1>
              <p className="text-sm mt-1" style={{ color: C.muted }}>{t("heroSub")}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "ingreso", label: t("income"), tip: t("incomeTip"), val: monthTotals.ingreso, sub: t("thisMonth") },
                { key: "egreso", label: t("expenses"), tip: t("expenseTip"), val: monthTotals.egreso, sub: t("thisMonth") },
                { key: "activo", label: t("assets"), tip: t("assetTip"), val: totals.activo, sub: t("total") },
                { key: "pasivo", label: t("liabilities"), tip: t("liabilityTip"), val: totals.pasivo, sub: t("total") },
              ].map((card) => {
                const meta = TYPE_META[card.key];
                return (
                  <Card key={card.key}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}22` }}>
                        <meta.icon size={15} style={{ color: meta.color }} />
                      </div>
                      <InfoTip text={card.tip} />
                    </div>
                    <p className="text-xs" style={{ color: C.muted }}>{card.label}</p>
                    <p className="text-xl font-semibold mt-0.5" style={{ ...mono, color: C.text }}>{money(card.val)}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{card.sub}</p>
                    {config.isVenezuela && latestRate && (
                      <p className="text-[11px] mt-1" style={{ color: C.goldSoft }}>≈ {fmt(card.val * latestRate)} Bs</p>
                    )}
                  </Card>
                );
              })}
            </div>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs flex items-center" style={{ color: C.muted }}>{t("netWorth")}<InfoTip text={t("netWorthTip")} /></p>
                  <p className="text-3xl font-semibold mt-1" style={{ ...display, color: netWorth >= 0 ? C.teal : C.red }}>{money(netWorth)}</p>
                </div>
                <Scale size={28} style={{ color: C.muted }} />
              </div>
            </Card>

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
          </div>
        )}

        {tab === "transactions" && (
          <div>
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
                return (
                  <button key={ty} onClick={() => { setModalType(ty); setEditingTx(null); }} title={ty} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55` }}>
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

            <Card style={{ padding: 0 }}>
              {visibleTx.filter((tx) => (txFilter === "all" || tx.type === txFilter) && (tagFilter === "all" || effTag(tx) === tagFilter)).length === 0 ? (
                <p className="text-sm py-12 text-center" style={{ color: C.muted }}>{t("noTx")}</p>
              ) : (
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {visibleTx.filter((tx) => (txFilter === "all" || tx.type === txFilter) && (tagFilter === "all" || effTag(tx) === tagFilter))
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .map((tx) => {
                      const cat = CATS[tx.type].find((c) => c.id === tx.catId);
                      const meta = TYPE_META[tx.type];
                      const owner = memberOf(tx.ownerId);
                      const usd = toUSD(tx);
                      const rowTag = effTag(tx);
                      return (
                        <div key={tx.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${meta.color}22` }}>
                            {cat && <cat.icon size={15} style={{ color: meta.color }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: C.text }}>{tx.desc || (cat ? (lang === "es" ? cat.es : cat.en) : "")}</p>
                            <p className="text-[11px] flex items-center gap-1.5 flex-wrap" style={{ color: C.muted }}>
                              {cat ? (lang === "es" ? cat.es : cat.en) : ""} · {tx.date}
                              {tx.private && <Lock size={10} />}
                              {rowTag && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${TAG_META[rowTag].color}1F`, color: TAG_META[rowTag].color }}>
                                  {t(TAG_INFO[rowTag].labelKey)}
                                </span>
                              )}
                            </p>
                          </div>
                          {owner && <Avatar m={owner} size={20} />}
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium" style={{ ...mono, color: meta.color }}>
                              {tx.type === "egreso" || tx.type === "pasivo" ? "-" : "+"}{config.isVenezuela ? `$${fmt(usd)}` : money(tx.amount)}
                            </p>
                            {config.isVenezuela && tx.currency === "BS" && <p className="text-[10px]" style={{ color: C.muted }}>{fmt(tx.amount)} Bs @ {fmt(tx.rate)}</p>}
                          </div>
                          <button onClick={() => { setModalType(tx.type); setEditingTx(tx); }} className="shrink-0"><Pencil size={14} style={{ color: C.muted }} /></button>
                          <button onClick={() => delTx(tx.id)} className="shrink-0"><Trash2 size={14} style={{ color: C.muted }} /></button>
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === "budget" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold" style={{ ...display, color: C.text }}>{t("budget")}</h1>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium flex items-center" style={{ color: C.text }}>{t("budgetRule")}<InfoTip text="50/30/20: 50% necesidades, 30% gustos, 20% ahorro." /></p>
                <button onClick={() => setBudget({ needsPct: 50, wantsPct: 30, savingsPct: 20 })} className="text-xs" style={{ color: C.gold }}>{t("resetBudget")}</button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { key: "needsPct", label: t("needs"), tip: t("needsHelp"), color: C.red },
                  { key: "wantsPct", label: t("wants"), tip: t("wantsHelp"), color: C.gold },
                  { key: "savingsPct", label: t("savings"), tip: t("savingsHelp"), color: C.teal },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs flex items-center mb-1.5" style={{ color: C.muted }}>{f.label}<InfoTip text={f.tip} /></label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="100" value={b[f.key]} onChange={(e) => setBudget({ [f.key]: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: f.color, border: `1px solid ${C.border}`, ...mono }} />
                      <span className="text-sm" style={{ color: C.muted }}>%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: (b.needsPct + b.wantsPct + b.savingsPct) === 100 ? C.muted : C.red }}>
                {t("percentTotal")}: {b.needsPct + b.wantsPct + b.savingsPct}% {(b.needsPct + b.wantsPct + b.savingsPct) !== 100 && `— ${t("mustSum100")}`}
              </p>
              <div className="mt-4">
                <label className="text-xs flex items-center mb-1.5" style={{ color: C.muted }}>{t("emergencyMonths")}<InfoTip text={t("emergencyMonthsHelp")} /></label>
                <input type="range" min="3" max="6" value={b.emergencyMonths} onChange={(e) => setBudget({ emergencyMonths: Number(e.target.value) })} className="w-full max-w-xs" />
                <span className="text-sm ml-2" style={{ ...mono, color: C.gold }}>{b.emergencyMonths}</span>
              </div>
            </Card>

            <Card>
              <p className="text-sm font-medium mb-1" style={{ color: C.text }}>{t("recommendedFor")}</p>
              <p className="text-xs mb-4" style={{ color: C.muted }}>{t("monthlyIncome")}: {money(monthTotals.ingreso)}</p>
              <div className="space-y-4">
                {[
                  { label: t("needs"), rec: recNeeds, act: actualNeeds, color: C.red },
                  { label: t("wants"), rec: recWants, act: actualWants, color: C.gold },
                  { label: t("savings"), rec: recSavings, act: actualSavings, color: C.teal },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1" style={{ color: C.muted }}>
                      <span>{row.label}</span>
                      <span style={{ ...mono }}>{money(row.act)} {t("actual")} / {money(row.rec)} {t("recommended")}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: C.bgSoft }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.rec > 0 ? (row.act / row.rec) * 100 : 0)}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <p className="text-sm font-medium mb-3 flex items-center" style={{ color: C.text }}><ShieldCheck size={15} className="mr-1.5" style={{ color: C.gold }} />{t("emergencyFund")}</p>
                <p className="text-2xl font-semibold" style={{ ...mono, color: C.gold }}>{money(emergencyCurrent)}</p>
                <p className="text-xs mb-2" style={{ color: C.muted }}>{t("total")}: {money(emergencyTarget)}</p>
                <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: C.bgSoft }}>
                  <div className="h-full rounded-full" style={{ width: `${emergencyPct}%`, background: C.gold }} />
                </div>
                <p className="text-xs" style={{ color: C.muted }}>{emergencyPct.toFixed(0)}% {t("emergencyProgress")}</p>
              </Card>
              <Card>
                <p className="text-sm font-medium mb-3 flex items-center" style={{ color: C.text }}><Sparkles size={15} className="mr-1.5" style={{ color: C.teal }} />{t("investmentSuggestion")}</p>
                <p className="text-2xl font-semibold" style={{ ...mono, color: C.teal }}>{money(emergencyFull ? recSavings : 0)}</p>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: C.muted }}>{emergencyFull ? t("investHelpFull") : t("investHelpPartial")}</p>
              </Card>
            </div>
          </div>
        )}

        {tab === "rates" && config.isVenezuela && (
          <RatesTab lang={lang} t={t} rates={records.rates} addRate={addRate} delRate={delRate} />
        )}

        {tab === "settings" && (
          <SettingsTab lang={lang} t={t} config={config} saveConfig={saveConfig} setLang={setLang} currentUserId={currentUser.id} />
        )}
      </main>

      {modalType && (
        <AddModal lang={lang} type={modalType} config={config} members={config.members} currentUser={currentUser}
          rates={records.rates} editing={editingTx} onClose={() => { setModalType(null); setEditingTx(null); }} onSave={saveTx} />
      )}
    </div>
  );
}

function RatesTab({ lang, t, rates, addRate, delRate }) {
  const C = useC();
  const [date, setDate] = useState(todayISO());
  const [rate, setRate] = useState("");
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
            <input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)}
              className="block mt-1.5 px-3 py-2 rounded-lg text-sm outline-none w-32" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}`, ...mono }} />
          </div>
          <Btn disabled={!rate || Number(rate) <= 0} onClick={() => { addRate({ date, rate: Number(rate) }); setRate(""); }}>
            <Plus size={14} className="inline -mt-0.5 mr-1" />{t("addRate")}
          </Btn>
        </div>
      </Card>
      <Card style={{ padding: 0 }}>
        {sorted.length === 0 ? (
          <p className="text-sm py-10 text-center" style={{ color: C.muted }}>{t("noRates")}</p>
        ) : sorted.map((r, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
            <span className="text-sm" style={{ color: C.text }}>{r.date}</span>
            <span className="text-sm" style={{ ...mono, color: C.gold }}>{fmt(r.rate)} Bs</span>
            <button onClick={() => delRate(rates.indexOf(r))}><Trash2 size={14} style={{ color: C.muted }} /></button>
          </div>
        ))}
      </Card>
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
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold" style={{ ...display, color: C.text }}>{t("settings")}</h1>

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
              <label className="text-xs" style={{ color: C.muted }}>{t("currencySymbol")}</label>
              <input value={config.currency.symbol} onChange={(e) => saveConfig({ ...config, currency: { ...config.currency, symbol: e.target.value } })}
                className="block mt-1.5 w-20 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bgSoft, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div>
              <label className="text-xs" style={{ color: C.muted }}>{t("currencyCode")}</label>
              <input value={config.currency.code} onChange={(e) => saveConfig({ ...config, currency: { ...config.currency, code: e.target.value.toUpperCase() } })}
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
          <button onClick={() => setShowCode((s) => !s)} style={{ color: C.muted }}>{showCode ? <EyeOff size={16} /> : <Eye size={16} />}</button>
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
  const [lang, setLang] = useState("es");
  const [theme, setTheme] = useState("dark");
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
        if (cfg) setConfig(JSON.parse(cfg.value));
      } catch (e) { /* no household yet */ }
      try {
        const rec = await window.storage.get("finance-records", true);
        if (rec) setRecords(JSON.parse(rec.value));
      } catch (e) { /* none yet */ }
      setLoading(false);
    })();
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
      onLogout={() => setCurrentUser(null)}
    />
  );

  return <ThemeContext.Provider value={themeValue}>{screen}</ThemeContext.Provider>;
}
