"use client";

import {
  ChangeEvent,
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  THEME_KEY as SMARTACCTG_THEME_KEY,
  type ThemeKey,
  getThemeKeyFromUrlOrLocalStorage,
  isThemeKey,
  normalizeThemeKey,
  saveThemeKey,
} from "@/lib/smartacctgTheme";
import {
  APP_CENTER_APP,
  DEFAULT_APPS,
  DEFAULT_DASHBOARD_APP_KEYS,
  DASHBOARD_APP_KEYS_LOCAL,
  NK_LOGO_FALLBACK_SRC,
  NK_LOGO_SRC,
  getDashboardInitLocalKey,
  getDashboardLocalKey,
  normalizeDashboardKeys,
} from "@/lib/appRegistry";

import type {
  AppRegistry,
  Customer,
  DebtItem,
  Invoice,
  Lang,
  PageKey,
  Profile,
  Txn,
  UserDashboardApp,
} from "./_dashboard/types";

import {
  LANG_KEY,
  TRIAL_CUSTOMERS_KEY,
  TRIAL_INVOICES_KEY,
  TRIAL_KEY,
  TRIAL_TX_KEY,
  TXT,
} from "./_dashboard/constants";

import { DASHBOARD_FIX_CSS } from "./_dashboard/dashboardFixCss";

import {
  appTitle,
  applyThemeEverywhere,
  formatRM,
  getDashboardRowKey,
  getDueTime,
  getMonthKey,
  isImageIcon,
  isInvoiceUnpaid,
  isSchemaColumnError,
  replaceUrlLangTheme,
  safeLocalGet,
  safeLocalRemove,
  safeLocalSet,
  safeParseArray,
} from "./_dashboard/utils";

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "zh";

  const q = new URLSearchParams(window.location.search);
  const urlLang = q.get("lang") as Lang | null;
  const savedLang = safeLocalGet(LANG_KEY) as Lang | null;

  if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") return urlLang;
  if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") return savedLang;

  return "zh";
}

export default function DashboardClient({ page }: { page: PageKey }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);
  const [isFullscreenPage, setIsFullscreenPage] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [appsLoaded, setAppsLoaded] = useState(false);
  const [allApps, setAllApps] = useState<AppRegistry[]>(DEFAULT_APPS);
  const [dashboardAppKeys, setDashboardAppKeys] = useState<string[]>([]);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showRecordSummary, setShowRecordSummary] = useState(false);
  const [showDebtSummary, setShowDebtSummary] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const [deleteAppTarget, setDeleteAppTarget] = useState<AppRegistry | null>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const t = TXT[lang];
  const theme = (THEMES[themeKey] || THEMES.deepTeal) as any;
  const themeMuted = theme.muted || theme.subText || "#64748b";

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  const themedCardStyle: CSSProperties = {
    background: theme.card,
    borderColor: theme.border,
    boxShadow: theme.glow,
    color: theme.text,
  };

  const themeChoices = useMemo(() => {
    const seen = new Set<string>();

    return (Object.keys(THEMES) as string[])
      .filter((key) => isThemeKey(key))
      .filter((key) => {
        const item = (THEMES[key as ThemeKey] || {}) as any;
        const name = item.name || key;

        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      }) as ThemeKey[];
  }, []);

  const dashboardApps = useMemo(() => {
    if (!appsLoaded) return [];

    const activeApps = allApps.filter(
      (app) =>
        app.is_active !== false &&
        app.enabled !== false &&
        app.app_key !== "app_center"
    );

    return dashboardAppKeys
      .filter((key) => key !== "app_center")
      .map((key) => activeApps.find((app) => app.app_key === key))
      .filter(Boolean) as AppRegistry[];
  }, [appsLoaded, allApps, dashboardAppKeys]);

  useEffect(() => {
    applyThemeEverywhere(themeKey);
  }, [themeKey]);

  useEffect(() => {
    const initialLang = getInitialLang();
    const initialTheme = getThemeKeyFromUrlOrLocalStorage("deepTeal");

    setLang(initialLang);
    safeLocalSet(LANG_KEY, initialLang);

    setThemeKey(initialTheme);
    saveThemeKey(initialTheme);
    applyThemeEverywhere(initialTheme);

    init(initialLang, initialTheme);

    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = safeLocalGet(TRIAL_KEY);

    setIsEmbed(q.get("embed") === "1");
    setIsFullscreenPage(q.get("fullscreen") === "1");

    if (mode === "trial" && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSession(null);
          setProfile(null);

          setTransactions(safeParseArray<Txn>(safeLocalGet(TRIAL_TX_KEY)));
          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));

          await loadAppsForUser("trial", true);

          replaceUrlLangTheme(currentLang, currentTheme);
          return;
        }
      } catch {
        // ignore bad trial data
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_TX_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
      safeLocalRemove(TRIAL_INVOICES_KEY);
      window.location.href = "/zh";
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/zh";
      return;
    }

    setIsTrial(false);
    setSession(data.session);

    const userId = data.session.user.id;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    let finalTheme = currentTheme;

    if (profileData) {
      const p = profileData as Profile;

      setProfile(p);
      setFullName(p.full_name || "");
      setPhone(p.phone || "");
      setCompanyName(p.company_name || "");
      setCompanyRegNo(p.company_reg_no || "");
      setCompanyPhone(p.company_phone || "");
      setCompanyAddress(p.company_address || "");

      finalTheme = normalizeThemeKey(p.theme || currentTheme);
    }

    safeLocalRemove(SMARTACCTG_THEME_KEY);
    setThemeKey(finalTheme);
    saveThemeKey(finalTheme);
    applyThemeEverywhere(finalTheme);
    replaceUrlLangTheme(currentLang, finalTheme);

    await loadAll(userId);
    await loadAppsForUser(userId, false);
  }

  async function loadAll(userId: string) {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("txn_date", { ascending: false });

    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setTransactions((txData || []) as Txn[]);
    setCustomers((customerData || []) as Customer[]);
    setInvoices((invoiceData || []) as Invoice[]);
  }

  async function resetAllDashboardAppsInDb(userId: string, pinnedKeys: string[]) {
    const pinnedSet = new Set(normalizeDashboardKeys(pinnedKeys));

    await Promise.all(
      DEFAULT_APPS.map((app) =>
        updateDashboardAppPinned(userId, app.app_key, pinnedSet.has(app.app_key))
      )
    );
  }

  async function loadAppsForUser(userId: string, trialMode: boolean) {
    setAppsLoaded(false);

    /**
     * 重点：
     * 这里不再读取 Supabase app_registry，
     * 避免旧 app_registry 图标覆盖你 public/app-icons 的新图标。
     */
    const registry = DEFAULT_APPS.filter(
      (app) =>
        app.app_key !== "app_center" &&
        app.enabled !== false &&
        app.is_active !== false
    ).sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));

    setAllApps(registry);

    const availableKeySet = new Set(registry.map((app) => app.app_key));

    const fixedDefaultKeys = normalizeDashboardKeys(DEFAULT_DASHBOARD_APP_KEYS).filter((key) =>
      availableKeySet.has(key)
    );

    const localKey = trialMode ? getDashboardLocalKey("trial") : getDashboardLocalKey(userId);
    const initKey = trialMode
      ? getDashboardInitLocalKey("trial")
      : getDashboardInitLocalKey(userId);

    const initialized = safeLocalGet(initKey) === "1";
    const localRaw = safeLocalGet(localKey);

    /**
     * 第一次使用 v2：
     * 控制台默认不显示任何 App。
     */
    if (!initialized) {
      setDashboardAppKeys(fixedDefaultKeys);
      safeLocalSet(localKey, JSON.stringify(fixedDefaultKeys));
      safeLocalSet(initKey, "1");

      if (!trialMode) {
        await resetAllDashboardAppsInDb(userId, fixedDefaultKeys);
      }

      setAppsLoaded(true);
      return;
    }

    /**
     * 有本地记录，就以本地为准。
     */
    if (localRaw !== null) {
      const localKeys = normalizeDashboardKeys(safeParseArray<string>(localRaw)).filter((key) =>
        availableKeySet.has(key)
      );

      setDashboardAppKeys(localKeys);
      setAppsLoaded(true);
      return;
    }

    if (trialMode) {
      setDashboardAppKeys(fixedDefaultKeys);
      safeLocalSet(localKey, JSON.stringify(fixedDefaultKeys));
      setAppsLoaded(true);
      return;
    }

    const { data: dashboardData, error: dashboardError } = await supabase
      .from("user_dashboard_apps")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (dashboardError) {
      setDashboardAppKeys(fixedDefaultKeys);
      safeLocalSet(localKey, JSON.stringify(fixedDefaultKeys));
      setAppsLoaded(true);
      return;
    }

    const rows = (dashboardData || []) as UserDashboardApp[];

    const dbKeys = normalizeDashboardKeys(
      rows
        .filter((row) => row.pinned === true)
        .map(getDashboardRowKey)
        .filter(Boolean)
    ).filter((key) => availableKeySet.has(key));

    setDashboardAppKeys(dbKeys);
    safeLocalSet(localKey, JSON.stringify(dbKeys));
    setAppsLoaded(true);
  }

  async function insertDefaultDashboardApps(userId: string) {
    if (DEFAULT_DASHBOARD_APP_KEYS.length === 0) return;

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

  async function insertDashboardApp(userId: string, appKey: string) {
    return updateDashboardAppPinned(userId, appKey, true);
  }

  async function deleteDashboardApp(userId: string, appKey: string) {
    return updateDashboardAppPinned(userId, appKey, false);
  }

  function buildUrl(path: string, extra?: string) {
    const q = new URLSearchParams();
    const fixedTheme = normalizeThemeKey(themeKey);

    if (isTrial) q.set("mode", "trial");

    q.set("lang", lang);
    q.set("theme", fixedTheme);
    q.set("refresh", String(Date.now()));

    if (extra) {
      const extraQuery = new URLSearchParams(extra);
      extraQuery.forEach((value, key) => q.set(key, value));
    }

    return `${path}?${q.toString()}`;
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);
    replaceUrlLangTheme(next, themeKey);
  }

  async function logout() {
    safeLocalRemove(TRIAL_KEY);
    safeLocalRemove(TRIAL_TX_KEY);
    safeLocalRemove(TRIAL_CUSTOMERS_KEY);
    safeLocalRemove(TRIAL_INVOICES_KEY);
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  async function uploadAvatar(e: ChangeEvent<HTMLInputElement>) {
    if (isTrial) {
      setMsg(t.freeTrialCannotUpload);
      return;
    }

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
    setMsg(t.saved);
  }

  async function saveSettings() {
    if (isTrial) {
      setMsg(t.trialNoCloud);
      return;
    }

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

    setProfile((p) =>
      p
        ? {
            ...p,
            full_name: fullName,
            phone,
            company_name: companyName,
            company_reg_no: companyRegNo,
            company_phone: companyPhone,
            company_address: companyAddress,
          }
        : p
    );

    setMsg(t.saved);
  }

  async function changePassword() {
    if (isTrial) {
      setMsg(t.trialNoPassword);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setMsg(t.passwordTooShort);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.saved);
    setNewPassword("");
  }

  async function changeTheme(key: ThemeKey) {
    const fixedTheme = normalizeThemeKey(key);

    setThemeKey(fixedTheme);
    saveThemeKey(fixedTheme);
    applyThemeEverywhere(fixedTheme);
    replaceUrlLangTheme(lang, fixedTheme);

    if (isTrial) {
      setMsg(t.saved);
      return;
    }

    if (!session) {
      setMsg(t.pleaseLogin);
      return;
    }

    safeLocalRemove(SMARTACCTG_THEME_KEY);

    const { error } = await supabase
      .from("profiles")
      .update({ theme: fixedTheme })
      .eq("id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setProfile((p) => (p ? { ...p, theme: fixedTheme } : p));
    setMsg(t.saved);
  }

  function openAppModal(app: AppRegistry, extra?: string) {
    const key = String(app.app_key || "").trim();
    const path = String(app.app_path || "").trim();

    const fixedPath =
      key === "app_center" || path === "__app_center__"
        ? "/dashboard/app-center"
        : path === "__extension__"
          ? "/dashboard/extensions"
          : path === "__shop__"
            ? "/dashboard/nkshop"
            : path;

    if (!fixedPath) return;

    window.location.href = buildUrl(fixedPath, extra || "fullscreen=1&return=dashboard");
  }

  function openQuick(path: string) {
    const found = allApps.find((app) => app.app_path === path);

    if (found) {
      openAppModal(found, "open=new&fullscreen=1&return=dashboard");
      return;
    }

    window.location.href = buildUrl(path, "open=new&fullscreen=1&return=dashboard");
  }

  function openAppCenter() {
    openAppModal(APP_CENTER_APP, "fullscreen=1&return=dashboard");
  }

  function startAppLongPress(app: AppRegistry) {
    longPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        (navigator as any).vibrate?.(25);
      }

      setDeleteAppTarget(app);
    }, 650);
  }

  function cancelAppLongPress() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleAppIconClick(app: AppRegistry) {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    openAppModal(app);
  }

  async function setAppPinned(app: AppRegistry, pinned: boolean) {
    const appKey = String(app.app_key || "").trim();

    if (!appKey || appKey === "app_center") return;

    const currentKeys = normalizeDashboardKeys(dashboardAppKeys);

    const nextKeys = pinned
      ? normalizeDashboardKeys([...currentKeys, appKey])
      : currentKeys.filter((key) => key !== appKey);

    setDashboardAppKeys(nextKeys);

    if (isTrial) {
      const trialLocalKey = getDashboardLocalKey("trial");
      const trialInitKey = getDashboardInitLocalKey("trial");

      safeLocalSet(trialLocalKey, JSON.stringify(nextKeys));
      safeLocalSet(trialInitKey, "1");
      setMsg(t.saved);
      return;
    }

    if (!session) {
      setMsg(t.pleaseLogin);
      return;
    }

    const userLocalKey = getDashboardLocalKey(session.user.id);
    const userInitKey = getDashboardInitLocalKey(session.user.id);

    safeLocalSet(userLocalKey, JSON.stringify(nextKeys));
    safeLocalSet(userInitKey, "1");

    const { error } = pinned
      ? await insertDashboardApp(session.user.id, appKey)
      : await deleteDashboardApp(session.user.id, appKey);

    if (error) {
      console.warn("Dashboard app pin update failed:", error.message);
      setMsg(`${t.saved}（本地已更新）`);
      return;
    }

    setMsg(t.saved);
  }

  async function confirmRemoveDashboardApp() {
    if (!deleteAppTarget) return;

    await setAppPinned(deleteAppTarget, false);
    setDeleteAppTarget(null);
  }

  const latestMonthKey = useMemo(() => {
    const months = transactions.map((tx) => getMonthKey(tx.txn_date)).filter(Boolean);

    if (months.length === 0) return new Date().toISOString().slice(0, 7);

    return months.sort().reverse()[0];
  }, [transactions]);

  const latestMonthRecords = useMemo(() => {
    return transactions.filter((tx) => tx.txn_date?.startsWith(latestMonthKey));
  }, [transactions, latestMonthKey]);

  const monthIncome = useMemo(() => {
    return latestMonthRecords
      .filter((x) => x.txn_type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [latestMonthRecords]);

  const monthExpense = useMemo(() => {
    return latestMonthRecords
      .filter((x) => x.txn_type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [latestMonthRecords]);

  const balance = useMemo(() => {
    return monthIncome - monthExpense;
  }, [monthIncome, monthExpense]);

  const estimatedProfit = useMemo(() => {
    return monthIncome;
  }, [monthIncome]);

  const debtItems = useMemo<DebtItem[]>(() => {
    const customerDebtItems: DebtItem[] = customers
      .map((c) => {
        const amount = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);

        return {
          id: `customer-${c.id}`,
          name: c.company_name ? `${c.name || "-"} / ${c.company_name}` : c.name || "-",
          source: "customer" as const,
          amount,
          dueDate: c.last_payment_date || "",
          sortTime: c.last_payment_date
            ? getDueTime(c.last_payment_date)
            : Number.MAX_SAFE_INTEGER,
        };
      })
      .filter((x) => x.amount > 0);

    const invoiceDebtItems: DebtItem[] = invoices
      .filter((inv) => isInvoiceUnpaid(inv))
      .map((inv) => {
        const name = inv.customer_company
          ? `${inv.customer_name || "-"} / ${inv.customer_company}`
          : inv.customer_name || "-";

        const dueDate =
          inv.due_date || inv.invoice_date || inv.created_at?.slice(0, 10) || "";

        return {
          id: `invoice-${inv.id}`,
          name,
          source: "invoice" as const,
          amount: Number(inv.total || 0),
          dueDate,
          sortTime: getDueTime(dueDate),
        };
      });

    return [...customerDebtItems, ...invoiceDebtItems].sort((a, b) => {
      if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime;
      return b.amount - a.amount;
    });
  }, [customers, invoices]);

  const totalCustomerDebt = useMemo(() => {
    return debtItems.reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [debtItems]);

  const topDebtItem = debtItems[0] || null;

  const expiryText = isTrial
    ? t.trial
    : profile?.plan_expiry
      ? new Date(profile.plan_expiry).toLocaleDateString()
      : t.noSub;

  if (page === "app_center") {
    if (typeof window !== "undefined") {
      window.location.href = buildUrl("/dashboard/app-center", "fullscreen=1&return=dashboard");
    }

    return null;
  }

  return (
    <main
      className="smartacctg-page smartacctg-dashboard-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{DASHBOARD_FIX_CSS}</style>

      {!isEmbed && !isFullscreenPage ? (
        <header
          className="sa-card dashboard-top-card"
          style={{
            ...topCardStyle,
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div style={leftTopStyle}>
            <div className="dashboard-avatar-wrap" style={{ position: "relative", zIndex: 300 }}>
              <button
                type="button"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                style={avatarBtnStyle}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" style={avatarImgStyle} />
                ) : (
                  "👤"
                )}
              </button>

              {showAvatarMenu ? (
                <div className="dashboard-avatar-menu" style={avatarMenuStyle}>
                  <label style={menuItemStyle}>
                    {t.changeAvatar}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      style={{ display: "none" }}
                    />
                  </label>

                  <button
                    type="button"
                    style={menuItemStyle}
                    onClick={() => {
                      setShowSettings(true);
                      setShowThemes(false);
                      setShowAvatarMenu(false);
                    }}
                  >
                    {t.settings}
                  </button>

                  <button
                    type="button"
                    style={menuItemStyle}
                    onClick={() => {
                      setShowThemes(true);
                      setShowSettings(false);
                      setShowAvatarMenu(false);
                    }}
                  >
                    {t.theme}
                  </button>

                  <div style={avatarLangBoxStyle}>
                    <div style={avatarLangTitleStyle}>{t.language}</div>

                    <div style={avatarLangBtnRowStyle}>
                      <button
                        type="button"
                        onClick={() => switchLang("zh")}
                        style={avatarLangBtnStyle(lang === "zh", theme)}
                      >
                        中文
                      </button>

                      <button
                        type="button"
                        onClick={() => switchLang("en")}
                        style={avatarLangBtnStyle(lang === "en", theme)}
                      >
                        EN
                      </button>

                      <button
                        type="button"
                        onClick={() => switchLang("ms")}
                        style={avatarLangBtnStyle(lang === "ms", theme)}
                      >
                        BM
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      ...menuItemStyle,
                      marginTop: 8,
                      color: "#dc2626",
                      fontWeight: 900,
                    }}
                    onClick={logout}
                  >
                    {t.logout}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="dashboard-plan-text" style={planTextStyle}>
              {t.expiry}: {expiryText}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{ ...logoutBtnStyle, background: theme.accent }}
          >
            {t.logout}
          </button>
        </header>
      ) : null}

      {page === "home" ? (
        <>
          <section
            className="sa-card"
            style={{
              background: theme.banner || theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
              marginBottom: 12,
            }}
          >
            <h1 style={titleStyle}>{t.dashboard}</h1>

            <div className="sa-dashboard-notice" style={noticeWrapStyle}>
              <div className="sa-dashboard-notice-text" style={noticeMarqueeStyle}>
                {t.notice}
              </div>
            </div>
          </section>

          <section className="dashboard-summary-grid" style={summaryGridStyle}>
            <div className="sa-card dashboard-stat-card" style={{ ...summaryBoxStyle, ...themedCardStyle }}>
              <button
                type="button"
                onClick={() => setShowRecordSummary(!showRecordSummary)}
                style={summaryHeaderBtnStyle}
              >
                <span className="sa-title-bold">{t.recordsOverview}</span>
                <strong>{showRecordSummary ? "▲" : "▼"}</strong>
              </button>

              <div style={{ ...smallMutedStyle, color: themeMuted }}>
                {t.latestMonth}: {latestMonthKey}
              </div>

              {showRecordSummary ? (
                <div style={summaryDetailListStyle}>
                  <div style={summaryRowStyle}>
                    <span>{t.balance}</span>
                    <strong style={{ color: theme.accent }}>{formatRM(balance)}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>{t.monthIncome}</span>
                    <strong style={{ color: "#16a34a" }}>{formatRM(monthIncome)}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>{t.monthExpense}</span>
                    <strong style={{ color: "#dc2626" }}>{formatRM(monthExpense)}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>{t.estimatedProfit}</span>
                    <strong style={{ color: theme.accent }}>{formatRM(estimatedProfit)}</strong>
                  </div>
                </div>
              ) : (
                <div style={summaryRowStyle}>
                  <span>{t.estimatedProfit}</span>
                  <strong style={{ color: theme.accent }}>{formatRM(estimatedProfit)}</strong>
                </div>
              )}
            </div>

            <div className="sa-card dashboard-stat-card" style={{ ...summaryBoxStyle, ...themedCardStyle }}>
              <button
                type="button"
                onClick={() => setShowDebtSummary(!showDebtSummary)}
                style={summaryHeaderBtnStyle}
              >
                <span className="sa-title-bold">{t.customerDebt}</span>
                <strong>{showDebtSummary ? "▲" : "▼"}</strong>
              </button>

              {showDebtSummary ? (
                <div style={summaryDetailListStyle}>
                  {debtItems.length === 0 ? (
                    <div style={summaryRowStyle}>
                      <span>{t.noDebt}</span>
                      <strong>{formatRM(0)}</strong>
                    </div>
                  ) : (
                    <>
                      <div style={summaryRowStyle}>
                        <span>{t.customerDebt}</span>
                        <strong style={{ color: "#dc2626" }}>{formatRM(totalCustomerDebt)}</strong>
                      </div>

                      {debtItems.slice(0, 8).map((item) => (
                        <div key={item.id} style={debtRowStyle}>
                          <div>
                            <div>{item.name}</div>
                            {item.dueDate ? (
                              <small style={{ color: themeMuted }}>
                                {item.source === "invoice" ? "Invoice" : "Customer"} · {item.dueDate}
                              </small>
                            ) : null}
                          </div>

                          <strong style={{ color: "#dc2626" }}>{formatRM(item.amount)}</strong>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div style={summaryRowStyle}>
                  <span>{topDebtItem?.name || t.noDebt}</span>
                  <strong style={{ color: topDebtItem ? "#dc2626" : theme.accent }}>
                    {formatRM(topDebtItem?.amount || 0)}
                  </strong>
                </div>
              )}
            </div>
          </section>

          <section className="sa-card" style={{ ...quickCardStyle, ...themedCardStyle }}>
            <button
              type="button"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              style={quickHeaderBtnStyle}
            >
              <span className="sa-title-bold">{t.quick}</span>
              <strong>{showQuickMenu ? "▲" : "▼"}</strong>
            </button>

            {showQuickMenu ? (
              <div className="dashboard-quick-grid" style={quickGridStyle}>
                <button type="button" onClick={() => openQuick("/dashboard/records")} style={quickBtnStyle(theme)}>
                  {t.quickAccounting}
                </button>

                <button type="button" onClick={() => openQuick("/dashboard/invoices")} style={quickBtnStyle(theme)}>
                  {t.quickInvoice}
                </button>

                <button type="button" onClick={() => openQuick("/dashboard/customers")} style={quickBtnStyle(theme)}>
                  {t.quickCustomer}
                </button>

                <button type="button" onClick={() => openQuick("/dashboard/products")} style={quickBtnStyle(theme)}>
                  {t.quickProduct}
                </button>
              </div>
            ) : null}
          </section>

          <section className="sa-card" style={{ ...themedCardStyle, marginBottom: 12 }}>
            <p style={{ color: themeMuted, marginTop: 0, marginBottom: 14 }}>
              {t.longPressRemove}
            </p>

            {appsLoaded && dashboardApps.length === 0 ? (
              <p style={{ color: themeMuted }}>{t.noApps}</p>
            ) : null}

            <div className="dashboard-app-grid" style={appGridStyle}>
              {dashboardApps.map((app) => (
                <div key={app.app_key} className="dashboard-app-icon-wrap">
                  <button
                    type="button"
                    onClick={() => handleAppIconClick(app)}
                    onPointerDown={() => startAppLongPress(app)}
                    onPointerUp={cancelAppLongPress}
                    onPointerLeave={cancelAppLongPress}
                    onPointerCancel={cancelAppLongPress}
                    onContextMenu={(e) => e.preventDefault()}
                    className="dashboard-app-icon"
                    style={phoneAppIconStyle}
                  >
                    {isImageIcon(app.icon) ? (
                      <img src={app.icon || ""} alt={appTitle(app, lang)} style={appImgStyle} />
                    ) : (
                      <span style={appEmojiStyle}>{app.icon || "📱"}</span>
                    )}
                  </button>

                  <div className="dashboard-app-name" style={{ color: theme.text }}>
                    {appTitle(app, lang)}
                  </div>
                </div>
              ))}

              <div className="dashboard-app-icon-wrap">
                <button
                  type="button"
                  onClick={openAppCenter}
                  className="dashboard-app-icon"
                  style={phoneAppIconStyle}
                >
                  <img
                    src={NK_LOGO_SRC}
                    alt="NK DIGITAL HUB"
                    style={appImgStyle}
                    onError={(e) => {
                      e.currentTarget.src = NK_LOGO_FALLBACK_SRC;
                    }}
                  />
                </button>

                <div className="dashboard-app-name" style={{ color: theme.text }}>
                  {t.appCenter}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {page !== "home" && !isEmbed ? (
        <section className="sa-card" style={{ ...themedCardStyle }}>
          <button
            type="button"
            onClick={() => (window.location.href = buildUrl("/dashboard"))}
            style={{
              ...backBtnStyle,
              borderColor: theme.border,
              color: theme.accent,
              background: theme.inputBg || "#ffffff",
            }}
          >
            ← {t.back}
          </button>

          <h1 style={titleStyle}>
            {page === "records" && appTitle(DEFAULT_APPS[0], lang)}
            {page === "accounting" && appTitle(DEFAULT_APPS[0], lang)}
            {page === "customers" && appTitle(DEFAULT_APPS[1], lang)}
            {page === "products" && appTitle(DEFAULT_APPS[2], lang)}
            {page === "invoices" && appTitle(DEFAULT_APPS[3], lang)}
            {page === "extensions" && appTitle(DEFAULT_APPS[4], lang)}
            {page === "nkshop" && appTitle(DEFAULT_APPS[5], lang)}
          </h1>
        </section>
      ) : null}

      {showSettings ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card sa-fullscreen-modal"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-top" style={modalTopStyle}>
              <h1 style={modalTitleStyle}>{t.settings}</h1>

              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setMsg("");
                }}
                style={closeBtnStyle}
              >
                {t.close}
              </button>
            </div>

            <h2 style={sectionTitleStyle}>{t.language}</h2>

            <div style={modalLangRowStyle}>
              <button type="button" onClick={() => switchLang("zh")} style={modalLangBtnStyle(lang === "zh", theme)}>
                中文
              </button>

              <button type="button" onClick={() => switchLang("en")} style={modalLangBtnStyle(lang === "en", theme)}>
                EN
              </button>

              <button type="button" onClick={() => switchLang("ms")} style={modalLangBtnStyle(lang === "ms", theme)}>
                BM
              </button>
            </div>

            <h2 style={sectionTitleStyle}>{t.personal}</h2>

            <input placeholder={t.name} value={fullName} onChange={(e) => setFullName(e.target.value)} style={themedInputStyle} />
            <input placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} style={themedInputStyle} />

            <h2 style={sectionTitleStyle}>{t.company}</h2>

            <input placeholder={t.companyName} value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={themedInputStyle} />
            <input placeholder={t.ssm} value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} style={themedInputStyle} />
            <input placeholder={t.companyPhone} value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} style={themedInputStyle} />
            <input placeholder={t.companyAddress} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} style={themedInputStyle} />

            <button type="button" onClick={saveSettings} style={{ ...primaryBtnStyle, background: theme.accent }}>
              {t.save}
            </button>

            <h2 style={sectionTitleStyle}>{t.password}</h2>

            <input
              type="password"
              placeholder={t.newPassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={themedInputStyle}
            />

            <button type="button" onClick={changePassword} style={{ ...primaryBtnStyle, background: theme.accent }}>
              {t.updatePassword}
            </button>

            {msg ? <p style={{ color: theme.accent }}>{msg}</p> : null}
          </section>
        </div>
      ) : null}

      {showThemes ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card sa-fullscreen-modal"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="sa-modal-top" style={modalTopStyle}>
              <h1 style={modalTitleStyle}>{t.theme}</h1>

              <button
                type="button"
                onClick={() => {
                  setShowThemes(false);
                  setMsg("");
                }}
                style={closeBtnStyle}
              >
                {t.close}
              </button>
            </div>

            <div style={themeGridStyle}>
              {themeChoices.map((key) => {
                const item = (THEMES[key] || THEMES.deepTeal) as any;

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => changeTheme(key)}
                    style={{
                      ...themeBtnStyle,
                      borderColor: item.border,
                      background: item.banner || item.card,
                      color: item.text,
                      boxShadow: item.glow,
                    }}
                  >
                    {item.name || key}
                  </button>
                );
              })}
            </div>

            {msg ? <p style={{ color: theme.accent }}>{msg}</p> : null}
          </section>
        </div>
      ) : null}

      {deleteAppTarget ? (
        <div className="sa-fullscreen-overlay">
          <section
            className="sa-card"
            style={{
              ...deleteAppModalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <h1 style={modalTitleStyle}>{t.removeAppTitle}</h1>

            <div style={deleteAppPreviewStyle}>
              <button type="button" style={phoneAppIconStyle}>
                {isImageIcon(deleteAppTarget.icon) ? (
                  <img
                    src={deleteAppTarget.icon || ""}
                    alt={appTitle(deleteAppTarget, lang)}
                    style={appImgStyle}
                  />
                ) : (
                  <span style={appEmojiStyle}>{deleteAppTarget.icon || "📱"}</span>
                )}
              </button>

              <h2 style={appCenterTitleStyle}>{appTitle(deleteAppTarget, lang)}</h2>
              <p style={{ color: themeMuted }}>{t.removeAppMessage}</p>
            </div>

            <div style={deleteAppActionRowStyle}>
              <button type="button" onClick={confirmRemoveDashboardApp} style={deleteAppConfirmBtnStyle}>
                {t.confirm}
              </button>

              <button type="button" onClick={() => setDeleteAppTarget(null)} style={deleteAppCancelBtnStyle}>
                {t.cancel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  padding: "clamp(12px, 3vw, 22px)",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
};

const topCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "clamp(16px, 4vw, 22px)",
};

const leftTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const avatarBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  border: "none",
  background: "#fff",
  fontSize: 24,
  overflow: "hidden",
  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  padding: 0,
};

const avatarImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarMenuStyle: CSSProperties = {
  position: "absolute",
  top: 62,
  left: 0,
  width: 250,
  background: "#fff",
  color: "#111827",
  borderRadius: 18,
  padding: 10,
  zIndex: 99999,
  boxShadow: "0 18px 46px rgba(0,0,0,0.28)",
  border: "1px solid rgba(15,23,42,0.1)",
};

const menuItemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  border: "none",
  background: "transparent",
  textAlign: "left",
  borderRadius: 10,
  color: "#111827",
  fontSize: 16,
};

const avatarLangBoxStyle: CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  marginTop: 8,
  paddingTop: 8,
};

const avatarLangTitleStyle: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 8,
};

const avatarLangBtnRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
};

const avatarLangBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  border: `2px solid ${theme.accent}`,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
  borderRadius: 999,
  minHeight: 38,
  padding: "0 8px",
});

const planTextStyle: CSSProperties = {
  lineHeight: 1.3,
  overflowWrap: "anywhere",
  fontSize: "clamp(15px, 3.8vw, 18px)",
};

const logoutBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  minHeight: "var(--sa-control-h)",
  whiteSpace: "nowrap",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(26px, 7vw, 36px)",
  lineHeight: 1.12,
  fontWeight: 900,
  letterSpacing: "-0.03em",
  overflowWrap: "anywhere",
};

const noticeWrapStyle: CSSProperties = {
  marginTop: 8,
  overflow: "hidden",
  width: "100%",
};

const noticeMarqueeStyle: CSSProperties = {
  display: "inline-block",
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  marginTop: 12,
  marginBottom: 12,
};

const summaryBoxStyle: CSSProperties = {
  minHeight: 0,
  padding: "clamp(12px, 3vw, 16px)",
  border: "var(--sa-border-w) solid",
  borderRadius: 22,
};

const summaryHeaderBtnStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  border: "none",
  background: "transparent",
  color: "inherit",
  padding: 0,
  minHeight: 0,
  fontSize: "clamp(20px, 5.2vw, 26px)",
  lineHeight: 1.12,
};

const smallMutedStyle: CSSProperties = {
  marginTop: 8,
  fontSize: "clamp(15px, 3.8vw, 17px)",
};

const summaryDetailListStyle: CSSProperties = {
  display: "grid",
  gap: 7,
  marginTop: 8,
};

const summaryRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
  lineHeight: 1.18,
};

const debtRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "start",
  lineHeight: 1.25,
};

const quickCardStyle: CSSProperties = {
  marginBottom: 12,
  padding: "clamp(12px, 3vw, 16px)",
  borderRadius: 22,
};

const quickHeaderBtnStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  border: "none",
  background: "transparent",
  color: "inherit",
  padding: 0,
  minHeight: 0,
  fontSize: "clamp(20px, 5.2vw, 26px)",
  lineHeight: 1.12,
};

const quickGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
  marginTop: 10,
};

const quickBtnStyle = (theme: any): CSSProperties => ({
  background: theme.inputBg || "#fff",
  border: `var(--sa-border-w) solid ${theme.border}`,
  color: theme.accent,
  borderRadius: 18,
  minHeight: 54,
  padding: "8px 10px",
  fontSize: "clamp(15px, 4vw, 17px)",
  lineHeight: 1.15,
  whiteSpace: "normal",
  textAlign: "center",
});

const appGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "18px 10px",
  width: "100%",
};

const phoneAppIconStyle: CSSProperties = {
  width: 64,
  height: 64,
  minWidth: 64,
  minHeight: 64,
  borderRadius: 20,
  border: "none",
  background: "transparent",
  boxShadow: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  overflow: "visible",
};

const appImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
  background: "transparent",
};

const appEmojiStyle: CSSProperties = {
  fontSize: 34,
  lineHeight: 1,
};

const backBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  marginBottom: 14,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0 var(--sa-control-x)",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  minHeight: "var(--sa-control-h)",
  marginBottom: 12,
  fontSize: 16,
  background: "#fff",
  color: "#111827",
  outline: "none",
};

const primaryBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  padding: "0 18px",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  marginBottom: 16,
};

const modalTopStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(24px, 6vw, 34px)",
  fontWeight: 900,
  lineHeight: 1.15,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 12,
  fontSize: "clamp(20px, 5.2vw, 28px)",
  fontWeight: 900,
  lineHeight: 1.2,
};

const closeBtnStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: "var(--sa-fs-base)",
  padding: 8,
};

const modalLangRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const modalLangBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  minHeight: "var(--sa-control-h)",
  borderRadius: "var(--sa-radius-control)",
  border: `var(--sa-border-w) solid ${theme.accent}`,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
});

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const themeBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  minHeight: 84,
  textAlign: "left",
};

const appCenterTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(20px, 5.2vw, 28px)",
  fontWeight: 900,
  lineHeight: 1.2,
};

const deleteAppModalStyle: CSSProperties = {
  width: "min(92vw, 520px)",
  margin: "18vh auto 0",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const deleteAppPreviewStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  textAlign: "center",
  gap: 12,
  marginTop: 18,
  marginBottom: 18,
};

const deleteAppActionRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 16,
};

const deleteAppConfirmBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 900,
};

const deleteAppCancelBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid #cbd5e1",
  borderRadius: "var(--sa-radius-control)",
  background: "#fff",
  color: "#111827",
  fontWeight: 900,
};
