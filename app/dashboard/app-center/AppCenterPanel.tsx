"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_DASHBOARD_APP_KEYS,
  getActiveApps,
  getAppDescription,
  getAppTitle,
  getDashboardInitLocalKey,
  getDashboardLocalKey,
  isAppImageIcon,
  normalizeDashboardKeys,
} from "@/lib/appRegistry";
import {
  isSchemaColumnError,
  safeLocalGet,
  safeLocalSet,
  safeParseArray,
} from "../_dashboard/utils";
import type { AppRegistry, Lang } from "../_dashboard/types";

type UserDashboardAppRow = {
  id?: string;
  user_id?: string;
  app_key?: string | null;
  app_id?: string | null;
  pinned?: boolean | null;
  created_at?: string | null;
};

const APPS = getActiveApps();

function getLang(): Lang {
  if (typeof window === "undefined") return "zh";

  const q = new URLSearchParams(window.location.search);
  const lang = q.get("lang");

  if (lang === "en" || lang === "ms" || lang === "zh") return lang;
  return "zh";
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

async function updateDashboardAppPinned(
  userId: string,
  appKey: string,
  pinned: boolean
) {
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

  if (!isSchemaColumnError(insertWithAppKey.error.message)) {
    return insertWithAppKey;
  }

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

async function resetAllDashboardAppsInDb(userId: string, pinnedKeys: string[]) {
  const pinnedSet = new Set(normalizeDashboardKeys(pinnedKeys));

  await Promise.all(
    APPS.map((app) =>
      updateDashboardAppPinned(userId, app.app_key, pinnedSet.has(app.app_key))
    )
  );
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
      pinned: "已在控制台",
      notPinned: "未加入",
    },
    en: {
      back: "Back",
      title: "App Center",
      desc: "Tap an icon to open. Tap + / ✓ to add or remove from dashboard.",
      saved: "Updated",
      localSaved: "Updated locally",
      pinned: "On Dashboard",
      notPinned: "Not Added",
    },
    ms: {
      back: "Kembali",
      title: "App Center",
      desc: "Tekan ikon untuk buka. Tekan + / ✓ untuk tambah atau buang dari dashboard.",
      saved: "Dikemas kini",
      localSaved: "Dikemas kini secara lokal",
      pinned: "Di Dashboard",
      notPinned: "Belum Tambah",
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

    const q = new URLSearchParams(window.location.search);
    const isTrialMode = q.get("mode") === "trial";

    const { data } = await supabase.auth.getSession();
    const currentUserId = data.session?.user?.id || (isTrialMode ? "trial" : "guest");

    setUserId(currentUserId);

    const localKey = getDashboardLocalKey(currentUserId);
    const initKey = getDashboardInitLocalKey(currentUserId);
    const initialized = safeLocalGet(initKey) === "1";
    const localRaw = safeLocalGet(localKey);

    if (!initialized) {
      const firstKeys = normalizeDashboardKeys(DEFAULT_DASHBOARD_APP_KEYS);

      setPinnedKeys(firstKeys);
      safeLocalSet(localKey, JSON.stringify(firstKeys));
      safeLocalSet(initKey, "1");

      if (data.session?.user?.id) {
        await resetAllDashboardAppsInDb(data.session.user.id, firstKeys);
      }

      setLoading(false);
      return;
    }

    if (localRaw !== null) {
      const localKeys = normalizeDashboardKeys(safeParseArray<string>(localRaw));

      setPinnedKeys(localKeys);
      setLoading(false);
      return;
    }

    if (!data.session?.user?.id) {
      setPinnedKeys([]);
      safeLocalSet(localKey, JSON.stringify([]));
      setLoading(false);
      return;
    }

    const { data: dashboardData, error } = await supabase
      .from("user_dashboard_apps")
      .select("*")
      .eq("user_id", data.session.user.id)
      .order("created_at", { ascending: true });

    if (error) {
      setPinnedKeys([]);
      safeLocalSet(localKey, JSON.stringify([]));
      setLoading(false);
      return;
    }

    const rows = (dashboardData || []) as UserDashboardAppRow[];

    const dbKeys = normalizeDashboardKeys(
      rows
        .filter((row) => row.pinned === true)
        .map((row) => String(row.app_key || row.app_id || ""))
    );

    setPinnedKeys(dbKeys);
    safeLocalSet(localKey, JSON.stringify(dbKeys));
    setLoading(false);
  }

  async function togglePinned(appKey: string) {
    if (busyKey) return;

    const fixedKey = String(appKey || "").trim();
    if (!fixedKey) return;

    const isPinned = pinnedKeys.includes(fixedKey);

    const nextKeys = isPinned
      ? pinnedKeys.filter((key) => key !== fixedKey)
      : normalizeDashboardKeys([...pinnedKeys, fixedKey]);

    setPinnedKeys(nextKeys);
    setBusyKey(fixedKey);
    setMsg("");

    const fixedUserId = userId || "guest";
    const localKey = getDashboardLocalKey(fixedUserId);
    const initKey = getDashboardInitLocalKey(fixedUserId);

    safeLocalSet(localKey, JSON.stringify(nextKeys));
    safeLocalSet(initKey, "1");

    if (!userId || userId === "guest" || userId === "trial") {
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
    <main className="smartacctg-page smartacctg-dashboard-page sa-app-center-page">
      <section className="sa-card sa-app-center-card">
        <button
          type="button"
          onClick={backToDashboard}
          className="sa-back-btn sa-app-center-back"
        >
          ← {text.back}
        </button>

        <h1 className="sa-app-center-title">{text.title}</h1>

        <p className="sa-app-center-desc">{text.desc}</p>

        {msg ? <p className="sa-app-center-msg">{msg}</p> : null}

        <div className="sa-app-icon-grid">
          {APPS.map((app) => {
            const isPinned = pinnedSet.has(app.app_key);
            const busy = busyKey === app.app_key;
            const title = getAppTitle(app, lang);
            const desc = getAppDescription(app, lang);
            const icon = app.icon || "📱";
            const imageIcon = isAppImageIcon(icon);

            return (
              <div key={app.app_key} className="sa-app-icon-item">
                <div className="sa-app-icon-wrap">
                  <button
                    type="button"
                    onClick={() => openApp(app)}
                    onPointerDown={() => startLongPress(app.app_key)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onPointerCancel={cancelLongPress}
                    onContextMenu={(e) => e.preventDefault()}
                    className="app-main-icon sa-app-main-icon"
                    aria-label={title}
                  >
                    {imageIcon ? (
                      <img
                        src={icon}
                        alt={title}
                        className="sa-app-icon-img"
                      />
                    ) : (
                      <span className="sa-app-icon-emoji">{icon}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={loading || Boolean(busyKey)}
                    onClick={() => togglePinned(app.app_key)}
                    className={`app-pin-dot sa-app-pin-dot ${
                      isPinned ? "is-pinned" : "is-not-pinned"
                    }`}
                    aria-label={isPinned ? text.pinned : text.notPinned}
                  >
                    {busy ? "…" : isPinned ? "✓" : "+"}
                  </button>
                </div>

                <div className="sa-app-icon-name">{title}</div>

                <div className="sa-app-icon-desc">{desc}</div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
