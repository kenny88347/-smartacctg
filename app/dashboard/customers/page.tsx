"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  type ThemeKey,
  applyThemeToDocument,
  getThemeKeyFromUrlOrLocalStorage,
  normalizeThemeKey,
  saveThemeKey,
} from "@/lib/smartacctgTheme";

type Lang = "zh" | "en" | "ms";
type CustomerStatus = "normal" | "vip" | "debt" | "blocked";

type Customer = {
  id: string;
  user_id?: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company_name?: string | null;
  company_reg_no?: string | null;
  company_phone?: string | null;
  address?: string | null;
  status?: CustomerStatus | null;
  customer_status?: CustomerStatus | null;
  debt_amount?: number | null;
  paid_amount?: number | null;
  last_payment_date?: string | null;
  note?: string | null;
  created_at?: string | null;
};

type Invoice = {
  id: string;
  user_id?: string;
  customer_id?: string | null;
  customer_name?: string | null;
  invoice_no?: string | null;
  total?: number | null;
  total_profit?: number | null;
  invoice_date?: string | null;
  created_at?: string | null;
};

type Profile = {
  id?: string;
  theme?: string | null;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";
const LANG_KEY = "smartacctg_lang";

const today = () => new Date().toISOString().slice(0, 10);

const TXT = {
  zh: {
    pageTitle: "客户资料记录",
    formTitle: "填写客户资料",
    back: "返回控制台",
    add: "新增",
    save: "保存资料",
    update: "保存修改",
    cancel: "取消",
    close: "关闭",
    edit: "编辑",
    delete: "删除",
    confirm: "确定",
    cancelDelete: "取消",
    deletePreview: "删除前确认资料",
    confirmDelete: "确定要删除这个客户吗？",
    search: "搜索客户名称 / 手机号码 / 公司名称 / 电子邮件",
    all: "全部",
    normal: "正常客户",
    vip: "VIP 客户",
    debt: "有欠款",
    blocked: "停止合作",
    personal: "个人资料",
    company: "公司资料",
    name: "客户名称",
    phone: "客户手机号码",
    email: "电子邮件",
    companyName: "公司名称",
    regNo: "SSM / 注册号",
    companyPhone: "公司电话",
    address: "地址",
    status: "客户状态",
    debtAmount: "欠款金额",
    paidAmount: "已付款金额",
    balance: "余额",
    lastPaymentDate: "日期",
    note: "备注",
    whatsapp: "WhatsApp",
    whatsappNoPhone: "这个客户没有填写手机号码或公司电话，请先编辑客户资料。",
    invoice: "开发票",
    invoiceRecords: "发票记录",
    noInvoice: "这个客户还没有发票记录",
    noCustomers: "还没有客户资料",
    saved: "保存成功",
    deleted: "删除成功",
    trialMode: "免费试用模式：资料只会暂存在本机",
    needName: "请填写客户名称",
  },
  en: {
    pageTitle: "Customer Records",
    formTitle: "Customer Information",
    back: "Back to Dashboard",
    add: "Add",
    save: "Save",
    update: "Save Changes",
    cancel: "Cancel",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    cancelDelete: "Cancel",
    deletePreview: "Delete Confirmation",
    confirmDelete: "Confirm delete this customer?",
    search: "Search customer name / phone / company / email",
    all: "All",
    normal: "Normal",
    vip: "VIP",
    debt: "In Debt",
    blocked: "Blocked",
    personal: "Personal Info",
    company: "Company Info",
    name: "Customer Name",
    phone: "Customer Phone",
    email: "Email",
    companyName: "Company Name",
    regNo: "SSM / Registration No.",
    companyPhone: "Company Phone",
    address: "Address",
    status: "Customer Status",
    debtAmount: "Debt Amount",
    paidAmount: "Paid Amount",
    balance: "Balance",
    lastPaymentDate: "Date",
    note: "Note",
    whatsapp: "WhatsApp",
    whatsappNoPhone: "This customer has no phone or company phone. Please edit the customer first.",
    invoice: "Create Invoice",
    invoiceRecords: "Invoice Records",
    noInvoice: "This customer has no invoice records yet",
    noCustomers: "No customer records yet",
    saved: "Saved",
    deleted: "Deleted",
    trialMode: "Free trial mode: data is stored locally only",
    needName: "Please enter customer name",
  },
  ms: {
    pageTitle: "Rekod Pelanggan",
    formTitle: "Maklumat Pelanggan",
    back: "Kembali ke Dashboard",
    add: "Tambah",
    save: "Simpan",
    update: "Simpan Perubahan",
    cancel: "Batal",
    close: "Tutup",
    edit: "Edit",
    delete: "Padam",
    confirm: "Sahkan",
    cancelDelete: "Batal",
    deletePreview: "Sahkan Padam",
    confirmDelete: "Padam pelanggan ini?",
    search: "Cari nama pelanggan / telefon / syarikat / email",
    all: "Semua",
    normal: "Biasa",
    vip: "VIP",
    debt: "Ada Hutang",
    blocked: "Disekat",
    personal: "Maklumat Peribadi",
    company: "Maklumat Syarikat",
    name: "Nama Pelanggan",
    phone: "Telefon Pelanggan",
    email: "Email",
    companyName: "Nama Syarikat",
    regNo: "SSM / No. Daftar",
    companyPhone: "Telefon Syarikat",
    address: "Alamat",
    status: "Status Pelanggan",
    debtAmount: "Jumlah Hutang",
    paidAmount: "Jumlah Dibayar",
    balance: "Baki",
    lastPaymentDate: "Tarikh",
    note: "Catatan",
    whatsapp: "WhatsApp",
    whatsappNoPhone: "Pelanggan ini tiada nombor telefon. Sila edit maklumat pelanggan dahulu.",
    invoice: "Buat Invois",
    invoiceRecords: "Rekod Invois",
    noInvoice: "Pelanggan ini belum ada rekod invois",
    noCustomers: "Tiada rekod pelanggan",
    saved: "Disimpan",
    deleted: "Dipadam",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
    needName: "Sila isi nama pelanggan",
  },
};

const CUSTOMERS_CSS = `
  .smartacctg-customers-page h1,
  .smartacctg-customers-page h2,
  .smartacctg-customers-page h3,
  .smartacctg-customers-page button,
  .smartacctg-customers-page strong {
    font-weight: 900 !important;
  }

  .smartacctg-customers-page p,
  .smartacctg-customers-page div,
  .smartacctg-customers-page span,
  .smartacctg-customers-page label,
  .smartacctg-customers-page input,
  .smartacctg-customers-page select,
  .smartacctg-customers-page textarea {
    font-weight: 400 !important;
  }

  .smartacctg-customers-page input[type="date"] {
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

  .smartacctg-customers-page input[type="date"]::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
  }

  .smartacctg-customers-page input[type="date"]::-webkit-datetime-edit {
    width: 100% !important;
    text-align: center !important;
    padding: 0 !important;
  }

  .smartacctg-customers-page input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
  }

  .smartacctg-customers-page .fullscreen-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: rgba(15, 23, 42, 0.58) !important;
  }

  .smartacctg-customers-page .fullscreen-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    min-height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border: none !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)) !important;
  }

  .smartacctg-customers-page .modal-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 10 !important;
    background: inherit !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 12px !important;
    align-items: center !important;
    padding-bottom: 12px !important;
  }
`;

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeLocalGet(key: string) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function safeLocalSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function safeLocalRemove(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "zh";
  const q = new URLSearchParams(window.location.search);
  const urlLang = q.get("lang") as Lang | null;
  const savedLang = safeLocalGet(LANG_KEY) as Lang | null;
  if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") return urlLang;
  if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") return savedLang;
  return "zh";
}

function getUrlFlag(key: string) {
  if (typeof window === "undefined") return "";
  const q = new URLSearchParams(window.location.search);
  return q.get(key) || "";
}

function applyThemeEverywhere(key: ThemeKey) {
  if (typeof document === "undefined") return;

  const fixedKey = normalizeThemeKey(key);
  const theme = THEMES[fixedKey] || THEMES.deepTeal;

  applyThemeToDocument(fixedKey);
  document.documentElement.setAttribute("data-sa-theme", fixedKey);
  document.documentElement.setAttribute("data-smartacctg-theme", fixedKey);

  document.documentElement.style.setProperty("--sa-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--sa-card-bg", theme.card);
  document.documentElement.style.setProperty("--sa-panel-bg", theme.panelBg || theme.card);
  document.documentElement.style.setProperty("--sa-item-bg", theme.itemBg || theme.card);
  document.documentElement.style.setProperty("--sa-input-bg", theme.inputBg || "#ffffff");
  document.documentElement.style.setProperty("--sa-input-text", theme.inputText || "#111827");
  document.documentElement.style.setProperty("--sa-border", theme.border);
  document.documentElement.style.setProperty("--sa-accent", theme.accent);
  document.documentElement.style.setProperty("--sa-text", theme.text);
  document.documentElement.style.setProperty("--sa-muted", theme.muted || theme.subText);
  document.documentElement.style.setProperty("--sa-soft-bg", theme.softBg || theme.soft || theme.card);
  document.documentElement.style.setProperty("--sa-glow", theme.glow);
}

function formatRM(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusLabel(status: CustomerStatus | null | undefined, t: typeof TXT.zh) {
  if (status === "vip") return t.vip;
  if (status === "debt") return t.debt;
  if (status === "blocked") return t.blocked;
  return t.normal;
}

function isSchemaColumnError(error: any) {
  const msg = String(error?.message || "").toLowerCase();
  return msg.includes("schema cache") || msg.includes("could not find") || msg.includes("column");
}

function getMissingColumnName(error: any) {
  const msg = String(error?.message || "");
  const match =
    msg.match(/Could not find the '([^']+)' column/i) ||
    msg.match(/column "([^"]+)" does not exist/i);
  return match?.[1] || "";
}

async function insertAdaptive(table: string, inputPayload: Record<string, any>) {
  let payload = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 30; i++) {
    const { data, error } = await supabase.from(table).insert(payload).select("*").single();
    if (!error) return data;

    lastError = error;
    if (!isSchemaColumnError(error)) throw error;

    const missing = getMissingColumnName(error);
    if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
      const next = { ...payload };
      delete next[missing];
      payload = next;
      continue;
    }

    const optional = [
      "email",
      "company_name",
      "company_reg_no",
      "company_phone",
      "address",
      "status",
      "customer_status",
      "debt_amount",
      "paid_amount",
      "last_payment_date",
      "note",
    ].find((x) => Object.prototype.hasOwnProperty.call(payload, x));

    if (!optional) throw error;
    const next = { ...payload };
    delete next[optional];
    payload = next;
  }

  throw lastError || new Error("Insert failed");
}

async function updateAdaptive(table: string, id: string, userId: string, inputPayload: Record<string, any>) {
  let payload = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 30; i++) {
    const { error } = await supabase.from(table).update(payload).eq("id", id).eq("user_id", userId);
    if (!error) return;

    lastError = error;
    if (!isSchemaColumnError(error)) throw error;

    const missing = getMissingColumnName(error);
    if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
      const next = { ...payload };
      delete next[missing];
      payload = next;
      continue;
    }

    const optional = [
      "email",
      "company_name",
      "company_reg_no",
      "company_phone",
      "address",
      "status",
      "customer_status",
      "debt_amount",
      "paid_amount",
      "last_payment_date",
      "note",
    ].find((x) => Object.prototype.hasOwnProperty.call(payload, x));

    if (!optional) throw error;
    const next = { ...payload };
    delete next[optional];
    payload = next;
  }

  throw lastError || new Error("Update failed");
}

export default function CustomersPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | CustomerStatus>("all");

  const [showForm, setShowForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [returnTo, setReturnTo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company_name: "",
    company_reg_no: "",
    company_phone: "",
    address: "",
    status: "normal" as CustomerStatus,
    debt_amount: "",
    paid_amount: "",
    last_payment_date: today(),
    note: "",
  });

  const t = TXT[lang];
  const theme = THEMES[themeKey] || THEMES.deepTeal;
  const themeSubText = theme.subText || theme.muted || "#64748b";

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

    setReturnTo(getUrlFlag("return"));
    setIsFullscreen(getUrlFlag("fullscreen") === "1");

    init(initialLang, initialTheme);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const mode = getUrlFlag("mode");
    const open = getUrlFlag("open");
    const fullscreen = getUrlFlag("fullscreen") === "1";
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);
        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSession(null);
          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setInvoices(safeParseArray<Invoice>(safeLocalGet(TRIAL_INVOICES_KEY)));
          if (open === "new") setTimeout(() => openForm(null, fullscreen), 100);
          return;
        }
      } catch {
        // ignore
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
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

    const profile = profileData as Profile | null;
    const finalTheme = normalizeThemeKey(profile?.theme || currentTheme);

    setThemeKey(finalTheme);
    saveThemeKey(finalTheme);
    applyThemeEverywhere(finalTheme);

    await loadAll(userId);

    if (open === "new") setTimeout(() => openForm(null, fullscreen), 100);
  }

  async function loadAll(userId: string) {
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

    setCustomers((customerData || []) as Customer[]);
    setInvoices((invoiceData || []) as Invoice[]);
  }

  function buildDashboardUrl() {
    const q = new URLSearchParams();
    if (isTrial) q.set("mode", "trial");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));
    return `/dashboard?${q.toString()}`;
  }

  function buildPageUrl(path: string, extra?: string) {
    const q = new URLSearchParams();
    if (isTrial) q.set("mode", "trial");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));
    if (extra) new URLSearchParams(extra).forEach((v, k) => q.set(k, v));
    return `${path}?${q.toString()}`;
  }

  function goDashboard() {
    window.location.href = buildDashboardUrl();
  }

  function openForm(customer?: Customer | null, fullscreen = false) {
    setMsg("");
    setIsFullscreen(fullscreen);

    if (customer) {
      const status = customer.customer_status || customer.status || "normal";
      setEditingId(customer.id);
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        company_name: customer.company_name || "",
        company_reg_no: customer.company_reg_no || "",
        company_phone: customer.company_phone || "",
        address: customer.address || "",
        status,
        debt_amount: String(customer.debt_amount || ""),
        paid_amount: String(customer.paid_amount || ""),
        last_payment_date: customer.last_payment_date || today(),
        note: customer.note || "",
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        phone: "",
        email: "",
        company_name: "",
        company_reg_no: "",
        company_phone: "",
        address: "",
        status: "normal",
        debt_amount: "",
        paid_amount: "",
        last_payment_date: today(),
        note: "",
      });
    }

    setShowForm(true);
  }

  function closeForm() {
    if (returnTo === "dashboard") {
      window.location.href = buildDashboardUrl();
      return;
    }

    setShowForm(false);
    setIsFullscreen(false);
    setEditingId(null);

    const q = new URLSearchParams(window.location.search);
    q.delete("open");
    q.delete("fullscreen");
    q.delete("return");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));
    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  async function saveCustomer() {
    setMsg("");

    if (!form.name.trim()) {
      setMsg(t.needName);
      return;
    }

    const payload = {
      user_id: session?.user.id || "trial",
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      company_name: form.company_name.trim(),
      company_reg_no: form.company_reg_no.trim(),
      company_phone: form.company_phone.trim(),
      address: form.address.trim(),
      status: form.status,
      customer_status: form.status,
      debt_amount: Number(form.debt_amount || 0),
      paid_amount: Number(form.paid_amount || 0),
      last_payment_date: form.last_payment_date || null,
      note: form.note.trim(),
    };

    if (isTrial) {
      const record: Customer = {
        id: editingId || makeId(),
        ...payload,
      };

      const next = editingId
        ? customers.map((x) => (x.id === editingId ? record : x))
        : [record, ...customers];

      setCustomers(next);
      safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(next));
      setMsg(t.saved);
      closeForm();
      return;
    }

    if (!session) return;

    try {
      if (editingId) {
        await updateAdaptive("customers", editingId, session.user.id, payload);
      } else {
        await insertAdaptive("customers", payload);
      }

      setMsg(t.saved);
      closeForm();
      await loadAll(session.user.id);
    } catch (error: any) {
      setMsg(error?.message || String(error));
    }
  }

  async function confirmDeleteCustomer() {
    if (!deleteTarget) return;

    if (isTrial) {
      const next = customers.filter((x) => x.id !== deleteTarget.id);
      setCustomers(next);
      safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(next));
      setDeleteTarget(null);
      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setDeleteTarget(null);
    setMsg(t.deleted);
    await loadAll(session.user.id);
  }

  function sendWhatsapp(c: Customer) {
    const phone = (c.phone || c.company_phone || "").replace(/\D/g, "");
    if (!phone) {
      setMsg(t.whatsappNoPhone);
      return;
    }

    window.location.href = `https://wa.me/${phone}`;
  }

  const filteredCustomers = useMemo(() => {
    const s = search.trim().toLowerCase();

    return customers.filter((c) => {
      const status = c.customer_status || c.status || "normal";
      const statusMatch = filterStatus === "all" || status === filterStatus;

      const text = [
        c.name,
        c.phone,
        c.email,
        c.company_name,
        c.company_phone,
        c.address,
        c.note,
        statusLabel(status, t),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return statusMatch && (!s || text.includes(s));
    });
  }, [customers, search, filterStatus, t]);

  function customerInvoices(customerId: string) {
    return invoices.filter((x) => x.customer_id === customerId);
  }

  return (
    <main
      className="smartacctg-page smartacctg-customers-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{CUSTOMERS_CSS}</style>

      <div style={topbarStyle}>
        <button
          type="button"
          onClick={goDashboard}
          style={{
            ...backBtnStyle,
            borderColor: theme.border,
            color: theme.accent,
            background: theme.inputBg || "#fff",
          }}
        >
          ← {t.back}
        </button>
      </div>

      {isTrial ? <div style={trialMsgStyle}>{t.trialMode}</div> : null}

      {msg ? (
        <div style={{ ...msgStyle, background: theme.softBg || theme.card, color: theme.text }}>
          {msg}
        </div>
      ) : null}

      <section className="sa-card" style={{ ...cardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
        <div style={titleRowStyle}>
          <h1 style={{ ...titleStyle, color: theme.accent }}>{t.pageTitle}</h1>

          <button
            type="button"
            onClick={() => openForm(null, false)}
            style={{ ...plusBtnStyle, background: theme.accent }}
          >
            +
          </button>
        </div>

        <div style={filterGridStyle}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            style={themedInputStyle}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | CustomerStatus)}
            style={themedInputStyle}
          >
            <option value="all">{t.all}</option>
            <option value="normal">{t.normal}</option>
            <option value="vip">{t.vip}</option>
            <option value="debt">{t.debt}</option>
            <option value="blocked">{t.blocked}</option>
          </select>
        </div>
      </section>

      <section className="sa-card" style={{ ...cardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
        {filteredCustomers.length === 0 ? (
          <p style={{ color: themeSubText }}>{t.noCustomers}</p>
        ) : (
          <div style={listStyle}>
            {filteredCustomers.map((c) => {
              const status = c.customer_status || c.status || "normal";
              const balance = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);
              const invs = customerInvoices(c.id);

              return (
                <div
                  key={c.id}
                  style={{
                    ...itemCardStyle,
                    background: balance > 0 ? "#fee2e2" : theme.itemBg || theme.card,
                    borderColor: balance > 0 ? "#dc2626" : theme.border,
                    color: balance > 0 ? "#7f1d1d" : theme.text,
                  }}
                >
                  <div>
                    <h3 style={itemTitleStyle}>
                      {c.name || "-"}{" "}
                      <span style={badgeStyle}>{statusLabel(status, t)}</span>
                    </h3>

                    <p style={pStyle}>{t.phone}: {c.phone || "-"}</p>
                    <p style={pStyle}>{t.email}: {c.email || "-"}</p>
                    <p style={pStyle}>{t.companyName}: {c.company_name || "-"}</p>
                    <p style={pStyle}>{t.companyPhone}: {c.company_phone || "-"}</p>
                    <p style={pStyle}>{t.address}: {c.address || "-"}</p>

                    <p style={{ ...pStyle, color: balance > 0 ? "#dc2626" : theme.text }}>
                      {t.balance}: {formatRM(balance)}
                    </p>

                    {c.note ? <p style={pStyle}>{t.note}: {c.note}</p> : null}

                    <h3 style={{ ...itemTitleStyle, marginTop: 14 }}>{t.invoiceRecords}</h3>
                    {invs.length === 0 ? (
                      <p style={pStyle}>{t.noInvoice}</p>
                    ) : (
                      invs.slice(0, 3).map((inv) => (
                        <p key={inv.id} style={pStyle}>
                          {inv.invoice_no || inv.id} ｜ {formatRM(Number(inv.total || 0))}
                        </p>
                      ))
                    )}
                  </div>

                  <div style={actionRowStyle}>
                    <button type="button" onClick={() => openForm(c, false)} style={{ ...primaryBtnStyle, background: theme.accent }}>{t.edit}</button>
                    <button type="button" onClick={() => setDeleteTarget(c)} style={dangerBtnStyle}>{t.delete}</button>
                    <button type="button" onClick={() => sendWhatsapp(c)} style={whatsappBtnStyle}>{t.whatsapp}</button>
                    <button
                      type="button"
                      onClick={() => {
                        const extra = `open=new&fullscreen=1&return=dashboard&customer_id=${encodeURIComponent(c.id)}`;
                        window.location.href = buildPageUrl("/dashboard/invoices", extra);
                      }}
                      style={{ ...outlineBtnStyle, borderColor: theme.border, color: theme.accent, background: theme.inputBg || "#fff" }}
                    >
                      {t.invoice}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showForm ? (
        <div className={isFullscreen ? "fullscreen-overlay" : ""} style={isFullscreen ? {} : overlayStyle}>
          <section
            className={`sa-modal ${isFullscreen ? "fullscreen-modal" : ""}`}
            style={{
              ...modalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="modal-header">
              <h2 style={modalTitleStyle}>{editingId ? t.update : t.formTitle}</h2>
              <button type="button" onClick={closeForm} style={closeBtnStyle}>{t.close}</button>
            </div>

            <h3>{t.personal}</h3>

            <div style={formGridStyle}>
              <input placeholder={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={themedInputStyle} />
              <input placeholder={t.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={themedInputStyle} />
              <input placeholder={t.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={themedInputStyle} />

              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })} style={themedInputStyle}>
                <option value="normal">{t.normal}</option>
                <option value="vip">{t.vip}</option>
                <option value="debt">{t.debt}</option>
                <option value="blocked">{t.blocked}</option>
              </select>
            </div>

            <h3>{t.company}</h3>

            <div style={formGridStyle}>
              <input placeholder={t.companyName} value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} style={themedInputStyle} />
              <input placeholder={t.regNo} value={form.company_reg_no} onChange={(e) => setForm({ ...form, company_reg_no: e.target.value })} style={themedInputStyle} />
              <input placeholder={t.companyPhone} value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} style={themedInputStyle} />
              <input placeholder={t.address} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={themedInputStyle} />
            </div>

            <h3>{t.debt}</h3>

            <div style={formGridStyle}>
              <input placeholder={t.debtAmount} value={form.debt_amount} onChange={(e) => setForm({ ...form, debt_amount: e.target.value })} style={themedInputStyle} inputMode="decimal" />
              <input placeholder={t.paidAmount} value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} style={themedInputStyle} inputMode="decimal" />

              <div>
                <label style={labelStyle}>{t.lastPaymentDate}</label>
                <input type="date" value={form.last_payment_date} onChange={(e) => setForm({ ...form, last_payment_date: e.target.value })} style={themedDateInputStyle} />
              </div>

              <textarea placeholder={t.note} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={{ ...themedInputStyle, paddingTop: 12, minHeight: 110 }} />
            </div>

            <div style={modalActionRowStyle}>
              <button type="button" onClick={saveCustomer} style={{ ...primaryBtnStyle, background: theme.accent }}>
                {editingId ? t.update : t.save}
              </button>

              <button type="button" onClick={closeForm} style={{ ...outlineBtnStyle, borderColor: theme.border, color: theme.accent, background: theme.inputBg || "#fff" }}>
                {t.cancel}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTarget ? (
        <div style={overlayStyle}>
          <section style={{ ...modalStyle, maxWidth: 680, background: theme.card, borderColor: theme.border, boxShadow: theme.glow, color: theme.text }}>
            <h2 style={modalTitleStyle}>{t.deletePreview}</h2>

            <div style={deleteInfoBoxStyle}>
              <p><strong>{t.name}:</strong> {deleteTarget.name || "-"}</p>
              <p><strong>{t.phone}:</strong> {deleteTarget.phone || "-"}</p>
              <p><strong>{t.companyName}:</strong> {deleteTarget.company_name || "-"}</p>
              <p><strong>{t.balance}:</strong> {formatRM(Number(deleteTarget.debt_amount || 0) - Number(deleteTarget.paid_amount || 0))}</p>
            </div>

            <p style={{ color: "#dc2626", fontWeight: 900 }}>{t.confirmDelete}</p>

            <div style={deleteConfirmRowStyle}>
              <button type="button" onClick={confirmDeleteCustomer} style={confirmDeleteBtnStyle}>{t.confirm}</button>
              <button type="button" onClick={() => setDeleteTarget(null)} style={cancelDeleteBtnStyle}>{t.cancelDelete}</button>
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
  padding: "clamp(10px, 3vw, 22px)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
};

const topbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const backBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: 999,
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
};

const cardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  marginBottom: 14,
};

const titleRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.12,
};

const plusBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  border: "none",
  color: "#fff",
  fontSize: 30,
};

const filterGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  fontSize: 16,
  outline: "none",
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  height: "var(--sa-control-h)",
  lineHeight: "var(--sa-control-h)",
  textAlign: "center",
  textAlignLast: "center" as any,
  paddingTop: 0,
  paddingBottom: 0,
  WebkitAppearance: "none" as any,
  appearance: "none" as any,
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: 16,
};

const itemCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  display: "grid",
  gap: 12,
};

const itemTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-lg)",
};

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  borderRadius: 999,
  padding: "3px 10px",
  background: "#ecfdf5",
  color: "#0f766e",
  fontSize: 14,
  marginLeft: 6,
};

const pStyle: CSSProperties = {
  margin: "7px 0 0",
  lineHeight: 1.5,
  overflowWrap: "anywhere",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const primaryBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  color: "#fff",
  padding: "0 16px",
};

const dangerBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "0 16px",
};

const whatsappBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  background: "#25D366",
  color: "#fff",
  padding: "0 16px",
};

const outlineBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 16px",
};

const trialMsgStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
};

const msgStyle: CSSProperties = {
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

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 900,
  margin: "0 auto",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-xl)",
};

const closeBtnStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: "var(--sa-fs-base)",
  padding: 8,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
};

const modalActionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
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
