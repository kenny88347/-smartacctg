"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  THEMES,
  type ThemeKey,
  applyThemeToDocument,
  getThemeKeyFromUrlOrLocalStorage,
  isThemeKey,
  normalizeThemeKey,
  saveThemeKey,
} from "@/lib/smartacctgTheme";

type Lang = "zh" | "en" | "ms";

type Product = {
  id: string;
  user_id?: string;
  name: string;
  price?: number | null;
  cost?: number | null;
  stock_qty?: number | null;
  stock?: number | null;
  stock_quantity?: number | null;
  quantity?: number | null;
  qty?: number | null;
  category_name?: string | null;
  category?: string | null;
  note?: string | null;
  created_at?: string | null;
};

type Profile = {
  id?: string;
  theme?: string | null;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const LANG_KEY = "smartacctg_lang";

const today = () => new Date().toISOString().slice(0, 10);

const TXT = {
  zh: {
    title: "产品管理",
    back: "返回控制台",
    add: "新增产品",
    edit: "编辑",
    delete: "删除",
    save: "保存产品",
    update: "保存修改",
    cancel: "取消",
    close: "关闭",
    searchTitle: "快速搜索产品",
    search: "搜索产品名称 / 分类 / 备注 / 价格 / 库存",
    productTotal: "产品总数",
    stockTotal: "库存总量",
    stockCost: "库存成本",
    expectedSales: "预计销售额",
    expectedProfit: "预计利润",
    productName: "产品名称",
    price: "售价 RM",
    cost: "成本 RM",
    stock: "库存数量",
    category: "分类 / 标签",
    note: "备注",
    noProduct: "还没有产品资料",
    saved: "保存成功",
    deleted: "删除成功",
    confirmDelete: "确定要删除这个产品吗？",
    needName: "请填写产品名称",
    trialMode: "免费试用模式：资料只会暂存在本机",
    lowStock: "库存不足 / 已无库存",
    costHigher: "成本高过售价，请检查",
    profit: "预计利润",
    related: "关联功能",
    records: "记账系统",
    customers: "客户管理",
    invoices: "发票系统",
    goFeature: "前往",
  },
  en: {
    title: "Product Management",
    back: "Back to Dashboard",
    add: "Add Product",
    edit: "Edit",
    delete: "Delete",
    save: "Save Product",
    update: "Save Changes",
    cancel: "Cancel",
    close: "Close",
    searchTitle: "Quick Search Products",
    search: "Search product name / category / note / price / stock",
    productTotal: "Total Products",
    stockTotal: "Total Stock",
    stockCost: "Stock Cost",
    expectedSales: "Expected Sales",
    expectedProfit: "Expected Profit",
    productName: "Product Name",
    price: "Selling Price RM",
    cost: "Cost RM",
    stock: "Stock Quantity",
    category: "Category / Tag",
    note: "Note",
    noProduct: "No products yet",
    saved: "Saved",
    deleted: "Deleted",
    confirmDelete: "Delete this product?",
    needName: "Please enter product name",
    trialMode: "Free trial mode: data is stored locally only",
    lowStock: "Low / No Stock",
    costHigher: "Cost is higher than selling price. Please check.",
    profit: "Expected Profit",
    related: "Linked Features",
    records: "Accounting",
    customers: "Customers",
    invoices: "Invoices",
    goFeature: "Go",
  },
  ms: {
    title: "Pengurusan Produk",
    back: "Kembali ke Dashboard",
    add: "Tambah Produk",
    edit: "Edit",
    delete: "Padam",
    save: "Simpan Produk",
    update: "Simpan Perubahan",
    cancel: "Batal",
    close: "Tutup",
    searchTitle: "Carian Pantas Produk",
    search: "Cari nama produk / kategori / nota / harga / stok",
    productTotal: "Jumlah Produk",
    stockTotal: "Jumlah Stok",
    stockCost: "Kos Stok",
    expectedSales: "Anggaran Jualan",
    expectedProfit: "Anggaran Untung",
    productName: "Nama Produk",
    price: "Harga Jualan RM",
    cost: "Kos RM",
    stock: "Jumlah Stok",
    category: "Kategori / Tag",
    note: "Catatan",
    noProduct: "Tiada produk lagi",
    saved: "Disimpan",
    deleted: "Dipadam",
    confirmDelete: "Padam produk ini?",
    needName: "Sila isi nama produk",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
    lowStock: "Stok Rendah / Tiada Stok",
    costHigher: "Kos lebih tinggi daripada harga jualan. Sila semak.",
    profit: "Anggaran Untung",
    related: "Fungsi Berkaitan",
    records: "Sistem Akaun",
    customers: "Pelanggan",
    invoices: "Invois",
    goFeature: "Pergi",
  },
};

const PRODUCTS_PAGE_FIX_CSS = `
  .smartacctg-products-page .sa-back-btn {
    border-radius: 999px !important;
  }

  .smartacctg-products-page .products-summary-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .smartacctg-products-page .products-stat-card {
    display: grid !important;
    gap: 8px !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 112px !important;
    border-radius: var(--sa-radius-card) !important;
    padding: var(--sa-card-pad) !important;
  }

  .smartacctg-products-page .products-stat-card span,
  .smartacctg-products-page .products-stat-card strong {
    width: 100% !important;
    display: block !important;
    text-align: center !important;
    font-weight: 900 !important;
    line-height: 1.2 !important;
  }

  .smartacctg-products-page .products-stat-card span {
    font-size: clamp(15px, 3.2vw, 20px) !important;
  }

  .smartacctg-products-page .products-stat-card strong {
    font-size: clamp(19px, 4vw, 27px) !important;
  }

  .smartacctg-products-page .products-list {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 18px !important;
    width: 100% !important;
  }

  .smartacctg-products-page .product-card {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: auto !important;
    text-align: left !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-products-page .product-card * {
    text-align: left !important;
  }

  .smartacctg-products-page .product-card h3 {
    margin: 0 0 10px 0 !important;
    font-size: var(--sa-fs-xl) !important;
    line-height: 1.25 !important;
    font-weight: 900 !important;
  }

  .smartacctg-products-page .product-card p {
    margin: 8px 0 0 !important;
    line-height: 1.55 !important;
    overflow-wrap: anywhere !important;
  }

  .smartacctg-products-page .product-card.low-stock-product {
    background: #fee2e2 !important;
    color: #7f1d1d !important;
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.35),
      0 12px 28px rgba(220, 38, 38, 0.22) !important;
  }

  .smartacctg-products-page .product-card.low-stock-product * {
    color: inherit;
  }

  .smartacctg-products-page .products-action-row {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    flex-wrap: wrap !important;
    width: 100% !important;
    margin-top: 6px !important;
  }

  .smartacctg-products-page .products-action-row button {
    width: auto !important;
    min-width: 110px !important;
    flex: 0 1 auto !important;
    white-space: nowrap !important;
  }

  .smartacctg-products-page .products-form-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    background: rgba(15, 23, 42, 0.55) !important;
    padding: clamp(12px, 3vw, 24px) !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .smartacctg-products-page .products-form-modal {
    width: 100% !important;
    max-width: 900px !important;
    margin: 0 auto !important;
    border-radius: var(--sa-radius-card) !important;
    border: var(--sa-border-w) solid !important;
    padding: var(--sa-card-pad) !important;
  }

  .smartacctg-products-page .products-fullscreen-overlay {
    width: 100vw !important;
    height: 100dvh !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
  }

  .smartacctg-products-page .products-fullscreen-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    min-height: 100dvh !important;
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

  .smartacctg-products-page .products-modal-header {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 12px !important;
    width: 100% !important;
    margin-bottom: 14px !important;
  }

  .smartacctg-products-page .products-fullscreen-modal .products-modal-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 5 !important;
    background: inherit !important;
    padding-bottom: 12px !important;
  }

  .smartacctg-products-page .products-form-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .smartacctg-products-page .products-form-actions {
    display: flex !important;
    gap: 10px !important;
    margin-top: 18px !important;
    flex-wrap: wrap !important;
  }

  .smartacctg-products-page .products-form-actions button {
    min-width: 130px !important;
  }

  @media (max-width: 520px) {
    .smartacctg-products-page .products-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
    }

    .smartacctg-products-page .products-stat-card {
      min-height: 104px !important;
      padding: 12px 8px !important;
    }

    .smartacctg-products-page .products-list {
      gap: 16px !important;
    }

    .smartacctg-products-page .products-action-row {
      gap: 8px !important;
    }

    .smartacctg-products-page .products-action-row button {
      min-width: 105px !important;
    }

    .smartacctg-products-page .products-form-actions {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      width: 100% !important;
    }

    .smartacctg-products-page .products-form-actions button {
      width: 100% !important;
      min-width: 0 !important;
    }
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

function getIsFullscreenFromUrl() {
  if (typeof window === "undefined") return false;

  const q = new URLSearchParams(window.location.search);
  return q.get("fullscreen") === "1";
}

function getReturnFromUrl() {
  if (typeof window === "undefined") return "";

  const q = new URLSearchParams(window.location.search);
  return q.get("return") || "";
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
  document.documentElement.style.setProperty("--sa-panel-text", theme.panelText || theme.text);
  document.documentElement.style.setProperty("--sa-muted", theme.muted || theme.subText);
  document.documentElement.style.setProperty("--sa-soft-bg", theme.softBg || theme.soft || theme.card);
  document.documentElement.style.setProperty("--sa-banner-bg", theme.banner || theme.card);
  document.documentElement.style.setProperty("--sa-glow", theme.glow);
}

function replaceUrlLangTheme(nextLang: Lang, nextTheme: ThemeKey) {
  if (typeof window === "undefined") return;

  const q = new URLSearchParams(window.location.search);

  q.set("lang", nextLang);
  q.set("theme", nextTheme);
  q.set("refresh", String(Date.now()));

  window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
}

function isSchemaCacheMissing(message: string) {
  const lower = String(message || "").toLowerCase();

  return (
    lower.includes("schema cache") ||
    lower.includes("could not find") ||
    lower.includes("column")
  );
}

function getMissingColumnName(error: any) {
  const message = String(error?.message || "");
  const match1 = message.match(/Could not find the '([^']+)' column/i);
  const match2 = message.match(/column "([^"]+)" does not exist/i);
  const match3 = message.match(/column '([^']+)' does not exist/i);

  return match1?.[1] || match2?.[1] || match3?.[1] || "";
}

const PRODUCT_OPTIONAL_KEYS = [
  "price",
  "cost",
  "stock_qty",
  "stock",
  "stock_quantity",
  "quantity",
  "qty",
  "category_name",
  "category",
  "note",
  "created_at",
];

async function insertAdaptive(table: string, inputPayload: Record<string, any>) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 35; i++) {
    const { data, error } = await supabase.from(table).insert(payload).select("*").single();

    if (!error) return data;

    lastError = error;

    if (!isSchemaCacheMissing(error.message)) throw error;

    const missing = getMissingColumnName(error);

    if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
      const next = { ...payload };
      delete next[missing];
      payload = next;
      continue;
    }

    const removable = PRODUCT_OPTIONAL_KEYS.find((key) =>
      Object.prototype.hasOwnProperty.call(payload, key)
    );

    if (!removable) throw error;

    const next = { ...payload };
    delete next[removable];
    payload = next;
  }

  throw lastError || new Error("Insert failed");
}

async function updateAdaptive(
  table: string,
  id: string,
  userId: string,
  inputPayload: Record<string, any>
) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 35; i++) {
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId);

    if (!error) return;

    lastError = error;

    if (!isSchemaCacheMissing(error.message)) throw error;

    const missing = getMissingColumnName(error);

    if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
      const next = { ...payload };
      delete next[missing];
      payload = next;
      continue;
    }

    const removable = PRODUCT_OPTIONAL_KEYS.find((key) =>
      Object.prototype.hasOwnProperty.call(payload, key)
    );

    if (!removable) throw error;

    const next = { ...payload };
    delete next[removable];
    payload = next;
  }

  throw lastError || new Error("Update failed");
}

function formatRM(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getProductStock(product: Product) {
  return Number(
    product.stock_qty ??
      product.stock ??
      product.stock_quantity ??
      product.quantity ??
      product.qty ??
      0
  );
}

function getProductCategory(product: Product) {
  return product.category_name || product.category || "";
}

export default function ProductsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [products, setProducts] = useState<Product[]>([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(getIsFullscreenFromUrl);
  const [returnTo, setReturnTo] = useState(getReturnFromUrl);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const [relatedPath, setRelatedPath] = useState("/dashboard/records");

  const [form, setForm] = useState({
    name: "",
    price: "",
    cost: "",
    stock_qty: "",
    category_name: "",
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

  const themedTextareaStyle: CSSProperties = {
    ...textareaStyle,
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

    const q = new URLSearchParams(window.location.search);
    setReturnTo(q.get("return") || "");
    setIsFullscreen(q.get("fullscreen") === "1");

    init(initialLang, initialTheme);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const openParam = q.get("open");
    const fullscreenParam = q.get("fullscreen");
    const returnParam = q.get("return");

    const shouldOpenNew = openParam === "new";
    const shouldFullscreen = fullscreenParam === "1";
    const trialRaw = safeLocalGet(TRIAL_KEY);

    setReturnTo(returnParam || "");
    setIsFullscreen(shouldFullscreen);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSession(null);

          setProducts(safeParseArray<Product>(safeLocalGet(TRIAL_PRODUCTS_KEY)));

          replaceUrlLangTheme(currentLang, currentTheme);

          if (shouldOpenNew) {
            setTimeout(() => openNewForm(shouldFullscreen), 100);
          }

          return;
        }
      } catch {
        // Bad trial data, clear below.
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_PRODUCTS_KEY);
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

    await loadProducts(userId);

    if (shouldOpenNew) {
      setTimeout(() => openNewForm(shouldFullscreen), 100);
    }
  }

  async function loadProducts(userId: string) {
    const first = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!first.error) {
      setProducts((first.data || []) as Product[]);
      return;
    }

    if (!isSchemaCacheMissing(first.error.message)) {
      setMsg(first.error.message);
      return;
    }

    const second = await supabase.from("products").select("*").eq("user_id", userId);

    if (second.error) {
      setMsg(second.error.message);
      return;
    }

    setProducts((second.data || []) as Product[]);
  }

  function saveTrialProducts(nextProducts: Product[]) {
    setProducts(nextProducts);
    safeLocalSet(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
  }

  function buildDashboardUrl() {
    const q = new URLSearchParams();

    if (isTrial) q.set("mode", "trial");

    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    return `/dashboard?${q.toString()}`;
  }

  function buildUrl(path: string, extra?: string) {
    const q = new URLSearchParams();

    if (isTrial) q.set("mode", "trial");

    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    if (extra) {
      const extraQuery = new URLSearchParams(extra);
      extraQuery.forEach((value, key) => q.set(key, value));
    }

    return `${path}?${q.toString()}`;
  }

  function go(path: string, extra?: string) {
    window.location.href = buildUrl(path, extra);
  }

  function backToDashboard() {
    window.location.href = buildDashboardUrl();
  }

  function goRelatedFeature() {
    go(relatedPath);
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);
    replaceUrlLangTheme(next, themeKey);
  }

  function resetForm() {
    setForm({
      name: "",
      price: "",
      cost: "",
      stock_qty: "",
      category_name: "",
      note: "",
    });
  }

  function openNewForm(forceFullscreen = false) {
    setEditingId(null);
    resetForm();
    setIsFullscreen(forceFullscreen);
    setShowForm(true);
    setMsg("");
  }

  function closeForm() {
    const q = new URLSearchParams(window.location.search);
    const returnParam = q.get("return") || returnTo;

    if (returnParam === "dashboard") {
      window.location.href = buildDashboardUrl();
      return;
    }

    setEditingId(null);
    setShowForm(false);
    setIsFullscreen(false);
    resetForm();

    q.delete("open");
    q.delete("fullscreen");
    q.delete("return");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      price: String(Number(product.price || 0) || ""),
      cost: String(Number(product.cost || 0) || ""),
      stock_qty: String(getProductStock(product) || ""),
      category_name: getProductCategory(product),
      note: product.note || "",
    });
    setIsFullscreen(false);
    setShowForm(true);
    setMsg("");
  }

  async function saveProduct() {
    setMsg("");

    const name = form.name.trim();

    if (!name) {
      setMsg(t.needName);
      return;
    }

    const price = Number(form.price || 0);
    const cost = Number(form.cost || 0);
    const stockQty = Number(form.stock_qty || 0);
    const categoryName = form.category_name.trim();
    const note = form.note.trim();

    if (isTrial) {
      const payload: Product = {
        id: editingId || makeId(),
        user_id: "trial",
        name,
        price,
        cost,
        stock_qty: stockQty,
        category_name: categoryName,
        note,
        created_at: editingId
          ? products.find((x) => x.id === editingId)?.created_at || new Date().toISOString()
          : new Date().toISOString(),
      };

      const next = editingId
        ? products.map((x) => (x.id === editingId ? payload : x))
        : [payload, ...products];

      saveTrialProducts(next);
      setMsg(t.saved);
      closeForm();
      return;
    }

    if (!session) return;

    const payload = {
      user_id: session.user.id,
      name,
      price,
      cost,
      stock_qty: stockQty,
      stock: stockQty,
      stock_quantity: stockQty,
      quantity: stockQty,
      category_name: categoryName,
      category: categoryName,
      note,
    };

    try {
      if (editingId) {
        await updateAdaptive("products", editingId, session.user.id, payload);
      } else {
        await insertAdaptive("products", payload);
      }

      setMsg(t.saved);
      closeForm();
      await loadProducts(session.user.id);
    } catch (error: any) {
      setMsg(error?.message || String(error));
    }
  }

  async function deleteProduct(id: string) {
    const yes = window.confirm(t.confirmDelete);
    if (!yes) return;

    if (isTrial) {
      const next = products.filter((x) => x.id !== id);
      saveTrialProducts(next);
      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.deleted);
    await loadProducts(session.user.id);
  }

  const filteredProducts = useMemo(() => {
    const s = search.trim().toLowerCase();

    if (!s) return products;

    return products.filter((product) => {
      const searchText = [
        product.name,
        product.price,
        product.cost,
        getProductStock(product),
        getProductCategory(product),
        product.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchText.includes(s);
    });
  }, [products, search]);

  const summary = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        const stock = getProductStock(product);
        const price = Number(product.price || 0);
        const cost = Number(product.cost || 0);

        acc.productTotal += 1;
        acc.stockTotal += stock;
        acc.stockCost += cost * stock;
        acc.expectedSales += price * stock;
        acc.expectedProfit += (price - cost) * stock;

        return acc;
      },
      {
        productTotal: 0,
        stockTotal: 0,
        stockCost: 0,
        expectedSales: 0,
        expectedProfit: 0,
      }
    );
  }, [products]);

  return (
    <main
      className="smartacctg-page smartacctg-products-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{PRODUCTS_PAGE_FIX_CSS}</style>

      <div className="sa-topbar" style={topbarStyle}>
        <div className="sa-topbar-left">
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

        <div className="sa-topbar-right">
          <div className="sa-lang-row" style={langRowStyle}>
            <button
              type="button"
              onClick={() => switchLang("zh")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "zh", theme)}
            >
              中文
            </button>

            <button
              type="button"
              onClick={() => switchLang("en")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "en", theme)}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() => switchLang("ms")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "ms", theme)}
            >
              BM
            </button>
          </div>
        </div>
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

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div style={headerRowStyle}>
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

        <div className="products-summary-grid" style={summaryGridStyle}>
          <div
            className="sa-stat-card products-stat-card"
            style={{
              ...statCardStyle,
              background: theme.itemBg || theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <span>{t.productTotal}</span>
            <strong style={{ color: theme.accent }}>{summary.productTotal}</strong>
          </div>

          <div
            className="sa-stat-card products-stat-card"
            style={{
              ...statCardStyle,
              background: theme.itemBg || theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <span>{t.stockTotal}</span>
            <strong style={{ color: theme.accent }}>{summary.stockTotal}</strong>
          </div>

          <div
            className="sa-stat-card products-stat-card"
            style={{
              ...statCardStyle,
              background: theme.itemBg || theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <span>{t.stockCost}</span>
            <strong style={{ color: "#dc2626" }}>{formatRM(summary.stockCost)}</strong>
          </div>

          <div
            className="sa-stat-card products-stat-card"
            style={{
              ...statCardStyle,
              background: theme.itemBg || theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <span>{t.expectedSales}</span>
            <strong style={{ color: "#16a34a" }}>{formatRM(summary.expectedSales)}</strong>
          </div>

          <div
            className="sa-stat-card products-stat-card"
            style={{
              ...statCardStyle,
              background: theme.itemBg || theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <span>{t.expectedProfit}</span>
            <strong style={{ color: summary.expectedProfit < 0 ? "#dc2626" : "#16a34a" }}>
              {formatRM(summary.expectedProfit)}
            </strong>
          </div>
        </div>
      </section>

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <h2 style={sectionTitleStyle}>{t.searchTitle}</h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          style={themedInputStyle}
        />
      </section>

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        {filteredProducts.length === 0 ? (
          <p style={{ color: themeSubText, fontWeight: 900 }}>{t.noProduct}</p>
        ) : (
          <div className="products-list" style={productListStyle}>
            {filteredProducts.map((product) => {
              const stock = getProductStock(product);
              const price = Number(product.price || 0);
              const cost = Number(product.cost || 0);
              const profit = (price - cost) * stock;
              const isLowStock = stock <= 0;
              const isCostHigher = cost > price;

              return (
                <div
                  key={product.id}
                  className={`product-card ${isLowStock ? "low-stock-product" : ""}`}
                  style={{
                    ...productCardStyle,
                    borderColor: isLowStock ? "#dc2626" : theme.border,
                    background: isLowStock ? "#fee2e2" : theme.itemBg || theme.card,
                    color: isLowStock ? "#7f1d1d" : theme.text,
                    boxShadow: isLowStock
                      ? "0 0 0 1px rgba(220, 38, 38, 0.35), 0 12px 28px rgba(220, 38, 38, 0.22)"
                      : theme.glow,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={productTitleStyle}>{product.name || "-"}</h3>

                    <p style={{ ...mutedStyle, color: isLowStock ? "#7f1d1d" : themeSubText }}>
                      {t.price}:{" "}
                      <strong style={{ color: isLowStock ? "#7f1d1d" : "#16a34a" }}>
                        {formatRM(price)}
                      </strong>
                    </p>

                    <p style={{ ...mutedStyle, color: isLowStock ? "#7f1d1d" : themeSubText }}>
                      {t.cost}:{" "}
                      <strong style={{ color: isCostHigher ? "#dc2626" : theme.accent }}>
                        {formatRM(cost)}
                      </strong>
                    </p>

                    <p style={{ ...mutedStyle, color: isLowStock ? "#7f1d1d" : themeSubText }}>
                      {t.stock}:{" "}
                      <strong style={{ color: isLowStock ? "#dc2626" : theme.accent }}>
                        {stock}
                      </strong>
                    </p>

                    <p style={{ ...mutedStyle, color: isLowStock ? "#7f1d1d" : themeSubText }}>
                      {t.profit}:{" "}
                      <strong style={{ color: profit < 0 ? "#dc2626" : "#16a34a" }}>
                        {formatRM(profit)}
                      </strong>
                    </p>

                    {getProductCategory(product) ? (
                      <p style={{ ...mutedStyle, color: isLowStock ? "#7f1d1d" : themeSubText }}>
                        {t.category}: {getProductCategory(product)}
                      </p>
                    ) : null}

                    {product.note ? (
                      <p style={{ ...mutedStyle, color: isLowStock ? "#7f1d1d" : themeSubText }}>
                        {t.note}: {product.note}
                      </p>
                    ) : null}

                    {isLowStock ? (
                      <p style={{ ...warningStyle, color: "#dc2626" }}>{t.lowStock}</p>
                    ) : null}

                    {isCostHigher ? (
                      <p style={{ ...warningStyle, color: "#dc2626" }}>{t.costHigher}</p>
                    ) : null}
                  </div>

                  <div className="products-action-row" style={actionRowStyle}>
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      style={{
                        ...actionBtnStyle,
                        background: theme.accent,
                      }}
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      style={deleteBtnStyle}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <h2 style={sectionTitleStyle}>{t.related}</h2>

        <div style={relatedMenuRowStyle}>
          <select
            value={relatedPath}
            onChange={(e) => setRelatedPath(e.target.value)}
            style={themedInputStyle}
          >
            <option value="/dashboard/records">{t.records}</option>
            <option value="/dashboard/customers">{t.customers}</option>
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
        <div
          className={`products-form-overlay ${
            isFullscreen ? "products-fullscreen-overlay" : ""
          }`}
        >
          <section
            className={`sa-modal products-form-modal ${
              isFullscreen ? "products-fullscreen-modal" : ""
            }`}
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div className="products-modal-header">
              <h2 style={modalTitleStyle}>{editingId ? t.update : t.add}</h2>

              <button
                type="button"
                className="sa-close-x"
                onClick={closeForm}
                aria-label={t.close}
              >
                {t.close}
              </button>
            </div>

            <div className="products-form-grid">
              <input
                placeholder={t.productName}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={themedInputStyle}
              />

              <input
                placeholder={t.price}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={themedInputStyle}
                inputMode="decimal"
              />

              <input
                placeholder={t.cost}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                style={themedInputStyle}
                inputMode="decimal"
              />

              <input
                placeholder={t.stock}
                value={form.stock_qty}
                onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
                style={themedInputStyle}
                inputMode="decimal"
              />

              <input
                placeholder={t.category}
                value={form.category_name}
                onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                style={themedInputStyle}
              />
            </div>

            <textarea
              placeholder={t.note}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              style={themedTextareaStyle}
            />

            <div className="products-form-actions">
              <button
                type="button"
                onClick={saveProduct}
                style={{
                  ...primaryBtnStyle,
                  background: theme.accent,
                  marginTop: 0,
                }}
              >
                {editingId ? t.update : t.save}
              </button>

              <button
                type="button"
                onClick={closeForm}
                style={{
                  ...secondaryBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  background: theme.inputBg || "#ffffff",
                  marginTop: 0,
                }}
              >
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
  padding: "clamp(10px, 3vw, 22px)",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
};

const topbarStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: "999px",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "nowrap",
};

const langBtnStyle = (active: boolean, theme: (typeof THEMES)[ThemeKey]): CSSProperties => ({
  borderColor: theme.accent,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
});

const headerRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontWeight: 900,
  lineHeight: 1.12,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
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
  flexShrink: 0,
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  width: "100%",
};

const statCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  minHeight: 112,
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
  background: "#ffffff",
  color: "#111827",
  outline: "none",
  fontSize: 16,
  marginBottom: 0,
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 120,
  paddingTop: 14,
  paddingBottom: 14,
  resize: "vertical",
  marginTop: 12,
};

const productListStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 18,
  width: "100%",
};

const productCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 14,
  width: "100%",
  minWidth: 0,
  height: "auto",
  minHeight: "auto",
  overflowWrap: "anywhere",
};

const productTitleStyle: CSSProperties = {
  margin: 0,
  overflowWrap: "anywhere",
  fontWeight: 900,
};

const mutedStyle: CSSProperties = {
  overflowWrap: "anywhere",
  lineHeight: 1.55,
  margin: "8px 0 0",
};

const warningStyle: CSSProperties = {
  margin: "10px 0 0",
  fontWeight: 900,
  lineHeight: 1.45,
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "wrap",
};

const actionBtnStyle: CSSProperties = {
  minWidth: 104,
  minHeight: 44,
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  fontWeight: 900,
};

const deleteBtnStyle: CSSProperties = {
  minWidth: 104,
  minHeight: 44,
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  fontWeight: 900,
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
  fontWeight: 900,
};

const secondaryBtnStyle: CSSProperties = {
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
};

const msgStyle: CSSProperties = {
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const trialMsgStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  marginBottom: 14,
  fontWeight: 900,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontWeight: 900,
};
