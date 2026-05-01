"use client";

import { ChangeEvent, CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  type ThemeKey,
  applyThemeToDocument,
  getThemeKeyFromUrlOrLocalStorage,
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
  company_logo_url?: string | null;
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
  created_at?: string | null;
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
  source: "customer" | "invoice";
  name: string;
  companyName: string;
  amount: number;
  date: string;
  sortTime: number;
};

type FullscreenModal = "settings" | "themes" | "extensions" | "nkshop" | null;

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";
const LANG_KEY = "smartacctg_lang";

const TXT = {
  zh: {
    dashboard: "控制台",
    notice: "通知：这里显示系统通知、订阅提醒、功能更新……",
    recordsOverview: "记录总览",
    latestMonth: "最新月份",
    customerDebt: "客户欠款",
    estimatedProfit: "预计利润",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    quick: "快速记录 / 开发票",
    quickAccounting: "记账",
    quickInvoice: "发票",
    quickCustomer: "客户",
    quickProduct: "产品",
    extension: "扩展功能",
    nkShop: "NK网店",
    eNameCard: "电子名片",
    onlineStore: "网店系统",
    orderSystem: "订单系统",
    comingSoon: "此功能预留给后续订阅开通",
    expiry: "订阅期限",
    noSub: "未订阅",
    trial: "免费试用",
    logout: "退出",
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
    back: "返回",
    close: "关闭",
    open: "打开",
    totalDebt: "总欠款",
  },
  en: {
    dashboard: "Dashboard",
    notice: "Notice: system notifications, subscription reminders and updates appear here...",
    recordsOverview: "Records Overview",
    latestMonth: "Latest Month",
    customerDebt: "Customer Debt",
    estimatedProfit: "Estimated Profit",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    accounting: "Accounting",
    customers: "Customers",
    products: "Products",
    invoices: "Invoices",
    quick: "Quick Record / Invoice",
    quickAccounting: "Record",
    quickInvoice: "Invoice",
    quickCustomer: "Customer",
    quickProduct: "Product",
    extension: "Extensions",
    nkShop: "NK Shop",
    eNameCard: "E-Name Card",
    onlineStore: "Online Store",
    orderSystem: "Order System",
    comingSoon: "Reserved for future subscription add-ons",
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
    back: "Back",
    close: "Close",
    open: "Open",
    totalDebt: "Total Debt",
  },
  ms: {
    dashboard: "Papan Pemuka",
    notice: "Notis: pemberitahuan sistem, langganan dan kemas kini akan dipaparkan di sini...",
    recordsOverview: "Ringkasan Rekod",
    latestMonth: "Bulan Terkini",
    customerDebt: "Hutang Pelanggan",
    estimatedProfit: "Anggaran Untung",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    accounting: "Sistem Akaun",
    customers: "Pelanggan",
    products: "Produk",
    invoices: "Invois",
    quick: "Rekod Pantas / Invois",
    quickAccounting: "Rekod",
    quickInvoice: "Invois",
    quickCustomer: "Pelanggan",
    quickProduct: "Produk",
    extension: "Fungsi Tambahan",
    nkShop: "Kedai NK",
    eNameCard: "Kad Nama Digital",
    onlineStore: "Sistem Kedai Online",
    orderSystem: "Sistem Pesanan",
    comingSoon: "Disediakan untuk add-on langganan akan datang",
    expiry: "Tarikh Tamat",
    noSub: "Belum Langgan",
    trial: "Percubaan Percuma",
    logout: "Keluar",
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
    back: "Kembali",
    close: "Tutup",
    open: "Buka",
    totalDebt: "Jumlah Hutang",
  },
};

const DASHBOARD_CSS = `
  .smartacctg-dashboard-page,
  .smartacctg-dashboard-page * {
    box-sizing: border-box !important;
  }

  .smartacctg-dashboard-page {
    width: 100% !important;
    max-width: 100vw !important;
    min-height: 100vh !important;
    overflow-x: hidden !important;
    font-weight: 400 !important;
  }

  .smartacctg-dashboard-page h1,
  .smartacctg-dashboard-page h2,
  .smartacctg-dashboard-page h3 {
    font-weight: 900 !important;
  }

  .smartacctg-dashboard-page p,
  .smartacctg-dashboard-page div,
  .smartacctg-dashboard-page span,
  .smartacctg-dashboard-page label {
    font-weight: 400 !important;
  }

  .smartacctg-dashboard-page button,
  .smartacctg-dashboard-page strong {
    font-weight: 800 !important;
  }

  .smartacctg-dashboard-topbar {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 10px !important;
    width: 100% !important;
    overflow-x: auto !important;
    overflow-y: visible !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    margin-bottom: 14px !important;
  }

  .smartacctg-dashboard-topbar::-webkit-scrollbar {
    display: none !important;
  }

  .smartacctg-dashboard-topbar-left,
  .smartacctg-dashboard-topbar-right {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    flex-wrap: nowrap !important;
    min-width: max-content !important;
  }

  .smartacctg-dashboard-page .sa-lang-row {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    flex-wrap: nowrap !important;
  }

  .smartacctg-dashboard-page .sa-lang-btn {
    min-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    border-radius: 999px !important;
    border: var(--sa-border-w, 2px) solid !important;
    padding: 0 10px !important;
    white-space: nowrap !important;
  }

  .smartacctg-dashboard-page input,
  .smartacctg-dashboard-page select,
  .smartacctg-dashboard-page textarea {
    width: 100% !important;
    min-width: 0 !important;
    min-height: var(--sa-control-h, 54px) !important;
    border-radius: var(--sa-radius-control, 16px) !important;
    border: var(--sa-border-w, 2px) solid var(--sa-border, #14b8a6) !important;
    padding: 0 var(--sa-control-x, 14px) !important;
    font-size: 16px !important;
    background: var(--sa-input-bg, #fff) !important;
    color: var(--sa-input-text, #111827) !important;
    outline: none !important;
    font-weight: 400 !important;
  }

  .smartacctg-dashboard-page input[type="date"],
  .smartacctg-dashboard-page input[type="month"],
  .smartacctg-dashboard-page input[type="time"],
  .smartacctg-dashboard-page input[type="datetime-local"] {
    height: var(--sa-control-h, 54px) !important;
    line-height: var(--sa-control-h, 54px) !important;
    text-align: center !important;
    text-align-last: center !important;
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

  .smartacctg-dashboard-summary-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
    margin: 14px 0 !important;
  }

  .smartacctg-dashboard-feature-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
    margin-bottom: 14px !important;
  }

  .smartacctg-dashboard-quick-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
    margin-top: 14px !important;
  }

  .smartacctg-dashboard-fullscreen-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    background: rgba(15, 23, 42, 0.58) !important;
    overflow: hidden !important;
  }

  .smartacctg-dashboard-fullscreen-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-radius: 0 !important;
    padding: max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)) !important;
  }

  .smartacctg-dashboard-modal-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 5 !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 12px !important;
    padding-bottom: 12px !important;
    background: inherit !important;
  }

  .smartacctg-dashboard-close-x {
    border: none !important;
    background: transparent !important;
    color: #dc2626 !important;
    font-size: clamp(18px, 4vw, 24px) !important;
    padding: 8px !important;
  }

  .smartacctg-dashboard-avatar-menu {
    position: absolute !important;
    top: 58px !important;
    left: 0 !important;
    width: 210px !important;
    border-radius: 18px !important;
    padding: 10px !important;
    z-index: 50 !important;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24) !important;
  }

  @media (max-width: 680px) {
    .smartacctg-dashboard-summary-grid {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-dashboard-feature-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .smartacctg-dashboard-topbar {
      align-items: center !important;
    }
  }

  @media (max-width: 390px) {
    .smartacctg-dashboard-feature-grid,
    .smartacctg-dashboard-quick-grid {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-dashboard-page .sa-lang-btn {
      min-width: 40px !important;
      height: 40px !important;
      min-height: 40px !important;
      padding: 0 8px !important;
      font-size: 14px !important;
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

function todayMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getMonthKey(date?: string | null) {
  if (!date) return "";
  return String(date).slice(0, 7);
}

function formatRM(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "zh";

  const q = new URLSearchParams(window.location.search);
  const urlLang = q.get("lang");
  const savedLang = safeLocalGet(LANG_KEY);

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
  const [activeModal, setActiveModal] = useState<FullscreenModal>(null);

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
  const theme = (THEMES[themeKey] || THEMES.deepTeal) as any;
  const themeSubText = theme.subText || theme.muted || "#64748b";

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
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
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          const trialTheme = normalizeThemeKey(currentTheme);

          setIsTrial(true);
          setSession(null);
          setProfile(null);
          setThemeKey(trialTheme);

          saveThemeKey(trialTheme);
          applyThemeEverywhere(trialTheme);

          setTransactions(safeParseArray<Txn>(safeLocalGet(TRIAL_TX_KEY)));
          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));

          replaceUrlLangTheme(currentLang, trialTheme);
          return;
        }
      } catch {
        // Bad trial data, clear below.
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

    setThemeKey(finalTheme);
    saveThemeKey(finalTheme);
    applyThemeEverywhere(finalTheme);
    replaceUrlLangTheme(currentLang, finalTheme);

    await loadAll(userId);
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

  function buildUrl(path: string, extra?: string) {
    const q = new URLSearchParams();

    if (isTrial) q.set("mode", "trial");

    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    if (extra) {
      const extraQ = new URLSearchParams(extra);
      extraQ.forEach((value, key) => q.set(key, value));
    }

    return `${path}?${q.toString()}`;
  }

  function go(path: string, extra?: string) {
    window.location.href = buildUrl(path, extra);
  }

  function goQuick(path: string) {
    go(path, "open=new&fullscreen=1&return=dashboard");
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

    if (!isTrial) {
      await supabase.auth.signOut();
    }

    window.location.href = "/zh";
  }

  async function uploadAvatar(e: ChangeEvent<HTMLInputElement>) {
    if (isTrial) {
      setMsg("免费试用不能上传头像");
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

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", session.user.id);

    if (updateError) {
      setMsg(updateError.message);
      return;
    }

    setProfile((p) => (p ? { ...p, avatar_url: data.publicUrl } : p));
    setMsg(t.saved);
  }

  async function saveSettings() {
    if (isTrial) {
      setMsg("免费试用资料不会保存到云端");
      return;
    }

    if (!session) return;

    const payload = {
      full_name: fullName,
      phone,
      company_name: companyName,
      company_reg_no: companyRegNo,
      company_phone: companyPhone,
      company_address: companyAddress,
    };

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setProfile((p) => (p ? { ...p, ...payload } : p));
    setMsg(t.saved);
  }

  async function changePassword() {
    if (isTrial) {
      setMsg("免费试用没有账号密码");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setMsg("密码至少 6 位");
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
      setMsg("请先登录");
      return;
    }

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

  const latestMonthKey = useMemo(() => {
    const months = transactions.map((tx) => getMonthKey(tx.txn_date)).filter(Boolean);

    if (months.length === 0) return todayMonth();

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
    return monthIncome - monthExpense;
  }, [monthIncome, monthExpense]);

  const debtItems = useMemo<DebtItem[]>(() => {
    const customerDebts: DebtItem[] = customers
      .map((c) => {
        const amount = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);

        return {
          id: `customer-${c.id}`,
          source: "customer" as const,
          name: c.name || "-",
          companyName: c.company_name || "",
          amount,
          date: c.last_payment_date || c.created_at?.slice(0, 10) || "-",
          sortTime: getDueTime(c.last_payment_date || c.created_at?.slice(0, 10)),
        };
      })
      .filter((x) => x.amount > 0);

    const invoiceDebts: DebtItem[] = invoices
      .filter((inv) => isInvoiceUnpaid(inv))
      .map((inv) => ({
        id: `invoice-${inv.id}`,
        source: "invoice" as const,
        name: inv.customer_name || "-",
        companyName: inv.customer_company || "",
        amount: Number(inv.total || 0),
        date: inv.due_date || inv.invoice_date || inv.created_at?.slice(0, 10) || "-",
        sortTime: getDueTime(inv.due_date || inv.invoice_date || inv.created_at?.slice(0, 10)),
      }));

    return [...customerDebts, ...invoiceDebts].sort((a, b) => a.sortTime - b.sortTime);
  }, [customers, invoices]);

  const totalDebt = useMemo(() => {
    return debtItems.reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [debtItems]);

  const topDebtItem = debtItems[0] || null;

  const expiryText = isTrial
    ? t.trial
    : profile?.plan_expiry
      ? new Date(profile.plan_expiry).toLocaleDateString()
      : t.noSub;

  const themeDisplayKeys = useMemo(() => {
    return (Object.keys(THEMES) as ThemeKey[]).filter(
      (key) => String(key) !== "futureWorld"
    );
  }, []);

  function renderTopbar() {
    return (
      <header className="smartacctg-dashboard-topbar">
        <div className="smartacctg-dashboard-topbar-left">
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setShowAvatarMenu((v) => !v)}
              style={avatarBtnStyle}
              aria-label="avatar"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={avatarImgStyle} />
              ) : (
                "👤"
              )}
            </button>

            {showAvatarMenu ? (
              <div
                className="smartacctg-dashboard-avatar-menu"
                style={{
                  background: theme.inputBg || "#ffffff",
                  border: `2px solid ${theme.border}`,
                  color: theme.inputText || "#111827",
                }}
              >
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
                    setActiveModal("settings");
                    setShowAvatarMenu(false);
                    setMsg("");
                  }}
                >
                  {t.settings}
                </button>

                <button
                  type="button"
                  style={menuItemStyle}
                  onClick={() => {
                    setActiveModal("themes");
                    setShowAvatarMenu(false);
                    setMsg("");
                  }}
                >
                  {t.theme}
                </button>

                <button type="button" style={menuItemStyle} onClick={logout}>
                  {t.logout}
                </button>
              </div>
            ) : null}
          </div>

          <div style={{ ...planTextStyle, color: theme.text }}>
            {t.expiry}: {expiryText}
          </div>
        </div>

        <div className="smartacctg-dashboard-topbar-right">
          <button
            type="button"
            onClick={logout}
            style={{
              ...logoutBtnStyle,
              background: theme.accent,
            }}
          >
            {t.logout}
          </button>

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
      </header>
    );
  }

  function renderSettingsModal() {
    if (activeModal !== "settings") return null;

    return (
      <div className="smartacctg-dashboard-fullscreen-overlay">
        <section
          className="smartacctg-dashboard-fullscreen-modal"
          style={{
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div className="smartacctg-dashboard-modal-header">
            <h1 style={modalTitleStyle}>{t.settings}</h1>

            <button
              type="button"
              className="smartacctg-dashboard-close-x"
              onClick={() => setActiveModal(null)}
            >
              {t.close}
            </button>
          </div>

          <section style={modalSectionStyle}>
            <h2>{t.personal}</h2>

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
          </section>

          <section style={modalSectionStyle}>
            <h2>{t.company}</h2>

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

            <button
              type="button"
              onClick={saveSettings}
              style={{ ...primaryBtnStyle, background: theme.accent }}
            >
              {t.save}
            </button>
          </section>

          <section style={modalSectionStyle}>
            <h2>{t.password}</h2>

            <input
              type="password"
              placeholder={t.newPassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={themedInputStyle}
            />

            <button
              type="button"
              onClick={changePassword}
              style={{ ...primaryBtnStyle, background: theme.accent }}
            >
              {t.updatePassword}
            </button>
          </section>

          {msg ? <p style={{ color: theme.accent, fontWeight: 800 }}>{msg}</p> : null}
        </section>
      </div>
    );
  }

  function renderThemesModal() {
    if (activeModal !== "themes") return null;

    return (
      <div className="smartacctg-dashboard-fullscreen-overlay">
        <section
          className="smartacctg-dashboard-fullscreen-modal"
          style={{
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div className="smartacctg-dashboard-modal-header">
            <h1 style={modalTitleStyle}>{t.theme}</h1>

            <button
              type="button"
              className="smartacctg-dashboard-close-x"
              onClick={() => setActiveModal(null)}
            >
              {t.close}
            </button>
          </div>

          <div style={themeGridStyle}>
            {themeDisplayKeys.map((key) => {
              const itemTheme = (THEMES[key] || THEMES.deepTeal) as any;
              const active = normalizeThemeKey(key) === themeKey;

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => changeTheme(key)}
                  style={{
                    ...themeBtnStyle,
                    borderColor: active ? itemTheme.accent : itemTheme.border,
                    background: itemTheme.banner || itemTheme.card,
                    color: itemTheme.text,
                    boxShadow: itemTheme.glow,
                  }}
                >
                  {itemTheme.name || key}
                  {active ? " ✓" : ""}
                </button>
              );
            })}
          </div>

          {msg ? <p style={{ color: theme.accent, fontWeight: 800 }}>{msg}</p> : null}
        </section>
      </div>
    );
  }

  function renderExtensionsModal() {
    if (activeModal !== "extensions") return null;

    return (
      <div className="smartacctg-dashboard-fullscreen-overlay">
        <section
          className="smartacctg-dashboard-fullscreen-modal"
          style={{
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div className="smartacctg-dashboard-modal-header">
            <h1 style={modalTitleStyle}>{t.extension}</h1>

            <button
              type="button"
              className="smartacctg-dashboard-close-x"
              onClick={() => setActiveModal(null)}
            >
              {t.close}
            </button>
          </div>

          <div className="smartacctg-dashboard-feature-grid">
            <button
              type="button"
              style={{
                ...featureBtnStyle,
                background: theme.itemBg || theme.card,
                borderColor: theme.border,
                color: theme.text,
                boxShadow: theme.glow,
              }}
              onClick={() => setMsg(t.comingSoon)}
            >
              {t.eNameCard}
            </button>

            <button
              type="button"
              style={{
                ...featureBtnStyle,
                background: theme.itemBg || theme.card,
                borderColor: theme.border,
                color: theme.text,
                boxShadow: theme.glow,
              }}
              onClick={() => setMsg(t.comingSoon)}
            >
              {t.onlineStore}
            </button>
          </div>

          <section
            className="sa-card"
            style={{
              ...infoBoxStyle,
              background: theme.panelBg || theme.card,
              borderColor: theme.border,
              color: theme.panelText || theme.text,
            }}
          >
            <h2>{t.onlineStore}</h2>
            <p>{t.comingSoon}</p>
          </section>

          {msg ? <p style={{ color: theme.accent, fontWeight: 800 }}>{msg}</p> : null}
        </section>
      </div>
    );
  }

  function renderNkShopModal() {
    if (activeModal !== "nkshop") return null;

    return (
      <div className="smartacctg-dashboard-fullscreen-overlay">
        <section
          className="smartacctg-dashboard-fullscreen-modal"
          style={{
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div className="smartacctg-dashboard-modal-header">
            <h1 style={modalTitleStyle}>{t.nkShop}</h1>

            <button
              type="button"
              className="smartacctg-dashboard-close-x"
              onClick={() => setActiveModal(null)}
            >
              {t.close}
            </button>
          </div>

          <section
            className="sa-card"
            style={{
              ...infoBoxStyle,
              background: theme.panelBg || theme.card,
              borderColor: theme.border,
              color: theme.panelText || theme.text,
            }}
          >
            <h2>{t.nkShop}</h2>
            <p>{t.comingSoon}</p>

            <div className="smartacctg-dashboard-feature-grid">
              <button
                type="button"
                style={{
                  ...quickBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  background: theme.inputBg,
                }}
              >
                {t.onlineStore}
              </button>

              <button
                type="button"
                style={{
                  ...quickBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  background: theme.inputBg,
                }}
              >
                {t.orderSystem}
              </button>
            </div>
          </section>
        </section>
      </div>
    );
  }

  return (
    <main
      className="smartacctg-page smartacctg-dashboard-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{DASHBOARD_CSS}</style>

      {renderTopbar()}

      {page === "home" ? (
        <>
          <section
            className="sa-card"
            style={{
              background: theme.banner || theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <h1 style={titleStyle}>{t.dashboard}</h1>

            <div style={noticeWrapStyle}>
              <div style={noticeMarqueeStyle}>{t.notice}</div>
            </div>
          </section>

          <section className="smartacctg-dashboard-summary-grid">
            <div
              className="sa-card dashboard-stat-card"
              style={{
                ...summaryBoxStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              <button
                type="button"
                onClick={() => setShowRecordSummary((v) => !v)}
                style={summaryHeaderBtnStyle}
              >
                <span>{t.recordsOverview}</span>
                <strong>{showRecordSummary ? "▲" : "▼"}</strong>
              </button>

              {showRecordSummary ? (
                <div style={summaryDetailListStyle}>
                  <div style={{ ...smallNoteStyle, color: themeSubText }}>
                    {t.latestMonth}: {latestMonthKey}
                  </div>

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
                    <strong style={{ color: estimatedProfit < 0 ? "#dc2626" : theme.accent }}>
                      {formatRM(estimatedProfit)}
                    </strong>
                  </div>
                </div>
              ) : (
                <div style={summaryRowStyle}>
                  <span>{t.estimatedProfit}</span>
                  <strong style={{ color: estimatedProfit < 0 ? "#dc2626" : theme.accent }}>
                    {formatRM(estimatedProfit)}
                  </strong>
                </div>
              )}
            </div>

            <div
              className="sa-card dashboard-stat-card"
              style={{
                ...summaryBoxStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              <button
                type="button"
                onClick={() => setShowDebtSummary((v) => !v)}
                style={summaryHeaderBtnStyle}
              >
                <span>{t.customerDebt}</span>
                <strong>{showDebtSummary ? "▲" : "▼"}</strong>
              </button>

              {showDebtSummary ? (
                <div style={summaryDetailListStyle}>
                  <div style={summaryRowStyle}>
                    <span>{t.totalDebt}</span>
                    <strong style={{ color: totalDebt > 0 ? "#dc2626" : theme.accent }}>
                      {formatRM(totalDebt)}
                    </strong>
                  </div>

                  {debtItems.length === 0 ? (
                    <div style={summaryRowStyle}>
                      <span>{t.noDebt}</span>
                      <strong>{formatRM(0)}</strong>
                    </div>
                  ) : (
                    debtItems.map((item) => (
                      <div key={item.id} style={debtItemStyle}>
                        <div>
                          <strong>
                            {item.name}
                            {item.companyName ? ` / ${item.companyName}` : ""}
                          </strong>
                          <div style={{ ...smallNoteStyle, color: themeSubText }}>
                            {item.date}
                          </div>
                        </div>

                        <strong style={{ color: "#dc2626" }}>{formatRM(item.amount)}</strong>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div style={summaryRowStyle}>
                  <span>
                    {topDebtItem
                      ? `${topDebtItem.name}${topDebtItem.companyName ? ` / ${topDebtItem.companyName}` : ""}`
                      : t.noDebt}
                  </span>

                  <strong style={{ color: topDebtItem ? "#dc2626" : theme.accent }}>
                    {formatRM(topDebtItem?.amount || 0)}
                  </strong>
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
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() => setShowQuickMenu((v) => !v)}
              style={quickHeaderBtnStyle}
            >
              <span>{t.quick}</span>
              <strong>{showQuickMenu ? "▲" : "▼"}</strong>
            </button>

            {showQuickMenu ? (
              <div className="smartacctg-dashboard-quick-grid">
                <button
                  type="button"
                  onClick={() => goQuick("/dashboard/records")}
                  style={{
                    ...quickBtnStyle,
                    borderColor: theme.border,
                    color: theme.accent,
                    background: theme.inputBg,
                  }}
                >
                  {t.quickAccounting}
                </button>

                <button
                  type="button"
                  onClick={() => goQuick("/dashboard/invoices")}
                  style={{
                    ...quickBtnStyle,
                    borderColor: theme.border,
                    color: theme.accent,
                    background: theme.inputBg,
                  }}
                >
                  {t.quickInvoice}
                </button>

                <button
                  type="button"
                  onClick={() => goQuick("/dashboard/customers")}
                  style={{
                    ...quickBtnStyle,
                    borderColor: theme.border,
                    color: theme.accent,
                    background: theme.inputBg,
                  }}
                >
                  {t.quickCustomer}
                </button>

                <button
                  type="button"
                  onClick={() => goQuick("/dashboard/products")}
                  style={{
                    ...quickBtnStyle,
                    borderColor: theme.border,
                    color: theme.accent,
                    background: theme.inputBg,
                  }}
                >
                  {t.quickProduct}
                </button>
              </div>
            ) : null}
          </section>

          <section className="smartacctg-dashboard-feature-grid">
            <button
              type="button"
              onClick={() => go("/dashboard/records")}
              className="sa-card"
              style={{
                ...featureBtnStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              {t.accounting}
            </button>

            <button
              type="button"
              onClick={() => go("/dashboard/customers")}
              className="sa-card"
              style={{
                ...featureBtnStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              {t.customers}
            </button>

            <button
              type="button"
              onClick={() => go("/dashboard/products")}
              className="sa-card"
              style={{
                ...featureBtnStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              {t.products}
            </button>

            <button
              type="button"
              onClick={() => go("/dashboard/invoices")}
              className="sa-card"
              style={{
                ...featureBtnStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              {t.invoices}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveModal("extensions");
                setMsg("");
              }}
              className="sa-card"
              style={{
                ...featureBtnStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              {t.extension}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveModal("nkshop");
                setMsg("");
              }}
              className="sa-card"
              style={{
                ...featureBtnStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              {t.nkShop}
            </button>
          </section>
        </>
      ) : null}

      {page !== "home" ? (
        <section
          className="sa-card"
          style={{
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <button
            type="button"
            onClick={() => go("/dashboard")}
            style={{
              ...backBtnStyle,
              borderColor: theme.border,
              color: theme.accent,
              background: theme.inputBg,
            }}
          >
            ← {t.back}
          </button>

          <h1 style={titleStyle}>
            {page === "records" && t.accounting}
            {page === "accounting" && t.accounting}
            {page === "customers" && t.customers}
            {page === "products" && t.products}
            {page === "invoices" && t.invoices}
          </h1>
        </section>
      ) : null}

      {renderSettingsModal()}
      {renderThemesModal()}
      {renderExtensionsModal()}
      {renderNkShopModal()}
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
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const avatarImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const menuItemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  border: "none",
  background: "transparent",
  textAlign: "left",
  borderRadius: 12,
  color: "inherit",
  cursor: "pointer",
};

const planTextStyle: CSSProperties = {
  lineHeight: 1.25,
  overflowWrap: "anywhere",
  whiteSpace: "nowrap",
  fontSize: "clamp(13px, 3vw, 16px)",
};

const logoutBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  padding: "0 14px",
  minHeight: 44,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const langBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  borderColor: theme.accent,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
});

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.15,
  fontWeight: 900,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.15,
  fontWeight: 900,
};

const noticeWrapStyle: CSSProperties = {
  marginTop: 12,
  overflow: "hidden",
  color: "#dc2626",
  whiteSpace: "nowrap",
};

const noticeMarqueeStyle: CSSProperties = {
  display: "inline-block",
  paddingLeft: "100%",
  animation: "saNoticeMarquee 12s linear infinite",
};

const summaryBoxStyle: CSSProperties = {
  minHeight: 0,
  padding: "clamp(14px, 3vw, 22px)",
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

const debtItemStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "start",
  lineHeight: 1.35,
};

const smallNoteStyle: CSSProperties = {
  fontSize: "var(--sa-fs-sm)",
  lineHeight: 1.35,
};

const featureBtnStyle: CSSProperties = {
  minHeight: 74,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  fontSize: "var(--sa-fs-lg)",
  textAlign: "center",
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

const quickBtnStyle: CSSProperties = {
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  minHeight: 56,
  padding: "0 12px",
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
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
};

const primaryBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  padding: "0 18px",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  marginBottom: 16,
};

const modalSectionStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  marginBottom: 22,
};

const themeGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const themeBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  minHeight: 88,
  fontSize: "var(--sa-fs-base)",
};

const infoBoxStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  marginTop: 14,
};
