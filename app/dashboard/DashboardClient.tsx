"use client";

import { ChangeEvent, CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  type ThemeKey,
  getThemeKeyFromUrlOrLocalStorage,
  normalizeThemeKey,
  saveThemeKey,
  applyThemeToDocument,
} from "@/lib/smartacctgTheme";

type PageKey = "home" | "accounting" | "customers" | "products" | "invoices" | "records";
type Lang = "zh" | "en" | "ms";
type TxnType = "income" | "expense";

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
  due_date?: string | null;
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

type DebtRow = {
  id: string;
  name: string;
  company?: string;
  amount: number;
  dueDate?: string;
  source: "customer" | "invoice";
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";
const LANG_KEY = "smartacctg_lang";

const TXT = {
  zh: {
    dashboard: "控制台",
    notice: "通知：欢迎使用 SmartAcctg，系统通知会在这里滚动显示……",
    recordsOverview: "记录总览",
    customerDebt: "客户欠款",
    estimatedProfit: "预计利润",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    latestMonth: "最新月份",
    totalDebt: "欠款总额",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    extension: "扩展功能",
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
    back: "返回",
    comingSoon: "开发中",
    extensionTitle: "扩展功能",
    digitalNameCard: "电子名片",
    shopSystem: "网店系统",
    shopDesc: "之后可以给用户订阅开自己的网店、订单系统、产品展示页。",
    dueDate: "到期日",
  },
  en: {
    dashboard: "Dashboard",
    notice: "Notice: SmartAcctg system notifications will appear here...",
    recordsOverview: "Records Overview",
    customerDebt: "Customer Debt",
    estimatedProfit: "Estimated Profit",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    latestMonth: "Latest Month",
    totalDebt: "Total Debt",
    accounting: "Accounting",
    customers: "Customers",
    products: "Products",
    invoices: "Invoices",
    extension: "Extensions",
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
    back: "Back",
    comingSoon: "Coming Soon",
    extensionTitle: "Extensions",
    digitalNameCard: "Digital Name Card",
    shopSystem: "Online Store System",
    shopDesc: "Users can subscribe to create their own online store, order system and product showcase.",
    dueDate: "Due Date",
  },
  ms: {
    dashboard: "Papan Pemuka",
    notice: "Notis: pemberitahuan sistem SmartAcctg akan dipaparkan di sini...",
    recordsOverview: "Ringkasan Rekod",
    customerDebt: "Hutang Pelanggan",
    estimatedProfit: "Anggaran Untung",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    latestMonth: "Bulan Terkini",
    totalDebt: "Jumlah Hutang",
    accounting: "Sistem Akaun",
    customers: "Pelanggan",
    products: "Produk",
    invoices: "Invois",
    extension: "Fungsi Tambahan",
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
    back: "Kembali",
    comingSoon: "Akan Datang",
    extensionTitle: "Fungsi Tambahan",
    digitalNameCard: "Kad Nama Digital",
    shopSystem: "Sistem Kedai Online",
    shopDesc: "Pengguna boleh melanggan untuk buka kedai online, sistem pesanan dan paparan produk sendiri.",
    dueDate: "Tarikh Tamat",
  },
};

const DASHBOARD_FIX_CSS = `
  .smartacctg-dashboard-page .dashboard-card-btn {
    cursor: pointer !important;
  }

  .smartacctg-dashboard-page .dashboard-card-btn:active {
    transform: scale(0.985) !important;
  }

  .smartacctg-dashboard-page .dashboard-summary-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .smartacctg-dashboard-page .dashboard-feature-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .smartacctg-dashboard-page .dashboard-quick-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
    margin-top: 14px !important;
  }

  .smartacctg-dashboard-page .dashboard-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 10px !important;
    align-items: center !important;
    width: 100% !important;
  }

  .smartacctg-dashboard-page .dashboard-row span,
  .smartacctg-dashboard-page .dashboard-row strong {
    font-weight: 900 !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-dashboard-page .dashboard-extension-panel {
    display: grid !important;
    gap: 12px !important;
  }

  .smartacctg-dashboard-page .sa-notice-marquee {
    display: inline-block !important;
    padding-left: 100% !important;
    animation: saNoticeMarquee 14s linear infinite !important;
  }

  @keyframes saNoticeMarquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @media (max-width: 720px) {
    .smartacctg-dashboard-page .dashboard-summary-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 520px) {
    .smartacctg-dashboard-page .dashboard-feature-grid,
    .smartacctg-dashboard-page .dashboard-quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
    }

    .smartacctg-dashboard-page .dashboard-top-card {
      grid-template-columns: 1fr !important;
      align-items: stretch !important;
    }

    .smartacctg-dashboard-page .dashboard-top-actions {
      justify-content: flex-start !important;
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

function isInvoiceUnpaid(inv: Invoice) {
  const status = String(inv.status || "").toLowerCase();
  if (status === "paid" || status === "cancelled" || status === "canceled") return false;
  return Number(inv.total || 0) > 0;
}

function getDateTime(value?: string | null) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const time = new Date(`${String(value).slice(0, 10)}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function applyThemeEverywhere(key: ThemeKey) {
  if (typeof document === "undefined") return;

  const fixedKey = normalizeThemeKey(key);
  const theme = ((THEMES as any)[fixedKey] || (THEMES as any).deepTeal) as any;

  applyThemeToDocument(fixedKey);

  document.documentElement.setAttribute("data-sa-theme", fixedKey);
  document.documentElement.setAttribute("data-smartacctg-theme", fixedKey);

  document.documentElement.style.setProperty("--sa-page-bg", theme.pageBg);
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
  document.documentElement.style.setProperty("--sa-muted", theme.muted || theme.subText);
  document.documentElement.style.setProperty("--sa-sub-text", theme.subText || theme.muted);
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
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showRecordSummary, setShowRecordSummary] = useState(false);
  const [showDebtSummary, setShowDebtSummary] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showExtensions, setShowExtensions] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const t = TXT[lang];
  const theme = ((THEMES as any)[themeKey] || (THEMES as any).deepTeal) as any;

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
          setIsTrial(true);
          setSession(null);
          setProfile(null);

          setTransactions(safeParseArray<Txn>(safeLocalGet(TRIAL_TX_KEY)));
          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));

          setThemeKey(currentTheme);
          saveThemeKey(currentTheme);
          applyThemeEverywhere(currentTheme);
          replaceUrlLangTheme(currentLang, currentTheme);
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

    await supabase.auth.signOut();
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

    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", session.user.id);

    setProfile((p) => (p ? { ...p, avatar_url: data.publicUrl } : p));
    setMsg(t.saved);
  }

  async function saveSettings() {
    if (isTrial) {
      setMsg("免费试用资料不会保存到云端");
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

    if (!session) return;

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
    const months = transactions.map((tx) => getMonthKeyFromDate(tx.txn_date)).filter(Boolean);

    if (months.length === 0) {
      return new Date().toISOString().slice(0, 7);
    }

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

  const debtRows = useMemo<DebtRow[]>(() => {
    const customerRows: DebtRow[] = customers
      .map((c) => {
        const amount = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);

        return {
          id: `customer-${c.id}`,
          name: c.name || "-",
          company: c.company_name || "",
          amount,
          dueDate: c.due_date || c.last_payment_date || "",
          source: "customer" as const,
        };
      })
      .filter((x) => x.amount > 0);

    const invoiceRows: DebtRow[] = invoices
      .filter((inv) => isInvoiceUnpaid(inv))
      .map((inv) => {
        const customer = customers.find((c) => c.id === inv.customer_id);

        return {
          id: `invoice-${inv.id}`,
          name: inv.customer_name || customer?.name || "-",
          company: inv.customer_company || customer?.company_name || "",
          amount: Number(inv.total || 0),
          dueDate: inv.due_date || inv.invoice_date || inv.created_at?.slice(0, 10) || "",
          source: "invoice" as const,
        };
      });

    return [...customerRows, ...invoiceRows].sort((a, b) => {
      const dateA = getDateTime(a.dueDate);
      const dateB = getDateTime(b.dueDate);

      if (dateA !== dateB) return dateA - dateB;
      return b.amount - a.amount;
    });
  }, [customers, invoices]);

  const totalDebt = useMemo(() => {
    return debtRows.reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [debtRows]);

  const topDebt = debtRows[0] || null;

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

                <button type="button" style={menuItemStyle} onClick={logout}>
                  {t.logout}
                </button>
              </div>
            ) : null}
          </div>

          <div style={planTextStyle}>
            {t.expiry}: {expiryText}
          </div>
        </div>

        <div className="dashboard-top-actions" style={topRightStyle}>
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

          <button
            type="button"
            onClick={logout}
            style={{ ...logoutBtnStyle, background: theme.accent }}
          >
            {t.logout}
          </button>
        </div>
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
            }}
          >
            <h1 style={titleStyle}>{t.dashboard}</h1>

            <div style={noticeWrapStyle}>
              <div className="sa-notice-marquee">{t.notice}</div>
            </div>
          </section>

          <section className="dashboard-summary-grid" style={summaryGridStyle}>
            <div
              className="sa-card"
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
                onClick={() => setShowRecordSummary(!showRecordSummary)}
                style={summaryHeaderBtnStyle}
              >
                <span>{t.recordsOverview}</span>
                <strong>{showRecordSummary ? "▲" : "▼"}</strong>
              </button>

              {showRecordSummary ? (
                <div style={summaryDetailListStyle}>
                  <div className="dashboard-row" style={summaryRowStyle}>
                    <span>{t.latestMonth}</span>
                    <strong>{latestMonthKey}</strong>
                  </div>

                  <div className="dashboard-row" style={summaryRowStyle}>
                    <span>{t.balance}</span>
                    <strong style={{ color: theme.accent }}>{formatRM(balance)}</strong>
                  </div>

                  <div className="dashboard-row" style={summaryRowStyle}>
                    <span>{t.monthIncome}</span>
                    <strong style={{ color: "#16a34a" }}>{formatRM(monthIncome)}</strong>
                  </div>

                  <div className="dashboard-row" style={summaryRowStyle}>
                    <span>{t.monthExpense}</span>
                    <strong style={{ color: "#dc2626" }}>{formatRM(monthExpense)}</strong>
                  </div>

                  <div className="dashboard-row" style={summaryRowStyle}>
                    <span>{t.estimatedProfit}</span>
                    <strong style={{ color: estimatedProfit < 0 ? "#dc2626" : theme.accent }}>
                      {formatRM(estimatedProfit)}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="dashboard-row" style={{ ...summaryRowStyle, marginTop: 14 }}>
                  <span>{t.estimatedProfit}</span>
                  <strong style={{ color: estimatedProfit < 0 ? "#dc2626" : theme.accent }}>
                    {formatRM(estimatedProfit)}
                  </strong>
                </div>
              )}
            </div>

            <div
              className="sa-card"
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
                onClick={() => setShowDebtSummary(!showDebtSummary)}
                style={summaryHeaderBtnStyle}
              >
                <span style={{ color: "#dc2626" }}>{t.customerDebt}</span>
                <strong style={{ color: "#dc2626" }}>{showDebtSummary ? "▲" : "▼"}</strong>
              </button>

              {showDebtSummary ? (
                <div style={summaryDetailListStyle}>
                  <div className="dashboard-row" style={summaryRowStyle}>
                    <span>{t.totalDebt}</span>
                    <strong style={{ color: "#dc2626" }}>{formatRM(totalDebt)}</strong>
                  </div>

                  {debtRows.length === 0 ? (
                    <div className="dashboard-row" style={summaryRowStyle}>
                      <span>{t.noDebt}</span>
                      <strong>RM 0.00</strong>
                    </div>
                  ) : (
                    debtRows.map((row) => (
                      <div key={row.id} style={debtItemStyle}>
                        <div style={{ color: "#dc2626", fontWeight: 900 }}>
                          {row.company ? `${row.name} / ${row.company}` : row.name}
                        </div>

                        <div className="dashboard-row" style={summaryRowStyle}>
                          <span>{row.dueDate ? `${t.dueDate}: ${row.dueDate}` : t.customerDebt}</span>
                          <strong style={{ color: "#dc2626" }}>{formatRM(row.amount)}</strong>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 14 }}>
                  {topDebt ? (
                    <>
                      <div style={{ color: "#dc2626", fontWeight: 900 }}>
                        {topDebt.company ? `${topDebt.name} / ${topDebt.company}` : topDebt.name}
                      </div>

                      <div className="dashboard-row" style={summaryRowStyle}>
                        <span>{topDebt.dueDate ? `${t.dueDate}: ${topDebt.dueDate}` : t.customerDebt}</span>
                        <strong style={{ color: "#dc2626" }}>{formatRM(topDebt.amount)}</strong>
                      </div>
                    </>
                  ) : (
                    <div className="dashboard-row" style={summaryRowStyle}>
                      <span>{t.noDebt}</span>
                      <strong>RM 0.00</strong>
                    </div>
                  )}
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
            <button
              type="button"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              style={quickHeaderBtnStyle}
            >
              <span>{t.quick}</span>
              <strong>{showQuickMenu ? "▲" : "▼"}</strong>
            </button>

            {showQuickMenu ? (
              <div className="dashboard-quick-grid">
                <button
                  type="button"
                  onClick={() => goQuick("/dashboard/records")}
                  style={quickBtnStyle(theme)}
                >
                  {t.quickAccounting}
                </button>

                <button
                  type="button"
                  onClick={() => goQuick("/dashboard/invoices")}
                  style={quickBtnStyle(theme)}
                >
                  {t.quickInvoice}
                </button>

                <button
                  type="button"
                  onClick={() => goQuick("/dashboard/customers")}
                  style={quickBtnStyle(theme)}
                >
                  {t.quickCustomer}
                </button>

                <button
                  type="button"
                  onClick={() => goQuick("/dashboard/products")}
                  style={quickBtnStyle(theme)}
                >
                  {t.quickProduct}
                </button>
              </div>
            ) : null}
          </section>

          <section className="dashboard-feature-grid" style={featureGridStyle}>
            <button
              type="button"
              onClick={() => go("/dashboard/records")}
              className="sa-card dashboard-card-btn"
              style={featureBtnStyle(theme)}
            >
              {t.accounting}
            </button>

            <button
              type="button"
              onClick={() => go("/dashboard/customers")}
              className="sa-card dashboard-card-btn"
              style={featureBtnStyle(theme)}
            >
              {t.customers}
            </button>

            <button
              type="button"
              onClick={() => go("/dashboard/products")}
              className="sa-card dashboard-card-btn"
              style={featureBtnStyle(theme)}
            >
              {t.products}
            </button>

            <button
              type="button"
              onClick={() => go("/dashboard/invoices")}
              className="sa-card dashboard-card-btn"
              style={featureBtnStyle(theme)}
            >
              {t.invoices}
            </button>

            <button
              type="button"
              onClick={() => setShowExtensions(!showExtensions)}
              className="sa-card dashboard-card-btn"
              style={featureBtnStyle(theme)}
            >
              {t.extension}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowExtensions(true);
                setMsg(t.shopDesc);
              }}
              className="sa-card dashboard-card-btn"
              style={featureBtnStyle(theme)}
            >
              {t.nkShop}
            </button>
          </section>

          {showExtensions ? (
            <section
              className="sa-card dashboard-extension-panel"
              style={{
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.text,
              }}
            >
              <h2 style={sectionTitleStyle}>{t.extensionTitle}</h2>

              <button
                type="button"
                onClick={() => setMsg(`${t.digitalNameCard} - ${t.comingSoon}`)}
                style={extensionBtnStyle(theme)}
              >
                {t.digitalNameCard}
              </button>

              <button
                type="button"
                onClick={() => setMsg(t.shopDesc)}
                style={extensionBtnStyle(theme)}
              >
                {t.shopSystem}
              </button>

              {msg ? <p style={{ ...msgStyle, color: theme.accent }}>{msg}</p> : null}
            </section>
          ) : null}
        </>
      ) : (
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
      )}

      {showSettings ? (
        <section
          className="sa-card"
          style={{
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <h2 style={sectionTitleStyle}>{t.settings}</h2>

          <h3>{t.personal}</h3>

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

          <h3>{t.company}</h3>

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

          <h3>{t.password}</h3>

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

          {msg ? <p style={{ ...msgStyle, color: theme.accent }}>{msg}</p> : null}
        </section>
      ) : null}

      {showThemes ? (
        <section
          className="sa-card"
          style={{
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <h2 style={sectionTitleStyle}>{t.theme}</h2>

          <div style={themeGridStyle}>
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
              const themeOption = ((THEMES as any)[key] || {}) as any;

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => changeTheme(key)}
                  style={{
                    ...themeBtnStyle,
                    borderColor: themeOption.border || theme.border,
                    background: themeOption.banner || themeOption.card || theme.card,
                    color: themeOption.text || theme.text,
                    boxShadow: themeOption.glow || theme.glow,
                  }}
                >
                  {themeOption.name || key}
                </button>
              );
            })}
          </div>

          {msg ? <p style={{ ...msgStyle, color: theme.accent }}>{msg}</p> : null}
        </section>
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
};

const leftTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const topRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
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
  width: 190,
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
  fontWeight: 900,
  borderRadius: 10,
  color: "#111827",
};

const planTextStyle: CSSProperties = {
  fontWeight: 900,
  lineHeight: 1.25,
  overflowWrap: "anywhere",
};

const logoutBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  fontWeight: 900,
  lineHeight: 1.15,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontWeight: 900,
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "nowrap",
};

const langBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  border: `var(--sa-border-w) solid ${theme.accent}`,
  borderColor: theme.accent,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
  borderRadius: "999px",
  minHeight: 44,
  minWidth: 52,
  padding: "0 12px",
  fontWeight: 900,
});

const noticeWrapStyle: CSSProperties = {
  marginTop: 12,
  overflow: "hidden",
  color: "#dc2626",
  fontWeight: 900,
  whiteSpace: "nowrap",
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
  fontWeight: 900,
  fontSize: "var(--sa-fs-lg)",
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
  fontWeight: 900,
  lineHeight: 1.25,
};

const debtItemStyle: CSSProperties = {
  display: "grid",
  gap: 5,
  paddingTop: 8,
  borderTop: "1px solid rgba(220,38,38,0.25)",
};

const featureGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 14,
};

const featureBtnStyle = (theme: any): CSSProperties => ({
  minHeight: 76,
  fontWeight: 900,
  fontSize: "var(--sa-fs-lg)",
  textAlign: "center",
  background: theme.card,
  borderColor: theme.border,
  boxShadow: theme.glow,
  color: theme.text,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
});

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
  fontWeight: 900,
  fontSize: "var(--sa-fs-lg)",
};

const quickBtnStyle = (theme: any): CSSProperties => ({
  background: theme.inputBg || "#fff",
  border: `var(--sa-border-w) solid ${theme.border}`,
  color: theme.accent,
  borderRadius: "var(--sa-radius-control)",
  minHeight: 58,
  padding: "0 12px",
  fontWeight: 900,
});

const extensionBtnStyle = (theme: any): CSSProperties => ({
  width: "100%",
  minHeight: 60,
  border: `var(--sa-border-w) solid ${theme.border}`,
  borderRadius: "var(--sa-radius-control)",
  background: theme.inputBg || "#fff",
  color: theme.accent,
  padding: "0 14px",
  fontWeight: 900,
});

const backBtnStyle: CSSProperties = {
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
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
  fontWeight: 900,
  minHeight: "var(--sa-control-h)",
  marginBottom: 16,
};

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const themeBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  fontWeight: 900,
};

const msgStyle: CSSProperties = {
  marginTop: 12,
  fontWeight: 900,
  lineHeight: 1.5,
};
