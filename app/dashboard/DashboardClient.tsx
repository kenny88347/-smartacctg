"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type PageKey = "home" | "accounting" | "customers" | "products" | "invoices";
type Lang = "zh" | "en" | "ms";
type ThemeKey = "pink" | "blackGold" | "panda" | "nature" | "sky" | "deepTeal";

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
};

const TXT = {
  zh: {
    dashboard: "控制台",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    changeAvatar: "更换头像",
    settings: "设置",
    theme: "主题切换",
    logout: "退出登录",
    expiry: "订阅期限",
    noSub: "未订阅",
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
  },
  en: {
    dashboard: "Dashboard",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    accounting: "Accounting",
    customers: "Customers",
    products: "Products",
    invoices: "Invoices",
    changeAvatar: "Change Avatar",
    settings: "Settings",
    theme: "Theme",
    logout: "Logout",
    expiry: "Expiry",
    noSub: "Not Subscribed",
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
  },
  ms: {
    dashboard: "Papan Pemuka",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    accounting: "Sistem Akaun",
    customers: "Pelanggan",
    products: "Produk",
    invoices: "Invois",
    changeAvatar: "Tukar Avatar",
    settings: "Tetapan",
    theme: "Tema",
    logout: "Log Keluar",
    expiry: "Tarikh Tamat",
    noSub: "Belum Langgan",
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
  },
};

const MODERN_BORDER = "#22c55e";

const THEMES: Record<ThemeKey, any> = {
  pink: {
    name: "可愛粉色",
    pageBg: "#fff7fb",
    banner: "linear-gradient(135deg,#ffd6e7,#fff1f2)",
    card: "#ffffff",
    border: MODERN_BORDER,
    accent: "#db2777",
    text: "#4a044e",
  },
  blackGold: {
    name: "黑金商務",
    pageBg: "#111111",
    banner: "linear-gradient(135deg,#111111,#3b2f16)",
    card: "#1f1f1f",
    border: MODERN_BORDER,
    accent: "#d4af37",
    text: "#fff7ed",
  },
  panda: {
    name: "熊貓中國風",
    pageBg: "#f7f3ea",
    banner: "linear-gradient(135deg,#ffffff,#e7e5df)",
    card: "#ffffff",
    border: MODERN_BORDER,
    accent: "#b91c1c",
    text: "#111827",
  },
  nature: {
    name: "風景自然系",
    pageBg: "#f0fdf4",
    banner: "linear-gradient(135deg,#d9f99d,#bae6fd)",
    card: "#ffffff",
    border: MODERN_BORDER,
    accent: "#0f766e",
    text: "#14532d",
  },
  sky: {
    name: "天空藍",
    pageBg: "#eff6ff",
    banner: "linear-gradient(135deg,#bfdbfe,#e0f2fe)",
    card: "#ffffff",
    border: MODERN_BORDER,
    accent: "#0284c7",
    text: "#0f172a",
  },
  deepTeal: {
    name: "深青色",
    pageBg: "#ecfdf5",
    banner: "linear-gradient(135deg,#0f766e,#14b8a6)",
    card: "#ffffff",
    border: MODERN_BORDER,
    accent: "#0f766e",
    text: "#064e3b",
  },
};

export default function DashboardClient({ page }: { page: PageKey }) {
  const [session, setSession] = useState<Session | null>(null);
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

  const t = TXT[lang];
  const theme = THEMES[themeKey];

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const l = q.get("lang") as Lang;
    if (l === "zh" || l === "en" || l === "ms") setLang(l);

    init();
  }, []);

  async function init() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/zh";
      return;
    }

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
      .eq("user_id", userId);

    setTransactions((txData || []) as Txn[]);
  }

  function go(path: string) {
    window.location.href = `${path}?lang=${lang}`;
  }

  function switchLang(next: Lang) {
    setLang(next);
    window.history.replaceState({}, "", `${window.location.pathname}?lang=${next}`);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
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
    if (!newPassword || newPassword.length < 6) {
      setMsg("密码至少 6 位");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.saved);
    setNewPassword("");
  }

  async function changeTheme(key: ThemeKey) {
    setThemeKey(key);

    if (session) {
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

  const expiryText = profile?.plan_expiry
    ? new Date(profile.plan_expiry).toLocaleDateString()
    : t.noSub;

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

          <div>
            <div style={planTextStyle}>
              {t.expiry}: {expiryText}
            </div>
          </div>
        </div>

        <button onClick={logout} style={{ ...logoutBtnStyle, background: theme.accent }}>
          {t.logout}
        </button>
      </header>

      <div style={langRowStyle}>
        <button onClick={() => switchLang("zh")} style={langBtn(lang === "zh", theme)}>中文</button>
        <button onClick={() => switchLang("en")} style={langBtn(lang === "en", theme)}>English</button>
        <button onClick={() => switchLang("ms")} style={langBtn(lang === "ms", theme)}>BM</button>
      </div>

      {page === "home" && (
        <>
          <section style={{ ...bannerStyle, background: theme.banner, borderColor: theme.border }}>
            <h1 style={titleStyle}>{t.dashboard}</h1>

            {/* 以后 admin page 控制通告时，把文字放这里；通告字体已设为红色 */}
            <div style={noticeBoxStyle}></div>
          </section>

          <section style={statsGridStyle}>
            <div style={{ ...statCardStyle, borderColor: theme.border }}>
              <span>{t.balance}</span>
              <strong style={{ ...statAmountStyle, color: theme.accent }}>
                RM {balance.toFixed(2)}
              </strong>
            </div>

            <div style={{ ...statCardStyle, borderColor: theme.border }}>
              <span>{t.monthIncome}</span>
              <strong style={{ ...statAmountStyle, color: "#16a34a" }}>
                RM {monthIncome.toFixed(2)}
              </strong>
            </div>

            <div style={{ ...statCardStyle, borderColor: theme.border }}>
              <span>{t.monthExpense}</span>
              <strong style={{ ...statAmountStyle, color: "#dc2626" }}>
                RM {monthExpense.toFixed(2)}
              </strong>
            </div>
          </section>

          <section style={menuGridStyle}>
            <button onClick={() => go("/dashboard/accounting")} style={navBtnStyle}>{t.accounting}</button>
            <button onClick={() => go("/dashboard/customers")} style={navBtnStyle}>{t.customers}</button>
            <button onClick={() => go("/dashboard/products")} style={navBtnStyle}>{t.products}</button>
            <button onClick={() => go("/dashboard/invoices")} style={navBtnStyle}>{t.invoices}</button>
          </section>
        </>
      )}

      {page !== "home" && (
        <section style={{ ...contentCardStyle, background: theme.card, borderColor: theme.border }}>
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
        <section style={{ ...contentCardStyle, background: theme.card, borderColor: theme.border }}>
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
        <section style={{ ...contentCardStyle, background: theme.card, borderColor: theme.border }}>
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
                }}
              >
                {THEMES[key].name}
              </button>
            ))}
          </div>
        </section>
      )}
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

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginBottom: 16,
};

const langBtn = (active: boolean, theme: any): CSSProperties => ({
  padding: "10px 16px",
  borderRadius: 999,
  border: `2px solid ${theme.accent}`,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
  fontWeight: 900,
});

const bannerStyle: CSSProperties = {
  border: "3px solid",
  borderRadius: 24,
  padding: 20,
  marginBottom: 18,
  boxShadow: "0 12px 30px rgba(34,197,94,0.16)",
};

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
  boxShadow: "0 10px 24px rgba(34,197,94,0.14)",
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
  border: `2px solid ${MODERN_BORDER}`,
  borderRadius: 16,
  padding: "18px",
  fontWeight: 900,
  fontSize: 18,
  boxShadow: "0 10px 24px rgba(34,197,94,0.12)",
};

const contentCardStyle: CSSProperties = {
  border: "3px solid",
  borderRadius: 24,
  padding: 20,
  marginTop: 18,
  boxShadow: "0 12px 30px rgba(34,197,94,0.16)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  borderRadius: 12,
  border: `2px solid ${MODERN_BORDER}`,
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
