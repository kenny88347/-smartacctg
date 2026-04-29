"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type CustomerStatus = "normal" | "vip" | "debt" | "blocked";
type ThemeKey = "deepTeal" | "pink" | "blackGold" | "lightRed" | "nature" | "sky";

type Customer = {
  id: string;
  user_id?: string;
  name: string;
  phone: string | null;
  email: string | null;
  company_name: string | null;
  company_reg_no: string | null;
  company_phone: string | null;
  address: string | null;
  status: CustomerStatus | null;
  debt_amount: number | null;
  paid_amount: number | null;
  last_payment_date: string | null;
  note: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number | null;
};

type CustomerPrice = {
  id: string;
  user_id?: string;
  customer_id: string;
  product_id: string;
  custom_price: number;
};

type Invoice = {
  id: string;
  user_id?: string;
  customer_id?: string | null;
  customer_name?: string | null;
  invoice_no?: string | null;
  invoice_date?: string | null;
  created_at?: string | null;
  subtotal?: number | null;
  total?: number | null;
  total_cost?: number | null;
  total_profit?: number | null;
  note?: string | null;
  status?: string | null;
};

type Profile = {
  id?: string;
  theme?: string | null;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_CUSTOMER_PRICES_KEY = "smartacctg_trial_customer_prices";
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
};

const TXT = {
  zh: {
    pageTitle: "客户资料记录",
    formTitle: "填写客户资料",
    back: "返回控制台",
    add: "新增",
    save: "保存资料",
    update: "保存修改",
    saving: "保存中...",
    saveFailed: "保存失败：",
    nameRequired: "请填写客户名称",
    cancelEdit: "取消编辑",
    cancel: "取消",
    close: "关闭",
    search: "搜索客户名称 / 手机号码 / 公司名称 / 电子邮件",
    all: "全部",
    normal: "正常客户",
    vip: "VIP 客户",
    debt: "有欠款",
    blocked: "停止合作",
    personal: "个人资料",
    company: "公司资料",
    name: "客户名称",
    phone: "客户手机号码",
    email: "电子邮件",
    companyName: "公司名称",
    regNo: "SSM / 注册号",
    companyPhone: "公司电话",
    address: "地址",
    status: "客户状态",
    debtAmount: "欠款金额",
    paidAmount: "已付款金额",
    lastPaymentDate: "日期",
    note: "备注",
    edit: "编辑",
    delete: "删除",
    whatsapp: "WhatsApp",
    invoice: "开发票",
    invoiceRecords: "发票记录",
    createNewInvoice: "新增发票",
    invoiceNo: "发票号码",
    invoiceDate: "发票日期",
    invoiceTotal: "发票总额",
    invoiceProfit: "利润",
    noInvoice: "这个客户还没有发票记录",
    selectedCustomer: "当前客户",
    accounting: "记账系统",
    products: "产品管理",
    invoices: "发票系统",
    noCustomers: "还没有客户资料",
    priceTitle: "产品专属价格",
    chooseCustomer: "选择客户",
    chooseProduct: "选择产品",
    customPrice: "这个客户的专属价格",
    savePrice: "保存专属价格",
    productNormalPrice: "产品原价",
    currentPrices: "目前已设置价格",
    noPrice: "还没有设置专属价格",
    saved: "保存成功",
    deleted: "删除成功",
    related: "关联功能",
    goFeature: "前往",
    trialMode: "免费试用模式：资料只会暂存在本机",
    confirmDelete: "确定要删除这个客户吗？",
    balance: "余额",
  },
  en: {
    pageTitle: "Customer Records",
    formTitle: "Customer Information",
    back: "Back to Dashboard",
    add: "Add",
    save: "Save",
    update: "Save Changes",
    saving: "Saving...",
    saveFailed: "Save failed: ",
    nameRequired: "Please enter customer name",
    cancelEdit: "Cancel Edit",
    cancel: "Cancel",
    close: "Close",
    search: "Search customer name / phone / company / email",
    all: "All",
    normal: "Normal",
    vip: "VIP",
    debt: "In Debt",
    blocked: "Blocked",
    personal: "Personal Info",
    company: "Company Info",
    name: "Customer Name",
    phone: "Phone",
    email: "Email",
    companyName: "Company Name",
    regNo: "SSM / Registration No.",
    companyPhone: "Company Phone",
    address: "Address",
    status: "Status",
    debtAmount: "Debt Amount",
    paidAmount: "Paid Amount",
    lastPaymentDate: "Date",
    note: "Note",
    edit: "Edit",
    delete: "Delete",
    whatsapp: "WhatsApp",
    invoice: "Invoice",
    invoiceRecords: "Invoice Records",
    createNewInvoice: "Create Invoice",
    invoiceNo: "Invoice No.",
    invoiceDate: "Invoice Date",
    invoiceTotal: "Invoice Total",
    invoiceProfit: "Profit",
    noInvoice: "No invoice records for this customer yet",
    selectedCustomer: "Selected Customer",
    accounting: "Accounting",
    products: "Products",
    invoices: "Invoices",
    noCustomers: "No customer records yet",
    priceTitle: "Product Special Price",
    chooseCustomer: "Choose Customer",
    chooseProduct: "Choose Product",
    customPrice: "Special Price",
    savePrice: "Save Special Price",
    productNormalPrice: "Normal Price",
    currentPrices: "Current Special Prices",
    noPrice: "No special price yet",
    saved: "Saved",
    deleted: "Deleted",
    related: "Linked Features",
    goFeature: "Go",
    trialMode: "Free trial mode: data is stored locally only",
    confirmDelete: "Confirm delete this customer?",
    balance: "Balance",
  },
  ms: {
    pageTitle: "Rekod Pelanggan",
    formTitle: "Maklumat Pelanggan",
    back: "Kembali ke Dashboard",
    add: "Tambah",
    save: "Simpan",
    update: "Simpan Perubahan",
    saving: "Sedang simpan...",
    saveFailed: "Gagal simpan: ",
    nameRequired: "Sila isi nama pelanggan",
    cancelEdit: "Batal Edit",
    cancel: "Batal",
    close: "Tutup",
    search: "Cari nama pelanggan / telefon / syarikat / email",
    all: "Semua",
    normal: "Biasa",
    vip: "VIP",
    debt: "Ada Hutang",
    blocked: "Disekat",
    personal: "Maklumat Peribadi",
    company: "Maklumat Syarikat",
    name: "Nama Pelanggan",
    phone: "Telefon",
    email: "Email",
    companyName: "Nama Syarikat",
    regNo: "SSM / No. Daftar",
    companyPhone: "Telefon Syarikat",
    address: "Alamat",
    status: "Status",
    debtAmount: "Jumlah Hutang",
    paidAmount: "Jumlah Dibayar",
    lastPaymentDate: "Tarikh",
    note: "Catatan",
    edit: "Edit",
    delete: "Padam",
    whatsapp: "WhatsApp",
    invoice: "Invois",
    invoiceRecords: "Rekod Invois",
    createNewInvoice: "Tambah Invois",
    invoiceNo: "No. Invois",
    invoiceDate: "Tarikh Invois",
    invoiceTotal: "Jumlah Invois",
    invoiceProfit: "Untung",
    noInvoice: "Pelanggan ini belum ada rekod invois",
    selectedCustomer: "Pelanggan Dipilih",
    accounting: "Sistem Akaun",
    products: "Produk",
    invoices: "Invois",
    noCustomers: "Tiada rekod pelanggan",
    priceTitle: "Harga Khas Produk",
    chooseCustomer: "Pilih Pelanggan",
    chooseProduct: "Pilih Produk",
    customPrice: "Harga Khas",
    savePrice: "Simpan Harga Khas",
    productNormalPrice: "Harga Asal",
    currentPrices: "Harga Khas Semasa",
    noPrice: "Belum ada harga khas",
    saved: "Disimpan",
    deleted: "Dipadam",
    related: "Fungsi Berkaitan",
    goFeature: "Pergi",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
    confirmDelete: "Padam pelanggan ini?",
    balance: "Baki",
  },
};

const CUSTOMERS_PAGE_FIX_CSS = `
  .smartacctg-customers-page .customers-list {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 18px !important;
    width: 100% !important;
  }

  .smartacctg-customers-page .customer-card {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: auto !important;
    text-align: left !important;
    overflow-wrap: anywhere !important;
    border-width: var(--sa-border-w) !important;
    border-style: solid !important;
    border-radius: var(--sa-radius-card) !important;
    padding: var(--sa-card-pad) !important;
  }

  .smartacctg-customers-page .customer-card * {
    text-align: left !important;
  }

  .smartacctg-customers-page .customer-card h3 {
    margin: 0 0 10px 0 !important;
    font-size: var(--sa-fs-xl) !important;
    line-height: 1.25 !important;
    font-weight: 900 !important;
  }

  .smartacctg-customers-page .customer-card p {
    margin: 8px 0 0 !important;
    line-height: 1.55 !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-customers-page .customer-status-badge {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 4px 12px !important;
    border-radius: 999px !important;
    font-size: clamp(14px, 3vw, 17px) !important;
    font-weight: 900 !important;
    line-height: 1.15 !important;
    white-space: nowrap !important;
    vertical-align: middle !important;
    margin-left: 6px !important;
  }

  .smartacctg-customers-page .customers-action-row {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    flex-wrap: wrap !important;
    width: 100% !important;
    margin-top: 8px !important;
  }

  .smartacctg-customers-page .customers-action-row button {
    flex: 0 1 calc(33.333% - 8px) !important;
    min-width: 108px !important;
    max-width: 190px !important;
    width: auto !important;
    white-space: normal !important;
    text-align: center !important;
  }

  .smartacctg-customers-page .sa-center-date-input {
    text-align: center !important;
    text-align-last: center !important;
    display: block !important;
    width: 100% !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  .smartacctg-customers-page .sa-center-date-input::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    min-height: 1.6em !important;
  }

  .smartacctg-customers-page .sa-center-date-input::-webkit-datetime-edit {
    width: 100% !important;
    text-align: center !important;
  }

  .smartacctg-customers-page .sa-center-date-input::-webkit-datetime-edit-fields-wrapper {
    justify-content: center !important;
    text-align: center !important;
  }

  .smartacctg-customers-page .sa-modal {
    width: 100% !important;
    max-width: 900px !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
    border-radius: var(--sa-radius-card) !important;
    padding: var(--sa-card-pad) !important;
  }

  .smartacctg-customers-page .sa-modal-header {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .smartacctg-customers-page .customers-close-btn {
    width: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    height: auto !important;
    padding: 0 4px !important;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    color: #dc2626 !important;
    font-size: var(--sa-fs-base) !important;
    font-weight: 900 !important;
    line-height: 1.2 !important;
  }

  .smartacctg-customers-page .customers-fullscreen-overlay {
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

  .smartacctg-customers-page .customers-fullscreen-modal {
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

  .smartacctg-customers-page .customers-fullscreen-modal .sa-modal-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 5 !important;
    background: inherit !important;
    padding-bottom: 12px !important;
  }

  @media (max-width: 768px) {
    .smartacctg-customers-page .customers-search-row {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-customers-page .customers-search-row select {
      width: 100% !important;
    }

    .smartacctg-customers-page .customers-list {
      gap: 16px !important;
    }

    .smartacctg-customers-page .customer-card {
      gap: 12px !important;
    }
  }

  @media (max-width: 520px) {
    .smartacctg-customers-page .customers-action-row {
      gap: 8px !important;
      justify-content: flex-start !important;
    }

    .smartacctg-customers-page .customers-action-row button {
      flex: 0 1 calc(33.333% - 6px) !important;
      min-width: 96px !important;
      max-width: none !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      font-size: 15px !important;
    }

    .smartacctg-customers-page .customer-card h3 {
      font-size: var(--sa-fs-lg) !important;
    }

    .smartacctg-customers-page .customer-status-badge {
      font-size: 14px !important;
      padding: 4px 10px !important;
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

function isSchemaColumnError(error: any) {
  const message = String(error?.message || "").toLowerCase();

  return (
    message.includes("schema cache") ||
    message.includes("could not find") ||
    message.includes("column")
  );
}

function getMissingColumnName(error: any) {
  const message = String(error?.message || "");
  const match1 = message.match(/Could not find the '([^']+)' column/i);
  const match2 = message.match(/column "([^"]+)" does not exist/i);
  const match3 = message.match(/column '([^']+)' does not exist/i);

  return match1?.[1] || match2?.[1] || match3?.[1] || "";
}

const CUSTOMER_OPTIONAL_KEYS = [
  "email",
  "company_name",
  "company_reg_no",
  "company_phone",
  "address",
  "status",
  "debt_amount",
  "paid_amount",
  "last_payment_date",
  "note",
];

async function insertAdaptive(table: string, inputPayload: Record<string, any>) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 30; i++) {
    const { data, error } = await supabase.from(table).insert(payload).select("*").single();

    if (!error) return data;

    lastError = error;

    if (!isSchemaColumnError(error)) throw error;

    const missing = getMissingColumnName(error);

    if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
      const next = { ...payload };
      delete next[missing];
      payload = next;
      continue;
    }

    const removable = CUSTOMER_OPTIONAL_KEYS.find((key) =>
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

  for (let i = 0; i < 30; i++) {
    const { error } = await supabase.from(table).update(payload).eq("id", id).eq("user_id", userId);

    if (!error) return;

    lastError = error;

    if (!isSchemaColumnError(error)) throw error;

    const missing = getMissingColumnName(error);

    if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
      const next = { ...payload };
      delete next[missing];
      payload = next;
      continue;
    }

    const removable = CUSTOMER_OPTIONAL_KEYS.find((key) =>
      Object.prototype.hasOwnProperty.call(payload, key)
    );

    if (!removable) throw error;

    const next = { ...payload };
    delete next[removable];
    payload = next;
  }

  throw lastError || new Error("Update failed");
}

function statusText(status: CustomerStatus, t: any) {
  if (status === "vip") return t.vip;
  if (status === "debt") return t.debt;
  if (status === "blocked") return t.blocked;
  return t.normal;
}

export default function CustomersPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | CustomerStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [fullscreenForm, setFullscreenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [savingCustomer, setSavingCustomer] = useState(false);

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceCustomerId, setPriceCustomerId] = useState("");
  const [priceCustomerName, setPriceCustomerName] = useState("");
  const [priceProductId, setPriceProductId] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceCustomer, setInvoiceCustomer] = useState<Customer | null>(null);

  const [formPriceProductId, setFormPriceProductId] = useState("");
  const [formCustomPrice, setFormCustomPrice] = useState("");

  const [relatedPath, setRelatedPath] = useState("/dashboard/accounting");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company_name: "",
    company_reg_no: "",
    company_phone: "",
    address: "",
    status: "normal" as CustomerStatus,
    debt_amount: "",
    paid_amount: "",
    last_payment_date: today(),
    note: "",
  });

  const t = TXT[lang];
  const theme = THEMES[themeKey];

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

    const urlTheme = q.get("theme") as ThemeKey | null;
    const savedTheme = safeLocalGet(THEME_KEY) as ThemeKey | null;

    if (urlTheme && THEMES[urlTheme]) {
      setThemeKey(urlTheme);
      safeLocalSet(THEME_KEY, urlTheme);
    } else if (savedTheme && THEMES[savedTheme]) {
      setThemeKey(savedTheme);
    }

    const shouldOpenNew = q.get("open") === "new";
    const shouldFullscreen = q.get("fullscreen") === "1";

    if (shouldOpenNew) {
      setFullscreenForm(shouldFullscreen);
      setTimeout(() => {
        openNewCustomerForm(shouldFullscreen);
      }, 0);
    }

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

        const savedCustomers = safeLocalGet(TRIAL_CUSTOMERS_KEY);
        const savedPrices = safeLocalGet(TRIAL_CUSTOMER_PRICES_KEY);
        const savedProducts = safeLocalGet(TRIAL_PRODUCTS_KEY);
        const savedInvoices = safeLocalGet(TRIAL_INVOICES_KEY);

        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setCustomerPrices(savedPrices ? JSON.parse(savedPrices) : []);
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
        setInvoices(savedInvoices ? JSON.parse(savedInvoices) : []);

        return;
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
      safeLocalRemove(TRIAL_CUSTOMER_PRICES_KEY);
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

    if (profile?.theme && THEMES[profile.theme as ThemeKey]) {
      setThemeKey(profile.theme as ThemeKey);
      safeLocalSet(THEME_KEY, profile.theme);
    }

    await loadAll(data.session.user.id);
  }

  async function loadAll(userId: string) {
    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: productData } = await supabase
      .from("products")
      .select("id,name,price")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: priceData } = await supabase
      .from("customer_prices")
      .select("*")
      .eq("user_id", userId);

    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setCustomers((customerData || []) as Customer[]);
    setProducts((productData || []) as Product[]);
    setCustomerPrices((priceData || []) as CustomerPrice[]);
    setInvoices((invoiceData || []) as Invoice[]);
  }

  function saveTrialCustomers(nextCustomers: Customer[]) {
    setCustomers(nextCustomers);
    safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
  }

  function saveTrialPrices(nextPrices: CustomerPrice[]) {
    setCustomerPrices(nextPrices);
    safeLocalSet(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(nextPrices));
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

  function cleanOpenQuery() {
    if (typeof window === "undefined") return;

    const q = new URLSearchParams(window.location.search);
    q.delete("open");
    q.delete("fullscreen");

    const nextQuery = q.toString();
    const nextUrl = nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname;

    window.history.replaceState({}, "", nextUrl);
  }

  function backToDashboard() {
    go("/dashboard");
  }

  function goRelatedFeature() {
    go(relatedPath);
  }

  function openInvoiceRecords(c: Customer) {
    setInvoiceCustomer(c);
    setShowInvoiceModal(true);
  }

  function closeInvoiceModal() {
    setInvoiceCustomer(null);
    setShowInvoiceModal(false);
  }

  function goCreateInvoiceForCustomer() {
    if (!invoiceCustomer) return;

    go(
      "/dashboard/invoices",
      `customerId=${encodeURIComponent(invoiceCustomer.id)}&customerName=${encodeURIComponent(
        invoiceCustomer.name
      )}&from=customers&open=new&fullscreen=1`
    );
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

  function openNewCustomerForm(fullscreen = true) {
    setMsg("");
    resetForm();
    setFullscreenForm(fullscreen);
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
    setFullscreenForm(false);
    cleanOpenQuery();
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      company_name: "",
      company_reg_no: "",
      company_phone: "",
      address: "",
      status: "normal",
      debt_amount: "",
      paid_amount: "",
      last_payment_date: today(),
      note: "",
    });

    setFormPriceProductId("");
    setFormCustomPrice("");
  }

  function upsertTrialPrice(customerId: string, productId: string, price: number) {
    const exists = customerPrices.find(
      (p) => p.customer_id === customerId && p.product_id === productId
    );

    const next = exists
      ? customerPrices.map((p) =>
          p.customer_id === customerId && p.product_id === productId
            ? { ...p, custom_price: price }
            : p
        )
      : [
          {
            id: makeId(),
            customer_id: customerId,
            product_id: productId,
            custom_price: price,
          },
          ...customerPrices,
        ];

    saveTrialPrices(next);
  }

  async function upsertDbPrice(customerId: string, productId: string, price: number) {
    if (!session) return "No session";

    const existing = await supabase
      .from("customer_prices")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("customer_id", customerId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing.error && !isSchemaColumnError(existing.error)) {
      return existing.error.message;
    }

    if (existing.data?.id) {
      const { error } = await supabase
        .from("customer_prices")
        .update({ custom_price: price })
        .eq("id", existing.data.id)
        .eq("user_id", session.user.id);

      return error?.message || "";
    }

    const { error } = await supabase.from("customer_prices").insert({
      user_id: session.user.id,
      customer_id: customerId,
      product_id: productId,
      custom_price: price,
    });

    return error?.message || "";
  }

  async function saveCustomer() {
    setMsg("");

    if (!form.name.trim()) {
      setMsg(t.nameRequired);
      return;
    }

    setSavingCustomer(true);

    try {
      const customerId = editingId || makeId();

      const payload: Customer = {
        id: customerId,
        user_id: session?.user.id || "trial",
        name: form.name.trim(),
        phone: form.phone || null,
        email: form.email || null,
        company_name: form.company_name || null,
        company_reg_no: form.company_reg_no || null,
        company_phone: form.company_phone || null,
        address: form.address || null,
        status: form.status,
        debt_amount: Number(form.debt_amount || 0),
        paid_amount: Number(form.paid_amount || 0),
        last_payment_date: form.last_payment_date || today(),
        note: form.note || null,
      };

      if (isTrial) {
        const next = editingId
          ? customers.map((c) => (c.id === editingId ? payload : c))
          : [payload, ...customers];

        saveTrialCustomers(next);

        if (formPriceProductId && formCustomPrice) {
          upsertTrialPrice(customerId, formPriceProductId, Number(formCustomPrice));
        }

        setMsg(t.saved);
        closeForm();
        return;
      }

      if (!session) {
        setMsg("No session");
        return;
      }

      const dbPayload = {
        user_id: session.user.id,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        company_name: payload.company_name,
        company_reg_no: payload.company_reg_no,
        company_phone: payload.company_phone,
        address: payload.address,
        status: payload.status,
        debt_amount: payload.debt_amount,
        paid_amount: payload.paid_amount,
        last_payment_date: payload.last_payment_date,
        note: payload.note,
      };

      let savedCustomerId = editingId || "";

      if (editingId) {
        await updateAdaptive("customers", editingId, session.user.id, dbPayload);
        savedCustomerId = editingId;
      } else {
        const data = await insertAdaptive("customers", dbPayload);
        savedCustomerId = String(data?.id || "");
      }

      if (formPriceProductId && formCustomPrice) {
        const priceError = await upsertDbPrice(
          savedCustomerId,
          formPriceProductId,
          Number(formCustomPrice)
        );

        if (priceError) {
          setMsg(priceError);
          return;
        }
      }

      setMsg(t.saved);
      closeForm();
      await loadAll(session.user.id);
    } catch (error: any) {
      setMsg(t.saveFailed + (error?.message || String(error)));
    } finally {
      setSavingCustomer(false);
    }
  }

  function editCustomer(c: Customer) {
    setMsg("");
    setEditingId(c.id);
    setFullscreenForm(true);

    setForm({
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",
      company_name: c.company_name || "",
      company_reg_no: c.company_reg_no || "",
      company_phone: c.company_phone || "",
      address: c.address || "",
      status: (c.status || "normal") as CustomerStatus,
      debt_amount: String(c.debt_amount || 0),
      paid_amount: String(c.paid_amount || 0),
      last_payment_date: c.last_payment_date || today(),
      note: c.note || "",
    });

    setFormPriceProductId("");
    setFormCustomPrice("");
    setShowForm(true);
  }

  async function deleteCustomer(id: string) {
    const yes = window.confirm(t.confirmDelete);
    if (!yes) return;

    if (isTrial) {
      const nextCustomers = customers.filter((c) => c.id !== id);
      const nextPrices = customerPrices.filter((p) => p.customer_id !== id);

      saveTrialCustomers(nextCustomers);
      saveTrialPrices(nextPrices);
      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("customers")
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

  function openPriceModal(c: Customer) {
    setPriceCustomerId(c.id);
    setPriceCustomerName(c.name);
    setPriceProductId("");
    setCustomPrice("");
    setShowPriceModal(true);
  }

  function closePriceModal() {
    setShowPriceModal(false);
    setPriceCustomerId("");
    setPriceCustomerName("");
    setPriceProductId("");
    setCustomPrice("");
  }

  async function saveCustomerPrice() {
    setMsg("");

    if (!priceCustomerId || !priceProductId || !customPrice) return;

    if (isTrial) {
      upsertTrialPrice(priceCustomerId, priceProductId, Number(customPrice));
      setMsg(t.saved);
      setPriceProductId("");
      setCustomPrice("");
      return;
    }

    const priceError = await upsertDbPrice(priceCustomerId, priceProductId, Number(customPrice));

    if (priceError) {
      setMsg(priceError);
      return;
    }

    setMsg(t.saved);
    setPriceProductId("");
    setCustomPrice("");

    if (session) await loadAll(session.user.id);
  }

  function openCustomerWhatsApp(phone: string | null) {
    if (!phone) return;

    const clean = phone.replace(/\D/g, "");
    const malaysiaPhone = clean.startsWith("60")
      ? clean
      : clean.startsWith("0")
        ? `6${clean}`
        : `60${clean}`;

    window.location.href = `https://wa.me/${malaysiaPhone}`;
  }

  const filteredCustomers = useMemo(() => {
    const s = search.toLowerCase().trim();

    return customers.filter((c) => {
      const matchSearch =
        !s ||
        c.name?.toLowerCase().includes(s) ||
        c.phone?.toLowerCase().includes(s) ||
        c.company_name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s);

      const matchStatus = filterStatus === "all" || c.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [customers, search, filterStatus]);

  const selectedProduct = products.find((p) => p.id === priceProductId);
  const formSelectedProduct = products.find((p) => p.id === formPriceProductId);
  const targetPrices = customerPrices.filter((p) => p.customer_id === priceCustomerId);

  const selectedCustomerInvoices = useMemo(() => {
    if (!invoiceCustomer) return [];

    return invoices.filter((inv) => {
      const matchById = inv.customer_id && inv.customer_id === invoiceCustomer.id;
      const matchByName =
        inv.customer_name &&
        invoiceCustomer.name &&
        inv.customer_name.toLowerCase() === invoiceCustomer.name.toLowerCase();

      return matchById || matchByName;
    });
  }, [invoices, invoiceCustomer]);

  return (
    <main
      className="smartacctg-page smartacctg-customers-page"
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{CUSTOMERS_PAGE_FIX_CSS}</style>

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
          <h1 style={titleStyle}>{t.pageTitle}</h1>

          <button
            type="button"
            onClick={() => openNewCustomerForm(true)}
            aria-label={t.add}
            style={{
              ...plusBtnStyle,
              background: theme.accent,
            }}
          >
            +
          </button>
        </div>

        <div className="customers-search-row" style={searchGridStyle}>
          <input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: theme.border,
            }}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | CustomerStatus)}
            style={{
              ...inputStyle,
              borderColor: theme.border,
            }}
          >
            <option value="all">{t.all}</option>
            <option value="normal">{t.normal}</option>
            <option value="vip">{t.vip}</option>
            <option value="debt">{t.debt}</option>
            <option value="blocked">{t.blocked}</option>
          </select>
        </div>

        <div style={customerListStyle}>
          {filteredCustomers.length === 0 ? (
            <p style={{ color: theme.subText, fontWeight: 800 }}>{t.noCustomers}</p>
          ) : (
            <div className="customers-list" style={customerGridStyle}>
              {filteredCustomers.map((c) => {
                const debtLeft = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);
                const prices = customerPrices.filter((p) => p.customer_id === c.id);

                return (
                  <div
                    key={c.id}
                    className="customer-card"
                    style={{
                      ...customerCardStyle,
                      borderColor: theme.border,
                      background: theme.card,
                      color: theme.text,
                      boxShadow: theme.glow,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <h3 style={customerNameStyle}>
                        {c.name}{" "}
                        <span
                          className="customer-status-badge"
                          style={{
                            ...badgeStyle,
                            background: theme.softBg,
                            color: theme.accent,
                          }}
                        >
                          {statusText(c.status || "normal", t)}
                        </span>
                      </h3>

                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.phone}: {c.phone || "-"} ｜ {t.email}: {c.email || "-"}
                      </p>

                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.companyName}: {c.company_name || "-"}
                      </p>

                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.debtAmount}: RM {Number(c.debt_amount || 0).toFixed(2)} ｜{" "}
                        {t.paidAmount}: RM {Number(c.paid_amount || 0).toFixed(2)} ｜{" "}
                        {t.balance}: RM {debtLeft.toFixed(2)}
                      </p>

                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.lastPaymentDate}: {c.last_payment_date || "-"}
                      </p>

                      {prices.length > 0 ? (
                        <p style={{ ...mutedStyle, color: theme.subText }}>
                          {t.currentPrices}:{" "}
                          {prices
                            .map((cp) => {
                              const product = products.find((p) => p.id === cp.product_id);
                              return `${product?.name || "Product"} RM ${Number(
                                cp.custom_price
                              ).toFixed(2)}`;
                            })
                            .join(" / ")}
                        </p>
                      ) : null}
                    </div>

                    <div className="customers-action-row" style={actionRowStyle}>
                      <button type="button" onClick={() => openInvoiceRecords(c)} style={invoiceBtnStyle}>
                        {t.invoice}
                      </button>

                      <button
                        type="button"
                        onClick={() => openPriceModal(c)}
                        style={{
                          ...priceBtnStyle,
                          background: theme.accent,
                        }}
                      >
                        {t.priceTitle}
                      </button>

                      <button
                        type="button"
                        onClick={() => openCustomerWhatsApp(c.phone)}
                        disabled={!c.phone}
                        title={t.whatsapp}
                        style={{
                          ...whatsappBtnStyle,
                          opacity: c.phone ? 1 : 0.45,
                        }}
                      >
                        {t.whatsapp}
                      </button>

                      <button
                        type="button"
                        onClick={() => editCustomer(c)}
                        style={{
                          ...editBtnStyle,
                          background: theme.accent,
                        }}
                      >
                        {t.edit}
                      </button>

                      <button type="button" onClick={() => deleteCustomer(c.id)} style={deleteBtnStyle}>
                        {t.delete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        <h2 style={sectionTitleStyle}>{t.related}</h2>

        <div style={relatedMenuRowStyle}>
          <select
            value={relatedPath}
            onChange={(e) => setRelatedPath(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: theme.border,
            }}
          >
            <option value="/dashboard/accounting">{t.accounting}</option>
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
          className={fullscreenForm ? "customers-fullscreen-overlay" : ""}
          style={fullscreenForm ? fullscreenOverlayStyle : overlayStyle}
        >
          <section
            className={fullscreenForm ? "sa-modal customers-fullscreen-modal" : "sa-modal"}
            style={{
              ...(fullscreenForm ? fullscreenModalStyle : modalStyle),
              background: theme.card,
              borderColor: theme.border,
              boxShadow: fullscreenForm ? "none" : theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-header" style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{editingId ? t.update : t.formTitle}</h2>

              <button
                type="button"
                onClick={closeForm}
                className="customers-close-btn"
                style={closeTextBtnStyle}
              >
                {t.close}
              </button>
            </div>

            {msg ? (
              <div style={{ ...modalMsgStyle, background: theme.softBg, color: theme.text }}>
                {msg}
              </div>
            ) : null}

            <h3>{t.personal}</h3>

            <div style={responsiveGridStyle}>
              <input
                placeholder={t.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />

              <input
                placeholder={t.phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />

              <input
                placeholder={t.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />
            </div>

            <h3>{t.company}</h3>

            <div style={responsiveGridStyle}>
              <input
                placeholder={t.companyName}
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />

              <input
                placeholder={t.regNo}
                value={form.company_reg_no}
                onChange={(e) => setForm({ ...form, company_reg_no: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />

              <input
                placeholder={t.companyPhone}
                value={form.company_phone}
                onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />

              <input
                placeholder={t.address}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />
            </div>

            <h3>{t.status}</h3>

            <div style={responsiveGridStyle}>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })}
                style={{ ...inputStyle, borderColor: theme.border }}
              >
                <option value="normal">{t.normal}</option>
                <option value="vip">{t.vip}</option>
                <option value="debt">{t.debt}</option>
                <option value="blocked">{t.blocked}</option>
              </select>

              <input
                placeholder={t.debtAmount}
                value={form.debt_amount}
                onChange={(e) => setForm({ ...form, debt_amount: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />

              <input
                placeholder={t.paidAmount}
                value={form.paid_amount}
                onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />

              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: theme.subText }}>
                  {t.lastPaymentDate}
                </label>

                <input
                  className="sa-center-date-input"
                  type="date"
                  value={form.last_payment_date}
                  onChange={(e) => setForm({ ...form, last_payment_date: e.target.value })}
                  style={{ ...dateInputStyle, borderColor: theme.border }}
                />
              </div>

              <input
                placeholder={t.note}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                style={{ ...inputStyle, borderColor: theme.border }}
              />
            </div>

            <h3>{t.priceTitle}</h3>

            <div style={responsiveGridStyle}>
              <select
                value={formPriceProductId}
                onChange={(e) => setFormPriceProductId(e.target.value)}
                style={{ ...inputStyle, borderColor: theme.border }}
              >
                <option value="">{t.chooseProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - RM {Number(p.price || 0).toFixed(2)}
                  </option>
                ))}
              </select>

              <input
                placeholder={t.customPrice}
                value={formCustomPrice}
                onChange={(e) => setFormCustomPrice(e.target.value)}
                style={{ ...inputStyle, borderColor: theme.border }}
              />
            </div>

            {formSelectedProduct ? (
              <p style={{ ...mutedStyle, color: theme.subText }}>
                {t.productNormalPrice}: RM {Number(formSelectedProduct.price || 0).toFixed(2)}
              </p>
            ) : null}

            <div style={modalActionRowStyle}>
              <button
                type="button"
                onClick={saveCustomer}
                disabled={savingCustomer}
                style={{
                  ...primaryBtnStyle,
                  background: theme.accent,
                  marginTop: 0,
                  opacity: savingCustomer ? 0.65 : 1,
                }}
              >
                {savingCustomer ? t.saving : editingId ? t.update : t.save}
              </button>

              <button
                type="button"
                onClick={closeForm}
                disabled={savingCustomer}
                style={{
                  ...secondaryBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  marginTop: 0,
                  marginLeft: 0,
                  opacity: savingCustomer ? 0.65 : 1,
                }}
              >
                {editingId ? t.cancelEdit : t.cancel}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {showPriceModal ? (
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
            <div className="sa-modal-header" style={modalHeaderStyle}>
              <div>
                <h2 style={modalTitleStyle}>{t.priceTitle}</h2>

                <p style={{ ...mutedStyle, color: theme.subText, margin: "6px 0 0" }}>
                  {t.chooseCustomer}: {priceCustomerName || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={closePriceModal}
                className="customers-close-btn"
                style={closeTextBtnStyle}
              >
                {t.close}
              </button>
            </div>

            <div style={responsiveGridStyle}>
              <select
                value={priceProductId}
                onChange={(e) => setPriceProductId(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: theme.border,
                }}
              >
                <option value="">{t.chooseProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - RM {Number(p.price || 0).toFixed(2)}
                  </option>
                ))}
              </select>

              <input
                placeholder={t.customPrice}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: theme.border,
                }}
              />
            </div>

            {selectedProduct ? (
              <p style={{ ...mutedStyle, color: theme.subText }}>
                {t.productNormalPrice}: RM {Number(selectedProduct.price || 0).toFixed(2)}
              </p>
            ) : null}

            <button
              type="button"
              onClick={saveCustomerPrice}
              style={{
                ...primaryBtnStyle,
                background: theme.accent,
              }}
            >
              {t.savePrice}
            </button>

            <div style={{ marginTop: 16 }}>
              <h3>{t.currentPrices}</h3>

              {targetPrices.length === 0 ? (
                <p style={{ color: theme.subText }}>{t.noPrice}</p>
              ) : (
                targetPrices.map((cp) => {
                  const product = products.find((p) => p.id === cp.product_id);

                  return (
                    <div
                      key={cp.id}
                      style={{
                        ...priceItemStyle,
                        borderColor: theme.border,
                        background: theme.softBg,
                        color: theme.text,
                      }}
                    >
                      <strong>{product?.name || "Product"}</strong>
                      <span>RM {Number(cp.custom_price || 0).toFixed(2)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      ) : null}

      {showInvoiceModal ? (
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
            <div className="sa-modal-header" style={modalHeaderStyle}>
              <div>
                <h2 style={modalTitleStyle}>{t.invoiceRecords}</h2>

                <p style={{ ...mutedStyle, color: theme.subText, margin: "6px 0 0" }}>
                  {t.selectedCustomer}: {invoiceCustomer?.name || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeInvoiceModal}
                className="customers-close-btn"
                style={closeTextBtnStyle}
              >
                {t.close}
              </button>
            </div>

            <button
              type="button"
              onClick={goCreateInvoiceForCustomer}
              style={{
                ...primaryBtnStyle,
                background: theme.accent,
                marginTop: 0,
              }}
            >
              {t.createNewInvoice}
            </button>

            <div style={{ marginTop: 16 }}>
              {selectedCustomerInvoices.length === 0 ? (
                <p style={{ color: theme.subText }}>{t.noInvoice}</p>
              ) : (
                selectedCustomerInvoices.map((inv) => {
                  const dateText =
                    inv.invoice_date || (inv.created_at ? inv.created_at.slice(0, 10) : "-");

                  return (
                    <div
                      key={inv.id}
                      style={{
                        ...invoiceRecordCardStyle,
                        borderColor: theme.border,
                        background: theme.softBg,
                        color: theme.text,
                      }}
                    >
                      <div>
                        <strong>
                          {t.invoiceNo}: {inv.invoice_no || inv.id}
                        </strong>

                        <p style={{ ...mutedStyle, color: theme.subText }}>
                          {t.invoiceDate}: {dateText}
                        </p>

                        {inv.note ? (
                          <p style={{ ...mutedStyle, color: theme.subText }}>{inv.note}</p>
                        ) : null}
                      </div>

                      <div style={invoiceAmountBoxStyle}>
                        <strong>
                          {t.invoiceTotal}: RM {Number(inv.total || 0).toFixed(2)}
                        </strong>

                        <span style={{ color: theme.subText }}>
                          {t.invoiceProfit}: RM {Number(inv.total_profit || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
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
  padding: "clamp(10px, 3vw, 22px)",
  fontSize: "var(--sa-fs-base)",
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "999px",
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const langBtnStyle = (active: boolean, theme: (typeof THEMES)[ThemeKey]): CSSProperties => ({
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
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.15,
  fontWeight: 900,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: "var(--sa-fs-xl)",
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
  flexShrink: 0,
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
  fontSize: "16px",
  outline: "none",
  background: "#ffffff",
  color: "#111827",
};

const searchGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(180px, 260px)",
  gap: 10,
  alignItems: "center",
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

const customerListStyle: CSSProperties = {
  marginTop: 18,
};

const customerGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 18,
  width: "100%",
};

const customerCardStyle: CSSProperties = {
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

const customerNameStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-xl)",
  lineHeight: 1.25,
  overflowWrap: "anywhere",
};

const mutedStyle: CSSProperties = {
  fontSize: "var(--sa-fs-base)",
  lineHeight: 1.55,
  overflowWrap: "anywhere",
};

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: "var(--sa-fs-sm)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "wrap",
};

const actionBtnBaseStyle: CSSProperties = {
  minWidth: 108,
  minHeight: 44,
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 12px",
  fontSize: "var(--sa-fs-sm)",
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  lineHeight: 1.2,
  whiteSpace: "normal",
};

const invoiceBtnStyle: CSSProperties = {
  ...actionBtnBaseStyle,
  background: "#0ea5e9",
  color: "#fff",
};

const priceBtnStyle: CSSProperties = {
  ...actionBtnBaseStyle,
  color: "#fff",
};

const whatsappBtnStyle: CSSProperties = {
  ...actionBtnBaseStyle,
  background: "#25D366",
  color: "#fff",
};

const editBtnStyle: CSSProperties = {
  ...actionBtnBaseStyle,
  color: "#fff",
};

const deleteBtnStyle: CSSProperties = {
  ...actionBtnBaseStyle,
  background: "#fee2e2",
  color: "#b91c1c",
};

const primaryBtnStyle: CSSProperties = {
  marginTop: 16,
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  fontWeight: 900,
  minHeight: "var(--sa-control-h)",
};

const secondaryBtnStyle: CSSProperties = {
  marginTop: 16,
  marginLeft: 10,
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  fontWeight: 900,
  minHeight: "var(--sa-control-h)",
};

const msgStyle: CSSProperties = {
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const modalMsgStyle: CSSProperties = {
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

const fullscreenOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100dvh",
  background: "rgba(15, 23, 42, 0.58)",
  padding: 0,
  zIndex: 9999,
  overflow: "hidden",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 900,
  margin: "0 auto",
  border: "var(--sa-border-w) solid",
};

const fullscreenModalStyle: CSSProperties = {
  width: "100vw",
  maxWidth: "100vw",
  height: "100dvh",
  maxHeight: "100dvh",
  minHeight: "100dvh",
  margin: 0,
  border: "none",
  borderRadius: 0,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  padding: "max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom))",
};

const modalHeaderStyle: CSSProperties = {
  marginBottom: 12,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
};

const closeTextBtnStyle: CSSProperties = {
  background: "transparent",
  color: "#dc2626",
  border: "none",
  boxShadow: "none",
  borderRadius: 0,
  padding: "0 4px",
  minHeight: 0,
  width: "auto",
  height: "auto",
  minWidth: 0,
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const modalActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 16,
};

const dateWrapStyle: CSSProperties = {
  width: "100%",
};

const dateLabelStyle: CSSProperties = {
  display: "block",
  fontSize: "var(--sa-fs-sm)",
  fontWeight: 900,
  marginBottom: 6,
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  textAlign: "center",
  textAlignLast: "center" as any,
  display: "block",
  lineHeight: "normal",
  paddingLeft: 12,
  paddingRight: 12,
};

const priceItemStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "12px 14px",
  marginBottom: 10,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  fontWeight: 900,
};

const invoiceRecordCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "clamp(12px, 2vw, 16px)",
  marginBottom: 12,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 10,
};

const invoiceAmountBoxStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: "var(--sa-fs-sm)",
};
