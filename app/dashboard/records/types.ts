import type { Lang, Invoice } from "./types";

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

export const today = () => new Date().toISOString().slice(0, 10);

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
} as const;

export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

export function displayCategoryByLang(value: string | null | undefined, lang: Lang) {
  const t = TXT[lang];
  const key = normalizeCategory(value);

  if (key === "invoice_income") return t.catInvoiceIncome;
  if (key === "normal_income") return t.catNormalIncome;
  if (key === "customer_payment") return t.catCustomerPayment;
  if (key === "purchase") return t.catPurchase;
  if (key === "salary") return t.catSalary;
  if (key === "transport") return t.catTransport;
  if (key === "food") return t.catFood;
  if (key === "phone_bill") return t.catPhoneBill;
  if (key === "ads_fee") return t.catAdsFee;
  if (key === "others") return t.catOthers;

  return value || t.noData;
}
