"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  type ThemeKey,
  getThemeKeyFromUrlOrLocalStorage,
  isThemeKey,
  normalizeThemeKey,
  saveThemeKey,
} from "@/lib/smartacctgTheme";
import AddRecordForm from "./components/AddRecordForm";
import RecordsList from "./components/RecordsList";
import {
  CATEGORY_KEY,
  DEFAULT_CATEGORY_KEYS,
  LANG_KEY,
  TRIAL_CUSTOMERS_KEY,
  TRIAL_INVOICES_KEY,
  TRIAL_KEY,
  TRIAL_PRODUCTS_KEY,
  TRIAL_TX_KEY,
  TXT,
  Customer,
  DebtItem,
  Invoice,
  Product,
  Profile,
  RecordFormState,
  Txn,
  TxnType,
  applyThemeEverywhere,
  formatRM,
  getDueTime,
  getInitialFullscreen,
  getInitialLang,
  getInitialReturn,
  getInvoiceEffectiveDate,
  getMonthKeyFromDate,
  isInvoiceUnpaid,
  isSchemaCacheMissingSource,
  makeId,
  normalizeCategory,
  replaceUrlLangTheme,
  safeLocalGet,
  safeLocalRemove,
  safeLocalSet,
  safeParseArray,
  today,
  uniqueCleanList,
} from "./types";

const RECORDS_PAGE_CSS = `
  .smartacctg-records-page,
  .smartacctg-records-page * {
    box-sizing: border-box !important;
  }

  .smartacctg-records-page h1,
  .smartacctg-records-page h2,
  .smartacctg-records-page h3,
  .smartacctg-records-page strong,
  .smartacctg-records-page button {
    font-weight: 900 !important;
  }

  .smartacctg-records-page p,
  .smartacctg-records-page div,
  .smartacctg-records-page span,
  .smartacctg-records-page label,
  .smartacctg-records-page input,
  .smartacctg-records-page select,
  .smartacctg-records-page textarea {
    font-weight: 400 !important;
  }

  .smartacctg-records-page input[type="date"],
  .smartacctg-records-page input[type="month"] {
    display: block !important;
    width: 100% !important;
    height: var(--sa-control-h, 54px) !important;
    min-height: var(--sa-control-h, 54px) !important;
    line-height: var(--sa-control-h, 54px) !important;
    text-align: center !important;
    text-align-last: center !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-date-and-time-value,
  .smartacctg-records-page input[type="month"]::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    line-height: normal !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-datetime-edit,
  .smartacctg-records-page input[type="month"]::-webkit-datetime-edit {
    width: 100% !important;
    text-align: center !important;
    padding: 0 !important;
  }

  .smartacctg-records-page input[type="date"]::-webkit-datetime-edit-fields-wrapper,
  .smartacctg-records-page input[type="month"]::-webkit-datetime-edit-fields-wrapper {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
  }

  .smartacctg-records-page .records-month-select-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }

  .smartacctg-records-page .records-summary-line {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 10px !important;
    align-items: center !important;
    line-height: 1.25 !important;
  }

  .smartacctg-records-page .records-list {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  .smartacctg-records-page .record-card {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-records-page .record-card.debt-record {
    background: #fee2e2 !important;
    color: #7f1d1d !important;
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.35),
      0 12px 28px rgba(220, 38, 38, 0.22) !important;
  }

  .smartacctg-records-page .records-action-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
  }

  .smartacctg-records-page .records-action-row button {
    flex: 0 1 auto !important;
    min-width: 105px !important;
  }

  .smartacctg-records-page .records-fullscreen-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    overflow: hidden !important;
    padding: 0 !important;
    background: rgba(15, 23, 42, 0.58) !important;
  }

  .smartacctg-records-page .records-fullscreen-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
    border-top: none !important;
    border-bottom: none !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)) !important;
  }

  .smartacctg-records-page .records-modal-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 20 !important;
    background: inherit !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 12px !important;
    align-items: center !important;
    padding-bottom: 12px !important;
    margin-bottom: 12px !important;
  }

  @media (max-width: 520px) {
    .smartacctg-records-page .records-month-select-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 8px !important;
    }

    .smartacctg-records-page .records-action-row button {
      min-width: 96px !important;
    }
  }
`;

export default function RecordsClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<"zh" | "en" | "ms">("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [summaryMonth, setSummaryMonth] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORY_KEYS);
  const [newCategory, setNewCategory] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | TxnType>("all");
  const [filterCustomerId, setFilterCustomerId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(getInitialFullscreen);
  const [returnTo, setReturnTo] = useState(getInitialReturn);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Txn | null>(null);
  const [msg, setMsg] = useState("");

  const [relatedPath, setRelatedPath] = useState("/dashboard/customers");

  const [form, setForm] = useState<RecordFormState>({
    txn_date: today(),
    txn_type: "income",
    amount: "",
    category_name: "",
    debt_amount: "",
    note: "",
    customer_id: "",
    product_id: "",
    invoice_id: "",
  });

  const t = TXT[lang];
  const theme = (THEMES[themeKey] || THEMES.deepTeal) as any;
  const themeSubText = theme.subText || theme.muted || "#64748b";

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 9 }, (_, i) => String(currentYear - 4 + i));
  const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  const themedDateInputStyle: CSSProperties = {
    ...dateInputStyle,
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

  useEffect(() => {
    applyThemeEverywhere(themeKey);
  }, [themeKey]);

  useEffect(() => {
    const initialLang = getInitialLang();
    const initialTheme = getThemeKeyFromUrlOrLocalStorage("deepTeal");

    const savedCategories = safeParseArray<string>(safeLocalGet(CATEGORY_KEY));
    if (savedCategories.length > 0) {
      setCategories(uniqueCleanList(savedCategories.map(normalizeCategory)));
    } else {
      setCategories(DEFAULT_CATEGORY_KEYS);
    }

    setLang(initialLang);
    safeLocalSet(LANG_KEY, initialLang);

    setThemeKey(initialTheme);
    saveThemeKey(initialTheme);
    applyThemeEverywhere(initialTheme);

    init(initialLang, initialTheme);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function displayCategory(value?: string | null) {
    const key = normalizeCategory(value);

    if (key === "invoice_income") return t.catInvoiceIncome;
    if (key === "normal_income") return t.catNormalIncome;
    if (key === "customer_payment") return t.catCustomerPayment;
    if (key === "purchase") return t.catPurchase;
    if (key === "salary") return t.catSalary;
    if (key === "transport") return t.catTransport;
    if (key === "food") return t.catFood;
    if (key === "phone_bill") return t.catPhoneBill;
    if (key === "ads_fee") return t.catAdsFee;
    if (key === "others") return t.catOthers;

    return value || t.noData;
  }

  async function init(currentLang: "zh" | "en" | "ms", currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const openParam = q.get("open");
    const fullscreenParam = q.get("fullscreen");
    const returnParam = q.get("return");
    const view = q.get("view");

    setReturnTo(returnParam || "");
    setIsFullscreen(fullscreenParam === "1");

    if (view === "income") setFilterType("income");
    if (view === "expense") setFilterType("expense");

    const shouldOpenNew = openParam === "new";
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSession(null);

          setTransactions(safeParseArray<Txn>(safeLocalGet(TRIAL_TX_KEY)));
          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setProducts(safeParseArray<Product>(safeLocalGet(TRIAL_PRODUCTS_KEY)));
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));

          replaceUrlLangTheme(currentLang, currentTheme);

          if (shouldOpenNew) {
            setTimeout(() => openNewForm(fullscreenParam === "1"), 100);
          }

          return;
        }
      } catch {
        // Bad trial data, clear below.
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_TX_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
      safeLocalRemove(TRIAL_PRODUCTS_KEY);
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
      .select("theme")
      .eq("id", userId)
      .single();

    let finalTheme = currentTheme;
    const profile = profileData as Profile | null;

    if (profile?.theme) {
      const profileTheme = normalizeThemeKey(profile.theme);

      if (isThemeKey(profileTheme)) {
        finalTheme = profileTheme;
        setThemeKey(profileTheme);
        saveThemeKey(profileTheme);
        applyThemeEverywhere(profileTheme);
      }
    }

    replaceUrlLangTheme(currentLang, finalTheme);

    await loadAll(userId);

    if (shouldOpenNew) {
      setTimeout(() => openNewForm(fullscreenParam === "1"), 100);
    }
  }

  async function loadAll(userId: string) {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: productData } = await supabase
      .from("products")
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
    setProducts((productData || []) as Product[]);
    setInvoices((invoiceData || []) as Invoice[]);
  }

  function saveTrialTransactions(nextTx: Txn[]) {
    setTransactions(nextTx);
    safeLocalSet(TRIAL_TX_KEY, JSON.stringify(nextTx));
  }

  function saveCategories(next: string[]) {
    const fixed = uniqueCleanList(next.map(normalizeCategory));
    setCategories(fixed);
    safeLocalSet(CATEGORY_KEY, JSON.stringify(fixed));
  }

  function addCategory() {
    const value = normalizeCategory(newCategory);
    if (!value) return;

    saveCategories([...categories, value]);
    setForm((prev) => ({ ...prev, category_name: value }));
    setNewCategory("");
  }

  function removeCategory(value: string) {
    const key = normalizeCategory(value);
    const next = categories.filter((x) => normalizeCategory(x) !== key);

    saveCategories(next);

    if (normalizeCategory(form.category_name) === key) {
      setForm((prev) => ({ ...prev, category_name: "" }));
    }
  }

  function buildUrl(path: string, extra?: string) {
    const query = new URLSearchParams();

    if (isTrial) query.set("mode", "trial");

    query.set("lang", lang);
    query.set("theme", themeKey);
    query.set("refresh", String(Date.now()));

    if (extra) {
      const extraQuery = new URLSearchParams(extra);
      extraQuery.forEach((value, key) => {
        query.set(key, value);
      });
    }

    return `${path}?${query.toString()}`;
  }

  function go(path: string, extra?: string) {
    window.location.href = buildUrl(path, extra);
  }

  function backToDashboard() {
    window.location.href = buildUrl("/dashboard");
  }

  function goRelatedFeature() {
    go(relatedPath);
  }

  function openNewForm(forceFullscreen = false) {
    setEditingId(null);
    setIsFullscreen(forceFullscreen);
    setForm({
      txn_date: today(),
      txn_type: "income",
      amount: "",
      category_name: "",
      debt_amount: "",
      note: "",
      customer_id: "",
      product_id: "",
      invoice_id: "",
    });
    setShowForm(true);
  }

  function closeForm() {
    const q = new URLSearchParams(window.location.search);
    const returnParam = q.get("return") || returnTo;

    if (returnParam === "dashboard") {
      window.location.href = buildUrl("/dashboard");
      return;
    }

    setEditingId(null);
    setShowForm(false);
    setIsFullscreen(false);
    setForm({
      txn_date: today(),
      txn_type: "income",
      amount: "",
      category_name: "",
      debt_amount: "",
      note: "",
      customer_id: "",
      product_id: "",
      invoice_id: "",
    });

    q.delete("open");
    q.delete("fullscreen");
    q.delete("return");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function editTransaction(tx: Txn) {
    setEditingId(tx.id);
    setIsFullscreen(false);
    setForm({
      txn_date: tx.txn_date || today(),
      txn_type: tx.txn_type || "income",
      amount: String(tx.amount || ""),
      category_name: normalizeCategory(tx.category_name),
      debt_amount: String(tx.debt_amount || ""),
      note: tx.note || "",
      customer_id: "",
      product_id: "",
      invoice_id: tx.source_type === "invoice" && tx.source_id ? tx.source_id : "",
    });
    setShowForm(true);
  }

  function selectedCustomerName() {
    const c = customers.find((x) => x.id === form.customer_id);
    return c?.name || "";
  }

  function selectedProductName() {
    const p = products.find((x) => x.id === form.product_id);
    return p?.name || "";
  }

  function selectedInvoiceText() {
    const inv = invoices.find((x) => x.id === form.invoice_id);
    if (!inv) return "";

    return `${inv.invoice_no || inv.id}${inv.customer_name ? `｜${inv.customer_name}` : ""}`;
  }

  function buildFinalNote() {
    const parts: string[] = [];

    if (form.customer_id) parts.push(`${t.customer}: ${selectedCustomerName()}`);
    if (form.product_id) parts.push(`${t.product}: ${selectedProductName()}`);
    if (form.invoice_id) parts.push(`${t.invoice}: ${selectedInvoiceText()}`);
    if (form.note.trim()) parts.push(form.note.trim());

    return parts.join("｜") || null;
  }

  async function saveTransaction() {
    setMsg("");

    if (!form.txn_date || !form.amount || !form.category_name.trim()) {
      setMsg(t.needRequired);
      return;
    }

    const amount = Number(form.amount || 0);
    const debt = Number(form.debt_amount || 0);
    const category = normalizeCategory(form.category_name);
    const finalNote = buildFinalNote();

    if (category && !categories.map(normalizeCategory).includes(category)) {
      saveCategories([...categories, category]);
    }

    if (isTrial) {
      const payload: Txn = {
        id: editingId || makeId(),
        user_id: "trial",
        txn_date: form.txn_date,
        txn_type: form.txn_type,
        amount,
        category_name: category,
        debt_amount: debt,
        note: finalNote,
        source_type: form.invoice_id ? "invoice" : null,
        source_id: form.invoice_id || null,
        created_at: new Date().toISOString(),
      };

      const next = editingId
        ? transactions.map((x) => (x.id === editingId ? payload : x))
        : [payload, ...transactions];

      saveTrialTransactions(next);
      setMsg(t.saved);
      closeForm();
      return;
    }

    if (!session) return;

    const basicPayload = {
      user_id: session.user.id,
      txn_date: form.txn_date,
      txn_type: form.txn_type,
      amount,
      category_name: category,
      debt_amount: debt,
      note: finalNote,
    };

    const fullPayload = {
      ...basicPayload,
      source_type: form.invoice_id ? "invoice" : null,
      source_id: form.invoice_id || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("transactions")
        .update(fullPayload)
        .eq("id", editingId)
        .eq("user_id", session.user.id);

      if (error) {
        if (isSchemaCacheMissingSource(error.message)) {
          const retry = await supabase
            .from("transactions")
            .update(basicPayload)
            .eq("id", editingId)
            .eq("user_id", session.user.id);

          if (retry.error) {
            setMsg(retry.error.message);
            return;
          }
        } else {
          setMsg(error.message);
          return;
        }
      }
    } else {
      const { error } = await supabase.from("transactions").insert(fullPayload);

      if (error) {
        if (isSchemaCacheMissingSource(error.message)) {
          const retry = await supabase.from("transactions").insert(basicPayload);

          if (retry.error) {
            setMsg(retry.error.message);
            return;
          }
        } else {
          setMsg(error.message);
          return;
        }
      }
    }

    setMsg(t.saved);

    const q = new URLSearchParams(window.location.search);
    if ((q.get("return") || returnTo) === "dashboard") {
      closeForm();
      return;
    }

    closeForm();
    await loadAll(session.user.id);
  }

  async function confirmDeleteTransaction() {
    if (!deleteTarget) return;

    const id = deleteTarget.id;

    if (isTrial) {
      const next = transactions.filter((x) => x.id !== id);
      saveTrialTransactions(next);
      setMsg(t.deleted);
      setDeleteTarget(null);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.deleted);
    setDeleteTarget(null);
    await loadAll(session.user.id);
  }

  const latestMonthKey = useMemo(() => {
    const months = [
      ...transactions.map((tx) => getMonthKeyFromDate(tx.txn_date)),
      ...invoices.map((inv) => getMonthKeyFromDate(getInvoiceEffectiveDate(inv))),
    ].filter(Boolean);

    if (months.length === 0) return today().slice(0, 7);

    return months.sort().reverse()[0];
  }, [transactions, invoices]);

  const activeMonthKey = summaryMonth || latestMonthKey;

  const monthRecords = useMemo(() => {
    return transactions.filter((tx) => tx.txn_date?.startsWith(activeMonthKey));
  }, [transactions, activeMonthKey]);

  const summaryIncome = useMemo(() => {
    return monthRecords
      .filter((x) => x.txn_type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [monthRecords]);

  const summaryExpense = useMemo(() => {
    return monthRecords
      .filter((x) => x.txn_type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [monthRecords]);

  const summaryProfit = useMemo(() => {
    return summaryIncome - summaryExpense;
  }, [summaryIncome, summaryExpense]);

  const summaryBalance = useMemo(() => {
    return summaryIncome - summaryExpense;
  }, [summaryIncome, summaryExpense]);

  const customerDebtItems = useMemo<DebtItem[]>(() => {
    const customerItems: DebtItem[] = customers
      .map((c) => {
        const amount = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);

        return {
          id: `customer-${c.id}`,
          source: "customer" as const,
          customerLabel: c.company_name
            ? `${c.name || t.noData} / ${c.company_name}`
            : c.name || t.noData,
          amount,
          dueDate: c.last_payment_date || "-",
          sortTime: getDueTime(c.last_payment_date || ""),
        };
      })
      .filter((x) => x.amount > 0);

    const invoiceItems: DebtItem[] = invoices
      .filter((inv) => isInvoiceUnpaid(inv))
      .map((inv) => {
        const customer = customers.find((c) => c.id === inv.customer_id);

        const customerName = inv.customer_name || customer?.name || t.noData;
        const companyName = inv.customer_company || customer?.company_name || "";

        const customerLabel = companyName
          ? `${customerName} / ${companyName}`
          : customerName;

        const dueDate = inv.due_date || inv.invoice_date || inv.created_at?.slice(0, 10) || "-";

        return {
          id: `invoice-${inv.id}`,
          source: "invoice" as const,
          customerLabel,
          amount: Number(inv.total || 0),
          dueDate,
          sortTime: getDueTime(dueDate),
        };
      });

    return [...customerItems, ...invoiceItems].sort((a, b) => {
      if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime;
      return b.amount - a.amount;
    });
  }, [invoices, customers, t.noData]);

  const totalCustomerDebt = useMemo(() => {
    return customerDebtItems.reduce((s, x) => s + Number(x.amount || 0), 0);
  }, [customerDebtItems]);

  const nearestDebt = customerDebtItems[0] || null;

  const filteredRecords = useMemo(() => {
    const s = search.toLowerCase().trim();

    return transactions.filter((tx) => {
      const invoice =
        tx.source_type === "invoice" ? invoices.find((x) => x.id === tx.source_id) : null;

      const selectedFilterCustomerName =
        customers.find((c) => c.id === filterCustomerId)?.name?.toLowerCase() || "";

      const matchMonth = tx.txn_date?.startsWith(activeMonthKey);
      const matchType = filterType === "all" || tx.txn_type === filterType;

      const matchCustomer =
        !filterCustomerId ||
        Boolean(tx.note?.toLowerCase().includes(selectedFilterCustomerName)) ||
        invoice?.customer_id === filterCustomerId;

      const matchStart = !filterStartDate || tx.txn_date >= filterStartDate;
      const matchEnd = !filterEndDate || tx.txn_date <= filterEndDate;

      const searchText = [
        tx.txn_date,
        tx.txn_type === "income" ? t.income : t.expense,
        tx.amount,
        displayCategory(tx.category_name),
        tx.category_name,
        tx.note,
        invoice?.invoice_no,
        invoice?.customer_name,
        invoice?.customer_company,
        invoice?.total,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !s || searchText.includes(s);

      return matchMonth && matchType && matchCustomer && matchStart && matchEnd && matchSearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    transactions,
    search,
    filterType,
    filterCustomerId,
    filterStartDate,
    filterEndDate,
    invoices,
    customers,
    activeMonthKey,
    lang,
  ]);

  return (
    <main
      className="smartacctg-page smartacctg-records-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{RECORDS_PAGE_CSS}</style>

      <div style={topbarStyle}>
        <button
          type="button"
          onClick={backToDashboard}
          className="sa-back-btn"
          style={{
            ...backBtnStyle,
            color: theme.accent,
            borderColor: theme.border,
            background: theme.inputBg || "#fff",
          }}
        >
          ← {t.back}
        </button>
      </div>

      {isTrial ? <div style={trialMsgStyle}>{t.trialMode}</div> : null}

      {msg ? (
        <div
          style={{
            ...msgStyle,
            background: theme.softBg || theme.soft || theme.card,
            color: theme.text,
          }}
        >
          {msg}
        </div>
      ) : null}

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <div style={recordHeaderStyle}>
          <h1 style={titleStyle}>{t.title}</h1>

          <button
            type="button"
            onClick={() => openNewForm(false)}
            aria-label={t.add}
            style={{
              ...plusBtnStyle,
              background: theme.accent,
            }}
          >
            +
          </button>
        </div>

        <div style={summaryBoxStyle}>
          <div style={monthRowStyle}>
            <strong style={{ color: theme.text }}>
              {t.summaryMonth}: {activeMonthKey}
            </strong>

            <div className="records-month-select-grid" style={monthSelectGridStyle}>
              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.year}</label>
                <select
                  value={activeMonthKey.slice(0, 4)}
                  onChange={(e) => {
                    const nextYear = e.target.value;
                    const currentMonthValue = activeMonthKey.slice(5, 7) || "01";
                    setSummaryMonth(`${nextYear}-${currentMonthValue}`);
                  }}
                  style={themedInputStyle}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.month}</label>
                <select
                  value={activeMonthKey.slice(5, 7)}
                  onChange={(e) => {
                    const currentYearValue = activeMonthKey.slice(0, 4) || String(currentYear);
                    setSummaryMonth(`${currentYearValue}-${e.target.value}`);
                  }}
                  style={themedInputStyle}
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={summaryDividerStyle} />

          <div className="records-summary-line">
            <span>{t.balance}</span>
            <strong style={{ color: theme.accent }}>{formatRM(summaryBalance)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthIncome}</span>
            <strong style={{ color: "#16a34a" }}>{formatRM(summaryIncome)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthExpense}</span>
            <strong style={{ color: "#dc2626" }}>{formatRM(summaryExpense)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthProfit}</span>
            <strong style={{ color: summaryProfit < 0 ? "#dc2626" : "#16a34a" }}>
              {formatRM(summaryProfit)}
            </strong>
          </div>

          <div className="records-summary-line">
            <span style={{ color: "#dc2626" }}>{t.customerDebt}</span>
            <strong style={{ color: "#dc2626" }}>{formatRM(totalCustomerDebt)}</strong>
          </div>

          <div style={{ ...debtDetailStyle, color: "#dc2626" }}>
            {nearestDebt ? (
              <>
                <div>{nearestDebt.customerLabel}</div>
                <div>{formatRM(nearestDebt.amount)}</div>
                <div>
                  {t.dueDate}: {nearestDebt.dueDate}
                </div>
              </>
            ) : (
              <div>{t.noDebt}</div>
            )}
          </div>
        </div>
      </section>

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <h2 style={sectionTitleStyle}>{t.searchTitle}</h2>

        <div style={responsiveGridStyle}>
          <input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={themedInputStyle}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | TxnType)}
            style={themedInputStyle}
          >
            <option value="all">{t.all}</option>
            <option value="income">{t.income}</option>
            <option value="expense">{t.expense}</option>
          </select>

          <select
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
            style={themedInputStyle}
          >
            <option value="">{t.filterCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "-"}
              </option>
            ))}
          </select>

          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.startDate}</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={themedDateInputStyle}
            />
          </div>

          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.endDate}</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={themedDateInputStyle}
            />
          </div>
        </div>
      </section>

      <RecordsList
        filteredRecords={filteredRecords}
        invoices={invoices}
        t={t}
        theme={theme}
        themeSubText={themeSubText}
        displayCategory={displayCategory}
        editTransaction={editTransaction}
        setDeleteTarget={setDeleteTarget}
      />

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <h2 style={sectionTitleStyle}>{t.related}</h2>

        <div style={relatedMenuRowStyle}>
          <select
            value={relatedPath}
            onChange={(e) => setRelatedPath(e.target.value)}
            style={themedInputStyle}
          >
            <option value="/dashboard/customers">{t.customers}</option>
            <option value="/dashboard/products">{t.products}</option>
            <option value="/dashboard/invoices">{t.invoices}</option>
          </select>

          <button
            type="button"
            onClick={goRelatedFeature}
            style={{
              ...primaryBtnStyle,
              background: theme.accent,
              marginTop: 0,
            }}
          >
            {t.goFeature}
          </button>
        </div>
      </section>

      {showForm ? (
        <AddRecordForm
          isFullscreen={isFullscreen}
          editingId={editingId}
          form={form}
          setForm={setForm}
          categories={categories}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          addCategory={addCategory}
          removeCategory={removeCategory}
          displayCategory={displayCategory}
          customers={customers}
          products={products}
          invoices={invoices}
          t={t}
          theme={theme}
          themeSubText={themeSubText}
          themedInputStyle={themedInputStyle}
          themedDateInputStyle={themedDateInputStyle}
          saveTransaction={saveTransaction}
          closeForm={closeForm}
        />
      ) : null}

      {deleteTarget ? (
        <div style={overlayStyle}>
          <section
            className="sa-modal"
            style={{
              ...deleteModalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <h2 style={modalTitleStyle}>{t.deletePreview}</h2>

            <div style={deleteInfoBoxStyle}>
              <p>
                <strong>{t.type}:</strong>{" "}
                {deleteTarget.txn_type === "income" ? t.income : t.expense}
              </p>
              <p>
                <strong>{t.date}:</strong> {deleteTarget.txn_date}
              </p>
              <p>
                <strong>{t.category}:</strong> {displayCategory(deleteTarget.category_name)}
              </p>
              <p>
                <strong>{t.amount}:</strong> {formatRM(Number(deleteTarget.amount || 0))}
              </p>
              {Number(deleteTarget.debt_amount || 0) > 0 ? (
                <p>
                  <strong>{t.debtAmount}:</strong>{" "}
                  {formatRM(Number(deleteTarget.debt_amount || 0))}
                </p>
              ) : null}
              {deleteTarget.note ? (
                <p>
                  <strong>{t.note}:</strong> {deleteTarget.note}
                </p>
              ) : null}
            </div>

            <p style={{ color: "#dc2626", fontWeight: 900 }}>{t.confirmDelete}</p>

            <div style={deleteConfirmRowStyle}>
              <button type="button" onClick={confirmDeleteTransaction} style={confirmDeleteBtnStyle}>
                {t.confirm}
              </button>

              <button type="button" onClick={() => setDeleteTarget(null)} style={cancelDeleteBtnStyle}>
                {t.cancelDelete}
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
  padding: "clamp(10px, 2vw, 24px)",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
};

const topbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const backBtnStyle: CSSProperties = {
  border: "2px solid",
  borderRadius: "999px",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  whiteSpace: "nowrap",
};

const cardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  marginBottom: 14,
};

const recordHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  fontWeight: 900,
  lineHeight: 1.12,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
};

const plusBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  color: "#fff",
  border: "none",
  fontSize: 30,
  fontWeight: 900,
  lineHeight: 1,
  padding: 0,
};

const summaryBoxStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  marginTop: 8,
};

const monthRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 10,
  alignItems: "center",
};

const monthSelectGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  width: "100%",
};

const summaryDividerStyle: CSSProperties = {
  height: 1,
  width: "100%",
  background: "rgba(148, 163, 184, 0.38)",
};

const debtDetailStyle: CSSProperties = {
  marginTop: 2,
  paddingTop: 4,
  display: "grid",
  gap: 4,
  lineHeight: 1.35,
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  outline: "none",
  fontSize: 16,
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  textAlign: "center",
  textAlignLast: "center" as any,
  display: "block",
  lineHeight: "var(--sa-control-h)",
  paddingTop: 0,
  paddingBottom: 0,
};

const responsiveGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const relatedMenuRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
};

const primaryBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
};

const msgStyle: CSSProperties = {
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
};

const trialMsgStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.52)",
  padding: "clamp(12px, 3vw, 24px)",
  zIndex: 999,
  overflowY: "auto",
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
};

const dateWrapStyle: CSSProperties = {
  width: "100%",
};

const dateLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
};

const deleteModalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 680,
  margin: "0 auto",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const deleteInfoBoxStyle: CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.55)",
  borderRadius: 18,
  padding: 14,
  marginTop: 14,
  marginBottom: 14,
};

const deleteConfirmRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 16,
};

const confirmDeleteBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  background: "#dc2626",
  color: "#fff",
};

const cancelDeleteBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid #cbd5e1",
  borderRadius: "var(--sa-radius-control)",
  background: "#fff",
  color: "#111827",
};
