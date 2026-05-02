"use client";

import {
  ChangeEvent,
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  THEME_KEY as SMARTACCTG_THEME_KEY,
  type ThemeKey,
  applyThemeToDocument,
  getThemeKeyFromUrlOrLocalStorage,
  isThemeKey,
  normalizeThemeKey,
  saveThemeKey,
} from "@/lib/smartacctgTheme";

type PageKey = "home" | "accounting" | "customers" | "products" | "invoices" | "records";
type Lang = "zh" | "en" | "ms";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_reg_no: string | null;
  company_phone: string | null;
  company_address: string | null;
  theme: string | null;
  plan_type: string | null;
  plan_expiry: string | null;
};

type Txn = {
  id: string;
  user_id?: string;
  txn_date: string;
  txn_type: "income" | "expense";
  amount: number;
  category_name?: string | null;
  note?: string | null;
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
  note?: string | null;
};

type Invoice = {
  id: string;
  user_id?: string;
  invoice_no?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_company?: string | null;
  total?: number | null;
  status?: string | null;
  due_date?: string | null;
  invoice_date?: string | null;
  created_at?: string | null;
};

type DebtItem = {
  id: string;
  name: string;
  source: "customer" | "invoice";
  amount: number;
  dueDate?: string;
  sortTime: number;
};

type AppRegistry = {
  id?: string;
  app_key: string;
  title_zh?: string | null;
  title_en?: string | null;
  title_ms?: string | null;
  name?: string | null;
  icon?: string | null;
  app_path?: string | null;
  description_zh?: string | null;
  description_en?: string | null;
  description_ms?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  is_system?: boolean | null;
};

type UserDashboardApp = {
  id?: string;
  user_id?: string;
  app_key: string;
  created_at?: string | null;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";
const LANG_KEY = "smartacctg_lang";

const DASHBOARD_APP_KEYS_LOCAL = "smartacctg_dashboard_app_keys";
const DASHBOARD_APPS_INIT_LOCAL = "smartacctg_dashboard_apps_initialized";

const DEFAULT_DASHBOARD_APP_KEYS = [
  "records",
  "customers",
  "products",
  "invoices",
  "extension",
  "nk_shop",
];

const DEFAULT_APPS: AppRegistry[] = [
  {
    app_key: "records",
    title_zh: "记账系统",
    title_en: "Accounting",
    title_ms: "Sistem Akaun",
    icon: "🧾",
    app_path: "/dashboard/records",
    sort_order: 10,
    is_active: true,
  },
  {
    app_key: "customers",
    title_zh: "客户管理",
    title_en: "Customers",
    title_ms: "Pelanggan",
    icon: "👥",
    app_path: "/dashboard/customers",
    sort_order: 20,
    is_active: true,
  },
  {
    app_key: "products",
    title_zh: "产品管理",
    title_en: "Products",
    title_ms: "Produk",
    icon: "📦",
    app_path: "/dashboard/products",
    sort_order: 30,
    is_active: true,
  },
  {
    app_key: "invoices",
    title_zh: "发票系统",
    title_en: "Invoices",
    title_ms: "Invois",
    icon: "🧾",
    app_path: "/dashboard/invoices",
    sort_order: 40,
    is_active: true,
  },
  {
    app_key: "extension",
    title_zh: "扩展功能",
    title_en: "Extensions",
    title_ms: "Fungsi Tambahan",
    icon: "🧩",
    app_path: "__extension__",
    sort_order: 50,
    is_active: true,
  },
  {
    app_key: "nk_shop",
    title_zh: "NK网店",
    title_en: "NK Shop",
    title_ms: "NK Kedai",
    icon: "🛒",
    app_path: "__shop__",
    sort_order: 60,
    is_active: true,
  },
];

const TXT = {
  zh: {
    dashboard: "控制台",
    notice: "通告：欢迎使用 SmartAcctg，请定期检查账目、客户欠款、库存和订阅期限。",
    recordsOverview: "记录总览",
    latestMonth: "最新月份",
    customerDebt: "客户欠款",
    estimatedProfit: "预计利润",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    quick: "快速记录 / 开发票",
    quickAccounting: "记账",
    quickInvoice: "发票",
    quickCustomer: "客户",
    quickProduct: "产品",
    expiry: "订阅期限",
    noSub: "未订阅",
    trial: "免费试用",
    logout: "退出登录",
    changeAvatar: "更换头像",
    settings: "设置",
    theme: "主题切换",
    language: "语言切换",
    personal: "个人资料",
    name: "名称",
    phone: "电话号码",
    company: "公司资料",
    companyName: "公司名字",
    ssm: "公司注册 SSM",
    companyPhone: "公司电话号码",
    companyAddress: "公司地址",
    password: "更换密码",
    newPassword: "新密码",
    save: "保存资料",
    updatePassword: "更新密码",
    saved: "保存成功",
    noRecord: "暂无记录",
    noDebt: "暂无欠款",
    back: "返回",
    close: "关闭",
    open: "打开",
    addToDashboard: "加到控制台",
    removeFromDashboard: "从控制台移除",
    alreadyAdded: "已在控制台",
    appCenter: "App Center",
    appCenterDesc: "这里可以管理控制台显示的 App。移除后只会从控制台隐藏，App Center 里面还会保留。",
    longPressRemove: "长按 App 图标可从控制台移除",
    removeAppTitle: "移除控制台 App",
    removeAppMessage: "确定要从控制台移除这个 App 吗？App Center 里还会保留。",
    confirm: "确定",
    cancel: "取消",
    freeTrialCannotUpload: "免费试用不能上传头像",
    trialNoCloud: "免费试用资料不会保存到云端",
    trialNoPassword: "免费试用没有账号密码",
    passwordTooShort: "密码至少 6 位",
    pleaseLogin: "请先登录",
    electronicCard: "电子名片",
    shopSystem: "网店系统",
    comingSoon: "即将开放",
    extensionDesc: "这里以后可以放新功能，用户可订阅后加入控制台。",
    shopDesc: "未来可做自己的网店、订单系统、产品展示和客户下单入口。",
    loadingApp: "正在打开 App...",
    noApps: "控制台还没有 App，请到 App Center 添加。",
  },
  en: {
    dashboard: "Dashboard",
    notice:
      "Notice: Welcome to SmartAcctg. Please check records, customer debts, stock and subscription expiry regularly.",
    recordsOverview: "Records Overview",
    latestMonth: "Latest Month",
    customerDebt: "Customer Debt",
    estimatedProfit: "Estimated Profit",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    quick: "Quick Record / Invoice",
    quickAccounting: "Record",
    quickInvoice: "Invoice",
    quickCustomer: "Customer",
    quickProduct: "Product",
    expiry: "Expiry",
    noSub: "Not Subscribed",
    trial: "Free Trial",
    logout: "Logout",
    changeAvatar: "Change Avatar",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    personal: "Personal Info",
    name: "Name",
    phone: "Phone",
    company: "Company Info",
    companyName: "Company Name",
    ssm: "SSM Registration",
    companyPhone: "Company Phone",
    companyAddress: "Company Address",
    password: "Change Password",
    newPassword: "New Password",
    save: "Save",
    updatePassword: "Update Password",
    saved: "Saved",
    noRecord: "No records",
    noDebt: "No debt",
    back: "Back",
    close: "Close",
    open: "Open",
    addToDashboard: "Add to Dashboard",
    removeFromDashboard: "Remove from Dashboard",
    alreadyAdded: "Added",
    appCenter: "App Center",
    appCenterDesc:
      "Manage which apps appear on your dashboard. Removed apps stay available in App Center.",
    longPressRemove: "Long press an app icon to remove it from dashboard",
    removeAppTitle: "Remove Dashboard App",
    removeAppMessage: "Remove this app from dashboard? It will remain in App Center.",
    confirm: "Confirm",
    cancel: "Cancel",
    freeTrialCannotUpload: "Free trial cannot upload avatar",
    trialNoCloud: "Trial data will not be saved to cloud",
    trialNoPassword: "Trial mode has no account password",
    passwordTooShort: "Password must be at least 6 characters",
    pleaseLogin: "Please login first",
    electronicCard: "Digital Name Card",
    shopSystem: "Online Store System",
    comingSoon: "Coming Soon",
    extensionDesc: "Future features can be placed here. Users can subscribe and add them to dashboard.",
    shopDesc: "Future online store, order system, product display and customer ordering entrance.",
    loadingApp: "Opening app...",
    noApps: "No dashboard apps yet. Add apps from App Center.",
  },
  ms: {
    dashboard: "Papan Pemuka",
    notice:
      "Notis: Selamat menggunakan SmartAcctg. Sila semak rekod, hutang pelanggan, stok dan tarikh langganan secara berkala.",
    recordsOverview: "Ringkasan Rekod",
    latestMonth: "Bulan Terkini",
    customerDebt: "Hutang Pelanggan",
    estimatedProfit: "Anggaran Untung",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    quick: "Rekod Pantas / Invois",
    quickAccounting: "Rekod",
    quickInvoice: "Invois",
    quickCustomer: "Pelanggan",
    quickProduct: "Produk",
    expiry: "Tarikh Tamat",
    noSub: "Belum Langgan",
    trial: "Percubaan Percuma",
    logout: "Log Keluar",
    changeAvatar: "Tukar Avatar",
    settings: "Tetapan",
    theme: "Tema",
    language: "Bahasa",
    personal: "Maklumat Peribadi",
    name: "Nama",
    phone: "Telefon",
    company: "Maklumat Syarikat",
    companyName: "Nama Syarikat",
    ssm: "No. SSM",
    companyPhone: "Telefon Syarikat",
    companyAddress: "Alamat Syarikat",
    password: "Tukar Kata Laluan",
    newPassword: "Kata Laluan Baru",
    save: "Simpan",
    updatePassword: "Kemas Kini Kata Laluan",
    saved: "Disimpan",
    noRecord: "Tiada rekod",
    noDebt: "Tiada hutang",
    back: "Kembali",
    close: "Tutup",
    open: "Buka",
    addToDashboard: "Tambah ke Dashboard",
    removeFromDashboard: "Buang dari Dashboard",
    alreadyAdded: "Sudah Ditambah",
    appCenter: "App Center",
    appCenterDesc:
      "Urus app yang dipaparkan pada dashboard. App yang dibuang masih kekal dalam App Center.",
    longPressRemove: "Tekan lama ikon app untuk buang dari dashboard",
    removeAppTitle: "Buang App Dashboard",
    removeAppMessage: "Buang app ini dari dashboard? App masih kekal dalam App Center.",
    confirm: "Sahkan",
    cancel: "Batal",
    freeTrialCannotUpload: "Percubaan percuma tidak boleh muat naik avatar",
    trialNoCloud: "Data percubaan tidak disimpan ke cloud",
    trialNoPassword: "Mod percubaan tiada kata laluan akaun",
    passwordTooShort: "Kata laluan sekurang-kurangnya 6 aksara",
    pleaseLogin: "Sila log masuk dahulu",
    electronicCard: "Kad Nama Digital",
    shopSystem: "Sistem Kedai Online",
    comingSoon: "Akan Datang",
    extensionDesc:
      "Fungsi baru boleh diletakkan di sini. Pengguna boleh langgan dan tambah ke dashboard.",
    shopDesc: "Kedai online, sistem pesanan, paparan produk dan pintu masuk pesanan pelanggan.",
    loadingApp: "Sedang buka app...",
    noApps: "Belum ada app dashboard. Tambah app dari App Center.",
  },
};

const DASHBOARD_FIX_CSS = `
  .smartacctg-dashboard-page {
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  .smartacctg-dashboard-page * {
    box-sizing: border-box !important;
  }

  .smartacctg-dashboard-page h1,
  .smartacctg-dashboard-page h2,
  .smartacctg-dashboard-page h3,
  .smartacctg-dashboard-page .sa-title-bold {
    font-weight: 900 !important;
  }

  .smartacctg-dashboard-page p,
  .smartacctg-dashboard-page div,
  .smartacctg-dashboard-page span,
  .smartacctg-dashboard-page label,
  .smartacctg-dashboard-page input,
  .smartacctg-dashboard-page select,
  .smartacctg-dashboard-page textarea {
    font-weight: 400 !important;
  }

  .smartacctg-dashboard-page button,
  .smartacctg-dashboard-page strong {
    font-weight: 700 !important;
  }

  .smartacctg-dashboard-page input[type="date"],
  .smartacctg-dashboard-page input[type="month"],
  .smartacctg-dashboard-page input[type="time"],
  .smartacctg-dashboard-page input[type="datetime-local"] {
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

  .smartacctg-dashboard-page input[type="date"]::-webkit-date-and-time-value,
  .smartacctg-dashboard-page input[type="month"]::-webkit-date-and-time-value,
  .smartacctg-dashboard-page input[type="time"]::-webkit-date-and-time-value,
  .smartacctg-dashboard-page input[type="datetime-local"]::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    line-height: normal !important;
  }

  .smartacctg-dashboard-page input[type="date"]::-webkit-datetime-edit,
  .smartacctg-dashboard-page input[type="month"]::-webkit-datetime-edit,
  .smartacctg-dashboard-page input[type="time"]::-webkit-datetime-edit,
  .smartacctg-dashboard-page input[type="datetime-local"]::-webkit-datetime-edit {
    width: 100% !important;
    text-align: center !important;
    padding: 0 !important;
  }

  .smartacctg-dashboard-page input[type="date"]::-webkit-datetime-edit-fields-wrapper,
  .smartacctg-dashboard-page input[type="month"]::-webkit-datetime-edit-fields-wrapper,
  .smartacctg-dashboard-page input[type="time"]::-webkit-datetime-edit-fields-wrapper,
  .smartacctg-dashboard-page input[type="datetime-local"]::-webkit-datetime-edit-fields-wrapper {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
  }

  @keyframes saNoticeMarquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-120%);
    }
  }

  .smartacctg-dashboard-page .sa-dashboard-notice {
    color: #dc2626 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    width: 100% !important;
  }

  .smartacctg-dashboard-page .sa-dashboard-notice-text {
    display: inline-block !important;
    padding-left: 100% !important;
    animation: saNoticeMarquee 14s linear infinite !important;
    color: #dc2626 !important;
    font-weight: 700 !important;
  }

  .smartacctg-dashboard-page .sa-fullscreen-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    overflow: hidden !important;
    background: rgba(15, 23, 42, 0.58) !important;
    padding: 0 !important;
  }

  .smartacctg-dashboard-page .sa-fullscreen-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
    border-top: none !important;
    border-bottom: none !important;
    padding: max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)) !important;
  }

  .smartacctg-dashboard-page .sa-modal-top {
    position: sticky !important;
    top: 0 !important;
    z-index: 20 !important;
    background: inherit !important;
    padding-bottom: 12px !important;
    margin-bottom: 12px !important;
  }

  .smartacctg-dashboard-page .dashboard-app-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)) !important;
    gap: 18px 14px !important;
    align-items: start !important;
  }

  .smartacctg-dashboard-page .dashboard-app-icon-wrap {
    width: 100% !important;
    display: grid !important;
    justify-items: center !important;
    gap: 8px !important;
    min-width: 0 !important;
  }

  .smartacctg-dashboard-page .dashboard-app-icon {
    touch-action: manipulation !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
  }

  .smartacctg-dashboard-page .dashboard-app-name {
    text-align: center !important;
    line-height: 1.2 !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    font-size: clamp(13px, 3vw, 15px) !important;
  }

  .smartacctg-dashboard-page .app-iframe {
    width: 100% !important;
    height: calc(100dvh - 88px) !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: white !important;
  }

  @media (max-width: 680px) {
    .smartacctg-dashboard-page .dashboard-summary-grid,
    .smartacctg-dashboard-page .dashboard-feature-grid {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-dashboard-page .dashboard-quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 430px) {
    .smartacctg-dashboard-page .dashboard-top-card {
      grid-template-columns: minmax(0, 1fr) auto !important;
      gap: 8px !important;
    }

    .smartacctg-dashboard-page .dashboard-plan-text {
      font-size: 13px !important;
    }

    .smartacctg-dashboard-page .dashboard-app-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 18px 10px !important;
    }
  }
`;

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
  const theme = (THEMES[fixedKey] || THEMES.deepTeal) as any;

  applyThemeToDocument(fixedKey);

  document.documentElement.setAttribute("data-sa-theme", fixedKey);
  document.documentElement.setAttribute("data-smartacctg-theme", fixedKey);

  document.documentElement.style.setProperty("--sa-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-card-bg", theme.card);
  document.documentElement.style.setProperty("--sa-panel-bg", theme.panelBg || theme.card);
  document.documentElement.style.setProperty("--sa-item-bg", theme.itemBg || theme.card);
  document.documentElement.style.setProperty("--sa-item-card", theme.itemCard || theme.itemBg || theme.card);
  document.documentElement.style.setProperty(
    "--sa-item-text",
    theme.itemText || theme.panelText || theme.text
  );
  document.documentElement.style.setProperty("--sa-input-bg", theme.inputBg || "#ffffff");
  document.documentElement.style.setProperty("--sa-input-text", theme.inputText || "#111827");
  document.documentElement.style.setProperty("--sa-border", theme.border);
  document.documentElement.style.setProperty("--sa-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-text", theme.text);
  document.documentElement.style.setProperty("--sa-panel-text", theme.panelText || theme.text);
  document.documentElement.style.setProperty("--sa-muted", theme.muted || theme.subText || "#64748b");
  document.documentElement.style.setProperty("--sa-sub-text", theme.subText || theme.muted || "#64748b");
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

function getMonthKey(date?: string | null) {
  if (!date) return "";
  return String(date).slice(0, 7);
}

function getDueTime(date?: string | null) {
  if (!date) return Number.MAX_SAFE_INTEGER;
  const time = new Date(`${date}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function isInvoiceUnpaid(inv: Invoice) {
  const status = String(inv.status || "").toLowerCase();
  if (status === "paid" || status === "cancelled" || status === "canceled") return false;
  return Number(inv.total || 0) > 0;
}

function isImageIcon(icon?: string | null) {
  const raw = String(icon || "").trim();
  return (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:image") ||
    raw.startsWith("/")
  );
}

function normalizeApp(row: any): AppRegistry {
  return {
    id: row?.id,
    app_key: row?.app_key || row?.key || row?.slug || row?.id || "",
    title_zh: row?.title_zh || row?.name_zh || row?.title || row?.name || "",
    title_en: row?.title_en || row?.name_en || row?.title || row?.name || "",
    title_ms: row?.title_ms || row?.name_ms || row?.title || row?.name || "",
    name: row?.name || row?.title || "",
    icon: row?.icon || row?.icon_url || row?.emoji || "📱",
    app_path: row?.app_path || row?.path || row?.url || "",
    description_zh: row?.description_zh || row?.description || "",
    description_en: row?.description_en || row?.description || "",
    description_ms: row?.description_ms || row?.description || "",
    sort_order: Number(row?.sort_order || 999),
    is_active: row?.is_active !== false,
    is_system: Boolean(row?.is_system),
  };
}

function appTitle(app: AppRegistry, lang: Lang) {
  if (lang === "en") return app.title_en || app.title_zh || app.name || app.app_key;
  if (lang === "ms") return app.title_ms || app.title_zh || app.name || app.app_key;
  return app.title_zh || app.name || app.title_en || app.app_key;
}

function appDescription(app: AppRegistry, lang: Lang) {
  if (lang === "en") return app.description_en || app.description_zh || "";
  if (lang === "ms") return app.description_ms || app.description_zh || "";
  return app.description_zh || app.description_en || "";
}

export default function DashboardClient({ page }: { page: PageKey }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [allApps, setAllApps] = useState<AppRegistry[]>(DEFAULT_APPS);
  const [dashboardAppKeys, setDashboardAppKeys] = useState<string[]>(DEFAULT_DASHBOARD_APP_KEYS);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showRecordSummary, setShowRecordSummary] = useState(false);
  const [showDebtSummary, setShowDebtSummary] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showAppCenter, setShowAppCenter] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  const [openApp, setOpenApp] = useState<AppRegistry | null>(null);
  const [openAppUrl, setOpenAppUrl] = useState("");
  const [deleteAppTarget, setDeleteAppTarget] = useState<AppRegistry | null>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const t = TXT[lang];
  const theme = (THEMES[themeKey] || THEMES.deepTeal) as any;
  const themeMuted = theme.muted || theme.subText || "#64748b";

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

  const themeChoices = useMemo(() => {
    const seen = new Set<string>();

    return (Object.keys(THEMES) as string[])
      .filter((key) => isThemeKey(key))
      .filter((key) => {
        const item = (THEMES[key as ThemeKey] || {}) as any;
        const name = item.name || key;

        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      }) as ThemeKey[];
  }, []);

  const dashboardApps = useMemo(() => {
    const activeApps = allApps.filter((app) => app.is_active !== false);

    return dashboardAppKeys
      .map((key) => activeApps.find((app) => app.app_key === key))
      .filter(Boolean) as AppRegistry[];
  }, [allApps, dashboardAppKeys]);

  const dashboardKeySet = useMemo(() => {
    return new Set(dashboardAppKeys);
  }, [dashboardAppKeys]);

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

    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if (mode === "trial" && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSession(null);
          setProfile(null);

          setTransactions(safeParseArray<Txn>(safeLocalGet(TRIAL_TX_KEY)));
          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));

          const localKeys = safeParseArray<string>(safeLocalGet(DASHBOARD_APP_KEYS_LOCAL));
          setDashboardAppKeys(localKeys.length > 0 ? localKeys : DEFAULT_DASHBOARD_APP_KEYS);

          await loadAppsForUser("trial", true);

          replaceUrlLangTheme(currentLang, currentTheme);
          return;
        }
      } catch {
        // ignore bad trial data
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_TX_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
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
      .select("*")
      .eq("id", userId)
      .single();

    let finalTheme = currentTheme;

    if (profileData) {
      const p = profileData as Profile;

      setProfile(p);
      setFullName(p.full_name || "");
      setPhone(p.phone || "");
      setCompanyName(p.company_name || "");
      setCompanyRegNo(p.company_reg_no || "");
      setCompanyPhone(p.company_phone || "");
      setCompanyAddress(p.company_address || "");

      finalTheme = normalizeThemeKey(p.theme || currentTheme);
    }

    safeLocalRemove(SMARTACCTG_THEME_KEY);
    setThemeKey(finalTheme);
    saveThemeKey(finalTheme);
    applyThemeEverywhere(finalTheme);
    replaceUrlLangTheme(currentLang, finalTheme);

    await loadAll(userId);
    await loadAppsForUser(userId, false);
  }

  async function loadAll(userId: string) {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("txn_date", { ascending: false });

    const { data: customerData } = await supabase
      .from("customers")
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
    setInvoices((invoiceData || []) as Invoice[]);
  }

  async function loadAppsForUser(userId: string, trialMode: boolean) {
    let registry = DEFAULT_APPS;

    if (!trialMode) {
      const { data: registryData, error } = await supabase
        .from("app_registry")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && registryData && registryData.length > 0) {
        registry = registryData
          .map(normalizeApp)
          .filter((app) => app.app_key)
          .sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));
      }
    }

    setAllApps(registry);

    if (trialMode) {
      const localKeys = safeParseArray<string>(safeLocalGet(DASHBOARD_APP_KEYS_LOCAL));
      setDashboardAppKeys(localKeys.length > 0 ? localKeys : DEFAULT_DASHBOARD_APP_KEYS);
      return;
    }

    const initKey = `${DASHBOARD_APPS_INIT_LOCAL}_${userId}`;

    const { data: dashboardData, error: dashboardError } = await supabase
      .from("user_dashboard_apps")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (dashboardError) {
      setDashboardAppKeys(DEFAULT_DASHBOARD_APP_KEYS);
      return;
    }

    const rows = (dashboardData || []) as UserDashboardApp[];

    if (rows.length === 0 && !safeLocalGet(initKey)) {
      const defaultRows = DEFAULT_DASHBOARD_APP_KEYS.map((key) => ({
        user_id: userId,
        app_key: key,
      }));

      await supabase.from("user_dashboard_apps").insert(defaultRows);
      safeLocalSet(initKey, "1");
      setDashboardAppKeys(DEFAULT_DASHBOARD_APP_KEYS);
      return;
    }

    safeLocalSet(initKey, "1");
    setDashboardAppKeys(rows.map((row) => row.app_key).filter(Boolean));
  }

  function buildUrl(path: string, extra?: string) {
    const q = new URLSearchParams();
    const fixedTheme = normalizeThemeKey(themeKey);

    if (isTrial) q.set("mode", "trial");

    q.set("lang", lang);
    q.set("theme", fixedTheme);
    q.set("refresh", String(Date.now()));

    if (extra) {
      const extraQuery = new URLSearchParams(extra);
      extraQuery.forEach((value, key) => q.set(key, value));
    }

    return `${path}?${q.toString()}`;
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);
    replaceUrlLangTheme(next, themeKey);
  }

  async function logout() {
    safeLocalRemove(TRIAL_KEY);
    safeLocalRemove(TRIAL_TX_KEY);
    safeLocalRemove(TRIAL_CUSTOMERS_KEY);
    safeLocalRemove(TRIAL_INVOICES_KEY);
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  async function uploadAvatar(e: ChangeEvent<HTMLInputElement>) {
    if (isTrial) {
      setMsg(t.freeTrialCannotUpload);
      return;
    }

    if (!session) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const path = `${session.user.id}/avatar-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("company-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      setMsg(error.message);
      return;
    }

    const { data } = supabase.storage.from("company-assets").getPublicUrl(path);

    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", session.user.id);

    setProfile((p) => (p ? { ...p, avatar_url: data.publicUrl } : p));
    setMsg(t.saved);
  }

  async function saveSettings() {
    if (isTrial) {
      setMsg(t.trialNoCloud);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        company_name: companyName,
        company_reg_no: companyRegNo,
        company_phone: companyPhone,
        company_address: companyAddress,
      })
      .eq("id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setProfile((p) =>
      p
        ? {
            ...p,
            full_name: fullName,
            phone,
            company_name: companyName,
            company_reg_no: companyRegNo,
            company_phone: companyPhone,
            company_address: companyAddress,
          }
        : p
    );

    setMsg(t.saved);
  }

  async function changePassword() {
    if (isTrial) {
      setMsg(t.trialNoPassword);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setMsg(t.passwordTooShort);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.saved);
    setNewPassword("");
  }

  async function changeTheme(key: ThemeKey) {
    const fixedTheme = normalizeThemeKey(key);

    setThemeKey(fixedTheme);
    saveThemeKey(fixedTheme);
    applyThemeEverywhere(fixedTheme);
    replaceUrlLangTheme(lang, fixedTheme);

    if (isTrial) {
      setMsg(t.saved);
      return;
    }

    if (!session) {
      setMsg(t.pleaseLogin);
      return;
    }

    safeLocalRemove(SMARTACCTG_THEME_KEY);

    const { error } = await supabase
      .from("profiles")
      .update({ theme: fixedTheme })
      .eq("id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setProfile((p) => (p ? { ...p, theme: fixedTheme } : p));
    setMsg(t.saved);
  }

  function openAppModal(app: AppRegistry, extra?: string) {
    if (app.app_path === "__extension__") {
      setShowExtensionModal(true);
      return;
    }

    if (app.app_path === "__shop__") {
      setShowShopModal(true);
      return;
    }

    const path = app.app_path || "";
    if (!path) return;

    setOpenApp(app);
    setOpenAppUrl(buildUrl(path, extra || "embed=1"));
  }

  function openQuick(path: string) {
    const found = allApps.find((app) => app.app_path === path);

    if (found) {
      openAppModal(found, "open=new&fullscreen=1&return=dashboard&embed=1");
      return;
    }

    setOpenApp({
      app_key: path,
      title_zh: path,
      title_en: path,
      title_ms: path,
      icon: "📱",
      app_path: path,
    });

    setOpenAppUrl(buildUrl(path, "open=new&fullscreen=1&return=dashboard&embed=1"));
  }

  function closeOpenApp() {
    setOpenApp(null);
    setOpenAppUrl("");
  }

  function openAppCenter() {
    setShowAppCenter(true);
  }

  function startAppLongPress(app: AppRegistry) {
    longPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(25);
      }

      setDeleteAppTarget(app);
    }, 650);
  }

  function cancelAppLongPress() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleAppIconClick(app: AppRegistry) {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    openAppModal(app);
  }

  async function setAppPinned(app: AppRegistry, pinned: boolean) {
    if (!app.app_key) return;

    if (isTrial) {
      const next = pinned
        ? Array.from(new Set([...dashboardAppKeys, app.app_key]))
        : dashboardAppKeys.filter((key) => key !== app.app_key);

      setDashboardAppKeys(next);
      safeLocalSet(DASHBOARD_APP_KEYS_LOCAL, JSON.stringify(next));
      setMsg(t.saved);
      return;
    }

    if (!session) return;

    if (pinned) {
      const exists = dashboardAppKeys.includes(app.app_key);

      if (!exists) {
        const { error } = await supabase.from("user_dashboard_apps").insert({
          user_id: session.user.id,
          app_key: app.app_key,
        });

        if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
          setMsg(error.message);
          return;
        }

        setDashboardAppKeys((prev) => Array.from(new Set([...prev, app.app_key])));
      }

      setMsg(t.saved);
      return;
    }

    const { error } = await supabase
      .from("user_dashboard_apps")
      .delete()
      .eq("user_id", session.user.id)
      .eq("app_key", app.app_key);

    if (error) {
      setMsg(error.message);
      return;
    }

    setDashboardAppKeys((prev) => prev.filter((key) => key !== app.app_key));
    setMsg(t.saved);
  }

  async function confirmRemoveDashboardApp() {
    if (!deleteAppTarget) return;

    await setAppPinned(deleteAppTarget, false);
    setDeleteAppTarget(null);
  }

  const latestMonthKey = useMemo(() => {
    const months = transactions.map((tx) => getMonthKey(tx.txn_date)).filter(Boolean);

    if (months.length === 0) return new Date().toISOString().slice(0, 7);

    return months.sort().reverse()[0];
  }, [transactions]);

  const latestMonthRecords = useMemo(() => {
    return transactions.filter((tx) => tx.txn_date?.startsWith(latestMonthKey));
  }, [transactions, latestMonthKey]);

  const monthIncome = useMemo(() => {
    return latestMonthRecords
      .filter((x) => x.txn_type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [latestMonthRecords]);

  const monthExpense = useMemo(() => {
    return latestMonthRecords
      .filter((x) => x.txn_type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [latestMonthRecords]);

  const balance = useMemo(() => {
    return monthIncome - monthExpense;
  }, [monthIncome, monthExpense]);

  const estimatedProfit = useMemo(() => {
    return monthIncome;
  }, [monthIncome]);

  const debtItems = useMemo<DebtItem[]>(() => {
    const customerDebtItems: DebtItem[] = customers
      .map((c) => {
        const amount = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);

        return {
          id: `customer-${c.id}`,
          name: c.company_name ? `${c.name || "-"} / ${c.company_name}` : c.name || "-",
          source: "customer" as const,
          amount,
          dueDate: c.last_payment_date || "",
          sortTime: c.last_payment_date ? getDueTime(c.last_payment_date) : Number.MAX_SAFE_INTEGER,
        };
      })
      .filter((x) => x.amount > 0);

    const invoiceDebtItems: DebtItem[] = invoices
      .filter((inv) => isInvoiceUnpaid(inv))
      .map((inv) => {
        const name = inv.customer_company
          ? `${inv.customer_name || "-"} / ${inv.customer_company}`
          : inv.customer_name || "-";

        const dueDate = inv.due_date || inv.invoice_date || inv.created_at?.slice(0, 10) || "";

        return {
          id: `invoice-${inv.id}`,
          name,
          source: "invoice" as const,
          amount: Number(inv.total || 0),
          dueDate,
          sortTime: getDueTime(dueDate),
        };
      });

    return [...customerDebtItems, ...invoiceDebtItems].sort((a, b) => {
      if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime;
      return b.amount - a.amount;
    });
  }, [customers, invoices]);

  const totalCustomerDebt = useMemo(() => {
    return debtItems.reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [debtItems]);

  const topDebtItem = debtItems[0] || null;

  const expiryText = isTrial
    ? t.trial
    : profile?.plan_expiry
      ? new Date(profile.plan_expiry).toLocaleDateString()
      : t.noSub;

  return (
    <main
      className="smartacctg-page smartacctg-dashboard-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{DASHBOARD_FIX_CSS}</style>

      <header
        className="sa-card dashboard-top-card"
        style={{
          ...topCardStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div style={leftTopStyle}>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              style={avatarBtnStyle}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={avatarImgStyle} />
              ) : (
                "👤"
              )}
            </button>

            {showAvatarMenu ? (
              <div style={avatarMenuStyle}>
                <label style={menuItemStyle}>
                  {t.changeAvatar}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    style={{ display: "none" }}
                  />
                </label>

                <button
                  type="button"
                  style={menuItemStyle}
                  onClick={() => {
                    setShowSettings(true);
                    setShowThemes(false);
                    setShowAvatarMenu(false);
                  }}
                >
                  {t.settings}
                </button>

                <button
                  type="button"
                  style={menuItemStyle}
                  onClick={() => {
                    setShowThemes(true);
                    setShowSettings(false);
                    setShowAvatarMenu(false);
                  }}
                >
                  {t.theme}
                </button>

                <div style={avatarLangBoxStyle}>
                  <div style={avatarLangTitleStyle}>{t.language}</div>

                  <div style={avatarLangBtnRowStyle}>
                    <button
                      type="button"
                      onClick={() => switchLang("zh")}
                      style={avatarLangBtnStyle(lang === "zh", theme)}
                    >
                      中文
                    </button>

                    <button
                      type="button"
                      onClick={() => switchLang("en")}
                      style={avatarLangBtnStyle(lang === "en", theme)}
                    >
                      EN
                    </button>

                    <button
                      type="button"
                      onClick={() => switchLang("ms")}
                      style={avatarLangBtnStyle(lang === "ms", theme)}
                    >
                      BM
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="dashboard-plan-text" style={planTextStyle}>
            {t.expiry}: {expiryText}
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{ ...logoutBtnStyle, background: theme.accent }}
        >
          {t.logout}
        </button>
      </header>

      {page === "home" ? (
        <>
          <section
            className="sa-card"
            style={{
              background: theme.banner || theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
              marginBottom: 14,
            }}
          >
            <h1 style={titleStyle}>{t.dashboard}</h1>

            <div className="sa-dashboard-notice" style={noticeWrapStyle}>
              <div className="sa-dashboard-notice-text" style={noticeMarqueeStyle}>
                {t.notice}
              </div>
            </div>
          </section>

          <section className="dashboard-summary-grid" style={summaryGridStyle}>
            <div className="sa-card dashboard-stat-card" style={{ ...summaryBoxStyle, ...themedCardStyle }}>
              <button
                type="button"
                onClick={() => setShowRecordSummary(!showRecordSummary)}
                style={summaryHeaderBtnStyle}
              >
                <span className="sa-title-bold">{t.recordsOverview}</span>
                <strong>{showRecordSummary ? "▲" : "▼"}</strong>
              </button>

              <div style={{ ...smallMutedStyle, color: themeMuted }}>
                {t.latestMonth}: {latestMonthKey}
              </div>

              {showRecordSummary ? (
                <div style={summaryDetailListStyle}>
                  <div style={summaryRowStyle}>
                    <span>{t.balance}</span>
                    <strong style={{ color: theme.accent }}>{formatRM(balance)}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>{t.monthIncome}</span>
                    <strong style={{ color: "#16a34a" }}>{formatRM(monthIncome)}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>{t.monthExpense}</span>
                    <strong style={{ color: "#dc2626" }}>{formatRM(monthExpense)}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>{t.estimatedProfit}</span>
                    <strong style={{ color: theme.accent }}>{formatRM(estimatedProfit)}</strong>
                  </div>
                </div>
              ) : (
                <div style={summaryRowStyle}>
                  <span>{t.estimatedProfit}</span>
                  <strong style={{ color: theme.accent }}>{formatRM(estimatedProfit)}</strong>
                </div>
              )}
            </div>

            <div className="sa-card dashboard-stat-card" style={{ ...summaryBoxStyle, ...themedCardStyle }}>
              <button
                type="button"
                onClick={() => setShowDebtSummary(!showDebtSummary)}
                style={summaryHeaderBtnStyle}
              >
                <span className="sa-title-bold">{t.customerDebt}</span>
                <strong>{showDebtSummary ? "▲" : "▼"}</strong>
              </button>

              {showDebtSummary ? (
                <div style={summaryDetailListStyle}>
                  {debtItems.length === 0 ? (
                    <div style={summaryRowStyle}>
                      <span>{t.noDebt}</span>
                      <strong>{formatRM(0)}</strong>
                    </div>
                  ) : (
                    <>
                      <div style={summaryRowStyle}>
                        <span>{t.customerDebt}</span>
                        <strong style={{ color: "#dc2626" }}>{formatRM(totalCustomerDebt)}</strong>
                      </div>

                      {debtItems.slice(0, 8).map((item) => (
                        <div key={item.id} style={debtRowStyle}>
                          <div>
                            <div>{item.name}</div>
                            {item.dueDate ? (
                              <small style={{ color: themeMuted }}>
                                {item.source === "invoice" ? "Invoice" : "Customer"} · {item.dueDate}
                              </small>
                            ) : null}
                          </div>

                          <strong style={{ color: "#dc2626" }}>{formatRM(item.amount)}</strong>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div style={summaryRowStyle}>
                  <span>{topDebtItem?.name || t.noDebt}</span>
                  <strong style={{ color: topDebtItem ? "#dc2626" : theme.accent }}>
                    {formatRM(topDebtItem?.amount || 0)}
                  </strong>
                </div>
              )}
            </div>
          </section>

          <section className="sa-card" style={{ ...themedCardStyle, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              style={quickHeaderBtnStyle}
            >
              <span className="sa-title-bold">{t.quick}</span>
              <strong>{showQuickMenu ? "▲" : "▼"}</strong>
            </button>

            {showQuickMenu ? (
              <div className="dashboard-quick-grid" style={quickGridStyle}>
                <button type="button" onClick={() => openQuick("/dashboard/records")} style={quickBtnStyle(theme)}>
                  {t.quickAccounting}
                </button>

                <button type="button" onClick={() => openQuick("/dashboard/invoices")} style={quickBtnStyle(theme)}>
                  {t.quickInvoice}
                </button>

                <button type="button" onClick={() => openQuick("/dashboard/customers")} style={quickBtnStyle(theme)}>
                  {t.quickCustomer}
                </button>

                <button type="button" onClick={() => openQuick("/dashboard/products")} style={quickBtnStyle(theme)}>
                  {t.quickProduct}
                </button>
              </div>
            ) : null}
          </section>

          <section className="sa-card" style={{ ...themedCardStyle, marginBottom: 14 }}>
            <p style={{ color: themeMuted, marginTop: 0, marginBottom: 14 }}>
              {t.longPressRemove}
            </p>

            {dashboardApps.length === 0 ? (
              <p style={{ color: themeMuted }}>{t.noApps}</p>
            ) : (
              <div className="dashboard-app-grid" style={appGridStyle}>
                {dashboardApps.map((app) => (
                  <div key={app.app_key} className="dashboard-app-icon-wrap">
                    <button
                      type="button"
                      onClick={() => handleAppIconClick(app)}
                      onPointerDown={() => startAppLongPress(app)}
                      onPointerUp={cancelAppLongPress}
                      onPointerLeave={cancelAppLongPress}
                      onPointerCancel={cancelAppLongPress}
                      onContextMenu={(e) => e.preventDefault()}
                      className="dashboard-app-icon"
                      style={phoneAppIconStyle(theme)}
                    >
                      {isImageIcon(app.icon) ? (
                        <img src={app.icon || ""} alt={appTitle(app, lang)} style={appImgStyle} />
                      ) : (
                        <span style={appEmojiStyle}>{app.icon || "📱"}</span>
                      )}
                    </button>

                    <div className="dashboard-app-name" style={{ color: theme.text }}>
                      {appTitle(app, lang)}
                    </div>
                  </div>
                ))}

                <div className="dashboard-app-icon-wrap">
                  <button
                    type="button"
                    onClick={openAppCenter}
                    className="dashboard-app-icon"
                    style={appCenterIconStyle}
                  >
                    <span style={appCenterLogoStyle}>NK</span>
                  </button>

                  <div className="dashboard-app-name" style={{ color: theme.text }}>
                    {t.appCenter}
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}

      {page !== "home" ? (
        <section className="sa-card" style={{ ...themedCardStyle }}>
          <button
            type="button"
            onClick={() => (window.location.href = buildUrl("/dashboard"))}
            style={{
              ...backBtnStyle,
              borderColor: theme.border,
              color: theme.accent,
              background: theme.inputBg || "#ffffff",
            }}
          >
            ← {t.back}
          </button>

          <h1 style={titleStyle}>
            {page === "records" && appTitle(DEFAULT_APPS[0], lang)}
            {page === "accounting" && appTitle(DEFAULT_APPS[0], lang)}
            {page === "customers" && appTitle(DEFAULT_APPS[1], lang)}
            {page === "products" && appTitle(DEFAULT_APPS[2], lang)}
            {page === "invoices" && appTitle(DEFAULT_APPS[3], lang)}
          </h1>
        </section>
      ) : null}

      {showSettings ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card sa-fullscreen-modal"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-top" style={modalTopStyle}>
              <h1 style={modalTitleStyle}>{t.settings}</h1>

              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setMsg("");
                }}
                style={closeBtnStyle}
              >
                {t.close}
              </button>
            </div>

            <h2 style={sectionTitleStyle}>{t.language}</h2>

            <div style={modalLangRowStyle}>
              <button type="button" onClick={() => switchLang("zh")} style={modalLangBtnStyle(lang === "zh", theme)}>
                中文
              </button>

              <button type="button" onClick={() => switchLang("en")} style={modalLangBtnStyle(lang === "en", theme)}>
                EN
              </button>

              <button type="button" onClick={() => switchLang("ms")} style={modalLangBtnStyle(lang === "ms", theme)}>
                BM
              </button>
            </div>

            <h2 style={sectionTitleStyle}>{t.personal}</h2>

            <input
              placeholder={t.name}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={themedInputStyle}
            />

            <h2 style={sectionTitleStyle}>{t.company}</h2>

            <input
              placeholder={t.companyName}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.ssm}
              value={companyRegNo}
              onChange={(e) => setCompanyRegNo(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.companyPhone}
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.companyAddress}
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              style={themedInputStyle}
            />

            <button type="button" onClick={saveSettings} style={{ ...primaryBtnStyle, background: theme.accent }}>
              {t.save}
            </button>

            <h2 style={sectionTitleStyle}>{t.password}</h2>

            <input
              type="password"
              placeholder={t.newPassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={themedInputStyle}
            />

            <button type="button" onClick={changePassword} style={{ ...primaryBtnStyle, background: theme.accent }}>
              {t.updatePassword}
            </button>

            {msg ? <p style={{ color: theme.accent }}>{msg}</p> : null}
          </section>
        </div>
      ) : null}

      {showThemes ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card sa-fullscreen-modal"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-top" style={modalTopStyle}>
              <h1 style={modalTitleStyle}>{t.theme}</h1>

              <button
                type="button"
                onClick={() => {
                  setShowThemes(false);
                  setMsg("");
                }}
                style={closeBtnStyle}
              >
                {t.close}
              </button>
            </div>

            <div style={themeGridStyle}>
              {themeChoices.map((key) => {
                const item = (THEMES[key] || THEMES.deepTeal) as any;

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => changeTheme(key)}
                    style={{
                      ...themeBtnStyle,
                      borderColor: item.border,
                      background: item.banner || item.card,
                      color: item.text,
                      boxShadow: item.glow,
                    }}
                  >
                    {item.name || key}
                  </button>
                );
              })}
            </div>

            {msg ? <p style={{ color: theme.accent }}>{msg}</p> : null}
          </section>
        </div>
      ) : null}

      {showAppCenter ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card sa-fullscreen-modal"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-top" style={modalTopStyle}>
              <h1 style={modalTitleStyle}>{t.appCenter}</h1>

              <button type="button" onClick={() => setShowAppCenter(false)} style={closeBtnStyle}>
                {t.close}
              </button>
            </div>

            <p style={{ color: themeMuted }}>{t.appCenterDesc}</p>

            <div style={appCenterListStyle}>
              {allApps.map((app) => {
                const pinned = dashboardKeySet.has(app.app_key);
                const desc = appDescription(app, lang);

                return (
                  <div
                    key={app.app_key}
                    style={{
                      ...appCenterCardStyle,
                      borderColor: theme.border,
                      background: theme.panelBg || theme.card,
                      color: theme.panelText || theme.text,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openAppModal(app)}
                      style={phoneAppIconStyle(theme)}
                    >
                      {isImageIcon(app.icon) ? (
                        <img src={app.icon || ""} alt={appTitle(app, lang)} style={appImgStyle} />
                      ) : (
                        <span style={appEmojiStyle}>{app.icon || "📱"}</span>
                      )}
                    </button>

                    <div style={{ minWidth: 0 }}>
                      <h2 style={appCenterTitleStyle}>{appTitle(app, lang)}</h2>
                      {desc ? <p style={{ margin: "6px 0 0", color: themeMuted }}>{desc}</p> : null}
                    </div>

                    <div style={appCenterActionStyle}>
                      <button
                        type="button"
                        onClick={() => openAppModal(app)}
                        style={{ ...appCenterSmallBtnStyle, background: theme.accent, color: "#fff" }}
                      >
                        {t.open}
                      </button>

                      {pinned ? (
                        <button
                          type="button"
                          onClick={() => setAppPinned(app, false)}
                          style={appCenterRemoveBtnStyle}
                        >
                          {t.removeFromDashboard}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAppPinned(app, true)}
                          style={{
                            ...appCenterSmallBtnStyle,
                            borderColor: theme.border,
                            color: theme.accent,
                            background: theme.inputBg || "#fff",
                          }}
                        >
                          {t.addToDashboard}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {msg ? <p style={{ color: theme.accent }}>{msg}</p> : null}
          </section>
        </div>
      ) : null}

      {deleteAppTarget ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card"
            style={{
              ...deleteAppModalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <h1 style={modalTitleStyle}>{t.removeAppTitle}</h1>

            <div style={deleteAppPreviewStyle}>
              <button type="button" style={phoneAppIconStyle(theme)}>
                {isImageIcon(deleteAppTarget.icon) ? (
                  <img
                    src={deleteAppTarget.icon || ""}
                    alt={appTitle(deleteAppTarget, lang)}
                    style={appImgStyle}
                  />
                ) : (
                  <span style={appEmojiStyle}>{deleteAppTarget.icon || "📱"}</span>
                )}
              </button>

              <h2 style={appCenterTitleStyle}>{appTitle(deleteAppTarget, lang)}</h2>
              <p style={{ color: themeMuted }}>{t.removeAppMessage}</p>
            </div>

            <div style={deleteAppActionRowStyle}>
              <button type="button" onClick={confirmRemoveDashboardApp} style={deleteAppConfirmBtnStyle}>
                {t.confirm}
              </button>

              <button type="button" onClick={() => setDeleteAppTarget(null)} style={deleteAppCancelBtnStyle}>
                {t.cancel}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {openApp ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card sa-fullscreen-modal"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
            }}
          >
            <div className="sa-modal-top" style={{ ...modalTopStyle, paddingLeft: 16, paddingRight: 16 }}>
              <h1 style={modalTitleStyle}>{appTitle(openApp, lang)}</h1>

              <button type="button" onClick={closeOpenApp} style={closeBtnStyle}>
                {t.close}
              </button>
            </div>

            {openAppUrl ? (
              <iframe
                src={openAppUrl}
                title={appTitle(openApp, lang)}
                className="app-iframe"
                style={appIframeStyle}
              />
            ) : (
              <p style={{ padding: 16 }}>{t.loadingApp}</p>
            )}
          </section>
        </div>
      ) : null}

      {showExtensionModal ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card sa-fullscreen-modal"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-top" style={modalTopStyle}>
              <h1 style={modalTitleStyle}>{appTitle(DEFAULT_APPS[4], lang)}</h1>

              <button type="button" onClick={() => setShowExtensionModal(false)} style={closeBtnStyle}>
                {t.close}
              </button>
            </div>

            <p style={{ color: themeMuted }}>{t.extensionDesc}</p>

            <div style={extensionGridStyle}>
              <div style={{ ...extensionCardStyle, borderColor: theme.border }}>
                <h2 style={sectionTitleStyle}>{t.electronicCard}</h2>
                <p style={{ color: themeMuted }}>{t.comingSoon}</p>
              </div>

              <div style={{ ...extensionCardStyle, borderColor: theme.border }}>
                <h2 style={sectionTitleStyle}>{t.shopSystem}</h2>
                <p style={{ color: themeMuted }}>{t.shopDesc}</p>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {showShopModal ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card sa-fullscreen-modal"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-top" style={modalTopStyle}>
              <h1 style={modalTitleStyle}>{appTitle(DEFAULT_APPS[5], lang)}</h1>

              <button type="button" onClick={() => setShowShopModal(false)} style={closeBtnStyle}>
                {t.close}
              </button>
            </div>

            <div style={{ ...extensionCardStyle, borderColor: theme.border }}>
              <h2 style={sectionTitleStyle}>{t.shopSystem}</h2>
              <p style={{ color: themeMuted }}>{t.shopDesc}</p>
              <button type="button" onClick={() => setShowShopModal(false)} style={{ ...primaryBtnStyle, background: theme.accent }}>
                {t.comingSoon}
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

const topCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const leftTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const avatarBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  border: "none",
  background: "#fff",
  fontSize: 24,
  overflow: "hidden",
  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  padding: 0,
};

const avatarImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarMenuStyle: CSSProperties = {
  position: "absolute",
  top: 60,
  left: 0,
  width: 230,
  background: "#fff",
  color: "#111827",
  borderRadius: 16,
  padding: 10,
  zIndex: 99,
  boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
};

const menuItemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  border: "none",
  background: "transparent",
  textAlign: "left",
  borderRadius: 10,
  color: "#111827",
  fontSize: 16,
};

const avatarLangBoxStyle: CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  marginTop: 8,
  paddingTop: 8,
};

const avatarLangTitleStyle: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 8,
};

const avatarLangBtnRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
};

const avatarLangBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  border: `2px solid ${theme.accent}`,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
  borderRadius: 999,
  minHeight: 38,
  padding: "0 8px",
});

const planTextStyle: CSSProperties = {
  lineHeight: 1.25,
  overflowWrap: "anywhere",
};

const logoutBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  minHeight: "var(--sa-control-h)",
  whiteSpace: "nowrap",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.15,
  fontWeight: 900,
};

const noticeWrapStyle: CSSProperties = {
  marginTop: 12,
};

const noticeMarqueeStyle: CSSProperties = {
  display: "inline-block",
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginTop: 14,
  marginBottom: 14,
};

const summaryBoxStyle: CSSProperties = {
  minHeight: 0,
  padding: "clamp(14px, 3vw, 22px)",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
};

const summaryHeaderBtnStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  border: "none",
  background: "transparent",
  color: "inherit",
  padding: 0,
  minHeight: 0,
  fontSize: "var(--sa-fs-base)",
};

const smallMutedStyle: CSSProperties = {
  marginTop: 8,
  fontSize: "var(--sa-fs-sm)",
};

const summaryDetailListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 14,
};

const summaryRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
  lineHeight: 1.25,
};

const debtRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "start",
  lineHeight: 1.35,
};

const quickHeaderBtnStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  border: "none",
  background: "transparent",
  color: "inherit",
  padding: 0,
  minHeight: 0,
  fontSize: "var(--sa-fs-base)",
};

const quickGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
  marginTop: 14,
};

const quickBtnStyle = (theme: any): CSSProperties => ({
  background: theme.inputBg || "#fff",
  border: `var(--sa-border-w) solid ${theme.border}`,
  color: theme.accent,
  borderRadius: "var(--sa-radius-control)",
  minHeight: 56,
  padding: "0 12px",
});

const appGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(86px, 1fr))",
  gap: "18px 14px",
};

const phoneAppIconStyle = (theme: any): CSSProperties => ({
  width: 70,
  height: 70,
  minWidth: 70,
  minHeight: 70,
  borderRadius: 22,
  border: `2px solid ${theme.border}`,
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.72))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 22px rgba(15,23,42,0.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  overflow: "hidden",
});

const appImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const appEmojiStyle: CSSProperties = {
  fontSize: 34,
  lineHeight: 1,
};

const appCenterIconStyle: CSSProperties = {
  width: 70,
  height: 70,
  minWidth: 70,
  minHeight: 70,
  borderRadius: 999,
  border: "2px solid rgba(45, 212, 191, 0.9)",
  background:
    "radial-gradient(circle at 30% 20%, #ffffff, #99f6e4 22%, #14b8a6 48%, #064e3b 100%)",
  boxShadow:
    "inset 0 2px 8px rgba(255,255,255,0.75), 0 0 0 2px rgba(45,212,191,0.22), 0 14px 30px rgba(20,184,166,0.36)",
  color: "#ecfeff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const appCenterLogoStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  letterSpacing: 1,
  textShadow: "0 2px 8px rgba(0,0,0,0.25)",
};

const backBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  marginBottom: 14,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0 var(--sa-control-x)",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  minHeight: "var(--sa-control-h)",
  marginBottom: 12,
  fontSize: 16,
  background: "#fff",
  color: "#111827",
  outline: "none",
};

const primaryBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  padding: "0 18px",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  marginBottom: 16,
};

const modalTopStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  fontWeight: 900,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 12,
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
};

const closeBtnStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: "var(--sa-fs-base)",
  padding: 8,
};

const modalLangRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const modalLangBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  minHeight: "var(--sa-control-h)",
  borderRadius: "var(--sa-radius-control)",
  border: `var(--sa-border-w) solid ${theme.accent}`,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
});

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const themeBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  minHeight: 84,
  textAlign: "left",
};

const appCenterListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 16,
};

const appCenterCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  gap: 14,
  alignItems: "center",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const appCenterTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-lg)",
  fontWeight: 900,
};

const appCenterActionStyle: CSSProperties = {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const appCenterSmallBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid transparent",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 12px",
  fontWeight: 900,
};

const appCenterRemoveBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid #fecaca",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 12px",
  fontWeight: 900,
  background: "#fff",
  color: "#dc2626",
};

const deleteAppModalStyle: CSSProperties = {
  width: "min(92vw, 520px)",
  margin: "18vh auto 0",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const deleteAppPreviewStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  textAlign: "center",
  gap: 12,
  marginTop: 18,
  marginBottom: 18,
};

const deleteAppActionRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 16,
};

const deleteAppConfirmBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 900,
};

const deleteAppCancelBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid #cbd5e1",
  borderRadius: "var(--sa-radius-control)",
  background: "#fff",
  color: "#111827",
  fontWeight: 900,
};

const appIframeStyle: CSSProperties = {
  width: "100%",
  height: "calc(100dvh - 88px)",
  border: 0,
  background: "#fff",
};

const extensionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const extensionCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};