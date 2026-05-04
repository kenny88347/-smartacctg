import {
  THEMES,
  type ThemeKey,
  applyThemeToDocument,
  normalizeThemeKey,
} from "@/lib/smartacctgTheme";
import type { AppRegistry, Invoice, Lang, UserDashboardApp } from "./types";
import { DEFAULT_APPS } from "./constants";

export function safeLocalGet(key: string) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function safeLocalSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

export function safeLocalRemove(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function applyThemeEverywhere(key: ThemeKey) {
  if (typeof document === "undefined") return;

  const fixedKey = normalizeThemeKey(key);
  const theme = (THEMES[fixedKey] || THEMES.deepTeal) as any;

  applyThemeToDocument(fixedKey);

  document.documentElement.setAttribute("data-sa-theme", fixedKey);
  document.documentElement.setAttribute("data-smartacctg-theme", fixedKey);

  document.documentElement.style.setProperty("--sa-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-card-bg", theme.card);
  document.documentElement.style.setProperty("--sa-panel-bg", theme.panelBg || theme.card);
  document.documentElement.style.setProperty("--sa-item-bg", theme.itemBg || theme.card);
  document.documentElement.style.setProperty(
    "--sa-item-card",
    theme.itemCard || theme.itemBg || theme.card
  );
  document.documentElement.style.setProperty(
    "--sa-item-text",
    theme.itemText || theme.panelText || theme.text
  );
  document.documentElement.style.setProperty("--sa-input-bg", theme.inputBg || "#ffffff");
  document.documentElement.style.setProperty("--sa-input-text", theme.inputText || "#111827");
  document.documentElement.style.setProperty("--sa-border", theme.border);
  document.documentElement.style.setProperty("--sa-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-text", theme.text);
  document.documentElement.style.setProperty("--sa-panel-text", theme.panelText || theme.text);
  document.documentElement.style.setProperty("--sa-muted", theme.muted || theme.subText || "#64748b");
  document.documentElement.style.setProperty("--sa-sub-text", theme.subText || theme.muted || "#64748b");
  document.documentElement.style.setProperty("--sa-soft-bg", theme.softBg || theme.soft || theme.card);
  document.documentElement.style.setProperty("--sa-banner-bg", theme.banner || theme.card);
  document.documentElement.style.setProperty("--sa-glow", theme.glow);
}

export function replaceUrlLangTheme(nextLang: Lang, nextTheme: ThemeKey) {
  if (typeof window === "undefined") return;

  const q = new URLSearchParams(window.location.search);
  q.set("lang", nextLang);
  q.set("theme", nextTheme);
  q.set("refresh", String(Date.now()));

  window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
}

export function formatRM(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getMonthKey(date?: string | null) {
  if (!date) return "";
  return String(date).slice(0, 7);
}

export function getDueTime(date?: string | null) {
  if (!date) return Number.MAX_SAFE_INTEGER;

  const time = new Date(`${date}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export function isInvoiceUnpaid(inv: Invoice) {
  const status = String(inv.status || "").toLowerCase();

  if (status === "paid" || status === "cancelled" || status === "canceled") {
    return false;
  }

  return Number(inv.total || 0) > 0;
}

export function isImageIcon(icon?: string | null) {
  const raw = String(icon || "").trim();

  return (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:image") ||
    raw.startsWith("/")
  );
}

export function isSchemaColumnError(message?: string | null) {
  const lower = String(message || "").toLowerCase();

  return (
    lower.includes("schema cache") ||
    lower.includes("could not find") ||
    lower.includes("column") ||
    lower.includes("does not exist")
  );
}

export function normalizeApp(row: any): AppRegistry {
  const appKey = String(row?.app_key || row?.app_id || row?.key || row?.slug || row?.id || "").trim();

  return {
    id: row?.id,
    app_key: appKey,
    title_zh: row?.title_zh || row?.name_zh || row?.title || row?.name || "",
    title_en: row?.title_en || row?.name_en || row?.title || row?.name || "",
    title_ms: row?.title_ms || row?.name_ms || row?.title || row?.name || "",
    name: row?.name || row?.title || "",
    icon: row?.icon || row?.icon_url || row?.emoji || "📱",
    app_path: row?.app_path || row?.path || row?.url || "",
    component_key: row?.component_key || "",
    description_zh: row?.description_zh || row?.description || "",
    description_en: row?.description_en || row?.description || "",
    description_ms: row?.description_ms || row?.description || "",
    sort_order: Number(row?.sort_order || 999),
    enabled: row?.enabled !== false,
    is_active: row?.enabled !== false && row?.is_active !== false,
    is_system: Boolean(row?.is_system),
  };
}

export function mergeAppsWithDefaults(remoteRows: any[] = []) {
  const map = new Map<string, AppRegistry>();
  const defaultKeySet = new Set(DEFAULT_APPS.map((app) => app.app_key));

  DEFAULT_APPS.forEach((app) => {
    map.set(app.app_key, {
      ...app,
      enabled: true,
      is_active: true,
    });
  });

  remoteRows
    .map(normalizeApp)
    .filter((app) => app.app_key)
    .filter((app) => app.app_key !== "app_center")
    .forEach((remoteApp) => {
      const oldApp = map.get(remoteApp.app_key);
      const isDefaultApp = defaultKeySet.has(remoteApp.app_key);

      map.set(remoteApp.app_key, {
        ...(oldApp || {}),
        ...remoteApp,
        app_key: remoteApp.app_key,
        title_zh: remoteApp.title_zh || oldApp?.title_zh || remoteApp.app_key,
        title_en:
          remoteApp.title_en ||
          oldApp?.title_en ||
          remoteApp.title_zh ||
          oldApp?.title_zh ||
          remoteApp.app_key,
        title_ms:
          remoteApp.title_ms ||
          oldApp?.title_ms ||
          remoteApp.title_zh ||
          oldApp?.title_zh ||
          remoteApp.app_key,
        icon: remoteApp.icon || oldApp?.icon || "📱",
        app_path: remoteApp.app_path || oldApp?.app_path || "",
        sort_order: Number(remoteApp.sort_order || oldApp?.sort_order || 999),
        enabled: isDefaultApp ? true : remoteApp.enabled !== false,
        is_active: isDefaultApp ? true : remoteApp.is_active !== false,
      });
    });

  return Array.from(map.values())
    .filter((app) => app.app_key !== "app_center")
    .filter((app) => app.enabled !== false && app.is_active !== false)
    .sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));
}

export function getDashboardRowKey(row: UserDashboardApp) {
  return String(row.app_key || row.app_id || "").trim();
}

export function appTitle(app: AppRegistry, lang: Lang) {
  if (lang === "en") return app.title_en || app.title_zh || app.name || app.app_key;
  if (lang === "ms") return app.title_ms || app.title_zh || app.name || app.app_key;
  return app.title_zh || app.name || app.title_en || app.app_key;
}

export function appDescription(app: AppRegistry, lang: Lang) {
  if (lang === "en") return app.description_en || app.description_zh || "";
  if (lang === "ms") return app.description_ms || app.description_zh || "";
  return app.description_zh || app.description_en || "";
}
