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
  debt_amount?: number | null;
  paid_amount?: number | null;
  last_payment_date?: string | null;
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
  customer_company?: string | null;
  customer_phone?: string | null;
  invoice_no?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  created_at?: string | null;
  subtotal?: number | null;
  discount?: number | null;
  total?: number | null;
  total_cost?: number | null;
  total_profit?: number | null;
  note?: string | null;
};

type Profile = {
  id?: string;
  theme?: string | null;
};

type DebtItem = {
  id: string;
  source: "invoice" | "customer";
  customerLabel: string;
  amount: number;
  dueDate: string;
  sortTime: number;
  invoice?: Invoice;
  customer?: Customer;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";

const LANG_KEY = "smartacctg_lang";
const CATEGORY_KEY = "smartacctg_record_categories";

const DEFAULT_CATEGORIES = [
  "发票收入",
  "普通收入",
  "客户付款",
  "进货",
  "人工",
  "交通",
  "饮食",
  "电话费",
  "广告费",
  "其他",
];

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
    monthProfit: "本月利润",
    customerDebt: "客户欠款",
    summaryMonth: "统计月份",
    chooseMonth: "选择月份",
    year: "年份",
    month: "月份",
    dueDate: "到期日",
    noDebt: "暂无客户欠款",
    date: "日期",
    type: "类型",
    amount: "金额",
    category: "分类 / 标签",
    chooseCategory: "选择分类 / 标签",
    addCategory: "新增分类 / 标签",
    categoryPlaceholder: "输入新的分类 / 标签",
    savedCategory: "已保存分类",
    deleteCategory: "删除分类",
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
    saving: "保存中...",
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
    monthProfit: "Monthly Profit",
    customerDebt: "Customer Debt",
    summaryMonth: "Summary Month",
    chooseMonth: "Choose Month",
    year: "Year",
    month: "Month",
    dueDate: "Due Date",
    noDebt: "No customer debt",
    date: "Date",
    type: "Type",
    amount: "Amount",
    category: "Category / Tag",
    chooseCategory: "Choose Category / Tag",
    addCategory: "Add Category / Tag",
    categoryPlaceholder: "Enter new category / tag",
    savedCategory: "Saved Categories",
    deleteCategory: "Delete Category",
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
    saving: "Saving...",
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
    monthProfit: "Untung Bulan Ini",
    customerDebt: "Hutang Pelanggan",
    summaryMonth: "Bulan Ringkasan",
    chooseMonth: "Pilih Bulan",
    year: "Tahun",
    month: "Bulan",
    dueDate: "Tarikh Tamat",
    noDebt: "Tiada hutang pelanggan",
    date: "Tarikh",
    type: "Jenis",
    amount: "Jumlah",
    category: "Kategori / Tag",
    chooseCategory: "Pilih Kategori / Tag",
    addCategory: "Tambah Kategori / Tag",
    categoryPlaceholder: "Masukkan kategori / tag baru",
    savedCategory: "Kategori Disimpan",
    deleteCategory: "Padam Kategori",
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
    saving: "Sedang simpan...",
  },
};

const ACCOUNTING_PAGE_FIX_CSS = `
  .smartacctg-records-page .sa-back-btn {
    border-radius: 999px !important;
  }

  .smartacctg-records-page .records-summary-box {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .smartacctg-records-page .records-month-row {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 10px !important;
    align-items: center !important;
    width: 100% !important;
  }

  .smartacctg-records-page .records-month-select-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
  }

  .smartacctg-records-page .records-summary-line {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 10px !important;
    align-items: center !important;
    width: 100% !important;
    font-weight: 900 !important;
    line-height: 1.25 !important;
  }

  .smartacctg-records-page .records-summary-line span {
    font-size: clamp(17px, 3.6vw, 22px) !important;
    font-weight: 900 !important;
  }

  .smartacctg-records-page .records-summary-line strong {
    font-size: clamp(19px, 4vw, 26px) !important;
    font-weight: 900 !important;
    white-space: nowrap !important;
  }

  .smartacctg-records-page .records-debt-detail {
    margin-top: 2px !important;
    padding-top: 4px !important;
    display: grid !important;
    gap: 4px !important;
    font-weight: 900 !important;
    line-height: 1.35 !important;
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

  .smartacctg-records-page .record-card.debt-record {
    background: #fee2e2 !important;
    color: #7f1d1d !important;
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.35),
      0 12px 28px rgba(220, 38, 38, 0.22) !important;
  }

  .smartacctg-records-page .record-card.debt-record p,
  .smartacctg-records-page .record-card.debt-record h3,
  .smartacctg-records-page .record-card.debt-record span {
    color: #7f1d1d !important;
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

  .smartacctg-records-page .category-add-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 10px !important;
    align-items: center !important;
  }

  .smartacctg-records-page .category-chip-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    width: 100% !important;
  }

  .smartacctg-records-page .category-chip {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    border-radius: 999px !important;
    padding: 7px 10px !important;
    font-weight: 900 !important;
    line-height: 1.15 !important;
  }

  .smartacctg-records-page input[type="date"] {
    text-align: center !important;
    text-align-last: center !important;
    display: block !important;
    width: 100% !important;
    height: var(--sa-control-h, 54px) !important;
    min-height: var(--sa-control-h, 54px) !important;
    line-height: var(--sa-control-h, 54px) !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
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

  .smartacctg-records-page .records-fullscreen-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    background: rgba(15, 23, 42, 0.58) !important;
  }

  .smartacctg-records-page .records-fullscreen-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    min-height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
    border-top: none !important;
    border-bottom: none !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)) !important;
  }

  .smartacctg-records-page .records-fullscreen-modal .sa-modal-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 5 !important;
    background: inherit !important;
    padding-bottom: 12px !important;
  }

  @media (max-width: 520px) {
    .smartacctg-records-page .records-month-select-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 8px !important;
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

    .smartacctg-records-page .category-add-row {
      grid-template-columns: 1fr !important;
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

function uniqueCleanList(list: string[]) {
  return Array.from(new Set(list.map((x) => String(x || "").trim()).filter(Boolean)));
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

function getInitialFullscreen() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("fullscreen") === "1";
}

function getInitialReturnTo() {
  if (typeof window === "undefined") return "";
  const q = new URLSearchParams(window.location.search);
  return q.get("return") || "";
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

function isSchemaCacheMissing(message: string) {
  const lower = String(message || "").toLowerCase();

  return (
    lower.includes("source_type") ||
    lower.includes("source_id") ||
    lower.includes("schema cache") ||
    lower.includes("could not find") ||
    lower.includes("column")
  );
}

function getMissingColumnName(message: string) {
  const text = String(message || "");
  const match1 = text.match(/Could not find the '([^']+)' column/i);
  const match2 = text.match(/column "([^"]+)" does not exist/i);
  const match3 = text.match(/column '([^']+)' does not exist/i);

  return match1?.[1] || match2?.[1] || match3?.[1] || "";
}

async function insertAdaptive(table: string, inputPayload: Record<string, any>) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  const optionalKeys = [
    "source_type",
    "source_id",
    "debt_amount",
    "category_name",
    "note",
    "customer_id",
    "product_id",
    "invoice_id",
  ];

  for (let i = 0; i < 25; i++) {
    const { error } = await supabase.from(table).insert(payload);

    if (!error) return;

    lastError = error;

    if (!isSchemaCacheMissing(error.message)) throw error;

    const missing = getMissingColumnName(error.message);

    if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
      const next = { ...payload };
      delete next[missing];
      payload = next;
      continue;
    }

    const removable = optionalKeys.find((key) =>
      Object.prototype.hasOwnProperty.call(payload, key)
    );

    if (!removable) throw error;

    const next = { ...payload };
    delete next[removable];
    payload = next;
  }

  throw lastError || new Error("Insert failed");
}

async function updateAdaptive(
  table: string,
  id: string,
  userId: string,
  inputPayload: Record<string, any>
) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  const optionalKeys = [
    "source_type",
    "source_id",
    "debt_amount",
    "category_name",
    "note",
    "customer_id",
    "product_id",
    "invoice_id",
  ];

  for (let i = 0; i < 25; i++) {
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId);

    if (!error) return;

    lastError = error;

    if (!isSchemaCacheMissing(error.message)) throw error;

    const missing = getMissingColumnName(error.message);

    if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
      const next = { ...payload };
      delete next[missing];
      payload = next;
      continue;
    }

    const removable = optionalKeys.find((key) =>
      Object.prototype.hasOwnProperty.call(payload, key)
    );

    if (!removable) throw error;

    const next = { ...payload };
    delete next[removable];
    payload = next;
  }

  throw lastError || new Error("Update failed");
}

function formatRM(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getMonthKeyFromDate(date?: string | null) {
  if (!date) return "";
  return String(date).slice(0, 7);
}

function getInvoiceEffectiveDate(inv: Invoice) {
  return inv.invoice_date || inv.created_at?.slice(0, 10) || "";
}

function isInvoiceUnpaid(inv: Invoice) {
  const status = String(inv.status || "").toLowerCase();
  if (status === "paid" || status === "cancelled" || status === "canceled") return false;
  return Number(inv.total || 0) > 0;
}

function getDueTime(dueDate: string) {
  if (!dueDate || dueDate === "-") return Number.MAX_SAFE_INTEGER;
  const time = new Date(`${dueDate}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
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

  const [summaryMonth, setSummaryMonth] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | TxnType>("all");
  const [filterCustomerId, setFilterCustomerId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(getInitialFullscreen);
  const [returnTo, setReturnTo] = useState(getInitialReturnTo);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const currentYear = new Date().getFullYear();

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
    const savedCategories = safeParseArray<string>(safeLocalGet(CATEGORY_KEY));
    setCategories(uniqueCleanList([...DEFAULT_CATEGORIES, ...savedCategories]));

    const initialLang = getInitialLang();
    const initialTheme = getThemeKeyFromUrlOrLocalStorage("deepTeal");

    setLang(initialLang);
    safeLocalSet(LANG_KEY, initialLang);

    setThemeKey(initialTheme);
    saveThemeKey(initialTheme);
    applyThemeEverywhere(initialTheme);

    const q = new URLSearchParams(window.location.search);
    setReturnTo(q.get("return") || "");
    setIsFullscreen(q.get("fullscreen") === "1");

    init(initialLang, initialTheme);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const openParam = q.get("open");
    const fullscreenParam = q.get("fullscreen");
    const returnParam = q.get("return");
    const view = q.get("view");

    if (view === "income") setFilterType("income");
    if (view === "expense") setFilterType("expense");

    const shouldOpenNew = openParam === "new";
    const shouldFullscreen = fullscreenParam === "1";
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
            setIsFullscreen(shouldFullscreen);
            setReturnTo(returnParam || "");
            setTimeout(() => openNewForm(shouldFullscreen), 100);
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
      setIsFullscreen(shouldFullscreen);
      setReturnTo(returnParam || "");
      setTimeout(() => openNewForm(shouldFullscreen), 100);
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

  function saveCategories(nextCategories: string[]) {
    const fixed = uniqueCleanList(nextCategories);

    setCategories(fixed);
    safeLocalSet(CATEGORY_KEY, JSON.stringify(fixed));
  }

  function addCategory() {
    const value = newCategory.trim();
    if (!value) return;

    const next = uniqueCleanList([...categories, value]);

    saveCategories(next);
    setForm((prev) => ({ ...prev, category_name: value }));
    setNewCategory("");
  }

  function deleteCategory(value: string) {
    const next = categories.filter((x) => x !== value);

    saveCategories(next.length > 0 ? next : DEFAULT_CATEGORIES);

    if (form.category_name === value) {
      setForm((prev) => ({ ...prev, category_name: "" }));
    }
  }

  function buildDashboardUrl() {
    const query = new URLSearchParams();

    if (isTrial) query.set("mode", "trial");

    query.set("lang", lang);
    query.set("theme", themeKey);
    query.set("refresh", String(Date.now()));

    return `/dashboard?${query.toString()}`;
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
    window.location.href = buildDashboardUrl();
  }

  function goRelatedFeature() {
    go(relatedPath);
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);
    replaceUrlLangTheme(next, themeKey);
  }

  function openNewForm(forceFullscreen = false) {
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
    setIsFullscreen(forceFullscreen);
    setShowForm(true);
  }

  function closeForm() {
    const q = new URLSearchParams(window.location.search);
    const returnParam = q.get("return") || returnTo;

    if (returnParam === "dashboard") {
      window.location.href = buildDashboardUrl();
      return;
    }

    setEditingId(null);
    setShowForm(false);
    setIsFullscreen(false);
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

    q.delete("open");
    q.delete("fullscreen");
    q.delete("return");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function editTransaction(tx: Txn) {
    const linkedInvoice =
      tx.source_type === "invoice" && tx.source_id
        ? invoices.find((x) => x.id === tx.source_id)
        : null;

    setEditingId(tx.id);
    setForm({
      txn_date: tx.txn_date || today(),
      txn_type: tx.txn_type || "income",
      amount: String(tx.amount || ""),
      category_name: tx.category_name || "",
      debt_amount: String(tx.debt_amount || ""),
      note: tx.note || "",
      customer_id: linkedInvoice?.customer_id || "",
      product_id: "",
      invoice_id: tx.source_type === "invoice" && tx.source_id ? tx.source_id : "",
    });
    setIsFullscreen(false);
    setShowForm(true);
  }

  function selectedCustomerLabel() {
    const c = customers.find((x) => x.id === form.customer_id);
    if (!c) return "";

    return c.company_name ? `${c.name || "-"} / ${c.company_name}` : c.name || "";
  }

  function selectedProductName() {
    const p = products.find((x) => x.id === form.product_id);
    return p?.name || "";
  }

  function selectedInvoiceText() {
    const inv = invoices.find((x) => x.id === form.invoice_id);
    if (!inv) return "";

    const customerLabel = inv.customer_company
      ? `${inv.customer_name || "-"} / ${inv.customer_company}`
      : inv.customer_name || "";

    return `${inv.invoice_no || inv.id}${customerLabel ? `｜${customerLabel}` : ""}`;
  }

  function buildFinalNote() {
    const parts: string[] = [];

    if (form.customer_id) parts.push(`${t.customer}: ${selectedCustomerLabel()}`);
    if (form.product_id) parts.push(`${t.product}: ${selectedProductName()}`);
    if (form.invoice_id) parts.push(`${t.invoice}: ${selectedInvoiceText()}`);
    if (form.note.trim()) parts.push(form.note.trim());

    return parts.join("｜") || null;
  }

  async function saveTransaction() {
    setMsg("");

    if (isSaving) return;

    if (!form.txn_date || !form.amount || !form.category_name.trim()) {
      setMsg(t.needRequired);
      return;
    }

    setIsSaving(true);

    const amount = Number(form.amount || 0);
    const debt = Number(form.debt_amount || 0);
    const finalNote = buildFinalNote();

    const categoryName = form.category_name.trim();
    if (categoryName) {
      saveCategories(uniqueCleanList([...categories, categoryName]));
    }

    try {
      if (isTrial) {
        const payload: Txn = {
          id: editingId || makeId(),
          user_id: "trial",
          txn_date: form.txn_date,
          txn_type: form.txn_type,
          amount,
          category_name: categoryName,
          debt_amount: debt,
          note: finalNote,
          source_type: form.invoice_id ? "invoice" : null,
          source_id: form.invoice_id || null,
          created_at: editingId
            ? transactions.find((x) => x.id === editingId)?.created_at || new Date().toISOString()
            : new Date().toISOString(),
        };

        const next = editingId
          ? transactions.map((x) => (x.id === editingId ? payload : x))
          : [payload, ...transactions];

        saveTrialTransactions(next);
        setMsg(t.saved);
        setIsSaving(false);
        closeForm();
        return;
      }

      if (!session) {
        setIsSaving(false);
        return;
      }

      const payload = {
        user_id: session.user.id,
        txn_date: form.txn_date,
        txn_type: form.txn_type,
        amount,
        category_name: categoryName,
        debt_amount: debt,
        note: finalNote,
        source_type: form.invoice_id ? "invoice" : null,
        source_id: form.invoice_id || null,
      };

      if (editingId) {
        await updateAdaptive("transactions", editingId, session.user.id, payload);
      } else {
        await insertAdaptive("transactions", payload);
      }

      setMsg(t.saved);
      await loadAll(session.user.id);
      setIsSaving(false);
      closeForm();
    } catch (error: any) {
      setMsg(error?.message || String(error));
      setIsSaving(false);
    }
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

  const latestMonthKey = useMemo(() => {
    const months = [
      ...transactions.map((tx) => getMonthKeyFromDate(tx.txn_date)),
      ...invoices.map((inv) => getMonthKeyFromDate(getInvoiceEffectiveDate(inv))),
    ].filter(Boolean);

    if (months.length === 0) return today().slice(0, 7);

    return months.sort().reverse()[0];
  }, [transactions, invoices]);

  const activeMonthKey = summaryMonth || latestMonthKey;

  const yearOptions = useMemo(() => {
    const years = new Set<string>();

    for (let i = -4; i <= 4; i++) {
      years.add(String(currentYear + i));
    }

    transactions.forEach((tx) => {
      const year = getMonthKeyFromDate(tx.txn_date).slice(0, 4);
      if (year) years.add(year);
    });

    invoices.forEach((inv) => {
      const year = getMonthKeyFromDate(getInvoiceEffectiveDate(inv)).slice(0, 4);
      if (year) years.add(year);
    });

    if (activeMonthKey.slice(0, 4)) years.add(activeMonthKey.slice(0, 4));

    return Array.from(years).sort();
  }, [transactions, invoices, currentYear, activeMonthKey]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  }, []);

  const monthRecords = useMemo(() => {
    return transactions.filter((tx) => tx.txn_date?.startsWith(activeMonthKey));
  }, [transactions, activeMonthKey]);

  const summaryIncome = useMemo(() => {
    return monthRecords
      .filter((x) => x.txn_type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [monthRecords]);

  const summaryExpense = useMemo(() => {
    return monthRecords
      .filter((x) => x.txn_type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [monthRecords]);

  const summaryProfit = useMemo(() => {
    return summaryIncome - summaryExpense;
  }, [summaryIncome, summaryExpense]);

  const summaryBalance = useMemo(() => {
    return monthRecords.reduce((s, x) => {
      return x.txn_type === "income"
        ? s + Number(x.amount || 0)
        : s - Number(x.amount || 0);
    }, 0);
  }, [monthRecords]);

  const customerDebtItems = useMemo<DebtItem[]>(() => {
    const invoiceDebts: DebtItem[] = invoices
      .filter((inv) => isInvoiceUnpaid(inv))
      .map((inv) => {
        const customer = customers.find((c) => c.id === inv.customer_id);

        const customerName = inv.customer_name || customer?.name || "-";
        const companyName = inv.customer_company || customer?.company_name || "";

        const customerLabel = companyName ? `${customerName} / ${companyName}` : customerName;

        const dueDate = inv.due_date || inv.invoice_date || inv.created_at?.slice(0, 10) || "-";

        return {
          id: `invoice-${inv.id}`,
          source: "invoice",
          invoice: inv,
          customerLabel,
          amount: Number(inv.total || 0),
          dueDate,
          sortTime: getDueTime(dueDate),
        };
      });

    const customerDebts: DebtItem[] = customers
      .map((c) => {
        const balance = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);

        return {
          id: `customer-${c.id}`,
          source: "customer" as const,
          customer: c,
          customerLabel: c.company_name ? `${c.name || "-"} / ${c.company_name}` : c.name || "-",
          amount: balance,
          dueDate: c.last_payment_date || "-",
          sortTime: getDueTime(c.last_payment_date || ""),
        };
      })
      .filter((x) => x.amount > 0);

    return [...invoiceDebts, ...customerDebts].sort((a, b) => a.sortTime - b.sortTime);
  }, [invoices, customers]);

  const totalCustomerDebt = useMemo(() => {
    return customerDebtItems.reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [customerDebtItems]);

  const nearestDebt = customerDebtItems[0] || null;

  const filteredRecords = useMemo(() => {
    const s = search.toLowerCase().trim();
    const hasManualDateFilter = Boolean(filterStartDate || filterEndDate);

    return transactions.filter((tx) => {
      const invoice =
        tx.source_type === "invoice" ? invoices.find((x) => x.id === tx.source_id) : null;

      const selectedCustomer = customers.find((c) => c.id === filterCustomerId);
      const selectedFilterCustomerName = selectedCustomer?.name?.toLowerCase() || "";
      const selectedFilterCompanyName = selectedCustomer?.company_name?.toLowerCase() || "";

      const matchMonth = hasManualDateFilter || tx.txn_date?.startsWith(activeMonthKey);

      const matchType = filterType === "all" || tx.txn_type === filterType;

      const matchCustomer =
        !filterCustomerId ||
        Boolean(tx.note?.toLowerCase().includes(selectedFilterCustomerName)) ||
        Boolean(
          selectedFilterCompanyName &&
            tx.note?.toLowerCase().includes(selectedFilterCompanyName)
        ) ||
        invoice?.customer_id === filterCustomerId;

      const matchStart = !filterStartDate || tx.txn_date >= filterStartDate;
      const matchEnd = !filterEndDate || tx.txn_date <= filterEndDate;

      const searchText = [
        tx.txn_date,
        tx.txn_type,
        tx.amount,
        tx.category_name,
        tx.debt_amount,
        tx.note,
        invoice?.invoice_no,
        invoice?.customer_name,
        invoice?.customer_company,
        invoice?.total,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !s || searchText.includes(s);

      return matchMonth && matchType && matchCustomer && matchStart && matchEnd && matchSearch;
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
    activeMonthKey,
  ]);

  const formCategoryOptions = useMemo(() => {
    return uniqueCleanList([...categories, form.category_name]);
  }, [categories, form.category_name]);

  function getInvoice(tx: Txn) {
    if (tx.source_type !== "invoice" || !tx.source_id) return null;
    return invoices.find((x) => x.id === tx.source_id) || null;
  }

  function isDebtRecord(tx: Txn) {
    if (Number(tx.debt_amount || 0) > 0) return true;

    const inv = getInvoice(tx);
    if (inv && isInvoiceUnpaid(inv)) return true;

    return false;
  }

  return (
    <main
      className="smartacctg-page smartacctg-records-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
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
            onClick={() => openNewForm(false)}
            aria-label={t.add}
            style={{
              ...plusBtnStyle,
              background: theme.accent,
            }}
          >
            +
          </button>
        </div>

        <div className="records-summary-box" style={summaryBoxStyle}>
          <div className="records-month-row" style={monthRowStyle}>
            <strong style={{ color: theme.text }}>
              {t.summaryMonth}: {activeMonthKey}
            </strong>

            <div className="records-month-select-grid" style={monthSelectGridStyle}>
              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.year}</label>
                <select
                  value={activeMonthKey.slice(0, 4)}
                  onChange={(e) => {
                    const nextYear = e.target.value;
                    const currentMonthValue = activeMonthKey.slice(5, 7) || "01";
                    setSummaryMonth(`${nextYear}-${currentMonthValue}`);
                  }}
                  style={themedInputStyle}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.month}</label>
                <select
                  value={activeMonthKey.slice(5, 7)}
                  onChange={(e) => {
                    const currentYearValue = activeMonthKey.slice(0, 4) || String(currentYear);
                    setSummaryMonth(`${currentYearValue}-${e.target.value}`);
                  }}
                  style={themedInputStyle}
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={summaryDividerStyle} />

          <div className="records-summary-line">
            <span>{t.balance}</span>
            <strong style={{ color: theme.accent }}>{formatRM(summaryBalance)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthIncome}</span>
            <strong style={{ color: "#16a34a" }}>{formatRM(summaryIncome)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthExpense}</span>
            <strong style={{ color: "#dc2626" }}>{formatRM(summaryExpense)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthProfit}</span>
            <strong style={{ color: summaryProfit < 0 ? "#dc2626" : "#16a34a" }}>
              {formatRM(summaryProfit)}
            </strong>
          </div>

          <div className="records-summary-line">
            <span style={{ color: "#dc2626" }}>{t.customerDebt}</span>
            <strong style={{ color: "#dc2626" }}>{formatRM(totalCustomerDebt)}</strong>
          </div>

          <div className="records-debt-detail" style={{ color: "#dc2626" }}>
            {nearestDebt ? (
              <>
                <div>{nearestDebt.customerLabel}</div>
                <div>
                  {t.dueDate}: {nearestDebt.dueDate}
                </div>
              </>
            ) : (
              <div>{t.noDebt}</div>
            )}
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
                {c.company_name ? `${c.name || "-"} / ${c.company_name}` : c.name || "-"}
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
              const debtRecord = isDebtRecord(tx);

              return (
                <div
                  key={tx.id}
                  className={`record-card ${debtRecord ? "debt-record" : ""}`}
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

                    <p style={{ ...mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                      {t.date}: {tx.txn_date} ｜ {t.amount}:{" "}
                      <strong style={{ color: isIncome ? "#16a34a" : "#dc2626" }}>
                        {formatRM(Number(tx.amount || 0))}
                      </strong>
                    </p>

                    {Number(tx.debt_amount || 0) > 0 ? (
                      <p style={{ ...mutedStyle, color: "#dc2626", fontWeight: 900 }}>
                        {t.debtAmount}: {formatRM(Number(tx.debt_amount || 0))}
                      </p>
                    ) : null}

                    {invoice ? (
                      <p style={{ ...mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                        {t.sourceInvoice}: {invoice.invoice_no || invoice.id}{" "}
                        {invoice.customer_name ? `｜${invoice.customer_name}` : ""}
                        {invoice.customer_company ? ` / ${invoice.customer_company}` : ""}
                      </p>
                    ) : (
                      <p style={{ ...mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                        {t.manualRecord}
                      </p>
                    )}

                    {tx.note ? (
                      <p style={{ ...mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
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
        <div
          className={isFullscreen ? "records-fullscreen-overlay" : ""}
          style={isFullscreen ? undefined : overlayStyle}
        >
          <section
            className={`sa-modal ${isFullscreen ? "records-fullscreen-modal" : ""}`}
            style={{
              ...modalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-header" style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{editingId ? t.update : t.add}</h2>

              <button
                type="button"
                className="sa-close-x"
                onClick={closeForm}
                aria-label={t.close}
                style={closeXStyle}
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

              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.type}</label>
                <select
                  value={form.txn_type}
                  onChange={(e) => setForm({ ...form, txn_type: e.target.value as TxnType })}
                  style={themedInputStyle}
                >
                  <option value="income">{t.income}</option>
                  <option value="expense">{t.expense}</option>
                </select>
              </div>

              <input
                placeholder={t.amount}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={themedInputStyle}
                inputMode="decimal"
              />

              <select
                value={form.category_name}
                onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                style={themedInputStyle}
              >
                <option value="">{t.chooseCategory}</option>
                {formCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

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

            <h3 style={sectionTitleStyle}>{t.addCategory}</h3>

            <div className="category-add-row" style={categoryAddRowStyle}>
              <input
                placeholder={t.categoryPlaceholder}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ ...themedInputStyle, marginBottom: 0 }}
              />

              <button
                type="button"
                onClick={addCategory}
                style={{
                  ...primaryBtnStyle,
                  background: theme.accent,
                  marginTop: 0,
                }}
              >
                +
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <strong style={{ display: "block", marginBottom: 8 }}>{t.savedCategory}</strong>

              <div className="category-chip-row">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="category-chip"
                    style={{
                      background: theme.softBg || theme.soft || "#ccfbf1",
                      color: theme.accent,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat)}
                      title={t.deleteCategory}
                      style={chipDeleteBtnStyle}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
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
                    {c.company_name ? `${c.name || "-"} / ${c.company_name}` : c.name || "-"}
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
                    {p.name || "-"} - {formatRM(Number(p.price || 0))}
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
                    {inv.customer_name ? `- ${inv.customer_name}` : ""}
                    {inv.customer_company ? ` / ${inv.customer_company}` : ""} -{" "}
                    {formatRM(Number(inv.total || 0))}
                  </option>
                ))}
              </select>
            </div>

            <div style={modalActionRowStyle}>
              <button
                type="button"
                onClick={saveTransaction}
                disabled={isSaving}
                style={{
                  ...primaryBtnStyle,
                  background: theme.accent,
                  marginTop: 0,
                  opacity: isSaving ? 0.65 : 1,
                }}
              >
                {isSaving ? t.saving : editingId ? t.update : t.save}
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
  marginTop: 18,
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

const summaryBoxStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  marginTop: 8,
};

const monthRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 10,
  alignItems: "center",
};

const monthSelectGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  width: "100%",
};

const summaryDividerStyle: CSSProperties = {
  height: 1,
  width: "100%",
  background: "rgba(148, 163, 184, 0.38)",
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
  textAlignLast: "center" as any,
  display: "block",
  lineHeight: "normal",
};

const responsiveGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const categoryAddRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
};

const chipDeleteBtnStyle: CSSProperties = {
  width: 22,
  height: 22,
  minWidth: 22,
  minHeight: 22,
  borderRadius: 999,
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  fontWeight: 900,
  lineHeight: 1,
  padding: 0,
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
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const modalHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const closeXStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontWeight: 900,
  padding: "4px 8px",
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
