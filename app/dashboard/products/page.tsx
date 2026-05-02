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

type Product = {
  id: string;
  user_id?: string;
  name: string;
  price?: number | null;
  cost?: number | null;
  discount?: number | null;
  stock_qty?: number | null;
  image_url?: string | null;
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

const TXT = {
  zh: {
    title: "产品管理",
    back: "返回控制台",
    add: "新增产品",
    edit: "编辑",
    delete: "删除",
    confirm: "确定",
    cancelDelete: "取消",
    deletePreview: "删除前确认资料",
    confirmDelete: "确定要删除这个产品吗？",
    save: "保存产品",
    update: "保存修改",
    cancel: "取消",
    close: "关闭",
    search: "搜索产品名称 / 备注 / 价格",
    noProduct: "还没有产品资料",
    name: "产品名称",
    price: "售价 RM",
    cost: "成本 RM",
    discount: "折扣 RM",
    stock: "库存数量",
    imageUrl: "产品图片 URL",
    note: "备注",
    totalCost: "总成本",
    totalSelling: "总售价",
    expectedProfit: "预计利润",
    stockQty: "库存数量",
    saved: "保存成功",
    deleted: "删除成功",
    trialMode: "免费试用模式：资料只会暂存在本机",
    needName: "请填写产品名称",
  },
  en: {
    title: "Product Management",
    back: "Back to Dashboard",
    add: "Add Product",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    cancelDelete: "Cancel",
    deletePreview: "Delete Confirmation",
    confirmDelete: "Confirm delete this product?",
    save: "Save Product",
    update: "Save Changes",
    cancel: "Cancel",
    close: "Close",
    search: "Search product name / note / price",
    noProduct: "No product records yet",
    name: "Product Name",
    price: "Selling Price RM",
    cost: "Cost RM",
    discount: "Discount RM",
    stock: "Stock Quantity",
    imageUrl: "Product Image URL",
    note: "Note",
    totalCost: "Total Cost",
    totalSelling: "Total Selling Price",
    expectedProfit: "Expected Profit",
    stockQty: "Stock Quantity",
    saved: "Saved",
    deleted: "Deleted",
    trialMode: "Free trial mode: data is stored locally only",
    needName: "Please enter product name",
  },
  ms: {
    title: "Pengurusan Produk",
    back: "Kembali ke Dashboard",
    add: "Tambah Produk",
    edit: "Edit",
    delete: "Padam",
    confirm: "Sahkan",
    cancelDelete: "Batal",
    deletePreview: "Sahkan Padam",
    confirmDelete: "Padam produk ini?",
    save: "Simpan Produk",
    update: "Simpan Perubahan",
    cancel: "Batal",
    close: "Tutup",
    search: "Cari nama produk / catatan / harga",
    noProduct: "Tiada rekod produk",
    name: "Nama Produk",
    price: "Harga Jualan RM",
    cost: "Kos RM",
    discount: "Diskaun RM",
    stock: "Jumlah Stok",
    imageUrl: "URL Gambar Produk",
    note: "Catatan",
    totalCost: "Jumlah Kos",
    totalSelling: "Jumlah Harga Jualan",
    expectedProfit: "Anggaran Untung",
    stockQty: "Jumlah Stok",
    saved: "Disimpan",
    deleted: "Dipadam",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
    needName: "Sila isi nama produk",
  },
};

const PRODUCTS_CSS = `
  .smartacctg-products-page h1,
  .smartacctg-products-page h2,
  .smartacctg-products-page h3,
  .smartacctg-products-page button,
  .smartacctg-products-page strong {
    font-weight: 900 !important;
  }

  .smartacctg-products-page p,
  .smartacctg-products-page div,
  .smartacctg-products-page span,
  .smartacctg-products-page label,
  .smartacctg-products-page input,
  .smartacctg-products-page select,
  .smartacctg-products-page textarea {
    font-weight: 400 !important;
  }

  .smartacctg-products-page .fullscreen-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: rgba(15, 23, 42, 0.58) !important;
  }

  .smartacctg-products-page .fullscreen-modal {
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

  .smartacctg-products-page .modal-header {
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

    const optional = ["cost", "discount", "stock_qty", "stock", "quantity", "image_url", "note"].find((x) =>
      Object.prototype.hasOwnProperty.call(payload, x)
    );

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

    const optional = ["cost", "discount", "stock_qty", "stock", "quantity", "image_url", "note"].find((x) =>
      Object.prototype.hasOwnProperty.call(payload, x)
    );

    if (!optional) throw error;
    const next = { ...payload };
    delete next[optional];
    payload = next;
  }

  throw lastError || new Error("Update failed");
}

export default function ProductsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [returnTo, setReturnTo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    cost: "",
    discount: "",
    stock_qty: "",
    image_url: "",
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
          setProducts(safeParseArray<Product>(safeLocalGet(TRIAL_PRODUCTS_KEY)));
          if (open === "new") setTimeout(() => openForm(null, fullscreen), 100);
          return;
        }
      } catch {
        // ignore
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

    const profile = profileData as Profile | null;
    const finalTheme = normalizeThemeKey(profile?.theme || currentTheme);

    setThemeKey(finalTheme);
    saveThemeKey(finalTheme);
    applyThemeEverywhere(finalTheme);

    await loadProducts(userId);

    if (open === "new") setTimeout(() => openForm(null, fullscreen), 100);
  }

  async function loadProducts(userId: string) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setProducts((data || []) as Product[]);
  }

  function buildDashboardUrl() {
    const q = new URLSearchParams();
    if (isTrial) q.set("mode", "trial");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));
    return `/dashboard?${q.toString()}`;
  }

  function goDashboard() {
    window.location.href = buildDashboardUrl();
  }

  function openForm(product?: Product | null, fullscreen = false) {
    setMsg("");
    setIsFullscreen(fullscreen);

    if (product) {
      setEditingId(product.id);
      setForm({
        name: product.name || "",
        price: String(product.price || ""),
        cost: String(product.cost || ""),
        discount: String(product.discount || ""),
        stock_qty: String(product.stock_qty || ""),
        image_url: product.image_url || "",
        note: product.note || "",
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        price: "",
        cost: "",
        discount: "",
        stock_qty: "",
        image_url: "",
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

  async function saveProduct() {
    setMsg("");

    if (!form.name.trim()) {
      setMsg(t.needName);
      return;
    }

    const payload = {
      user_id: session?.user.id || "trial",
      name: form.name.trim(),
      price: Number(form.price || 0),
      cost: Number(form.cost || 0),
      discount: Number(form.discount || 0),
      stock_qty: Number(form.stock_qty || 0),
      image_url: form.image_url.trim(),
      note: form.note.trim(),
    };

    if (isTrial) {
      const record: Product = {
        id: editingId || makeId(),
        ...payload,
      };

      const next = editingId
        ? products.map((x) => (x.id === editingId ? record : x))
        : [record, ...products];

      setProducts(next);
      safeLocalSet(TRIAL_PRODUCTS_KEY, JSON.stringify(next));
      setMsg(t.saved);
      closeForm();
      return;
    }

    if (!session) return;

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

  async function confirmDeleteProduct() {
    if (!deleteTarget) return;

    if (isTrial) {
      const next = products.filter((x) => x.id !== deleteTarget.id);
      setProducts(next);
      safeLocalSet(TRIAL_PRODUCTS_KEY, JSON.stringify(next));
      setDeleteTarget(null);
      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setDeleteTarget(null);
    setMsg(t.deleted);
    await loadProducts(session.user.id);
  }

  const filteredProducts = useMemo(() => {
    const s = search.trim().toLowerCase();

    return products.filter((p) => {
      const text = [p.name, p.price, p.cost, p.stock_qty, p.note]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !s || text.includes(s);
    });
  }, [products, search]);

  const totalCost = useMemo(() => {
    return products.reduce((sum, p) => sum + Number(p.cost || 0) * Number(p.stock_qty || 0), 0);
  }, [products]);

  const totalSelling = useMemo(() => {
    return products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock_qty || 0), 0);
  }, [products]);

  const expectedProfit = totalSelling - totalCost;

  const totalStock = useMemo(() => {
    return products.reduce((sum, p) => sum + Number(p.stock_qty || 0), 0);
  }, [products]);

  return (
    <main
      className="smartacctg-page smartacctg-products-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{PRODUCTS_CSS}</style>

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
          <h1 style={{ ...titleStyle, color: theme.accent }}>{t.title}</h1>

          <button
            type="button"
            onClick={() => openForm(null, false)}
            style={{ ...plusBtnStyle, background: theme.accent }}
          >
            +
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          style={{ ...themedInputStyle, marginTop: 16 }}
        />
      </section>

      <section style={statsGridStyle}>
        <div className="sa-card" style={{ ...statCardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
          <span>{t.totalCost}</span>
          <strong>{formatRM(totalCost)}</strong>
        </div>

        <div className="sa-card" style={{ ...statCardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
          <span>{t.totalSelling}</span>
          <strong style={{ color: theme.accent }}>{formatRM(totalSelling)}</strong>
        </div>

        <div className="sa-card" style={{ ...statCardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
          <span>{t.expectedProfit}</span>
          <strong style={{ color: expectedProfit < 0 ? "#dc2626" : "#16a34a" }}>
            {formatRM(expectedProfit)}
          </strong>
        </div>

        <div className="sa-card" style={{ ...statCardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
          <span>{t.stockQty}</span>
          <strong>{Number(totalStock || 0).toLocaleString("en-MY")}</strong>
        </div>
      </section>

      <section className="sa-card" style={{ ...cardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow }}>
        {filteredProducts.length === 0 ? (
          <p style={{ color: themeSubText }}>{t.noProduct}</p>
        ) : (
          <div style={listStyle}>
            {filteredProducts.map((p) => {
              const profit = Number(p.price || 0) - Number(p.cost || 0);

              return (
                <div
                  key={p.id}
                  style={{
                    ...itemCardStyle,
                    background: theme.itemBg || theme.card,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                >
                  <div style={productTopStyle}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={productImageStyle} />
                    ) : (
                      <div style={{ ...productImagePlaceholderStyle, background: theme.softBg || "#ccfbf1", color: theme.accent }}>
                        IMG
                      </div>
                    )}

                    <div style={{ minWidth: 0 }}>
                      <h3 style={itemTitleStyle}>{p.name || "-"}</h3>
                      <p style={pStyle}>{t.price}: {formatRM(Number(p.price || 0))}</p>
                      <p style={pStyle}>{t.cost}: {formatRM(Number(p.cost || 0))}</p>
                      <p style={pStyle}>{t.discount}: {formatRM(Number(p.discount || 0))}</p>
                      <p style={pStyle}>{t.stock}: {Number(p.stock_qty || 0)}</p>
                      <p style={{ ...pStyle, color: profit < 0 ? "#dc2626" : "#16a34a" }}>
                        {t.expectedProfit}: {formatRM(profit)}
                      </p>
                      {p.note ? <p style={pStyle}>{t.note}: {p.note}</p> : null}
                    </div>
                  </div>

                  <div style={actionRowStyle}>
                    <button type="button" onClick={() => openForm(p, false)} style={{ ...primaryBtnStyle, background: theme.accent }}>
                      {t.edit}
                    </button>

                    <button type="button" onClick={() => setDeleteTarget(p)} style={dangerBtnStyle}>
                      {t.delete}
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
              <h2 style={modalTitleStyle}>{editingId ? t.update : t.add}</h2>
              <button type="button" onClick={closeForm} style={closeBtnStyle}>{t.close}</button>
            </div>

            <div style={formGridStyle}>
              <input placeholder={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={themedInputStyle} />
              <input placeholder={t.price} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={themedInputStyle} inputMode="decimal" />
              <input placeholder={t.cost} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} style={themedInputStyle} inputMode="decimal" />
              <input placeholder={t.discount} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} style={themedInputStyle} inputMode="decimal" />
              <input placeholder={t.stock} value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} style={themedInputStyle} inputMode="decimal" />
              <input placeholder={t.imageUrl} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} style={themedInputStyle} />
              <textarea placeholder={t.note} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={{ ...themedInputStyle, paddingTop: 12, minHeight: 110 }} />
            </div>

            <div style={modalActionRowStyle}>
              <button type="button" onClick={saveProduct} style={{ ...primaryBtnStyle, background: theme.accent }}>
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
              <p><strong>{t.price}:</strong> {formatRM(Number(deleteTarget.price || 0))}</p>
              <p><strong>{t.cost}:</strong> {formatRM(Number(deleteTarget.cost || 0))}</p>
              <p><strong>{t.stock}:</strong> {Number(deleteTarget.stock_qty || 0)}</p>
            </div>

            <p style={{ color: "#dc2626", fontWeight: 900 }}>{t.confirmDelete}</p>

            <div style={deleteConfirmRowStyle}>
              <button type="button" onClick={confirmDeleteProduct} style={confirmDeleteBtnStyle}>{t.confirm}</button>
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

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 14,
};

const statCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  display: "grid",
  gap: 8,
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

const productTopStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "82px minmax(0, 1fr)",
  gap: 12,
  alignItems: "start",
};

const productImageStyle: CSSProperties = {
  width: 82,
  height: 82,
  borderRadius: 16,
  objectFit: "cover",
  background: "#fff",
};

const productImagePlaceholderStyle: CSSProperties = {
  width: 82,
  height: 82,
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const itemTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-lg)",
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
