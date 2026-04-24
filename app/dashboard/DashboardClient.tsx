"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type PageKey = "home" | "accounting" | "customers" | "products" | "invoices";
type Lang = "zh" | "en" | "ms";
type ThemeKey = "cutePink" | "blackGold" | "pandaChina" | "nature" | "skyBlue";

type Profile = {
  id: string;
  full_name: string | null;
  phone?: string | null;
  avatar_url: string | null;
  theme: string | null;
  company_name: string | null;
  company_reg_no: string | null;
  company_phone: string | null;
  company_address: string | null;
  plan_type: string | null;
  plan_expiry: string | null;
};

type Txn = {
  id: string;
  txn_date: string;
  txn_type: "income" | "expense";
  amount: number;
  category_name: string | null;
  debt_amount: number | null;
  note: string | null;
};

const THEME = {
  cutePink: { name: "可爱粉色", bg: "#fff7fb", banner: "#fce7f3", card: "#fff", border: "#f472b6", accent: "#db2777", text: "#4a044e" },
  blackGold: { name: "黑金商务", bg: "#111111", banner: "#1f1f1f", card: "#18181b", border: "#d4af37", accent: "#d4af37", text: "#fff7ed" },
  pandaChina: { name: "熊猫中国风", bg: "#f6f4ef", banner: "#ffffff", card: "#fff", border: "#111827", accent: "#b91c1c", text: "#111827" },
  nature: { name: "风景自然系", bg: "#f0fdf4", banner: "#dcfce7", card: "#fff", border: "#16a34a", accent: "#0F766E", text: "#14532d" },
  skyBlue: { name: "天空蓝", bg: "#eff6ff", banner: "#dbeafe", card: "#fff", border: "#38bdf8", accent: "#0284c7", text: "#0f172a" },
};

const TXT = {
  zh: {
    home: "总览", accounting: "记账系统", customers: "客户管理", products: "产品管理", invoices: "发票系统",
    logout: "退出登录", settings: "设置", theme: "主题切换", avatar: "更换头像", plan: "订阅期限",
    personal: "个人资料", name: "名称", phone: "电话号码", company: "公司资料", companyName: "公司名字",
    ssm: "公司注册 SSM", companyPhone: "公司电话号码", companyAddress: "公司地址", password: "更换密码",
    save: "保存", newPassword: "新密码", records: "所有记录", debt: "欠款", noRecords: "还没有记录",
  },
  en: {
    home: "Overview", accounting: "Accounting", customers: "Customers", products: "Products", invoices: "Invoices",
    logout: "Logout", settings: "Settings", theme: "Theme", avatar: "Change Avatar", plan: "Subscription",
    personal: "Personal Info", name: "Name", phone: "Phone", company: "Company Info", companyName: "Company Name",
    ssm: "SSM Registration", companyPhone: "Company Phone", companyAddress: "Company Address", password: "Change Password",
    save: "Save", newPassword: "New Password", records: "All Records", debt: "Debt", noRecords: "No records yet",
  },
  ms: {
    home: "Ringkasan", accounting: "Akaun", customers: "Pelanggan", products: "Produk", invoices: "Invois",
    logout: "Log Keluar", settings: "Tetapan", theme: "Tema", avatar: "Tukar Gambar", plan: "Langganan",
    personal: "Maklumat Peribadi", name: "Nama", phone: "Telefon", company: "Maklumat Syarikat", companyName: "Nama Syarikat",
    ssm: "Pendaftaran SSM", companyPhone: "Telefon Syarikat", companyAddress: "Alamat Syarikat", password: "Tukar Kata Laluan",
    save: "Simpan", newPassword: "Kata Laluan Baru", records: "Semua Rekod", debt: "Hutang", noRecords: "Tiada rekod",
  },
};

export default function DashboardClient({ page }: { page: PageKey }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("nature");
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<"settings" | "theme" | null>(null);
  const [transactions, setTransactions] = useState<Txn[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const t = TXT[lang];
  const theme = THEME[themeKey];

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const qLang = q.get("lang") as Lang | null;
    if (qLang === "zh" || qLang === "en" || qLang === "ms") setLang(qLang);
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

    const { data: p } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (p) {
      setProfile(p as Profile);
      setFullName(p.full_name || "");
      setPhone(p.phone || "");
      setCompanyName(p.company_name || "");
      setCompanyRegNo(p.company_reg_no || "");
      setCompanyPhone(p.company_phone || "");
      setCompanyAddress(p.company_address || "");
      if (p.theme && THEME[p.theme as ThemeKey]) setThemeKey(p.theme as ThemeKey);
    }

    const { data: tx } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setTransactions((tx || []) as Txn[]);
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
    const { error } = await supabase.storage.from("company-assets").upload(path, file, { upsert: true });

    if (error) {
      setMsg(error.message);
      return;
    }

    const { data } = supabase.storage.from("company-assets").getPublicUrl(path);

    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", session.user.id);
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

    if (newPassword) {
      const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
      if (passError) {
        setMsg(passError.message);
        return;
      }
    }

    setMsg("保存成功");
    await init();
  }

  async function saveTheme(next: ThemeKey) {
    setThemeKey(next);
    if (session) {
      await supabase.from("profiles").update({ theme: next }).eq("id", session.user.id);
    }
  }

  const totalDebt = useMemo(() => {
    return transactions.reduce((sum, x) => sum + Number(x.debt_amount || 0), 0);
  }, [transactions]);

  const title =
    page === "home" ? t.home :
    page === "accounting" ? t.accounting :
    page === "customers" ? t.customers :
    page === "products" ? t.products :
    t.invoices;

  const planText = profile?.plan_expiry
    ? new Date(profile.plan_expiry).toLocaleDateString()
    : "未订阅";

  return (
    <main style={{ ...pageStyle, background: theme.bg, color: theme.text }}>
      <header style={{ ...headerStyle, background: theme.banner }}>
        <div style={leftTopStyle}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={avatarBtnStyle}>
              {profile?.avatar_url ? <img src={profile.avatar_url} style={avatarImgStyle} /> : "👤"}
            </button>

            {menuOpen && (
              <div style={dropMenuStyle}>
                <label style={menuItemStyle}>
                  {t.avatar}
                  <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: "none" }} />
                </label>
                <button style={menuItemStyle} onClick={() => { setPanel("settings"); setMenuOpen(false); }}>
                  {t.settings}
                </button>
                <button style={menuItemStyle} onClick={() => { setPanel("theme"); setMenuOpen(false); }}>
                  {t.theme}
                </button>
                <button style={menuItemStyle} onClick={logout}>
                  {t.logout}
                </button>
              </div>
            )}
          </div>

          <div>
            <h1 style={titleStyle}>{title}</h1>
            <div style={planStyle}>{t.plan}: {planText}</div>
          </div>
        </div>
      </header>

      <div style={langRowStyle}>
        <button onClick={() => switchLang("zh")} style={langBtn(lang === "zh", theme.accent)}>中文</button>
        <button onClick={() => switchLang("en")} style={langBtn(lang === "en", theme.accent)}>English</button>
        <button onClick={() => switchLang("ms")} style={langBtn(lang === "ms", theme.accent)}>BM</button>
      </div>

      {page === "home" && (
        <>
          <div style={{ ...bannerPreviewStyle, background: theme.banner, borderColor: theme.border }}>
            SmartAcctg Banner
          </div>

          <section style={{ ...cardStyle, background: theme.card, borderColor: theme.border }}>
            <h2>{t.records}</h2>

            <div style={debtCardStyle}>
              <strong>{t.debt}</strong>
              <span>RM {totalDebt.toFixed(2)}</span>
            </div>

            {transactions.length === 0 ? (
              <p>{t.noRecords}</p>
            ) : (
              transactions.map((x) => (
                <div key={x.id} style={{ ...recordCardStyle, borderColor: theme.border }}>
                  <div>
                    <strong>{x.txn_type === "income" ? "收入" : "支出"}</strong>
                    <p>{x.txn_date}</p>
                    <p>{x.category_name || "-"}</p>
                    {Number(x.debt_amount || 0) > 0 && <p>{t.debt}: RM {Number(x.debt_amount).toFixed(2)}</p>}
                    {x.note && <p>{x.note}</p>}
                  </div>
                  <strong>RM {Number(x.amount).toFixed(2)}</strong>
                </div>
              ))
            )}
          </section>
        </>
      )}

      {page !== "home" && (
        <section style={{ ...cardStyle, background: theme.card, borderColor: theme.border }}>
          <h2>{title}</h2>
          <p>这个页面只显示「{title}」自己的内容。</p>
        </section>
      )}

      {panel === "settings" && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, background: theme.card, color: theme.text }}>
            <h2>{t.settings}</h2>

            <h3>{t.personal}</h3>
            <input placeholder={t.name} value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
            <input placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />

            <h3>{t.company}</h3>
            <input placeholder={t.companyName} value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
            <input placeholder={t.ssm} value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} style={inputStyle} />
            <input placeholder={t.companyPhone} value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} style={inputStyle} />
            <input placeholder={t.companyAddress} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} style={inputStyle} />

            <h3>{t.password}</h3>
            <input type="password" placeholder={t.newPassword} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />

            {msg && <p style={{ color: theme.accent, fontWeight: 800 }}>{msg}</p>}

            <button onClick={saveSettings} style={{ ...primaryBtnStyle, background: theme.accent }}>{t.save}</button>
            <button onClick={() => setPanel(null)} style={cancelBtnStyle}>关闭</button>
          </div>
        </div>
      )}

      {panel === "theme" && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, background: theme.card, color: theme.text }}>
            <h2>{t.theme}</h2>
            <p>每位用户切换主题后，不影响其他用户。</p>

            {(Object.keys(THEME) as ThemeKey[]).map((key) => (
              <button
                key={key}
                onClick={() => saveTheme(key)}
                style={{
                  ...themeBtnStyle,
                  borderColor: THEME[key].border,
                  background: themeKey === key ? THEME[key].accent : THEME[key].banner,
                  color: themeKey === key ? "#fff" : THEME[key].text,
                }}
              >
                {THEME[key].name}
              </button>
            ))}

            <div style={{ ...bannerPreviewStyle, background: theme.banner, borderColor: theme.border }}>首页 Banner</div>
            <div style={{ ...miniPreviewStyle, background: theme.card, borderColor: theme.border }}>个人卡片背景</div>
            <div style={{ ...miniPreviewStyle, background: theme.banner, borderColor: theme.border }}>名片封面</div>
            <div style={{ ...miniPreviewStyle, background: theme.bg, borderColor: theme.border }}>Container 背景图</div>

            <button onClick={() => setPanel(null)} style={cancelBtnStyle}>关闭</button>
          </div>
        </div>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = { minHeight: "100vh", padding: 16, fontFamily: "sans-serif" };
const headerStyle: CSSProperties = { borderRadius: 20, padding: 16, marginBottom: 12 };
const leftTopStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const titleStyle: CSSProperties = { margin: 0, fontSize: 28, fontWeight: 900 };
const planStyle: CSSProperties = { fontSize: 14, marginTop: 4, fontWeight: 700 };
const avatarBtnStyle: CSSProperties = { width: 54, height: 54, borderRadius: 999, border: "none", background: "#fff", fontSize: 28, overflow: "hidden" };
const avatarImgStyle: CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const dropMenuStyle: CSSProperties = { position: "absolute", top: 62, left: 0, width: 190, background: "#fff", borderRadius: 14, padding: 8, boxShadow: "0 10px 30px rgba(0,0,0,.15)", zIndex: 20 };
const menuItemStyle: CSSProperties = { display: "block", width: "100%", padding: "12px", background: "transparent", border: "none", textAlign: "left", fontWeight: 800 };
const langRowStyle: CSSProperties = { display: "flex", gap: 8, marginBottom: 14 };
const langBtn = (active: boolean, accent: string): CSSProperties => ({ padding: "8px 14px", borderRadius: 999, border: `1px solid ${accent}`, background: active ? accent : "#fff", color: active ? "#fff" : accent, fontWeight: 900 });
const cardStyle: CSSProperties = { border: "2px solid", borderRadius: 20, padding: 20, marginTop: 16 };
const bannerPreviewStyle: CSSProperties = { border: "2px solid", borderRadius: 18, padding: 24, textAlign: "center", fontWeight: 900, marginBottom: 16 };
const debtCardStyle: CSSProperties = { display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 16, borderRadius: 14, marginBottom: 14 };
const recordCardStyle: CSSProperties = { border: "1px solid", borderRadius: 14, padding: 14, marginBottom: 12, display: "flex", justifyContent: "space-between", gap: 12 };
const overlayStyle: CSSProperties = { position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", padding: 16, zIndex: 100, overflowY: "auto" };
const modalStyle: CSSProperties = { maxWidth: 520, margin: "30px auto", borderRadius: 20, padding: 20 };
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1", marginTop: 10, fontSize: 16 };
const primaryBtnStyle: CSSProperties = { marginTop: 14, padding: "12px 18px", color: "#fff", border: "none", borderRadius: 10, fontWeight: 900 };
const cancelBtnStyle: CSSProperties = { marginTop: 10, padding: "12px 18px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 10, fontWeight: 900 };
const themeBtnStyle: CSSProperties = { width: "100%", padding: 14, borderRadius: 12, border: "2px solid", marginTop: 10, fontWeight: 900 };
const miniPreviewStyle: CSSProperties = { border: "1px solid", borderRadius: 14, padding: 16, marginTop: 10, fontWeight: 800 };
