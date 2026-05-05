"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DASHBOARD_APP_KEYS_LOCAL,
  DEFAULT_APPS,
  DEFAULT_DASHBOARD_APP_KEYS,
} from "../_dashboard/constants";
import {
  isImageIcon,
  isSchemaColumnError,
  safeLocalGet,
  safeLocalSet,
  safeParseArray,
} from "../_dashboard/utils";
import type { AppRegistry, Lang } from "../_dashboard/types";
import {
  AppIconButton,
  AppIconImage,
  AppPinButton,
} from "@/app/components/buttons/AppCenterButtons";

type UserDashboardAppRow = {
  id?: string;
  user_id?: string;
  app_key?: string | null;
  app_id?: string | null;
  pinned?: boolean | null;
  created_at?: string | null;
};

const APPS: AppRegistry[] = DEFAULT_APPS.filter(
  (app) => app.app_key !== "app_center" && app.enabled !== false && app.is_active !== false
).sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));

const VALID_APP_KEYS = APPS.map((app) => app.app_key);

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

function getAppTitle(app: AppRegistry, lang: Lang) {
  if (lang === "en") return app.title_en || app.title_zh || app.name || app.app_key;
  if (lang === "ms") return app.title_ms || app.title_zh || app.name || app.app_key;
  return app.title_zh || app.name || app.title_en || app.app_key;
}

function normalizeIconPath(src?: string | null) {
  const raw = String(src || "").trim();
  if (!raw) return "";

  if (raw.startsWith("/app-icons/")) {
    const filename = raw.split("/").pop() || "";
    const baseName = filename.replace(/\.(png|PNG|jpg|jpeg|webp|svg)$/i, "");

    return `/app-icons/${baseName}.PNG`;
  }

  return raw;
}

function buildUrl(path?: string | null) {
  const fixedPath = String(path || "/dashboard").trim();

  if (typeof window === "undefined") return fixedPath;

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

  return `${fixedPath}?${q.toString()}`;
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

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const text = {
    zh: {
      back: "返回",
      title: "App Center",
      desc: "点击图标打开 App，点击右上角 + / ✓ 加入或移除控制台。",
      saved: "已更新",
      localSaved: "已更新（本地保存）",
    },
    en: {
      back: "Back",
      title: "App Center",
      desc: "Tap an icon to open. Tap + / ✓ to add or remove from dashboard.",
      saved: "Updated",
      localSaved: "Updated locally",
    },
    ms: {
      back: "Kembali",
      title: "App Center",
      desc: "Tekan ikon untuk buka. Tekan + / ✓ untuk tambah atau buang dari dashboard.",
      saved: "Dikemas kini",
      localSaved: "Dikemas kini secara lokal",
    },
  }[lang];

  const pinnedSet = useMemo(() => new Set(pinnedKeys), [pinnedKeys]);

  useEffect(() => {
    loadPinnedApps();

    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };

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

  function startLongPress(appKey: string) {
    longPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        (navigator as any).vibrate?.(25);
      }

      togglePinned(appKey);
    }, 650);
  }

  function cancelLongPress() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function openApp(app: AppRegistry) {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    window.location.href = buildUrl(app.app_path || "/dashboard");
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

        <div className="app-icon-grid" style={iconGridStyle}>
          {APPS.map((app) => {
            const isPinned = pinnedSet.has(app.app_key);
            const busy = busyKey === app.app_key;
            const title = getAppTitle(app, lang);
            const icon = normalizeIconPath(app.icon || "📱");
            const imageIcon = isImageIcon(icon);

            return (
              <div key={app.app_key} className="app-icon-item" style={iconItemStyle}>
                <div className="app-icon-wrap" style={iconWrapStyle}>
                  <AppIconButton
                    title={title}
                    onClick={() => openApp(app)}
                    onPointerDown={() => startLongPress(app.app_key)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onPointerCancel={cancelLongPress}
                  >
                    {imageIcon ? (
                      <AppIconImage src={icon} alt={title} />
                    ) : (
                      <span style={appIconEmojiStyle}>{icon}</span>
                    )}
                  </AppIconButton>

                  <AppPinButton
                    pinned={isPinned}
                    busy={busy}
                    disabled={loading || Boolean(busyKey)}
                    onClick={() => togglePinned(app.app_key)}
                  />
                </div>

                <div className="app-name" style={appNameStyle}>
                  {title}
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

  .app-icon-grid {
    width: 100% !important;
  }

  .app-main-icon,
  .app-pin-dot {
    -webkit-tap-highlight-color: transparent !important;
    touch-action: manipulation !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
  }

  .app-main-icon {
    width: 70px !important;
    height: 70px !important;
    min-width: 70px !important;
    min-height: 70px !important;
    max-width: 70px !important;
    max-height: 70px !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .app-icon-img {
    width: 70px !important;
    height: 70px !important;
    min-width: 70px !important;
    min-height: 70px !important;
    max-width: 70px !important;
    max-height: 70px !important;
    background: transparent !important;
  }

  .app-pin-dot {
    width: 22px !important;
    height: 22px !important;
    min-width: 22px !important;
    min-height: 22px !important;
    max-width: 22px !important;
    max-height: 22px !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 13px !important;
    line-height: 1 !important;
  }

  .app-name {
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }

  @media (max-width: 430px) {
    .app-icon-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 26px 10px !important;
    }

    .app-icon-wrap {
      width: 64px !important;
      height: 64px !important;
    }

    .app-main-icon,
    .app-icon-img {
      width: 64px !important;
      height: 64px !important;
      min-width: 64px !important;
      min-height: 64px !important;
      max-width: 64px !important;
      max-height: 64px !important;
      border-radius: 18px !important;
    }

    .app-icon-item {
      min-width: 0 !important;
    }

    .app-pin-dot {
      width: 21px !important;
      height: 21px !important;
      min-width: 21px !important;
      min-height: 21px !important;
      max-width: 21px !important;
      max-height: 21px !important;
      font-size: 12px !important;
      top: -3px !important;
      right: -3px !important;
      border-width: 1.5px !important;
      padding: 0 !important;
    }
  }

  @media (max-width: 360px) {
    .app-icon-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 24px 8px !important;
    }

    .app-icon-wrap,
    .app-main-icon,
    .app-icon-img {
      width: 58px !important;
      height: 58px !important;
      min-width: 58px !important;
      min-height: 58px !important;
      max-width: 58px !important;
      max-height: 58px !important;
    }

    .app-pin-dot {
      width: 20px !important;
      height: 20px !important;
      min-width: 20px !important;
      min-height: 20px !important;
      max-width: 20px !important;
      max-height: 20px !important;
      font-size: 11px !important;
      top: -3px !important;
      right: -3px !important;
      border-width: 1.4px !important;
      padding: 0 !important;
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
  minHeight: 50,
  border: "2px solid #2dd4bf",
  borderRadius: 18,
  padding: "0 18px",
  background: "#ecfeff",
  color: "#2dd4bf",
  fontWeight: 900,
  fontSize: 16,
  marginBottom: 20,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(30px, 8vw, 44px)",
  lineHeight: 1.08,
  fontWeight: 900,
};

const descStyle: CSSProperties = {
  marginTop: 14,
  marginBottom: 12,
  color: "#99f6e4",
  fontSize: "clamp(13px, 3.6vw, 16px)",
  lineHeight: 1.42,
  fontWeight: 700,
};

const msgStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  color: "#5eead4",
  fontSize: 13,
  fontWeight: 900,
};

const iconGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "28px 12px",
  alignItems: "start",
  justifyItems: "center",
  marginTop: 20,
};

const iconItemStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  display: "grid",
  justifyItems: "center",
  textAlign: "center",
  gap: 8,
};

const iconWrapStyle: CSSProperties = {
  position: "relative",
  width: 70,
  height: 70,
};

const appIconEmojiStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: 20,
  background:
    "radial-gradient(circle at 28% 20%, #ffffff 0%, #dffdf8 20%, #5eead4 48%, #0f766e 100%)",
  border: "2px solid rgba(94, 234, 212, 0.95)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 30,
  lineHeight: 1,
  filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.28))",
};

const appNameStyle: CSSProperties = {
  width: "100%",
  maxWidth: 92,
  color: "#ecfeff",
  fontSize: "clamp(12px, 3.2vw, 14px)",
  lineHeight: 1.18,
  fontWeight: 900,
  overflowWrap: "anywhere",
};
