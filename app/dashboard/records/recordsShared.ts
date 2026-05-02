import { CSSProperties } from "react";
import {
  THEMES,
  type ThemeKey,
  applyThemeToDocument,
  normalizeThemeKey,
} from "@/lib/smartacctgTheme";

export type Lang = "zh" | "en" | "ms";
export type TxnType = "income" | "expense";

export type Txn = {
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

export type Customer = {
  id: string;
  user_id?: string;
  name?: string | null;
  phone?: string | null;
  company_name?: string | null;
  debt_amount?: number | null;
  paid_amount?: number | null;
  last_payment_date?: string | null;
};

export type Product = {
  id: string;
  user_id?: string;
  name?: string | null;
  price?: number | null;
  cost?: number | null;
  stock_qty?: number | null;
};

export type Invoice = {
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

export type Profile = {
  id?: string;
  theme?: string | null;
};

export type DebtItem = {
  id: string;
  source: "customer" | "invoice";
  customerLabel: string;
  amount: number;
  dueDate: string;
  sortTime: number;
};

export type RecordFormState = {
  txn_date: string;
  txn_type: TxnType;
  amount: string;
  category_name: string;
  debt_amount: string;
  note: string;
  customer_id: string;
  product_id: string;
  invoice_id: string;
};

export const TRIAL_KEY = "smartacctg_trial";
export const TRIAL_TX_KEY = "smartacctg_trial_transactions";
export const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
export const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
export const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";

export const LANG_KEY = "smartacctg_lang";
export const CATEGORY_KEY = "smartacctg_record_categories";

export const DEFAULT_CATEGORY_KEYS = [
  "invoice_income",
  "normal_income",
  "customer_payment",
  "purchase",
  "salary",
  "transport",
  "food",
  "phone_bill",
  "ads_fee",
  "others",
];

export const CATEGORY_ALIASES: Record<string, string> = {
  发票收入: "invoice_income",
  普通收入: "normal_income",
  客户付款: "customer_payment",
  客戶付款: "customer_payment",
  进货: "purchase",
  進貨: "purchase",
  人工: "salary",
  交通: "transport",
  饮食: "food",
  飲食: "food",
  电话费: "phone_bill",
  電話費: "phone_bill",
  广告费: "ads_fee",
  廣告費: "ads_fee",
  其他: "others",

  "Invoice Income": "invoice_income",
  "Normal Income": "normal_income",
  "Customer Payment": "customer_payment",
  Purchase: "purchase",
  Salary: "salary",
  Transport: "transport",
  Food: "food",
  "Phone Bill": "phone_bill",
  "Ads Fee": "ads_fee",
  Others: "others",

  "Pendapatan Invois": "invoice_income",
  "Pendapatan Biasa": "normal_income",
  "Bayaran Pelanggan": "customer_payment",
  "Belian Stok": "purchase",
  Gaji: "salary",
  Pengangkutan: "transport",
  Makanan: "food",
  "Bil Telefon": "phone_bill",
  "Kos Iklan": "ads_fee",
  Lain: "others",
};

export const TXT = {
  zh: {
    title: "帐目记录",
    back: "返回控制台",
    add: "新增记账",
    edit: "编辑",
    delete: "删除",
    confirm: "确定",
    cancelDelete: "取消",
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
    year: "年份",
    month: "月份",
    dueDate: "到期日",
    noDebt: "暂无客户欠款",
    date: "日期",
    type: "类型",
    amount: "金额",
    category: "分类 / 标签",
    addCategory: "新增分类 / 标签",
    savedCategory: "已保存分类",
    categoryName: "分类名称",
    debtAmount: "欠款金额",
    note: "备注",
    customer: "客户",
    product: "产品",
    invoice: "发票",
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
    deletePreview: "删除前确认资料",
    trialMode: "免费试用模式：资料只会暂存在本机",
    filterCustomer: "筛选客户",
    startDate: "开始日期",
    endDate: "结束日期",
    sourceInvoice: "来自发票",
    manualRecord: "手动记录",
    needRequired: "请填写日期、金额和分类",
    noData: "-",
    catInvoiceIncome: "发票收入",
    catNormalIncome: "普通收入",
    catCustomerPayment: "客户付款",
    catPurchase: "进货",
    catSalary: "人工",
    catTransport: "交通",
    catFood: "饮食",
    catPhoneBill: "电话费",
    catAdsFee: "广告费",
    catOthers: "其他",
  },
  en: {
    title: "Accounting Records",
    back: "Back to Dashboard",
    add: "Add Record",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    cancelDelete: "Cancel",
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
    year: "Year",
    month: "Month",
    dueDate: "Due Date",
    noDebt: "No customer debt",
    date: "Date",
    type: "Type",
    amount: "Amount",
    category: "Category / Tag",
    addCategory: "Add Category / Tag",
    savedCategory: "Saved Categories",
    categoryName: "Category Name",
    debtAmount: "Debt Amount",
    note: "Note",
    customer: "Customer",
    product: "Product",
    invoice: "Invoice",
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
    confirmDelete: "Confirm delete this record?",
    deletePreview: "Delete Confirmation",
    trialMode: "Free trial mode: data is stored locally only",
    filterCustomer: "Filter Customer",
    startDate: "Start Date",
    endDate: "End Date",
    sourceInvoice: "From Invoice",
    manualRecord: "Manual Record",
    needRequired: "Please fill in date, amount and category",
    noData: "-",
    catInvoiceIncome: "Invoice Income",
    catNormalIncome: "Normal Income",
    catCustomerPayment: "Customer Payment",
    catPurchase: "Purchase",
    catSalary: "Salary",
    catTransport: "Transport",
    catFood: "Food",
    catPhoneBill: "Phone Bill",
    catAdsFee: "Ads Fee",
    catOthers: "Others",
  },
  ms: {
    title: "Rekod Akaun",
    back: "Kembali ke Dashboard",
    add: "Tambah Rekod",
    edit: "Edit",
    delete: "Padam",
    confirm: "Sahkan",
    cancelDelete: "Batal",
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
    year: "Tahun",
    month: "Bulan",
    dueDate: "Tarikh Tamat",
    noDebt: "Tiada hutang pelanggan",
    date: "Tarikh",
    type: "Jenis",
    amount: "Jumlah",
    category: "Kategori / Tag",
    addCategory: "Tambah Kategori / Tag",
    savedCategory: "Kategori Disimpan",
    categoryName: "Nama Kategori",
    debtAmount: "Jumlah Hutang",
    note: "Catatan",
    customer: "Pelanggan",
    product: "Produk",
    invoice: "Invois",
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
    confirmDelete: "Sahkan padam rekod ini?",
    deletePreview: "Sahkan Padam",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
    filterCustomer: "Tapis Pelanggan",
    startDate: "Tarikh Mula",
    endDate: "Tarikh Akhir",
    sourceInvoice: "Daripada Invois",
    manualRecord: "Rekod Manual",
    needRequired: "Sila isi tarikh, jumlah dan kategori",
    noData: "-",
    catInvoiceIncome: "Pendapatan Invois",
    catNormalIncome: "Pendapatan Biasa",
    catCustomerPayment: "Bayaran Pelanggan",
    catPurchase: "Belian Stok",
    catSalary: "Gaji",
    catTransport: "Pengangkutan",
    catFood: "Makanan",
    catPhoneBill: "Bil Telefon",
    catAdsFee: "Kos Iklan",
    catOthers: "Lain",
  },
};

export type RecordsText = (typeof TXT)[Lang];

export const RECORDS_PAGE_CSS = `
  .smartacctg-records-page,
  .smartacctg-records-page * {
    box-sizing: border-box !important;
  }

  .smartacctg-records-page h1,
  .smartacctg-records-page h2,
  .smartacctg-records-page h3,
  .smartacctg-records-page strong,
  .smartacctg-records-page button {
    font-weight: 900 !important;
  }

  .smartacctg-records-page p,
  .smartacctg-records-page div,
  .smartacctg-records-page span,
  .smartacctg-records-page label,
  .smartacctg-records-page input,
  .smartacctg-records-page select,
  .smartacctg-records-page textarea {
    font-weight: 400 !important;
  }

  .smartacctg-records-page input[type="date"],
  .smartacctg-records-page input[type="month"] {
    display: block !important;
    width: 100% !important;
    height: var(--sa-control-h, 54px) !important;
    min-height: var(--sa-control-h, 54px) !important;
    line-height: var(--sa-control-h, 54px) !important;
    text-align: center !important;
    text-align-last: center !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-date-and-time-value,
  .smartacctg-records-page input[type="month"]::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    line-height: normal !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-datetime-edit,
  .smartacctg-records-page input[type="month"]::-webkit-datetime-edit {
    width: 100% !important;
    text-align: center !important;
    padding: 0 !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-datetime-edit-fields-wrapper,
  .smartacctg-records-page input[type="month"]::-webkit-datetime-edit-fields-wrapper {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
  }

  .smartacctg-records-page .records-month-select-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }

  .smartacctg-records-page .records-summary-line {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 10px !important;
    align-items: center !important;
    line-height: 1.25 !important;
  }

  .smartacctg-records-page .records-list {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  .smartacctg-records-page .record-card {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-records-page .record-card.debt-record {
    background: #fee2e2 !important;
    color: #7f1d1d !important;
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.35),
      0 12px 28px rgba(220, 38, 38, 0.22) !important;
  }

  .smartacctg-records-page .records-action-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
  }

  .smartacctg-records-page .records-action-row button {
    flex: 0 1 auto !important;
    min-width: 105px !important;
  }

  .smartacctg-records-page .records-fullscreen-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    overflow: hidden !important;
    padding: 0 !important;
    background: rgba(15, 23, 42, 0.58) !important;
  }

  .smartacctg-records-page .records-fullscreen-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    max-height: 100dvh !important;
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

  .smartacctg-records-page .records-modal-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 20 !important;
    background: inherit !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 12px !important;
    align-items: center !important;
    padding-bottom: 12px !important;
    margin-bottom: 12px !important;
  }

  @media (max-width: 520px) {
    .smartacctg-records-page .records-month-select-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 8px !important;
    }

    .smartacctg-records-page .records-action-row button {
      min-width: 96px !important;
    }
  }
`;

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getBlankForm(): RecordFormState {
  return {
    txn_date: today(),
    txn_type: "income",
    amount: "",
    category_name: "",
    debt_amount: "",
    note: "",
    customer_id: "",
    product_id: "",
    invoice_id: "",
  };
}

export function safeLocalGet(key: string) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function safeLocalSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

export function safeLocalRemove(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function uniqueCleanList(list: string[]) {
  return Array.from(new Set(list.map((x) => String(x || "").trim()).filter(Boolean)));
}

export function normalizeCategory(value?: string | null) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return CATEGORY_ALIASES[raw] || raw;
}

export function getInitialLang(): Lang {
  if (typeof window === "undefined") return "zh";

  const q = new URLSearchParams(window.location.search);
  const urlLang = q.get("lang") as Lang | null;
  const savedLang = safeLocalGet(LANG_KEY) as Lang | null;

  if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") return urlLang;
  if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") return savedLang;

  return "zh";
}

export function getInitialFullscreen() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("fullscreen") === "1";
}

export function getInitialReturn() {
  if (typeof window === "undefined") return "";
  const q = new URLSearchParams(window.location.search);
  return q.get("return") || "";
}

export function applyThemeEverywhere(key: ThemeKey) {
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

export function replaceUrlLangTheme(nextLang: Lang, nextTheme: ThemeKey) {
  if (typeof window === "undefined") return;

  const q = new URLSearchParams(window.location.search);
  q.set("lang", nextLang);
  q.set("theme", nextTheme);
  q.set("refresh", String(Date.now()));

  window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
}

export function isSchemaCacheMissingSource(message: string) {
  const lower = String(message || "").toLowerCase();

  return (
    lower.includes("source_type") ||
    lower.includes("source_id") ||
    lower.includes("schema cache") ||
    lower.includes("could not find") ||
    lower.includes("column")
  );
}

export function formatRM(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getMonthKeyFromDate(date?: string | null) {
  if (!date) return "";
  return String(date).slice(0, 7);
}

export function getInvoiceEffectiveDate(inv: Invoice) {
  return inv.invoice_date || inv.created_at?.slice(0, 10) || "";
}

export function isInvoiceUnpaid(inv: Invoice) {
  const status = String(inv.status || "").toLowerCase();
  if (status === "paid" || status === "cancelled" || status === "canceled") return false;
  return Number(inv.total || 0) > 0;
}

export function getDueTime(dueDate: string) {
  if (!dueDate || dueDate === "-") return Number.MAX_SAFE_INTEGER;
  const time = new Date(`${dueDate}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export function displayRecordNote(note: string | null | undefined, t: RecordsText) {
  if (!note) return "";

  return String(note)
    .replace(/客户\s*:/g, `${t.customer}:`)
    .replace(/客戶\s*:/g, `${t.customer}:`)
    .replace(/Customer\s*:/gi, `${t.customer}:`)
    .replace(/Pelanggan\s*:/gi, `${t.customer}:`)
    .replace(/产品\s*:/g, `${t.product}:`)
    .replace(/產品\s*:/g, `${t.product}:`)
    .replace(/Product\s*:/gi, `${t.product}:`)
    .replace(/Produk\s*:/gi, `${t.product}:`)
    .replace(/发票\s*:/g, `${t.invoice}:`)
    .replace(/發票\s*:/g, `${t.invoice}:`)
    .replace(/Invoice\s*:/gi, `${t.invoice}:`)
    .replace(/Invois\s*:/gi, `${t.invoice}:`);
}

export const styles = {
  pageStyle: {
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
    padding: "clamp(10px, 2vw, 24px)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  } as CSSProperties,

  topbarStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  } as CSSProperties,

  backBtnStyle: {
    border: "2px solid",
    borderRadius: "999px",
    padding: "0 var(--sa-control-x)",
    minHeight: "var(--sa-control-h)",
    whiteSpace: "nowrap",
  } as CSSProperties,

  cardStyle: {
    border: "var(--sa-border-w) solid",
    borderRadius: "var(--sa-radius-card)",
    padding: "var(--sa-card-pad)",
    marginBottom: 14,
  } as CSSProperties,

  recordHeaderStyle: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  } as CSSProperties,

  titleStyle: {
    margin: 0,
    fontSize: "var(--sa-fs-2xl)",
    fontWeight: 900,
    lineHeight: 1.12,
  } as CSSProperties,

  sectionTitleStyle: {
    marginTop: 0,
    marginBottom: 14,
    fontSize: "var(--sa-fs-xl)",
    fontWeight: 900,
  } as CSSProperties,

  plusBtnStyle: {
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
  } as CSSProperties,

  summaryBoxStyle: {
    display: "grid",
    gap: 12,
    width: "100%",
    marginTop: 8,
  } as CSSProperties,

  monthRowStyle: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    alignItems: "center",
  } as CSSProperties,

  monthSelectGridStyle: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    width: "100%",
  } as CSSProperties,

  summaryDividerStyle: {
    height: 1,
    width: "100%",
    background: "rgba(148, 163, 184, 0.38)",
  } as CSSProperties,

  debtDetailStyle: {
    marginTop: 2,
    paddingTop: 4,
    display: "grid",
    gap: 4,
    lineHeight: 1.35,
  } as CSSProperties,

  inputStyle: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    minHeight: "var(--sa-control-h)",
    padding: "0 var(--sa-control-x)",
    borderRadius: "var(--sa-radius-control)",
    border: "var(--sa-border-w) solid",
    outline: "none",
    fontSize: 16,
  } as CSSProperties,

  dateWrapStyle: {
    width: "100%",
  } as CSSProperties,

  dateLabelStyle: {
    display: "block",
    marginBottom: 6,
  } as CSSProperties,

  responsiveGridStyle: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  } as CSSProperties,

  relatedMenuRowStyle: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 12,
    alignItems: "center",
  } as CSSProperties,

  recordListStyle: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 18,
    width: "100%",
  } as CSSProperties,

  recordCardStyle: {
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
  } as CSSProperties,

  recordTitleStyle: {
    margin: 0,
    overflowWrap: "anywhere",
    fontSize: "var(--sa-fs-lg)",
    fontWeight: 900,
  } as CSSProperties,

  mutedStyle: {
    overflowWrap: "anywhere",
    lineHeight: 1.55,
    margin: "8px 0 0",
  } as CSSProperties,

  actionRowStyle: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
  } as CSSProperties,

  actionBtnStyle: {
    minWidth: 104,
    minHeight: 44,
    color: "#fff",
    border: "none",
    borderRadius: "var(--sa-radius-control)",
    padding: "0 14px",
  } as CSSProperties,

  deleteBtnStyle: {
    minWidth: 104,
    minHeight: 44,
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "var(--sa-radius-control)",
    padding: "0 14px",
  } as CSSProperties,

  primaryBtnStyle: {
    color: "#fff",
    border: "none",
    borderRadius: "var(--sa-radius-control)",
    padding: "0 18px",
    minHeight: "var(--sa-control-h)",
  } as CSSProperties,

  secondaryBtnStyle: {
    border: "var(--sa-border-w) solid",
    borderRadius: "var(--sa-radius-control)",
    padding: "0 18px",
    minHeight: "var(--sa-control-h)",
  } as CSSProperties,

  msgStyle: {
    padding: 12,
    borderRadius: "var(--sa-radius-control)",
    marginBottom: 14,
  } as CSSProperties,

  trialMsgStyle: {
    background: "#fef3c7",
    color: "#92400e",
    padding: 12,
    borderRadius: "var(--sa-radius-control)",
    marginBottom: 14,
  } as CSSProperties,

  overlayStyle: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.52)",
    padding: "clamp(12px, 3vw, 24px)",
    zIndex: 999,
    overflowY: "auto",
  } as CSSProperties,

  modalStyle: {
    width: "100%",
    maxWidth: 900,
    margin: "0 auto",
    border: "var(--sa-border-w) solid",
    borderRadius: "var(--sa-radius-card)",
    padding: "var(--sa-card-pad)",
  } as CSSProperties,

  modalHeaderStyle: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
  } as CSSProperties,

  modalTitleStyle: {
    margin: 0,
    fontSize: "var(--sa-fs-xl)",
    fontWeight: 900,
  } as CSSProperties,

  closeBtnStyle: {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    fontSize: "var(--sa-fs-base)",
    padding: 8,
  } as CSSProperties,

  modalActionRowStyle: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
  } as CSSProperties,

  categoryAddRowStyle: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 10,
    alignItems: "center",
  } as CSSProperties,

  categoryChipWrapStyle: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  } as CSSProperties,

  categoryChipStyle: {
    border: "var(--sa-border-w) solid",
    borderRadius: 999,
    minHeight: 38,
    padding: "0 12px",
  } as CSSProperties,

  deleteModalStyle: {
    width: "100%",
    maxWidth: 680,
    margin: "0 auto",
    border: "var(--sa-border-w) solid",
    borderRadius: "var(--sa-radius-card)",
    padding: "var(--sa-card-pad)",
  } as CSSProperties,

  deleteInfoBoxStyle: {
    border: "1px solid rgba(148, 163, 184, 0.55)",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    marginBottom: 14,
  } as CSSProperties,

  deleteConfirmRowStyle: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 16,
  } as CSSProperties,

  confirmDeleteBtnStyle: {
    minHeight: "var(--sa-control-h)",
    border: "none",
    borderRadius: "var(--sa-radius-control)",
    background: "#dc2626",
    color: "#fff",
  } as CSSProperties,

  cancelDeleteBtnStyle: {
    minHeight: "var(--sa-control-h)",
    border: "var(--sa-border-w) solid #cbd5e1",
    borderRadius: "var(--sa-radius-control)",
    background: "#fff",
    color: "#111827",
  } as CSSProperties,
};
