"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  type ThemeKey,
  applyThemeToDocument,
  getThemeKeyFromUrlOrLocalStorage,
  isThemeKey,
  normalizeThemeKey,
  saveThemeKey,
} from "@/lib/smartacctgTheme";

type Lang = "zh" | "en" | "ms";
type TxnType = "income" | "expense";

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

const today = () => new Date().toISOString().slice(0, 10);

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
    needRequired: "请填写日期、金额和分类",
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
    needRequired: "Please fill in date, amount and category",
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
    needRequired: "Sila isi tarikh, jumlah dan kategori",
  },
};

const ACCOUNTING_PAGE_FIX_CSS = `
  .smartacctg-accounting-page .sa-back-btn,
  .smartacctg-records-page .sa-back-btn {
    border-radius: 999px !important;
  }

  .smartacctg-accounting-page .records-summary-grid,
  .smartacctg-records-page .records-summary-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
    align-items: stretch !important;
  }

  .smartacctg-accounting-page .records-stat-card,
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

  .smartacctg-accounting-page .records-stat-card span,
  .smartacctg-accounting-page .records-stat-card strong,
  .smartacctg-records-page .records-stat-card span,
  .smartacctg-records-page .records-stat-card strong {
    display: block !important;
    width: 100% !important;
    text-align: center !important;
    margin: 0 !important;
    line-height: 1.2 !important;
  }

  .smartacctg-accounting-page .records-stat-card span,
  .smartacctg-records-page .records-stat-card span {
    font-size: clamp(16px, 3.5vw, 22px) !important;
    font-weight: 900 !important;
  }

  .smartacctg-accounting-page .records-stat-card strong,
  .smartacctg-records-page .records-stat-card strong {
    font-size: clamp(20px, 4.5vw, 30px) !important;
    font-weight: 900 !important;
  }

  .smartacctg-accounting-page strong[data-stat="balance"],
  .smartacctg-records-page strong[data-stat="balance"] {
    color: var(--sa-accent) !important;
  }

  .smartacctg-accounting-page strong[data-stat="income"],
  .smartacctg-records-page strong[data-stat="income"] {
    color: #16a34a !important;
  }

  .smartacctg-accounting-page strong[data-stat="expense"],
  .smartacctg-records-page strong[data-stat="expense"] {
    color: #dc2626 !important;
  }

  .smartacctg-accounting-page .records-list,
  .smartacctg-records-page .records-list {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 18px !important;
    width: 100% !important;
  }

  .smartacctg-accounting-page .record-card,
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

  .smartacctg-accounting-page .record-card *,
  .smartacctg-records-page .record-card * {
    text-align: left !important;
  }

  .smartacctg-accounting-page .record-card h3,
  .smartacctg-records-page .record-card h3 {
    margin: 0 0 10px 0 !important;
    font-size: var(--sa-fs-xl) !important;
    line-height: 1.25 !important;
    font-weight: 900 !important;
  }

  .smartacctg-accounting-page .record-card p,
  .smartacctg-records-page .record-card p {
    margin: 8px 0 0 !important;
    line-height: 1.55 !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-accounting-page .records-action-row,
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

  .smartacctg-accounting-page .records-action-row button,
  .smartacctg-records-page .records-action-row button {
    width: auto !important;
    min-width: 110px !important;
    flex: 0 1 auto !important;
    white-space: nowrap !important;
  }

  .smartacctg-accounting-page input[type="date"],
  .smartacctg-records-page input[type="date"] {
    text-align: center !important;
    display: block !important;
    width: 100% !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  .smartacctg-accounting-page input[type="date"]::-webkit-date-and-time-value,
  .smartacctg-records-page input[type="date"]::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    min-height: 1.6em !important;
  }

  .smartacctg-accounting-page input[type="date"]::-webkit-datetime-edit,
  .smartacctg-records-page input[type="date"]::-webkit-datetime-edit {
    width: 100% !important;
    text-align: center !important;
  }

  .smartacctg-accounting-page input[type="date"]::-webkit-datetime-edit-fields-wrapper,
  .smartacctg-records-page input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    justify-content: center !important;
  }

  @media (max-width: 520px) {
    .smartacctg-accounting-page .records-summary-grid,
    .smartacctg-records-page .records-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
    }

    .smartacctg-accounting-page .records-stat-card,
    .smartacctg-records-page .records-stat-card {
      min-height: 105px !important;
      padding: 12px 8px !important;
    }

    .smartacctg-accounting-page .records-list,
    .smartacctg-records-page .records-list {
      gap: 16px !important;
    }

    .smartacctg-accounting-page .record-card,
    .smartacctg-records-page .record-card {
      gap: 12px !important;
    }

    .smartacctg-accounting-page .records-action-row,
    .smartacctg-records-page .records-action-row {
      flex-direction: row !important;
      justify-content: flex-start !important;
      gap: 8px !important;
    }

    .smartacctg-accounting-page .records-action-row button,
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

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "zh";

  const q = new URLSearchParams(window.location.search);
  const urlLang = q.get("lang") as Lang | null;
  const savedLang = safeLocalGet(LANG_KEY) as Lang | null;

  if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") return urlLang;
  if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") return savedLang;

  return "zh";
}

function applyThemeEverywhere(key: ThemeKey) {
  if (typeof document === "undefined") return;

  const fixedKey = normalizeThemeKey(key);
  const theme = THEMES[fixedKey] || THEMES.deepTeal;

  applyThemeToDocument(fixedKey);

  document.documentElement.setAttribute("data-sa-theme", fixedKey);
  document.documentElement.setAttribute("data-smartacctg-theme", fixedKey);

  document.documentElement.style.setProperty("--sa-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-card-bg", theme.card);
  document.documentElement.style.setProperty("--sa-panel-bg", theme.panelBg || theme.card);
  document.documentElement.style.setProperty("--sa-item-bg", theme.itemBg || theme.card);
  document.documentElement.style.setProperty("--sa-input-bg", theme.inputBg || "#ffffff");
  document.documentElement.style.setProperty("--sa-input-text", theme.inputText || "#111827");
  document.documentElement.style.setProperty("--sa-border", theme.border);
  document.documentElement.style.setProperty("--sa-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-text", theme.text);
  document.documentElement.style.setProperty("--sa-panel-text", theme.panelText || theme.text);
  document.documentElement.style.setProperty("--sa-muted", theme.muted || theme.subText);
  document.documentElement.style.setProperty("--sa-soft-bg", theme.softBg || theme.soft || theme.card);
  document.documentElement.style.setProperty("--sa-banner-bg", theme.banner || theme.card);
  document.documentElement.style.setProperty("--sa-glow", theme.glow);
}

function replaceUrlLangTheme(nextLang: Lang, nextTheme: ThemeKey) {
  if (typeof window === "undefined") return;

  const q = new URLSearchParams(window.location.search);
  q.set("lang", nextLang);
  q.set("theme", nextTheme);
  q.set("refresh", String(Date.now()));

  window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
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
  const theme = THEMES[themeKey] || THEMES.deepTeal;

  const themeSubText = theme.subText || theme.muted || "#64748b";

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  const themedDateInputStyle: CSSProperties = {
    ...dateInputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  useEffect(() => {
    applyThemeEverywhere(themeKey);
  }, [themeKey]);

  useEffect(() => {
    const initialLang = getInitialLang();
    const initialTheme = getThemeKeyFromUrlOrLocalStorage("deepTeal");

    setLang(initialLang);
    safeLocalSet(LANG_KEY, initialLang);

    setThemeKey(initialTheme);
    saveThemeKey(initialTheme);
    applyThemeEverywhere(initialTheme);

    init(initialLang, initialTheme);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const openParam = q.get("open");
    const view = q.get("view");

    if (view === "income") setFilterType("income");
    if (view === "expense") setFilterType("expense");

    const shouldOpenNew = openParam === "new";
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSession(null);

          setTransactions(safeParseArray<Txn>(safeLocalGet(TRIAL_TX_KEY)));
          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setProducts(safeParseArray<Product>(safeLocalGet(TRIAL_PRODUCTS_KEY)));
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));

          replaceUrlLangTheme(currentLang, currentTheme);

          if (shouldOpenNew) {
            setTimeout(() => openNewForm(), 100);
          }

          return;
        }
      } catch {
        // Bad trial data, clear below.
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

    const userId = data.session.user.id;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("theme")
      .eq("id", userId)
      .single();

    let finalTheme = currentTheme;
    const profile = profileData as Profile | null;

    if (profile?.theme) {
      const profileTheme = normalizeThemeKey(profile.theme);

      if (isThemeKey(profileTheme)) {
        finalTheme = profileTheme;
        setThemeKey(profileTheme);
        saveThemeKey(profileTheme);
        applyThemeEverywhere(profileTheme);
      }
    }

    replaceUrlLangTheme(currentLang, finalTheme);

    await loadAll(userId);

    if (shouldOpenNew) {
      setTimeout(() => openNewForm(), 100);
    }
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
    replaceUrlLangTheme(next, themeKey);
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

    const q = new URLSearchParams(window.location.search);
    q.delete("open");
    q.delete("fullscreen");
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
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

    if (!form.txn_date || !form.amount || !form.category_name.trim()) {
      setMsg(t.needRequired);
      return;
    }

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
        tx.source_type === "invoice" ? invoices.find((x) => x.id === tx.source_id) : null;

      const selectedFilterCustomerName =
        customers.find((c) => c.id === filterCustomerId)?.name?.toLowerCase() || "";

      const matchType = filterType === "all" || tx.txn_type === filterType;

      const matchCustomer =
        !filterCustomerId ||
        Boolean(tx.note?.toLowerCase().includes(selectedFilterCustomerName)) ||
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
      className="smartacctg-page smartacctg-accounting-page smartacctg-records-page"
      data-sa-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{ACCOUNTING_PAGE_FIX_CSS}</style>

      <div className="sa-topbar">
        <div className="sa-topbar-left">
          <button
            type="button"
            onClick={backToDashboard}
            className="sa-back-btn"
            style={{
              ...backBtnStyle,
              color: theme.accent,
              borderColor: theme.border,
              background: theme.inputBg || "#fff",
            }}
          >
            ← {t.back}
          </button>
        </div>

        <div className="sa-topbar-center" aria-hidden="true" />

        <div className="sa-topbar-right">
          <div className="sa-lang-row">
            <button
              type="button"
              onClick={() => switchLang("zh")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "zh", theme)}
            >
              中文
            </button>

            <button
              type="button"
              onClick={() => switchLang("en")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "en", theme)}
            >
              EN
            </button>

            <button
              type="button"
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
        <div
          style={{
            ...msgStyle,
            background: theme.softBg || theme.soft || theme.card,
            color: theme.text,
          }}
        >
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
            type="button"
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
              background: theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
            onClick={() => setFilterType("all")}
          >
            <span style={{ ...statLabelStyle, color: theme.text }}>{t.balance}</span>
            <strong data-stat="balance" style={statAmountStyle}>
              RM {balance.toFixed(2)}
            </strong>
          </button>

          <button
            type="button"
            className="sa-stat-card records-stat-card"
            style={{
              ...statCardStyle,
              background: theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
            onClick={() => setFilterType("income")}
          >
            <span style={{ ...statLabelStyle, color: theme.text }}>{t.monthIncome}</span>
            <strong data-stat="income" style={statAmountStyle}>
              RM {monthIncome.toFixed(2)}
            </strong>
          </button>

          <button
            type="button"
            className="sa-stat-card records-stat-card"
            style={{
              ...statCardStyle,
              background: theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
            onClick={() => setFilterType("expense")}
          >
            <span style={{ ...statLabelStyle, color: theme.text }}>{t.monthExpense}</span>
            <strong data-stat="expense" style={statAmountStyle}>
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
            style={themedInputStyle}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | TxnType)}
            style={themedInputStyle}
          >
            <option value="all">{t.all}</option>
            <option value="income">{t.income}</option>
            <option value="expense">{t.expense}</option>
          </select>

          <select
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
            style={themedInputStyle}
          >
            <option value="">{t.filterCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "-"}
              </option>
            ))}
          </select>

          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.startDate}</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={themedDateInputStyle}
            />
          </div>

          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.endDate}</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={themedDateInputStyle}
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
          <p style={{ color: themeSubText, fontWeight: 800 }}>{t.noRecord}</p>
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
                    background: theme.itemBg || theme.card,
                    color: theme.text,
                    boxShadow: theme.glow,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={recordTitleStyle}>
                      {isIncome ? t.income : t.expense} · {tx.category_name || "-"}
                    </h3>

                    <p style={{ ...mutedStyle, color: themeSubText }}>
                      {t.date}: {tx.txn_date} ｜ {t.amount}:{" "}
                      <strong style={{ color: isIncome ? "#16a34a" : "#dc2626" }}>
                        RM {Number(tx.amount || 0).toFixed(2)}
                      </strong>
                    </p>

                    {Number(tx.debt_amount || 0) > 0 ? (
                      <p style={{ ...mutedStyle, color: themeSubText }}>
                        {t.debtAmount}: RM {Number(tx.debt_amount || 0).toFixed(2)}
                      </p>
                    ) : null}

                    {invoice ? (
                      <p style={{ ...mutedStyle, color: themeSubText }}>
                        {t.sourceInvoice}: {invoice.invoice_no || invoice.id}{" "}
                        {invoice.customer_name ? `｜${invoice.customer_name}` : ""}
                      </p>
                    ) : (
                      <p style={{ ...mutedStyle, color: themeSubText }}>{t.manualRecord}</p>
                    )}

                    {tx.note ? (
                      <p style={{ ...mutedStyle, color: themeSubText }}>
                        {t.note}: {tx.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="records-action-row" style={actionRowStyle}>
                    <button
                      type="button"
                      onClick={() => editTransaction(tx)}
                      style={{
                        ...actionBtnStyle,
                        background: theme.accent,
                      }}
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
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
            style={themedInputStyle}
          >
            <option value="/dashboard/customers">{t.customers}</option>
            <option value="/dashboard/products">{t.products}</option>
            <option value="/dashboard/invoices">{t.invoices}</option>
          </select>

          <button
            type="button"
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
                type="button"
                className="sa-close-x"
                onClick={closeForm}
                aria-label={t.close}
              >
                {t.close}
              </button>
            </div>

            <div style={responsiveGridStyle}>
              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.date}</label>
                <input
                  type="date"
                  value={form.txn_date}
                  onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
                  style={themedDateInputStyle}
                />
              </div>

              <select
                value={form.txn_type}
                onChange={(e) => setForm({ ...form, txn_type: e.target.value as TxnType })}
                style={themedInputStyle}
              >
                <option value="income">{t.income}</option>
                <option value="expense">{t.expense}</option>
              </select>

              <input
                placeholder={t.amount}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={themedInputStyle}
                inputMode="decimal"
              />

              <input
                placeholder={t.category}
                value={form.category_name}
                onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                style={themedInputStyle}
              />

              <input
                placeholder={t.debtAmount}
                value={form.debt_amount}
                onChange={(e) => setForm({ ...form, debt_amount: e.target.value })}
                style={themedInputStyle}
                inputMode="decimal"
              />

              <input
                placeholder={t.note}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                style={themedInputStyle}
              />
            </div>

            <h3 style={sectionTitleStyle}>{t.linkedInfo}</h3>

            <div style={responsiveGridStyle}>
              <select
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                style={themedInputStyle}
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
                style={themedInputStyle}
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
                style={themedInputStyle}
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
                type="button"
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
                type="button"
                onClick={closeForm}
                style={{
                  ...secondaryBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  background: theme.inputBg || "#ffffff",
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
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
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

const langBtnStyle = (active: boolean, theme: (typeof THEMES)[ThemeKey]): CSSProperties => ({
  borderColor: theme.accent,
  background: active ? theme.accent : theme.inputBg || "#fff",
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
  fontSize: 16,
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
