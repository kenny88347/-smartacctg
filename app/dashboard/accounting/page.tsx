"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type TxnType = "income" | "expense";
type ThemeKey =
  | "deepTeal"
  | "pink"
  | "blackGold"
  | "lightRed"
  | "nature"
  | "sky"
  | "futureForest";

type Txn = {
  id: string;
  user_id?: string;
  txn_date: string;
  txn_type: TxnType;
  amount: number;
  category_name?: string | null;
  debt_amount?: number | null;
  note?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  created_at?: string | null;
};

type Customer = {
  id: string;
  user_id?: string;
  name?: string | null;
  phone?: string | null;
  company_name?: string | null;
};

type Product = {
  id: string;
  user_id?: string;
  name?: string | null;
  price?: number | null;
  cost?: number | null;
  stock_qty?: number | null;
};

type Invoice = {
  id: string;
  user_id?: string;
  customer_id?: string | null;
  customer_name?: string | null;
  invoice_no?: string | null;
  invoice_date?: string | null;
  created_at?: string | null;
  total?: number | null;
  total_profit?: number | null;
  note?: string | null;
};

type Profile = {
  id?: string;
  theme?: string | null;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";

const LANG_KEY = "smartacctg_lang";
const THEME_KEY = "smartacctg_theme";

const today = () => new Date().toISOString().slice(0, 10);

const THEMES: Record<
  ThemeKey,
  {
    name: string;
    pageBg: string;
    card: string;
    border: string;
    accent: string;
    text: string;
    subText: string;
    softBg: string;
    glow: string;
  }
> = {
  deepTeal: {
    name: "深青色",
    pageBg: "#ecfdf5",
    card: "#ffffff",
    border: "#14b8a6",
    accent: "#0f766e",
    text: "#064e3b",
    subText: "#64748b",
    softBg: "#ccfbf1",
    glow: "0 0 0 1px rgba(20,184,166,0.35), 0 16px 36px rgba(20,184,166,0.22)",
  },
  pink: {
    name: "可爱粉色",
    pageBg: "#fff7fb",
    card: "#ffffff",
    border: "#f472b6",
    accent: "#db2777",
    text: "#4a044e",
    subText: "#831843",
    softBg: "#fce7f3",
    glow: "0 0 0 1px rgba(244,114,182,0.32), 0 16px 36px rgba(244,114,182,0.20)",
  },
  blackGold: {
    name: "黑金商务",
    pageBg: "#111111",
    card: "#1f1f1f",
    border: "#facc15",
    accent: "#d4af37",
    text: "#fff7ed",
    subText: "#d6c8a4",
    softBg: "#3b2f16",
    glow: "0 0 0 1px rgba(250,204,21,0.38), 0 16px 38px rgba(250,204,21,0.20)",
  },
  lightRed: {
    name: "可爱浅红",
    pageBg: "#fff1f2",
    card: "#ffffff",
    border: "#fb7185",
    accent: "#e11d48",
    text: "#881337",
    subText: "#9f1239",
    softBg: "#ffe4e6",
    glow: "0 0 0 1px rgba(251,113,133,0.35), 0 16px 36px rgba(251,113,133,0.20)",
  },
  nature: {
    name: "风景自然系",
    pageBg: "#f0fdf4",
    card: "#ffffff",
    border: "#22d3ee",
    accent: "#0f766e",
    text: "#14532d",
    subText: "#166534",
    softBg: "#dcfce7",
    glow: "0 0 0 1px rgba(34,211,238,0.32), 0 16px 36px rgba(34,211,238,0.20)",
  },
  sky: {
    name: "天空蓝",
    pageBg: "#eff6ff",
    card: "#ffffff",
    border: "#38bdf8",
    accent: "#0284c7",
    text: "#0f172a",
    subText: "#0369a1",
    softBg: "#dbeafe",
    glow: "0 0 0 1px rgba(56,189,248,0.35), 0 16px 36px rgba(56,189,248,0.20)",
  },
  futureForest: {
    name: "未来世界｜深林青色",
    pageBg:
      "radial-gradient(circle at 8% 0%, rgba(45,212,191,0.32), transparent 30%), radial-gradient(circle at 92% 8%, rgba(20,184,166,0.22), transparent 32%), linear-gradient(135deg,#011c1a 0%,#032b29 38%,#064e3b 100%)",
    card: "rgba(6,47,42,0.94)",
    border: "#2dd4bf",
    accent: "#2dd4bf",
    text: "#ecfeff",
    subText: "#99f6e4",
    softBg: "rgba(20,184,166,0.18)",
    glow:
      "0 0 0 1px rgba(45,212,191,0.55), 0 0 26px rgba(45,212,191,0.42), 0 22px 58px rgba(6,78,59,0.62)",
  },
};

const TXT = {
  zh: {
    title: "帐目记录",
    back: "返回控制台",
    add: "新增记账",
    edit: "编辑",
    delete: "删除",
    save: "保存记账",
    update: "保存修改",
    cancel: "取消",
    close: "关闭",
    searchTitle: "快速搜索帐目记录",
    search: "搜索日期 / 分类 / 备注 / 金额 / 发票号码 / 客户名称",
    all: "全部",
    income: "收入",
    expense: "支出",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    date: "日期",
    type: "类型",
    amount: "金额",
    category: "分类 / 标签",
    debtAmount: "欠款金额",
    note: "备注",
    customer: "客户",
    product: "产品",
    invoice: "发票",
    chooseCustomer: "选择客户",
    chooseProduct: "选择产品",
    chooseInvoice: "选择发票",
    noCustomer: "不选择客户",
    noProduct: "不选择产品",
    noInvoice: "不选择发票",
    noRecord: "还没有帐目记录",
    linkedInfo: "联动资料",
    related: "关联功能",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    goFeature: "前往",
    saved: "保存成功",
    deleted: "删除成功",
    confirmDelete: "确定要删除这笔记录吗？",
    trialMode: "免费试用模式：资料只会暂存在本机",
    filterCustomer: "筛选客户",
    startDate: "开始日期",
    endDate: "结束日期",
    sourceInvoice: "来自发票",
    manualRecord: "手动记录",
  },
  en: {
    title: "Accounting Records",
    back: "Back to Dashboard",
    add: "Add Record",
    edit: "Edit",
    delete: "Delete",
    save: "Save Record",
    update: "Save Changes",
    cancel: "Cancel",
    close: "Close",
    searchTitle: "Quick Search Records",
    search: "Search date / category / note / amount / invoice no. / customer",
    all: "All",
    income: "Income",
    expense: "Expense",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    date: "Date",
    type: "Type",
    amount: "Amount",
    category: "Category / Tag",
    debtAmount: "Debt Amount",
    note: "Note",
    customer: "Customer",
    product: "Product",
    invoice: "Invoice",
    chooseCustomer: "Choose Customer",
    chooseProduct: "Choose Product",
    chooseInvoice: "Choose Invoice",
    noCustomer: "No Customer",
    noProduct: "No Product",
    noInvoice: "No Invoice",
    noRecord: "No accounting records yet",
    linkedInfo: "Linked Info",
    related: "Linked Features",
    customers: "Customers",
    products: "Products",
    invoices: "Invoices",
    goFeature: "Go",
    saved: "Saved",
    deleted: "Deleted",
    confirmDelete: "Delete this record?",
    trialMode: "Free trial mode: data is stored locally only",
    filterCustomer: "Filter Customer",
    startDate: "Start Date",
    endDate: "End Date",
    sourceInvoice: "From Invoice",
    manualRecord: "Manual Record",
  },
  ms: {
    title: "Rekod Akaun",
    back: "Kembali ke Dashboard",
    add: "Tambah Rekod",
    edit: "Edit",
    delete: "Padam",
    save: "Simpan Rekod",
    update: "Simpan Perubahan",
    cancel: "Batal",
    close: "Tutup",
    searchTitle: "Carian Pantas Rekod",
    search: "Cari tarikh / kategori / catatan / jumlah / no. invois / pelanggan",
    all: "Semua",
    income: "Pendapatan",
    expense: "Perbelanjaan",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    date: "Tarikh",
    type: "Jenis",
    amount: "Jumlah",
    category: "Kategori / Tag",
    debtAmount: "Jumlah Hutang",
    note: "Catatan",
    customer: "Pelanggan",
    product: "Produk",
    invoice: "Invois",
    chooseCustomer: "Pilih Pelanggan",
    chooseProduct: "Pilih Produk",
    chooseInvoice: "Pilih Invois",
    noCustomer: "Tiada Pelanggan",
    noProduct: "Tiada Produk",
    noInvoice: "Tiada Invois",
    noRecord: "Tiada rekod akaun lagi",
    linkedInfo: "Maklumat Berkaitan",
    related: "Fungsi Berkaitan",
    customers: "Pelanggan",
    products: "Produk",
    invoices: "Invois",
    goFeature: "Pergi",
    saved: "Disimpan",
    deleted: "Dipadam",
    confirmDelete: "Padam rekod ini?",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
    filterCustomer: "Tapis Pelanggan",
    startDate: "Tarikh Mula",
    endDate: "Tarikh Akhir",
    sourceInvoice: "Daripada Invois",
    manualRecord: "Rekod Manual",
  },
};

const RECORDS_PAGE_FIX_CSS = `
  .smartacctg-records-page .sa-back-btn {
    border-radius: 999px !important;
  }

  .smartacctg-records-page .records-summary-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
    align-items: stretch !important;
  }

  .smartacctg-records-page .records-stat-card {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    gap: 8px !important;
    width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: clamp(105px, 18vw, 128px) !important;
    padding: clamp(12px, 2.5vw, 18px) !important;
  }

  .smartacctg-records-page .records-stat-card span,
  .smartacctg-records-page .records-stat-card strong {
    display: block !important;
    width: 100% !important;
    text-align: center !important;
    margin: 0 !important;
    line-height: 1.2 !important;
  }

  .smartacctg-records-page .records-stat-card span {
    font-size: clamp(16px, 3.5vw, 22px) !important;
    font-weight: 900 !important;
  }

  .smartacctg-records-page .records-stat-card strong {
    font-size: clamp(20px, 4.5vw, 30px) !important;
    font-weight: 900 !important;
  }

  .smartacctg-records-page .records-list {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 18px !important;
    width: 100% !important;
  }

  .smartacctg-records-page .record-card {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: auto !important;
    text-align: left !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-records-page .record-card * {
    text-align: left !important;
  }

  .smartacctg-records-page .record-card h3 {
    margin: 0 0 10px 0 !important;
    font-size: var(--sa-fs-xl) !important;
    line-height: 1.25 !important;
    font-weight: 900 !important;
  }

  .smartacctg-records-page .record-card p {
    margin: 8px 0 0 !important;
    line-height: 1.55 !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-records-page .records-action-row {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    flex-wrap: wrap !important;
    width: 100% !important;
    margin-top: 6px !important;
  }

  .smartacctg-records-page .records-action-row button {
    width: auto !important;
    min-width: 110px !important;
    flex: 0 1 auto !important;
    white-space: nowrap !important;
  }

  .smartacctg-records-page input[type="date"] {
    text-align: center !important;
    display: block !important;
    width: 100% !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    min-height: 1.6em !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-datetime-edit {
    width: 100% !important;
    text-align: center !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    justify-content: center !important;
  }

  @media (max-width: 520px) {
    .smartacctg-records-page .records-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
    }

    .smartacctg-records-page .records-stat-card {
      min-height: 105px !important;
      padding: 12px 8px !important;
    }

    .smartacctg-records-page .records-list {
      gap: 16px !important;
    }

    .smartacctg-records-page .record-card {
      gap: 12px !important;
    }

    .smartacctg-records-page .records-action-row {
      flex-direction: row !important;
      justify-content: flex-start !important;
      gap: 8px !important;
    }

    .smartacctg-records-page .records-action-row button {
      min-width: 105px !important;
      flex: 0 1 auto !important;
    }
  }
`;

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeLocalGet(key: string) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function safeLocalSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function safeLocalRemove(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(THEMES, value);
}

function applyThemeToDocument(key: ThemeKey) {
  if (typeof document === "undefined") return;

  const theme = THEMES[key] || THEMES.deepTeal;

  document.documentElement.setAttribute("data-smartacctg-theme", key);
  document.documentElement.style.setProperty("--sa-theme-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-theme-card", theme.card);
  document.documentElement.style.setProperty("--sa-theme-border", theme.border);
  document.documentElement.style.setProperty("--sa-theme-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-theme-text", theme.text);
  document.documentElement.style.setProperty("--sa-theme-muted", theme.subText);
  document.documentElement.style.setProperty("--sa-theme-soft-bg", theme.softBg);
  document.documentElement.style.setProperty("--sa-theme-glow", theme.glow);
}

function isSchemaCacheMissingSource(message: string) {
  const lower = String(message || "").toLowerCase();

  return (
    lower.includes("source_type") ||
    lower.includes("source_id") ||
    lower.includes("schema cache") ||
    lower.includes("could not find") ||
    lower.includes("column")
  );
}

export default function RecordsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | TxnType>("all");
  const [filterCustomerId, setFilterCustomerId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const [relatedPath, setRelatedPath] = useState("/dashboard/customers");

  const [form, setForm] = useState({
    txn_date: today(),
    txn_type: "income" as TxnType,
    amount: "",
    category_name: "",
    debt_amount: "",
    note: "",
    customer_id: "",
    product_id: "",
    invoice_id: "",
  });

  const t = TXT[lang];
  const theme = THEMES[themeKey];

  useEffect(() => {
    applyThemeToDocument(themeKey);
  }, [themeKey]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);

    const urlLang = q.get("lang") as Lang | null;
    const savedLang = safeLocalGet(LANG_KEY) as Lang | null;

    if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") {
      setLang(urlLang);
      safeLocalSet(LANG_KEY, urlLang);
    } else if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") {
      setLang(savedLang);
    }

    const urlTheme = q.get("theme");
    const savedTheme = safeLocalGet(THEME_KEY);

    if (isThemeKey(urlTheme)) {
      setThemeKey(urlTheme);
      safeLocalSet(THEME_KEY, urlTheme);
      applyThemeToDocument(urlTheme);
    } else if (isThemeKey(savedTheme)) {
      setThemeKey(savedTheme);
      applyThemeToDocument(savedTheme);
    }

    const view = q.get("view");
    if (view === "income") setFilterType("income");
    if (view === "expense") setFilterType("expense");

    init();
  }, []);

  async function init() {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);
        setSession(null);

        const savedTx = safeLocalGet(TRIAL_TX_KEY);
        const savedCustomers = safeLocalGet(TRIAL_CUSTOMERS_KEY);
        const savedProducts = safeLocalGet(TRIAL_PRODUCTS_KEY);
        const savedInvoices = safeLocalGet(TRIAL_INVOICES_KEY);

        setTransactions(savedTx ? JSON.parse(savedTx) : []);
        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
        setInvoices(savedInvoices ? JSON.parse(savedInvoices) : []);

        return;
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_TX_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
      safeLocalRemove(TRIAL_PRODUCTS_KEY);
      safeLocalRemove(TRIAL_INVOICES_KEY);
      window.location.href = "/zh";
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/zh";
      return;
    }

    setIsTrial(false);
    setSession(data.session);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("theme")
      .eq("id", data.session.user.id)
      .single();

    const profile = profileData as Profile | null;

    if (isThemeKey(profile?.theme)) {
      setThemeKey(profile.theme);
      safeLocalSet(THEME_KEY, profile.theme);
      applyThemeToDocument(profile.theme);
    }

    await loadAll(data.session.user.id);
  }

  async function loadAll(userId: string) {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setTransactions((txData || []) as Txn[]);
    setCustomers((customerData || []) as Customer[]);
    setProducts((productData || []) as Product[]);
    setInvoices((invoiceData || []) as Invoice[]);
  }

  function saveTrialTransactions(nextTx: Txn[]) {
    setTransactions(nextTx);
    safeLocalSet(TRIAL_TX_KEY, JSON.stringify(nextTx));
  }

  function buildUrl(path: string, extra?: string) {
    const query = new URLSearchParams();

    if (isTrial) query.set("mode", "trial");

    query.set("lang", lang);
    query.set("theme", themeKey);
    query.set("refresh", String(Date.now()));

    if (extra) {
      const extraQuery = new URLSearchParams(extra);
      extraQuery.forEach((value, key) => {
        query.set(key, value);
      });
    }

    return `${path}?${query.toString()}`;
  }

  function go(path: string, extra?: string) {
    window.location.href = buildUrl(path, extra);
  }

  function backToDashboard() {
    window.location.href = buildUrl("/dashboard");
  }

  function goRelatedFeature() {
    go(relatedPath);
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function openNewForm() {
    setEditingId(null);
    setForm({
      txn_date: today(),
      txn_type: "income",
      amount: "",
      category_name: "",
      debt_amount: "",
      note: "",
      customer_id: "",
      product_id: "",
      invoice_id: "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setShowForm(false);
    setForm({
      txn_date: today(),
      txn_type: "income",
      amount: "",
      category_name: "",
      debt_amount: "",
      note: "",
      customer_id: "",
      product_id: "",
      invoice_id: "",
    });
  }

  function editTransaction(tx: Txn) {
    setEditingId(tx.id);
    setForm({
      txn_date: tx.txn_date || today(),
      txn_type: tx.txn_type || "income",
      amount: String(tx.amount || ""),
      category_name: tx.category_name || "",
      debt_amount: String(tx.debt_amount || ""),
      note: tx.note || "",
      customer_id: "",
      product_id: "",
      invoice_id: tx.source_type === "invoice" && tx.source_id ? tx.source_id : "",
    });
    setShowForm(true);
  }

  function selectedCustomerName() {
    const c = customers.find((x) => x.id === form.customer_id);
    return c?.name || "";
  }

  function selectedProductName() {
    const p = products.find((x) => x.id === form.product_id);
    return p?.name || "";
  }

  function selectedInvoiceText() {
    const inv = invoices.find((x) => x.id === form.invoice_id);
    if (!inv) return "";

    return `${inv.invoice_no || inv.id}${inv.customer_name ? `｜${inv.customer_name}` : ""}`;
  }

  function buildFinalNote() {
    const parts: string[] = [];

    if (form.customer_id) parts.push(`${t.customer}: ${selectedCustomerName()}`);
    if (form.product_id) parts.push(`${t.product}: ${selectedProductName()}`);
    if (form.invoice_id) parts.push(`${t.invoice}: ${selectedInvoiceText()}`);
    if (form.note.trim()) parts.push(form.note.trim());

    return parts.join("｜") || null;
  }

  async function saveTransaction() {
    setMsg("");

    if (!form.txn_date || !form.amount || !form.category_name.trim()) return;

    const amount = Number(form.amount || 0);
    const debt = Number(form.debt_amount || 0);
    const finalNote = buildFinalNote();

    if (isTrial) {
      const payload: Txn = {
        id: editingId || makeId(),
        user_id: "trial",
        txn_date: form.txn_date,
        txn_type: form.txn_type,
        amount,
        category_name: form.category_name.trim(),
        debt_amount: debt,
        note: finalNote,
        source_type: form.invoice_id ? "invoice" : null,
        source_id: form.invoice_id || null,
        created_at: new Date().toISOString(),
      };

      const next = editingId
        ? transactions.map((x) => (x.id === editingId ? payload : x))
        : [payload, ...transactions];

      saveTrialTransactions(next);
      setMsg(t.saved);
      closeForm();
      return;
    }

    if (!session) return;

    const basicPayload = {
      user_id: session.user.id,
      txn_date: form.txn_date,
      txn_type: form.txn_type,
      amount,
      category_name: form.category_name.trim(),
      debt_amount: debt,
      note: finalNote,
    };

    const fullPayload = {
      ...basicPayload,
      source_type: form.invoice_id ? "invoice" : null,
      source_id: form.invoice_id || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("transactions")
        .update(fullPayload)
        .eq("id", editingId)
        .eq("user_id", session.user.id);

      if (error) {
        if (isSchemaCacheMissingSource(error.message)) {
          const retry = await supabase
            .from("transactions")
            .update(basicPayload)
            .eq("id", editingId)
            .eq("user_id", session.user.id);

          if (retry.error) {
            setMsg(retry.error.message);
            return;
          }
        } else {
          setMsg(error.message);
          return;
        }
      }
    } else {
      const { error } = await supabase.from("transactions").insert(fullPayload);

      if (error) {
        if (isSchemaCacheMissingSource(error.message)) {
          const retry = await supabase.from("transactions").insert(basicPayload);

          if (retry.error) {
            setMsg(retry.error.message);
            return;
          }
        } else {
          setMsg(error.message);
          return;
        }
      }
    }

    setMsg(t.saved);
    closeForm();
    await loadAll(session.user.id);
  }

  async function deleteTransaction(id: string) {
    const yes = window.confirm(t.confirmDelete);
    if (!yes) return;

    if (isTrial) {
      const next = transactions.filter((x) => x.id !== id);
      saveTrialTransactions(next);
      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.deleted);
    await loadAll(session.user.id);
  }

  const monthKey = new Date().toISOString().slice(0, 7);

  const monthIncome = useMemo(() => {
    return transactions
      .filter((x) => x.txn_date?.startsWith(monthKey) && x.txn_type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [transactions, monthKey]);

  const monthExpense = useMemo(() => {
    return transactions
      .filter((x) => x.txn_date?.startsWith(monthKey) && x.txn_type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [transactions, monthKey]);

  const balance = useMemo(() => {
    return transactions.reduce((s, x) => {
      return x.txn_type === "income"
        ? s + Number(x.amount || 0)
        : s - Number(x.amount || 0);
    }, 0);
  }, [transactions]);

  const filteredRecords = useMemo(() => {
    const s = search.toLowerCase().trim();

    return transactions.filter((tx) => {
      const invoice =
        tx.source_type === "invoice"
          ? invoices.find((x) => x.id === tx.source_id)
          : null;

      const customerName =
        customers.find((c) => c.id === filterCustomerId)?.name?.toLowerCase() || "";

      const matchType = filterType === "all" || tx.txn_type === filterType;

      const matchCustomer =
        !filterCustomerId ||
        Boolean(tx.note?.toLowerCase().includes(customerName)) ||
        invoice?.customer_id === filterCustomerId;

      const matchStart = !filterStartDate || tx.txn_date >= filterStartDate;
      const matchEnd = !filterEndDate || tx.txn_date <= filterEndDate;

      const searchText = [
        tx.txn_date,
        tx.txn_type,
        tx.amount,
        tx.category_name,
        tx.note,
        invoice?.invoice_no,
        invoice?.customer_name,
        invoice?.total,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !s || searchText.includes(s);

      return matchType && matchCustomer && matchStart && matchEnd && matchSearch;
    });
  }, [
    transactions,
    search,
    filterType,
    filterCustomerId,
    filterStartDate,
    filterEndDate,
    invoices,
    customers,
  ]);

  function getInvoice(tx: Txn) {
    if (tx.source_type !== "invoice" || !tx.source_id) return null;
    return invoices.find((x) => x.id === tx.source_id) || null;
  }

  return (
    <main
      className="smartacctg-page smartacctg-records-page"
      data-sa-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{RECORDS_PAGE_FIX_CSS}</style>

      <div className="sa-topbar">
        <div className="sa-topbar-left">
          <button
            onClick={backToDashboard}
            className="sa-back-btn"
            style={{
              ...backBtnStyle,
              color: theme.accent,
              borderColor: theme.border,
            }}
          >
            ← {t.back}
          </button>
        </div>

        <div className="sa-topbar-center" aria-hidden="true" />

        <div className="sa-topbar-right">
          <div className="sa-lang-row">
            <button
              onClick={() => switchLang("zh")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "zh", theme)}
            >
              中文
            </button>

            <button
              onClick={() => switchLang("en")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "en", theme)}
            >
              EN
            </button>

            <button
              onClick={() => switchLang("ms")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "ms", theme)}
            >
              BM
            </button>
          </div>
        </div>
      </div>

      {isTrial ? <div style={trialMsgStyle}>{t.trialMode}</div> : null}

      {msg ? (
        <div style={{ ...msgStyle, background: theme.softBg, color: theme.text }}>
          {msg}
        </div>
      ) : null}

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div style={recordHeaderStyle}>
          <h1 style={titleStyle}>{t.title}</h1>

          <button
            onClick={openNewForm}
            aria-label={t.add}
            style={{
              ...plusBtnStyle,
              background: theme.accent,
            }}
          >
            +
          </button>
        </div>

        <div className="sa-stats-grid records-summary-grid" style={statsGridStyle}>
          <button
            type="button"
            className="sa-stat-card records-stat-card"
            style={{
              ...statCardStyle,
              borderColor: theme.border,
            }}
            onClick={() => setFilterType("all")}
          >
            <span style={statLabelStyle}>{t.balance}</span>
            <strong style={{ ...statAmountStyle, color: theme.accent }}>
              RM {balance.toFixed(2)}
            </strong>
          </button>

          <button
            type="button"
            className="sa-stat-card records-stat-card"
            style={{
              ...statCardStyle,
              borderColor: theme.border,
            }}
            onClick={() => setFilterType("income")}
          >
            <span style={statLabelStyle}>{t.monthIncome}</span>
            <strong style={{ ...statAmountStyle, color: "#16a34a" }}>
              RM {monthIncome.toFixed(2)}
            </strong>
          </button>

          <button
            type="button"
            className="sa-stat-card records-stat-card"
            style={{
              ...statCardStyle,
              borderColor: theme.border,
            }}
            onClick={() => setFilterType("expense")}
          >
            <span style={statLabelStyle}>{t.monthExpense}</span>
            <strong style={{ ...statAmountStyle, color: "#dc2626" }}>
              RM {monthExpense.toFixed(2)}
            </strong>
          </button>
        </div>
      </section>

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <h2 style={sectionTitleStyle}>{t.searchTitle}</h2>

        <div style={responsiveGridStyle}>
          <input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, borderColor: theme.border }}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | TxnType)}
            style={{ ...inputStyle, borderColor: theme.border }}
          >
            <option value="all">{t.all}</option>
            <option value="income">{t.income}</option>
            <option value="expense">{t.expense}</option>
          </select>

          <select
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
            style={{ ...inputStyle, borderColor: theme.border }}
          >
            <option value="">{t.filterCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "-"}
              </option>
            ))}
          </select>

          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: theme.subText }}>
              {t.startDate}
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={{ ...dateInputStyle, borderColor: theme.border }}
            />
          </div>

          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: theme.subText }}>
              {t.endDate}
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={{ ...dateInputStyle, borderColor: theme.border }}
            />
          </div>
        </div>
      </section>

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        {filteredRecords.length === 0 ? (
          <p style={{ color: theme.subText, fontWeight: 800 }}>{t.noRecord}</p>
        ) : (
          <div className="records-list" style={recordListStyle}>
            {filteredRecords.map((tx) => {
              const invoice = getInvoice(tx);
              const isIncome = tx.txn_type === "income";

              return (
                <div
                  key={tx.id}
                  className="record-card"
                  style={{
                    ...recordCardStyle,
                    borderColor: theme.border,
                    background: theme.card,
                    color: theme.text,
                    boxShadow: theme.glow,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={recordTitleStyle}>
                      {isIncome ? t.income : t.expense} · {tx.category_name || "-"}
                    </h3>

                    <p style={{ ...mutedStyle, color: theme.subText }}>
                      {t.date}: {tx.txn_date} ｜ {t.amount}:{" "}
                      <strong style={{ color: isIncome ? "#16a34a" : "#dc2626" }}>
                        RM {Number(tx.amount || 0).toFixed(2)}
                      </strong>
                    </p>

                    {Number(tx.debt_amount || 0) > 0 ? (
                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.debtAmount}: RM {Number(tx.debt_amount || 0).toFixed(2)}
                      </p>
                    ) : null}

                    {invoice ? (
                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.sourceInvoice}: {invoice.invoice_no || invoice.id}{" "}
                        {invoice.customer_name ? `｜${invoice.customer_name}` : ""}
                      </p>
                    ) : (
                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.manualRecord}
                      </p>
                    )}

                    {tx.note ? (
                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.note}: {tx.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="records-action-row" style={actionRowStyle}>
                    <button
                      onClick={() => editTransaction(tx)}
                      style={{
                        ...actionBtnStyle,
                        background: theme.accent,
                      }}
                    >
                      {t.edit}
                    </button>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      style={deleteBtnStyle}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <h2 style={sectionTitleStyle}>{t.related}</h2>

        <div style={relatedMenuRowStyle}>
          <select
            value={relatedPath}
            onChange={(e) => setRelatedPath(e.target.value)}
            style={{ ...inputStyle, borderColor: theme.border }}
          >
            <option value="/dashboard/customers">{t.customers}</option>
            <option value="/dashboard/products">{t.products}</option>
            <option value="/dashboard/invoices">{t.invoices}</option>
          </select>

          <button
            onClick={goRelatedFeature}
            style={{
              ...primaryBtnStyle,
              background: theme.accent,
              marginTop: 0,
            }}
          >
            {t.goFeature}
          </button>
        </div>
      </section>

      {showForm ? (
        <div style={overlayStyle}>
          <section
            className="sa-modal"
            style={{
              ...modalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-header">
              <h2 style={modalTitleStyle}>{editingId ? t.update : t.add}</h2>

              <button
                onClick={closeForm}
                style={{
                  ...closeTextBtnStyle,
                  color: "#dc2626",
                }}
              >
                {t.close}
              </button>
            </div>

            <div style={responsiveGridStyle}>
              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: theme.subText }}>
                  {t.date}
                </label>
                <input
                  type="date"
                  value={form.txn_date}
                  onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
                  style={{ ...dateInputStyle, borderColor: theme.border }}
                />
              </div>

              <select
                value={form.txn_type}
                onChange={(e) =>
                  setForm({ ...form, txn_type: e.target.value as TxnType })
                }
                style={{ ...inputStyle, borderColor: theme.border }}
              >
                <option value="income">{t.income}</option>
                <option value="expense">{t.expense}</option>
              </select>

              <input
                placeholder={t.amount}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
                inputMode="decimal"
              />

              <input
                placeholder={t.category}
                value={form.category_name}
                onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />

              <input
                placeholder={t.debtAmount}
                value={form.debt_amount}
                onChange={(e) => setForm({ ...form, debt_amount: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
                inputMode="decimal"
              />

              <input
                placeholder={t.note}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />
            </div>

            <h3 style={sectionTitleStyle}>{t.linkedInfo}</h3>

            <div style={responsiveGridStyle}>
              <select
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              >
                <option value="">{t.noCustomer}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || "-"}
                  </option>
                ))}
              </select>

              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              >
                <option value="">{t.noProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || "-"} - RM {Number(p.price || 0).toFixed(2)}
                  </option>
                ))}
              </select>

              <select
                value={form.invoice_id}
                onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              >
                <option value="">{t.noInvoice}</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_no || inv.id}{" "}
                    {inv.customer_name ? `- ${inv.customer_name}` : ""} - RM{" "}
                    {Number(inv.total || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div style={modalActionRowStyle}>
              <button
                onClick={saveTransaction}
                style={{
                  ...primaryBtnStyle,
                  background: theme.accent,
                  marginTop: 0,
                }}
              >
                {editingId ? t.update : t.save}
              </button>

              <button
                onClick={closeForm}
                style={{
                  ...secondaryBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  marginTop: 0,
                }}
              >
                {t.cancel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  padding: "clamp(10px, 2vw, 24px)",
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: "999px",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const langBtnStyle = (
  active: boolean,
  theme: (typeof THEMES)[ThemeKey]
): CSSProperties => ({
  borderColor: theme.accent,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
});

const recordHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontWeight: 900,
  lineHeight: 1.12,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontWeight: 900,
};

const plusBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  color: "#fff",
  border: "none",
  fontSize: 30,
  fontWeight: 900,
  lineHeight: 1,
  padding: 0,
  flexShrink: 0,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginTop: 14,
  width: "100%",
};

const statCardStyle: CSSProperties = {
  background: "#fff",
  color: "#111827",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  minHeight: 120,
  textAlign: "center",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  minWidth: 0,
};

const statLabelStyle: CSSProperties = {
  display: "block",
  width: "100%",
  color: "#111827",
  fontWeight: 900,
  textAlign: "center",
  lineHeight: 1.2,
};

const statAmountStyle: CSSProperties = {
  display: "block",
  width: "100%",
  fontWeight: 900,
  fontSize: "var(--sa-fs-xl)",
  lineHeight: 1.15,
  textAlign: "center",
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  background: "#ffffff",
  color: "#111827",
  outline: "none",
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  textAlign: "center",
  display: "block",
  lineHeight: "normal",
};

const responsiveGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const relatedMenuRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
};

const recordListStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 18,
  width: "100%",
};

const recordCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 14,
  width: "100%",
  minWidth: 0,
  height: "auto",
  minHeight: "auto",
  overflowWrap: "anywhere",
};

const recordTitleStyle: CSSProperties = {
  margin: 0,
  overflowWrap: "anywhere",
  fontWeight: 900,
};

const mutedStyle: CSSProperties = {
  overflowWrap: "anywhere",
  lineHeight: 1.55,
  margin: "8px 0 0",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "wrap",
};

const actionBtnStyle: CSSProperties = {
  minWidth: 104,
  minHeight: 44,
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  fontWeight: 900,
};

const deleteBtnStyle: CSSProperties = {
  minWidth: 104,
  minHeight: 44,
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  fontWeight: 900,
};

const primaryBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
};

const secondaryBtnStyle: CSSProperties = {
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
};

const msgStyle: CSSProperties = {
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const trialMsgStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.52)",
  padding: "clamp(12px, 3vw, 24px)",
  zIndex: 999,
  overflowY: "auto",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 900,
  margin: "0 auto",
  border: "var(--sa-border-w) solid",
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const closeTextBtnStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  padding: "0 4px",
  minHeight: 0,
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
};

const dateWrapStyle: CSSProperties = {
  width: "100%",
};

const dateLabelStyle: CSSProperties = {
  display: "block",
  fontWeight: 900,
  marginBottom: 6,
};

const modalActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 18,
  flexWrap: "wrap",
};
