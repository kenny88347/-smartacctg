"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PageKey = "home" | "accounting" | "customers" | "products" | "invoices";
type Lang = "zh" | "en" | "ms";

const TXT = {
  zh: {
    home: "总览",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    logout: "退出登录",
  },
  en: {
    home: "Overview",
    accounting: "Accounting",
    customers: "Customers",
    products: "Products",
    invoices: "Invoices",
    logout: "Logout",
  },
  ms: {
    home: "Ringkasan",
    accounting: "Akaun",
    customers: "Pelanggan",
    products: "Produk",
    invoices: "Invois",
    logout: "Log Keluar",
  },
};

export default function DashboardClient({ page }: { page: PageKey }) {
  const [lang, setLang] = useState<Lang>("zh");

  const t = TXT[lang];

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const l = q.get("lang") as Lang;
    if (l) setLang(l);
  }, []);

  function go(path: string) {
    window.location.href = `${path}?lang=${lang}`;
  }

  function switchLang(l: Lang) {
    setLang(l);
    window.history.replaceState({}, "", `${window.location.pathname}?lang=${l}`);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  return (
    <main style={pageStyle}>
      
      {/* ===== 顶部 ===== */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {page === "home" && t.home}
          {page === "accounting" && t.accounting}
          {page === "customers" && t.customers}
          {page === "products" && t.products}
          {page === "invoices" && t.invoices}
        </h1>

        <button onClick={logout} style={logoutBtn}>
          {t.logout}
        </button>
      </div>

      {/* ===== 语言切换（全部页面都有） ===== */}
      <div style={langRow}>
        <button onClick={() => switchLang("zh")} style={langBtn(lang === "zh")}>中文</button>
        <button onClick={() => switchLang("en")} style={langBtn(lang === "en")}>English</button>
        <button onClick={() => switchLang("ms")} style={langBtn(lang === "ms")}>BM</button>
      </div>

      {/* ===== 只有首页才显示入口 ===== */}
      {page === "home" && (
        <div style={menuGrid}>
          <button onClick={() => go("/dashboard/accounting")} style={menuBtn}>{t.accounting}</button>
          <button onClick={() => go("/dashboard/customers")} style={menuBtn}>{t.customers}</button>
          <button onClick={() => go("/dashboard/products")} style={menuBtn}>{t.products}</button>
          <button onClick={() => go("/dashboard/invoices")} style={menuBtn}>{t.invoices}</button>
        </div>
      )}

      {/* ===== 各页面内容 ===== */}

      {page === "accounting" && (
        <section style={card}>
          <h2>{t.accounting}</h2>
          <p>👉 这里只显示记账系统（不会再看到其他模块）</p>
        </section>
      )}

      {page === "customers" && (
        <section style={card}>
          <h2>{t.customers}</h2>
          <p>👉 这里只显示客户管理</p>
        </section>
      )}

      {page === "products" && (
        <section style={card}>
          <h2>{t.products}</h2>
          <p>👉 这里只显示产品管理</p>
        </section>
      )}

      {page === "invoices" && (
        <section style={card}>
          <h2>{t.invoices}</h2>
          <p>👉 这里只显示发票系统</p>
        </section>
      )}

    </main>
  );
}

/* ===== 样式 ===== */

const pageStyle = {
  minHeight: "100vh",
  padding: 16,
  background: "#f0fdf4",
  fontFamily: "sans-serif",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle = {
  fontSize: 28,
  fontWeight: 900,
  color: "#0F766E",
};

const logoutBtn = {
  background: "#0F766E",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
};

const langRow = {
  display: "flex",
  gap: 8,
  margin: "12px 0",
};

const langBtn = (active: boolean) => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #0F766E",
  background: active ? "#0F766E" : "#fff",
  color: active ? "#fff" : "#0F766E",
});

const menuGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const menuBtn = {
  padding: "16px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#fff",
  fontWeight: 900,
};

const card = {
  marginTop: 20,
  padding: 20,
  background: "#fff",
  borderRadius: 16,
  border: "2px solid #16a34a",
};
