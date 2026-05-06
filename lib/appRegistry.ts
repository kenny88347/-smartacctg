import type { AppRegistry, Lang } from "@/app/dashboard/_dashboard/types";

export const APP_ICON_BASE = "/app-icons";

/**
 * 你的 GitHub 里面是大写 .PNG
 * 所以这里必须写 .PNG
 */
export const APP_ICON_PATHS = {
  records: `${APP_ICON_BASE}/records.PNG`,
  customers: `${APP_ICON_BASE}/customers.PNG`,
  products: `${APP_ICON_BASE}/products.PNG`,
  invoices: `${APP_ICON_BASE}/invoices.PNG`,
  extensions: `${APP_ICON_BASE}/extensions.PNG`,
  nkshop: `${APP_ICON_BASE}/nkshop.PNG`,
  appCenter: `${APP_ICON_BASE}/nk-digital-hub-logo.PNG`,
} as const;

export const NK_LOGO_SRC = APP_ICON_PATHS.appCenter;
export const NK_LOGO_FALLBACK_SRC = APP_ICON_PATHS.appCenter;

/**
 * 新版本 localStorage key
 * 用 v2 是为了避开你之前旧的「全部 App 自动显示」缓存
 */
export const DASHBOARD_APP_KEYS_LOCAL = "smartacctg_dashboard_app_keys_v2";
export const DASHBOARD_APPS_INIT_LOCAL = "smartacctg_dashboard_apps_v2_initialized";

/**
 * 这里留空 = 用户没按 + 之前，控制台不会自动显示全部 App
 */
export const DEFAULT_DASHBOARD_APP_KEYS: string[] = [];

export const APP_CENTER_APP: AppRegistry = {
  app_key: "app_center",
  title_zh: "App Center",
  title_en: "App Center",
  title_ms: "App Center",
  description_zh: "管理控制台 App",
  description_en: "Manage dashboard apps",
  description_ms: "Urus app dashboard",
  icon: APP_ICON_PATHS.appCenter,
  app_path: "/dashboard/app-center",
  sort_order: 999,
  enabled: true,
  is_active: true,
};

export const DEFAULT_APPS: AppRegistry[] = [
  {
    app_key: "records",
    title_zh: "记账系统",
    title_en: "Accounting",
    title_ms: "Sistem Akaun",
    description_zh: "管理收入、支出、欠款和账目记录",
    description_en: "Manage income, expenses, debts and accounting records",
    description_ms: "Urus pendapatan, perbelanjaan, hutang dan rekod akaun",
    icon: APP_ICON_PATHS.records,
    app_path: "/dashboard/records",
    sort_order: 10,
    enabled: true,
    is_active: true,
  },
  {
    app_key: "customers",
    title_zh: "客户管理",
    title_en: "Customers",
    title_ms: "Pelanggan",
    description_zh: "管理客户资料、电话、公司和欠款",
    description_en: "Manage customer info, phone, company and debt",
    description_ms: "Urus maklumat pelanggan, telefon, syarikat dan hutang",
    icon: APP_ICON_PATHS.customers,
    app_path: "/dashboard/customers",
    sort_order: 20,
    enabled: true,
    is_active: true,
  },
  {
    app_key: "products",
    title_zh: "产品管理",
    title_en: "Products",
    title_ms: "Produk",
    description_zh: "管理产品、成本、售价和库存",
    description_en: "Manage products, cost, selling price and stock",
    description_ms: "Urus produk, kos, harga jualan dan stok",
    icon: APP_ICON_PATHS.products,
    app_path: "/dashboard/products",
    sort_order: 30,
    enabled: true,
    is_active: true,
  },
  {
    app_key: "invoices",
    title_zh: "发票系统",
    title_en: "Invoices",
    title_ms: "Invois",
    description_zh: "建立发票、扣库存和保存销售记录",
    description_en: "Create invoices, deduct stock and save sales records",
    description_ms: "Buat invois, tolak stok dan simpan rekod jualan",
    icon: APP_ICON_PATHS.invoices,
    app_path: "/dashboard/invoices",
    sort_order: 40,
    enabled: true,
    is_active: true,
  },
  {
    app_key: "extensions",
    title_zh: "扩展功能",
    title_en: "Extensions",
    title_ms: "Fungsi Tambahan",
    description_zh: "管理更多附加功能和未来模块",
    description_en: "Manage add-ons and future modules",
    description_ms: "Urus fungsi tambahan dan modul akan datang",
    icon: APP_ICON_PATHS.extensions,
    app_path: "/dashboard/extensions",
    sort_order: 50,
    enabled: true,
    is_active: true,
  },
  {
    app_key: "nkshop",
    title_zh: "NK网店",
    title_en: "NK Shop",
    title_ms: "NK Kedai",
    description_zh: "网店、下单和商品展示功能",
    description_en: "Shop, order and product display features",
    description_ms: "Kedai, pesanan dan paparan produk",
    icon: APP_ICON_PATHS.nkshop,
    app_path: "/dashboard/nkshop",
    sort_order: 60,
    enabled: true,
    is_active: true,
  },
];

export function getDashboardLocalKey(userId: string) {
  return `${DASHBOARD_APP_KEYS_LOCAL}_${userId || "guest"}`;
}

export function getDashboardInitLocalKey(userId: string) {
  return `${DASHBOARD_APPS_INIT_LOCAL}_${userId || "guest"}`;
}

export function normalizeDashboardKeys(keys: string[]) {
  const validKeys = new Set(DEFAULT_APPS.map((app) => app.app_key));

  return Array.from(new Set(keys))
    .map((key) => String(key || "").trim())
    .filter((key) => key && key !== "app_center")
    .filter((key) => validKeys.has(key));
}

export function getActiveApps() {
  return DEFAULT_APPS.filter(
    (app) =>
      app.app_key !== "app_center" &&
      app.enabled !== false &&
      app.is_active !== false
  ).sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));
}

export function getAppByKey(appKey: string) {
  return DEFAULT_APPS.find((app) => app.app_key === appKey) || null;
}

export function getAppTitle(app: AppRegistry, lang: Lang) {
  if (lang === "en") return app.title_en || app.title_zh || app.name || app.app_key;
  if (lang === "ms") return app.title_ms || app.title_zh || app.name || app.app_key;
  return app.title_zh || app.name || app.title_en || app.app_key;
}

export function getAppDescription(app: AppRegistry, lang: Lang) {
  if (lang === "en") return app.description_en || app.description_zh || "";
  if (lang === "ms") return app.description_ms || app.description_zh || "";
  return app.description_zh || app.description_en || "";
}

export function isAppImageIcon(icon?: string | null) {
  const value = String(icon || "").trim();
  const lower = value.toLowerCase();

  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".svg")
  );
}
