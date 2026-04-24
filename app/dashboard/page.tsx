"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";

const t = {
  zh: {
    title: "控制台",
    subtitle: "请选择你要进入的功能页面",
    accounting: "記帳系統",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    logout: "退出登录",
  },
  en: {
    title: "Dashboard",
    subtitle: "Choose a function page",
    accounting: "Accounting System",
    customers: "Customer Management",
    products: "Product Management",
    invoices: "Invoice System",
    logout: "Logout",
  },
  ms: {
    title: "Dashboard",
    subtitle: "Pilih halaman fungsi",
    accounting: "Sistem Akaun",
    customers: "Pengurusan Pelanggan",
    products: "Pengurusan Produk",
    invoices: "Sistem Invois",
    logout: "Log Keluar",
  },
};

export default function DashboardPage() {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("smartacctg_lang") as Lang | null;
    if (saved) setLang(saved);
  }, []);

  function changeLang(next: Lang) {
    setLang(next);
    localStorage.setItem("smartacctg_lang", next);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  const text = t[lang];

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <h2 style={brandStyle}>SmartAcctg</h2>

        <div style={langRowStyle}>
          <button onClick={() => changeLang("zh")} style={langBtn(lang === "zh")}>中文</button>
          <button onClick={() => changeLang("en")} style={langBtn(lang === "en")}>EN</button>
          <button onClick={() => changeLang("ms")} style={langBtn(lang === "ms")}>BM</button>
        </div>
      </header>

      <section style={heroStyle}>
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
      </section>

      <div style={gridStyle}>
        <Link href="/dashboard/accounting" style={cardStyle}>{text.accounting}</Link>
        <Link href="/dashboard/customers" style={cardStyle}>{text.customers}</Link>
        <Link href="/dashboard/products" style={cardStyle}>{text.products}</Link>
        <Link href="/dashboard/invoices" style={cardStyle}>{text.invoices}</Link>
      </div>

      <button onClick={logout} style={logoutStyle}>{text.logout}</button>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 20,
  background: "#f0fdf4",
  fontFamily: "sans-serif",
  color: "#0f172a",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const brandStyle: CSSProperties = {
  margin: 0,
  color: "#0F766E",
  fontSize: 26,
  fontWeight: 900,
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
};

const langBtn = (active: boolean): CSSProperties => ({
  border: "1px solid #0F766E",
  background: active ? "#0F766E" : "#fff",
  color: active ? "#fff" : "#0F766E",
  padding: "8px 10px",
  borderRadius: 8,
  fontWeight: 800,
});

const heroStyle: CSSProperties = {
  marginTop: 40,
  marginBottom: 24,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 16,
};

const cardStyle: CSSProperties = {
  display: "block",
  padding: 24,
  borderRadius: 18,
  background: "#fff",
  border: "2px solid #0F766E",
  color: "#0F766E",
  textDecoration: "none",
  fontSize: 24,
  fontWeight: 900,
  boxShadow: "0 8px 24px rgba(15,118,110,0.08)",
};

const logoutStyle: CSSProperties = {
  marginTop: 24,
  padding: "12px 18px",
  border: "none",
  borderRadius: 10,
  background: "#0F766E",
  color: "#fff",
  fontWeight: 800,
};
