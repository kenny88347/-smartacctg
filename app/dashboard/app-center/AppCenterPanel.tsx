"use client";

import { CSSProperties } from "react";

type Lang = "zh" | "en" | "ms";

type AppItem = {
  key: string;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
  icon: string;
  path: string;
};

const APPS: AppItem[] = [
  {
    key: "records",
    title: {
      zh: "记账系统",
      en: "Accounting",
      ms: "Sistem Akaun",
    },
    desc: {
      zh: "管理收入、支出、欠款和帐目记录",
      en: "Manage income, expenses, debts and accounting records",
      ms: "Urus pendapatan, perbelanjaan, hutang dan rekod akaun",
    },
    icon: "🧾",
    path: "/dashboard/records",
  },
  {
    key: "customers",
    title: {
      zh: "客户管理",
      en: "Customers",
      ms: "Pelanggan",
    },
    desc: {
      zh: "管理客户资料、电话、公司和欠款",
      en: "Manage customer info, phone, company and debt",
      ms: "Urus maklumat pelanggan, telefon, syarikat dan hutang",
    },
    icon: "👥",
    path: "/dashboard/customers",
  },
  {
    key: "products",
    title: {
      zh: "产品管理",
      en: "Products",
      ms: "Produk",
    },
    desc: {
      zh: "管理产品、成本、售价和库存",
      en: "Manage products, cost, selling price and stock",
      ms: "Urus produk, kos, harga jualan dan stok",
    },
    icon: "📦",
    path: "/dashboard/products",
  },
  {
    key: "invoices",
    title: {
      zh: "发票系统",
      en: "Invoices",
      ms: "Invois",
    },
    desc: {
      zh: "建立发票、扣库存和保存销售记录",
      en: "Create invoices, deduct stock and save sales records",
      ms: "Buat invois, tolak stok dan simpan rekod jualan",
    },
    icon: "🧾",
    path: "/dashboard/invoices",
  },
  {
    key: "extensions",
    title: {
      zh: "扩展功能",
      en: "Extensions",
      ms: "Fungsi Tambahan",
    },
    desc: {
      zh: "管理更多附加功能和未来模块",
      en: "Manage add-ons and future modules",
      ms: "Urus fungsi tambahan dan modul akan datang",
    },
    icon: "🧩",
    path: "/dashboard/extensions",
  },
  {
    key: "nkshop",
    title: {
      zh: "NK网店",
      en: "NK Shop",
      ms: "NK Kedai",
    },
    desc: {
      zh: "网店、下单和商品展示功能",
      en: "Shop, order and product display features",
      ms: "Kedai, pesanan dan paparan produk",
    },
    icon: "🛒",
    path: "/dashboard/nkshop",
  },
];

function getLang(): Lang {
  if (typeof window === "undefined") return "zh";

  const q = new URLSearchParams(window.location.search);
  const lang = q.get("lang");

  if (lang === "en" || lang === "ms" || lang === "zh") return lang;
  return "zh";
}

function buildUrl(path: string) {
  if (typeof window === "undefined") return path;

  const old = new URLSearchParams(window.location.search);
  const q = new URLSearchParams();

  q.set("lang", old.get("lang") || "zh");
  q.set("theme", old.get("theme") || "futureWorld");
  q.set("fullscreen", "1");
  q.set("return", "dashboard");
  q.set("refresh", String(Date.now()));

  if (old.get("mode") === "trial") {
    q.set("mode", "trial");
  }

  return `${path}?${q.toString()}`;
}

function backToDashboard() {
  if (typeof window === "undefined") return;

  const old = new URLSearchParams(window.location.search);
  const q = new URLSearchParams();

  q.set("lang", old.get("lang") || "zh");
  q.set("theme", old.get("theme") || "futureWorld");
  q.set("refresh", String(Date.now()));

  if (old.get("mode") === "trial") {
    q.set("mode", "trial");
  }

  window.location.href = `/dashboard?${q.toString()}`;
}

export default function AppCenterPanel() {
  const lang = getLang();

  const text = {
    zh: {
      back: "返回",
      title: "App Center",
      desc: "这里可以管理控制台显示的 App。移除后只会从控制台隐藏，App Center 里面还会保留。",
      open: "打开",
      add: "加到控制台",
      remove: "从控制台移除",
    },
    en: {
      back: "Back",
      title: "App Center",
      desc: "Manage which apps appear on your dashboard. Removed apps stay available in App Center.",
      open: "Open",
      add: "Add to Dashboard",
      remove: "Remove from Dashboard",
    },
    ms: {
      back: "Kembali",
      title: "App Center",
      desc: "Urus app yang dipaparkan pada dashboard. App yang dibuang masih kekal dalam App Center.",
      open: "Buka",
      add: "Tambah ke Dashboard",
      remove: "Buang dari Dashboard",
    },
  }[lang];

  return (
    <main className="smartacctg-page smartacctg-dashboard-page" style={pageStyle}>
      <style jsx global>{APP_CENTER_CSS}</style>

      <section className="sa-card" style={mainCardStyle}>
        <button type="button" onClick={backToDashboard} className="sa-back-btn" style={backBtnStyle}>
          ← {text.back}
        </button>

        <h1 style={titleStyle}>{text.title}</h1>

        <p style={descStyle}>{text.desc}</p>

        <div style={listStyle}>
          {APPS.map((app, index) => {
            const isFirst = index === 0;

            return (
              <div key={app.key} className="app-center-card" style={appCardStyle}>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = buildUrl(app.path);
                  }}
                  className="app-center-icon"
                  style={iconButtonStyle}
                >
                  <span style={iconEmojiStyle}>{app.icon}</span>
                </button>

                <div style={appTextStyle}>
                  <h2 style={appTitleStyle}>{app.title[lang]}</h2>
                  <p style={appDescStyle}>{app.desc[lang]}</p>
                </div>

                <div style={actionRowStyle}>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = buildUrl(app.path);
                    }}
                    style={openBtnStyle}
                  >
                    {text.open}
                  </button>

                  <button type="button" style={isFirst ? removeBtnStyle : addBtnStyle}>
                    {isFirst ? text.remove : text.add}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const APP_CENTER_CSS = `
  .smartacctg-page,
  .smartacctg-page * {
    box-sizing: border-box !important;
  }

  .smartacctg-page {
    width: 100% !important;
    max-width: 100vw !important;
    min-height: 100vh !important;
    overflow-x: hidden !important;
  }

  .smartacctg-page .app-center-card {
    width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  .smartacctg-page .app-center-icon {
    width: 100% !important;
    aspect-ratio: 1 / 1 !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
  }

  @media (max-width: 520px) {
    .smartacctg-page .app-center-card {
      grid-template-columns: minmax(110px, 30%) minmax(0, 1fr) !important;
      gap: 14px !important;
    }
  }

  @media (max-width: 390px) {
    .smartacctg-page .app-center-card {
      grid-template-columns: minmax(92px, 30%) minmax(0, 1fr) !important;
      gap: 12px !important;
    }
  }
`;

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  padding: "clamp(12px, 3vw, 22px)",
  background:
    "radial-gradient(circle at 8% 0%, rgba(45, 212, 191, 0.32), transparent 30%), radial-gradient(circle at 92% 8%, rgba(20, 184, 166, 0.22), transparent 32%), linear-gradient(135deg, #011c1a 0%, #032b29 38%, #064e3b 100%)",
  color: "#ecfeff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
};

const mainCardStyle: CSSProperties = {
  border: "2px solid #2dd4bf",
  borderRadius: "clamp(22px, 5vw, 32px)",
  padding: "clamp(18px, 5vw, 28px)",
  background: "rgba(6, 47, 42, 0.94)",
  color: "#ecfeff",
  boxShadow:
    "0 0 0 1px rgba(45, 212, 191, 0.55), 0 0 26px rgba(45, 212, 191, 0.42), 0 22px 58px rgba(6, 78, 59, 0.62)",
};

const backBtnStyle: CSSProperties = {
  minHeight: 54,
  border: "2px solid #2dd4bf",
  borderRadius: 18,
  padding: "0 18px",
  background: "#ecfeff",
  color: "#2dd4bf",
  fontWeight: 900,
  fontSize: 16,
  marginBottom: 22,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(32px, 8vw, 46px)",
  lineHeight: 1.08,
  fontWeight: 900,
};

const descStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 24,
  color: "#99f6e4",
  fontSize: "clamp(18px, 4.6vw, 24px)",
  lineHeight: 1.5,
  fontWeight: 700,
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: 18,
};

const appCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(120px, 30%) minmax(0, 1fr)",
  gap: 16,
  alignItems: "center",
  border: "2px solid #2dd4bf",
  borderRadius: 28,
  padding: "clamp(14px, 4vw, 22px)",
  background: "rgba(8, 64, 57, 0.86)",
  color: "#ecfeff",
};

const iconButtonStyle: CSSProperties = {
  border: "2px solid #2dd4bf",
  borderRadius: 22,
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,255,255,0.76))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 22px rgba(15,23,42,0.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  padding: 0,
};

const iconEmojiStyle: CSSProperties = {
  fontSize: "clamp(38px, 11vw, 64px)",
  lineHeight: 1,
};

const appTextStyle: CSSProperties = {
  minWidth: 0,
};

const appTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(24px, 6vw, 36px)",
  lineHeight: 1.2,
  fontWeight: 900,
  overflowWrap: "anywhere",
};

const appDescStyle: CSSProperties = {
  marginTop: 10,
  marginBottom: 0,
  color: "#99f6e4",
  fontSize: "clamp(17px, 4.6vw, 24px)",
  lineHeight: 1.42,
  fontWeight: 700,
  overflowWrap: "anywhere",
};

const actionRowStyle: CSSProperties = {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

const openBtnStyle: CSSProperties = {
  minHeight: 58,
  border: "none",
  borderRadius: 18,
  background: "#35d0c0",
  color: "#ffffff",
  fontSize: 17,
  fontWeight: 900,
};

const addBtnStyle: CSSProperties = {
  minHeight: 58,
  border: "2px solid #2dd4bf",
  borderRadius: 18,
  background: "#ecfeff",
  color: "#2dd4bf",
  fontSize: 17,
  fontWeight: 900,
};

const removeBtnStyle: CSSProperties = {
  minHeight: 58,
  border: "2px solid #fecaca",
  borderRadius: 18,
  background: "#ffffff",
  color: "#dc2626",
  fontSize: 17,
  fontWeight: 900,
};
