"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
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

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";

const TXT = {
  zh: {
    dashboard: "控制台",
    records: "记录明细",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
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
    noRecord: "还没有记录",
  },
  en: {
    dashboard: "Dashboard",
    records: "Records",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    accounting: "Accounting",
    customers: "Customers",
    products: "Products",
    invoices: "Invoices",
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
    noRecord: "No records yet",
  },
  ms: {
    dashboard: "Papan Pemuka",
    records: "Rekod",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    accounting: "Sistem Akaun",
    customers: "Pelanggan",
    products: "Produk",
    invoices: "Invois",
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
    noRecord: "Tiada rekod",
  },
};

const THEMES: Record<ThemeKey, any> = {
  deepTeal: {
    name: "深青色",
    pageBg: "#ecfdf5",
    banner: "#ffffff",
    card: "#ffffff",
    border: "#14b8a6",
    glow: "0 0 0 1px rgba(20,184,166,0.42), 0 0 18px rgba(45,212,191,0.55), 0 18px 42px rgba(15,118,110,0.25)",
    accent: "#0f766e",
    text: "#064e3b",
  },
  pink: {
    name: "可愛粉色",
    pageBg: "#fff7fb",
    banner: "linear-gradient(135deg,#ffd6e7,#fff1f2)",
    card: "#ffffff",
    border: "#f472b6",
    glow: "0 0 0 1px rgba(244,114,182,0.36), 0 0 18px rgba(244,114,182,0.45), 0 18px 38px rgba(244,114,182,0.22)",
    accent: "#db2777",
    text: "#4a044e",
  },
  blackGold: {
    name: "黑金商務",
    pageBg: "#111111",
    banner: "linear-gradient(135deg,#111111,#3b2f16)",
    card: "#1f1f1f",
    border: "#facc15",
    glow: "0 0 0 1px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.45), 0 18px 42px rgba(250,204,21,0.22)",
    accent: "#d4af37",
    text: "#fff7ed",
  },
  lightRed: {
    name: "可愛淺紅",
    pageBg: "#fff1f2",
    banner: "linear-gradient(135deg,#fecdd3,#ffe4e6)",
    card: "#ffffff",
    border: "#fb7185",
    glow: "0 0 0 1px rgba(251,113,133,0.45), 0 0 20px rgba(251,113,133,0.5), 0 18px 38px rgba(251,113,133,0.26)",
    accent: "#e11d48",
    text: "#881337",
  },
  nature: {
    name: "風景自然系",
    pageBg: "#f0fdf4",
    banner: "linear-gradient(135deg,#d9f99d,#bae6fd)",
    card: "#ffffff",
    border: "#22d3ee",
    glow: "0 0 0 1px rgba(34,211,238,0.42), 0 0 18px rgba(34,211,238,0.42), 0 18px 38px rgba(34,211,238,0.22)",
    accent: "#0f766e",
    text: "#14532d",
  },
  sky: {
    name: "天空藍",
    pageBg: "#eff6ff",
    banner: "linear-gradient(135deg,#bfdbfe,#e0f2fe)",
    card: "#ffffff",
    border: "#38bdf8",
    glow: "0 0 0 1px rgba(56,189,248,0.42), 0 0 18px rgba(56,189,248,0.48), 0 18px 38px rgba(56,189,248,0.24)",
    accent: "#0284c7",
    text: "#0f172a",
  },
};

export default function DashboardClient({ page }: { page: PageKey }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Txn[]>([]);

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

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
    const l = q.get("lang") as Lang;
    const view = q.get("view") as "balance" | "income" | "expense" | null;

    if (l === "zh" || l === "en" || l === "ms") setLang(l);
    if (view === "balance" || view === "income" || view === "expense") setRecordView(view);

    init();
  }, []);

  async function init() {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = localStorage.getItem(TRIAL_KEY);

    if (mode === "trial" && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);
        setSession(null);
        setProfile(null);

        const savedTx = localStorage.getItem(TRIAL_TX_KEY);
        setTransactions(savedTx ? JSON.parse(savedTx) : []);

        return;
      }

      localStorage.removeItem(TRIAL_KEY);
      localStorage.removeItem(TRIAL_TX_KEY);
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
      }
    }

    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("txn_date", { ascending: false });

    setTransactions((txData || []) as Txn[]);
  }

  function go(path: string) {
    window.location.href = isTrial
      ? `${path}?mode=trial&lang=${lang}`
      : `${path}?lang=${lang}`;
  }

  function goBack() {
    window.location.href = isTrial
      ? `/dashboard?mode=trial&lang=${lang}`
      : `/dashboard?lang=${lang}`;
  }

  function goRecords(view: "balance" | "income" | "expense") {
    window.location.href = isTrial
      ? `/dashboard/records?mode=trial&view=${view}&lang=${lang}`
      : `/dashboard/records?view=${view}&lang=${lang}`;
  }

  function switchLang(next: Lang) {
    setLang(next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function openWhatsApp() {
    window.location.href = "https://wa.me/60108039149";
  }

  async function logout() {
    localStorage.removeItem(TRIAL_KEY);
    localStorage.removeItem(TRIAL_TX_KEY);
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
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

    if (!isTrial && session) {
      await supabase
        .from("profiles")
        .update({ theme: key })
        .eq("id", session.user.id);
    }
  }

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter((x) => x.txn_date?.startsWith(monthKey));

  const monthIncome = useMemo(() => {
    return monthTx
      .filter((x) => x.txn_type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [transactions]);

  const monthExpense = useMemo(() => {
    return monthTx
      .filter((x) => x.txn_type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [transactions]);

  const balance = useMemo(() => {
    return transactions.reduce((s, x) => {
      return x.txn_type === "income"
        ? s + Number(x.amount || 0)
        : s - Number(x.amount || 0);
    }, 0);
  }, [transactions]);

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
    <main style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}>
      <header style={headerStyle}>
        <div style={leftTopStyle}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMenu(!showMenu)} style={avatarBtnStyle}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} style={avatarImgStyle} />
              ) : (
                "👤"
              )}
            </button>

            {showMenu && (
              <div style={avatarMenuStyle}>
                <label style={menuItemStyle}>
                  {t.changeAvatar}
                  <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: "none" }} />
                </label>

                <button style={menuItemStyle} onClick={() => { setShowSettings(true); setShowThemes(false); setShowMenu(false); }}>
                  {t.settings}
                </button>

                <button style={menuItemStyle} onClick={() => { setShowThemes(true); setShowSettings(false); setShowMenu(false); }}>
                  {t.theme}
                </button>

                <button style={menuItemStyle} onClick={logout}>
                  {t.logout}
                </button>
              </div>
            )}
          </div>

          <div style={planTextStyle}>
            {t.expiry}: {expiryText}
          </div>
        </div>

        <button onClick={logout} style={{ ...logoutBtnStyle, background: theme.accent }}>
          {t.logout}
        </button>
      </header>

      {page === "home" && (
        <>
          <section style={{ ...bannerStyle, background: theme.banner, borderColor: theme.border, boxShadow: theme.glow }}>
            <div style={bannerTopRowStyle}>
              <h1 style={titleStyle}>{t.dashboard}</h1>

              <div style={langRowStyle}>
                <button onClick={() => switchLang("zh")} style={langBtn(lang === "zh", theme)}>中文</button>
                <button onClick={() => switchLang("en")} style={langBtn(lang === "en", theme)}>EN</button>
                <button onClick={() => switchLang("ms")} style={langBtn(lang === "ms", theme)}>BM</button>
              </div>
            </div>

            <div style={noticeBoxStyle}>
              {isTrial ? "免费试用模式：20 分钟后会自动失效" : ""}
            </div>
          </section>

          <section style={statsGridStyle}>
            <button onClick={() => goRecords("balance")} style={{ ...statCardStyle, borderColor: theme.border, boxShadow: theme.glow }}>
              <span>{t.balance}</span>
              <strong style={{ ...statAmountStyle, color: theme.accent }}>
                RM {balance.toFixed(2)}
              </strong>
            </button>

            <button onClick={() => goRecords("income")} style={{ ...statCardStyle, borderColor: theme.border, boxShadow: theme.glow }}>
              <span>{t.monthIncome}</span>
              <strong style={{ ...statAmountStyle, color: "#16a34a" }}>
                RM {monthIncome.toFixed(2)}
              </strong>
            </button>

            <button onClick={() => goRecords("expense")} style={{ ...statCardStyle, borderColor: theme.border, boxShadow: theme.glow }}>
              <span>{t.monthExpense}</span>
              <strong style={{ ...statAmountStyle, color: "#dc2626" }}>
                RM {monthExpense.toFixed(2)}
              </strong>
            </button>
          </section>

          <section style={menuGridStyle}>
            <button onClick={() => go("/dashboard/accounting")} style={{ ...navBtnStyle, borderColor: theme.border, boxShadow: theme.glow }}>{t.accounting}</button>
            <button onClick={() => go("/dashboard/customers")} style={{ ...navBtnStyle, borderColor: theme.border, boxShadow: theme.glow }}>{t.customers}</button>
            <button onClick={() => go("/dashboard/products")} style={{ ...navBtnStyle, borderColor: theme.border, boxShadow: theme.glow }}>{t.products}</button>
            <button onClick={() => go("/dashboard/invoices")} style={{ ...navBtnStyle, borderColor: theme.border, boxShadow: theme.glow }}>{t.invoices}</button>
          </section>
        </>
      )}

      {page === "records" && (
        <section style={{ ...contentCardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
          <button onClick={goBack} style={{ ...backBtnStyle, borderColor: theme.border, color: theme.accent }}>
            ← {t.back}
          </button>

          <h1>{t.records}</h1>

          <div style={recordFilterRowStyle}>
            <button onClick={() => setRecordView("balance")} style={filterBtn(recordView === "balance", theme)}>{t.balance}</button>
            <button onClick={() => setRecordView("income")} style={filterBtn(recordView === "income", theme)}>{t.income}</button>
            <button onClick={() => setRecordView("expense")} style={filterBtn(recordView === "expense", theme)}>{t.expense}</button>
          </div>

          {filteredRecords.length === 0 ? (
            <p>{t.noRecord}</p>
          ) : (
            filteredRecords.map((x) => (
              <div key={x.id} style={recordItemStyle}>
                <div>
                  <strong>{x.txn_type === "income" ? t.income : t.expense}</strong>
                  <div>{x.txn_date}</div>
                  <div>{x.category_name || ""} {x.note || ""}</div>
                </div>
                <strong style={{ color: x.txn_type === "income" ? "#16a34a" : "#dc2626" }}>
                  RM {Number(x.amount || 0).toFixed(2)}
                </strong>
              </div>
            ))
          )}
        </section>
      )}

      {page !== "home" && page !== "records" && (
        <section style={{ ...contentCardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
          <button onClick={goBack} style={{ ...backBtnStyle, borderColor: theme.border, color: theme.accent }}>
            ← {t.back}
          </button>

          <h1>
            {page === "accounting" && t.accounting}
            {page === "customers" && t.customers}
            {page === "products" && t.products}
            {page === "invoices" && t.invoices}
          </h1>

          <p>這裡是獨立頁面內容。</p>
        </section>
      )}

      {showSettings && (
        <section style={{ ...contentCardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
          <h2>{t.settings}</h2>

          <h3>{t.personal}</h3>
          <input placeholder={t.name} value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
          <input placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />

          <h3>{t.company}</h3>
          <input placeholder={t.companyName} value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
          <input placeholder={t.ssm} value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} style={inputStyle} />
          <input placeholder={t.companyPhone} value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} style={inputStyle} />
          <input placeholder={t.companyAddress} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} style={inputStyle} />

          <button onClick={saveSettings} style={{ ...primaryBtnStyle, background: theme.accent }}>
            {t.save}
          </button>

          <h3>{t.password}</h3>
          <input type="password" placeholder={t.newPassword} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />

          <button onClick={changePassword} style={{ ...primaryBtnStyle, background: theme.accent }}>
            {t.updatePassword}
          </button>

          {msg && <p style={{ color: theme.accent, fontWeight: 800 }}>{msg}</p>}
        </section>
      )}

      {showThemes && (
        <section style={{ ...contentCardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
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
      )}

      <button onClick={openWhatsApp} style={whatsAppBtnStyle}>
        👩‍💼
      </button>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 16,
  fontFamily: "sans-serif",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};

const leftTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const avatarBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "999px",
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
  fontWeight: 800,
  borderRadius: 10,
};

const planTextStyle: CSSProperties = {
  fontWeight: 800,
};

const logoutBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 900,
};

const bannerStyle: CSSProperties = {
  border: "3px solid",
  borderRadius: 24,
  padding: 20,
  marginBottom: 18,
};

const bannerTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const langBtn = (active: boolean, theme: any): CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: `2px solid ${theme.accent}`,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
  fontWeight: 900,
});

const titleStyle: CSSProperties = {
  fontSize: 34,
  margin: 0,
};

const noticeBoxStyle: CSSProperties = {
  marginTop: 12,
  minHeight: 36,
  color: "#dc2626",
  fontWeight: 900,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 18,
};

const statCardStyle: CSSProperties = {
  background: "#fff",
  border: "3px solid",
  borderRadius: 20,
  padding: 14,
  minHeight: 105,
  textAlign: "left",
  cursor: "pointer",
};

const statAmountStyle: CSSProperties = {
  display: "block",
  marginTop: 16,
  fontSize: 22,
  fontWeight: 900,
};

const menuGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const navBtnStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 16,
  padding: "18px",
  fontWeight: 900,
  fontSize: 18,
};

const contentCardStyle: CSSProperties = {
  border: "3px solid",
  borderRadius: 24,
  padding: 20,
  marginTop: 18,
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 900,
  marginBottom: 14,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  borderRadius: 12,
  border: "2px solid #14b8a6",
  marginBottom: 12,
  fontSize: 16,
};

const primaryBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  padding: "14px 18px",
  borderRadius: 12,
  fontWeight: 900,
  marginBottom: 16,
};

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const themeBtnStyle: CSSProperties = {
  border: "2px solid",
  borderRadius: 16,
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
  borderRadius: 12,
  border: `2px solid ${theme.border}`,
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

const whatsAppBtnStyle: CSSProperties = {
  position: "fixed",
  right: 18,
  bottom: 18,
  width: 58,
  height: 58,
  borderRadius: "999px",
  border: "none",
  background: "#25D366",
  color: "#fff",
  fontSize: 28,
  boxShadow: "0 12px 30px rgba(37,211,102,0.45)",
  zIndex: 100,
};
