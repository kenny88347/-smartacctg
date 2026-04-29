"use client";

import { CSSProperties, ChangeEvent, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type PageKey = "home" | "accounting" | "customers" | "products" | "invoices" | "records";
type Lang = "zh" | "en" | "ms";
type ThemeKey = "pink" | "blackGold" | "lightRed" | "nature" | "sky" | "deepTeal";

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
  txn_date: string;
  txn_type: "income" | "expense";
  amount: number;
  category_name?: string | null;
  note?: string | null;
};

type CustomerDebt = {
  id: string;
  name: string | null;
  debt_amount?: number | null;
  paid_amount?: number | null;
  last_payment_date?: string | null;
  status?: string | null;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";

const LANG_KEY = "smartacctg_lang";
const THEME_KEY = "smartacctg_theme";

const TXT = {
  zh: {
    dashboard: "控制台",
    records: "记录明细",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    expectedProfit: "预计利润",
    showAllRecords: "看全部记录",
    hideAllRecords: "收起记录",
    customerDebt: "客户欠款",
    showAllDebt: "查看欠款",
    hideAllDebt: "收起欠款",
    noDebt: "暂无客户欠款",
    noRecord: "还没有记录",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    pageMenu: "页面菜单",
    quickRecordInvoice: "快速纪录/开发票",
    quickRecord: "记账",
    quickInvoice: "发票",
    quickCustomer: "客户",
    quickProduct: "产品",
    notification: "通知：之后你有什么系统通知，这里会显示；如果文字太长，会自动慢跑显示。",
    back: "返回",
    changeAvatar: "更换头像",
    settings: "设置",
    theme: "主题切换",
    logout: "退出登录",
    expiry: "订阅期限",
    noSub: "未订阅",
    trial: "免费试用",
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
    income: "收入",
    expense: "支出",
  },
  en: {
    dashboard: "Dashboard",
    records: "Records",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    expectedProfit: "Estimated Profit",
    showAllRecords: "Show All Records",
    hideAllRecords: "Hide Records",
    customerDebt: "Customer Debt",
    showAllDebt: "View Debt",
    hideAllDebt: "Hide Debt",
    noDebt: "No customer debt",
    noRecord: "No records yet",
    accounting: "Accounting",
    customers: "Customers",
    products: "Products",
    invoices: "Invoices",
    pageMenu: "Page Menu",
    quickRecordInvoice: "Quick Record/Invoice",
    quickRecord: "Record",
    quickInvoice: "Invoice",
    quickCustomer: "Customer",
    quickProduct: "Product",
    notification:
      "Notice: Future system notifications will appear here. Long messages will scroll automatically.",
    back: "Back",
    changeAvatar: "Change Avatar",
    settings: "Settings",
    theme: "Theme",
    logout: "Logout",
    expiry: "Expiry",
    noSub: "Not Subscribed",
    trial: "Free Trial",
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
    income: "Income",
    expense: "Expense",
  },
  ms: {
    dashboard: "Papan Pemuka",
    records: "Rekod",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    expectedProfit: "Anggaran Untung",
    showAllRecords: "Papar Semua Rekod",
    hideAllRecords: "Tutup Rekod",
    customerDebt: "Hutang Pelanggan",
    showAllDebt: "Lihat Hutang",
    hideAllDebt: "Tutup Hutang",
    noDebt: "Tiada hutang pelanggan",
    noRecord: "Tiada rekod",
    accounting: "Sistem Akaun",
    customers: "Pelanggan",
    products: "Produk",
    invoices: "Invois",
    pageMenu: "Menu Halaman",
    quickRecordInvoice: "Rekod/Invois Pantas",
    quickRecord: "Rekod",
    quickInvoice: "Invois",
    quickCustomer: "Pelanggan",
    quickProduct: "Produk",
    notification:
      "Notis: Notifikasi sistem akan dipaparkan di sini. Mesej panjang akan bergerak automatik.",
    back: "Kembali",
    changeAvatar: "Tukar Avatar",
    settings: "Tetapan",
    theme: "Tema",
    logout: "Log Keluar",
    expiry: "Tarikh Tamat",
    noSub: "Belum Langgan",
    trial: "Percubaan Percuma",
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
    income: "Pendapatan",
    expense: "Perbelanjaan",
  },
};

const THEMES: Record<ThemeKey, any> = {
  deepTeal: {
    name: "深青色",
    pageBg: "#ecfdf5",
    banner: "#ffffff",
    card: "#ffffff",
    border: "#14b8a6",
    glow:
      "0 0 0 1px rgba(20,184,166,0.42), 0 0 18px rgba(45,212,191,0.55), 0 18px 42px rgba(15,118,110,0.25)",
    accent: "#0f766e",
    text: "#064e3b",
  },
  pink: {
    name: "可愛粉色",
    pageBg: "#fff7fb",
    banner: "linear-gradient(135deg,#ffd6e7,#fff1f2)",
    card: "#ffffff",
    border: "#f472b6",
    glow:
      "0 0 0 1px rgba(244,114,182,0.36), 0 0 18px rgba(244,114,182,0.45), 0 18px 38px rgba(244,114,182,0.22)",
    accent: "#db2777",
    text: "#4a044e",
  },
  blackGold: {
    name: "黑金商務",
    pageBg: "#111111",
    banner: "linear-gradient(135deg,#111111,#3b2f16)",
    card: "#1f1f1f",
    border: "#facc15",
    glow:
      "0 0 0 1px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.45), 0 18px 42px rgba(250,204,21,0.22)",
    accent: "#d4af37",
    text: "#fff7ed",
  },
  lightRed: {
    name: "可愛淺紅",
    pageBg: "#fff1f2",
    banner: "linear-gradient(135deg,#fecdd3,#ffe4e6)",
    card: "#ffffff",
    border: "#fb7185",
    glow:
      "0 0 0 1px rgba(251,113,133,0.45), 0 0 20px rgba(251,113,133,0.5), 0 18px 38px rgba(251,113,133,0.26)",
    accent: "#e11d48",
    text: "#881337",
  },
  nature: {
    name: "風景自然系",
    pageBg: "#f0fdf4",
    banner: "linear-gradient(135deg,#d9f99d,#bae6fd)",
    card: "#ffffff",
    border: "#22d3ee",
    glow:
      "0 0 0 1px rgba(34,211,238,0.42), 0 0 18px rgba(34,211,238,0.42), 0 18px 38px rgba(34,211,238,0.22)",
    accent: "#0f766e",
    text: "#14532d",
  },
  sky: {
    name: "天空藍",
    pageBg: "#eff6ff",
    banner: "linear-gradient(135deg,#bfdbfe,#e0f2fe)",
    card: "#ffffff",
    border: "#38bdf8",
    glow:
      "0 0 0 1px rgba(56,189,248,0.42), 0 0 18px rgba(56,189,248,0.48), 0 18px 38px rgba(56,189,248,0.24)",
    accent: "#0284c7",
    text: "#0f172a",
  },
};

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

export default function DashboardClient({ page }: { page: PageKey }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [customers, setCustomers] = useState<CustomerDebt[]>([]);

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const [showAllRecords, setShowAllRecords] = useState(false);
  const [showAllDebt, setShowAllDebt] = useState(false);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const [recordView, setRecordView] = useState<"balance" | "income" | "expense">("balance");

  const t = TXT[lang];
  const theme = THEMES[themeKey];

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);

    const urlLang = q.get("lang") as Lang | null;
    const savedLang = safeLocalGet(LANG_KEY) as Lang | null;
    const view = q.get("view") as "balance" | "income" | "expense" | null;

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

    if (view === "balance" || view === "income" || view === "expense") {
      setRecordView(view);
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
        setProfile(null);

        const savedTx = safeLocalGet(TRIAL_TX_KEY);
        const savedCustomers = safeLocalGet(TRIAL_CUSTOMERS_KEY);

        setTransactions(savedTx ? JSON.parse(savedTx) : []);
        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);

        return;
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_TX_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
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

    if (profileData) {
      setProfile(profileData as Profile);
      setFullName(profileData.full_name || "");
      setPhone(profileData.phone || "");
      setCompanyName(profileData.company_name || "");
      setCompanyRegNo(profileData.company_reg_no || "");
      setCompanyPhone(profileData.company_phone || "");
      setCompanyAddress(profileData.company_address || "");

      if (profileData.theme && THEMES[profileData.theme as ThemeKey]) {
        setThemeKey(profileData.theme as ThemeKey);
        safeLocalSet(THEME_KEY, profileData.theme);
      }
    }

    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("txn_date", { ascending: false });

    setTransactions((txData || []) as Txn[]);

    const { data: customerData } = await supabase
      .from("customers")
      .select("id,name,debt_amount,paid_amount,last_payment_date,status")
      .eq("user_id", userId)
      .order("last_payment_date", { ascending: true });

    setCustomers((customerData || []) as CustomerDebt[]);
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

  function goBack() {
    go("/dashboard");
  }

  function goRecords(view: "balance" | "income" | "expense") {
    go("/dashboard/records", `view=${view}`);
  }

  function quickAdd(path: string) {
    go(path, "quickAdd=1&action=new&openForm=1");
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

  async function logout() {
    safeLocalRemove(TRIAL_KEY);
    safeLocalRemove(TRIAL_TX_KEY);
    safeLocalRemove(TRIAL_CUSTOMERS_KEY);
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
    setThemeKey(key);
    safeLocalSet(THEME_KEY, key);

    if (!isTrial && session) {
      await supabase.from("profiles").update({ theme: key }).eq("id", session.user.id);
    }
  }

  const monthKey = new Date().toISOString().slice(0, 7);

  const monthIncome = useMemo(() => {
    return transactions
      .filter((x) => x.txn_date?.startsWith(monthKey) && x.txn_type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [transactions, monthKey]);

  const monthExpense = useMemo(() => {
    return transactions
      .filter((x) => x.txn_date?.startsWith(monthKey) && x.txn_type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [transactions, monthKey]);

  const balance = useMemo(() => {
    return transactions.reduce((s, x) => {
      return x.txn_type === "income" ? s + Number(x.amount || 0) : s - Number(x.amount || 0);
    }, 0);
  }, [transactions]);

  const expectedProfit = monthIncome - monthExpense;

  const debtCustomers = useMemo(() => {
    return customers
      .map((c) => {
        const debt = Number(c.debt_amount || 0);
        const paid = Number(c.paid_amount || 0);
        const balanceDebt = Math.max(debt - paid, 0);

        return {
          ...c,
          balanceDebt,
        };
      })
      .filter((c) => c.balanceDebt > 0)
      .sort((a, b) => {
        const da = a.last_payment_date || "1900-01-01";
        const db = b.last_payment_date || "1900-01-01";
        return da.localeCompare(db);
      });
  }, [customers]);

  const firstDebtCustomer = debtCustomers[0];

  const expiryText = isTrial
    ? t.trial
    : profile?.plan_expiry
      ? new Date(profile.plan_expiry).toLocaleDateString()
      : t.noSub;

  const filteredRecords = transactions.filter((x) => {
    if (recordView === "income") return x.txn_type === "income";
    if (recordView === "expense") return x.txn_type === "expense";
    return true;
  });

  return (
    <main
      className="smartacctg-page smartacctg-dashboard-page"
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style>{`
        @keyframes smartacctg-notice-marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      <header className="sa-topbar" style={headerStyle}>
        <div className="sa-topbar-left" style={leftTopStyle}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMenu(!showMenu)} style={avatarBtnStyle}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={avatarImgStyle} />
              ) : (
                "👤"
              )}
            </button>

            {showMenu ? (
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
                  style={menuItemStyle}
                  onClick={() => {
                    setShowSettings(true);
                    setShowThemes(false);
                    setShowMenu(false);
                  }}
                >
                  {t.settings}
                </button>

                <button
                  style={menuItemStyle}
                  onClick={() => {
                    setShowThemes(true);
                    setShowSettings(false);
                    setShowMenu(false);
                  }}
                >
                  {t.theme}
                </button>

                <button style={menuItemStyle} onClick={logout}>
                  {t.logout}
                </button>
              </div>
            ) : null}
          </div>

          <div style={planTextStyle}>
            {t.expiry}: {expiryText}
          </div>
        </div>

        <button onClick={logout} style={{ ...logoutBtnStyle, background: theme.accent }}>
          {t.logout}
        </button>
      </header>

      {page === "home" ? (
        <>
          <section
            className="sa-card"
            style={{
              background: theme.banner,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div style={bannerTopRowStyle}>
              <h1 style={titleStyle}>{t.dashboard}</h1>

              <div className="sa-lang-row" style={langRowStyle}>
                <button
                  onClick={() => switchLang("zh")}
                  className="sa-lang-btn"
                  style={langBtn(lang === "zh", theme)}
                >
                  中文
                </button>

                <button
                  onClick={() => switchLang("en")}
                  className="sa-lang-btn"
                  style={langBtn(lang === "en", theme)}
                >
                  EN
                </button>

                <button
                  onClick={() => switchLang("ms")}
                  className="sa-lang-btn"
                  style={langBtn(lang === "ms", theme)}
                >
                  BM
                </button>
              </div>
            </div>

            <div style={noticeBoxStyle}>
              <div style={noticeMarqueeStyle}>
                {isTrial ? "免费试用模式：20 分钟后会自动失效 ｜ " : ""}
                {t.notification}
              </div>
            </div>
          </section>

          <section style={dashboardTwoColStyle}>
            <div
              className="sa-card"
              style={{
                ...dropCardStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
              }}
            >
              <button
                type="button"
                onClick={() => setShowAllRecords(!showAllRecords)}
                style={{ ...dropHeadStyle, color: theme.accent }}
              >
                <span>{showAllRecords ? t.hideAllRecords : t.showAllRecords}</span>
                <span>{showAllRecords ? "▲" : "▼"}</span>
              </button>

              <div style={dropBodyStyle}>
                {!showAllRecords ? (
                  <button
                    type="button"
                    onClick={() => goRecords("income")}
                    style={dropRowBtnStyle}
                  >
                    <span>{t.expectedProfit}</span>
                    <strong style={{ color: expectedProfit >= 0 ? "#16a34a" : "#dc2626" }}>
                      RM {expectedProfit.toFixed(2)}
                    </strong>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => goRecords("balance")}
                      style={dropRowBtnStyle}
                    >
                      <span>{t.balance}</span>
                      <strong style={{ color: theme.accent }}>RM {balance.toFixed(2)}</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => goRecords("income")}
                      style={dropRowBtnStyle}
                    >
                      <span>{t.monthIncome}</span>
                      <strong style={{ color: "#16a34a" }}>RM {monthIncome.toFixed(2)}</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => goRecords("expense")}
                      style={dropRowBtnStyle}
                    >
                      <span>{t.monthExpense}</span>
                      <strong style={{ color: "#dc2626" }}>RM {monthExpense.toFixed(2)}</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => goRecords("income")}
                      style={dropRowBtnStyle}
                    >
                      <span>{t.expectedProfit}</span>
                      <strong style={{ color: expectedProfit >= 0 ? "#16a34a" : "#dc2626" }}>
                        RM {expectedProfit.toFixed(2)}
                      </strong>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div
              className="sa-card"
              style={{
                ...dropCardStyle,
                background: theme.card,
                borderColor: theme.border,
                boxShadow: theme.glow,
              }}
            >
              <button
                type="button"
                onClick={() => setShowAllDebt(!showAllDebt)}
                style={{ ...dropHeadStyle, color: theme.accent }}
              >
                <span>{t.customerDebt}</span>
                <span>{showAllDebt ? "▲" : "▼"}</span>
              </button>

              <div style={dropBodyStyle}>
                {debtCustomers.length === 0 ? (
                  <div style={emptyTextStyle}>{t.noDebt}</div>
                ) : !showAllDebt ? (
                  <button
                    type="button"
                    onClick={() => go("/dashboard/customers")}
                    style={dropRowBtnStyle}
                  >
                    <span>{firstDebtCustomer?.name || "-"}</span>
                    <strong style={{ color: "#dc2626" }}>
                      RM {Number(firstDebtCustomer?.balanceDebt || 0).toFixed(2)}
                    </strong>
                  </button>
                ) : (
                  debtCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => go("/dashboard/customers")}
                      style={dropRowBtnStyle}
                    >
                      <span>{c.name || "-"}</span>
                      <strong style={{ color: "#dc2626" }}>
                        RM {Number(c.balanceDebt || 0).toFixed(2)}
                      </strong>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="dashboard-menu-grid" style={menuGridStyle}>
            <button
              onClick={() => go("/dashboard/records")}
              className="sa-card"
              style={{
                ...navBtnStyle,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.accent,
              }}
            >
              {t.accounting}
            </button>

            <button
              onClick={() => go("/dashboard/customers")}
              className="sa-card"
              style={{
                ...navBtnStyle,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.accent,
              }}
            >
              {t.customers}
            </button>

            <button
              onClick={() => go("/dashboard/products")}
              className="sa-card"
              style={{
                ...navBtnStyle,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.accent,
              }}
            >
              {t.products}
            </button>

            <button
              onClick={() => go("/dashboard/invoices")}
              className="sa-card"
              style={{
                ...navBtnStyle,
                borderColor: theme.border,
                boxShadow: theme.glow,
                color: theme.accent,
              }}
            >
              {t.invoices}
            </button>
          </section>

          <div style={bottomBarStyle}>
            <div style={bottomMenuWrapStyle}>
              {showBottomMenu ? (
                <div
                  className="sa-card"
                  style={{
                    ...bottomPopStyle,
                    left: 0,
                    background: theme.card,
                    borderColor: theme.border,
                    boxShadow: theme.glow,
                  }}
                >
                  <button onClick={() => go("/dashboard/records")} style={bottomPopBtnStyle}>
                    {t.accounting}
                  </button>
                  <button onClick={() => go("/dashboard/customers")} style={bottomPopBtnStyle}>
                    {t.customers}
                  </button>
                  <button onClick={() => go("/dashboard/products")} style={bottomPopBtnStyle}>
                    {t.products}
                  </button>
                  <button onClick={() => go("/dashboard/invoices")} style={bottomPopBtnStyle}>
                    {t.invoices}
                  </button>
                </div>
              ) : null}

              {showQuickMenu ? (
                <div
                  className="sa-card"
                  style={{
                    ...bottomPopStyle,
                    right: 0,
                    background: theme.card,
                    borderColor: theme.border,
                    boxShadow: theme.glow,
                  }}
                >
                  <button
                    onClick={() => quickAdd("/dashboard/records")}
                    style={bottomPopBtnStyle}
                  >
                    {t.quickRecord}
                  </button>
                  <button
                    onClick={() => quickAdd("/dashboard/invoices")}
                    style={bottomPopBtnStyle}
                  >
                    {t.quickInvoice}
                  </button>
                  <button
                    onClick={() => quickAdd("/dashboard/customers")}
                    style={bottomPopBtnStyle}
                  >
                    {t.quickCustomer}
                  </button>
                  <button
                    onClick={() => quickAdd("/dashboard/products")}
                    style={bottomPopBtnStyle}
                  >
                    {t.quickProduct}
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setShowBottomMenu(!showBottomMenu);
                  setShowQuickMenu(false);
                }}
                style={{
                  ...bottomMainBtnStyle,
                  background: theme.card,
                  color: theme.accent,
                  borderColor: theme.border,
                }}
              >
                {t.pageMenu}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(!showQuickMenu);
                  setShowBottomMenu(false);
                }}
                style={{
                  ...bottomMainBtnStyle,
                  background: theme.accent,
                  color: "#fff",
                  borderColor: theme.accent,
                }}
              >
                {t.quickRecordInvoice}
              </button>
            </div>
          </div>
        </>
      ) : null}

      {page === "records" ? (
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
            onClick={goBack}
            className="sa-back-btn"
            style={{ ...backBtnStyle, borderColor: theme.border, color: theme.accent }}
          >
            ← {t.back}
          </button>

          <h1>{t.records}</h1>

          <div style={recordFilterRowStyle}>
            <button
              onClick={() => setRecordView("balance")}
              style={filterBtn(recordView === "balance", theme)}
            >
              {t.balance}
            </button>
            <button
              onClick={() => setRecordView("income")}
              style={filterBtn(recordView === "income", theme)}
            >
              {t.income}
            </button>
            <button
              onClick={() => setRecordView("expense")}
              style={filterBtn(recordView === "expense", theme)}
            >
              {t.expense}
            </button>
          </div>

          {filteredRecords.length === 0 ? (
            <p>{t.noRecord}</p>
          ) : (
            filteredRecords.map((x) => (
              <div key={x.id} style={recordItemStyle}>
                <div>
                  <strong>{x.txn_type === "income" ? t.income : t.expense}</strong>
                  <div>{x.txn_date}</div>
                  <div>
                    {x.category_name || ""} {x.note || ""}
                  </div>
                </div>

                <strong style={{ color: x.txn_type === "income" ? "#16a34a" : "#dc2626" }}>
                  RM {Number(x.amount || 0).toFixed(2)}
                </strong>
              </div>
            ))
          )}
        </section>
      ) : null}

      {page !== "home" && page !== "records" ? (
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
            onClick={goBack}
            className="sa-back-btn"
            style={{ ...backBtnStyle, borderColor: theme.border, color: theme.accent }}
          >
            ← {t.back}
          </button>

          <h1>
            {page === "accounting" && t.accounting}
            {page === "customers" && t.customers}
            {page === "products" && t.products}
            {page === "invoices" && t.invoices}
          </h1>

          <p>这里是独立页面内容。</p>
        </section>
      ) : null}

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
          <h2>{t.settings}</h2>

          <h3>{t.personal}</h3>
          <input
            placeholder={t.name}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder={t.phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          <h3>{t.company}</h3>
          <input
            placeholder={t.companyName}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder={t.ssm}
            value={companyRegNo}
            onChange={(e) => setCompanyRegNo(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder={t.companyPhone}
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder={t.companyAddress}
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            style={inputStyle}
          />

          <button onClick={saveSettings} style={{ ...primaryBtnStyle, background: theme.accent }}>
            {t.save}
          </button>

          <h3>{t.password}</h3>
          <input
            type="password"
            placeholder={t.newPassword}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />

          <button onClick={changePassword} style={{ ...primaryBtnStyle, background: theme.accent }}>
            {t.updatePassword}
          </button>

          {msg ? <p style={{ color: theme.accent, fontWeight: 900 }}>{msg}</p> : null}
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
          <h2>{t.theme}</h2>

          <div style={themeGridStyle}>
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
              <button
                key={key}
                onClick={() => changeTheme(key)}
                style={{
                  ...themeBtnStyle,
                  borderColor: THEMES[key].border,
                  background: THEMES[key].banner,
                  color: THEMES[key].text,
                  boxShadow: THEMES[key].glow,
                }}
              >
                {THEMES[key].name}
              </button>
            ))}
          </div>
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
  paddingBottom: 110,
  fontFamily: "var(--sa-font-family)",
  fontSize: "var(--sa-fs-base)",
};

const headerStyle: CSSProperties = {
  marginBottom: 16,
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
  borderRadius: "var(--sa-radius-card)",
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
  borderRadius: "var(--sa-radius-control)",
};

const planTextStyle: CSSProperties = {
  fontWeight: 900,
  overflowWrap: "anywhere",
};

const logoutBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 16px",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const bannerTopRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "start",
  gap: 12,
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "nowrap",
};

const langBtn = (active: boolean, theme: any): CSSProperties => ({
  borderColor: theme.accent,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
});

const titleStyle: CSSProperties = {
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.15,
  margin: 0,
  fontWeight: 900,
};

const noticeBoxStyle: CSSProperties = {
  marginTop: 18,
  width: "100%",
  overflow: "hidden",
  color: "#dc2626",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const noticeMarqueeStyle: CSSProperties = {
  display: "inline-block",
  minWidth: "100%",
  animation: "smartacctg-notice-marquee 18s linear infinite",
};

const dashboardTwoColStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const dropCardStyle: CSSProperties = {
  padding: "var(--sa-card-pad)",
  minWidth: 0,
};

const dropHeadStyle: CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: 0,
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
};

const dropBodyStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 12,
};

const dropRowBtnStyle: CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "8px 0",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
  textAlign: "left",
  fontWeight: 900,
};

const emptyTextStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 900,
};

const menuGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const navBtnStyle: CSSProperties = {
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  minHeight: 64,
  padding: "0 12px",
  fontWeight: 900,
  fontSize: "var(--sa-fs-lg)",
  textAlign: "center",
};

const bottomBarStyle: CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 200,
  padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(12px)",
  borderTop: "1px solid rgba(148,163,184,0.35)",
};

const bottomMenuWrapStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  maxWidth: 720,
  margin: "0 auto",
};

const bottomMainBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  padding: "0 10px",
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
};

const bottomPopStyle: CSSProperties = {
  position: "absolute",
  bottom: "calc(100% + 10px)",
  width: "min(230px, 48vw)",
  display: "grid",
  gap: 8,
  zIndex: 220,
};

const bottomPopBtnStyle: CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: "var(--sa-radius-control)",
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  color: "#111827",
  fontWeight: 900,
};

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
  minHeight: "var(--sa-control-h)",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid #14b8a6",
  marginBottom: 12,
  fontSize: "16px",
};

const primaryBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
  borderRadius: "var(--sa-radius-control)",
  fontWeight: 900,
  marginBottom: 16,
};

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const themeBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: 18,
  fontWeight: 900,
};

const recordFilterRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const filterBtn = (active: boolean, theme: any): CSSProperties => ({
  padding: "12px",
  borderRadius: "var(--sa-radius-control)",
  border: `var(--sa-border-w) solid ${theme.border}`,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
  fontWeight: 900,
});

const recordItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
};
