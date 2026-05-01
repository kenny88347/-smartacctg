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
type CustomerStatus = "normal" | "vip" | "debt" | "blocked";

type Customer = {
  id: string;
  user_id?: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company_name?: string | null;
  company_reg_no?: string | null;
  company_phone?: string | null;
  address?: string | null;
  status?: CustomerStatus | null;
  customer_status?: CustomerStatus | null;
  debt_amount?: number | null;
  paid_amount?: number | null;
  last_payment_date?: string | null;
  note?: string | null;
  created_at?: string | null;
};

type Product = {
  id: string;
  user_id?: string;
  name: string;
  price?: number | null;
};

type CustomerPrice = {
  id: string;
  user_id?: string;
  customer_id: string;
  product_id: string;
  custom_price: number;
  created_at?: string | null;
};

type Profile = {
  id?: string;
  theme?: string | null;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_CUSTOMER_PRICES_KEY = "smartacctg_trial_customer_prices";

const LANG_KEY = "smartacctg_lang";

const today = () => new Date().toISOString().slice(0, 10);

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
    lastPaymentDate: "最后付款日期",
    note: "备注",
    edit: "编辑",
    delete: "删除",
    whatsapp: "WhatsApp",
    whatsappNoPhone: "这个客户没有填写手机号码或公司电话，请先编辑客户资料。",
    invoice: "开发票",
    accounting: "记账系统",
    products: "产品管理",
    invoices: "发票系统",
    noCustomers: "还没有客户资料",
    priceTitle: "产品专属价格",
    chooseCustomer: "选择客户",
    chooseProduct: "选择产品",
    customPrice: "这个客户的专属价格",
    savePrice: "保存专属价格",
    deletePrice: "删除专属价格",
    productNormalPrice: "产品原价",
    currentPrices: "目前已设置价格",
    noPrice: "还没有设置专属价格",
    saved: "保存成功",
    deleted: "删除成功",
    related: "关联功能",
    goFeature: "前往",
    trialMode: "免费试用模式：资料只会暂存在本机",
    confirmDelete: "确定要删除这个客户吗？",
    confirmDeletePrice: "确定要删除这个专属价格吗？",
    balance: "余额",
    totalDebt: "总欠款",
    totalPaid: "总已付",
    totalBalance: "欠款余额",
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
    lastPaymentDate: "Last Payment Date",
    note: "Note",
    edit: "Edit",
    delete: "Delete",
    whatsapp: "WhatsApp",
    whatsappNoPhone: "This customer has no phone or company phone. Please edit customer info first.",
    invoice: "Invoice",
    accounting: "Accounting",
    products: "Products",
    invoices: "Invoices",
    noCustomers: "No customer records yet",
    priceTitle: "Product Special Price",
    chooseCustomer: "Choose Customer",
    chooseProduct: "Choose Product",
    customPrice: "Special Price",
    savePrice: "Save Special Price",
    deletePrice: "Delete Special Price",
    productNormalPrice: "Normal Price",
    currentPrices: "Current Special Prices",
    noPrice: "No special price yet",
    saved: "Saved",
    deleted: "Deleted",
    related: "Linked Features",
    goFeature: "Go",
    trialMode: "Free trial mode: data is stored locally only",
    confirmDelete: "Confirm delete this customer?",
    confirmDeletePrice: "Delete this special price?",
    balance: "Balance",
    totalDebt: "Total Debt",
    totalPaid: "Total Paid",
    totalBalance: "Debt Balance",
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
    lastPaymentDate: "Tarikh Bayaran Akhir",
    note: "Catatan",
    edit: "Edit",
    delete: "Padam",
    whatsapp: "WhatsApp",
    whatsappNoPhone: "Pelanggan ini tiada nombor telefon. Sila edit maklumat pelanggan dahulu.",
    invoice: "Invois",
    accounting: "Sistem Akaun",
    products: "Produk",
    invoices: "Invois",
    noCustomers: "Tiada rekod pelanggan",
    priceTitle: "Harga Khas Produk",
    chooseCustomer: "Pilih Pelanggan",
    chooseProduct: "Pilih Produk",
    customPrice: "Harga Khas",
    savePrice: "Simpan Harga Khas",
    deletePrice: "Padam Harga Khas",
    productNormalPrice: "Harga Asal",
    currentPrices: "Harga Khas Semasa",
    noPrice: "Belum ada harga khas",
    saved: "Disimpan",
    deleted: "Dipadam",
    related: "Fungsi Berkaitan",
    goFeature: "Pergi",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
    confirmDelete: "Padam pelanggan ini?",
    confirmDeletePrice: "Padam harga khas ini?",
    balance: "Baki",
    totalDebt: "Jumlah Hutang",
    totalPaid: "Jumlah Dibayar",
    totalBalance: "Baki Hutang",
  },
};

const CUSTOMERS_PAGE_CSS = `
  .smartacctg-customers-page {
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

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

  .smartacctg-customers-page .customer-card.debt-customer {
    background: #fee2e2 !important;
    color: #7f1d1d !important;
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.34),
      0 14px 34px rgba(220, 38, 38, 0.2) !important;
  }

  .smartacctg-customers-page .customer-card.debt-customer * {
    color: inherit;
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
    flex: 0 1 calc(50% - 6px) !important;
    min-width: 118px !important;
    width: auto !important;
    white-space: normal !important;
    text-align: center !important;
  }

  .smartacctg-customers-page input[type="date"] {
    text-align: center !important;
    text-align-last: center !important;
    display: block !important;
    width: 100% !important;
    height: var(--sa-control-h) !important;
    line-height: var(--sa-control-h) !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  .smartacctg-customers-page input[type="date"]::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    min-height: 1.6em !important;
  }

  .smartacctg-customers-page input[type="date"]::-webkit-datetime-edit {
    width: 100% !important;
    text-align: center !important;
  }

  .smartacctg-customers-page input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    justify-content: center !important;
    text-align: center !important;
  }

  .smartacctg-customers-page .customers-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    padding: clamp(12px, 3vw, 24px) !important;
    overflow-y: auto !important;
    background: rgba(15, 23, 42, 0.58) !important;
  }

  .smartacctg-customers-page .customers-modal {
    width: 100% !important;
    max-width: 900px !important;
    margin: 0 auto !important;
    max-height: 92dvh !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-radius: var(--sa-radius-card) !important;
    padding: var(--sa-card-pad) !important;
  }

  .smartacctg-customers-page .customers-fullscreen-overlay {
    padding: 0 !important;
    overflow: hidden !important;
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

  .smartacctg-customers-page .customers-modal-header {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 12px !important;
    width: 100% !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 6 !important;
    background: inherit !important;
    padding-bottom: 12px !important;
    margin-bottom: 12px !important;
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
      flex: 0 1 calc(50% - 5px) !important;
      min-width: 0 !important;
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

function makeId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

function getReturnFromUrl() {
  if (typeof window === "undefined") return "";
  const q = new URLSearchParams(window.location.search);
  return q.get("return") || "";
}

function getOpenFromUrl() {
  if (typeof window === "undefined") return "";
  const q = new URLSearchParams(window.location.search);
  return q.get("open") || "";
}

function getFullscreenFromUrl() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("fullscreen") === "1";
}

function applyThemeEverywhere(key: ThemeKey) {
  if (typeof document === "undefined") return;

  const fixedKey = normalizeThemeKey(key);
  const theme = (THEMES[fixedKey] || THEMES.deepTeal) as any;

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

function formatRM(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getCustomerStatus(customer: Customer): CustomerStatus {
  return (
    customer.customer_status ||
    customer.status ||
    (Number(customer.debt_amount || 0) - Number(customer.paid_amount || 0) > 0 ? "debt" : "normal")
  ) as CustomerStatus;
}

function getCustomerBalance(customer: Customer) {
  return Number(customer.debt_amount || 0) - Number(customer.paid_amount || 0);
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
  "customer_status",
  "debt_amount",
  "paid_amount",
  "last_payment_date",
  "note",
];

const CUSTOMER_PRICE_OPTIONAL_KEYS = ["custom_price", "product_id", "customer_id"];

async function insertAdaptive(table: string, inputPayload: Record<string, any>, optionalKeys: string[]) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 35; i++) {
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

    const removable = optionalKeys.find((key) => Object.prototype.hasOwnProperty.call(payload, key));

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
  inputPayload: Record<string, any>,
  optionalKeys: string[]
) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 35; i++) {
    let query = supabase.from(table).update(payload).eq("id", id);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { error } = await query;

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

    const removable = optionalKeys.find((key) => Object.prototype.hasOwnProperty.call(payload, key));

    if (!removable) throw error;

    const next = { ...payload };
    delete next[removable];
    payload = next;
  }

  throw lastError || new Error("Update failed");
}

function cleanPhoneForWhatsapp(raw?: string | null) {
  let phone = String(raw || "").replace(/[^\d]/g, "");

  if (!phone) return "";

  if (phone.startsWith("0")) {
    phone = `60${phone.slice(1)}`;
  } else if (phone.startsWith("1")) {
    phone = `60${phone}`;
  } else if (!phone.startsWith("60")) {
    phone = `60${phone}`;
  }

  return phone;
}

export default function CustomersPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerStatus>("all");

  const [showForm, setShowForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [returnTo, setReturnTo] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [relatedPath, setRelatedPath] = useState("/dashboard/invoices");

  const [priceCustomerId, setPriceCustomerId] = useState("");
  const [priceProductId, setPriceProductId] = useState("");
  const [customPrice, setCustomPrice] = useState("");

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
  const theme = (THEMES[themeKey] || THEMES.deepTeal) as any;
  const themeSubText = theme.subText || theme.muted || "#64748b";

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  const themedCardStyle: CSSProperties = {
    background: theme.card,
    borderColor: theme.border,
    boxShadow: theme.glow,
    color: theme.text,
  };

  const themedPanelStyle: CSSProperties = {
    background: theme.panelBg || theme.softBg || theme.card,
    borderColor: theme.border,
    color: theme.panelText || theme.text,
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

    const returnParam = getReturnFromUrl();
    const openParam = getOpenFromUrl();
    const fullscreenParam = getFullscreenFromUrl();

    setReturnTo(returnParam);
    setIsFullscreen(fullscreenParam);

    init(initialLang, initialTheme);

    if (openParam === "new") {
      setTimeout(() => openNewForm(fullscreenParam), 120);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSession(null);

          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setProducts(safeParseArray<Product>(safeLocalGet(TRIAL_PRODUCTS_KEY)));
          setCustomerPrices(
            safeParseArray<CustomerPrice>(safeLocalGet(TRIAL_CUSTOMER_PRICES_KEY))
          );

          replaceUrlLangTheme(currentLang, currentTheme);
          return;
        }
      } catch {
        // Bad trial data, clear below.
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
      safeLocalRemove(TRIAL_PRODUCTS_KEY);
      safeLocalRemove(TRIAL_CUSTOMER_PRICES_KEY);
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
  }

  async function loadAll(userId: string) {
    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: productData } = await supabase
      .from("products")
      .select("id,user_id,name,price")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: priceData } = await supabase
      .from("customer_prices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setCustomers((customerData || []) as Customer[]);
    setProducts((productData || []) as Product[]);
    setCustomerPrices((priceData || []) as CustomerPrice[]);
  }

  function buildDashboardUrl() {
    const q = new URLSearchParams();

    if (isTrial) q.set("mode", "trial");

    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    return `/dashboard?${q.toString()}`;
  }

  function buildPageUrl(path: string, extra?: string) {
    const q = new URLSearchParams();

    if (isTrial) q.set("mode", "trial");

    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    if (extra) {
      const extraQuery = new URLSearchParams(extra);
      extraQuery.forEach((value, key) => q.set(key, value));
    }

    return `${path}?${q.toString()}`;
  }

  function goBack() {
    window.location.href = buildDashboardUrl();
  }

  function go(path: string, extra?: string) {
    window.location.href = buildPageUrl(path, extra);
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);
    replaceUrlLangTheme(next, themeKey);
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
  }

  function openNewForm(fullscreen = false) {
    resetForm();
    setIsFullscreen(fullscreen);
    setShowForm(true);
  }

  function closeForm() {
    const q = new URLSearchParams(window.location.search);
    const returnParam = q.get("return") || returnTo;

    if (returnParam === "dashboard") {
      window.location.href = buildDashboardUrl();
      return;
    }

    setShowForm(false);
    setIsFullscreen(false);
    resetForm();

    q.delete("open");
    q.delete("fullscreen");
    q.delete("return");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function editCustomer(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      company_name: customer.company_name || "",
      company_reg_no: customer.company_reg_no || "",
      company_phone: customer.company_phone || "",
      address: customer.address || "",
      status: getCustomerStatus(customer),
      debt_amount: String(customer.debt_amount || ""),
      paid_amount: String(customer.paid_amount || ""),
      last_payment_date: customer.last_payment_date || today(),
      note: customer.note || "",
    });
    setIsFullscreen(false);
    setShowForm(true);
  }

  function buildCustomerPayload() {
    return {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      company_name: form.company_name.trim(),
      company_reg_no: form.company_reg_no.trim(),
      company_phone: form.company_phone.trim(),
      address: form.address.trim(),
      status: form.status,
      customer_status: form.status,
      debt_amount: Number(form.debt_amount || 0),
      paid_amount: Number(form.paid_amount || 0),
      last_payment_date: form.last_payment_date || null,
      note: form.note.trim(),
    };
  }

  async function saveCustomer() {
    setMsg("");

    if (!form.name.trim()) {
      setMsg(t.nameRequired);
      return;
    }

    setIsSaving(true);

    try {
      const payload = buildCustomerPayload();

      if (isTrial) {
        const trialPayload: Customer = {
          id: editingId || makeId("customer"),
          user_id: "trial",
          ...payload,
          created_at: new Date().toISOString(),
        };

        const nextCustomers = editingId
          ? customers.map((c) => (c.id === editingId ? trialPayload : c))
          : [trialPayload, ...customers];

        setCustomers(nextCustomers);
        safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));

        setMsg(t.saved);
        setIsSaving(false);
        closeForm();
        return;
      }

      if (!session) {
        setIsSaving(false);
        return;
      }

      if (editingId) {
        await updateAdaptive(
          "customers",
          editingId,
          session.user.id,
          payload,
          CUSTOMER_OPTIONAL_KEYS
        );

        setCustomers((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? {
                  ...c,
                  ...payload,
                }
              : c
          )
        );
      } else {
        const saved = (await insertAdaptive(
          "customers",
          {
            user_id: session.user.id,
            ...payload,
          },
          CUSTOMER_OPTIONAL_KEYS
        )) as Customer;

        setCustomers((prev) => [saved, ...prev]);
      }

      setMsg(t.saved);
      setIsSaving(false);
      closeForm();

      if (session?.user.id) {
        await loadAll(session.user.id);
      }
    } catch (error: any) {
      setIsSaving(false);
      setMsg(t.saveFailed + (error?.message || String(error)));
    }
  }

  async function deleteCustomer(customer: Customer) {
    const yes = window.confirm(t.confirmDelete);
    if (!yes) return;

    if (isTrial) {
      const nextCustomers = customers.filter((c) => c.id !== customer.id);
      const nextPrices = customerPrices.filter((p) => p.customer_id !== customer.id);

      setCustomers(nextCustomers);
      setCustomerPrices(nextPrices);

      safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
      safeLocalSet(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(nextPrices));

      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    await supabase.from("customer_prices").delete().eq("customer_id", customer.id);

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    setCustomerPrices((prev) => prev.filter((p) => p.customer_id !== customer.id));
    setMsg(t.deleted);
  }

  function openWhatsapp(customer: Customer) {
    const phone = cleanPhoneForWhatsapp(customer.phone || customer.company_phone);

    if (!phone) {
      window.alert(t.whatsappNoPhone);
      return;
    }

    window.location.href = `https://wa.me/${phone}`;
  }

  function createInvoiceForCustomer(customer: Customer) {
    const extra = new URLSearchParams();

    extra.set("customer_id", customer.id);
    extra.set("open", "new");
    extra.set("fullscreen", "1");
    extra.set("return", "customers");

    go("/dashboard/invoices", extra.toString());
  }

  async function saveCustomerPrice() {
    setMsg("");

    if (!priceCustomerId || !priceProductId || !customPrice) {
      return;
    }

    const priceValue = Number(customPrice || 0);

    if (isTrial) {
      const existing = customerPrices.find(
        (p) => p.customer_id === priceCustomerId && p.product_id === priceProductId
      );

      const nextPrice: CustomerPrice = {
        id: existing?.id || makeId("price"),
        user_id: "trial",
        customer_id: priceCustomerId,
        product_id: priceProductId,
        custom_price: priceValue,
        created_at: existing?.created_at || new Date().toISOString(),
      };

      const next = existing
        ? customerPrices.map((p) => (p.id === existing.id ? nextPrice : p))
        : [nextPrice, ...customerPrices];

      setCustomerPrices(next);
      safeLocalSet(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(next));
      setMsg(t.saved);
      return;
    }

    if (!session) return;

    try {
      const existing = customerPrices.find(
        (p) => p.customer_id === priceCustomerId && p.product_id === priceProductId
      );

      if (existing) {
        await updateAdaptive(
          "customer_prices",
          existing.id,
          session.user.id,
          { custom_price: priceValue },
          CUSTOMER_PRICE_OPTIONAL_KEYS
        );

        setCustomerPrices((prev) =>
          prev.map((p) => (p.id === existing.id ? { ...p, custom_price: priceValue } : p))
        );
      } else {
        const saved = (await insertAdaptive(
          "customer_prices",
          {
            user_id: session.user.id,
            customer_id: priceCustomerId,
            product_id: priceProductId,
            custom_price: priceValue,
          },
          CUSTOMER_PRICE_OPTIONAL_KEYS
        )) as CustomerPrice;

        setCustomerPrices((prev) => [saved, ...prev]);
      }

      setMsg(t.saved);
    } catch (error: any) {
      setMsg(t.saveFailed + (error?.message || String(error)));
    }
  }

  async function deleteCustomerPrice(price: CustomerPrice) {
    const yes = window.confirm(t.confirmDeletePrice);
    if (!yes) return;

    if (isTrial) {
      const next = customerPrices.filter((p) => p.id !== price.id);
      setCustomerPrices(next);
      safeLocalSet(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(next));
      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("customer_prices")
      .delete()
      .eq("id", price.id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setCustomerPrices((prev) => prev.filter((p) => p.id !== price.id));
    setMsg(t.deleted);
  }

  const filteredCustomers = useMemo(() => {
    const s = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const status = getCustomerStatus(customer);

      const matchStatus = statusFilter === "all" || status === statusFilter;

      const searchText = [
        customer.name,
        customer.phone,
        customer.email,
        customer.company_name,
        customer.company_reg_no,
        customer.company_phone,
        customer.address,
        customer.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !s || searchText.includes(s);

      return matchStatus && matchSearch;
    });
  }, [customers, search, statusFilter]);

  const summary = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        acc.totalDebt += Number(customer.debt_amount || 0);
        acc.totalPaid += Number(customer.paid_amount || 0);
        acc.totalBalance += getCustomerBalance(customer);
        return acc;
      },
      {
        totalDebt: 0,
        totalPaid: 0,
        totalBalance: 0,
      }
    );
  }, [customers]);

  function statusLabel(status: CustomerStatus) {
    if (status === "vip") return t.vip;
    if (status === "debt") return t.debt;
    if (status === "blocked") return t.blocked;
    return t.normal;
  }

  function statusBadgeStyle(status: CustomerStatus): CSSProperties {
    if (status === "debt") {
      return {
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      };
    }

    if (status === "vip") {
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      };
    }

    if (status === "blocked") {
      return {
        background: "#e5e7eb",
        color: "#374151",
        border: "1px solid #d1d5db",
      };
    }

    return {
      background: theme.softBg || "#ccfbf1",
      color: theme.accent,
      border: `1px solid ${theme.border}`,
    };
  }

  function getProductName(productId: string) {
    return products.find((p) => p.id === productId)?.name || "-";
  }

  function getCustomerName(customerId: string) {
    return customers.find((c) => c.id === customerId)?.name || "-";
  }

  function getProductNormalPrice(productId: string) {
    return Number(products.find((p) => p.id === productId)?.price || 0);
  }

  return (
    <main
      className="smartacctg-page smartacctg-customers-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{CUSTOMERS_PAGE_CSS}</style>

      <div className="sa-topbar" style={topbarStyle}>
        <button
          type="button"
          onClick={goBack}
          className="sa-back-btn"
          style={{
            ...backBtnStyle,
            borderColor: theme.border,
            color: theme.accent,
            background: theme.inputBg || "#ffffff",
          }}
        >
          ← {t.back}
        </button>

        <div className="sa-lang-row" style={langRowStyle}>
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

      {isTrial ? <div style={trialMsgStyle}>{t.trialMode}</div> : null}

      {msg ? (
        <div
          style={{
            ...msgBoxStyle,
            background: theme.softBg || theme.soft || theme.card,
            color: theme.text,
          }}
        >
          {msg}
        </div>
      ) : null}

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <div style={titleRowStyle}>
          <h1 style={{ ...titleStyle, color: theme.accent }}>{t.pageTitle}</h1>

          <button
            type="button"
            onClick={() => openNewForm(false)}
            aria-label={t.add}
            style={{ ...plusBtnStyle, background: theme.accent }}
          >
            +
          </button>
        </div>

        <div style={summaryGridStyle}>
          <div className="sa-panel" style={{ ...summaryBoxStyle, ...themedPanelStyle }}>
            <span>{t.totalDebt}</span>
            <strong style={{ color: "#dc2626" }}>{formatRM(summary.totalDebt)}</strong>
          </div>

          <div className="sa-panel" style={{ ...summaryBoxStyle, ...themedPanelStyle }}>
            <span>{t.totalPaid}</span>
            <strong style={{ color: "#16a34a" }}>{formatRM(summary.totalPaid)}</strong>
          </div>

          <div className="sa-panel" style={{ ...summaryBoxStyle, ...themedPanelStyle }}>
            <span>{t.totalBalance}</span>
            <strong style={{ color: summary.totalBalance > 0 ? "#dc2626" : theme.accent }}>
              {formatRM(summary.totalBalance)}
            </strong>
          </div>
        </div>
      </section>

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <div className="customers-search-row" style={searchGridStyle}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            style={themedInputStyle}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | CustomerStatus)}
            style={themedInputStyle}
          >
            <option value="all">{t.all}</option>
            <option value="normal">{t.normal}</option>
            <option value="vip">{t.vip}</option>
            <option value="debt">{t.debt}</option>
            <option value="blocked">{t.blocked}</option>
          </select>
        </div>
      </section>

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        {filteredCustomers.length === 0 ? (
          <p style={{ color: themeSubText, fontWeight: 900 }}>{t.noCustomers}</p>
        ) : (
          <div className="customers-list">
            {filteredCustomers.map((customer) => {
              const balance = getCustomerBalance(customer);
              const status = getCustomerStatus(customer);
              const hasDebt = balance > 0 || status === "debt";

              return (
                <div
                  key={customer.id}
                  className={`customer-card ${hasDebt ? "debt-customer" : ""}`}
                  style={{
                    borderColor: hasDebt ? "#dc2626" : theme.border,
                    background: hasDebt ? "#fee2e2" : theme.itemBg || theme.card,
                    color: hasDebt ? "#7f1d1d" : theme.text,
                    boxShadow: hasDebt
                      ? "0 0 0 1px rgba(220, 38, 38, 0.34), 0 14px 34px rgba(220, 38, 38, 0.2)"
                      : theme.glow,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={customerTitleStyle}>
                      {customer.name || "-"}
                      <span
                        className="customer-status-badge"
                        style={statusBadgeStyle(status)}
                      >
                        {statusLabel(status)}
                      </span>
                    </h3>

                    <p>
                      {t.phone}: <strong>{customer.phone || "-"}</strong>
                    </p>

                    <p>
                      {t.email}: <strong>{customer.email || "-"}</strong>
                    </p>

                    <p>
                      {t.companyName}: <strong>{customer.company_name || "-"}</strong>
                    </p>

                    <p>
                      {t.regNo}: <strong>{customer.company_reg_no || "-"}</strong>
                    </p>

                    <p>
                      {t.companyPhone}: <strong>{customer.company_phone || "-"}</strong>
                    </p>

                    <p>
                      {t.address}: <strong>{customer.address || "-"}</strong>
                    </p>

                    <p>
                      {t.debtAmount}:{" "}
                      <strong style={{ color: "#dc2626" }}>
                        {formatRM(Number(customer.debt_amount || 0))}
                      </strong>
                    </p>

                    <p>
                      {t.paidAmount}:{" "}
                      <strong style={{ color: "#16a34a" }}>
                        {formatRM(Number(customer.paid_amount || 0))}
                      </strong>
                    </p>

                    <p>
                      {t.balance}:{" "}
                      <strong style={{ color: balance > 0 ? "#dc2626" : theme.accent }}>
                        {formatRM(balance)}
                      </strong>
                    </p>

                    <p>
                      {t.lastPaymentDate}: <strong>{customer.last_payment_date || "-"}</strong>
                    </p>

                    {customer.note ? (
                      <p>
                        {t.note}: <strong>{customer.note}</strong>
                      </p>
                    ) : null}
                  </div>

                  <div className="customers-action-row">
                    <button
                      type="button"
                      onClick={() => editCustomer(customer)}
                      style={{ ...actionBtnStyle, background: theme.accent }}
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCustomer(customer)}
                      style={deleteBtnStyle}
                    >
                      {t.delete}
                    </button>

                    <button
                      type="button"
                      onClick={() => openWhatsapp(customer)}
                      style={whatsappBtnStyle}
                    >
                      {t.whatsapp}
                    </button>

                    <button
                      type="button"
                      onClick={() => createInvoiceForCustomer(customer)}
                      style={{
                        ...outlineBtnStyle,
                        borderColor: hasDebt ? "#dc2626" : theme.border,
                        color: hasDebt ? "#dc2626" : theme.accent,
                        background: theme.inputBg || "#ffffff",
                      }}
                    >
                      {t.invoice}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <h2 style={sectionTitleStyle}>{t.priceTitle}</h2>

        <div style={priceGridStyle}>
          <select
            value={priceCustomerId}
            onChange={(e) => setPriceCustomerId(e.target.value)}
            style={themedInputStyle}
          >
            <option value="">{t.chooseCustomer}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name || "-"}
              </option>
            ))}
          </select>

          <select
            value={priceProductId}
            onChange={(e) => setPriceProductId(e.target.value)}
            style={themedInputStyle}
          >
            <option value="">{t.chooseProduct}</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name || "-"} - {t.productNormalPrice}{" "}
                {formatRM(Number(product.price || 0))}
              </option>
            ))}
          </select>

          <input
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder={t.customPrice}
            inputMode="decimal"
            style={themedInputStyle}
          />

          <button
            type="button"
            onClick={saveCustomerPrice}
            style={{ ...primaryBtnStyle, background: theme.accent }}
          >
            {t.savePrice}
          </button>
        </div>

        <h3 style={smallTitleStyle}>{t.currentPrices}</h3>

        {customerPrices.length === 0 ? (
          <p style={{ color: themeSubText, fontWeight: 900 }}>{t.noPrice}</p>
        ) : (
          <div style={priceListStyle}>
            {customerPrices.map((price) => (
              <div
                key={price.id}
                className="sa-panel"
                style={{
                  ...priceItemStyle,
                  borderColor: theme.border,
                  background: theme.panelBg || theme.softBg || theme.card,
                  color: theme.panelText || theme.text,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <strong>{getCustomerName(price.customer_id)}</strong>
                  <p style={{ margin: "6px 0 0", color: themeSubText, fontWeight: 900 }}>
                    {getProductName(price.product_id)}｜{t.productNormalPrice}:{" "}
                    {formatRM(getProductNormalPrice(price.product_id))}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong style={{ color: theme.accent }}>
                    {formatRM(Number(price.custom_price || 0))}
                  </strong>

                  <button
                    type="button"
                    onClick={() => deleteCustomerPrice(price)}
                    style={miniDeleteBtnStyle}
                  >
                    {t.deletePrice}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <h2 style={sectionTitleStyle}>{t.related}</h2>

        <div style={relatedRowStyle}>
          <select
            value={relatedPath}
            onChange={(e) => setRelatedPath(e.target.value)}
            style={themedInputStyle}
          >
            <option value="/dashboard/records">{t.accounting}</option>
            <option value="/dashboard/products">{t.products}</option>
            <option value="/dashboard/invoices">{t.invoices}</option>
          </select>

          <button
            type="button"
            onClick={() => go(relatedPath)}
            style={{ ...primaryBtnStyle, background: theme.accent }}
          >
            {t.goFeature}
          </button>
        </div>
      </section>

      {showForm ? (
        <div
          className={`customers-overlay ${
            isFullscreen ? "customers-fullscreen-overlay" : ""
          }`}
        >
          <section
            className={`customers-modal ${
              isFullscreen ? "customers-fullscreen-modal" : ""
            }`}
            style={{
              background: theme.card,
              border: `var(--sa-border-w) solid ${theme.border}`,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="customers-modal-header">
              <h2 style={{ margin: 0, color: theme.accent }}>
                {editingId ? t.update : t.formTitle}
              </h2>

              <button
                type="button"
                className="customers-close-btn"
                onClick={closeForm}
                aria-label={t.close}
              >
                {t.close}
              </button>
            </div>

            <h3 style={sectionTitleStyle}>{t.personal}</h3>

            <div style={formGridStyle}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t.name}
                style={themedInputStyle}
              />

              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={t.phone}
                style={themedInputStyle}
                inputMode="tel"
              />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t.email}
                style={themedInputStyle}
                inputMode="email"
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as CustomerStatus })
                }
                style={themedInputStyle}
              >
                <option value="normal">{t.normal}</option>
                <option value="vip">{t.vip}</option>
                <option value="debt">{t.debt}</option>
                <option value="blocked">{t.blocked}</option>
              </select>
            </div>

            <h3 style={sectionTitleStyle}>{t.company}</h3>

            <div style={formGridStyle}>
              <input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder={t.companyName}
                style={themedInputStyle}
              />

              <input
                value={form.company_reg_no}
                onChange={(e) => setForm({ ...form, company_reg_no: e.target.value })}
                placeholder={t.regNo}
                style={themedInputStyle}
              />

              <input
                value={form.company_phone}
                onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                placeholder={t.companyPhone}
                style={themedInputStyle}
                inputMode="tel"
              />

              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder={t.address}
                style={themedInputStyle}
              />
            </div>

            <h3 style={sectionTitleStyle}>{t.debt}</h3>

            <div style={formGridStyle}>
              <input
                value={form.debt_amount}
                onChange={(e) => setForm({ ...form, debt_amount: e.target.value })}
                placeholder={t.debtAmount}
                style={themedInputStyle}
                inputMode="decimal"
              />

              <input
                value={form.paid_amount}
                onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                placeholder={t.paidAmount}
                style={themedInputStyle}
                inputMode="decimal"
              />

              <div>
                <label style={{ ...labelStyle, color: theme.accent }}>
                  {t.lastPaymentDate}
                </label>

                <input
                  type="date"
                  value={form.last_payment_date}
                  onChange={(e) =>
                    setForm({ ...form, last_payment_date: e.target.value })
                  }
                  style={themedInputStyle}
                />
              </div>

              <input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder={t.note}
                style={themedInputStyle}
              />
            </div>

            <div style={modalActionRowStyle}>
              <button
                type="button"
                onClick={saveCustomer}
                disabled={isSaving}
                style={{
                  ...primaryBtnStyle,
                  background: theme.accent,
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
  padding: "clamp(10px, 3vw, 22px)",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
};

const topbarStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const backBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "999px",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap",
};

const langBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  minHeight: 44,
  padding: "0 13px",
  borderRadius: 999,
  border: `var(--sa-border-w) solid ${theme.accent}`,
  background: active ? theme.accent : theme.inputBg || "#ffffff",
  color: active ? "#ffffff" : theme.accent,
  fontWeight: 900,
});

const cardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  marginBottom: 14,
};

const titleRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.15,
  fontWeight: 900,
};

const plusBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  border: "none",
  color: "#ffffff",
  fontSize: 30,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const trialMsgStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const msgBoxStyle: CSSProperties = {
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
  marginTop: 16,
};

const summaryBoxStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  display: "grid",
  gap: 8,
  fontWeight: 900,
};

const searchGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(170px, 240px)",
  gap: 12,
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

const customerTitleStyle: CSSProperties = {
  margin: 0,
  lineHeight: 1.25,
  fontWeight: 900,
  overflowWrap: "anywhere",
};

const actionBtnStyle: CSSProperties = {
  minHeight: 46,
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  color: "#ffffff",
  fontWeight: 900,
};

const deleteBtnStyle: CSSProperties = {
  minHeight: 46,
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  background: "#fee2e2",
  color: "#b91c1c",
  fontWeight: 900,
};

const whatsappBtnStyle: CSSProperties = {
  minHeight: 46,
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  background: "#25D366",
  color: "#ffffff",
  fontWeight: 900,
};

const outlineBtnStyle: CSSProperties = {
  minHeight: 46,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  fontWeight: 900,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontWeight: 900,
};

const smallTitleStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 12,
  fontWeight: 900,
};

const priceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
  alignItems: "center",
};

const primaryBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  color: "#ffffff",
  fontWeight: 900,
};

const secondaryBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  fontWeight: 900,
};

const priceListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const priceItemStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const miniDeleteBtnStyle: CSSProperties = {
  display: "block",
  marginTop: 8,
  minHeight: 36,
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 10px",
  background: "#fee2e2",
  color: "#b91c1c",
  fontWeight: 900,
};

const relatedRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: 900,
  marginBottom: 6,
};

const modalActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 20,
};
