"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type ThemeKey = "deepTeal" | "pink" | "blackGold" | "lightRed" | "nature" | "sky";
type DetailMetric = "stock" | "cost" | "price" | "profit" | null;

type Product = {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  cost: number;
  discount: number | null;
  stock_qty: number | null;
  note: string | null;
  created_at?: string | null;
};

type Customer = {
  id: string;
  user_id?: string;
  name: string;
  company_name?: string | null;
  phone?: string | null;
};

type CustomerPrice = {
  id: string;
  user_id?: string;
  customer_id: string;
  product_id: string;
  custom_price: number;
};

type Profile = {
  id: string;
  theme: string | null;
};

const LANG_KEY = "smartacctg_lang";
const THEME_KEY = "smartacctg_theme";
const TRIAL_KEY = "smartacctg_trial";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_CUSTOMER_PRICES_KEY = "smartacctg_trial_customer_prices";

const PRODUCT_STOCK_MAP_KEY = "smartacctg_product_stock_map";
const PRODUCT_STOCK_FALLBACK_KEY = "smartacctg_product_stock_fallback";

const TEAL_VALUE = "#16a34a";
const BLACK_LABEL = "#111827";

const TXT = {
  zh: {
    title: "产品管理",
    subtitle: "管理产品、库存、成本、售价、客户专属价格，并联动发票系统与记账系统。",
    back: "返回控制台",
    search: "搜索产品名称 / 编号",
    add: "新增产品",
    edit: "编辑产品",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    close: "关闭",
    productName: "产品名称",
    productNo: "产品编号",
    price: "售价 RM",
    cost: "成本 RM",
    summaryPrice: "售价",
    summaryCost: "成本",
    discount: "折扣 RM",
    stock: "库存数量",
    note: "备注",
    profit: "预计利润",
    margin: "利润率",
    latest: "最新产品记录",
    details: "产品明细总览",
    allProductDetails: "全部产品资料",
    noProduct: "还没有产品",
    noRecord: "暂无记录",
    customerPrice: "客户专属价格",
    customerPurchase: "客户购买 / 专属价",
    noCustomerPurchase: "暂无客户购买 / 专属价记录",
    chooseCustomer: "选择客户",
    chooseProduct: "选择产品",
    customPrice: "这个客户的专属价格 RM",
    saveCustomerPrice: "保存客户专属价格",
    customerPriceList: "已设置的客户专属价格",
    noCustomer: "还没有客户资料，请先去客户管理新增客户。",
    confirmDelete: "确定要删除这个产品吗？",
    deleteSuccess: "产品已删除",
    deleteFail: "删除失败：这个产品可能已经被发票使用，不能直接删除。",
    saveSuccess: "保存成功",
    fillRequired: "请填写产品名称、售价和成本",
    stockLow: "库存偏低",
    stockEmpty: "无库存",
    normal: "正常",
    linkedTitle: "联动说明",
    link1: "发票系统：选择客户后会自动读取这个产品与客户专属价格。",
    link2: "记账系统：发票生成后会自动加入收入记录。",
    link3: "库存系统：发票出货后会自动扣除库存，产品管理会自动显示最新库存。",
    theme: "主题",
    trial: "免费试用模式",
  },
  en: {
    title: "Product Management",
    subtitle:
      "Manage products, stock, cost, selling price, customer pricing, invoices and accounting links.",
    back: "Dashboard",
    search: "Search product name / code",
    add: "Add Product",
    edit: "Edit Product",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    productName: "Product Name",
    productNo: "Product Code",
    price: "Selling Price RM",
    cost: "Cost RM",
    summaryPrice: "Selling Price",
    summaryCost: "Cost",
    discount: "Discount RM",
    stock: "Stock Quantity",
    note: "Note",
    profit: "Estimated Profit",
    margin: "Profit Margin",
    latest: "Latest Products",
    details: "Product Details Overview",
    allProductDetails: "All Product Details",
    noProduct: "No products yet",
    noRecord: "No records yet",
    customerPrice: "Customer Special Price",
    customerPurchase: "Customer Purchase / Special Price",
    noCustomerPurchase: "No customer purchase / special price record",
    chooseCustomer: "Choose Customer",
    chooseProduct: "Choose Product",
    customPrice: "Special Price RM",
    saveCustomerPrice: "Save Special Price",
    customerPriceList: "Saved Customer Prices",
    noCustomer: "No customers yet. Please add customers first.",
    confirmDelete: "Delete this product?",
    deleteSuccess: "Product deleted",
    deleteFail: "Delete failed: this product may already be used by invoices.",
    saveSuccess: "Saved",
    fillRequired: "Please fill product name, price and cost",
    stockLow: "Low Stock",
    stockEmpty: "Out of Stock",
    normal: "Normal",
    linkedTitle: "System Links",
    link1: "Invoice: customer selection will read product and special customer price.",
    link2: "Accounting: invoice income will be added to accounting records.",
    link3: "Stock: invoice delivery will deduct stock automatically and update product management.",
    theme: "Theme",
    trial: "Free Trial Mode",
  },
  ms: {
    title: "Pengurusan Produk",
    subtitle: "Urus produk, stok, kos, harga jualan, harga khas pelanggan, invois dan akaun.",
    back: "Dashboard",
    search: "Cari nama produk / kod",
    add: "Tambah Produk",
    edit: "Edit Produk",
    delete: "Padam",
    save: "Simpan",
    cancel: "Batal",
    close: "Tutup",
    productName: "Nama Produk",
    productNo: "Kod Produk",
    price: "Harga Jualan RM",
    cost: "Kos RM",
    summaryPrice: "Harga Jualan",
    summaryCost: "Kos",
    discount: "Diskaun RM",
    stock: "Kuantiti Stok",
    note: "Nota",
    profit: "Anggaran Untung",
    margin: "Margin Untung",
    latest: "Rekod Produk Terkini",
    details: "Ringkasan Butiran Produk",
    allProductDetails: "Semua Butiran Produk",
    noProduct: "Belum ada produk",
    noRecord: "Belum ada rekod",
    customerPrice: "Harga Khas Pelanggan",
    customerPurchase: "Pembelian Pelanggan / Harga Khas",
    noCustomerPurchase: "Tiada rekod pembelian / harga khas",
    chooseCustomer: "Pilih Pelanggan",
    chooseProduct: "Pilih Produk",
    customPrice: "Harga Khas RM",
    saveCustomerPrice: "Simpan Harga Khas",
    customerPriceList: "Harga Khas Tersimpan",
    noCustomer: "Belum ada pelanggan. Sila tambah pelanggan dahulu.",
    confirmDelete: "Padam produk ini?",
    deleteSuccess: "Produk dipadam",
    deleteFail: "Gagal padam: produk ini mungkin telah digunakan dalam invois.",
    saveSuccess: "Disimpan",
    fillRequired: "Sila isi nama produk, harga dan kos",
    stockLow: "Stok Rendah",
    stockEmpty: "Tiada Stok",
    normal: "Normal",
    linkedTitle: "Pautan Sistem",
    link1: "Invois: pilihan pelanggan akan membaca produk dan harga khas.",
    link2: "Akaun: pendapatan invois akan masuk ke rekod akaun.",
    link3: "Stok: invois akan menolak stok automatik dan mengemas kini produk.",
    theme: "Tema",
    trial: "Mod Percubaan Percuma",
  },
};

const THEMES: Record<ThemeKey, any> = {
  deepTeal: {
    name: "深青色",
    pageBg: "#ecfdf5",
    card: "#ffffff",
    itemCard: "#ffffff",
    itemText: "#064e3b",
    border: "#14b8a6",
    glow:
      "0 0 0 1px rgba(20,184,166,0.42), 0 0 18px rgba(45,212,191,0.55), 0 18px 42px rgba(15,118,110,0.25)",
    accent: "#0f766e",
    text: "#064e3b",
    muted: "#64748b",
    soft: "#ccfbf1",
  },
  pink: {
    name: "可爱粉色",
    pageBg: "#fff7fb",
    card: "#ffffff",
    itemCard: "#ffffff",
    itemText: "#4a044e",
    border: "#f472b6",
    glow:
      "0 0 0 1px rgba(244,114,182,0.36), 0 0 18px rgba(244,114,182,0.45), 0 18px 38px rgba(244,114,182,0.22)",
    accent: "#db2777",
    text: "#4a044e",
    muted: "#64748b",
    soft: "#fce7f3",
  },
  blackGold: {
    name: "黑金商务",
    pageBg: "#111111",
    card: "#1f1f1f",
    itemCard: "#ffffff",
    itemText: "#111827",
    border: "#facc15",
    glow:
      "0 0 0 1px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.45), 0 18px 42px rgba(250,204,21,0.22)",
    accent: "#d4af37",
    text: "#fff7ed",
    muted: "#fef3c7",
    soft: "#2a2112",
  },
  lightRed: {
    name: "可爱浅红",
    pageBg: "#fff1f2",
    card: "#ffffff",
    itemCard: "#ffffff",
    itemText: "#881337",
    border: "#fb7185",
    glow:
      "0 0 0 1px rgba(251,113,133,0.45), 0 0 20px rgba(251,113,133,0.5), 0 18px 38px rgba(251,113,133,0.26)",
    accent: "#e11d48",
    text: "#881337",
    muted: "#64748b",
    soft: "#ffe4e6",
  },
  nature: {
    name: "风景自然系",
    pageBg: "#f0fdf4",
    card: "#ffffff",
    itemCard: "#ffffff",
    itemText: "#14532d",
    border: "#22d3ee",
    glow:
      "0 0 0 1px rgba(34,211,238,0.42), 0 0 18px rgba(34,211,238,0.42), 0 18px 38px rgba(34,211,238,0.22)",
    accent: "#0f766e",
    text: "#14532d",
    muted: "#64748b",
    soft: "#dcfce7",
  },
  sky: {
    name: "天空蓝",
    pageBg: "#eff6ff",
    card: "#ffffff",
    itemCard: "#ffffff",
    itemText: "#0f172a",
    border: "#38bdf8",
    glow:
      "0 0 0 1px rgba(56,189,248,0.42), 0 0 18px rgba(56,189,248,0.48), 0 18px 38px rgba(56,189,248,0.24)",
    accent: "#0284c7",
    text: "#0f172a",
    muted: "#64748b",
    soft: "#dbeafe",
  },
};

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

function readStockMapByKey(key: string): Record<string, number> {
  try {
    const raw = safeLocalGet(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getStockMap(): Record<string, number> {
  return {
    ...readStockMapByKey(PRODUCT_STOCK_FALLBACK_KEY),
    ...readStockMapByKey(PRODUCT_STOCK_MAP_KEY),
  };
}

function writeStockMap(map: Record<string, number>) {
  safeLocalSet(PRODUCT_STOCK_MAP_KEY, JSON.stringify(map));
  safeLocalSet(PRODUCT_STOCK_FALLBACK_KEY, JSON.stringify(map));
}

function saveStockValue(productId: string, stock: number) {
  if (!productId) return;

  const map = getStockMap();
  map[productId] = Number(stock || 0);
  writeStockMap(map);
}

function removeStockValue(productId: string) {
  const map = getStockMap();
  delete map[productId];
  writeStockMap(map);
}

export default function ProductsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);

  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);

  const [search, setSearch] = useState("");
  const [detailSearch, setDetailSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [detailMetric, setDetailMetric] = useState<DetailMetric>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCost, setProductCost] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productNote, setProductNote] = useState("");

  const [priceCustomerId, setPriceCustomerId] = useState("");
  const [priceProductId, setPriceProductId] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const [msg, setMsg] = useState("");

  const t = TXT[lang];
  const theme = THEMES[themeKey];

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    const urlLang = query.get("lang") as Lang | null;
    const savedLang = safeLocalGet(LANG_KEY) as Lang | null;

    if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") {
      setLang(urlLang);
      safeLocalSet(LANG_KEY, urlLang);
    } else if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") {
      setLang(savedLang);
    }

    const urlTheme = query.get("theme") as ThemeKey | null;
    const savedTheme = safeLocalGet(THEME_KEY) as ThemeKey | null;

    if (urlTheme && THEMES[urlTheme]) {
      setThemeKey(urlTheme);
      safeLocalSet(THEME_KEY, urlTheme);
    } else if (savedTheme && THEMES[savedTheme]) {
      setThemeKey(savedTheme);
    }

    init();
  }, []);

  useEffect(() => {
    if (!session || isTrial) return;

    const reload = () => {
      if (document.visibilityState === "visible") {
        loadProducts(session.user.id);
      }
    };

    const timer = window.setInterval(reload, 5000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === PRODUCT_STOCK_MAP_KEY || e.key === PRODUCT_STOCK_FALLBACK_KEY) {
        reload();
      }
    };

    window.addEventListener("focus", reload);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", reload);

    const channel = supabase
      .channel(`products-stock-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => reload()
      )
      .subscribe();

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", reload);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", reload);
      supabase.removeChannel(channel);
    };
  }, [session, isTrial]);

  function isStockColumnError(error: any) {
    const message = String(error?.message || "").toLowerCase();

    return (
      message.includes("stock_qty") &&
      (message.includes("schema cache") ||
        message.includes("could not find") ||
        message.includes("column"))
    );
  }

  function normalizeProduct(row: any): Product {
    const stockMap = getStockMap();
    const localStockRaw = stockMap[row?.id];
    const localStock =
      localStockRaw !== undefined && localStockRaw !== null
        ? Number(localStockRaw || 0)
        : undefined;

    const dbStockRaw = row?.stock_qty;
    const dbStock = Number(dbStockRaw || 0);

    let finalStock = dbStock;

    if (localStock !== undefined) {
      if (dbStockRaw === undefined || dbStockRaw === null) {
        finalStock = localStock;
      } else if (localStock < dbStock) {
        finalStock = localStock;
      } else if (dbStock === 0 && localStock > 0) {
        finalStock = localStock;
      }
    }

    return {
      ...row,
      id: String(row?.id || ""),
      name: String(row?.name || ""),
      price: Number(row?.price || 0),
      cost: Number(row?.cost || 0),
      discount: Number(row?.discount || 0),
      stock_qty: finalStock,
      note: row?.note || "",
    } as Product;
  }

  async function init() {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);

        const savedProducts = safeLocalGet(TRIAL_PRODUCTS_KEY);
        const savedCustomers = safeLocalGet(TRIAL_CUSTOMERS_KEY);
        const savedCustomerPrices = safeLocalGet(TRIAL_CUSTOMER_PRICES_KEY);

        const productRows = savedProducts ? JSON.parse(savedProducts) : [];

        setProducts(productRows.map((p: any) => normalizeProduct(p)));
        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setCustomerPrices(savedCustomerPrices ? JSON.parse(savedCustomerPrices) : []);
        return;
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_PRODUCTS_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
      safeLocalRemove(TRIAL_CUSTOMER_PRICES_KEY);
      window.location.href = "/zh";
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/zh";
      return;
    }

    setSession(data.session);
    setIsTrial(false);

    const userId = data.session.user.id;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, theme")
      .eq("id", userId)
      .single();

    const profile = profileData as Profile | null;

    if (profile?.theme && THEMES[profile.theme as ThemeKey]) {
      setThemeKey(profile.theme as ThemeKey);
      safeLocalSet(THEME_KEY, profile.theme);
    }

    await loadProducts(userId);
    await loadCustomers(userId);
    await loadCustomerPrices(userId);
  }

  async function loadProducts(userId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setMsg(error.message);
      return;
    }

    setProducts((data || []).map((p: any) => normalizeProduct(p)));
  }

  async function loadCustomers(userId: string) {
    const { data } = await supabase
      .from("customers")
      .select("id,user_id,name,company_name,phone")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setCustomers((data || []) as Customer[]);
  }

  async function loadCustomerPrices(userId: string) {
    const { data } = await supabase
      .from("customer_prices")
      .select("*")
      .eq("user_id", userId);

    setCustomerPrices((data || []) as CustomerPrice[]);
  }

  function syncTrialData(
    nextProducts = products,
    nextCustomers = customers,
    nextCustomerPrices = customerPrices
  ) {
    safeLocalSet(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
    safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
    safeLocalSet(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(nextCustomerPrices));
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function goBack() {
    window.location.href = isTrial
      ? `/dashboard?mode=trial&lang=${lang}&theme=${themeKey}`
      : `/dashboard?lang=${lang}&theme=${themeKey}`;
  }

  function productCode(p: Product) {
    return `P-${String(p.id).slice(0, 8).toUpperCase()}`;
  }

  function resetForm() {
    setEditingId(null);
    setProductName("");
    setProductPrice("");
    setProductCost("");
    setProductDiscount("");
    setProductStock("");
    setProductNote("");
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(p: Product) {
    setEditingId(p.id);
    setProductName(p.name || "");
    setProductPrice(String(p.price || ""));
    setProductCost(String(p.cost || ""));
    setProductDiscount(String(p.discount || ""));
    setProductStock(String(p.stock_qty || ""));
    setProductNote(p.note || "");
    setShowForm(true);
  }

  async function saveProduct() {
    setMsg("");

    if (!productName || !productPrice || !productCost) {
      setMsg(t.fillRequired);
      return;
    }

    const stockValue = Number(productStock || 0);

    const payloadWithStock = {
      name: productName.trim(),
      price: Number(productPrice || 0),
      cost: Number(productCost || 0),
      discount: Number(productDiscount || 0),
      stock_qty: stockValue,
      note: productNote.trim(),
    };

    const payloadNoStock = {
      name: productName.trim(),
      price: Number(productPrice || 0),
      cost: Number(productCost || 0),
      discount: Number(productDiscount || 0),
      note: productNote.trim(),
    };

    if (isTrial) {
      if (editingId) {
        const next = products.map((p) =>
          p.id === editingId ? { ...p, ...payloadWithStock } : p
        );

        setProducts(next);
        saveStockValue(editingId, stockValue);
        syncTrialData(next, customers, customerPrices);
      } else {
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now());

        const newProduct: Product = {
          id,
          ...payloadWithStock,
          created_at: new Date().toISOString(),
        };

        const next = [newProduct, ...products];

        setProducts(next);
        saveStockValue(id, stockValue);
        syncTrialData(next, customers, customerPrices);
      }

      setMsg(t.saveSuccess);
      resetForm();
      return;
    }

    if (!session) return;

    if (editingId) {
      const updateWithStock = await supabase
        .from("products")
        .update(payloadWithStock)
        .eq("id", editingId)
        .eq("user_id", session.user.id);

      if (updateWithStock.error) {
        if (isStockColumnError(updateWithStock.error)) {
          const retry = await supabase
            .from("products")
            .update(payloadNoStock)
            .eq("id", editingId)
            .eq("user_id", session.user.id);

          if (retry.error) {
            setMsg(retry.error.message);
            return;
          }

          saveStockValue(editingId, stockValue);
        } else {
          setMsg(updateWithStock.error.message);
          return;
        }
      } else {
        saveStockValue(editingId, stockValue);
      }
    } else {
      const insertWithStock = await supabase
        .from("products")
        .insert({
          user_id: session.user.id,
          ...payloadWithStock,
        })
        .select("*")
        .single();

      if (insertWithStock.error) {
        if (isStockColumnError(insertWithStock.error)) {
          const retry = await supabase
            .from("products")
            .insert({
              user_id: session.user.id,
              ...payloadNoStock,
            })
            .select("*")
            .single();

          if (retry.error) {
            setMsg(retry.error.message);
            return;
          }

          const savedProduct = normalizeProduct({
            ...(retry.data as any),
            stock_qty: stockValue,
          });

          saveStockValue(savedProduct.id, stockValue);
        } else {
          setMsg(insertWithStock.error.message);
          return;
        }
      } else {
        const savedProduct = normalizeProduct(insertWithStock.data);
        saveStockValue(savedProduct.id, Number(savedProduct.stock_qty || stockValue || 0));
      }
    }

    await loadProducts(session.user.id);
    setMsg(t.saveSuccess);
    resetForm();
  }

  async function deleteProduct(p: Product) {
    const ok = window.confirm(t.confirmDelete);
    if (!ok) return;

    if (isTrial) {
      const nextProducts = products.filter((x) => x.id !== p.id);
      const nextPrices = customerPrices.filter((x) => x.product_id !== p.id);

      setProducts(nextProducts);
      setCustomerPrices(nextPrices);
      removeStockValue(p.id);
      syncTrialData(nextProducts, customers, nextPrices);
      setMsg(t.deleteSuccess);
      return;
    }

    if (!session) return;

    await supabase
      .from("customer_prices")
      .delete()
      .eq("product_id", p.id)
      .eq("user_id", session.user.id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", p.id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(t.deleteFail + " " + error.message);
      return;
    }

    removeStockValue(p.id);
    await loadProducts(session.user.id);
    await loadCustomerPrices(session.user.id);
    setMsg(t.deleteSuccess);
  }

  async function saveCustomerPrice() {
    setMsg("");

    if (!priceCustomerId || !priceProductId || !customPrice) return;

    const price = Number(customPrice || 0);

    if (isTrial) {
      const existing = customerPrices.find(
        (x) => x.customer_id === priceCustomerId && x.product_id === priceProductId
      );

      let next: CustomerPrice[];

      if (existing) {
        next = customerPrices.map((x) =>
          x.id === existing.id ? { ...x, custom_price: price } : x
        );
      } else {
        next = [
          {
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()),
            customer_id: priceCustomerId,
            product_id: priceProductId,
            custom_price: price,
          },
          ...customerPrices,
        ];
      }

      setCustomerPrices(next);
      syncTrialData(products, customers, next);
      setCustomPrice("");
      setMsg(t.saveSuccess);
      return;
    }

    if (!session) return;

    const existing = customerPrices.find(
      (x) => x.customer_id === priceCustomerId && x.product_id === priceProductId
    );

    if (existing) {
      const { error } = await supabase
        .from("customer_prices")
        .update({ custom_price: price })
        .eq("id", existing.id)
        .eq("user_id", session.user.id);

      if (error) {
        setMsg(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("customer_prices").insert({
        user_id: session.user.id,
        customer_id: priceCustomerId,
        product_id: priceProductId,
        custom_price: price,
      });

      if (error) {
        setMsg(error.message);
        return;
      }
    }

    await loadCustomerPrices(session.user.id);
    setCustomPrice("");
    setMsg(t.saveSuccess);
  }

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((p) => {
      const code = productCode(p).toLowerCase();
      const name = (p.name || "").toLowerCase();

      return name.includes(keyword) || code.includes(keyword);
    });
  }, [search, products]);

  const detailFilteredProducts = useMemo(() => {
    const keyword = detailSearch.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((p) => {
      const code = productCode(p).toLowerCase();
      const name = (p.name || "").toLowerCase();
      const note = (p.note || "").toLowerCase();

      return name.includes(keyword) || code.includes(keyword) || note.includes(keyword);
    });
  }, [detailSearch, products]);

  const productSummary = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + Number(p.stock_qty || 0), 0);

    const totalCost = products.reduce(
      (s, p) => s + Number(p.cost || 0) * Number(p.stock_qty || 0),
      0
    );

    const totalValue = products.reduce(
      (s, p) => s + Number(p.price || 0) * Number(p.stock_qty || 0),
      0
    );

    return {
      totalStock,
      totalCost,
      totalValue,
      totalProfit: totalValue - totalCost,
    };
  }, [products]);

  function getStockStatus(p: Product) {
    const stock = Number(p.stock_qty || 0);

    if (stock <= 0) return { label: t.stockEmpty, color: "#dc2626" };
    if (stock <= 5) return { label: t.stockLow, color: "#f97316" };

    return { label: t.normal, color: "#16a34a" };
  }

  function getCustomerName(id: string) {
    return customers.find((c) => c.id === id)?.name || "-";
  }

  function getProductName(id: string) {
    return products.find((p) => p.id === id)?.name || "-";
  }

  function getCustomerPurchaseList(productId: string) {
    return customerPrices.filter((cp) => cp.product_id === productId);
  }

  function openDetailModal(metric: DetailMetric) {
    setDetailSearch("");
    setDetailMetric(metric);
  }

  function getDetailTitle() {
    if (detailMetric === "stock") return t.stock;
    if (detailMetric === "cost") return t.summaryCost;
    if (detailMetric === "price") return t.summaryPrice;
    if (detailMetric === "profit") return t.profit;
    return t.allProductDetails;
  }

  function renderProductDetailCard(p: Product) {
    const profit = Number(p.price || 0) - Number(p.cost || 0) - Number(p.discount || 0);
    const margin = Number(p.price || 0) > 0 ? (profit / Number(p.price || 0)) * 100 : 0;
    const purchaseList = getCustomerPurchaseList(p.id);
    const stockStatus = getStockStatus(p);

    return (
      <div
        key={p.id}
        className="sa-item-card"
        style={{
          background: theme.itemCard,
          color: theme.itemText,
          borderColor: theme.border,
          boxShadow:
            themeKey === "blackGold"
              ? theme.glow
              : "0 8px 24px rgba(15,23,42,0.08)",
        }}
      >
        <div>
          <div style={productTitleRowStyle}>
            <strong style={productNameStyle}>{p.name}</strong>
            <span style={{ ...stockBadgeStyle, background: stockStatus.color }}>
              {stockStatus.label}
            </span>
          </div>

          <div style={mutedStyle}>
            {t.productNo}: {productCode(p)}
          </div>

          <div className="products-product-info-grid" style={productInfoGridStyle}>
            <div>
              {t.productName}: <strong>{p.name}</strong>
            </div>
            <div>
              {t.stock}: <strong>{Number(p.stock_qty || 0)}</strong>
            </div>
            <div>
              {t.summaryCost}: <strong>RM {Number(p.cost || 0).toFixed(2)}</strong>
            </div>
            <div>
              {t.summaryPrice}: <strong>RM {Number(p.price || 0).toFixed(2)}</strong>
            </div>
            <div>
              {t.discount}: <strong>RM {Number(p.discount || 0).toFixed(2)}</strong>
            </div>
            <div>
              {t.profit}: <strong>RM {profit.toFixed(2)}</strong>
            </div>
            <div>
              {t.margin}: <strong>{margin.toFixed(1)}%</strong>
            </div>
          </div>

          <div style={customerPurchaseBoxStyle}>
            <strong>{t.customerPurchase}</strong>

            {purchaseList.length === 0 ? (
              <div style={mutedStyle}>{t.noCustomerPurchase}</div>
            ) : (
              <div style={purchaseListStyle}>
                {purchaseList.map((cp) => (
                  <div key={cp.id} style={purchaseItemStyle}>
                    <span>{getCustomerName(cp.customer_id)}</span>
                    <strong>RM {Number(cp.custom_price || 0).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {p.note ? <div style={noteStyle}>{p.note}</div> : null}
        </div>

        <div className="products-action-row" style={actionRowStyle}>
          <button
            onClick={() => openEditForm(p)}
            style={{
              ...editBtnStyle,
              borderColor: theme.border,
              color: theme.accent,
            }}
          >
            {t.edit}
          </button>

          <button onClick={() => deleteProduct(p)} style={deleteBtnStyle}>
            {t.delete}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      className="smartacctg-page smartacctg-products-page"
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <div className="sa-topbar">
        <div className="sa-topbar-left">
          <button
            onClick={goBack}
            className="sa-back-btn"
            style={{ ...backBtnStyle, borderColor: theme.border, color: theme.accent }}
          >
            ← {t.back}
          </button>
        </div>

        <div className="sa-topbar-center" aria-hidden="true" />

        <div className="sa-topbar-right">
          <div className="sa-lang-row">
            <button
              onClick={() => switchLang("zh")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "zh", theme)}
            >
              中文
            </button>
            <button
              onClick={() => switchLang("en")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "en", theme)}
            >
              EN
            </button>
            <button
              onClick={() => switchLang("ms")}
              className="sa-lang-btn"
              style={langBtnStyle(lang === "ms", theme)}
            >
              BM
            </button>
          </div>
        </div>
      </div>

      <section
        className="sa-card"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div style={titleRowStyle}>
          <div>
            <h1 style={titleStyle}>{t.title}</h1>
            <p style={{ ...subTitleStyle, color: theme.muted }}>{t.subtitle}</p>
            {isTrial ? <div style={trialBadgeStyle}>{t.trial}</div> : null}
          </div>

          <button
            onClick={openAddForm}
            aria-label={t.add}
            style={{ ...plusBtnStyle, background: theme.accent }}
          >
            +
          </button>
        </div>
      </section>

      <section className="products-summary-grid" style={summaryGridStyle}>
        <button
          onClick={() => openDetailModal("stock")}
          style={{ ...summaryCardStyle, borderColor: theme.border, boxShadow: theme.glow }}
        >
          <span style={summaryLabelStyle}>{t.stock}</span>
          <strong style={summaryValueStyle}>{productSummary.totalStock}</strong>
        </button>

        <button
          onClick={() => openDetailModal("cost")}
          style={{ ...summaryCardStyle, borderColor: theme.border, boxShadow: theme.glow }}
        >
          <span style={summaryLabelStyle}>{t.summaryCost}</span>
          <strong style={summaryValueStyle}>RM {productSummary.totalCost.toFixed(2)}</strong>
        </button>

        <button
          onClick={() => openDetailModal("price")}
          style={{ ...summaryCardStyle, borderColor: theme.border, boxShadow: theme.glow }}
        >
          <span style={summaryLabelStyle}>{t.summaryPrice}</span>
          <strong style={summaryValueStyle}>RM {productSummary.totalValue.toFixed(2)}</strong>
        </button>

        <button
          onClick={() => openDetailModal("profit")}
          style={{ ...summaryCardStyle, borderColor: theme.border, boxShadow: theme.glow }}
        >
          <span style={summaryLabelStyle}>{t.profit}</span>
          <strong style={summaryValueStyle}>RM {productSummary.totalProfit.toFixed(2)}</strong>
        </button>
      </section>

      <section
        className="sa-card"
        id="productDetails"
        style={{
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div className="products-search-row" style={searchRowStyle}>
          <input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <button onClick={openAddForm} style={{ ...addBtnStyle, background: theme.accent }}>
            + {t.add}
          </button>
        </div>

        {msg ? <div style={msgBoxStyle}>{msg}</div> : null}

        <h2 style={sectionTitleStyle}>{t.details}</h2>

        {filteredProducts.length === 0 ? (
          <p>{t.noProduct}</p>
        ) : (
          <div style={productListStyle}>
            {filteredProducts.map((p) => renderProductDetailCard(p))}
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
        <h2 style={sectionTitleStyle}>{t.customerPrice}</h2>

        {customers.length === 0 ? (
          <p>{t.noCustomer}</p>
        ) : (
          <>
            <div style={formGridStyle}>
              <select
                value={priceCustomerId}
                onChange={(e) => setPriceCustomerId(e.target.value)}
                style={inputStyle}
              >
                <option value="">{t.chooseCustomer}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company_name ? `｜${c.company_name}` : ""}
                  </option>
                ))}
              </select>

              <select
                value={priceProductId}
                onChange={(e) => setPriceProductId(e.target.value)}
                style={inputStyle}
              >
                <option value="">{t.chooseProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}｜{productCode(p)}
                  </option>
                ))}
              </select>

              <input
                placeholder={t.customPrice}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              onClick={saveCustomerPrice}
              style={{ ...addBtnStyle, background: theme.accent, marginTop: 12 }}
            >
              {t.saveCustomerPrice}
            </button>

            <h3>{t.customerPriceList}</h3>

            {customerPrices.length === 0 ? (
              <p>{t.noRecord}</p>
            ) : (
              customerPrices.map((cp) => (
                <div key={cp.id} style={customerPriceItemStyle}>
                  <div>
                    <strong>{getCustomerName(cp.customer_id)}</strong>
                    <div style={{ ...mutedStyle, color: theme.muted }}>
                      {getProductName(cp.product_id)}
                    </div>
                  </div>
                  <strong>RM {Number(cp.custom_price || 0).toFixed(2)}</strong>
                </div>
              ))
            )}
          </>
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
        <h2 style={sectionTitleStyle}>{t.linkedTitle}</h2>
        <p>{t.link1}</p>
        <p>{t.link2}</p>
        <p>{t.link3}</p>
      </section>

      {detailMetric ? (
        <div style={overlayStyle}>
          <div
            className="sa-modal"
            style={{
              ...detailModalStyle,
              borderColor: theme.border,
              boxShadow: theme.glow,
            }}
          >
            <div className="sa-modal-header" style={modalHeaderStyle}>
              <h2>
                {getDetailTitle()}｜{t.allProductDetails}
              </h2>

              <button
                type="button"
                onClick={() => setDetailMetric(null)}
                style={closeTextBtnStyle}
              >
                {t.close}
              </button>
            </div>

            <input
              placeholder={t.search}
              value={detailSearch}
              onChange={(e) => setDetailSearch(e.target.value)}
              style={{ ...inputStyle, marginBottom: 14 }}
            />

            {detailFilteredProducts.length === 0 ? (
              <p>{t.noProduct}</p>
            ) : (
              <div style={detailListStyle}>
                {detailFilteredProducts.map((p) => renderProductDetailCard(p))}
              </div>
            )}

            <button
              onClick={() => setDetailMetric(null)}
              style={{ ...addBtnStyle, background: theme.accent, marginTop: 14 }}
            >
              {t.close}
            </button>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <div style={overlayStyle}>
          <div
            className="sa-modal"
            style={{
              ...modalStyle,
              borderColor: theme.border,
              boxShadow: theme.glow,
            }}
          >
            <div className="sa-modal-header" style={modalHeaderStyle}>
              <h2>{editingId ? t.edit : t.add}</h2>

              <button type="button" onClick={resetForm} style={closeTextBtnStyle}>
                {t.close}
              </button>
            </div>

            <label style={labelStyle}>{t.productName}</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>{t.price}</label>
            <input
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              style={inputStyle}
              inputMode="decimal"
            />

            <label style={labelStyle}>{t.cost}</label>
            <input
              value={productCost}
              onChange={(e) => setProductCost(e.target.value)}
              style={inputStyle}
              inputMode="decimal"
            />

            <label style={labelStyle}>{t.discount}</label>
            <input
              value={productDiscount}
              onChange={(e) => setProductDiscount(e.target.value)}
              style={inputStyle}
              inputMode="decimal"
            />

            <label style={labelStyle}>{t.stock}</label>
            <input
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
              style={inputStyle}
              inputMode="numeric"
            />

            <label style={labelStyle}>{t.note}</label>
            <textarea
              value={productNote}
              onChange={(e) => setProductNote(e.target.value)}
              style={textareaStyle}
            />

            <div className="products-modal-actions" style={modalActionRowStyle}>
              <button onClick={saveProduct} style={{ ...addBtnStyle, background: theme.accent }}>
                {t.save}
              </button>

              <button onClick={resetForm} style={cancelBtnStyle}>
                {t.cancel}
              </button>
            </div>
          </div>
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
  boxSizing: "border-box",
  fontSize: "var(--sa-fs-base)",
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const langBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  borderColor: theme.accent,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
});

const titleRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "start",
  gap: 12,
  width: "100%",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  fontWeight: 900,
  lineHeight: 1.12,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "var(--sa-fs-xl)",
  marginTop: 20,
  marginBottom: 16,
  fontWeight: 900,
};

const subTitleStyle: CSSProperties = {
  marginTop: 10,
  lineHeight: 1.65,
  fontSize: "var(--sa-fs-base)",
  fontWeight: 700,
};

const plusBtnStyle: CSSProperties = {
  width: 58,
  height: 58,
  minWidth: 58,
  minHeight: 58,
  maxWidth: 58,
  borderRadius: 999,
  border: "none",
  color: "#fff",
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
  padding: 0,
};

const trialBadgeStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 8,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontWeight: 900,
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "clamp(12px, 2vw, 16px)",
  marginBottom: 16,
  width: "100%",
};

const summaryCardStyle: CSSProperties = {
  background: "#fff",
  color: BLACK_LABEL,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "clamp(14px, 3vw, 24px)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  textAlign: "center",
  cursor: "pointer",
  minHeight: 150,
  fontWeight: 900,
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minWidth: 0,
};

const summaryLabelStyle: CSSProperties = {
  color: BLACK_LABEL,
  fontWeight: 900,
  fontSize: "clamp(15px, 3.2vw, 20px)",
  lineHeight: 1.25,
};

const summaryValueStyle: CSSProperties = {
  color: TEAL_VALUE,
  fontWeight: 900,
  fontSize: "clamp(24px, 5.4vw, 42px)",
  lineHeight: 1.08,
  whiteSpace: "normal",
  wordBreak: "keep-all",
};

const searchRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid #cbd5e1",
  fontSize: "16px",
  outline: "none",
  background: "#ffffff",
  color: "#111827",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 100,
  resize: "vertical",
  paddingTop: 14,
  paddingBottom: 14,
};

const addBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  padding: "0 18px",
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
};

const msgBoxStyle: CSSProperties = {
  marginTop: 12,
  background: "#fef3c7",
  color: "#92400e",
  padding: "12px 14px",
  borderRadius: "var(--sa-radius-control)",
  fontWeight: 900,
};

const productListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const productTitleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const productNameStyle: CSSProperties = {
  fontSize: "var(--sa-fs-lg)",
  lineHeight: 1.25,
};

const mutedStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "var(--sa-fs-base)",
  marginTop: 4,
  lineHeight: 1.55,
};

const productInfoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
  marginTop: 12,
  fontSize: "var(--sa-fs-base)",
};

const stockBadgeStyle: CSSProperties = {
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: "var(--sa-fs-sm)",
  fontWeight: 900,
};

const customerPurchaseBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: "var(--sa-radius-control)",
  background: "#f8fafc",
  color: "#111827",
};

const purchaseListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 8,
};

const purchaseItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "10px 0",
  borderBottom: "1px solid #e5e7eb",
};

const noteStyle: CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: "var(--sa-radius-control)",
  background: "#f8fafc",
  color: "#475569",
  lineHeight: 1.55,
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
  flexWrap: "wrap",
};

const editBtnStyle: CSSProperties = {
  background: "#fff",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  minHeight: 46,
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
};

const deleteBtnStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  minHeight: 46,
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const customerPriceItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  zIndex: 999,
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 560,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  color: "#111827",
  border: "var(--sa-border-w) solid",
};

const detailModalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 920,
  maxHeight: "88vh",
  overflowY: "auto",
  background: "#fff",
  color: "#111827",
  border: "var(--sa-border-w) solid",
};

const modalHeaderStyle: CSSProperties = {
  marginBottom: 16,
};

const closeTextBtnStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#dc2626",
  border: "2px solid #fecaca",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  minHeight: 44,
  width: "auto",
  height: "auto",
  minWidth: 0,
  maxWidth: "none",
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const detailListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: 900,
  marginTop: 12,
  marginBottom: 6,
  fontSize: "var(--sa-fs-base)",
};

const modalActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 16,
  flexWrap: "wrap",
};

const cancelBtnStyle: CSSProperties = {
  background: "#fff",
  color: "#0f172a",
  border: "2px solid #cbd5e1",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 16px",
  minHeight: "var(--sa-control-h)",
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
};
