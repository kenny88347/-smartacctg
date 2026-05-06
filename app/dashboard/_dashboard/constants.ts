import type { Lang } from "./types";

export {
  APP_CENTER_APP,
  DASHBOARD_APP_KEYS_LOCAL,
  DASHBOARD_APPS_INIT_LOCAL,
  DEFAULT_APPS,
  DEFAULT_DASHBOARD_APP_KEYS,
  NK_LOGO_FALLBACK_SRC,
  NK_LOGO_SRC,
} from "@/lib/appRegistry";

export const TRIAL_KEY = "smartacctg_trial";
export const TRIAL_TX_KEY = "smartacctg_trial_transactions";
export const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
export const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";
export const LANG_KEY = "smartacctg_lang";

export const TXT: Record<
  Lang,
  {
    dashboard: string;
    notice: string;
    recordsOverview: string;
    latestMonth: string;
    customerDebt: string;
    estimatedProfit: string;
    balance: string;
    monthIncome: string;
    monthExpense: string;
    quick: string;
    quickAccounting: string;
    quickInvoice: string;
    quickCustomer: string;
    quickProduct: string;
    expiry: string;
    noSub: string;
    trial: string;
    logout: string;
    changeAvatar: string;
    settings: string;
    theme: string;
    language: string;
    personal: string;
    name: string;
    phone: string;
    company: string;
    companyName: string;
    ssm: string;
    companyPhone: string;
    companyAddress: string;
    password: string;
    newPassword: string;
    save: string;
    updatePassword: string;
    saved: string;
    noDebt: string;
    back: string;
    close: string;
    open: string;
    addToDashboard: string;
    removeFromDashboard: string;
    appCenter: string;
    appCenterDesc: string;
    longPressRemove: string;
    removeAppTitle: string;
    removeAppMessage: string;
    confirm: string;
    cancel: string;
    freeTrialCannotUpload: string;
    trialNoCloud: string;
    trialNoPassword: string;
    passwordTooShort: string;
    pleaseLogin: string;
    noApps: string;
  }
> = {
  zh: {
    dashboard: "控制台",
    notice: "通告：欢迎使用 SmartAcctg，请定期检查账目、客户欠款、库存和订阅期限。",
    recordsOverview: "记录总览",
    latestMonth: "最新月份",
    customerDebt: "客户欠款",
    estimatedProfit: "预计利润",
    balance: "当前余额",
    monthIncome: "本月收入",
    monthExpense: "本月支出",
    quick: "快速记录 / 开发票",
    quickAccounting: "记账",
    quickInvoice: "发票",
    quickCustomer: "客户",
    quickProduct: "产品",
    expiry: "订阅期限",
    noSub: "未订阅",
    trial: "免费试用",
    logout: "退出登录",
    changeAvatar: "更换头像",
    settings: "设置",
    theme: "主题切换",
    language: "语言切换",
    personal: "个人资料",
    name: "名称",
    phone: "电话号码",
    company: "公司资料",
    companyName: "公司名字",
    ssm: "公司注册 SSM",
    companyPhone: "公司电话号码",
    companyAddress: "公司地址",
    password: "更换密码",
    newPassword: "新密码",
    save: "保存资料",
    updatePassword: "更新密码",
    saved: "保存成功",
    noDebt: "暂无欠款",
    back: "返回",
    close: "关闭",
    open: "打开",
    addToDashboard: "加到控制台",
    removeFromDashboard: "从控制台移除",
    appCenter: "App Center",
    appCenterDesc:
      "这里可以管理控制台显示的 App。移除后只会从控制台隐藏，App Center 里面还会保留。",
    longPressRemove: "长按 App 图标可从控制台移除",
    removeAppTitle: "移除控制台 App",
    removeAppMessage: "确定要从控制台移除这个 App 吗？App Center 里还会保留。",
    confirm: "确定",
    cancel: "取消",
    freeTrialCannotUpload: "免费试用不能上传头像",
    trialNoCloud: "免费试用资料不会保存到云端",
    trialNoPassword: "免费试用没有账号密码",
    passwordTooShort: "密码至少 6 位",
    pleaseLogin: "请先登录",
    noApps: "控制台还没有 App，请到 App Center 添加。",
  },
  en: {
    dashboard: "Dashboard",
    notice:
      "Notice: Welcome to SmartAcctg. Please check records, customer debts, stock and subscription expiry regularly.",
    recordsOverview: "Records Overview",
    latestMonth: "Latest Month",
    customerDebt: "Customer Debt",
    estimatedProfit: "Estimated Profit",
    balance: "Balance",
    monthIncome: "Monthly Income",
    monthExpense: "Monthly Expense",
    quick: "Quick Record / Invoice",
    quickAccounting: "Record",
    quickInvoice: "Invoice",
    quickCustomer: "Customer",
    quickProduct: "Product",
    expiry: "Expiry",
    noSub: "Not Subscribed",
    trial: "Free Trial",
    logout: "Logout",
    changeAvatar: "Change Avatar",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    personal: "Personal Info",
    name: "Name",
    phone: "Phone",
    company: "Company Info",
    companyName: "Company Name",
    ssm: "SSM Registration",
    companyPhone: "Company Phone",
    companyAddress: "Company Address",
    password: "Change Password",
    newPassword: "New Password",
    save: "Save",
    updatePassword: "Update Password",
    saved: "Saved",
    noDebt: "No debt",
    back: "Back",
    close: "Close",
    open: "Open",
    addToDashboard: "Add to Dashboard",
    removeFromDashboard: "Remove from Dashboard",
    appCenter: "App Center",
    appCenterDesc:
      "Manage which apps appear on your dashboard. Removed apps stay available in App Center.",
    longPressRemove: "Long press an app icon to remove it from dashboard",
    removeAppTitle: "Remove Dashboard App",
    removeAppMessage: "Remove this app from dashboard? It will remain in App Center.",
    confirm: "Confirm",
    cancel: "Cancel",
    freeTrialCannotUpload: "Free trial cannot upload avatar",
    trialNoCloud: "Trial data will not be saved to cloud",
    trialNoPassword: "Trial mode has no account password",
    passwordTooShort: "Password must be at least 6 characters",
    pleaseLogin: "Please login first",
    noApps: "No dashboard apps yet. Add apps from App Center.",
  },
  ms: {
    dashboard: "Papan Pemuka",
    notice:
      "Notis: Selamat menggunakan SmartAcctg. Sila semak rekod, hutang pelanggan, stok dan tarikh langganan secara berkala.",
    recordsOverview: "Ringkasan Rekod",
    latestMonth: "Bulan Terkini",
    customerDebt: "Hutang Pelanggan",
    estimatedProfit: "Anggaran Untung",
    balance: "Baki",
    monthIncome: "Pendapatan Bulan Ini",
    monthExpense: "Perbelanjaan Bulan Ini",
    quick: "Rekod Pantas / Invois",
    quickAccounting: "Rekod",
    quickInvoice: "Invois",
    quickCustomer: "Pelanggan",
    quickProduct: "Produk",
    expiry: "Tarikh Tamat",
    noSub: "Belum Langgan",
    trial: "Percubaan Percuma",
    logout: "Log Keluar",
    changeAvatar: "Tukar Avatar",
    settings: "Tetapan",
    theme: "Tema",
    language: "Bahasa",
    personal: "Maklumat Peribadi",
    name: "Nama",
    phone: "Telefon",
    company: "Maklumat Syarikat",
    companyName: "Nama Syarikat",
    ssm: "No. SSM",
    companyPhone: "Telefon Syarikat",
    companyAddress: "Alamat Syarikat",
    password: "Tukar Kata Laluan",
    newPassword: "Kata Laluan Baru",
    save: "Simpan",
    updatePassword: "Kemas Kini Kata Laluan",
    saved: "Disimpan",
    noDebt: "Tiada hutang",
    back: "Kembali",
    close: "Tutup",
    open: "Buka",
    addToDashboard: "Tambah ke Dashboard",
    removeFromDashboard: "Buang dari Dashboard",
    appCenter: "App Center",
    appCenterDesc:
      "Urus app yang dipaparkan pada dashboard. App yang dibuang masih kekal dalam App Center.",
    longPressRemove: "Tekan lama ikon app untuk buang dari dashboard",
    removeAppTitle: "Buang App Dashboard",
    removeAppMessage: "Buang app ini dari dashboard? App masih kekal dalam App Center.",
    confirm: "Sahkan",
    cancel: "Batal",
    freeTrialCannotUpload: "Percubaan percuma tidak boleh muat naik avatar",
    trialNoCloud: "Data percubaan tidak disimpan ke cloud",
    trialNoPassword: "Mod percubaan tiada kata laluan akaun",
    passwordTooShort: "Kata laluan sekurang-kurangnya 6 aksara",
    pleaseLogin: "Sila log masuk dahulu",
    noApps: "Belum ada app dashboard. Tambah app dari App Center.",
  },
};
