"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type Mode = "list" | "new";
type ThemeKey = "pink" | "blackGold" | "lightRed" | "nature" | "sky" | "deepTeal";

type Customer = {
  id: string;
  user_id?: string;
  name: string;
  phone?: string | null;
  company_name?: string | null;
  address?: string | null;
};

type Product = {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  cost: number;
  discount?: number | null;
  stock_qty?: number | null;
  note?: string | null;
};

type InvoiceRecord = {
  id: string;
  user_id?: string;
  invoice_no: string;
  invoice_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_company?: string | null;
  customer_address?: string | null;
  subtotal?: number | null;
  discount?: number | null;
  total?: number | null;
  total_cost?: number | null;
  total_profit?: number | null;
  payment_method?: string | null;
  note?: string | null;
  created_at?: string | null;
};

type PaymentOption = {
  id: string;
  name: string;
  bankAccount?: string;
  receiverName?: string;
  link?: string;
  qrCodeUrl?: string;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";
const PAYMENT_OPTIONS_KEY = "smartacctg_payment_options";
const LANG_KEY = "smartacctg_lang";
const THEME_KEY = "smartacctg_theme";

const PRODUCT_STOCK_MAP_KEY = "smartacctg_product_stock_map";
const PRODUCT_STOCK_FALLBACK_KEY = "smartacctg_product_stock_fallback";

const THEMES: Record<ThemeKey, any> = {
  deepTeal: {
    name: "深青色",
    pageBg: "#ecfdf5",
    card: "#ffffff",
    panelBg: "#f8fafc",
    itemBg: "#f8fafc",
    inputBg: "#ffffff",
    border: "#14b8a6",
    glow:
      "0 0 0 1px rgba(20,184,166,0.42), 0 0 18px rgba(45,212,191,0.55), 0 18px 42px rgba(15,118,110,0.25)",
    accent: "#0f766e",
    text: "#064e3b",
    panelText: "#111827",
    inputText: "#111827",
    muted: "#64748b",
  },
  pink: {
    name: "可愛粉色",
    pageBg: "#fff7fb",
    card: "#ffffff",
    panelBg: "#fdf2f8",
    itemBg: "#fdf2f8",
    inputBg: "#ffffff",
    border: "#f472b6",
    glow:
      "0 0 0 1px rgba(244,114,182,0.36), 0 0 18px rgba(244,114,182,0.45), 0 18px 38px rgba(244,114,182,0.22)",
    accent: "#db2777",
    text: "#4a044e",
    panelText: "#111827",
    inputText: "#111827",
    muted: "#64748b",
  },
  blackGold: {
    name: "黑金商務",
    pageBg: "#111111",
    card: "#1f1f1f",
    panelBg: "#2a2a2a",
    itemBg: "#2a2a2a",
    inputBg: "#ffffff",
    border: "#facc15",
    glow:
      "0 0 0 1px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.45), 0 18px 42px rgba(250,204,21,0.22)",
    accent: "#facc15",
    text: "#fff7ed",
    panelText: "#fff7ed",
    inputText: "#111827",
    muted: "#fde68a",
  },
  lightRed: {
    name: "可愛淺紅",
    pageBg: "#fff1f2",
    card: "#ffffff",
    panelBg: "#fff1f2",
    itemBg: "#fff1f2",
    inputBg: "#ffffff",
    border: "#fb7185",
    glow:
      "0 0 0 1px rgba(251,113,133,0.45), 0 0 20px rgba(251,113,133,0.5), 0 18px 38px rgba(251,113,133,0.26)",
    accent: "#e11d48",
    text: "#881337",
    panelText: "#111827",
    inputText: "#111827",
    muted: "#64748b",
  },
  nature: {
    name: "風景自然系",
    pageBg: "#f0fdf4",
    card: "#ffffff",
    panelBg: "#f8fafc",
    itemBg: "#f8fafc",
    inputBg: "#ffffff",
    border: "#22d3ee",
    glow:
      "0 0 0 1px rgba(34,211,238,0.42), 0 0 18px rgba(34,211,238,0.42), 0 18px 38px rgba(34,211,238,0.22)",
    accent: "#0f766e",
    text: "#14532d",
    panelText: "#111827",
    inputText: "#111827",
    muted: "#64748b",
  },
  sky: {
    name: "天空藍",
    pageBg: "#eff6ff",
    card: "#ffffff",
    panelBg: "#f8fafc",
    itemBg: "#f8fafc",
    inputBg: "#ffffff",
    border: "#38bdf8",
    glow:
      "0 0 0 1px rgba(56,189,248,0.42), 0 0 18px rgba(56,189,248,0.48), 0 18px 38px rgba(56,189,248,0.24)",
    accent: "#0284c7",
    text: "#0f172a",
    panelText: "#111827",
    inputText: "#111827",
    muted: "#64748b",
  },
};

const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "cash", name: "Cash" },
  { id: "bank-transfer", name: "Bank Transfer", bankAccount: "", receiverName: "" },
  { id: "duitnow-qr", name: "DuitNow QR", qrCodeUrl: "" },
  { id: "tng-ewallet", name: "TNG eWallet", link: "" },
  { id: "credit-term", name: "Credit Term" },
  { id: "cheque", name: "Cheque" },
];

const TXT = {
  zh: {
    back: "返回",
    title: "发票记录",
    newInvoice: "新发票",
    edit: "编辑",
    delete: "删除",
    share: "分享",
    whatsapp: "WhatsApp",
    theme: "主题",
    saveEdit: "保存修改",
    confirmDelete: "确定要删除这张发票吗？",
    latestInvoices: "正式 Invoice｜客户联动｜产品联动｜自动进记账｜自动扣库存",
    searchPlaceholder: "搜索发票号、客户名字、公司名字、电话号码",
    noInvoice: "还没有发票记录",
    recordDateTime: "日期 / 时间",
    createTitle: "专业发票系统",
    desc: "正式 Invoice｜客户联动｜产品联动｜自动进记账｜自动扣库存",
    invoiceInfo: "1. 发票资料",
    invoiceDate: "发票日期",
    dueDate: "到期日",
    status: "状态",
    draft: "草稿",
    sent: "已发出",
    paid: "已付款",
    cancelled: "取消",
    paymentMethod: "付款方式",
    paymentDetails: "付款资料",
    addPayment: "+ 新增付款方式",
    closePayment: "收起新增付款方式",
    deletePayment: "删除",
    paymentName: "付款名称，例如 MAYBANK / DuitNow QR",
    paymentBankAccount: "银行户口",
    paymentReceiverName: "收款名字",
    paymentLink: "付款链接，例如 Billplz / TNG Link",
    paymentQr: "QR Code 图片 URL",
    uploadQr: "上传 QR 图",
    qrUploaded: "QR 图已上传",
    note: "备注",
    companyInfo: "2. 公司资料",
    editCompany: "编辑公司资料 / Logo",
    saveCompany: "保存公司资料",
    companyLogoUrl: "公司 Logo URL",
    companyName: "公司名称",
    companyRegNo: "SSM / 注册号",
    phone: "电话",
    address: "地址",
    customerInfo: "3. 客户资料",
    selectCustomer: "从客户管理选择",
    newCustomer: "新增客户",
    chooseCustomer: "请选择客户",
    customerName: "客户名称",
    customerPhone: "客户电话",
    customerCompany: "客户公司",
    customerAddress: "客户地址",
    productInfo: "4. 产品明细",
    selectProduct: "从产品管理选择",
    newProduct: "新增产品",
    chooseProduct: "请选择产品",
    productName: "产品名称",
    price: "售价 RM",
    cost: "成本 RM",
    stock: "库存数量",
    invoiceContent: "5. 发票内容",
    qty: "数量",
    extraDiscount: "额外折扣 RM",
    lhdn: "6. Malaysia LHDN e-Invoice 预留资料",
    preview: "正式发票预览",
    subtotal: "小计",
    discount: "折扣",
    total: "总额",
    profit: "差价赚 / 预计利润",
    generate: "生成发票 + 加入记账 + 扣库存",
    generating: "生成中...",
    print: "列印",
    pdf: "下载 PDF",
    whatsappPdf: "WhatsApp发送PDF",
    needCustomer: "请选择客户",
    needNewCustomer: "请填写新客户名称",
    needProduct: "请选择产品",
    needNewProduct: "请填写新产品名称、价格和成本",
    qtyError: "数量必须大过 0",
    stockNotEnough: "库存不足，目前库存：",
    trialSuccess: "试用版发票已生成，已加入记账，并已扣库存",
    success: "发票已生成，已自动加入记账，并已扣除库存",
    lhdnSkipped:
      "发票已生成并加入记账；但 invoices 表缺少部分 LHDN 预留栏位，所以已先保存基本发票资料",
    fail: "生成失败：",
    incomplete: "客户或产品资料不完整",
    productNote: "由发票系统新增",
    saved: "保存成功",
    copied: "已准备分享内容",
    invoice: "INVOICE",
    billTo: "BILL TO",
    invoiceDetails: "INVOICE DETAILS",
    description: "产品名称",
    previewProductName: "产品名称",
    previewQty: "数量",
    previewPrice: "售价 RM",
    previewDiscount: "折扣",
    previewTotal: "总额",
  },
  en: {
    back: "Back",
    title: "Invoice Records",
    newInvoice: "New Invoice",
    edit: "Edit",
    delete: "Delete",
    share: "Share",
    whatsapp: "WhatsApp",
    theme: "Theme",
    saveEdit: "Save Changes",
    confirmDelete: "Delete this invoice?",
    latestInvoices: "Official Invoice｜Customer Link｜Product Link｜Auto Accounting｜Auto Stock",
    searchPlaceholder: "Search invoice no, customer, company, phone",
    noInvoice: "No invoice records yet",
    recordDateTime: "Date / Time",
    createTitle: "Professional Invoice System",
    desc: "Official Invoice｜Customer Link｜Product Link｜Auto Accounting｜Auto Stock Deduction",
    invoiceInfo: "1. Invoice Info",
    invoiceDate: "Invoice Date",
    dueDate: "Due Date",
    status: "Status",
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    cancelled: "Cancelled",
    paymentMethod: "Payment Method",
    paymentDetails: "Payment Details",
    addPayment: "+ Add Payment Method",
    closePayment: "Close Payment Form",
    deletePayment: "Delete",
    paymentName: "Payment name, e.g. MAYBANK / DuitNow QR",
    paymentBankAccount: "Bank Account",
    paymentReceiverName: "Receiver Name",
    paymentLink: "Payment link, e.g. Billplz / TNG Link",
    paymentQr: "QR Code Image URL",
    uploadQr: "Upload QR Image",
    qrUploaded: "QR image uploaded",
    note: "Note",
    companyInfo: "2. Company Info",
    editCompany: "Edit Company Info / Logo",
    saveCompany: "Save Company Info",
    companyLogoUrl: "Company Logo URL",
    companyName: "Company Name",
    companyRegNo: "SSM / Registration No",
    phone: "Phone",
    address: "Address",
    customerInfo: "3. Customer Info",
    selectCustomer: "Select from Customers",
    newCustomer: "Add Customer",
    chooseCustomer: "Please select customer",
    customerName: "Customer Name",
    customerPhone: "Customer Phone",
    customerCompany: "Customer Company",
    customerAddress: "Customer Address",
    productInfo: "4. Product Details",
    selectProduct: "Select from Products",
    newProduct: "Add Product",
    chooseProduct: "Please select product",
    productName: "Product Name",
    price: "Selling Price RM",
    cost: "Cost RM",
    stock: "Stock Quantity",
    invoiceContent: "5. Invoice Content",
    qty: "Quantity",
    extraDiscount: "Extra Discount RM",
    lhdn: "6. Malaysia LHDN e-Invoice Reserved Fields",
    preview: "Official Invoice Preview",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    profit: "Profit / Margin",
    generate: "Generate Invoice + Add Accounting + Deduct Stock",
    generating: "Generating...",
    print: "Print",
    pdf: "Download PDF",
    whatsappPdf: "Send PDF via WhatsApp",
    needCustomer: "Please select customer",
    needNewCustomer: "Please enter new customer name",
    needProduct: "Please select product",
    needNewProduct: "Please enter product name, price and cost",
    qtyError: "Quantity must be more than 0",
    stockNotEnough: "Insufficient stock. Current stock: ",
    trialSuccess: "Trial invoice generated, added to accounting and stock deducted",
    success: "Invoice generated, added to accounting and stock deducted",
    lhdnSkipped:
      "Invoice generated and added to accounting; invoices table is missing some LHDN reserved fields, so basic invoice data has been saved",
    fail: "Failed: ",
    incomplete: "Customer or product information is incomplete",
    productNote: "Added from invoice system",
    saved: "Saved",
    copied: "Share content is ready",
    invoice: "INVOICE",
    billTo: "BILL TO",
    invoiceDetails: "INVOICE DETAILS",
    description: "Product Name",
    previewProductName: "Product Name",
    previewQty: "Qty",
    previewPrice: "Price RM",
    previewDiscount: "Discount",
    previewTotal: "Total",
  },
  ms: {
    back: "Kembali",
    title: "Rekod Invois",
    newInvoice: "Invois Baru",
    edit: "Edit",
    delete: "Padam",
    share: "Kongsi",
    whatsapp: "WhatsApp",
    theme: "Tema",
    saveEdit: "Simpan Perubahan",
    confirmDelete: "Padam invois ini?",
    latestInvoices: "Invois Rasmi｜Pelanggan｜Produk｜Auto Akaun｜Auto Stok",
    searchPlaceholder: "Cari no invois, pelanggan, syarikat, telefon",
    noInvoice: "Tiada rekod invois",
    recordDateTime: "Tarikh / Masa",
    createTitle: "Sistem Invois Profesional",
    desc: "Invois Rasmi｜Pelanggan｜Produk｜Auto Akaun｜Auto Tolak Stok",
    invoiceInfo: "1. Maklumat Invois",
    invoiceDate: "Tarikh Invois",
    dueDate: "Tarikh Tamat",
    status: "Status",
    draft: "Draf",
    sent: "Dihantar",
    paid: "Dibayar",
    cancelled: "Dibatalkan",
    paymentMethod: "Cara Bayaran",
    paymentDetails: "Maklumat Bayaran",
    addPayment: "+ Tambah Cara Bayaran",
    closePayment: "Tutup Borang Bayaran",
    deletePayment: "Padam",
    paymentName: "Nama bayaran, cth. MAYBANK / DuitNow QR",
    paymentBankAccount: "Akaun Bank",
    paymentReceiverName: "Nama Penerima",
    paymentLink: "Pautan bayaran, cth. Billplz / TNG Link",
    paymentQr: "URL Gambar QR Code",
    uploadQr: "Muat Naik Gambar QR",
    qrUploaded: "Gambar QR dimuat naik",
    note: "Nota",
    companyInfo: "2. Maklumat Syarikat",
    editCompany: "Ubah Maklumat Syarikat / Logo",
    saveCompany: "Simpan Maklumat Syarikat",
    companyLogoUrl: "URL Logo Syarikat",
    companyName: "Nama Syarikat",
    companyRegNo: "SSM / No Pendaftaran",
    phone: "Telefon",
    address: "Alamat",
    customerInfo: "3. Maklumat Pelanggan",
    selectCustomer: "Pilih dari Pelanggan",
    newCustomer: "Tambah Pelanggan",
    chooseCustomer: "Sila pilih pelanggan",
    customerName: "Nama Pelanggan",
    customerPhone: "Telefon Pelanggan",
    customerCompany: "Syarikat Pelanggan",
    customerAddress: "Alamat Pelanggan",
    productInfo: "4. Butiran Produk",
    selectProduct: "Pilih dari Produk",
    newProduct: "Tambah Produk",
    chooseProduct: "Sila pilih produk",
    productName: "Nama Produk",
    price: "Harga Jualan RM",
    cost: "Kos RM",
    stock: "Jumlah Stok",
    invoiceContent: "5. Kandungan Invois",
    qty: "Kuantiti",
    extraDiscount: "Diskaun Tambahan RM",
    lhdn: "6. Ruang Simpanan Malaysia LHDN e-Invoice",
    preview: "Pratonton Invois Rasmi",
    subtotal: "Subtotal",
    discount: "Diskaun",
    total: "Jumlah",
    profit: "Untung / Margin",
    generate: "Jana Invois + Masuk Akaun + Tolak Stok",
    generating: "Sedang Jana...",
    print: "Cetak",
    pdf: "Muat Turun PDF",
    whatsappPdf: "Hantar PDF WhatsApp",
    needCustomer: "Sila pilih pelanggan",
    needNewCustomer: "Sila isi nama pelanggan baru",
    needProduct: "Sila pilih produk",
    needNewProduct: "Sila isi nama produk, harga dan kos",
    qtyError: "Kuantiti mesti lebih daripada 0",
    stockNotEnough: "Stok tidak cukup. Stok semasa: ",
    trialSuccess: "Invois percubaan berjaya dijana, masuk akaun dan stok ditolak",
    success: "Invois berjaya dijana, masuk akaun dan stok ditolak",
    lhdnSkipped:
      "Invois berjaya dijana dan masuk akaun; jadual invoices tiada beberapa medan LHDN, jadi data asas invois telah disimpan",
    fail: "Gagal: ",
    incomplete: "Maklumat pelanggan atau produk tidak lengkap",
    productNote: "Ditambah dari sistem invois",
    saved: "Disimpan",
    copied: "Kandungan kongsi sudah sedia",
    invoice: "INVOICE",
    billTo: "BILL TO",
    invoiceDetails: "INVOICE DETAILS",
    description: "Nama Produk",
    previewProductName: "Nama Produk",
    previewQty: "Kuantiti",
    previewPrice: "Harga RM",
    previewDiscount: "Diskaun",
    previewTotal: "Jumlah",
  },
};

function makeInvoiceNo() {
  return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isSchemaColumnError(error: any) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("schema cache") ||
    message.includes("could not find") ||
    message.includes("column")
  );
}

function isMissingStockColumn(error: any) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("stock_qty") && isSchemaColumnError(error);
}

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

function getRawStock(row: any) {
  return row?.stock_qty ?? row?.stock ?? row?.stock_quantity ?? row?.quantity ?? row?.qty;
}

function normalizeProduct(row: any): Product {
  const stockMap = getStockMap();
  const localStock = stockMap[row?.id];
  const rawDbStock = getRawStock(row);

  const hasDbStock =
    rawDbStock !== undefined &&
    rawDbStock !== null &&
    rawDbStock !== "";

  const dbStock = Number(rawDbStock || 0);

  let finalStock = 0;

  if (localStock !== undefined && (!hasDbStock || dbStock === 0)) {
    finalStock = Number(localStock || 0);
  } else {
    finalStock = dbStock;
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
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Upload failed"));
    reader.readAsDataURL(file);
  });
}

function normalizePaymentOptions(value: any): PaymentOption[] {
  if (!Array.isArray(value)) return DEFAULT_PAYMENT_OPTIONS;

  const normalized = value
    .map((item) => {
      if (typeof item === "string") {
        return {
          id: makeId("pay"),
          name: item,
          bankAccount: "",
          receiverName: "",
          link: "",
          qrCodeUrl: "",
        };
      }

      if (item && typeof item === "object" && item.name) {
        return {
          id: item.id || makeId("pay"),
          name: String(item.name),
          bankAccount: item.bankAccount || "",
          receiverName: item.receiverName || "",
          link: item.link || "",
          qrCodeUrl: item.qrCodeUrl || "",
        };
      }

      return null;
    })
    .filter(Boolean) as PaymentOption[];

  return normalized.length > 0 ? normalized : DEFAULT_PAYMENT_OPTIONS;
}

function formatDateTime(value?: string | null, fallbackDate?: string | null) {
  if (!value && fallbackDate) return fallbackDate;
  if (!value) return "-";

  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    return `${d.toLocaleDateString("zh-MY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })} ${d.toLocaleTimeString("zh-MY", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  } catch {
    return value || fallbackDate || "-";
  }
}

export default function InvoicePage() {
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const t = TXT[lang];
  const theme = THEMES[themeKey];

  const [mode, setMode] = useState<Mode>("list");
  const [userId, setUserId] = useState("");
  const [isTrial, setIsTrial] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [search, setSearch] = useState("");

  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);

  const [customerMode, setCustomerMode] = useState<"select" | "new">("select");
  const [productMode, setProductMode] = useState<"select" | "new">("select");

  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  const [productId, setProductId] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCost, setNewProductCost] = useState("");
  const [newProductStock, setNewProductStock] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const [invoiceNo, setInvoiceNo] = useState(makeInvoiceNo());
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [status, setStatus] = useState("sent");

  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_OPTIONS[0].id);
  const [paymentOptions, setPaymentOptions] =
    useState<PaymentOption[]>(DEFAULT_PAYMENT_OPTIONS);

  const [showPaymentAdd, setShowPaymentAdd] = useState(false);
  const [newPaymentName, setNewPaymentName] = useState("");
  const [newPaymentBankAccount, setNewPaymentBankAccount] = useState("");
  const [newPaymentReceiverName, setNewPaymentReceiverName] = useState("");
  const [newPaymentLink, setNewPaymentLink] = useState("");
  const [newPaymentQr, setNewPaymentQr] = useState("");

  const [qty, setQty] = useState("1");
  const [extraDiscount, setExtraDiscount] = useState("0");
  const [note, setNote] = useState("");

  const [supplierTin, setSupplierTin] = useState("");
  const [buyerTin, setBuyerTin] = useState("");
  const [sstNo, setSstNo] = useState("");
  const [msicCode, setMsicCode] = useState("");
  const [einvoiceUuid, setEinvoiceUuid] = useState("");
  const [validationStatus, setValidationStatus] = useState("Not Submitted");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [myinvoisStatus, setMyinvoisStatus] = useState("Pending");

  const [companyName, setCompanyName] = useState("NK DIGITAL HUB");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [showCompanyEdit, setShowCompanyEdit] = useState(false);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastPrintableInvoice, setLastPrintableInvoice] = useState<InvoiceRecord | null>(null);
  const [lastPrintableProductName, setLastPrintableProductName] = useState("");

  const selectedPayment =
    paymentOptions.find((p) => p.id === paymentMethod) || paymentOptions[0];

  const paymentMethodText = selectedPayment?.name || paymentMethod || "-";

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg,
    color: theme.inputText,
  };

  const themedPanelStyle: CSSProperties = {
    background: theme.panelBg,
    color: theme.panelText,
    borderColor: theme.border,
  };

  useEffect(() => {
    init();
  }, []);

  function getCurrentLang(): Lang {
    const q = new URLSearchParams(window.location.search);
    const urlLang = q.get("lang") as Lang | null;
    const savedLang = localStorage.getItem(LANG_KEY) as Lang | null;

    if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") return urlLang;
    if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") return savedLang;
    return "zh";
  }

  function getCurrentTheme(): ThemeKey {
    const saved = localStorage.getItem(THEME_KEY) as ThemeKey | null;
    if (saved && THEMES[saved]) return saved;
    return "deepTeal";
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

    if (!isTrial && userId) {
      await supabase.from("profiles").update({ theme: next }).eq("id", userId);
    }
  }

  async function init() {
    const currentLang = getCurrentLang();
    setLang(currentLang);
    setThemeKey(getCurrentTheme());

    const savedPayment = localStorage.getItem(PAYMENT_OPTIONS_KEY);
    if (savedPayment) {
      const parsed = normalizePaymentOptions(JSON.parse(savedPayment));
      setPaymentOptions(parsed);
      setPaymentMethod(parsed[0]?.id || DEFAULT_PAYMENT_OPTIONS[0].id);
    }

    const q = new URLSearchParams(window.location.search);
    const modeParam = q.get("mode");
    const trialRaw = localStorage.getItem(TRIAL_KEY);

    if (modeParam === "trial" && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);

        const savedCustomers = localStorage.getItem(TRIAL_CUSTOMERS_KEY);
        const savedProducts = localStorage.getItem(TRIAL_PRODUCTS_KEY);
        const savedInvoices = localStorage.getItem(TRIAL_INVOICES_KEY);

        const trialProducts = savedProducts ? JSON.parse(savedProducts) : [];

        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setProducts(trialProducts.map((p: any) => normalizeProduct(p)));
        setInvoices(savedInvoices ? JSON.parse(savedInvoices) : []);

        return;
      }

      localStorage.removeItem(TRIAL_KEY);
      window.location.href = "/zh";
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/zh";
      return;
    }

    const uid = data.session.user.id;
    setUserId(uid);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (profile) {
      setCompanyName(profile.company_name || "NK DIGITAL HUB");
      setCompanyRegNo(profile.company_reg_no || "");
      setCompanyPhone(profile.company_phone || "");
      setCompanyAddress(profile.company_address || "");
      setCompanyLogoUrl(profile.company_logo_url || "");

      if (profile.theme && THEMES[profile.theme as ThemeKey]) {
        setThemeKey(profile.theme as ThemeKey);
        localStorage.setItem(THEME_KEY, profile.theme);
      }
    }

    await loadCustomers(uid);
    await loadProducts(uid);
    await loadInvoices(uid);
  }

  async function loadCustomers(uid: string) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    setCustomers((data || []) as Customer[]);
  }

  async function loadProducts(uid: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      setMsg(t.fail + error.message);
      setProducts([]);
      return;
    }

    setProducts((data || []).map((p: any) => normalizeProduct(p)));
  }

  async function loadInvoices(uid: string) {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    setInvoices((data || []) as InvoiceRecord[]);
  }

  async function insertProductWithStock(inputStock: number) {
    const basePayload = {
      user_id: userId,
      name: newProductName,
      price: Number(newProductPrice),
      cost: Number(newProductCost),
      discount: 0,
      note: t.productNote,
    };

    const attempts = [
      { ...basePayload, stock_qty: inputStock },
      { ...basePayload, stock: inputStock },
      { ...basePayload, stock_quantity: inputStock },
      basePayload,
    ];

    for (const payload of attempts) {
      const result = await supabase
        .from("products")
        .insert(payload)
        .select("*")
        .single();

      if (!result.error) {
        const fixed = normalizeProduct({
          ...(result.data as any),
          stock_qty: getRawStock(result.data) ?? inputStock,
        });

        if (Number(fixed.stock_qty || 0) === 0 && inputStock > 0) {
          fixed.stock_qty = inputStock;
        }

        saveStockValue(fixed.id, Number(fixed.stock_qty || inputStock || 0));
        return fixed;
      }

      if (!isSchemaColumnError(result.error)) {
        throw result.error;
      }
    }

    throw new Error("Product insert failed");
  }

  async function updateProductStockSafe(productId: string, nextStock: number) {
    const attempts = [
      { stock_qty: nextStock },
      { stock: nextStock },
      { stock_quantity: nextStock },
    ];

    for (const payload of attempts) {
      const result = await supabase
        .from("products")
        .update(payload)
        .eq("id", productId)
        .eq("user_id", userId);

      if (!result.error) {
        saveStockValue(productId, nextStock);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock_qty: nextStock } : p))
        );
        return;
      }

      if (!isSchemaColumnError(result.error) && !isMissingStockColumn(result.error)) {
        throw result.error;
      }
    }

    saveStockValue(productId, nextStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock_qty: nextStock } : p))
    );
  }

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedProduct = products.find((p) => p.id === productId);

  const preview = useMemo(() => {
    const finalQty = Number(qty || 1);
    const addDiscount = Number(extraDiscount || 0);

    const price =
      productMode === "new"
        ? Number(newProductPrice || 0)
        : Number(selectedProduct?.price || 0);

    const cost =
      productMode === "new"
        ? Number(newProductCost || 0)
        : Number(selectedProduct?.cost || 0);

    const productDiscount =
      productMode === "new" ? 0 : Number(selectedProduct?.discount || 0);

    const subtotal = price * finalQty;
    const discount = productDiscount + addDiscount;
    const total = Math.max(subtotal - discount, 0);
    const totalCost = cost * finalQty;
    const profit = total - totalCost;

    return { finalQty, price, cost, subtotal, discount, total, totalCost, profit };
  }, [qty, extraDiscount, productMode, newProductPrice, newProductCost, selectedProduct]);

  const activeCustomerForPreview: Customer =
    customerMode === "select"
      ? selectedCustomer || { id: "", name: "-" }
      : {
          id: "",
          name: newCustomerName || "-",
          phone: newCustomerPhone,
          company_name: newCustomerCompany,
          address: newCustomerAddress,
        };

  const activeProductForPreview: Product =
    productMode === "select"
      ? selectedProduct || { id: "", name: "-", price: 0, cost: 0, stock_qty: 0 }
      : {
          id: "",
          name: newProductName || "-",
          price: Number(newProductPrice || 0),
          cost: Number(newProductCost || 0),
          stock_qty: Number(newProductStock || 0),
        };

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return [
      inv.invoice_no,
      inv.customer_name,
      inv.customer_company,
      inv.customer_phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  function getPaymentForInvoice(inv?: InvoiceRecord | null) {
    const value = inv?.payment_method || paymentMethodText;
    return (
      paymentOptions.find((p) => p.id === value || p.name === value) ||
      selectedPayment ||
      null
    );
  }

  function savePaymentOptions(next: PaymentOption[]) {
    setPaymentOptions(next);
    localStorage.setItem(PAYMENT_OPTIONS_KEY, JSON.stringify(next));
  }

  async function uploadPaymentQr(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setNewPaymentQr(dataUrl);
      setMsg(t.qrUploaded);
    } catch (error: any) {
      setMsg(t.fail + error.message);
    }
  }

  function addPaymentOption() {
    const name = newPaymentName.trim();
    if (!name) return;

    const nextOption: PaymentOption = {
      id: makeId("pay"),
      name,
      bankAccount: newPaymentBankAccount.trim(),
      receiverName: newPaymentReceiverName.trim(),
      link: newPaymentLink.trim(),
      qrCodeUrl: newPaymentQr.trim(),
    };

    const next = [...paymentOptions, nextOption];

    savePaymentOptions(next);
    setPaymentMethod(nextOption.id);
    setNewPaymentName("");
    setNewPaymentBankAccount("");
    setNewPaymentReceiverName("");
    setNewPaymentLink("");
    setNewPaymentQr("");
    setShowPaymentAdd(false);
  }

  function deletePaymentOption(id: string) {
    const next = paymentOptions.filter((x) => x.id !== id);
    const finalNext = next.length > 0 ? next : DEFAULT_PAYMENT_OPTIONS;

    savePaymentOptions(finalNext);

    if (paymentMethod === id) {
      setPaymentMethod(finalNext[0].id);
    }
  }

  function saveTrialData(nextCustomers: Customer[], nextProducts: Product[], nextInvoices = invoices) {
    localStorage.setItem(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
    localStorage.setItem(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
    localStorage.setItem(TRIAL_INVOICES_KEY, JSON.stringify(nextInvoices));
  }

  function addTrialTransaction(total: number, customer: Customer, product: Product, invNo: string) {
    const oldRaw = localStorage.getItem(TRIAL_TX_KEY);
    const oldTx = oldRaw ? JSON.parse(oldRaw) : [];

    const nextTx = [
      {
        id: String(Date.now()),
        txn_date: invoiceDate,
        txn_type: "income",
        amount: total,
        category_name:
          lang === "zh"
            ? "发票收入"
            : lang === "en"
              ? "Invoice Income"
              : "Pendapatan Invois",
        note: `${invNo}｜${customer.name}｜${product.name}`,
      },
      ...oldTx,
    ];

    localStorage.setItem(TRIAL_TX_KEY, JSON.stringify(nextTx));
  }

  async function saveCompanyInfo() {
    if (isTrial) {
      setMsg(t.saved);
      setShowCompanyEdit(false);
      return;
    }

    if (!userId) return;

    const fullUpdate = await supabase
      .from("profiles")
      .update({
        company_name: companyName,
        company_reg_no: companyRegNo,
        company_phone: companyPhone,
        company_address: companyAddress,
        company_logo_url: companyLogoUrl,
      })
      .eq("id", userId);

    if (fullUpdate.error && isSchemaColumnError(fullUpdate.error)) {
      const basicUpdate = await supabase
        .from("profiles")
        .update({
          company_name: companyName,
          company_reg_no: companyRegNo,
          company_phone: companyPhone,
          company_address: companyAddress,
        })
        .eq("id", userId);

      if (basicUpdate.error) {
        setMsg(t.fail + basicUpdate.error.message);
        return;
      }

      setMsg(t.saved);
      setShowCompanyEdit(false);
      return;
    }

    if (fullUpdate.error) {
      setMsg(t.fail + fullUpdate.error.message);
      return;
    }

    setMsg(t.saved);
    setShowCompanyEdit(false);
  }

  async function insertInvoiceWithFallback(finalCustomer: Customer) {
    const fullPayload = {
      user_id: userId,
      customer_id: finalCustomer.id,
      customer_name: finalCustomer.name,
      customer_phone: finalCustomer.phone || "",
      customer_company: finalCustomer.company_name || "",
      customer_address: finalCustomer.address || "",
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      due_date: dueDate,
      status,
      payment_method: paymentMethodText,
      subtotal: preview.subtotal,
      discount: preview.discount,
      total: preview.total,
      total_cost: preview.totalCost,
      total_profit: preview.profit,
      note,
      supplier_tin: supplierTin,
      buyer_tin: buyerTin,
      sst_no: sstNo,
      msic_code: msicCode,
      einvoice_uuid: einvoiceUuid,
      validation_status: validationStatus,
      qr_code_url: qrCodeUrl,
      myinvois_status: myinvoisStatus,
    };

    const withoutLhdnPayload = {
      user_id: userId,
      customer_id: finalCustomer.id,
      customer_name: finalCustomer.name,
      customer_phone: finalCustomer.phone || "",
      customer_company: finalCustomer.company_name || "",
      customer_address: finalCustomer.address || "",
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      due_date: dueDate,
      status,
      payment_method: paymentMethodText,
      subtotal: preview.subtotal,
      discount: preview.discount,
      total: preview.total,
      total_cost: preview.totalCost,
      total_profit: preview.profit,
      note,
    };

    const basicPayload = {
      user_id: userId,
      customer_id: finalCustomer.id,
      customer_name: finalCustomer.name,
      invoice_no: invoiceNo,
      subtotal: preview.subtotal,
      total: preview.total,
      total_cost: preview.totalCost,
      total_profit: preview.profit,
      note,
    };

    const fullResult = await supabase.from("invoices").insert(fullPayload).select().single();

    if (!fullResult.error) {
      return { data: fullResult.data as InvoiceRecord, lhdnSkipped: false };
    }

    if (!isSchemaColumnError(fullResult.error)) {
      throw fullResult.error;
    }

    const noLhdnResult = await supabase
      .from("invoices")
      .insert(withoutLhdnPayload)
      .select()
      .single();

    if (!noLhdnResult.error) {
      return { data: noLhdnResult.data as InvoiceRecord, lhdnSkipped: true };
    }

    if (!isSchemaColumnError(noLhdnResult.error)) {
      throw noLhdnResult.error;
    }

    const basicResult = await supabase.from("invoices").insert(basicPayload).select().single();

    if (basicResult.error) throw basicResult.error;

    return { data: basicResult.data as InvoiceRecord, lhdnSkipped: true };
  }

  async function insertInvoiceItemSafe(invoiceId: string, finalProduct: Product) {
    const fullItem = {
      invoice_id: invoiceId,
      product_id: finalProduct.id,
      product_name: finalProduct.name,
      qty: preview.finalQty,
      unit_price: preview.price,
      unit_cost: preview.cost,
      discount: preview.discount,
      line_total: preview.total,
      line_profit: preview.profit,
    };

    const basicItem = {
      invoice_id: invoiceId,
      product_id: finalProduct.id,
      product_name: finalProduct.name,
      qty: preview.finalQty,
      unit_price: preview.price,
      line_total: preview.total,
    };

    const result = await supabase.from("invoice_items").insert(fullItem);

    if (!result.error) return;

    if (!isSchemaColumnError(result.error)) {
      throw result.error;
    }

    const basicResult = await supabase.from("invoice_items").insert(basicItem);

    if (basicResult.error && !isSchemaColumnError(basicResult.error)) {
      throw basicResult.error;
    }
  }

  async function insertTransactionSafe(invoiceId: string, finalCustomer: Customer, finalProduct: Product) {
    const fullTx = {
      user_id: userId,
      txn_date: invoiceDate,
      txn_type: "income",
      amount: preview.total,
      category_name:
        lang === "zh"
          ? "发票收入"
          : lang === "en"
            ? "Invoice Income"
            : "Pendapatan Invois",
      debt_amount: 0,
      source_type: "invoice",
      source_id: invoiceId,
      note: `${invoiceNo}｜${finalCustomer.name}｜${finalProduct.name}`,
    };

    const basicTx = {
      user_id: userId,
      txn_date: invoiceDate,
      txn_type: "income",
      amount: preview.total,
      category_name:
        lang === "zh"
          ? "发票收入"
          : lang === "en"
            ? "Invoice Income"
            : "Pendapatan Invois",
      note: `${invoiceNo}｜${finalCustomer.name}｜${finalProduct.name}`,
    };

    const result = await supabase.from("transactions").insert(fullTx);

    if (!result.error) return;

    if (!isSchemaColumnError(result.error)) {
      throw result.error;
    }

    const basicResult = await supabase.from("transactions").insert(basicTx);

    if (basicResult.error) throw basicResult.error;
  }

  async function createInvoice() {
    setMsg("");

    if (editInvoiceId) {
      await saveEditedInvoice();
      return;
    }

    if (customerMode === "select" && !selectedCustomer) {
      setMsg(t.needCustomer);
      return;
    }

    if (customerMode === "new" && !newCustomerName) {
      setMsg(t.needNewCustomer);
      return;
    }

    if (productMode === "select" && !selectedProduct) {
      setMsg(t.needProduct);
      return;
    }

    if (productMode === "new" && (!newProductName || !newProductPrice || !newProductCost)) {
      setMsg(t.needNewProduct);
      return;
    }

    if (preview.finalQty <= 0) {
      setMsg(t.qtyError);
      return;
    }

    setLoading(true);

    try {
      let finalCustomer = selectedCustomer;
      let finalProduct = selectedProduct;
      let lhdnSkipped = false;

      let workingCustomers = customers;
      let workingProducts = products;

      if (customerMode === "new") {
        finalCustomer = {
          id: String(Date.now()),
          name: newCustomerName,
          phone: newCustomerPhone,
          company_name: newCustomerCompany,
          address: newCustomerAddress,
        };

        if (isTrial) {
          workingCustomers = [finalCustomer, ...customers];
          setCustomers(workingCustomers);
          saveTrialData(workingCustomers, workingProducts);
        } else {
          const { data, error } = await supabase
            .from("customers")
            .insert({
              user_id: userId,
              name: newCustomerName,
              phone: newCustomerPhone,
              company_name: newCustomerCompany,
              address: newCustomerAddress,
            })
            .select()
            .single();

          if (error) throw error;
          finalCustomer = data as Customer;
          setCustomers((prev) => [finalCustomer as Customer, ...prev]);
        }
      }

      if (productMode === "new") {
        const inputStock = Number(newProductStock || 0);

        finalProduct = {
          id: String(Date.now() + 1),
          name: newProductName,
          price: Number(newProductPrice),
          cost: Number(newProductCost),
          discount: 0,
          stock_qty: inputStock,
          note: t.productNote,
        };

        if (isTrial) {
          workingProducts = [finalProduct, ...products];
          setProducts(workingProducts);
          saveStockValue(finalProduct.id, inputStock);
          saveTrialData(workingCustomers, workingProducts);
        } else {
          finalProduct = await insertProductWithStock(inputStock);
          setProducts((prev) => [finalProduct as Product, ...prev]);
        }
      } else if (finalProduct) {
        finalProduct = normalizeProduct(finalProduct);
      }

      if (!finalCustomer || !finalProduct) {
        setMsg(t.incomplete);
        setLoading(false);
        return;
      }

      const currentStock = Number(finalProduct.stock_qty || 0);

      if (currentStock < preview.finalQty) {
        setMsg(`${t.stockNotEnough}${currentStock}`);
        setLoading(false);
        return;
      }

      const newStock = Math.max(currentStock - preview.finalQty, 0);

      const printableRecord: InvoiceRecord = {
        id: String(Date.now()),
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status,
        customer_id: finalCustomer.id,
        customer_name: finalCustomer.name,
        customer_phone: finalCustomer.phone || "",
        customer_company: finalCustomer.company_name || "",
        customer_address: finalCustomer.address || "",
        subtotal: preview.subtotal,
        discount: preview.discount,
        total: preview.total,
        total_cost: preview.totalCost,
        total_profit: preview.profit,
        payment_method: paymentMethodText,
        note,
        created_at: new Date().toISOString(),
      };

      if (isTrial) {
        const nextProducts = workingProducts.map((p) =>
          p.id === finalProduct!.id ? { ...p, stock_qty: newStock } : p
        );

        const nextInvoices = [printableRecord, ...invoices];

        saveStockValue(finalProduct.id, newStock);
        setProducts(nextProducts);
        setInvoices(nextInvoices);
        setLastPrintableInvoice(printableRecord);
        setLastPrintableProductName(finalProduct.name);

        saveTrialData(workingCustomers, nextProducts, nextInvoices);
        addTrialTransaction(preview.total, finalCustomer, finalProduct, invoiceNo);

        setMsg(t.trialSuccess);
        setMode("list");
        setLoading(false);
        return;
      }

      const invoiceResult = await insertInvoiceWithFallback(finalCustomer);
      const invoiceData = invoiceResult.data;
      lhdnSkipped = invoiceResult.lhdnSkipped;

      await insertInvoiceItemSafe(invoiceData.id, finalProduct);
      await updateProductStockSafe(finalProduct.id, newStock);
      await insertTransactionSafe(invoiceData.id, finalCustomer, finalProduct);

      const savedRecord: InvoiceRecord = {
        ...printableRecord,
        ...invoiceData,
        invoice_date: invoiceData.invoice_date || invoiceDate,
        due_date: invoiceData.due_date || dueDate,
        status: invoiceData.status || status,
        customer_name: invoiceData.customer_name || finalCustomer.name,
        customer_phone: invoiceData.customer_phone || finalCustomer.phone || "",
        customer_company: invoiceData.customer_company || finalCustomer.company_name || "",
        customer_address: invoiceData.customer_address || finalCustomer.address || "",
        payment_method: invoiceData.payment_method || paymentMethodText,
        subtotal: invoiceData.subtotal ?? preview.subtotal,
        discount: invoiceData.discount ?? preview.discount,
        total: invoiceData.total ?? preview.total,
        total_cost: invoiceData.total_cost ?? preview.totalCost,
        total_profit: invoiceData.total_profit ?? preview.profit,
        created_at: invoiceData.created_at || printableRecord.created_at,
      };

      setInvoices((prev) => [savedRecord, ...prev]);
      setLastPrintableInvoice(savedRecord);
      setLastPrintableProductName(finalProduct.name);

      await loadProducts(userId);

      setMsg(lhdnSkipped ? t.lhdnSkipped : t.success);
      setMode("list");
    } catch (error: any) {
      setMsg(t.fail + error.message);
    }

    setLoading(false);
  }

  async function saveEditedInvoice() {
    if (!editInvoiceId) return;

    setLoading(true);

    const updatedData: Partial<InvoiceRecord> = {
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      due_date: dueDate,
      status,
      payment_method: paymentMethodText,
      customer_name: newCustomerName,
      customer_phone: newCustomerPhone,
      customer_company: newCustomerCompany,
      customer_address: newCustomerAddress,
      subtotal: preview.subtotal,
      discount: preview.discount,
      total: preview.total,
      total_cost: preview.totalCost,
      total_profit: preview.profit,
      note,
    };

    if (isTrial) {
      const next = invoices.map((inv) =>
        inv.id === editInvoiceId ? { ...inv, ...updatedData } : inv
      );

      setInvoices(next);
      localStorage.setItem(TRIAL_INVOICES_KEY, JSON.stringify(next));
      setMsg(t.saved);
      setMode("list");
      setEditInvoiceId(null);
      setLoading(false);
      return;
    }

    const fullUpdate = await supabase
      .from("invoices")
      .update(updatedData)
      .eq("id", editInvoiceId);

    if (fullUpdate.error && isSchemaColumnError(fullUpdate.error)) {
      const basicUpdate = await supabase
        .from("invoices")
        .update({
          invoice_no: invoiceNo,
          customer_name: newCustomerName,
          subtotal: preview.subtotal,
          total: preview.total,
          total_cost: preview.totalCost,
          total_profit: preview.profit,
          note,
        })
        .eq("id", editInvoiceId);

      if (basicUpdate.error) {
        setMsg(t.fail + basicUpdate.error.message);
        setLoading(false);
        return;
      }
    } else if (fullUpdate.error) {
      setMsg(t.fail + fullUpdate.error.message);
      setLoading(false);
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === editInvoiceId ? { ...inv, ...updatedData } : inv))
    );

    setMsg(t.saved);
    setMode("list");
    setEditInvoiceId(null);
    setLoading(false);
  }

  function startEditInvoice(inv: InvoiceRecord) {
    const matchedPayment = paymentOptions.find(
      (p) => p.id === inv.payment_method || p.name === inv.payment_method
    );

    if (matchedPayment) {
      setPaymentMethod(matchedPayment.id);
    } else if (inv.payment_method) {
      const extraPayment: PaymentOption = {
        id: makeId("pay"),
        name: inv.payment_method,
      };

      const next = [...paymentOptions, extraPayment];
      savePaymentOptions(next);
      setPaymentMethod(extraPayment.id);
    }

    setEditInvoiceId(inv.id);
    setInvoiceNo(inv.invoice_no || makeInvoiceNo());
    setInvoiceDate(inv.invoice_date || today);
    setDueDate(inv.due_date || today);
    setStatus(inv.status || "sent");
    setCustomerMode("new");
    setNewCustomerName(inv.customer_name || "");
    setNewCustomerPhone(inv.customer_phone || "");
    setNewCustomerCompany(inv.customer_company || "");
    setNewCustomerAddress(inv.customer_address || "");
    setProductMode("new");
    setNewProductName(getProductNameFromInvoice(inv) || "Invoice Item");
    setNewProductPrice(String(inv.subtotal || inv.total || 0));
    setNewProductCost(String(inv.total_cost || 0));
    setNewProductStock("999999");
    setQty("1");
    setExtraDiscount(String(inv.discount || 0));
    setNote(inv.note || "");
    setMode("new");
  }

  async function deleteInvoice(inv: InvoiceRecord) {
    if (!confirm(t.confirmDelete)) return;

    if (isTrial) {
      const next = invoices.filter((x) => x.id !== inv.id);
      setInvoices(next);
      localStorage.setItem(TRIAL_INVOICES_KEY, JSON.stringify(next));
      setMsg(t.saved);
      return;
    }

    await supabase.from("invoice_items").delete().eq("invoice_id", inv.id);
    const { error } = await supabase.from("invoices").delete().eq("id", inv.id);

    if (error) {
      setMsg(t.fail + error.message);
      return;
    }

    setInvoices((prev) => prev.filter((x) => x.id !== inv.id));
    setMsg(t.saved);
  }

  function getProductNameFromInvoice(inv: InvoiceRecord) {
    const noteText = inv.note || "";
    if (noteText.includes("｜")) {
      const parts = noteText.split("｜");
      return parts[2] || "Invoice Item";
    }

    return "Invoice Item";
  }

  function setPrintable(record?: InvoiceRecord) {
    if (record) {
      setLastPrintableInvoice(record);
      setLastPrintableProductName(getProductNameFromInvoice(record));
    } else {
      setLastPrintableInvoice({
        id: "",
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status,
        customer_name: activeCustomerForPreview.name,
        customer_phone: activeCustomerForPreview.phone,
        customer_company: activeCustomerForPreview.company_name,
        customer_address: activeCustomerForPreview.address,
        subtotal: preview.subtotal,
        discount: preview.discount,
        total: preview.total,
        total_cost: preview.totalCost,
        total_profit: preview.profit,
        payment_method: paymentMethodText,
        note,
      });
      setLastPrintableProductName(activeProductForPreview.name);
    }
  }

  function printInvoice(record?: InvoiceRecord) {
    setPrintable(record);
    setTimeout(() => window.print(), 150);
  }

  function downloadPdf(record?: InvoiceRecord) {
    setPrintable(record);
    setTimeout(() => window.print(), 150);
  }

  function buildShareText(record?: InvoiceRecord) {
    const invNo = record?.invoice_no || invoiceNo;
    const customerName = record?.customer_name || activeCustomerForPreview.name;
    const total = Number(record?.total ?? preview.total).toFixed(2);
    const method = record?.payment_method || paymentMethodText;
    const pay = getPaymentForInvoice(record);

    const qrText =
      pay?.qrCodeUrl && !pay.qrCodeUrl.startsWith("data:")
        ? `QR Code：${pay.qrCodeUrl}`
        : "";

    const paymentDetailText = [
      pay?.bankAccount ? `${t.paymentBankAccount}：${pay.bankAccount}` : "",
      pay?.receiverName ? `${t.paymentReceiverName}：${pay.receiverName}` : "",
      pay?.link ? `Payment Link：${pay.link}` : "",
      qrText,
    ]
      .filter(Boolean)
      .join("%0A");

    return `Invoice ${invNo}%0A${t.customerName}：${customerName}%0A${t.total}：RM ${total}%0A${t.paymentMethod}：${method}${
      paymentDetailText ? `%0A${paymentDetailText}` : ""
    }`;
  }

  function sendWhatsAppPdf(record?: InvoiceRecord) {
    setPrintable(record);

    const text = `${buildShareText(record)}%0A%0A请先保存PDF，再发送给客户。`;

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        window.location.href = `https://wa.me/?text=${text}`;
      }, 800);
    }, 150);
  }

  function shareInvoice(record: InvoiceRecord) {
    setPrintable(record);

    const plainText = decodeURIComponent(buildShareText(record).replaceAll("%0A", "\n"));

    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator
        .share({
          title: `Invoice ${record.invoice_no}`,
          text: plainText,
        })
        .then(() => setMsg(t.copied))
        .catch(() => {});
      return;
    }

    setMsg(t.copied);
  }

  function goBack() {
    const q = new URLSearchParams(window.location.search);
    const modeParam = q.get("mode");
    window.location.href =
      modeParam === "trial"
        ? `/dashboard?mode=trial&lang=${lang}`
        : `/dashboard?lang=${lang}`;
  }

  function openNewInvoice() {
    setEditInvoiceId(null);
    setInvoiceNo(makeInvoiceNo());
    setInvoiceDate(today);
    setDueDate(today);
    setStatus("sent");
    setCustomerMode("select");
    setProductMode("select");
    setCustomerId("");
    setProductId("");
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerCompany("");
    setNewCustomerAddress("");
    setNewProductName("");
    setNewProductPrice("");
    setNewProductCost("");
    setNewProductStock("");
    setQty("1");
    setExtraDiscount("0");
    setNote("");
    setMsg("");
    setShowPaymentAdd(false);
    setMode("new");
  }

  function statusText(value?: string | null) {
    if (value === "draft") return t.draft;
    if (value === "paid") return t.paid;
    if (value === "cancelled") return t.cancelled;
    return t.sent;
  }

  const printableInvoice = lastPrintableInvoice || {
    id: "",
    invoice_no: invoiceNo,
    invoice_date: invoiceDate,
    due_date: dueDate,
    status,
    customer_name: activeCustomerForPreview.name,
    customer_phone: activeCustomerForPreview.phone,
    customer_company: activeCustomerForPreview.company_name,
    customer_address: activeCustomerForPreview.address,
    subtotal: preview.subtotal,
    discount: preview.discount,
    total: preview.total,
    total_cost: preview.totalCost,
    total_profit: preview.profit,
    payment_method: paymentMethodText,
    note,
  };

  const printableProductName =
    lastPrintableProductName || activeProductForPreview.name || "-";

  const currentPreviewInvoice: InvoiceRecord = {
    id: "",
    invoice_no: invoiceNo,
    invoice_date: invoiceDate,
    due_date: dueDate,
    status,
    customer_name: activeCustomerForPreview.name,
    customer_phone: activeCustomerForPreview.phone,
    customer_company: activeCustomerForPreview.company_name,
    customer_address: activeCustomerForPreview.address,
    subtotal: preview.subtotal,
    discount: preview.discount,
    total: preview.total,
    total_cost: preview.totalCost,
    total_profit: preview.profit,
    payment_method: paymentMethodText,
    note,
  };

  function renderOfficialInvoice(inv: InvoiceRecord, productName: string) {
    const subtotal = Number(inv.subtotal || 0);
    const discount = Number(inv.discount || 0);
    const total = Number(inv.total || 0);
    const totalCost = Number(inv.total_cost || 0);
    const profit = Number(inv.total_profit ?? total - totalCost);
    const isSavedRecord = Boolean(inv.id);
    const displayQty = isSavedRecord ? 1 : preview.finalQty;
    const displayPrice = isSavedRecord ? subtotal : preview.price;
    const pay = getPaymentForInvoice(inv);

    return (
      <div style={officialInvoiceStyle}>
        <div style={officialHeaderStyle}>
          <div style={officialCompanyBlockStyle}>
            {companyLogoUrl ? (
              <img src={companyLogoUrl} style={officialLogoStyle} />
            ) : (
              <div style={officialLogoPlaceholderStyle}>LOGO</div>
            )}

            <div>
              <h2 style={officialCompanyNameStyle}>{companyName || "-"}</h2>
              <div>SSM：{companyRegNo || "-"}</div>
              <div>{t.phone}：{companyPhone || "-"}</div>
              <div>{t.address}：{companyAddress || "-"}</div>
            </div>
          </div>

          <div style={officialInvoiceTitleBlockStyle}>
            <div style={officialInvoiceWordStyle}>INVOICE</div>
            <div style={officialInvoiceNoStyle}>{inv.invoice_no}</div>
          </div>
        </div>

        <div style={officialLineStyle} />

        <div style={officialInfoGridStyle}>
          <div style={officialInfoBoxStyle}>
            <strong>{t.customerInfo}</strong>
            <div>{inv.customer_name || "-"}</div>
            <div>{inv.customer_phone || "-"}</div>
            <div>{inv.customer_company || "-"}</div>
            <div>{inv.customer_address || "-"}</div>
          </div>

          <div style={officialInfoBoxStyle}>
            <div style={officialInfoRowStyle}>
              <span>{t.invoiceDate}</span>
              <strong>{inv.invoice_date || "-"}</strong>
            </div>

            <div style={officialInfoRowStyle}>
              <span>{t.dueDate}</span>
              <strong>{inv.due_date || "-"}</strong>
            </div>

            <div style={officialInfoRowStyle}>
              <span>{t.status}</span>
              <strong>{statusText(inv.status)}</strong>
            </div>

            <div style={officialPaymentMethodRowStyle}>
              <span>{t.paymentMethod}</span>

              <div style={officialPaymentInlineStyle}>
                <strong>{inv.payment_method || "-"}</strong>

                {pay?.bankAccount ? (
                  <div style={officialPaymentDetailTextStyle}>
                    <div>{t.paymentBankAccount}：{pay.bankAccount}</div>
                  </div>
                ) : null}

                {pay?.receiverName ? (
                  <div style={officialPaymentDetailTextStyle}>
                    <div>{t.paymentReceiverName}：{pay.receiverName}</div>
                  </div>
                ) : null}

                {pay?.link ? (
                  <div style={officialPaymentDetailTextStyle}>{pay.link}</div>
                ) : null}

                {pay?.qrCodeUrl ? (
                  <img src={pay.qrCodeUrl} style={officialInlineQrStyle} />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <table style={officialTableStyle}>
          <thead>
            <tr>
              <th style={officialThStyle}>{t.previewProductName}</th>
              <th style={officialThStyle}>{t.previewQty}</th>
              <th style={officialThStyle}>{t.previewPrice}</th>
              <th style={officialThStyle}>{t.previewDiscount}</th>
              <th style={officialThStyle}>{t.previewTotal}</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={officialTdStyle}>{productName || "-"}</td>
              <td style={officialTdStyle}>{displayQty}</td>
              <td style={officialTdStyle}>RM {displayPrice.toFixed(2)}</td>
              <td style={officialTdStyle}>RM {discount.toFixed(2)}</td>
              <td style={officialTdStyle}>RM {total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div style={officialSummaryStyle}>
          <div style={officialSummaryRowStyle}>
            <span>{t.subtotal}</span>
            <strong>RM {subtotal.toFixed(2)}</strong>
          </div>
          <div style={officialSummaryRowStyle}>
            <span>{t.discount}</span>
            <strong>RM {discount.toFixed(2)}</strong>
          </div>
          <div style={officialTotalRowStyle}>
            <span>{t.total}</span>
            <strong>RM {total.toFixed(2)}</strong>
          </div>
          <div style={officialProfitRowStyle}>
            <span>{t.profit}</span>
            <strong>RM {profit.toFixed(2)}</strong>
          </div>
        </div>

        {inv.note ? <div style={officialNoteStyle}>Note：{inv.note}</div> : null}
      </div>
    );
  }

  return (
    <main style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #printInvoiceArea,
          #printInvoiceArea * {
            visibility: visible !important;
          }

          #printInvoiceArea {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 12mm !important;
            margin: 0 !important;
            background: white !important;
            color: #111827 !important;
            box-shadow: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print" style={topRowStyle}>
        <button
          onClick={goBack}
          style={{ ...backBtn, borderColor: theme.border, color: theme.accent }}
        >
          ← {t.back}
        </button>

        <div style={topRightWrapStyle}>
          <select
            value={themeKey}
            onChange={(e) => switchTheme(e.target.value as ThemeKey)}
            style={{
              ...themeSelectStyle,
              borderColor: theme.border,
              color: theme.inputText,
              background: theme.inputBg,
            }}
          >
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
              <option key={key} value={key}>
                {THEMES[key].name}
              </option>
            ))}
          </select>

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
      </div>

      {mode === "list" && (
        <section
          className="no-print"
          style={{
            ...cardStyle,
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div style={listHeaderStyle}>
            <div>
              <h1 style={{ ...titleStyle, color: theme.accent }}>{t.title}</h1>
              <p style={{ ...descStyle, color: theme.muted }}>{t.latestInvoices}</p>
            </div>

            <button onClick={openNewInvoice} style={{ ...plusBtnStyle, background: theme.accent }}>
              +
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={themedInputStyle}
          />

          {filteredInvoices.length === 0 ? (
            <p style={{ ...emptyStyle, color: theme.muted }}>{t.noInvoice}</p>
          ) : (
            <div style={invoiceListStyle}>
              {filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    ...invoiceItemStyle,
                    background: theme.itemBg,
                    color: theme.panelText,
                    borderColor: theme.border,
                    boxShadow: theme.glow,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{inv.invoice_no}</strong>

                    <div style={{ ...mutedTextStyle, color: theme.muted }}>
                      {inv.customer_name || "-"}{" "}
                      {inv.customer_company ? `｜${inv.customer_company}` : ""}
                    </div>

                    <div style={{ ...mutedTextStyle, color: theme.muted }}>
                      {t.recordDateTime}：{formatDateTime(inv.created_at, inv.invoice_date)}
                    </div>

                    <div style={{ ...mutedTextStyle, color: theme.muted }}>
                      {t.phone}：{inv.customer_phone || "-"}
                    </div>

                    <div style={recordActionRowStyle}>
                      <button onClick={() => startEditInvoice(inv)} style={recordEditBtnStyle}>
                        {t.edit}
                      </button>

                      <button onClick={() => deleteInvoice(inv)} style={recordDeleteBtnStyle}>
                        {t.delete}
                      </button>

                      <button onClick={() => sendWhatsAppPdf(inv)} style={recordWhatsappBtnStyle}>
                        {t.whatsapp}
                      </button>

                      <button onClick={() => shareInvoice(inv)} style={recordShareBtnStyle}>
                        {t.share}
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <strong style={{ color: theme.accent }}>
                      RM {Number(inv.total || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {msg ? <p style={{ ...msgStyle, color: theme.accent }}>{msg}</p> : null}
        </section>
      )}

      {mode === "new" && (
        <section
          className="no-print"
          style={{
            ...cardStyle,
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <button
            onClick={() => setMode("list")}
            style={{ ...backBtn, borderColor: theme.border, color: theme.accent }}
          >
            ← {t.back}
          </button>

          <h1 style={{ ...titleStyle, color: theme.accent }}>
            {editInvoiceId ? t.edit : t.createTitle}
          </h1>
          <p style={{ ...descStyle, color: theme.muted }}>{t.desc}</p>

          <div
            style={{
              ...invoiceNoBox,
              ...themedPanelStyle,
            }}
          >
            <strong>Invoice No：</strong> {invoiceNo}
          </div>

          <h3>{t.invoiceInfo}</h3>

          <div style={formGrid}>
            <label style={{ ...labelStyle, color: theme.accent }}>{t.invoiceDate}</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              style={{ ...themedInputStyle, maxWidth: 220 }}
            />

            <label style={{ ...labelStyle, color: theme.accent }}>{t.dueDate}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ ...themedInputStyle, maxWidth: 220 }}
            />

            <label style={{ ...labelStyle, color: theme.accent }}>{t.status}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={themedInputStyle}
            >
              <option value="draft">{t.draft}</option>
              <option value="sent">{t.sent}</option>
              <option value="paid">{t.paid}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>

            <label style={{ ...labelStyle, color: theme.accent }}>{t.paymentMethod}</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={themedInputStyle}
            >
              {paymentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowPaymentAdd((v) => !v)}
              style={{
                ...paymentToggleBtnStyle,
                borderColor: theme.border,
                color: showPaymentAdd ? "#fff" : theme.accent,
                background: showPaymentAdd ? theme.accent : theme.inputBg,
              }}
            >
              {showPaymentAdd ? t.closePayment : t.addPayment}
            </button>

            {showPaymentAdd && (
              <div
                style={{
                  ...paymentAddBoxStyle,
                  borderColor: theme.border,
                  background: theme.panelBg,
                  color: theme.panelText,
                }}
              >
                <input
                  value={newPaymentName}
                  onChange={(e) => setNewPaymentName(e.target.value)}
                  placeholder={t.paymentName}
                  style={themedInputStyle}
                />

                <input
                  value={newPaymentBankAccount}
                  onChange={(e) => setNewPaymentBankAccount(e.target.value)}
                  placeholder={t.paymentBankAccount}
                  style={themedInputStyle}
                />

                <input
                  value={newPaymentReceiverName}
                  onChange={(e) => setNewPaymentReceiverName(e.target.value)}
                  placeholder={t.paymentReceiverName}
                  style={themedInputStyle}
                />

                <input
                  value={newPaymentLink}
                  onChange={(e) => setNewPaymentLink(e.target.value)}
                  placeholder={t.paymentLink}
                  style={themedInputStyle}
                />

                <input
                  value={newPaymentQr}
                  onChange={(e) => setNewPaymentQr(e.target.value)}
                  placeholder={t.paymentQr}
                  style={themedInputStyle}
                />

                <label
                  style={{
                    ...uploadQrBtnStyle,
                    borderColor: theme.border,
                    color: theme.accent,
                    background: theme.inputBg,
                  }}
                >
                  {t.uploadQr}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadPaymentQr}
                    style={{ display: "none" }}
                  />
                </label>

                {newPaymentQr ? (
                  <img src={newPaymentQr} style={qrPreviewStyle} />
                ) : null}

                <button onClick={addPaymentOption} style={{ ...addBtnStyle, background: theme.accent }}>
                  {t.addPayment}
                </button>
              </div>
            )}

            <div style={paymentChipWrapStyle}>
              {paymentOptions.map((p) => (
                <div
                  key={p.id}
                  style={{
                    ...paymentChipStyle,
                    borderColor: theme.border,
                    color: theme.accent,
                    background: theme.inputBg,
                  }}
                >
                  <span>{p.name}</span>
                  <button
                    onClick={() => deletePaymentOption(p.id)}
                    style={{ ...paymentChipDeleteStyle, background: theme.accent }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <label style={{ ...labelStyle, color: theme.accent }}>{t.note}</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.note}
              style={themedInputStyle}
            />
          </div>

          <h3>{t.companyInfo}</h3>

          <div
            style={{
              ...companyBox,
              ...themedPanelStyle,
            }}
          >
            {companyLogoUrl ? (
              <img src={companyLogoUrl} style={logoStyle} />
            ) : (
              <div style={logoPlaceholder}>LOGO</div>
            )}
            <div style={{ flex: 1, color: theme.panelText }}>
              <strong>{companyName}</strong>
              <div>SSM：{companyRegNo || "-"}</div>
              <div>{t.phone}：{companyPhone || "-"}</div>
              <div>{t.address}：{companyAddress || "-"}</div>
            </div>

            <button
              onClick={() => setShowCompanyEdit((v) => !v)}
              style={{ ...editBtnStyle, borderColor: theme.border, color: theme.accent }}
            >
              {t.editCompany}
            </button>
          </div>

          {showCompanyEdit && (
            <div
              style={{
                ...companyEditBoxStyle,
                borderColor: theme.border,
                background: theme.panelBg,
                color: theme.panelText,
              }}
            >
              <input
                placeholder={t.companyLogoUrl}
                value={companyLogoUrl}
                onChange={(e) => setCompanyLogoUrl(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.companyName}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.companyRegNo}
                value={companyRegNo}
                onChange={(e) => setCompanyRegNo(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.phone}
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.address}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                style={themedInputStyle}
              />
              <button onClick={saveCompanyInfo} style={{ ...submitSmallBtnStyle, background: theme.accent }}>
                {t.saveCompany}
              </button>
            </div>
          )}

          <h3>{t.customerInfo}</h3>

          <div style={switchRow}>
            <button
              onClick={() => setCustomerMode("select")}
              style={modeBtn(customerMode === "select", theme)}
            >
              {t.selectCustomer}
            </button>
            <button
              onClick={() => setCustomerMode("new")}
              style={modeBtn(customerMode === "new", theme)}
            >
              {t.newCustomer}
            </button>
          </div>

          {customerMode === "select" ? (
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={themedInputStyle}
            >
              <option value="">{t.chooseCustomer}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company_name ? `｜${c.company_name}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <div style={formGrid}>
              <input
                placeholder={t.customerName}
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.customerPhone}
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.customerCompany}
                value={newCustomerCompany}
                onChange={(e) => setNewCustomerCompany(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.customerAddress}
                value={newCustomerAddress}
                onChange={(e) => setNewCustomerAddress(e.target.value)}
                style={themedInputStyle}
              />
            </div>
          )}

          <h3>{t.productInfo}</h3>

          <div style={switchRow}>
            <button
              onClick={() => setProductMode("select")}
              style={modeBtn(productMode === "select", theme)}
            >
              {t.selectProduct}
            </button>
            <button
              onClick={() => setProductMode("new")}
              style={modeBtn(productMode === "new", theme)}
            >
              {t.newProduct}
            </button>
          </div>

          {productMode === "select" ? (
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              style={themedInputStyle}
            >
              <option value="">{t.chooseProduct}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}｜{t.price} {Number(p.price).toFixed(2)}｜{t.cost}{" "}
                  {Number(p.cost).toFixed(2)}｜{t.stock} {Number(p.stock_qty || 0)}
                </option>
              ))}
            </select>
          ) : (
            <div style={formGrid}>
              <input
                placeholder={t.productName}
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.price}
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.cost}
                value={newProductCost}
                onChange={(e) => setNewProductCost(e.target.value)}
                style={themedInputStyle}
              />
              <input
                placeholder={t.stock}
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                style={themedInputStyle}
              />
            </div>
          )}

          <h3>{t.invoiceContent}</h3>

          <div style={formGrid}>
            <label style={{ ...labelStyle, color: theme.accent }}>{t.qty}</label>
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              style={themedInputStyle}
            />

            <label style={{ ...labelStyle, color: theme.accent }}>{t.extraDiscount}</label>
            <input
              value={extraDiscount}
              onChange={(e) => setExtraDiscount(e.target.value)}
              style={themedInputStyle}
            />
          </div>

          <h3>{t.lhdn}</h3>

          <div style={formGrid}>
            <input placeholder="Supplier TIN" value={supplierTin} onChange={(e) => setSupplierTin(e.target.value)} style={themedInputStyle} />
            <input placeholder="Buyer TIN" value={buyerTin} onChange={(e) => setBuyerTin(e.target.value)} style={themedInputStyle} />
            <input placeholder="SST No" value={sstNo} onChange={(e) => setSstNo(e.target.value)} style={themedInputStyle} />
            <input placeholder="MSIC Code" value={msicCode} onChange={(e) => setMsicCode(e.target.value)} style={themedInputStyle} />
            <input placeholder="e-Invoice UUID" value={einvoiceUuid} onChange={(e) => setEinvoiceUuid(e.target.value)} style={themedInputStyle} />
            <input placeholder="Validation Status" value={validationStatus} onChange={(e) => setValidationStatus(e.target.value)} style={themedInputStyle} />
            <input placeholder="QR Code URL" value={qrCodeUrl} onChange={(e) => setQrCodeUrl(e.target.value)} style={themedInputStyle} />
            <input placeholder="MyInvois Submission Status" value={myinvoisStatus} onChange={(e) => setMyinvoisStatus(e.target.value)} style={themedInputStyle} />
          </div>

          <h3>{t.preview}</h3>
          <div
            style={{
              ...screenPreviewWrapStyle,
              borderColor: theme.border,
              boxShadow: theme.glow,
            }}
          >
            <div style={screenInvoiceInnerStyle}>
              {renderOfficialInvoice(currentPreviewInvoice, activeProductForPreview.name)}
            </div>
          </div>

          <button
            onClick={createInvoice}
            disabled={loading}
            style={{ ...submitBtn, background: theme.accent }}
          >
            {loading ? t.generating : editInvoiceId ? t.saveEdit : t.generate}
          </button>

          <div style={actionRow}>
            <button
              onClick={() => printInvoice()}
              style={{ ...secondaryBtn, borderColor: theme.border, color: theme.accent }}
            >
              {t.print}
            </button>
            <button
              onClick={() => downloadPdf()}
              style={{ ...secondaryBtn, borderColor: theme.border, color: theme.accent }}
            >
              {t.pdf}
            </button>
            <button onClick={() => sendWhatsAppPdf()} style={whatsappBtn}>
              {t.whatsappPdf}
            </button>
          </div>

          {msg ? <p style={{ ...msgStyle, color: theme.accent }}>{msg}</p> : null}
        </section>
      )}

      <section id="printInvoiceArea" style={printAreaStyle}>
        {renderOfficialInvoice(printableInvoice, printableProductName)}
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 16,
  fontFamily: "sans-serif",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const topRightWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
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

const themeSelectStyle: CSSProperties = {
  border: "2px solid",
  borderRadius: 999,
  padding: "8px 10px",
  fontWeight: 900,
};

const backBtn: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 900,
};

const cardStyle: CSSProperties = {
  border: "3px solid",
  borderRadius: 24,
  padding: 20,
};

const listHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const plusBtnStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "999px",
  border: "none",
  color: "#fff",
  fontSize: 28,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 30,
};

const descStyle: CSSProperties = {
  marginBottom: 20,
};

const invoiceNoBox: CSSProperties = {
  border: "2px solid",
  borderRadius: 14,
  padding: 12,
  marginBottom: 20,
};

const invoiceListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const invoiceItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  border: "2px solid",
  borderRadius: 16,
  padding: 14,
};

const mutedTextStyle: CSSProperties = {
  fontSize: 13,
  marginTop: 4,
};

const recordActionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 12,
};

const recordEditBtnStyle: CSSProperties = {
  border: "none",
  background: "#0f766e",
  color: "#fff",
  borderRadius: 8,
  padding: "6px 9px",
  fontSize: 12,
  fontWeight: 900,
};

const recordDeleteBtnStyle: CSSProperties = {
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: 8,
  padding: "6px 9px",
  fontSize: 12,
  fontWeight: 900,
};

const recordWhatsappBtnStyle: CSSProperties = {
  border: "none",
  background: "#25D366",
  color: "#fff",
  borderRadius: 8,
  padding: "6px 8px",
  fontSize: 11,
  fontWeight: 900,
};

const recordShareBtnStyle: CSSProperties = {
  border: "1px solid #0f766e",
  background: "#fff",
  color: "#0f766e",
  borderRadius: 8,
  padding: "6px 9px",
  fontSize: 12,
  fontWeight: 900,
};

const emptyStyle: CSSProperties = {
  fontWeight: 800,
};

const switchRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 12,
};

const modeBtn = (active: boolean, theme: any): CSSProperties => ({
  padding: "12px",
  borderRadius: 12,
  border: `2px solid ${theme.accent}`,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
  fontWeight: 900,
});

const formGrid: CSSProperties = {
  display: "grid",
  gap: 6,
};

const labelStyle: CSSProperties = {
  fontWeight: 900,
  marginTop: 6,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  borderRadius: 12,
  border: "2px solid",
  fontSize: 16,
  marginBottom: 8,
};

const paymentToggleBtnStyle: CSSProperties = {
  width: "100%",
  border: "2px solid",
  borderRadius: 12,
  padding: "12px 14px",
  fontWeight: 900,
  marginBottom: 10,
};

const paymentAddBoxStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  border: "1px dashed",
  borderRadius: 16,
  padding: 12,
  marginBottom: 10,
};

const uploadQrBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid",
  borderRadius: 12,
  padding: "12px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const qrPreviewStyle: CSSProperties = {
  width: 110,
  height: 110,
  objectFit: "contain",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  background: "#fff",
  padding: 6,
};

const addBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  borderRadius: 12,
  padding: "13px",
  fontWeight: 900,
};

const paymentChipWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 10,
};

const paymentChipStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid",
  borderRadius: 999,
  padding: "6px 10px",
  fontWeight: 800,
};

const paymentChipDeleteStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  width: 22,
  height: 22,
  borderRadius: "999px",
  fontWeight: 900,
};

const companyBox: CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  border: "2px solid",
  borderRadius: 16,
  padding: 14,
  flexWrap: "wrap",
};

const companyEditBoxStyle: CSSProperties = {
  marginTop: 12,
  border: "2px dashed",
  borderRadius: 16,
  padding: 14,
};

const logoStyle: CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: 12,
  objectFit: "cover",
};

const logoPlaceholder: CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: 12,
  background: "#ccfbf1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  color: "#0f766e",
};

const editBtnStyle: CSSProperties = {
  border: "2px solid",
  background: "#fff",
  borderRadius: 12,
  padding: "10px 12px",
  fontWeight: 900,
};

const submitSmallBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 14px",
  fontWeight: 900,
};

const submitBtn: CSSProperties = {
  width: "100%",
  marginTop: 18,
  padding: "14px",
  border: "none",
  borderRadius: 14,
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
};

const actionRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 10,
  marginTop: 12,
};

const secondaryBtn: CSSProperties = {
  padding: "12px",
  borderRadius: 12,
  border: "2px solid",
  background: "#fff",
  fontWeight: 900,
};

const whatsappBtn: CSSProperties = {
  padding: "12px",
  borderRadius: 12,
  border: "none",
  background: "#25D366",
  color: "#fff",
  fontWeight: 900,
};

const msgStyle: CSSProperties = {
  marginTop: 14,
  fontWeight: 900,
};

const screenPreviewWrapStyle: CSSProperties = {
  width: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  background: "#f8fafc",
  border: "2px solid",
  borderRadius: 18,
  padding: 14,
  boxSizing: "border-box",
};

const screenInvoiceInnerStyle: CSSProperties = {
  width: 780,
  minWidth: 780,
  maxWidth: "none",
};

const printAreaStyle: CSSProperties = {
  display: "block",
  width: "210mm",
  minHeight: "297mm",
  background: "#fff",
  color: "#111827",
  padding: "12mm",
  margin: "24px auto 0",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
  position: "absolute",
  left: "-9999px",
  top: 0,
};

const officialInvoiceStyle: CSSProperties = {
  background: "#fff",
  color: "#111827",
  padding: 22,
  boxSizing: "border-box",
  width: "100%",
  minHeight: 680,
  fontFamily: "Arial, sans-serif",
};

const officialHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 18,
};

const officialCompanyBlockStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  lineHeight: 1.5,
};

const officialLogoStyle: CSSProperties = {
  width: 64,
  height: 64,
  objectFit: "contain",
};

const officialLogoPlaceholderStyle: CSSProperties = {
  width: 64,
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0f766e",
  fontWeight: 900,
};

const officialCompanyNameStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
};

const officialInvoiceTitleBlockStyle: CSSProperties = {
  textAlign: "right",
};

const officialInvoiceWordStyle: CSSProperties = {
  color: "#0f766e",
  fontSize: 32,
  fontWeight: 900,
  letterSpacing: 1,
};

const officialInvoiceNoStyle: CSSProperties = {
  color: "#0f766e",
  fontSize: 14,
  marginTop: 6,
};

const officialLineStyle: CSSProperties = {
  height: 2,
  background: "#0f766e",
  margin: "18px 0",
};

const officialInfoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginBottom: 20,
};

const officialInfoBoxStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 14,
  minHeight: 120,
  lineHeight: 1.6,
};

const officialInfoRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "7px 0",
  borderBottom: "1px solid #e2e8f0",
};

const officialPaymentMethodRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: 12,
  padding: "7px 0",
};

const officialPaymentInlineStyle: CSSProperties = {
  textAlign: "right",
  lineHeight: 1.45,
};

const officialPaymentDetailTextStyle: CSSProperties = {
  marginTop: 4,
  whiteSpace: "pre-wrap",
  fontSize: 12,
  color: "#334155",
  fontWeight: 700,
};

const officialInlineQrStyle: CSSProperties = {
  width: 82,
  height: 82,
  objectFit: "contain",
  marginTop: 8,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: 4,
  background: "#fff",
};

const officialTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
};

const officialThStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  padding: "10px 8px",
  textAlign: "left",
  fontWeight: 900,
};

const officialTdStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  padding: "12px 8px",
};

const officialSummaryStyle: CSSProperties = {
  width: "58%",
  marginLeft: "auto",
  marginTop: 22,
};

const officialSummaryRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #e2e8f0",
};

const officialTotalRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  color: "#0f766e",
  fontSize: 22,
  fontWeight: 900,
};

const officialProfitRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  color: "#16a34a",
  fontSize: 18,
  fontWeight: 900,
};

const officialNoteStyle: CSSProperties = {
  marginTop: 28,
  color: "#64748b",
};
