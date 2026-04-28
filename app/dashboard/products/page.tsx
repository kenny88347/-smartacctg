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

const FONT_SYSTEM_CSS = `
  .smartacctg-products-page {
    --sa-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
      "Microsoft YaHei", Arial, sans-serif;

    --sa-fs-xs: clamp(13px, 2.7vw, 14px);
    --sa-fs-sm: clamp(15px, 3vw, 16px);
    --sa-fs-base: clamp(16px, 3.4vw, 18px);
    --sa-fs-md: clamp(18px, 3.8vw, 21px);
    --sa-fs-lg: clamp(22px, 4.8vw, 27px);
    --sa-fs-xl: clamp(26px, 5.8vw, 35px);
    --sa-fs-2xl: clamp(32px, 7vw, 45px);

    --sa-control-h: clamp(50px, 10vw, 60px);
    --sa-control-x: clamp(14px, 3vw, 18px);
    --sa-radius-control: clamp(14px, 3vw, 20px);
    --sa-radius-card: clamp(22px, 4vw, 34px);
    --sa-card-pad: clamp(18px, 4vw, 30px);

    font-family: var(--sa-font-family) !important;
    font-size: var(--sa-fs-base) !important;
    line-height: 1.6 !important;
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  .smartacctg-products-page,
  .smartacctg-products-page * {
    box-sizing: border-box !important;
    font-family: var(--sa-font-family) !important;
  }

  .smartacctg-products-page h1 {
    font-size: var(--sa-fs-2xl) !important;
    line-height: 1.12 !important;
    font-weight: 900 !important;
    letter-spacing: -0.03em !important;
  }

  .smartacctg-products-page h2 {
    font-size: var(--sa-fs-xl) !important;
    line-height: 1.2 !important;
    font-weight: 900 !important;
    letter-spacing: -0.02em !important;
  }

  .smartacctg-products-page h3 {
    font-size: var(--sa-fs-lg) !important;
    line-height: 1.25 !important;
    font-weight: 900 !important;
    margin-top: clamp(20px, 5vw, 30px) !important;
    margin-bottom: clamp(10px, 3vw, 16px) !important;
  }

  .smartacctg-products-page p,
  .smartacctg-products-page div,
  .smartacctg-products-page span,
  .smartacctg-products-page label,
  .smartacctg-products-page td,
  .smartacctg-products-page th {
    font-size: var(--sa-fs-base) !important;
  }

  .smartacctg-products-page strong {
    font-size: inherit !important;
    font-weight: 900 !important;
  }

  .smartacctg-products-page input,
  .smartacctg-products-page select,
  .smartacctg-products-page textarea,
  .smartacctg-products-page button {
    font-size: var(--sa-fs-base) !important;
    font-family: var(--sa-font-family) !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }

  .smartacctg-products-page input,
  .smartacctg-products-page select,
  .smartacctg-products-page textarea {
    width: 100% !important;
    min-height: var(--sa-control-h) !important;
    padding-left: var(--sa-control-x) !important;
    padding-right: var(--sa-control-x) !important;
    border-radius: var(--sa-radius-control) !important;
  }

  .smartacctg-products-page button {
    min-height: var(--sa-control-h) !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1.2 !important;
    white-space: normal !important;
  }

  .smartacctg-products-page textarea {
    resize: vertical !important;
    padding-top: 14px !important;
    padding-bottom: 14px !important;
  }

  .smartacctg-products-page img,
  .smartacctg-products-page video,
  .smartacctg-products-page iframe,
  .smartacctg-products-page canvas {
    max-width: 100% !important;
  }

  .products-topbar {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    width: 100% !important;
    margin-bottom: 16px !important;
  }

  .products-topbar-left {
    display: flex !important;
    justify-content: flex-start !important;
    min-width: 0 !important;
  }

  .products-topbar-right {
    display: flex !important;
    justify-content: flex-end !important;
    min-width: 0 !important;
  }

  .products-lang-row {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 6px !important;
    flex-wrap: nowrap !important;
  }

  .products-title-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: start !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .products-title-text {
    min-width: 0 !important;
  }

  .products-plus-btn {
    width: 58px !important;
    height: 58px !important;
    min-width: 58px !important;
    min-height: 58px !important;
    max-width: 58px !important;
    border-radius: 999px !important;
    padding: 0 !important;
    flex-shrink: 0 !important;
  }

  .products-summary-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 14px !important;
    width: 100% !important;
  }

  .products-summary-grid button {
    width: 100% !important;
    min-width: 0 !important;
  }

  .products-summary-grid button span {
    color: #111827 !important;
    font-size: clamp(15px, 3.2vw, 20px) !important;
    font-weight: 900 !important;
    line-height: 1.25 !important;
  }

  .products-summary-grid button strong {
    color: #16a34a !important;
    font-size: clamp(24px, 5.4vw, 42px) !important;
    font-weight: 900 !important;
    line-height: 1.08 !important;
    word-break: keep-all !important;
  }

  .products-product-info-grid div {
    font-size: var(--sa-fs-base) !important;
  }

  .products-modal-header {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 12px !important;
    margin-bottom: 16px !important;
  }

  .products-modal-header h2 {
    margin: 0 !important;
  }

  @media (max-width: 768px) {
    .smartacctg-products-page {
      padding: 12px !important;
    }

    .smartacctg-products-page h1 {
      font-size: var(--sa-fs-xl) !important;
    }

    .smartacctg-products-page h2 {
      font-size: var(--sa-fs-lg) !important;
    }

    .smartacctg-products-page h3 {
      font-size: var(--sa-fs-md) !important;
    }

    .smartacctg-products-page p,
    .smartacctg-products-page div,
    .smartacctg-products-page span,
    .smartacctg-products-page label,
    .smartacctg-products-page td,
    .smartacctg-products-page th {
      font-size: var(--sa-fs-base) !important;
    }

    .products-search-row {
      grid-template-columns: 1fr !important;
    }

    .products-search-row button {
      width: 100% !important;
    }

    .products-modal-actions {
      flex-direction: column !important;
    }

    .products-modal-actions button {
      width: 100% !important;
    }
  }

  @media (max-width: 430px) {
    .smartacctg-products-page {
      padding: 10px !important;
    }

    .products-topbar {
      gap: 5px !important;
    }

    .products-topbar button {
      font-size: 14px !important;
      min-height: 44px !important;
      height: 44px !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      white-space: nowrap !important;
    }

    .products-lang-row {
      gap: 4px !important;
    }

    .products-lang-row button {
      min-width: 44px !important;
    }

    .products-summary-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 12px !important;
    }

    .products-summary-grid button {
      min-height: 150px !important;
      padding: 14px 8px !important;
    }

    .products-summary-grid button span {
      font-size: clamp(15px, 3.6vw, 18px) !important;
    }

    .products-summary-grid button strong {
      font-size: clamp(22px, 5.2vw, 30px) !important;
    }

    .products-product-info-grid {
      grid-template-columns: 1fr !important;
    }

    .products-action-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .products-action-row button {
      width: 100% !important;
    }

    .products-plus-btn {
      width: 52px !important;
      height: 52px !important;
      min-width: 52px !important;
      min-height: 52px !important;
      max-width: 52px !important;
    }
  }
`;

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
    name: "可愛粉色",
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
    name: "可愛淺紅",
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

function readStockMapByKey(key: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(key);
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
  localStorage.setItem(PRODUCT_STOCK_MAP_KEY, JSON.stringify(map));
  localStorage.setItem(PRODUCT_STOCK_FALLBACK_KEY, JSON.stringify(map));
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
        style={{
          ...productCardStyle,
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
      <style jsx global>{`
        html {
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }

        ${FONT_SYSTEM_CSS}
      `}</style>

      <div className="products-topbar" style={topBarStyle}>
        <div className="products-topbar-left">
          <button
            onClick={goBack}
            style={{ ...backBtnStyle, borderColor: theme.border, color: theme.accent }}
          >
            ← {t.back}
          </button>
        </div>

        <div className="products-topbar-right">
          <div className="products-lang-row" style={langRowStyle}>
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
      </div>

      <section
        style={{
          ...headerCardStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div className="products-title-row" style={titleRowStyle}>
          <div className="products-title-text">
            <h1 style={titleStyle}>{t.title}</h1>
            <p style={{ ...subTitleStyle, color: theme.muted }}>{t.subtitle}</p>
            {isTrial ? <div style={trialBadgeStyle}>{t.trial}</div> : null}
          </div>

          <button
            className="products-plus-btn"
            onClick={openAddForm}
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
        id="productDetails"
        style={{
          ...contentCardStyle,
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

          <button onClick={openAddForm} style={{ ...addBtnStyle, background
