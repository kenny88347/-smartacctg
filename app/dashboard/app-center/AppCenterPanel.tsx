"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DASHBOARD_APP_KEYS_LOCAL,
  DEFAULT_DASHBOARD_APP_KEYS,
} from "../_dashboard/constants";
import {
  isSchemaColumnError,
  safeLocalGet,
  safeLocalSet,
  safeParseArray,
} from "../_dashboard/utils";

type Lang = "zh" | "en" | "ms";

type AppItem = {
  key: string;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
  icon: string;
  path: string;
};

type UserDashboardAppRow = {
  id?: string;
  user_id?: string;
  app_key?: string | null;
  app_id?: string | null;
  pinned?: boolean | null;
  created_at?: string | null;
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

const VALID_APP_KEYS = APPS.map((app) => app.key);

function getDashboardLocalKey(userId: string) {
  return `${DASHBOARD_APP_KEYS_LOCAL}_${userId}`;
}

function normalizeKeys(keys: string[]) {
  return Array.from(new Set(keys))
    .map((key) => String(key || "").trim())
    .filter((key) => key && key !== "app_center")
    .filter((key) => VALID_APP_KEYS.includes(key));
}

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
  q.set("theme", old.get("theme") || "deepTeal");
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
  q.set("theme", old.get("theme") || "deepTeal");
  q.set("refresh", String(Date.now()));

  if (old.get("mode") === "trial") {
    q.set("mode", "trial");
  }

  window.location.href = `/dashboard?${q.toString()}`;
}

async function insertDefaultDashboardApps(userId: string) {
  const rowsWithAppKey = DEFAULT_DASHBOARD_APP_KEYS.map((key) => ({
    user_id: userId,
    app_key: key,
    pinned: true,
  }));

  const first = await supabase.from("user_dashboard_apps").insert(rowsWithAppKey);

  if (!first.error) return;

  const lower = String(first.error.message || "").toLowerCase();
  if (lower.includes("duplicate")) return;

  if (!isSchemaColumnError(first.error.message)) return;

  const rowsWithAppId = DEFAULT_DASHBOARD_APP_KEYS.map((key) => ({
    user_id: userId,
    app_id: key,
    pinned: true,
  }));

  await supabase.from("user_dashboard_apps").insert(rowsWithAppId);
}

async function updateDashboardAppPinned(userId: string, appKey: string, pinned: boolean) {
  let updated = false;

  const byAppKey = await supabase
    .from("user_dashboard_apps")
    .update({ pinned })
    .eq("user_id", userId)
    .eq("app_key", appKey)
    .select("id");

  if (!byAppKey.error && byAppKey.data && byAppKey.data.length > 0) {
    updated = true;
  }

  if (byAppKey.error && !isSchemaColumnError(byAppKey.error.message)) {
    return byAppKey;
  }

  const byAppId = await supabase
    .from("user_dashboard_apps")
    .update({ pinned })
    .eq("user_id", userId)
    .eq("app_id", appKey)
    .select("id");

  if (!byAppId.error && byAppId.data && byAppId.data.length > 0) {
    updated = true;
  }

  if (byAppId.error && !isSchemaColumnError(byAppId.error.message) && !updated) {
    return byAppId;
  }

  if (updated) {
    return { error: null };
  }

  const insertWithAppKey = await supabase.from("user_dashboard_apps").insert({
    user_id: userId,
    app_key: appKey,
    pinned,
  });

  if (!insertWithAppKey.error) return insertWithAppKey;

  const lower = String(insertWithAppKey.error.message || "").toLowerCase();

  if (lower.includes("duplicate")) {
    return updateDashboardAppPinned(userId, appKey, pinned);
  }

  if (!isSchemaColumnError(insertWithAppKey.error.message)) return insertWithAppKey;

  const insertWithAppId = await supabase.from("user_dashboard_apps").insert({
    user_id: userId,
    app_id: appKey,
    pinned,
  });

  if (insertWithAppId.error) {
    const lower2 = String(insertWithAppId.error.message || "").toLowerCase();

    if (lower2.includes("duplicate")) {
      return { error: null };
    }
  }

  return insertWithAppId;
}

export default function AppCenterPanel() {
  const lang = getLang();

  const [userId, setUserId] = useState("");
  const [pinnedKeys, setPinnedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [msg, setMsg] = useState("");

  const text = {
    zh: {
      back: "返回",
      title: "App Center",
      desc: "这里可以管理控制台显示的 App。移除后只会从控制台隐藏，App Center 里面还会保留。",
      open: "打开",
      add: "加到控制台",
      remove: "从控制台移除",
      saved: "已更新",
      localSaved: "已更新（本地保存）",
      loginNeeded: "请先登录",
    },
    en: {
      back: "Back",
      title: "App Center",
      desc: "Manage which apps appear on your dashboard. Removed apps stay available in App Center.",
      open: "Open",
      add: "Add to Dashboard",
      remove: "Remove from Dashboard",
      saved: "Updated",
      localSaved: "Updated locally",
      loginNeeded: "Please login first",
    },
    ms: {
      back: "Kembali",
      title: "App Center",
      desc: "Urus app yang dipaparkan pada dashboard. App yang dibuang masih kekal dalam App Center.",
      open: "Buka",
      add: "Tambah ke Dashboard",
      remove: "Buang dari Dashboard",
      saved: "Dikemas kini",
      localSaved: "Dikemas kini secara lokal",
      loginNeeded: "Sila log masuk dahulu",
    },
  }[lang];

  const pinnedSet = useMemo(() => new Set(pinnedKeys), [pinnedKeys]);

  useEffect(() => {
    loadPinnedApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPinnedApps() {
    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const currentUserId = data.session?.user?.id || "";

    setUserId(currentUserId);

    const defaultKeys = normalizeKeys(DEFAULT_DASHBOARD_APP_KEYS);

    if (!currentUserId) {
      const localKeys = normalizeKeys(safeParseArray<string>(safeLocalGet(DASHBOARD_APP_KEYS_LOCAL)));
      const finalKeys = localKeys.length > 0 ? localKeys : defaultKeys;

      setPinnedKeys(finalKeys);
      safeLocalSet(DASHBOARD_APP_KEYS_LOCAL, JSON.stringify(finalKeys));
      setLoading(false);
      return;
    }

    const userLocalKey = getDashboardLocalKey(currentUserId);
    const localUserKeys = normalizeKeys(safeParseArray<string>(safeLocalGet(userLocalKey)));

    const { data: dashboardData, error } = await supabase
      .from("user_dashboard_apps")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: true });

    if (error) {
      const finalKeys = localUserKeys.length > 0 ? localUserKeys : defaultKeys;

      setPinnedKeys(finalKeys);
      safeLocalSet(userLocalKey, JSON.stringify(finalKeys));
      setLoading(false);
      return;
    }

    const rows = (dashboardData || []) as UserDashboardAppRow[];

    if (rows.length === 0) {
      const finalKeys = localUserKeys.length > 0 ? localUserKeys : defaultKeys;

      setPinnedKeys(finalKeys);
      safeLocalSet(userLocalKey, JSON.stringify(finalKeys));
      await insertDefaultDashboardApps(currentUserId);

      setLoading(false);
      return;
    }

    const dbKeys = normalizeKeys(
      rows
        .filter((row) => row.pinned !== false)
        .map((row) => String(row.app_key || row.app_id || ""))
    );

    const finalKeys =
      dbKeys.length > 0
        ? dbKeys
        : localUserKeys.length > 0
          ? localUserKeys
          : defaultKeys;

    setPinnedKeys(finalKeys);
    safeLocalSet(userLocalKey, JSON.stringify(finalKeys));
    setLoading(false);
  }

  async function togglePinned(appKey: string) {
    if (busyKey) return;

    const fixedKey = String(appKey || "").trim();
    if (!fixedKey) return;

    const isPinned = pinnedKeys.includes(fixedKey);

    const nextKeys = isPinned
      ? pinnedKeys.filter((key) => key !== fixedKey)
      : normalizeKeys([...pinnedKeys, fixedKey]);

    setPinnedKeys(nextKeys);
    setBusyKey(fixedKey);
    setMsg("");

    const localKey = userId ? getDashboardLocalKey(userId) : DASHBOARD_APP_KEYS_LOCAL;
    safeLocalSet(localKey, JSON.stringify(nextKeys));

    if (!userId) {
      setMsg(text.localSaved);
      setBusyKey("");
      return;
    }

    const result = await updateDashboardAppPinned(userId, fixedKey, !isPinned);

    if (result.error) {
      console.warn("App Center update failed:", result.error.message);
      setMsg(text.localSaved);
      setBusyKey("");
      return;
    }

    setMsg(text.saved);
    setBusyKey("");
  }

  return (
    <main className="smartacctg-page smartacctg-dashboard-page" style={pageStyle}>
      <style jsx global>{APP_CENTER_CSS}</style>

      <section className="sa-card" style={mainCardStyle}>
        <button type="button" onClick={backToDashboard} className="sa-back-btn" style={backBtnStyle}>
          ← {text.back}
        </button>

        <h1 style={titleStyle}>{text.title}</h1>

        <p style={descStyle}>{text.desc}</p>

        {msg ? <p style={msgStyle}>{msg}</p> : null}

        <div style={listStyle}>
          {APPS.map((app) => {
            const isPinned = pinnedSet.has(app.key);
            const busy = busyKey === app.key;

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

                  <button
                    type="button"
                    disabled={loading || Boolean(busyKey)}
                    onClick={() => togglePinned(app.key)}
                    style={{
                      ...(isPinned ? removeBtnStyle : addBtnStyle),
                      opacity: loading || busy ? 0.7 : 1,
                    }}
                  >
                    {busy ? "..." : isPinned ? text.remove : text.add}
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

const msgStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 18,
  color: "#5eead4",
  fontSize: 16,
  fontWeight: 900,
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
