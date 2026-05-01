"use client";

import { ChangeEvent, CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  THEME_KEY as SMARTACCTG_THEME_KEY,
  type ThemeKey,
  getThemeKeyFromUrlOrLocalStorage,
  isThemeKey,
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
};

type Invoice = {
  id: string;
  user_id?: string;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_company?: string | null;
  invoice_no?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  total?: number | null;
  total_profit?: number | null;
  created_at?: string | null;
};

type DebtItem = {
  id: string;
  name: string;
  companyName: string;
  amount: number;
  dueDate: string;
  source: "customer" | "invoice";
  sortTime: number;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";
const LANG_KEY = "smartacctg_lang";

const TXT = {
  zh: {
    dashboard: "控制台",
    notice: "通知：欢迎使用 SmartAcctg，系统功能会持续更新。",
    recordsOverview: "记录总览",
    customerDebt: "客户欠款",
    estimatedProfit: "预计利润",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    summaryMonth: "统计月份",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    extensions: "扩展功能",
    nkShop: "NK网店",
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
    dueDate: "到期日",
    fromInvoice: "来自发票",
    fromCustomer: "来自客户资料",
    back: "返回",
    extensionHint: "扩展功能建议结构：电子名片、网店系统",
    nkShopHint: "NK网店：之后可以放独立网店、订单系统、订阅功能。",
  },
  en: {
    dashboard: "Dashboard",
    notice: "Notice: Welcome to SmartAcctg. Features will continue to improve.",
    recordsOverview: "Records Overview",
    customerDebt: "Customer Debt",
    estimatedProfit: "Estimated Profit",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    summaryMonth: "Summary Month",
    accounting: "Accounting",
    customers: "Customers",
    products: "Products",
    invoices: "Invoices",
    extensions: "Extensions",
    nkShop: "NK Shop",
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
    dueDate: "Due Date",
    fromInvoice: "From Invoice",
    fromCustomer: "From Customer Info",
    back: "Back",
    extensionHint: "Suggested structure: Digital Business Card, Online Store System",
    nkShopHint: "NK Shop: for online store, order system and subscription features later.",
  },
  ms: {
    dashboard: "Papan Pemuka",
    notice: "Notis: Selamat datang ke SmartAcctg. Fungsi akan terus dikemas kini.",
    recordsOverview: "Ringkasan Rekod",
    customerDebt: "Hutang Pelanggan",
    estimatedProfit: "Anggaran Untung",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    summaryMonth: "Bulan Ringkasan",
    accounting: "Sistem Akaun",
    customers: "Pelanggan",
    products: "Produk",
    invoices: "Invois",
    extensions: "Fungsi Tambahan",
    nkShop: "NK Kedai",
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
    dueDate: "Tarikh Tamat",
    fromInvoice: "Daripada Invois",
    fromCustomer: "Daripada Maklumat Pelanggan",
    back: "Kembali",
    extensionHint: "Cadangan struktur: Kad Bisnes Digital, Sistem Kedai Online",
    nkShopHint: "NK Kedai: untuk kedai online, sistem pesanan dan langganan nanti.",
  },
};

const DASHBOARD_FIX_CSS = `
  .smartacctg-dashboard-page .dashboard-summary-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .smartacctg-dashboard-page .feature-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .smartacctg-dashboard-page .quick-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
    margin-top: 14px !important;
  }

  .smartacctg-dashboard-page .feature-grid button,
  .smartacctg-dashboard-page .quick-grid button {
    width: 100% !important;
    min-width: 0 !important;
    white-space: normal !important;
    text-align: center !important;
  }

  .smartacctg-dashboard-page .dashboard-summary-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 10px !important;
    align-items: center !important;
    width: 100% !important;
    font-weight: 900 !important;
  }

  .smartacctg-dashboard-page .dashboard-summary-row strong {
    white-space: nowrap !important;
  }

  .smartacctg-dashboard-page .dashboard-debt-list {
    display: grid !important;
    gap: 10px !important;
    margin-top: 14px !important;
  }

  .smartacctg-dashboard-page .dashboard-debt-item {
    display: grid !important;
    gap: 4px !important;
    border-radius: var(--sa-radius-control, 16px) !important;
    padding: 12px !important;
    background: rgba(220, 38, 38, 0.10) !important;
    color: #dc2626 !important;
    font-weight: 900 !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-dashboard-page .dashboard-notice-track {
    display: inline-block !important;
    padding-left: 100% !important;
    animation: smartacctgNoticeMove 14s linear infinite !important;
  }

  @keyframes smartacctgNoticeMove {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @media (max-width: 520px) {
    .smartacctg-dashboard-page .dashboard-summary-grid {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-dashboard-page .feature-grid,
    .smartacctg-dashboard-page .quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .smartacctg-dashboard-page .dashboard-top-card {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-dashboard-page .dashboard-banner-top {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-dashboard-page .dashboard-lang-row {
      justify-content: flex-start !important;
    }

    .smartacctg-dashboard-page .feature-grid {
      gap: 10px !important;
    }

    .smartacctg-dashboard-page .feature-grid button {
      min-height: 76px !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      font-size: clamp(16px, 4vw, 20px) !important;
    }

    .smartacctg-dashboard-page .quick-grid button {
      min-height: 54px !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      font-size: 16px !important;
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

function normalizeThemeKey(value: unknown, fallback: ThemeKey = "deepTeal"): ThemeKey {
  if (isThemeKey(value)) return value;

  if (value === "futureWorld" && isThemeKey("futureForest")) {
    return "futureForest";
  }

  return fallback;
}

function applyThemeToDocument(key: ThemeKey) {
  if (typeof document === "undefined") return;

  const fixedKey = normalizeThemeKey(key);
  const theme = THEMES[fixedKey] || THEMES.deepTeal;

  document.documentElement.setAttribute("data-sa-theme", fixedKey);
  document.documentElement.setAttribute("data-smartacctg-theme", fixedKey);

  document.documentElement.style.setProperty("--sa-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-banner-bg", theme.banner || theme.card);
  document.documentElement.style.setProperty("--sa-card-bg", theme.card);
  document.documentElement.style.setProperty("--sa-panel-bg", theme.panelBg || theme.card);
  document.documentElement.style.setProperty("--sa-item-bg", theme.itemBg || theme.card);
  document.documentElement.style.setProperty("--sa-item-card", theme.itemCard || theme.itemBg || theme.card);
  document.documentElement.style.setProperty("--sa-item-text", theme.itemText || theme.panelText || theme.text);
  document.documentElement.style.setProperty("--sa-input-bg", theme.inputBg || "#ffffff");
  document.documentElement.style.setProperty("--sa-input-text", theme.inputText || "#111827");
  document.documentElement.style.setProperty("--sa-border", theme.border);
  document.documentElement.style.setProperty("--sa-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-text", theme.text);
  document.documentElement.style.setProperty("--sa-panel-text", theme.panelText || theme.text);
  document.documentElement.style.setProperty("--sa-muted", theme.muted || theme.subText || "#64748b");
  document.documentElement.style.setProperty("--sa-sub-text", theme.subText || theme.muted || "#64748b");
  document.documentElement.style.setProperty(
    "--sa-soft-bg",
    theme.softBg || theme.soft || theme.panelBg || theme.card
  );
  document.documentElement.style.setProperty("--sa-glow", theme.glow);

  document.documentElement.style.setProperty("--sa-theme-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-theme-banner", theme.banner || theme.card);
  document.documentElement.style.setProperty("--sa-theme-card", theme.card);
  document.documentElement.style.setProperty("--sa-theme-border", theme.border);
  document.documentElement.style.setProperty("--sa-theme-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-theme-text", theme.text);
  document.documentElement.style.setProperty("--sa-theme-muted", theme.muted || theme.subText || "#64748b");
  document.documentElement.style.setProperty("--sa-theme-glow", theme.glow);
  document.documentElement.style.setProperty("--sa-theme-input-bg", theme.inputBg || "#ffffff");
  document.documentElement.style.setProperty("--sa-theme-input-text", theme.inputText || "#111827");
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

function isUnpaidInvoice(inv: Invoice) {
  const status = String(inv.status || "").toLowerCase();

  if (status === "paid") return false;
  if (status === "cancelled") return false;
  if (status === "canceled") return false;

  return Number(inv.total || 0) > 0;
}

function getDueSortTime(date?: string | null) {
  if (!date) return Number.MAX_SAFE_INTEGER;
  const time = new Date(`${date}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
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

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showRecordSummary, setShowRecordSummary] = useState(false);
  const [showDebtSummary, setShowDebtSummary] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const t = TXT[lang];
  const theme = THEMES[themeKey] || THEMES.deepTeal;

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  useEffect(() => {
    applyThemeToDocument(themeKey);
  }, [themeKey]);

  useEffect(() => {
    const initialLang = getInitialLang();
    const initialTheme = normalizeThemeKey(getThemeKeyFromUrlOrLocalStorage("deepTeal"));

    setLang(initialLang);
    safeLocalSet(LANG_KEY, initialLang);

    setThemeKey(initialTheme);
    applyThemeToDocument(initialTheme);

    init(initialLang, initialTheme);

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
          const trialTheme = normalizeThemeKey(currentTheme, "deepTeal");

          setIsTrial(true);
          setSession(null);
          setProfile(null);
          setThemeKey(trialTheme);

          saveThemeKey(trialTheme);
          applyThemeToDocument(trialTheme);

          setTransactions(safeParseArray<Txn>(safeLocalGet(TRIAL_TX_KEY)));
          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));

          replaceUrlLangTheme(currentLang, trialTheme);
          return;
        }
      } catch {
        // Ignore bad trial data and clear below.
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

    let finalTheme: ThemeKey = "deepTeal";

    if (profileData) {
      const p = profileData as Profile;

      setProfile(p);
      setFullName(p.full_name || "");
      setPhone(p.phone || "");
      setCompanyName(p.company_name || "");
      setCompanyRegNo(p.company_reg_no || "");
      setCompanyPhone(p.company_phone || "");
      setCompanyAddress(p.company_address || "");

      finalTheme = normalizeThemeKey(p.theme, "deepTeal");
    }

    safeLocalRemove(SMARTACCTG_THEME_KEY);
    setThemeKey(finalTheme);
    applyThemeToDocument(finalTheme);
    replaceUrlLangTheme(currentLang, finalTheme);

    await loadDashboardData(userId);
  }

  async function loadDashboardData(userId: string) {
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

  function buildUrl(path: string, extra?: 
