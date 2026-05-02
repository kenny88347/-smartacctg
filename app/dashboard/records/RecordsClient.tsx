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
import AccountRecords from "./AccountRecords";
import AddRecordModal from "./AddRecordModal";
import { RelatedFeaturesPanel } from "./LinkedDataPanel";
import {
  CATEGORY_KEY,
  DEFAULT_CATEGORY_KEYS,
  LANG_KEY,
  RECORDS_PAGE_CSS,
  TRIAL_CUSTOMERS_KEY,
  TRIAL_INVOICES_KEY,
  TRIAL_KEY,
  TRIAL_PRODUCTS_KEY,
  TRIAL_TX_KEY,
  TXT,
  Customer,
  DebtItem,
  Invoice,
  Lang,
  Product,
  Profile,
  RecordFormState,
  Txn,
  TxnType,
  applyThemeEverywhere,
  displayRecordNote,
  formatRM,
  getBlankForm,
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
  styles,
  today,
  uniqueCleanList,
} from "./recordsShared";

export default function RecordsClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => getInitialFullscreen());
  const [returnTo, setReturnTo] = useState<string>(() => getInitialReturn());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Txn | null>(null);
  const [msg, setMsg] = useState("");

  const [relatedPath, setRelatedPath] = useState("/dashboard/customers");

  const [form, setForm] = useState<RecordFormState>(() => getBlankForm());

  const t = TXT[lang];
  const theme = THEMES[themeKey] || THEMES.deepTeal;
  const themeSubText = theme.subText || theme.muted || "#64748b";

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 9 }, (_, i) => String(currentYear - 4 + i));
  const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  const themedInputStyle: CSSProperties = {
    ...styles.inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  const themedDateInputStyle: CSSProperties = {
    ...styles.inputStyle,
    appearance: "none",
    WebkitAppearance: "none",
    textAlign: "center",
    textAlignLast: "center" as any,
    display: "block",
    lineHeight: "var(--sa-control-h)",
    paddingTop: 0,
    paddingBottom: 0,
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

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
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
    setForm(getBlankForm());
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
    setForm(getBlankForm());

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
      note: displayRecordNote(tx.note || "", t),
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

    if (form.customer_id) parts.push(`Customer: ${selectedCustomerName()}`);
    if (form.product_id) parts.push(`Product: ${selectedProductName()}`);
    if (form.invoice_id) parts.push(`Invoice: ${selectedInvoiceText()}`);
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

        const customerLabel = companyName ? `${customerName} / ${companyName}` : customerName;

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
        displayRecordNote(tx.note, t),
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

  function getInvoice(tx: Txn) {
    if (tx.source_type !== "invoice" || !tx.source_id) return null;
    return invoices.find((x) => x.id === tx.source_id) || null;
  }

  function isDebtRecord(tx: Txn) {
    const invoice = getInvoice(tx);
    return Number(tx.debt_amount || 0) > 0 || Boolean(invoice && isInvoiceUnpaid(invoice));
  }

  return (
    <main
      className="smartacctg-page smartacctg-records-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...styles.pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{RECORDS_PAGE_CSS}</style>

      <div style={styles.topbarStyle}>
        <button
          type="button"
          onClick={backToDashboard}
          className="sa-back-btn"
          style={{
            ...styles.backBtnStyle,
            color: theme.accent,
            borderColor: theme.border,
            background: theme.inputBg || "#fff",
          }}
        >
          ← {t.back}
        </button>
      </div>

      {isTrial ? <div style={styles.trialMsgStyle}>{t.trialMode}</div> : null}

      {msg ? (
        <div
          style={{
            ...styles.msgStyle,
            background: theme.softBg || theme.soft || theme.card,
            color: theme.text,
          }}
        >
          {msg}
        </div>
      ) : null}

      <AccountRecords
        t={t}
        theme={theme}
        themeSubText={themeSubText}
        activeMonthKey={activeMonthKey}
        currentYear={currentYear}
        yearOptions={yearOptions}
        monthOptions={monthOptions}
        setSummaryMonth={setSummaryMonth}
        summaryBalance={summaryBalance}
        summaryIncome={summaryIncome}
        summaryExpense={summaryExpense}
        summaryProfit={summaryProfit}
        totalCustomerDebt={totalCustomerDebt}
        nearestDebt={nearestDebt}
        search={search}
        setSearch={setSearch}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCustomerId={filterCustomerId}
        setFilterCustomerId={setFilterCustomerId}
        filterStartDate={filterStartDate}
        setFilterStartDate={setFilterStartDate}
        filterEndDate={filterEndDate}
        setFilterEndDate={setFilterEndDate}
        customers={customers}
        filteredRecords={filteredRecords}
        getInvoice={getInvoice}
        isDebtRecord={isDebtRecord}
        displayCategory={displayCategory}
        openNewForm={() => openNewForm(false)}
        editTransaction={editTransaction}
        setDeleteTarget={setDeleteTarget}
        themedInputStyle={themedInputStyle}
        themedDateInputStyle={themedDateInputStyle}
        themedCardStyle={themedCardStyle}
      />

      <RelatedFeaturesPanel
        t={t}
        theme={theme}
        themeSubText={themeSubText}
        relatedPath={relatedPath}
        setRelatedPath={setRelatedPath}
        goRelatedFeature={goRelatedFeature}
        themedInputStyle={themedInputStyle}
        themedCardStyle={themedCardStyle}
      />

      <AddRecordModal
        showForm={showForm}
        isFullscreen={isFullscreen}
        editingId={editingId}
        t={t}
        theme={theme}
        themeSubText={themeSubText}
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
        saveTransaction={saveTransaction}
        closeForm={closeForm}
        themedInputStyle={themedInputStyle}
        themedDateInputStyle={themedDateInputStyle}
      />

      {deleteTarget ? (
        <div style={styles.overlayStyle}>
          <section
            className="sa-modal"
            style={{
              ...styles.deleteModalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <h2 style={styles.modalTitleStyle}>{t.deletePreview}</h2>

            <div style={styles.deleteInfoBoxStyle}>
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
                  <strong>{t.note}:</strong> {displayRecordNote(deleteTarget.note, t)}
                </p>
              ) : null}
            </div>

            <p style={{ color: "#dc2626", fontWeight: 900 }}>{t.confirmDelete}</p>

            <div style={styles.deleteConfirmRowStyle}>
              <button type="button" onClick={confirmDeleteTransaction} style={styles.confirmDeleteBtnStyle}>
                {t.confirm}
              </button>

              <button type="button" onClick={() => setDeleteTarget(null)} style={styles.cancelDeleteBtnStyle}>
                {t.cancelDelete}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}