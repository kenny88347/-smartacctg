"use client";

import Link from "next/link";
import { CSSProperties, useState } from "react";

type Lang = "zh" | "en" | "bm";

const text = {
  zh: {
    title: "SmartAcctg 控制台",
    desc: "请选择你要进入的功能页面",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
  },
  en: {
    title: "SmartAcctg Dashboard",
    desc: "Choose a feature page",
    accounting: "Accounting System",
    customers: "Customer Management",
    products: "Product Management",
    invoices: "Invoice System",
  },
  bm: {
    title: "Dashboard SmartAcctg",
    desc: "Pilih halaman fungsi",
    accounting: "Sistem Perakaunan",
    customers: "Pengurusan Pelanggan",
    products: "Pengurusan Produk",
    invoices: "Sistem Invois",
  },
};

export default function DashboardPage() {
  const [lang, setLang] = useState<Lang>("zh");
  const t = text[lang];

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={brandStyle}>SmartAcctg</h1>
        <LangSwitch lang={lang} setLang={setLang} />
      </header>

      <section style={heroStyle}>
        <h2 style={titleStyle}>{t.title}</h2>
        <p style={descStyle}>{t.desc}</p>
      </section>

      <section style={gridStyle}>
        <Link href="/dashboard/accounting" style={cardStyle}>{t.accounting}</Link>
        <Link href="/dashboard/customers" style={cardStyle}>{t.customers}</Link>
        <Link href="/dashboard/products" style={cardStyle}>{t.products}</Link>
        <Link href="/dashboard/invoices" style={cardStyle}>{t.invoices}</Link>
      </section>
    </main>
  );
}

function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (v: Lang) => void }) {
  return (
    <div style={langWrapStyle}>
      <button onClick={() => setLang("zh")} style={langBtn(lang === "zh")}>中文</button>
      <button onClick={() => setLang("en")} style={langBtn(lang === "en")}>EN</button>
      <button onClick={() => setLang("bm")} style={langBtn(lang === "bm")}>BM</button>
    </div>
  );
}

const pageStyle: CSSProperties = { minHeight: "100vh", padding: 20, background: "#f0fdf4", fontFamily: "sans-serif" };
const headerStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };
const brandStyle: CSSProperties = { margin: 0, color: "#0f766e", fontSize: 30, fontWeight: 900 };
const heroStyle: CSSProperties = { marginTop: 30, padding: 24, borderRadius: 22, background: "linear-gradient(135deg,#d9f99d,#bae6fd)" };
const titleStyle: CSSProperties = { margin: 0, fontSize: 32, color: "#14532d" };
const descStyle: CSSProperties = { color: "#166534", fontSize: 18 };
const gridStyle: CSSProperties = { display: "grid", gap: 16, marginTop: 24 };
const cardStyle: CSSProperties = { padding: 24, borderRadius: 18, background: "#fff", border: "2px solid #0f766e", color: "#0f172a", textDecoration: "none", fontWeight: 900, fontSize: 22 };
const langWrapStyle: CSSProperties = { display: "flex", gap: 8 };
const langBtn = (active: boolean): CSSProperties => ({ padding: "8px 10px", borderRadius: 8, border: "1px solid #0f766e", background: active ? "#0f766e" : "#fff", color: active ? "#fff" : "#0f766e", fontWeight: 800 });
