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
  APP_CENTER_APP,
  DASHBOARD_APP_KEYS_LOCAL,
  DASHBOARD_APPS_INIT_LOCAL,
  DEFAULT_APPS,
  DEFAULT_DASHBOARD_APP_KEYS,
  LANG_KEY,
  NK_LOGO_FALLBACK_SRC,
  NK_LOGO_SRC,
  TRIAL_CUSTOMERS_KEY,
  TRIAL_INVOICES_KEY,
  TRIAL_KEY,
  TRIAL_TX_KEY,
  TXT,
} from "./_dashboard/constants";

import { DASHBOARD_FIX_CSS } from "./_dashboard/dashboardFixCss";

import {
  appDescription,
  appTitle,
  applyThemeEverywhere,
  formatRM,
  getDashboardRowKey,
  getDueTime,
  getMonthKey,
  isImageIcon,
  isInvoiceUnpaid,
  isSchemaColumnError,
  mergeAppsWithDefaults,
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
      (app) => app.is_active !== false && app.enabled !== false && app.app_key !== "app_center"
    );

    return dashboardAppKeys
      .filter((key) => key !== "app_center")
      .map((key) => activeApps.find((app) => app.app_key === key))
      .filter(Boolean) as AppRegistry[];
  }, [appsLoaded, allApps, dashboardAppKeys]);

  const appCenterApps = useMemo(() => {
    return allApps.filter(
      (app) => app.app_key !== "app_center" && app.is_active !== false && app.enabled !== false
    );
  }, [allApps]);

  const dashboardKeySet = useMemo(() => {
    return new Set(dashboardAppKeys);
  }, [dashboardAppKeys]);

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

  async function loadAppsForUser(userId: string, trialMode: boolean) {
    setAppsLoaded(false);

    let registry = mergeAppsWithDefaults([]);

    if (!trialMode) {
      const { data: registryData } = await supabase
        .from("app_registry")
        .select("*")
        .order("sort_order", { ascending: true });

      registry = mergeAppsWithDefaults(registryData || []);
    }

    setAllApps(registry);

    const availableKeySet = new Set(registry.map((app) => app.app_key));

    if (trialMode) {
      const localKeys = safeParseArray<string>(safeLocalGet(DASHBOARD_APP_KEYS_LOCAL));

      const sourceKeys = localKeys.length > 0 ? localKeys : DEFAULT_DASHBOARD_APP_KEYS;

      const fixedLocalKeys = Array.from(new Set(sourceKeys)).filter(
        (key) => key !== "app_center" && availableKeySet.has(key)
      );

      setDashboardAppKeys(fixedLocalKeys);
      safeLocalSet(DASHBOARD_APP_KEYS_LOCAL, JSON.stringify(fixedLocalKeys));
      setAppsLoaded(true);
      return;
    }

    const initKey = `${DASHBOARD_APPS_INIT_LOCAL}_${userId}`;

    const { data: dashboardData, error: dashboardError } = await supabase
      .from("user_dashboard_apps")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (dashboardError) {
      const fallbackKeys = DEFAULT_DASHBOARD_APP_KEYS.filter((key) => availableKeySet.has(key));
      setDashboardAppKeys(fallbackKeys);
      setAppsLoaded(true);
      return;
    }

    const rows = (dashboardData || []) as UserDashboardApp[];

    if (rows.length === 0) {
      const fallbackKeys = DEFAULT_DASHBOARD_APP_KEYS.filter((key) => availableKeySet.has(key));

      if (!safeLocalGet(initKey)) {
        await insertDefaultDashboardApps(userId);
        safeLocalSet(initKey, "1");
      }

      setDashboardAppKeys(fallbackKeys);
      setAppsLoaded(true);
      return;
    }

    safeLocalSet(initKey, "1");

    const dbKeys = Array.from(
      new Set(
        rows
          .filter((row) => row.pinned !== false)
          .map(getDashboardRowKey)
          .filter(Boolean)
          .filter((key) => key !== "app_center")
      )
    ).filter((key) => availableKeySet.has(key));

    setDashboardAppKeys(dbKeys);
    setAppsLoaded(true);
  }

  async function insertDefaultDashboardApps(userId: string) {
    const rowsWithAppKey = DEFAULT_DASHBOARD_APP_KEYS.map((key) => ({
      user_id: userId,
      app_key: key,
      pinned: true,
    }));

    const first = await supabase.from("user_dashboard_apps").insert(rowsWithAppKey);

    if (!first.error) return;

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
      return { error: null };
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
    if (!app.app_key || app.app_key === "app_center") return;

    if (isTrial) {
      const next = pinned
        ? Array.from(new Set([...dashboardAppKeys, app.app_key]))
        : dashboardAppKeys.filter((key) => key !== app.app_key);

      const fixedNext = Array.from(new Set(next)).filter((key) => key !== "app_center");

      setDashboardAppKeys(fixedNext);
      safeLocalSet(DASHBOARD_APP_KEYS_LOCAL, JSON.stringify(fixedNext));
      setMsg(t.saved);
      return;
    }

    if (!session) return;

    if (pinned) {
      const { error } = await insertDashboardApp(session.user.id, app.app_key);

      if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
        setMsg(error.message);
        return;
      }

      setDashboardAppKeys((prev) => Array.from(new Set([...prev, app.app_key])));
      setMsg(t.saved);
      return;
    }

    const { error } = await deleteDashboardApp(session.user.id, app.app_key);

    if (error) {
      setMsg(error.message);
      return;
    }

    setDashboardAppKeys((prev) => prev.filter((key) => key !== app.app_key));
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
          sortTime: c.last_payment_date ? getDueTime(c.last_payment_date) : Number.MAX_SAFE_INTEGER,
        };
      })
      .filter((x) => x.amount > 0);

    const invoiceDebtItems: DebtItem[] = invoices
      .filter((inv) => isInvoiceUnpaid(inv))
      .map((inv) => {
        const name = inv.customer_company
          ? `${inv.customer_name || "-"} / ${inv.customer_company}`
          : inv.customer_name || "-";

        const dueDate = inv.due_date || inv.invoice_date || inv.created_at?.slice(0, 10) || "";

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
            <div style={{ position: "relative" }}>
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
                <div style={avatarMenuStyle}>
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
                    style={phoneAppIconStyle(theme)}
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
                  style={appCenterIconStyle}
                >
                  <div style={appCenterLogoCircleStyle}>
                    <img
                      src={NK_LOGO_SRC}
                      alt="NK DIGITAL HUB"
                      style={appCenterLogoImgStyle}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.includes("png.PNG")) {
                          img.src = NK_LOGO_FALLBACK_SRC;
                        }
                      }}
                    />
                  </div>
                </button>

                <div className="dashboard-app-name" style={{ color: theme.text }}>
                  {t.appCenter}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {page !== "home" && page !== "app_center" && !isEmbed ? (
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

      {page === "app_center" ? (
        <section className="sa-card" style={{ ...themedCardStyle, marginBottom: 12 }}>
          {!isEmbed ? (
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
          ) : null}

          <h1 style={titleStyle}>{t.appCenter}</h1>
          <p style={{ color: themeMuted }}>{t.appCenterDesc}</p>

          <div style={appCenterListStyle}>
            {appCenterApps.map((app) => {
              const pinned = dashboardKeySet.has(app.app_key);
              const desc = appDescription(app, lang);

              return (
                <div
                  key={app.app_key}
                  style={{
                    ...appCenterCardStyle,
                    borderColor: theme.border,
                    background: theme.panelBg || theme.card,
                    color: theme.panelText || theme.text,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openAppModal(app)}
                    style={phoneAppIconStyle(theme)}
                  >
                    {isImageIcon(app.icon) ? (
                      <img src={app.icon || ""} alt={appTitle(app, lang)} style={appImgStyle} />
                    ) : (
                      <span style={appEmojiStyle}>{app.icon || "📱"}</span>
                    )}
                  </button>

                  <div style={{ minWidth: 0 }}>
                    <h2 style={appCenterTitleStyle}>{appTitle(app, lang)}</h2>
                    {desc ? <p style={{ margin: "6px 0 0", color: themeMuted }}>{desc}</p> : null}
                  </div>

                  <div style={appCenterActionStyle}>
                    <button
                      type="button"
                      onClick={() => openAppModal(app)}
                      style={{ ...appCenterSmallBtnStyle, background: theme.accent, color: "#fff" }}
                    >
                      {t.open}
                    </button>

                    {pinned ? (
                      <button
                        type="button"
                        onClick={() => setAppPinned(app, false)}
                        style={appCenterRemoveBtnStyle}
                      >
                        {t.removeFromDashboard}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAppPinned(app, true)}
                        style={{
                          ...appCenterSmallBtnStyle,
                          borderColor: theme.border,
                          color: theme.accent,
                          background: theme.inputBg || "#fff",
                        }}
                      >
                        {t.addToDashboard}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {msg ? <p style={{ color: theme.accent }}>{msg}</p> : null}
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

            <input
              placeholder={t.name}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={themedInputStyle}
            />

            <h2 style={sectionTitleStyle}>{t.company}</h2>

            <input
              placeholder={t.companyName}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.ssm}
              value={companyRegNo}
              onChange={(e) => setCompanyRegNo(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.companyPhone}
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.companyAddress}
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              style={themedInputStyle}
            />

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
              <button type="button" style={phoneAppIconStyle(theme)}>
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
  top: 60,
  left: 0,
  width: 230,
  background: "#fff",
  color: "#111827",
  borderRadius: 16,
  padding: 10,
  zIndex: 99,
  boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
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

const phoneAppIconStyle = (theme: any): CSSProperties => ({
  width: 76,
  height: 76,
  minWidth: 76,
  minHeight: 76,
  borderRadius: 22,
  border: `2px solid ${theme.border}`,
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.72))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 22px rgba(15,23,42,0.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  overflow: "hidden",
});

const appImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const appEmojiStyle: CSSProperties = {
  fontSize: 34,
  lineHeight: 1,
};

const appCenterIconStyle: CSSProperties = {
  width: 86,
  height: 86,
  minWidth: 86,
  minHeight: 86,
  borderRadius: 28,
  border: "2px solid rgba(94, 255, 239, 0.95)",
  background:
    "linear-gradient(145deg, #ccfffa 0%, #46f0df 34%, #10b8aa 62%, #06675e 100%)",
  boxShadow:
    "inset 0 4px 10px rgba(255,255,255,0.78), inset 0 -12px 22px rgba(0,0,0,0.22), 0 0 0 2px rgba(45,212,191,0.22), 0 16px 34px rgba(20,184,166,0.48)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 6,
  overflow: "hidden",
};

const appCenterLogoCircleStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: 24,
  background:
    "radial-gradient(circle at 32% 22%, #ffffff 0%, #d7fff9 18%, #8cf7ea 34%, #25d7c8 62%, #08756d 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  boxShadow:
    "inset 0 3px 8px rgba(255,255,255,0.8), inset 0 -9px 18px rgba(0,0,0,0.2), 0 5px 14px rgba(0,0,0,0.16)",
};

const appCenterLogoImgStyle: CSSProperties = {
  width: "88%",
  height: "88%",
  objectFit: "contain",
  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.28))",
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

const appCenterListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 16,
};

const appCenterCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  gap: 14,
  alignItems: "center",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const appCenterTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(20px, 5.2vw, 28px)",
  fontWeight: 900,
  lineHeight: 1.2,
};

const appCenterActionStyle: CSSProperties = {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const appCenterSmallBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid transparent",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 12px",
  fontWeight: 900,
};

const appCenterRemoveBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid #fecaca",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 12px",
  fontWeight: 900,
  background: "#fff",
  color: "#dc2626",
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
