"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type ThemeKey = "deepTeal" | "pink" | "blackGold" | "lightRed" | "nature" | "sky";

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
const PRODUCT_STOCK_FALLBACK_KEY = "smartacctg_product_stock_fallback";

const TXT = {
  zh: {
    title: "产品管理",
    subtitle: "管理产品、库存、成本、售价、客户专属价格，并联动发票系统与记账系统。",
    back: "返回",
    search: "搜索产品名称 / 编号",
    add: "新增产品",
    edit: "编辑产品",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    productName: "产品名称",
    productNo: "产品编号",
    price: "售价 RM",
    cost: "成本 RM",
    discount: "折扣 RM",
    stock: "库存数量",
    note: "备注",
    profit: "预计利润",
    margin: "利润率",
    latest: "最新产品记录",
    noProduct: "还没有产品",
    noRecord: "暂无记录",
    customerPrice: "客户专属价格",
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
    link3: "库存系统：发票出货后会自动扣除库存。",
    theme: "主题",
    trial: "免费试用模式",
    dbFallback: "库存已保存；你的 Supabase products 表目前没有 stock_qty 栏位，所以库存暂时用本地备用方式保存。",
  },
  en: {
    title: "Product Management",
    subtitle: "Manage products, stock, cost, selling price, customer pricing, invoices and accounting links.",
    back: "Back",
    search: "Search product name / code",
    add: "Add Product",
    edit: "Edit Product",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    productName: "Product Name",
    productNo: "Product Code",
    price: "Selling Price RM",
    cost: "Cost RM",
    discount: "Discount RM",
    stock: "Stock Quantity",
    note: "Note",
    profit: "Estimated Profit",
    margin: "Profit Margin",
    latest: "Latest Products",
    noProduct: "No products yet",
    noRecord: "No records yet",
    customerPrice: "Customer Special Price",
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
    link3: "Stock: invoice delivery will deduct stock automatically.",
    theme: "Theme",
    trial: "Free Trial Mode",
    dbFallback: "Stock saved with fallback because your Supabase products table has no stock_qty column.",
  },
  ms: {
    title: "Pengurusan Produk",
    subtitle: "Urus produk, stok, kos, harga jualan, harga khas pelanggan, invois dan akaun.",
    back: "Kembali",
    search: "Cari nama produk / kod",
    add: "Tambah Produk",
    edit: "Edit Produk",
    delete: "Padam",
    save: "Simpan",
    cancel: "Batal",
    productName: "Nama Produk",
    productNo: "Kod Produk",
    price: "Harga Jualan RM",
    cost: "Kos RM",
    discount: "Diskaun RM",
    stock: "Kuantiti Stok",
    note: "Nota",
    profit: "Anggaran Untung",
    margin: "Margin Untung",
    latest: "Rekod Produk Terkini",
    noProduct: "Belum ada produk",
    noRecord: "Belum ada rekod",
    customerPrice: "Harga Khas Pelanggan",
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
    link3: "Stok: penghantaran invois akan menolak stok automatik.",
    theme: "Tema",
    trial: "Mod Percubaan Percuma",
    dbFallback: "Stok disimpan secara fallback kerana jadual products tiada lajur stock_qty.",
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
    glow: "0 0 0 1px rgba(20,184,166,0.42), 0 0 18px rgba(45,212,191,0.55), 0 18px 42px rgba(15,118,110,0.25)",
    accent: "#0f766e",
    text: "#064e3b",
    muted: "#64748b",
    soft: "#ccfbf1",
  },
  pink: {
    name: "可愛粉色",
    pageBg: "#fff7fb",
    card: "#ffffff",
    itemCard: "#ffffff",
    itemText: "#4a044e",
    border: "#f472b6",
    glow: "0 0 0 1px rgba(244,114,182,0.36), 0 0 18px rgba(244,114,182,0.45), 0 18px 38px rgba(244,114,182,0.22)",
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
    glow: "0 0 0 1px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.45), 0 18px 42px rgba(250,204,21,0.22)",
    accent: "#d4af37",
    text: "#fff7ed",
    muted: "#fef3c7",
    soft: "#2a2112",
  },
  lightRed: {
    name: "可愛淺紅",
    pageBg: "#fff1f2",
    card: "#ffffff",
    itemCard: "#ffffff",
    itemText: "#881337",
    border: "#fb7185",
    glow: "0 0 0 1px rgba(251,113,133,0.45), 0 0 20px rgba(251,113,133,0.5), 0 18px 38px rgba(251,113,133,0.26)",
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
    glow: "0 0 0 1px rgba(34,211,238,0.42), 0 0 18px rgba(34,211,238,0.42), 0 18px 38px rgba(34,211,238,0.22)",
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
    glow: "0 0 0 1px rgba(56,189,248,0.42), 0 0 18px rgba(56,189,248,0.48), 0 18px 38px rgba(56,189,248,0.24)",
    accent: "#0284c7",
    text: "#0f172a",
    muted: "#64748b",
    soft: "#dbeafe",
  },
};

export default function ProductsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);

  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
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
    const savedLang = localStorage.getItem(LANG_KEY) as Lang | null;
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeKey | null;

    if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") {
      setLang(urlLang);
      localStorage.setItem(LANG_KEY, urlLang);
    } else if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") {
      setLang(savedLang);
    }

    if (savedTheme && THEMES[savedTheme]) {
      setThemeKey(savedTheme);
    }

    init();
  }, []);

  function readStockFallback(): Record<string, number> {
    try {
      const raw = localStorage.getItem(PRODUCT_STOCK_FALLBACK_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeStockFallback(map: Record<string, number>) {
    localStorage.setItem(PRODUCT_STOCK_FALLBACK_KEY, JSON.stringify(map));
  }

  function setStockFallback(productId: string, stock: number) {
    const map = readStockFallback();
    map[productId] = Number(stock || 0);
    writeStockFallback(map);
  }

  function removeStockFallback(productId: string) {
    const map = readStockFallback();
    delete map[productId];
    writeStockFallback(map);
  }

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
    const stockMap = readStockFallback();

    return {
      ...row,
      price: Number(row?.price || 0),
      cost: Number(row?.cost || 0),
      discount: Number(row?.discount || 0),
      stock_qty: Number(row?.stock_qty ?? stockMap[row?.id] ?? 0),
      note: row?.note || "",
    } as Product;
  }

  async function init() {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = localStorage.getItem(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);

        const savedProducts = localStorage.getItem(TRIAL_PRODUCTS_KEY);
        const savedCustomers = localStorage.getItem(TRIAL_CUSTOMERS_KEY);
        const savedCustomerPrices = localStorage.getItem(TRIAL_CUSTOMER_PRICES_KEY);

        const productRows = savedProducts ? JSON.parse(savedProducts) : [];

        setProducts(productRows.map((p: any) => normalizeProduct(p)));
        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setCustomerPrices(savedCustomerPrices ? JSON.parse(savedCustomerPrices) : []);
        return;
      }

      localStorage.removeItem(TRIAL_KEY);
      localStorage.removeItem(TRIAL_PRODUCTS_KEY);
      localStorage.removeItem(TRIAL_CUSTOMERS_KEY);
      localStorage.removeItem(TRIAL_CUSTOMER_PRICES_KEY);
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
      localStorage.setItem(THEME_KEY, profile.theme);
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
    localStorage.setItem(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
    localStorage.setItem(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
    localStorage.setItem(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(nextCustomerPrices));
  }

  function switchLang(next: Lang) {
    setLang(next);
    localStorage.setItem(LANG_KEY, next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  async function switchTheme(next: ThemeKey) {
    setThemeKey(next);
    localStorage.setItem(THEME_KEY, next);

    if (!isTrial && session) {
      await supabase
        .from("profiles")
        .update({ theme: next })
        .eq("id", session.user.id);
    }
  }

  function goBack() {
    window.location.href = isTrial
      ? `/dashboard?mode=trial&lang=${lang}`
      : `/dashboard?lang=${lang}`;
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
        setStockFallback(editingId, stockValue);
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
        setStockFallback(id, stockValue);
        syncTrialData(next, customers, customerPrices);
      }

      setMsg(t.saveSuccess);
      resetForm();
      return;
    }

    if (!session) return;

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(payloadWithStock)
        .eq("id", editingId)
        .eq("user_id", session.user.id);

      if (error) {
        if (isStockColumnError(error)) {
          const retry = await supabase
            .from("products")
            .update(payloadNoStock)
            .eq("id", editingId)
            .eq("user_id", session.user.id);

          if (retry.error) {
            setMsg(retry.error.message);
            return;
          }

          setStockFallback(editingId, stockValue);
          await loadProducts(session.user.id);
          setMsg(`${t.saveSuccess}｜${t.dbFallback}`);
          resetForm();
          return;
        }

        setMsg(error.message);
        return;
      }

      setStockFallback(editingId, stockValue);
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({
          user_id: session.user.id,
          ...payloadWithStock,
        })
        .select("*")
        .single();

      if (error) {
        if (isStockColumnError(error)) {
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

          if (retry.data?.id) {
            setStockFallback(retry.data.id, stockValue);
          }

          await loadProducts(session.user.id);
          setMsg(`${t.saveSuccess}｜${t.dbFallback}`);
          resetForm();
          return;
        }

        setMsg(error.message);
        return;
      }

      if (data?.id) {
        setStockFallback(data.id, stockValue);
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
      removeStockFallback(p.id);
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

    removeStockFallback(p.id);
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
      const { error } = await supabase
        .from("customer_prices")
        .insert({
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

  return (
    <main style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}>
      <section
        style={{
          ...headerCardStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div style={topRowStyle}>
          <button
            onClick={goBack}
            style={{ ...backBtnStyle, borderColor: theme.border, color: theme.accent }}
          >
            ← {t.back}
          </button>

          <div style={langRowStyle}>
            <button onClick={() => switchLang("zh")} style={langBtn(lang === "zh", theme)}>
              中文
            </button>
            <button onClick={() => switchLang("en")} style={langBtn(lang === "en", theme)}>
              EN
            </button>
            <button onClick={() => switchLang("ms")} style={langBtn(lang === "ms", theme)}>
              BM
            </button>
          </div>
        </div>

        <div style={titleRowStyle}>
          <div>
            <h1 style={titleStyle}>{t.title}</h1>
            <p style={{ ...subTitleStyle, color: theme.muted }}>{t.subtitle}</p>
            {isTrial ? <div style={trialBadgeStyle}>{t.trial}</div> : null}
          </div>

          <button onClick={openAddForm} style={{ ...plusBtnStyle, background: theme.accent }}>
            +
          </button>
        </div>

        <div style={themeRowStyle}>
          <span style={{ fontWeight: 800 }}>{t.theme}：</span>
          {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
            <button
              key={key}
              onClick={() => switchTheme(key)}
              style={{
                ...themeSmallBtnStyle,
                borderColor: THEMES[key].border,
                background: themeKey === key ? THEMES[key].accent : "#fff",
                color: themeKey === key ? "#fff" : THEMES[key].accent,
              }}
            >
              {THEMES[key].name}
            </button>
          ))}
        </div>
      </section>

      <section style={summaryGridStyle}>
        <div style={{ ...summaryCardStyle, borderColor: theme.border, boxShadow: theme.glow }}>
          <span>{t.stock}</span>
          <strong>{productSummary.totalStock}</strong>
        </div>

        <div style={{ ...summaryCardStyle, borderColor: theme.border, boxShadow: theme.glow }}>
          <span>{t.cost}</span>
          <strong>RM {productSummary.totalCost.toFixed(2)}</strong>
        </div>

        <div style={{ ...summaryCardStyle, borderColor: theme.border, boxShadow: theme.glow }}>
          <span>{t.price}</span>
          <strong>RM {productSummary.totalValue.toFixed(2)}</strong>
        </div>

        <div style={{ ...summaryCardStyle, borderColor: theme.border, boxShadow: theme.glow }}>
          <span>{t.profit}</span>
          <strong>RM {productSummary.totalProfit.toFixed(2)}</strong>
        </div>
      </section>

      <section
        style={{
          ...contentCardStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div style={searchRowStyle}>
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

        <h2>{t.latest}</h2>

        {filteredProducts.length === 0 ? (
          <p>{t.noProduct}</p>
        ) : (
          <div style={productListStyle}>
            {filteredProducts.map((p) => {
              const profit =
                Number(p.price || 0) -
                Number(p.cost || 0) -
                Number(p.discount || 0);

              const margin =
                Number(p.price || 0) > 0 ? (profit / Number(p.price || 0)) * 100 : 0;

              const stockStatus = getStockStatus(p);

              return (
                <div
                  key={p.id}
                  style={{
                    ...productCardStyle,
                    background: theme.itemCard,
                    color: theme.itemText,
                    borderColor: theme.border,
                    boxShadow: themeKey === "blackGold" ? theme.glow : "0 8px 24px rgba(15,23,42,0.08)",
                  }}
                >
                  <div>
                    <div style={productTitleRowStyle}>
                      <strong style={productNameStyle}>{p.name}</strong>
                      <span style={{ ...stockBadgeStyle, background: stockStatus.color }}>
                        {stockStatus.label}
                      </span>
                    </div>

                    <div style={mutedStyle}>{t.productNo}: {productCode(p)}</div>

                    <div style={productInfoGridStyle}>
                      <div>{t.price}: <strong>RM {Number(p.price || 0).toFixed(2)}</strong></div>
                      <div>{t.cost}: <strong>RM {Number(p.cost || 0).toFixed(2)}</strong></div>
                      <div>{t.discount}: <strong>RM {Number(p.discount || 0).toFixed(2)}</strong></div>
                      <div>{t.stock}: <strong>{Number(p.stock_qty || 0)}</strong></div>
                      <div>{t.profit}: <strong>RM {profit.toFixed(2)}</strong></div>
                      <div>{t.margin}: <strong>{margin.toFixed(1)}%</strong></div>
                    </div>

                    {p.note ? <div style={noteStyle}>{p.note}</div> : null}
                  </div>

                  <div style={actionRowStyle}>
                    <button
                      onClick={() => openEditForm(p)}
                      style={{ ...editBtnStyle, borderColor: theme.border, color: theme.accent }}
                    >
                      {t.edit}
                    </button>

                    <button onClick={() => deleteProduct(p)} style={deleteBtnStyle}>
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
        style={{
          ...contentCardStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <h2>{t.customerPrice}</h2>

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

            <button onClick={saveCustomerPrice} style={{ ...addBtnStyle, background: theme.accent }}>
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
        style={{
          ...contentCardStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <h2>{t.linkedTitle}</h2>
        <p>{t.link1}</p>
        <p>{t.link2}</p>
        <p>{t.link3}</p>
      </section>

      {showForm && (
        <div style={overlayStyle}>
          <div
            style={{
              ...modalStyle,
              borderColor: theme.border,
              boxShadow: theme.glow,
            }}
          >
            <h2>{editingId ? t.edit : t.add}</h2>

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

            <div style={modalActionRowStyle}>
              <button onClick={saveProduct} style={{ ...addBtnStyle, background: theme.accent }}>
                {t.save}
              </button>
              <button onClick={resetForm} style={cancelBtnStyle}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 16,
  fontFamily: "sans-serif",
};

const headerCardStyle: CSSProperties = {
  border: "3px solid",
  borderRadius: 24,
  padding: 18,
  marginBottom: 16,
};

const topRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
};

const titleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 30,
  fontWeight: 900,
};

const subTitleStyle: CSSProperties = {
  marginTop: 8,
  lineHeight: 1.5,
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 900,
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const langBtn = (active: boolean, theme: any): CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: `2px solid ${theme.accent}`,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
  fontWeight: 900,
});

const plusBtnStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "999px",
  border: "none",
  color: "#fff",
  fontSize: 28,
  fontWeight: 900,
};

const themeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
  marginTop: 16,
};

const themeSmallBtnStyle: CSSProperties = {
  border: "2px solid",
  borderRadius: 999,
  padding: "8px 10px",
  fontWeight: 800,
};

const trialBadgeStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 8,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontWeight: 800,
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const summaryCardStyle: CSSProperties = {
  background: "#fff",
  color: "#111827",
  border: "2px solid",
  borderRadius: 18,
  padding: 14,
  display: "grid",
  gap: 8,
};

const contentCardStyle: CSSProperties = {
  border: "3px solid",
  borderRadius: 24,
  padding: 18,
  marginBottom: 16,
};

const searchRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 10,
  alignItems: "center",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 16,
  outline: "none",
  background: "#ffffff",
  color: "#111827",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 90,
  resize: "vertical",
};

const addBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  borderRadius: 12,
  padding: "13px 16px",
  fontWeight: 900,
};

const msgBoxStyle: CSSProperties = {
  marginTop: 12,
  background: "#fef3c7",
  color: "#92400e",
  padding: "10px 12px",
  borderRadius: 12,
  fontWeight: 800,
};

const productListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const productCardStyle: CSSProperties = {
  border: "2px solid",
  borderRadius: 18,
  padding: 14,
  display: "grid",
  gap: 12,
};

const productTitleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
};

const productNameStyle: CSSProperties = {
  fontSize: 18,
};

const mutedStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  marginTop: 4,
};

const productInfoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
  marginTop: 10,
};

const stockBadgeStyle: CSSProperties = {
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const noteStyle: CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "#f8fafc",
  color: "#475569",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
};

const editBtnStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 900,
};

const deleteBtnStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 900,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const customerPriceItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "12px 0",
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
  maxWidth: 520,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  color: "#111827",
  border: "3px solid",
  borderRadius: 22,
  padding: 20,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: 800,
  marginTop: 12,
  marginBottom: 6,
};

const modalActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 16,
};

const cancelBtnStyle: CSSProperties = {
  background: "#fff",
  color: "#0f172a",
  border: "2px solid #cbd5e1",
  borderRadius: 12,
  padding: "13px 16px",
  fontWeight: 900,
};
