"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type CustomerStatus = "normal" | "vip" | "debt" | "blocked";
type ThemeKey =
  | "deepTeal"
  | "pink"
  | "blackGold"
  | "lightRed"
  | "nature"
  | "sky"
  | "futureForest";

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
  customer_status?: CustomerStatus | null;
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
    whatsappNoPhone: "这个客户没有填写手机号码或公司电话，请先编辑客户资料。",
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
    whatsappNoPhone: "This customer has no phone or company phone. Please edit customer info first.",
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
    whatsappNoPhone: "Pelanggan ini tiada nombor telefon. Sila edit maklumat pelanggan dahulu.",
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

  .smartacctg-customers-page .customer-card.debt-customer-card {
    background: #fee2e2 !important;
    border-color: #dc2626 !important;
    color: #7f1d1d !important;
    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.35),
      0 12px 28px rgba(220, 38, 38, 0.22) !important;
  }

  .smartacctg-customers-page .customer-card.debt-customer-card h3,
  .smartacctg-customers-page .customer-card.debt-customer-card p,
  .smartacctg-customers-page .customer-card.debt-customer-card span,
  .smartacctg-customers-page .customer-card.debt-customer-card strong {
    color: #7f1d1d !important;
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

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(THEMES, value);
}

function normalizeThemeKey(value: unknown, fallback: ThemeKey = "deepTeal"): ThemeKey {
  if (isThemeKey(value)) return value;
  if (value === "futureWorld") return "futureForest";
  return fallback;
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

function getInitialTheme(): ThemeKey {
  if (typeof window === "undefined") return "deepTeal";

  const q = new URLSearchParams(window.location.search);
  const urlTheme = q.get("theme");
  const savedTheme = safeLocalGet(THEME_KEY);

  return normalizeThemeKey(urlTheme || savedTheme || "deepTeal", "deepTeal");
}

function applyThemeToDocument(key: ThemeKey) {
  if (typeof document === "undefined") return;

  const fixedKey = normalizeThemeKey(key);
  const theme = THEMES[fixedKey] || THEMES.deepTeal;

  document.documentElement.setAttribute("data-sa-theme", fixedKey);
  document.documentElement.setAttribute("data-smartacctg-theme", fixedKey);

  document.documentElement.style.setProperty("--sa-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-card-bg", theme.card);
  document.documentElement.style.setProperty("--sa-panel-bg", theme.card);
  document.documentElement.style.setProperty("--sa-item-bg", theme.card);
  document.documentElement.style.setProperty("--sa-input-bg", theme.card);
  document.documentElement.style.setProperty("--sa-input-text", theme.text);
  document.documentElement.style.setProperty("--sa-border", theme.border);
  document.documentElement.style.setProperty("--sa-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-text", theme.text);
  document.documentElement.style.setProperty("--sa-panel-text", theme.text);
  document.documentElement.style.setProperty("--sa-muted", theme.subText);
  document.documentElement.style.setProperty("--sa-soft-bg", theme.softBg);
  document.documentElement.style.setProperty("--sa-glow", theme.glow);

  document.documentElement.style.setProperty("--sa-theme-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-theme-card", theme.card);
  document.documentElement.style.setProperty("--sa-theme-border", theme.border);
  document.documentElement.style.setProperty("--sa-theme-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-theme-text", theme.text);
  document.documentElement.style.setProperty("--sa-theme-muted", theme.subText);
  document.documentElement.style.setProperty("--sa-theme-soft-bg", theme.softBg);
  document.documentElement.style.setProperty("--sa-theme-glow", theme.glow);
}

function replaceUrlLangTheme(nextLang: Lang, nextTheme: ThemeKey) {
  if (typeof window === "undefined") return;

  const q = new URLSearchParams(window.location.search);
  q.set("lang", nextLang);
  q.set("theme", nextTheme);
  q.set("refresh", String(Date.now()));

  window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
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
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId);

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

function normalizeCustomer(row: any): Customer {
  return {
    id: String(row?.id || makeId()),
    user_id: row?.user_id,
    name: String(row?.name || ""),
    phone: row?.phone || null,
    email: row?.email || null,
    company_name: row?.company_name || null,
    company_reg_no: row?.company_reg_no || null,
    company_phone: row?.company_phone || null,
    address: row?.address || null,
    status: (row?.status || row?.customer_status || "normal") as CustomerStatus,
    customer_status: (row?.customer_status || row?.status || "normal") as CustomerStatus,
    debt_amount: Number(row?.debt_amount || 0),
    paid_amount: Number(row?.paid_amount || 0),
    last_payment_date: row?.last_payment_date || null,
    note: row?.note || null,
  };
}

function customerBalance(customer: Customer) {
  return Number(customer.debt_amount || 0) - Number(customer.paid_amount || 0);
}

function formatRM(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizePhoneForWhatsapp(value: string) {
  const only = String(value || "").replace(/[^\d]/g, "");

  if (!only) return "";
  if (only.startsWith("60")) return only;
  if (only.startsWith("0")) return `60${only.slice(1)}`;

  return only;
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
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerStatus>("all");

  const [showForm, setShowForm] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [selectedInvoiceCustomerId, setSelectedInvoiceCustomerId] = useState("");
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
  const theme = THEMES[themeKey] || THEMES.deepTeal;

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: themeKey === "blackGold" || themeKey === "futureForest" ? theme.softBg : "#fff",
    color: theme.text,
  };

  useEffect(() => {
    applyThemeToDocument(themeKey);
  }, [themeKey]);

  useEffect(() => {
    const initialLang = getInitialLang();
    const initialTheme = getInitialTheme();

    setLang(initialLang);
    safeLocalSet(LANG_KEY, initialLang);

    setThemeKey(initialTheme);
    safeLocalSet(THEME_KEY, initialTheme);
    applyThemeToDocument(initialTheme);

    init(initialLang, initialTheme);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const openParam = q.get("open");
    const fullscreenParam = q.get("fullscreen");

    const shouldOpenNew = openParam === "new";
    const shouldFullscreen = fullscreenParam === "1" || shouldOpenNew;

    const trialRaw = safeLocalGet(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSession(null);

          setCustomers(
            safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)).map((x) =>
              normalizeCustomer(x)
            )
          );
          setProducts(safeParseArray<Product>(safeLocalGet(TRIAL_PRODUCTS_KEY)));
          setCustomerPrices(
            safeParseArray<CustomerPrice>(safeLocalGet(TRIAL_CUSTOMER_PRICES_KEY))
          );
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));

          replaceUrlLangTheme(currentLang, currentTheme);

          if (shouldOpenNew) {
            setTimeout(() => openNewForm(shouldFullscreen), 100);
          }

          return;
        }
      } catch {
        // Bad trial data, clear below.
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

    const userId = data.session.user.id;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("theme")
      .eq("id", userId)
      .single();

    const profile = profileData as Profile | null;
    const profileTheme = normalizeThemeKey(profile?.theme || currentTheme, currentTheme);

    setThemeKey(profileTheme);
    safeLocalSet(THEME_KEY, profileTheme);
    applyThemeToDocument(profileTheme);
    replaceUrlLangTheme(currentLang, profileTheme);

    await loadAll(userId);

    if (shouldOpenNew) {
      setTimeout(() => openNewForm(shouldFullscreen), 100);
    }
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

    setCustomers((customerData || []).map((x) => normalizeCustomer(x)));
    setProducts((productData || []) as Product[]);
    setCustomerPrices((priceData || []) as CustomerPrice[]);
    setInvoices((invoiceData || []) as Invoice[]);
  }

  function buildUrl(path: string, extra?: string) {
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

  function shouldReturnDashboard() {
    if (typeof window === "undefined") return false;
    const q = new URLSearchParams(window.location.search);
    return q.get("return") === "dashboard";
  }

  function returnDashboardNow() {
    window.location.href = buildUrl("/dashboard");
  }

  function resetForm() {
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

  function openNewForm(forceFullscreen = false) {
    setEditingId(null);
    resetForm();
    setFullscreen(forceFullscreen);
    setShowForm(true);
    setMsg("");
  }

  function closeForm() {
    if (shouldReturnDashboard()) {
      returnDashboardNow();
      return;
    }

    setEditingId(null);
    setFullscreen(false);
    setShowForm(false);
    resetForm();

    const q = new URLSearchParams(window.location.search);
    q.delete("open");
    q.delete("fullscreen");
    q.delete("return");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function editCustomer(c: Customer) {
    setEditingId(c.id);
    setFullscreen(false);
    setForm({
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",
      company_name: c.company_name || "",
      company_reg_no: c.company_reg_no || "",
      company_phone: c.company_phone || "",
      address: c.address || "",
      status: (c.status || c.customer_status || "normal") as CustomerStatus,
      debt_amount: String(c.debt_amount || ""),
      paid_amount: String(c.paid_amount || ""),
      last_payment_date: c.last_payment_date || today(),
      note: c.note || "",
    });
    setShowForm(true);
    setMsg("");
  }

  function saveTrialCustomers(nextCustomers: Customer[]) {
    setCustomers(nextCustomers);
    safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
  }

  async function saveCustomer() {
    setMsg("");

    if (!form.name.trim()) {
      setMsg(t.nameRequired);
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      company_name: form.company_name.trim() || null,
      company_reg_no: form.company_reg_no.trim() || null,
      company_phone: form.company_phone.trim() || null,
      address: form.address.trim() || null,
      status: form.status,
      customer_status: form.status,
      debt_amount: Number(form.debt_amount || 0),
      paid_amount: Number(form.paid_amount || 0),
      last_payment_date: form.last_payment_date || null,
      note: form.note.trim() || null,
    };

    try {
      if (isTrial) {
        const row = normalizeCustomer({
          id: editingId || makeId(),
          user_id: "trial",
          ...payload,
        });

        const next = editingId
          ? customers.map((x) => (x.id === editingId ? row : x))
          : [row, ...customers];

        saveTrialCustomers(next);
        setMsg(t.saved);

        if (shouldReturnDashboard()) {
          returnDashboardNow();
          return;
        }

        closeForm();
        return;
      }

      if (!session) return;

      if (editingId) {
        await updateAdaptive("customers", editingId, session.user.id, payload);
      } else {
        await insertAdaptive("customers", {
          user_id: session.user.id,
          ...payload,
        });
      }

      setMsg(t.saved);

      if (shouldReturnDashboard()) {
        returnDashboardNow();
        return;
      }

      closeForm();
      await loadAll(session.user.id);
    } catch (error: any) {
      setMsg(t.saveFailed + (error?.message || String(error)));
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer(c: Customer) {
    if (!confirm(t.confirmDelete)) return;

    if (isTrial) {
      const nextCustomers = customers.filter((x) => x.id !== c.id);
      const nextPrices = customerPrices.filter((x) => x.customer_id !== c.id);

      saveTrialCustomers(nextCustomers);
      setCustomerPrices(nextPrices);
      safeLocalSet(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(nextPrices));

      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    await supabase.from("customer_prices").delete().eq("customer_id", c.id);
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", c.id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.deleted);
    await loadAll(session.user.id);
  }

  function whatsappCustomer(c: Customer) {
    const rawPhone = c.phone || c.company_phone || "";
    const phone = normalizePhoneForWhatsapp(rawPhone);

    if (!phone) {
      setMsg(t.whatsappNoPhone);
      return;
    }

    const text = encodeURIComponent(`${c.name || ""} ${c.company_name || ""}`.trim());
    window.location.href = `https://wa.me/${phone}?text=${text}`;
  }

  function createInvoiceForCustomer(c: Customer) {
    go(
      "/dashboard/invoices",
      `open=new&fullscreen=1&return=dashboard&customerId=${encodeURIComponent(c.id)}`
    );
  }

  function statusText(status?: CustomerStatus | null) {
    if (status === "vip") return t.vip;
    if (status === "debt") return t.debt;
    if (status === "blocked") return t.blocked;
    return t.normal;
  }

  function statusBadgeStyle(status?: CustomerStatus | null): CSSProperties {
    if (status === "vip") return { background: "#fef3c7", color: "#92400e" };
    if (status === "debt") return { background: "#fee2e2", color: "#b91c1c" };
    if (status === "blocked") return { background: "#e5e7eb", color: "#374151" };

    return { background: theme.softBg, color: theme.accent };
  }

  async function saveCustomerPrice() {
    if (!priceCustomerId || !priceProductId || !customPrice) return;

    const price = Number(customPrice || 0);

    if (isTrial) {
      const existing = customerPrices.find(
        (x) => x.customer_id === priceCustomerId && x.product_id === priceProductId
      );

      const row: CustomerPrice = {
        id: existing?.id || makeId(),
        user_id: "trial",
        customer_id: priceCustomerId,
        product_id: priceProductId,
        custom_price: price,
      };

      const next = existing
        ? customerPrices.map((x) => (x.id === existing.id ? row : x))
        : [row, ...customerPrices];

      setCustomerPrices(next);
      safeLocalSet(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(next));
      setMsg(t.saved);
      return;
    }

    if (!session) return;

    const existing = customerPrices.find(
      (x) => x.customer_id === priceCustomerId && x.product_id === priceProductId
    );

    if (existing) {
      const { error } = await supabase
        .from("customer_prices")
        .update({ custom_price: price })
        .eq("id", existing.id)
        .eq("user_id", session.user.id);

      if (error) {
        setMsg(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("customer_prices").insert({
        user_id: session.user.id,
        customer_id: priceCustomerId,
        product_id: priceProductId,
        custom_price: price,
      });

      if (error) {
        setMsg(error.message);
        return;
      }
    }

    setMsg(t.saved);
    await loadAll(session.user.id);
  }

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return customers.filter((c) => {
      const fixedStatus = (c.status || c.customer_status || "normal") as CustomerStatus;
      const matchStatus = statusFilter === "all" || fixedStatus === statusFilter;

      const text = [
        c.name,
        c.phone,
        c.email,
        c.company_name,
        c.company_reg_no,
        c.company_phone,
        c.address,
        c.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !q || text.includes(q);

      return matchStatus && matchSearch;
    });
  }, [customers, search, statusFilter]);

  const selectedProduct = products.find((p) => p.id === priceProductId) || null;

  const currentPrices = useMemo(() => {
    return customerPrices.map((price) => {
      const customer = customers.find((c) => c.id === price.customer_id);
      const product = products.find((p) => p.id === price.product_id);

      return {
        ...price,
        customerName: customer?.name || "-",
        productName: product?.name || "-",
        normalPrice: Number(product?.price || 0),
      };
    });
  }, [customerPrices, customers, products]);

  const selectedInvoiceCustomer = customers.find((c) => c.id === selectedInvoiceCustomerId) || null;

  const selectedCustomerInvoices = useMemo(() => {
    if (!selectedInvoiceCustomer) return [];

    return invoices.filter((inv) => {
      return (
        inv.customer_id === selectedInvoiceCustomer.id ||
        inv.customer_name === selectedInvoiceCustomer.name
      );
    });
  }, [invoices, selectedInvoiceCustomer]);

  return (
    <main
      className="smartacctg-page smartacctg-customers-page"
      data-sa-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{CUSTOMERS_PAGE_FIX_CSS}</style>

      <div className="sa-topbar">
        <button
          type="button"
          onClick={backToDashboard}
          className="sa-back-btn"
          style={{
            ...backBtnStyle,
            borderColor: theme.border,
            color: theme.accent,
            background: theme.card,
          }}
        >
          ← {t.back}
        </button>

        <div className="sa-lang-row">
          <button
            type="button"
            className="sa-lang-btn"
            onClick={() => switchLang("zh")}
            style={langBtnStyle(lang === "zh", theme)}
          >
            中文
          </button>

          <button
            type="button"
            className="sa-lang-btn"
            onClick={() => switchLang("en")}
            style={langBtnStyle(lang === "en", theme)}
          >
            EN
          </button>

          <button
            type="button"
            className="sa-lang-btn"
            onClick={() => switchLang("ms")}
            style={langBtnStyle(lang === "ms", theme)}
          >
            BM
          </button>
        </div>
      </div>

      {isTrial ? <div style={trialMsgStyle}>{t.trialMode}</div> : null}

      {msg ? (
        <div style={{ ...msgStyle, background: theme.softBg, color: theme.text }}>{msg}</div>
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
        <div style={headerRowStyle}>
          <h1 style={titleStyle}>{t.pageTitle}</h1>

          <button
            type="button"
            onClick={() => openNewForm(false)}
            aria-label={t.add}
            style={{ ...plusBtnStyle, background: theme.accent }}
          >
            +
          </button>
        </div>

        <div className="customers-search-row" style={searchRowStyle}>
          <input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        {filteredCustomers.length === 0 ? (
          <p style={{ color: theme.subText, fontWeight: 900 }}>{t.noCustomers}</p>
        ) : (
          <div className="customers-list">
            {filteredCustomers.map((c) => {
              const fixedStatus = (c.status || c.customer_status || "normal") as CustomerStatus;
              const balance = customerBalance(c);
              const hasDebt = balance > 0 || fixedStatus === "debt";

              return (
                <div
                  key={c.id}
                  className={`customer-card ${hasDebt ? "debt-customer-card" : ""}`}
                  style={{
                    background: hasDebt ? "#fee2e2" : theme.card,
                    color: hasDebt ? "#7f1d1d" : theme.text,
                    borderColor: hasDebt ? "#dc2626" : theme.border,
                    boxShadow: hasDebt
                      ? "0 0 0 1px rgba(220, 38, 38, 0.35), 0 12px 28px rgba(220, 38, 38, 0.22)"
                      : theme.glow,
                  }}
                >
                  <div>
                    <h3>
                      {c.name || "-"}
                      <span
                        className="customer-status-badge"
                        style={statusBadgeStyle(fixedStatus)}
                      >
                        {statusText(fixedStatus)}
                      </span>
                    </h3>

                    <p>
                      {t.phone}: {c.phone || "-"} ｜ {t.email}: {c.email || "-"}
                    </p>

                    <p>
                      {t.companyName}: {c.company_name || "-"} ｜ {t.regNo}:{" "}
                      {c.company_reg_no || "-"}
                    </p>

                    <p>
                      {t.companyPhone}: {c.company_phone || "-"} ｜ {t.address}:{" "}
                      {c.address || "-"}
                    </p>

                    <p>
                      {t.debtAmount}:{" "}
                      <strong style={{ color: hasDebt ? "#7f1d1d" : "#dc2626" }}>
                        {formatRM(Number(c.debt_amount || 0))}
                      </strong>{" "}
                      ｜ {t.paidAmount}: {formatRM(Number(c.paid_amount || 0))} ｜ {t.balance}:{" "}
                      <strong style={{ color: hasDebt ? "#7f1d1d" : theme.accent }}>
                        {formatRM(balance)}
                      </strong>
                    </p>

                    <p>
                      {t.lastPaymentDate}: {c.last_payment_date || "-"}
                    </p>

                    {c.note ? <p>{t.note}: {c.note}</p> : null}
                  </div>

                  <div className="customers-action-row">
                    <button
                      type="button"
                      onClick={() => editCustomer(c)}
                      style={{ ...smallBtnStyle, background: theme.accent }}
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCustomer(c)}
                      style={deleteBtnStyle}
                    >
                      {t.delete}
                    </button>

                    <button
                      type="button"
                      onClick={() => whatsappCustomer(c)}
                      style={whatsappBtnStyle}
                    >
                      {t.whatsapp}
                    </button>

                    <button
                      type="button"
                      onClick={() => createInvoiceForCustomer(c)}
                      style={{
                        ...outlineBtnStyle,
                        borderColor: theme.accent,
                        color: theme.accent,
                        background: theme.card,
                      }}
                    >
                      {t.invoice}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceCustomerId(c.id)}
                      style={{
                        ...outlineBtnStyle,
                        borderColor: theme.border,
                        color: theme.accent,
                        background: theme.card,
                      }}
                    >
                      {t.invoiceRecords}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedInvoiceCustomer ? (
        <section
          className="sa-card"
          style={{
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div style={sectionHeaderRowStyle}>
            <h2 style={sectionTitleStyle}>
              {t.invoiceRecords}｜{selectedInvoiceCustomer.name}
            </h2>

            <button
              type="button"
              className="customers-close-btn"
              onClick={() => setSelectedInvoiceCustomerId("")}
            >
              X
            </button>
          </div>

          {selectedCustomerInvoices.length === 0 ? (
            <p style={{ color: theme.subText, fontWeight: 900 }}>{t.noInvoice}</p>
          ) : (
            <div style={invoiceListStyle}>
              {selectedCustomerInvoices.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    ...invoiceMiniCardStyle,
                    borderColor: theme.border,
                    background: theme.softBg,
                    color: theme.text,
                  }}
                >
                  <strong>{inv.invoice_no || inv.id}</strong>
                  <p>
                    {t.invoiceDate}: {inv.invoice_date || inv.created_at?.slice(0, 10) || "-"}
                  </p>
                  <p>
                    {t.invoiceTotal}: {formatRM(Number(inv.total || 0))} ｜ {t.invoiceProfit}:{" "}
                    {formatRM(Number(inv.total_profit || 0))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
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
        <h2 style={sectionTitleStyle}>{t.priceTitle}</h2>

        <div style={formGridStyle}>
          <select
            value={priceCustomerId}
            onChange={(e) => setPriceCustomerId(e.target.value)}
            style={themedInputStyle}
          >
            <option value="">{t.chooseCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company_name ? `｜${c.company_name}` : ""}
              </option>
            ))}
          </select>

          <select
            value={priceProductId}
            onChange={(e) => setPriceProductId(e.target.value)}
            style={themedInputStyle}
          >
            <option value="">{t.chooseProduct}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {formatRM(Number(p.price || 0))}
              </option>
            ))}
          </select>

          <input
            placeholder={t.customPrice}
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            inputMode="decimal"
            style={themedInputStyle}
          />

          {selectedProduct ? (
            <p style={{ margin: 0, color: theme.subText, fontWeight: 900 }}>
              {t.productNormalPrice}: {formatRM(Number(selectedProduct.price || 0))}
            </p>
          ) : null}

          <button
            type="button"
            onClick={saveCustomerPrice}
            style={{ ...primaryBtnStyle, background: theme.accent }}
          >
            {t.savePrice}
          </button>
        </div>

        <h3 style={sectionTitleStyle}>{t.currentPrices}</h3>

        {currentPrices.length === 0 ? (
          <p style={{ color: theme.subText, fontWeight: 900 }}>{t.noPrice}</p>
        ) : (
          <div style={invoiceListStyle}>
            {currentPrices.map((p) => (
              <div
                key={p.id}
                style={{
                  ...invoiceMiniCardStyle,
                  borderColor: theme.border,
                  background: theme.softBg,
                  color: theme.text,
                }}
              >
                <strong>
                  {p.customerName}｜{p.productName}
                </strong>
                <p>
                  {t.productNormalPrice}: {formatRM(p.normalPrice)} ｜ {t.customPrice}:{" "}
                  <strong style={{ color: theme.accent }}>{formatRM(p.custom_price)}</strong>
                </p>
              </div>
            ))}
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
            onClick={goRelatedFeature}
            style={{ ...primaryBtnStyle, background: theme.accent }}
          >
            {t.goFeature}
          </button>
        </div>
      </section>

      {showForm ? (
        <div className={fullscreen ? "customers-fullscreen-overlay" : ""} style={fullscreen ? fullOverlayStyle : overlayStyle}>
          <section
            className={`sa-modal ${fullscreen ? "customers-fullscreen-modal" : ""}`}
            style={{
              ...modalStyle,
              background: theme.card,
              borderColor: theme.border,
              color: theme.text,
              boxShadow: theme.glow,
            }}
          >
            <div className="sa-modal-header">
              <h2 style={modalTitleStyle}>{editingId ? t.update : t.formTitle}</h2>

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
                placeholder={t.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={themedInputStyle}
              />

              <input
                placeholder={t.phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={themedInputStyle}
              />

              <input
                placeholder={t.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={themedInputStyle}
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
                placeholder={t.companyName}
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                style={themedInputStyle}
              />

              <input
                placeholder={t.regNo}
                value={form.company_reg_no}
                onChange={(e) => setForm({ ...form, company_reg_no: e.target.value })}
                style={themedInputStyle}
              />

              <input
                placeholder={t.companyPhone}
                value={form.company_phone}
                onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                style={themedInputStyle}
              />

              <input
                placeholder={t.address}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                style={themedInputStyle}
              />
            </div>

            <h3 style={sectionTitleStyle}>{t.debtAmount}</h3>

            <div style={formGridStyle}>
              <input
                placeholder={t.debtAmount}
                value={form.debt_amount}
                onChange={(e) => setForm({ ...form, debt_amount: e.target.value })}
                inputMode="decimal"
                style={themedInputStyle}
              />

              <input
                placeholder={t.paidAmount}
                value={form.paid_amount}
                onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                inputMode="decimal"
                style={themedInputStyle}
              />

              <input
                type="date"
                className="sa-center-date-input"
                value={form.last_payment_date}
                onChange={(e) => setForm({ ...form, last_payment_date: e.target.value })}
                style={themedInputStyle}
              />

              <input
                placeholder={t.note}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                style={themedInputStyle}
              />
            </div>

            <div style={modalActionRowStyle}>
              <button
                type="button"
                onClick={saveCustomer}
                disabled={loading}
                style={{
                  ...primaryBtnStyle,
                  background: theme.accent,
                  opacity: loading ? 0.65 : 1,
                }}
              >
                {loading ? t.saving : editingId ? t.update : t.save}
              </button>

              <button
                type="button"
                onClick={closeForm}
                style={{
                  ...secondaryBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  background: theme.card,
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
  border: "var(--sa-border-w) solid",
  borderRadius: "999px",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const langBtnStyle = (active: boolean, theme: (typeof THEMES)[ThemeKey]): CSSProperties => ({
  borderColor: theme.accent,
  background: active ? theme.accent : theme.card,
  color: active ? "#fff" : theme.accent,
});

const trialMsgStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const msgStyle: CSSProperties = {
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const headerRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  fontWeight: 900,
  lineHeight: 1.15,
};

const plusBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  border: "none",
  color: "#fff",
  fontSize: 30,
  fontWeight: 900,
  lineHeight: 1,
  padding: 0,
};

const searchRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 180px",
  gap: 12,
  alignItems: "center",
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
  outline: "none",
  fontSize: 16,
};

const smallBtnStyle: CSSProperties = {
  minHeight: 44,
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  color: "#fff",
  border: "none",
  fontWeight: 900,
};

const deleteBtnStyle: CSSProperties = {
  minHeight: 44,
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  color: "#b91c1c",
  background: "#fee2e2",
  border: "none",
  fontWeight: 900,
};

const whatsappBtnStyle: CSSProperties = {
  minHeight: 44,
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  color: "#fff",
  background: "#25D366",
  border: "none",
  fontWeight: 900,
};

const outlineBtnStyle: CSSProperties = {
  minHeight: 44,
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  fontWeight: 900,
};

const sectionHeaderRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontWeight: 900,
};

const invoiceListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const invoiceMiniCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: 12,
  overflowWrap: "anywhere",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const primaryBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  padding: "0 18px",
  borderRadius: "var(--sa-radius-control)",
  border: "none",
  color: "#fff",
  fontWeight: 900,
};

const secondaryBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  padding: "0 18px",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  fontWeight: 900,
};

const relatedRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.52)",
  padding: "clamp(12px, 3vw, 24px)",
  zIndex: 999,
  overflowY: "auto",
};

const fullOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
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

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const modalActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 18,
  flexWrap: "wrap",
};
