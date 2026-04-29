"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type Mode = "list" | "new";
type ThemeKey = "pink" | "blackGold" | "lightRed" | "nature" | "sky" | "deepTeal";
type ChargeMode = "%" | "RM";

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

type InvoiceItem = {
  id: string;
  productMode: "select" | "new";
  productId: string;
  newProductName: string;
  newProductPrice: string;
  newProductCost: string;
  newProductStock: string;
  qty: string;
  discount: string;
};

type SignatureOption = {
  id: string;
  name: string;
  signatureText: string;
  signatureImageUrl: string;
};

type ChargeInput = {
  mode: ChargeMode;
  value: string;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";

const PAYMENT_OPTIONS_KEY = "smartacctg_payment_options";
const SIGNATURE_OPTIONS_KEY = "smartacctg_signature_options";
const LANG_KEY = "smartacctg_lang";
const THEME_KEY = "smartacctg_theme";
const PRODUCT_STOCK_MAP_KEY = "smartacctg_product_stock_map";

const today = () => new Date().toISOString().slice(0, 10);

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
    name: "可爱粉色",
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
    name: "黑金商务",
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
    name: "可爱浅红",
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
    name: "风景自然系",
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
    name: "天空蓝",
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

const TXT = {
  zh: {
    dashboardBack: "返回控制台",
    close: "关闭",
    title: "发票记录",
    newInvoice: "新发票",
    edit: "编辑",
    delete: "删除",
    share: "分享",
    whatsapp: "WhatsApp",
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
    addPayment: "+ 新增付款方式",
    savePayment: "保存付款方式",
    deletePayment: "删除付款方式",
    paymentName: "付款名称，例如 MAYBANK / DuitNow QR",
    paymentBankAccount: "银行户口",
    paymentReceiverName: "收款名字",
    paymentLink: "付款链接，例如 Billplz / TNG Link",
    paymentQr: "QR Code 图片 URL",
    uploadQr: "上传 QR 图",
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
    addProductLine: "➕ 添加产品",
    removeProductLine: "➖ 删除产品",
    selectProduct: "从产品管理选择",
    newProduct: "新增产品",
    chooseProduct: "请选择产品",
    productName: "产品名称",
    price: "售价 RM",
    cost: "成本 RM",
    stock: "库存数量",
    qty: "数量",
    lineDiscount: "产品折扣 RM",
    extraCharges: "5. 折扣 / SST / 服务费 / 手续费",
    chargeValue: "数值，可填负数",
    sst: "SST",
    serviceFee: "服务费",
    handlingFee: "手续费",
    chargeDiscount: "折扣",
    yourSignature: "6. 你的签名",
    signatureText: "签名文字，例如：NK DIGITAL HUB",
    signatureImageUrl: "签名图片 URL",
    uploadSignature: "上传签名图",
    handwriteSignature: "手写签名",
    saveSignature: "保存签名",
    deleteSignature: "删除已保存签名",
    chooseSignature: "选择已保存签名",
    noSignature: "不选择签名",
    customerSignature: "客户签名",
    issuerSignNotice: "这里是你的签名，确认后会放进「签名图片 URL」，可以再按保存签名。",
    customerSignNotice: "你签名是不会保存的，只在发票右下侧会显示",
    confirmSignature: "确认",
    clearSignature: "清除",
    preview: "正式发票预览",
    issuerSignature: "开发票人签名",
    customerSignatureLabel: "客户签名",
    subtotal: "小计",
    discount: "折扣",
    taxableTotal: "折扣后金额",
    total: "总额",
    profit: "差价赚 / 预计利润",
    generate: "生成发票 + 加入记账 + 扣库存",
    generating: "生成中...",
    print: "列印",
    pdf: "下载 PDF",
    whatsappPdf: "WhatsApp发送PDF",
    needCustomer: "请选择客户",
    needNewCustomer: "请填写新客户名称",
    needProduct: "请最少添加一个产品",
    qtyError: "数量必须大过 0",
    stockNotEnough: "库存不足，目前库存：",
    success: "发票已生成，已自动加入记账，并已扣除库存",
    trialSuccess: "试用版发票已生成，已加入记账，并已扣库存",
    fail: "生成失败：",
    productNote: "由发票系统新增",
    saved: "保存成功",
    copied: "已准备分享内容",
    previewProductName: "产品名称",
    previewQty: "数量",
    previewPrice: "售价 RM",
    previewDiscount: "折扣",
    previewTotal: "总额",
  },
  en: {
    dashboardBack: "Back Dashboard",
    close: "Close",
    title: "Invoice Records",
    newInvoice: "New Invoice",
    edit: "Edit",
    delete: "Delete",
    share: "Share",
    whatsapp: "WhatsApp",
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
    addPayment: "+ Add Payment Method",
    savePayment: "Save Payment",
    deletePayment: "Delete Payment",
    paymentName: "Payment name",
    paymentBankAccount: "Bank Account",
    paymentReceiverName: "Receiver Name",
    paymentLink: "Payment Link",
    paymentQr: "QR Code Image URL",
    uploadQr: "Upload QR Image",
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
    addProductLine: "➕ Add Product",
    removeProductLine: "➖ Remove Product",
    selectProduct: "Select from Products",
    newProduct: "Add Product",
    chooseProduct: "Please select product",
    productName: "Product Name",
    price: "Selling Price RM",
    cost: "Cost RM",
    stock: "Stock Quantity",
    qty: "Quantity",
    lineDiscount: "Product Discount RM",
    extraCharges: "5. Discount / SST / Service Fee / Handling Fee",
    chargeValue: "Value, negative allowed",
    sst: "SST",
    serviceFee: "Service Fee",
    handlingFee: "Handling Fee",
    chargeDiscount: "Discount",
    yourSignature: "6. Your Signature",
    signatureText: "Signature text",
    signatureImageUrl: "Signature image URL",
    uploadSignature: "Upload Signature",
    handwriteSignature: "Handwrite Signature",
    saveSignature: "Save Signature",
    deleteSignature: "Delete Saved Signature",
    chooseSignature: "Choose saved signature",
    noSignature: "No signature",
    customerSignature: "Customer Signature",
    issuerSignNotice: "This is your signature. After confirm, it will be placed into Signature Image URL.",
    customerSignNotice: "This signature will not be saved. It only appears on this invoice.",
    confirmSignature: "Confirm",
    clearSignature: "Clear",
    preview: "Official Invoice Preview",
    issuerSignature: "Issuer Signature",
    customerSignatureLabel: "Customer Signature",
    subtotal: "Subtotal",
    discount: "Discount",
    taxableTotal: "After Discount",
    total: "Total",
    profit: "Profit / Margin",
    generate: "Generate Invoice + Add Accounting + Deduct Stock",
    generating: "Generating...",
    print: "Print",
    pdf: "Download PDF",
    whatsappPdf: "Send PDF via WhatsApp",
    needCustomer: "Please select customer",
    needNewCustomer: "Please enter new customer name",
    needProduct: "Please add at least one product",
    qtyError: "Quantity must be more than 0",
    stockNotEnough: "Insufficient stock. Current stock: ",
    success: "Invoice generated, added to accounting and stock deducted",
    trialSuccess: "Trial invoice generated, added to accounting and stock deducted",
    fail: "Failed: ",
    productNote: "Added from invoice system",
    saved: "Saved",
    copied: "Share content is ready",
    previewProductName: "Product Name",
    previewQty: "Qty",
    previewPrice: "Price RM",
    previewDiscount: "Discount",
    previewTotal: "Total",
  },
  ms: {
    dashboardBack: "Kembali Dashboard",
    close: "Tutup",
    title: "Rekod Invois",
    newInvoice: "Invois Baru",
    edit: "Edit",
    delete: "Padam",
    share: "Kongsi",
    whatsapp: "WhatsApp",
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
    addPayment: "+ Tambah Cara Bayaran",
    savePayment: "Simpan Bayaran",
    deletePayment: "Padam Bayaran",
    paymentName: "Nama bayaran",
    paymentBankAccount: "Akaun Bank",
    paymentReceiverName: "Nama Penerima",
    paymentLink: "Pautan Bayaran",
    paymentQr: "URL Gambar QR Code",
    uploadQr: "Muat Naik QR",
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
    addProductLine: "➕ Tambah Produk",
    removeProductLine: "➖ Buang Produk",
    selectProduct: "Pilih dari Produk",
    newProduct: "Tambah Produk",
    chooseProduct: "Sila pilih produk",
    productName: "Nama Produk",
    price: "Harga Jualan RM",
    cost: "Kos RM",
    stock: "Jumlah Stok",
    qty: "Kuantiti",
    lineDiscount: "Diskaun Produk RM",
    extraCharges: "5. Diskaun / SST / Caj Servis / Caj Pengendalian",
    chargeValue: "Nilai, boleh negatif",
    sst: "SST",
    serviceFee: "Caj Servis",
    handlingFee: "Caj Pengendalian",
    chargeDiscount: "Diskaun",
    yourSignature: "6. Tandatangan Anda",
    signatureText: "Teks tandatangan",
    signatureImageUrl: "URL gambar tandatangan",
    uploadSignature: "Muat Naik Tandatangan",
    handwriteSignature: "Tulis Tandatangan",
    saveSignature: "Simpan Tandatangan",
    deleteSignature: "Padam Tandatangan Disimpan",
    chooseSignature: "Pilih tandatangan",
    noSignature: "Tiada tandatangan",
    customerSignature: "Tandatangan Pelanggan",
    issuerSignNotice: "Ini tandatangan anda. Selepas sahkan, ia akan masuk ke URL gambar tandatangan.",
    customerSignNotice: "Tandatangan ini tidak akan disimpan.",
    confirmSignature: "Sahkan",
    clearSignature: "Kosongkan",
    preview: "Pratonton Invois Rasmi",
    issuerSignature: "Tandatangan Pengeluar",
    customerSignatureLabel: "Tandatangan Pelanggan",
    subtotal: "Subtotal",
    discount: "Diskaun",
    taxableTotal: "Selepas Diskaun",
    total: "Jumlah",
    profit: "Untung / Margin",
    generate: "Jana Invois + Masuk Akaun + Tolak Stok",
    generating: "Sedang Jana...",
    print: "Cetak",
    pdf: "Muat Turun PDF",
    whatsappPdf: "Hantar PDF WhatsApp",
    needCustomer: "Sila pilih pelanggan",
    needNewCustomer: "Sila isi nama pelanggan baru",
    needProduct: "Sila tambah sekurang-kurangnya satu produk",
    qtyError: "Kuantiti mesti lebih daripada 0",
    stockNotEnough: "Stok tidak cukup. Stok semasa: ",
    success: "Invois berjaya dijana, masuk akaun dan stok ditolak",
    trialSuccess: "Invois percubaan berjaya dijana, masuk akaun dan stok ditolak",
    fail: "Gagal: ",
    productNote: "Ditambah dari sistem invois",
    saved: "Disimpan",
    copied: "Kandungan kongsi sudah sedia",
    previewProductName: "Nama Produk",
    previewQty: "Kuantiti",
    previewPrice: "Harga RM",
    previewDiscount: "Diskaun",
    previewTotal: "Jumlah",
  },
};

const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "cash", name: "Cash" },
  { id: "bank-transfer", name: "Bank Transfer", bankAccount: "", receiverName: "" },
  { id: "duitnow-qr", name: "DuitNow QR", qrCodeUrl: "" },
  { id: "tng-ewallet", name: "TNG eWallet", link: "" },
  { id: "credit-term", name: "Credit Term" },
];

const INVOICE_PAGE_CSS = `
  .smartacctg-invoice-page .fullscreen-invoice-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    max-width: 100vw !important;
    max-height: 100dvh !important;
    overflow-y: auto !important;
    z-index: 9999 !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: clamp(12px, 3vw, 22px) !important;
    box-sizing: border-box !important;
  }

  .smartacctg-invoice-page .signature-canvas {
    width: 100%;
    height: 220px;
    background: #fff;
    border: 3px solid #14b8a6;
    border-radius: 18px;
    touch-action: none;
  }

  .smartacctg-invoice-page .negative-amount {
    color: #dc2626 !important;
  }

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
`;

function makeInvoiceNo() {
  return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeInvoiceItem(): InvoiceItem {
  return {
    id: makeId("item"),
    productMode: "select",
    productId: "",
    newProductName: "",
    newProductPrice: "",
    newProductCost: "",
    newProductStock: "",
    qty: "1",
    discount: "0",
  };
}

function roundMoney(value: number) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function calcCharge(value: string, mode: ChargeMode, base: number) {
  const num = Number(value || 0);
  if (mode === "%") return roundMoney((Math.max(base, 0) * num) / 100);
  return roundMoney(num);
}

function calcDiscountCharge(value: string, mode: ChargeMode, base: number) {
  const raw = calcCharge(value, mode, base);
  if (raw === 0) return 0;
  return -Math.abs(raw);
}

function formatSignedRM(value: number) {
  const num = Number(value || 0);
  const sign = num < 0 ? "- " : "";
  return `${sign}RM ${Math.abs(num).toFixed(2)}`;
}

function amountColor(value: number, fallback = "#0f766e") {
  return Number(value || 0) < 0 ? "#dc2626" : fallback;
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

function isSchemaColumnError(error: any) {
  const message = String(error?.message || "").toLowerCase();

  return (
    message.includes("schema cache") ||
    message.includes("could not find") ||
    message.includes("column")
  );
}

function getMissingColumnName(error: any) {
  const message = String(error?.message || "");
  const match1 = message.match(/Could not find the '([^']+)' column/i);
  const match2 = message.match(/column "([^"]+)" does not exist/i);
  const match3 = message.match(/column '([^']+)' does not exist/i);

  return match1?.[1] || match2?.[1] || match3?.[1] || "";
}

async function insertAdaptive(table: string, inputPayload: Record<string, any>) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 40; i++) {
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

    const optionalKeys = [
      "supplier_tin",
      "buyer_tin",
      "sst_no",
      "msic_code",
      "einvoice_uuid",
      "validation_status",
      "qr_code_url",
      "myinvois_status",
      "discount",
      "total_cost",
      "total_profit",
      "payment_method",
      "due_date",
      "status",
      "customer_phone",
      "customer_company",
      "customer_address",
      "invoice_date",
      "note",
      "customer_id",
      "subtotal",
      "line_profit",
      "line_total",
      "unit_cost",
      "source_type",
      "source_id",
      "debt_amount",
      "category_name",
      "txn_type",
      "product_name",
      "qty",
      "unit_price",
      "invoice_id",
      "product_id",
    ];

    const removable = optionalKeys.find((key) =>
      Object.prototype.hasOwnProperty.call(payload, key)
    );

    if (!removable) throw error;

    const next = { ...payload };
    delete next[removable];
    payload = next;
  }

  throw lastError || new Error("Insert failed");
}

async function updateAdaptive(table: string, id: string, inputPayload: Record<string, any>) {
  let payload: Record<string, any> = { ...inputPayload };
  let lastError: any = null;

  for (let i = 0; i < 40; i++) {
    const { error } = await supabase.from(table).update(payload).eq("id", id);

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

    const optionalKeys = [
      "discount",
      "total_cost",
      "total_profit",
      "payment_method",
      "due_date",
      "status",
      "customer_phone",
      "customer_company",
      "customer_address",
      "invoice_date",
      "note",
      "subtotal",
    ];

    const removable = optionalKeys.find((key) =>
      Object.prototype.hasOwnProperty.call(payload, key)
    );

    if (!removable) throw error;

    const next = { ...payload };
    delete next[removable];
    payload = next;
  }

  throw lastError || new Error("Update failed");
}

function readStockMap(): Record<string, number> {
  try {
    const raw = safeLocalGet(PRODUCT_STOCK_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStockMap(map: Record<string, number>) {
  safeLocalSet(PRODUCT_STOCK_MAP_KEY, JSON.stringify(map));
}

function saveStockValue(productId: string, stock: number) {
  if (!productId) return;

  const map = readStockMap();
  map[productId] = Number(stock || 0);
  writeStockMap(map);
}

function normalizeProduct(row: any): Product {
  const stockMap = readStockMap();
  const localStock = stockMap[row?.id];

  const rawStock =
    row?.stock_qty ?? row?.stock ?? row?.stock_quantity ?? row?.quantity ?? row?.qty ?? 0;

  return {
    ...row,
    id: String(row?.id || ""),
    name: String(row?.name || ""),
    price: Number(row?.price || 0),
    cost: Number(row?.cost || 0),
    discount: Number(row?.discount || 0),
    stock_qty: localStock !== undefined ? Number(localStock || 0) : Number(rawStock || 0),
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
        return { id: makeId("pay"), name: item };
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

function normalizeSignatureOptions(value: any): SignatureOption[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      return {
        id: item.id || makeId("sig"),
        name: String(item.name || item.signatureText || "Signature"),
        signatureText: String(item.signatureText || ""),
        signatureImageUrl: String(item.signatureImageUrl || ""),
      };
    })
    .filter(Boolean) as SignatureOption[];
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
  const [fullscreen, setFullscreen] = useState(false);
  const [userId, setUserId] = useState("");
  const [isTrial, setIsTrial] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);

  const [customerMode, setCustomerMode] = useState<"select" | "new">("select");
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  const [invoiceNo, setInvoiceNo] = useState(makeInvoiceNo());
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState(today());
  const [status, setStatus] = useState("sent");

  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_OPTIONS[0].id);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(DEFAULT_PAYMENT_OPTIONS);

  const [showPaymentAdd, setShowPaymentAdd] = useState(false);
  const [newPaymentName, setNewPaymentName] = useState("");
  const [newPaymentBankAccount, setNewPaymentBankAccount] = useState("");
  const [newPaymentReceiverName, setNewPaymentReceiverName] = useState("");
  const [newPaymentLink, setNewPaymentLink] = useState("");
  const [newPaymentQr, setNewPaymentQr] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([makeInvoiceItem()]);

  const [chargeDiscount, setChargeDiscount] = useState<ChargeInput>({ mode: "%", value: "0" });
  const [sst, setSst] = useState<ChargeInput>({ mode: "%", value: "0" });
  const [serviceFee, setServiceFee] = useState<ChargeInput>({ mode: "%", value: "0" });
  const [handlingFee, setHandlingFee] = useState<ChargeInput>({ mode: "%", value: "0" });

  const [signatureOptions, setSignatureOptions] = useState<SignatureOption[]>([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [signatureImageUrl, setSignatureImageUrl] = useState("");

  const [signaturePadTarget, setSignaturePadTarget] = useState<"issuer" | "customer" | null>(
    null
  );
  const [customerSignatureUrl, setCustomerSignatureUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const [note, setNote] = useState("");

  const [companyName, setCompanyName] = useState("NK DIGITAL HUB");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [showCompanyEdit, setShowCompanyEdit] = useState(false);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastPrintableInvoice, setLastPrintableInvoice] = useState<InvoiceRecord | null>(null);
  const [lastPrintableItems, setLastPrintableItems] = useState<any[]>([]);

  const selectedPayment = paymentOptions.find((p) => p.id === paymentMethod) || paymentOptions[0];
  const paymentMethodText = selectedPayment?.name || paymentMethod || "-";

  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg,
    color: theme.inputText,
  };

  const themedDateInputStyle: CSSProperties = {
    ...dateInputStyle,
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
    const savedLang = safeLocalGet(LANG_KEY) as Lang | null;

    if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") return urlLang;
    if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") return savedLang;

    return "zh";
  }

  function getCurrentTheme(): ThemeKey {
    const q = new URLSearchParams(window.location.search);
    const urlTheme = q.get("theme") as ThemeKey | null;
    const saved = safeLocalGet(THEME_KEY) as ThemeKey | null;

    if (urlTheme && THEMES[urlTheme]) return urlTheme;
    if (saved && THEMES[saved]) return saved;

    return "deepTeal";
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    q.set("theme", themeKey);

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  async function init() {
    const currentLang = getCurrentLang();
    const currentTheme = getCurrentTheme();

    setLang(currentLang);
    setThemeKey(currentTheme);

    const q = new URLSearchParams(window.location.search);
    const openParam = q.get("open");
    const fullscreenParam = q.get("fullscreen");

    if (fullscreenParam === "1") setFullscreen(true);

    const savedPayment = safeLocalGet(PAYMENT_OPTIONS_KEY);
    if (savedPayment) {
      const parsed = normalizePaymentOptions(JSON.parse(savedPayment));
      setPaymentOptions(parsed);
      setPaymentMethod(parsed[0]?.id || DEFAULT_PAYMENT_OPTIONS[0].id);
    }

    const savedSignature = safeLocalGet(SIGNATURE_OPTIONS_KEY);
    if (savedSignature) {
      setSignatureOptions(normalizeSignatureOptions(JSON.parse(savedSignature)));
    }

    const modeParam = q.get("mode");
    const trialRaw = safeLocalGet(TRIAL_KEY);

    if (modeParam === "trial" && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);

        const savedCustomers = safeLocalGet(TRIAL_CUSTOMERS_KEY);
        const savedProducts = safeLocalGet(TRIAL_PRODUCTS_KEY);
        const savedInvoices = safeLocalGet(TRIAL_INVOICES_KEY);

        const trialProducts = savedProducts ? JSON.parse(savedProducts) : [];

        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setProducts(trialProducts.map((p: any) => normalizeProduct(p)));
        setInvoices(savedInvoices ? JSON.parse(savedInvoices) : []);

        if (openParam === "new") {
          setTimeout(() => {
            openNewInvoice(fullscreenParam === "1");
          }, 100);
        }

        return;
      }

      safeLocalRemove(TRIAL_KEY);
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
        safeLocalSet(THEME_KEY, profile.theme);
      }
    }

    await loadCustomers(uid);
    await loadProducts(uid);
    await loadInvoices(uid);

    if (openParam === "new") {
      setTimeout(() => {
        openNewInvoice(fullscreenParam === "1");
      }, 100);
    }
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

  const selectedCustomer = customers.find((c) => c.id === customerId);

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

  function getProductForItem(item: InvoiceItem) {
    return products.find((p) => p.id === item.productId) || null;
  }

  function getItemCalc(item: InvoiceItem) {
    const selectedProduct = getProductForItem(item);

    const name =
      item.productMode === "new"
        ? item.newProductName || "-"
        : selectedProduct?.name || "-";

    const price =
      item.productMode === "new"
        ? Number(item.newProductPrice || 0)
        : Number(selectedProduct?.price || 0);

    const cost =
      item.productMode === "new"
        ? Number(item.newProductCost || 0)
        : Number(selectedProduct?.cost || 0);

    const stock =
      item.productMode === "new"
        ? Number(item.newProductStock || 0)
        : Number(selectedProduct?.stock_qty || 0);

    const qty = Number(item.qty || 0);
    const discount = Number(item.discount || 0);
    const lineSubtotal = roundMoney(price * qty);
    const lineTotal = roundMoney(lineSubtotal - discount);
    const lineCost = roundMoney(cost * qty);
    const lineProfit = roundMoney(lineTotal - lineCost);

    return {
      product: selectedProduct,
      name,
      price,
      cost,
      stock,
      qty,
      discount,
      lineSubtotal,
      lineTotal,
      lineCost,
      lineProfit,
    };
  }

  const itemCalcs = useMemo(() => {
    return items.map((item) => ({ item, calc: getItemCalc(item) }));
  }, [items, products]);

  const preview = useMemo(() => {
    const subtotal = roundMoney(itemCalcs.reduce((s, x) => s + x.calc.lineSubtotal, 0));
    const itemDiscount = roundMoney(itemCalcs.reduce((s, x) => s + x.calc.discount, 0));
    const taxableBase = roundMoney(subtotal - itemDiscount);

    const chargeDiscountAmount = calcDiscountCharge(
      chargeDiscount.value,
      chargeDiscount.mode,
      taxableBase
    );

    const sstAmount = calcCharge(sst.value, sst.mode, taxableBase);
    const serviceFeeAmount = calcCharge(serviceFee.value, serviceFee.mode, taxableBase);
    const handlingFeeAmount = calcCharge(handlingFee.value, handlingFee.mode, taxableBase);

    const total = roundMoney(
      taxableBase + chargeDiscountAmount + sstAmount + serviceFeeAmount + handlingFeeAmount
    );

    const totalCost = roundMoney(itemCalcs.reduce((s, x) => s + x.calc.lineCost, 0));
    const profit = roundMoney(total - totalCost);

    return {
      subtotal,
      itemDiscount,
      taxableBase,
      chargeDiscountAmount,
      sstAmount,
      serviceFeeAmount,
      handlingFeeAmount,
      total,
      totalCost,
      profit,
    };
  }, [itemCalcs, chargeDiscount, sst, serviceFee, handlingFee]);

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return [inv.invoice_no, inv.customer_name, inv.customer_company, inv.customer_phone]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  function savePaymentOptions(next: PaymentOption[]) {
    setPaymentOptions(next);
    safeLocalSet(PAYMENT_OPTIONS_KEY, JSON.stringify(next));
  }

  async function uploadPaymentQr(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setNewPaymentQr(dataUrl);
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

  function deletePaymentOption() {
    if (!paymentMethod) return;

    const next = paymentOptions.filter((p) => p.id !== paymentMethod);
    const fixed = next.length > 0 ? next : DEFAULT_PAYMENT_OPTIONS;

    savePaymentOptions(fixed);
    setPaymentMethod(fixed[0].id);
  }

  async function uploadSignatureImage(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setSignatureImageUrl(dataUrl);
      setMsg(t.saved);
    } catch (error: any) {
      setMsg(t.fail + error.message);
    }
  }

  function saveSignatureOption() {
    const nextSig: SignatureOption = {
      id: makeId("sig"),
      name: signatureText.trim() || "Signature",
      signatureText: signatureText.trim(),
      signatureImageUrl: signatureImageUrl.trim(),
    };

    if (!nextSig.signatureText && !nextSig.signatureImageUrl) return;

    const next = [nextSig, ...signatureOptions];

    setSignatureOptions(next);
    safeLocalSet(SIGNATURE_OPTIONS_KEY, JSON.stringify(next));
    setSelectedSignatureId(nextSig.id);
    setMsg(t.saved);
  }

  function chooseSavedSignature(id: string) {
    setSelectedSignatureId(id);

    const sig = signatureOptions.find((x) => x.id === id);

    if (!sig) {
      setSignatureText("");
      setSignatureImageUrl("");
      return;
    }

    setSignatureText(sig.signatureText);
    setSignatureImageUrl(sig.signatureImageUrl);
  }

  function deleteSignatureOption() {
    if (!selectedSignatureId) return;

    const next = signatureOptions.filter((sig) => sig.id !== selectedSignatureId);

    setSignatureOptions(next);
    safeLocalSet(SIGNATURE_OPTIONS_KEY, JSON.stringify(next));

    setSelectedSignatureId("");
    setSignatureText("");
    setSignatureImageUrl("");
    setMsg(t.saved);
  }

  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addProductLine() {
    setItems((prev) => [...prev, makeInvoiceItem()]);
  }

  function removeProductLine(id: string) {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }

  function saveTrialData(nextCustomers: Customer[], nextProducts: Product[], nextInvoices = invoices) {
    safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
    safeLocalSet(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
    safeLocalSet(TRIAL_INVOICES_KEY, JSON.stringify(nextInvoices));
  }

  function addTrialTransaction(total: number, customer: Customer, invNo: string) {
    const oldRaw = safeLocalGet(TRIAL_TX_KEY);
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
        note: `${invNo}｜${customer.name}`,
      },
      ...oldTx,
    ];

    safeLocalSet(TRIAL_TX_KEY, JSON.stringify(nextTx));
  }

  async function saveCompanyInfo() {
    if (isTrial) {
      setMsg(t.saved);
      setShowCompanyEdit(false);
      return;
    }

    if (!userId) return;

    await updateAdaptive("profiles", userId, {
      company_name: companyName,
      company_reg_no: companyRegNo,
      company_phone: companyPhone,
      company_address: companyAddress,
      company_logo_url: companyLogoUrl,
    });

    setMsg(t.saved);
    setShowCompanyEdit(false);
  }

  async function insertProductWithStock(item: InvoiceItem) {
    const inputStock = Number(item.newProductStock || 0);

    const payload = {
      user_id: userId,
      name: item.newProductName,
      price: Number(item.newProductPrice),
      cost: Number(item.newProductCost),
      discount: 0,
      stock_qty: inputStock,
      note: t.productNote,
    };

    const data = await insertAdaptive("products", payload);

    const fixed = normalizeProduct({
      ...(data as any),
      stock_qty: inputStock,
    });

    saveStockValue(fixed.id, Number(fixed.stock_qty || inputStock || 0));
    return fixed;
  }

  async function updateProductStockSafe(productId: string, nextStock: number) {
    const columns = ["stock_qty", "stock", "stock_quantity", "quantity", "qty"];

    for (const col of columns) {
      const withUser = await supabase
        .from("products")
        .update({ [col]: nextStock })
        .eq("id", productId)
        .eq("user_id", userId)
        .select("id");

      if (!withUser.error && Array.isArray(withUser.data) && withUser.data.length > 0) {
        saveStockValue(productId, nextStock);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock_qty: nextStock } : p))
        );
        return;
      }

      if (withUser.error && !isSchemaColumnError(withUser.error)) {
        throw withUser.error;
      }
    }

    saveStockValue(productId, nextStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock_qty: nextStock } : p))
    );
  }

  async function insertInvoiceWithFallback(finalCustomer: Customer) {
    const payload = {
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
      discount: preview.itemDiscount,
      total: preview.total,
      total_cost: preview.totalCost,
      total_profit: preview.profit,
      note,
    };

    const data = await insertAdaptive("invoices", payload);
    return data as InvoiceRecord;
  }

  async function insertInvoiceItemSafe(invoiceId: string, product: Product, calc: any) {
    await insertAdaptive("invoice_items", {
      invoice_id: invoiceId,
      product_id: product.id,
      product_name: product.name,
      qty: calc.qty,
      unit_price: calc.price,
      unit_cost: calc.cost,
      discount: calc.discount,
      line_total: calc.lineTotal,
      line_profit: calc.lineProfit,
    });
  }

  async function insertTransactionSafe(invoiceId: string, finalCustomer: Customer) {
    await insertAdaptive("transactions", {
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
      note: `${invoiceNo}｜${finalCustomer.name}`,
    });
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

    if (items.length === 0) {
      setMsg(t.needProduct);
      return;
    }

    for (const { item, calc } of itemCalcs) {
      if (item.productMode === "select" && !calc.product) {
        setMsg(t.needProduct);
        return;
      }

      if (item.productMode === "new" && !item.newProductName) {
        setMsg(t.needProduct);
        return;
      }

      if (calc.qty <= 0) {
        setMsg(t.qtyError);
        return;
      }

      if (item.productMode === "select" && calc.stock < calc.qty) {
        setMsg(`${t.stockNotEnough}${calc.stock}`);
        return;
      }
    }

    setLoading(true);

    try {
      let finalCustomer = selectedCustomer;
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
          const data = await insertAdaptive("customers", {
            user_id: userId,
            name: newCustomerName,
            phone: newCustomerPhone,
            company_name: newCustomerCompany,
            address: newCustomerAddress,
          });

          finalCustomer = data as Customer;
          setCustomers((prev) => [finalCustomer as Customer, ...prev]);
        }
      }

      if (!finalCustomer) {
        setMsg(t.needCustomer);
        setLoading(false);
        return;
      }

      const finalItems: any[] = [];

      for (const pair of itemCalcs) {
        const { item, calc } = pair;
        let finalProduct = calc.product as Product | null;

        if (item.productMode === "new") {
          finalProduct = {
            id: makeId("trial-product"),
            name: item.newProductName,
            price: Number(item.newProductPrice || 0),
            cost: Number(item.newProductCost || 0),
            discount: 0,
            stock_qty: Number(item.newProductStock || 0),
            note: t.productNote,
          };

          if (isTrial) {
            workingProducts = [finalProduct, ...workingProducts];
            saveStockValue(finalProduct.id, Number(finalProduct.stock_qty || 0));
          } else {
            finalProduct = await insertProductWithStock(item);
            workingProducts = [finalProduct, ...workingProducts];
          }
        }

        if (!finalProduct) continue;

        finalItems.push({
          product: finalProduct,
          calc: {
            ...calc,
            name: finalProduct.name,
          },
        });
      }

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
        discount: preview.itemDiscount,
        total: preview.total,
        total_cost: preview.totalCost,
        total_profit: preview.profit,
        payment_method: paymentMethodText,
        note,
        created_at: new Date().toISOString(),
      };

      if (isTrial) {
        let nextProducts = workingProducts;

        finalItems.forEach(({ product, calc }) => {
          const newStock = Math.max(Number(product.stock_qty || 0) - Number(calc.qty || 0), 0);
          saveStockValue(product.id, newStock);

          nextProducts = nextProducts.map((p) =>
            p.id === product.id ? { ...p, stock_qty: newStock } : p
          );
        });

        const nextInvoices = [printableRecord, ...invoices];

        setProducts(nextProducts);
        setInvoices(nextInvoices);
        setLastPrintableInvoice(printableRecord);
        setLastPrintableItems(finalItems);

        saveTrialData(workingCustomers, nextProducts, nextInvoices);
        addTrialTransaction(preview.total, finalCustomer, invoiceNo);

        setMsg(t.trialSuccess);
        setMode("list");
        setFullscreen(false);
        setLoading(false);
        return;
      }

      const invoiceData = await insertInvoiceWithFallback(finalCustomer);

      for (const { product, calc } of finalItems) {
        await insertInvoiceItemSafe(invoiceData.id, product, calc);

        const newStock = Math.max(Number(product.stock_qty || 0) - Number(calc.qty || 0), 0);
        await updateProductStockSafe(product.id, newStock);
      }

      await insertTransactionSafe(invoiceData.id, finalCustomer);

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
        discount: invoiceData.discount ?? preview.itemDiscount,
        total: invoiceData.total ?? preview.total,
        total_cost: invoiceData.total_cost ?? preview.totalCost,
        total_profit: invoiceData.total_profit ?? preview.profit,
        created_at: invoiceData.created_at || printableRecord.created_at,
      };

      setInvoices((prev) => [savedRecord, ...prev]);
      setLastPrintableInvoice(savedRecord);
      setLastPrintableItems(finalItems);

      await loadProducts(userId);

      setMsg(t.success);
      setMode("list");
      setFullscreen(false);
    } catch (error: any) {
      setMsg(t.fail + (error?.message || String(error)));
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
      discount: preview.itemDiscount,
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
      safeLocalSet(TRIAL_INVOICES_KEY, JSON.stringify(next));
      setMsg(t.saved);
      setMode("list");
      setFullscreen(false);
      setEditInvoiceId(null);
      setLoading(false);
      return;
    }

    try {
      await updateAdaptive("invoices", editInvoiceId, updatedData as any);

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === editInvoiceId ? { ...inv, ...updatedData } : inv))
      );

      setMsg(t.saved);
      setMode("list");
      setFullscreen(false);
      setEditInvoiceId(null);
    } catch (error: any) {
      setMsg(t.fail + (error?.message || String(error)));
    }

    setLoading(false);
  }

  function startEditInvoice(inv: InvoiceRecord) {
    setEditInvoiceId(inv.id);
    setInvoiceNo(inv.invoice_no || makeInvoiceNo());
    setInvoiceDate(inv.invoice_date || today());
    setDueDate(inv.due_date || today());
    setStatus(inv.status || "sent");

    setCustomerMode("new");
    setNewCustomerName(inv.customer_name || "");
    setNewCustomerPhone(inv.customer_phone || "");
    setNewCustomerCompany(inv.customer_company || "");
    setNewCustomerAddress(inv.customer_address || "");

    setItems([
      {
        ...makeInvoiceItem(),
        productMode: "new",
        newProductName: "Invoice Item",
        newProductPrice: String(inv.subtotal || inv.total || 0),
        newProductCost: String(inv.total_cost || 0),
        newProductStock: "999999",
        qty: "1",
        discount: String(inv.discount || 0),
      },
    ]);

    setNote(inv.note || "");
    setFullscreen(true);
    setMode("new");
  }

  async function deleteInvoice(inv: InvoiceRecord) {
    if (!confirm(t.confirmDelete)) return;

    if (isTrial) {
      const next = invoices.filter((x) => x.id !== inv.id);
      setInvoices(next);
      safeLocalSet(TRIAL_INVOICES_KEY, JSON.stringify(next));
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

  function statusText(value?: string | null) {
    if (value === "draft") return t.draft;
    if (value === "paid") return t.paid;
    if (value === "cancelled") return t.cancelled;

    return t.sent;
  }

  function getPaymentForInvoice(inv?: InvoiceRecord | null) {
    const value = inv?.payment_method || paymentMethodText;

    return paymentOptions.find((p) => p.id === value || p.name === value) || selectedPayment || null;
  }

  function setPrintable(record?: InvoiceRecord) {
    if (record) {
      setLastPrintableInvoice(record);
      setLastPrintableItems([
        {
          product: { id: "", name: "Invoice Item" },
          calc: {
            name: "Invoice Item",
            qty: 1,
            price: Number(record.subtotal || record.total || 0),
            discount: Number(record.discount || 0),
            lineTotal: Number(record.total || 0),
          },
        },
      ]);
    } else {
      setLastPrintableInvoice(currentPreviewInvoice);
      setLastPrintableItems(itemCalcs.map((x) => ({ product: x.calc.product, calc: x.calc })));
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

    const paymentDetailText = [
      pay?.bankAccount ? `${t.paymentBankAccount}：${pay.bankAccount}` : "",
      pay?.receiverName ? `${t.paymentReceiverName}：${pay.receiverName}` : "",
      pay?.link ? `Payment Link：${pay.link}` : "",
      pay?.qrCodeUrl && !pay.qrCodeUrl.startsWith("data:")
        ? `QR Code：${pay.qrCodeUrl}`
        : "",
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
        ? `/dashboard?mode=trial&lang=${lang}&theme=${themeKey}`
        : `/dashboard?lang=${lang}&theme=${themeKey}`;
  }

  function openNewInvoice(forceFullscreen = false) {
    setEditInvoiceId(null);
    setInvoiceNo(makeInvoiceNo());
    setInvoiceDate(today());
    setDueDate(today());
    setStatus("sent");

    setCustomerMode("select");
    setCustomerId("");
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerCompany("");
    setNewCustomerAddress("");

    setItems([makeInvoiceItem()]);

    setChargeDiscount({ mode: "%", value: "0" });
    setSst({ mode: "%", value: "0" });
    setServiceFee({ mode: "%", value: "0" });
    setHandlingFee({ mode: "%", value: "0" });

    setSignatureText("");
    setSignatureImageUrl("");
    setSelectedSignatureId("");
    setSignaturePadTarget(null);
    setCustomerSignatureUrl("");

    setNote("");
    setMsg("");
    setShowPaymentAdd(false);

    if (forceFullscreen) setFullscreen(true);
    setMode("new");
  }

  function closeInvoiceForm() {
    setMode("list");
    setFullscreen(false);

    const q = new URLSearchParams(window.location.search);
    q.delete("open");
    q.delete("fullscreen");

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function renderChargeInput(
    label: string,
    charge: ChargeInput,
    setCharge: (v: ChargeInput) => void
  ) {
    return (
      <div
        className="sa-panel"
        style={{ ...chargeBoxStyle, borderColor: theme.border, background: theme.panelBg }}
      >
        <label style={{ ...labelStyle, color: theme.accent }}>{label}</label>

        <div style={chargeInputRowStyle}>
          <input
            value={charge.value}
            onChange={(e) => setCharge({ ...charge, value: e.target.value })}
            placeholder={t.chargeValue}
            style={{
              ...themedInputStyle,
              marginBottom: 0,
              color: Number(charge.value || 0) < 0 ? "#dc2626" : theme.inputText,
            }}
          />

          <select
            value={charge.mode}
            onChange={(e) => setCharge({ ...charge, mode: e.target.value as ChargeMode })}
            style={{ ...themedInputStyle, marginBottom: 0 }}
          >
            <option value="%">%</option>
            <option value="RM">RM</option>
          </select>
        </div>
      </div>
    );
  }

  function renderOfficialChargeRow(label: string, charge: ChargeInput, amount: number) {
    const show = Number(charge.value || 0) !== 0 || Number(amount || 0) !== 0;
    if (!show) return null;

    const isNegative = Number(amount || 0) < 0;

    return (
      <div style={officialSummaryRowStyle}>
        <span>
          {label} {charge.mode === "%" ? `(${charge.value || 0}%)` : "(RM)"}
        </span>

        <strong style={{ color: isNegative ? "#dc2626" : "#111827" }}>
          {formatSignedRM(Number(amount || 0))}
        </strong>
      </div>
    );
  }

  function getCanvasPos(e: any) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDraw(e: any) {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawingRef.current = true;
    const pos = getCanvasPos(e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: any) {
    if (!drawingRef.current) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getCanvasPos(e);

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDraw() {
    drawingRef.current = false;
  }

  function clearSignaturePad() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (signaturePadTarget === "issuer") {
      setSignatureImageUrl("");
    }

    if (signaturePadTarget === "customer") {
      setCustomerSignatureUrl("");
    }
  }

  function confirmSignaturePad() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");

    if (signaturePadTarget === "issuer") {
      setSignatureImageUrl(dataUrl);
    }

    if (signaturePadTarget === "customer") {
      setCustomerSignatureUrl(dataUrl);
    }

    setSignaturePadTarget(null);
  }

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
    discount: preview.itemDiscount,
    total: preview.total,
    total_cost: preview.totalCost,
    total_profit: preview.profit,
    payment_method: paymentMethodText,
    note,
  };

  const printableInvoice = lastPrintableInvoice || currentPreviewInvoice;
  const printableItems =
    lastPrintableItems.length > 0
      ? lastPrintableItems
      : itemCalcs.map((x) => ({ product: x.calc.product, calc: x.calc }));

  function renderOfficialInvoice(inv: InvoiceRecord, officialItems: any[]) {
    const subtotal = Number(inv.subtotal || 0);
    const discount = Number(inv.discount || 0);
    const total = Number(inv.total || 0);
    const totalCost = Number(inv.total_cost || 0);
    const profit = Number(inv.total_profit ?? total - totalCost);
    const lineAfterDiscount = subtotal - discount;
    const pay = getPaymentForInvoice(inv);

    const showIssuerSignature = Boolean(signatureText?.trim()) || Boolean(signatureImageUrl?.trim());
    const showCustomerSignatureImage = Boolean(customerSignatureUrl);
    const showSignatureArea = showIssuerSignature || showCustomerSignatureImage;

    return (
      <div style={officialInvoiceStyle}>
        <div style={officialHeaderStyle}>
          <div style={officialCompanyBlockStyle}>
            {companyLogoUrl ? (
              <img src={companyLogoUrl} style={officialLogoStyle} alt="Company Logo" />
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
                    {t.paymentBankAccount}：{pay.bankAccount}
                  </div>
                ) : null}

                {pay?.receiverName ? (
                  <div style={officialPaymentDetailTextStyle}>
                    {t.paymentReceiverName}：{pay.receiverName}
                  </div>
                ) : null}

                {pay?.link ? <div style={officialPaymentDetailTextStyle}>{pay.link}</div> : null}

                {pay?.qrCodeUrl ? (
                  <img src={pay.qrCodeUrl} style={officialInlineQrStyle} alt="Payment QR" />
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
            {officialItems.map((x, index) => (
              <tr key={`${x.calc.name}-${index}`}>
                <td style={officialTdStyle}>{x.calc.name || x.product?.name || "-"}</td>
                <td style={officialTdStyle}>{x.calc.qty || 1}</td>
                <td style={officialTdStyle}>RM {Number(x.calc.price || 0).toFixed(2)}</td>
                <td
                  style={{
                    ...officialTdStyle,
                    color: Number(x.calc.discount || 0) < 0 ? "#dc2626" : "#111827",
                  }}
                >
                  {formatSignedRM(Number(x.calc.discount || 0))}
                </td>
                <td
                  style={{
                    ...officialTdStyle,
                    color: Number(x.calc.lineTotal || 0) < 0 ? "#dc2626" : "#111827",
                  }}
                >
                  {formatSignedRM(Number(x.calc.lineTotal || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={officialSummaryStyle}>
          <div style={officialSummaryRowStyle}>
            <span>{t.subtotal}</span>
            <strong>RM {subtotal.toFixed(2)}</strong>
          </div>

          <div style={officialSummaryRowStyle}>
            <span>{t.discount}</span>
            <strong style={{ color: discount < 0 ? "#dc2626" : "#111827" }}>
              {formatSignedRM(-Math.abs(discount))}
            </strong>
          </div>

          <div style={officialSummaryRowStyle}>
            <span>{t.taxableTotal}</span>
            <strong style={{ color: amountColor(lineAfterDiscount, "#111827") }}>
              {formatSignedRM(lineAfterDiscount)}
            </strong>
          </div>

          {renderOfficialChargeRow(t.chargeDiscount, chargeDiscount, preview.chargeDiscountAmount)}
          {renderOfficialChargeRow(t.sst, sst, preview.sstAmount)}
          {renderOfficialChargeRow(t.serviceFee, serviceFee, preview.serviceFeeAmount)}
          {renderOfficialChargeRow(t.handlingFee, handlingFee, preview.handlingFeeAmount)}

          <div style={officialTotalRowStyle}>
            <span>{t.total}</span>
            <strong style={{ color: amountColor(total, "#0f766e") }}>
              {formatSignedRM(total)}
            </strong>
          </div>

          <div style={officialProfitRowStyle}>
            <span>{t.profit}</span>
            <strong style={{ color: amountColor(profit, "#16a34a") }}>
              {formatSignedRM(profit)}
            </strong>
          </div>
        </div>

        {inv.note ? <div style={officialNoteStyle}>Note：{inv.note}</div> : null}

        {showSignatureArea ? (
          <div
            style={{
              ...officialSignatureWrapStyle,
              gridTemplateColumns:
                showIssuerSignature && showCustomerSignatureImage ? "1fr 1fr" : "1fr",
              width: showIssuerSignature && showCustomerSignatureImage ? "100%" : "58%",
              marginLeft: "auto",
            }}
          >
            {showIssuerSignature ? (
              <div style={officialSignatureBoxStyle}>
                {signatureImageUrl ? (
                  <img
                    src={signatureImageUrl}
                    style={officialSignatureImageStyle}
                    alt="Issuer Signature"
                  />
                ) : null}

                {signatureText ? (
                  <div style={officialSignatureTextStyle}>{signatureText}</div>
                ) : null}

                <div style={officialSignatureLineStyle} />
                <div style={officialSignatureLabelStyle}>{t.issuerSignature}</div>
              </div>
            ) : null}

            {showCustomerSignatureImage ? (
              <div style={officialSignatureBoxStyle}>
                <img
                  src={customerSignatureUrl}
                  style={officialSignatureImageStyle}
                  alt="Customer Signature"
                />

                <div style={officialSignatureLineStyle} />
                <div style={officialSignatureLabelStyle}>{t.customerSignatureLabel}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main
      className="smartacctg-page smartacctg-invoice-page"
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{INVOICE_PAGE_CSS}</style>

      <div className="no-print sa-user-toolbar">
        <button
          onClick={goBack}
          className="sa-back-btn"
          style={{ borderColor: theme.border, color: theme.accent }}
        >
          ← {t.dashboardBack}
        </button>

        <div className="sa-lang-row">
          <button
            onClick={() => switchLang("zh")}
            className="sa-lang-btn"
            style={{
              borderColor: theme.accent,
              background: lang === "zh" ? theme.accent : "#fff",
              color: lang === "zh" ? "#fff" : theme.accent,
            }}
          >
            中文
          </button>

          <button
            onClick={() => switchLang("en")}
            className="sa-lang-btn"
            style={{
              borderColor: theme.accent,
              background: lang === "en" ? theme.accent : "#fff",
              color: lang === "en" ? "#fff" : theme.accent,
            }}
          >
            EN
          </button>

          <button
            onClick={() => switchLang("ms")}
            className="sa-lang-btn"
            style={{
              borderColor: theme.accent,
              background: lang === "ms" ? theme.accent : "#fff",
              color: lang === "ms" ? "#fff" : theme.accent,
            }}
          >
            BM
          </button>
        </div>
      </div>

      {mode === "list" && (
        <section
          className="no-print sa-card"
          style={{
            ...cardStyle,
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div style={listTitleRowStyle}>
            <h1 style={{ ...titleStyle, color: theme.accent }}>{t.title}</h1>

            <button
              onClick={() => openNewInvoice(true)}
              aria-label={t.newInvoice}
              style={{ ...plusBtnStyle, background: theme.accent }}
            >
              +
            </button>
          </div>

          <p style={{ ...descStyle, color: theme.muted }}>{t.latestInvoices}</p>

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
                  className="sa-item-card"
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

                    <div className="invoice-action-row" style={recordActionRowStyle}>
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
          className={`no-print sa-card ${fullscreen ? "fullscreen-invoice-modal" : ""}`}
          style={{
            ...cardStyle,
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div className="sa-titlebar" style={titleBarStyle}>
            <h1 style={{ ...newTitleStyle, color: theme.accent }}>
              {editInvoiceId ? t.edit : t.createTitle}
            </h1>

            <button className="sa-close-x" onClick={closeInvoiceForm} aria-label={t.close}>
              {t.close}
            </button>
          </div>

          <p style={{ ...newDescStyle, color: theme.muted }}>{t.desc}</p>

          <div className="sa-panel" style={{ ...invoiceNoBox, ...themedPanelStyle }}>
            <strong>Invoice No：</strong> {invoiceNo}
          </div>

          <h3>{t.invoiceInfo}</h3>

          <div style={dateTwoColGridStyle}>
            <div style={fieldBlockStyle}>
              <label style={{ ...labelStyle, color: theme.accent }}>{t.invoiceDate}</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                style={themedDateInputStyle}
              />
            </div>

            <div style={fieldBlockStyle}>
              <label style={{ ...labelStyle, color: theme.accent }}>{t.dueDate}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={themedDateInputStyle}
              />
            </div>
          </div>

          <div style={formGrid}>
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

            <div style={twoButtonRowStyle}>
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
                {t.addPayment}
              </button>

              <button type="button" onClick={deletePaymentOption} style={dangerOutlineBtnStyle}>
                {t.deletePayment}
              </button>
            </div>

            {showPaymentAdd && (
              <div
                className="sa-panel"
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
                  <img src={newPaymentQr} style={qrPreviewStyle} alt="QR Preview" />
                ) : null}

                <button
                  onClick={addPaymentOption}
                  style={{ ...addBtnStyle, background: theme.accent }}
                >
                  {t.savePayment}
                </button>
              </div>
            )}

            <label style={{ ...labelStyle, color: theme.accent }}>{t.note}</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.note}
              style={themedInputStyle}
            />
          </div>

          <h3>{t.companyInfo}</h3>

          <div className="sa-panel" style={{ ...companyBox, ...themedPanelStyle }}>
            {companyLogoUrl ? (
              <img src={companyLogoUrl} style={logoStyle} alt="Company Logo" />
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
              className="sa-panel"
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
              <button
                onClick={saveCompanyInfo}
                style={{ ...submitSmallBtnStyle, background: theme.accent }}
              >
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

          <div style={formGrid}>
            {items.map((item, index) => {
              const selectedProduct = getProductForItem(item);

              return (
                <div
                  key={item.id}
                  className="sa-panel"
                  style={{
                    ...productLineBoxStyle,
                    borderColor: theme.border,
                    background: theme.panelBg,
                    color: theme.panelText,
                  }}
                >
                  <div style={productLineTitleStyle}>
                    <strong>
                      {t.productInfo} #{index + 1}
                    </strong>

                    <button
                      type="button"
                      onClick={() => removeProductLine(item.id)}
                      style={dangerMiniBtnStyle}
                    >
                      {t.removeProductLine}
                    </button>
                  </div>

                  <div style={switchRow}>
                    <button
                      onClick={() => updateItem(item.id, { productMode: "select" })}
                      style={modeBtn(item.productMode === "select", theme)}
                    >
                      {t.selectProduct}
                    </button>
                    <button
                      onClick={() => updateItem(item.id, { productMode: "new" })}
                      style={modeBtn(item.productMode === "new", theme)}
                    >
                      {t.newProduct}
                    </button>
                  </div>

                  {item.productMode === "select" ? (
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(item.id, { productId: e.target.value })}
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
                        value={item.newProductName}
                        onChange={(e) => updateItem(item.id, { newProductName: e.target.value })}
                        style={themedInputStyle}
                      />
                      <input
                        placeholder={t.price}
                        value={item.newProductPrice}
                        onChange={(e) => updateItem(item.id, { newProductPrice: e.target.value })}
                        style={themedInputStyle}
                      />
                      <input
                        placeholder={t.cost}
                        value={item.newProductCost}
                        onChange={(e) => updateItem(item.id, { newProductCost: e.target.value })}
                        style={themedInputStyle}
                      />
                      <input
                        placeholder={t.stock}
                        value={item.newProductStock}
                        onChange={(e) => updateItem(item.id, { newProductStock: e.target.value })}
                        style={themedInputStyle}
                      />
                    </div>
                  )}

                  <div style={dateTwoColGridStyle}>
                    <div>
                      <label style={{ ...labelStyle, color: theme.accent }}>{t.qty}</label>
                      <input
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: e.target.value })}
                        style={themedInputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ ...labelStyle, color: theme.accent }}>
                        {t.lineDiscount}
                      </label>
                      <input
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, { discount: e.target.value })}
                        style={{
                          ...themedInputStyle,
                          color: Number(item.discount || 0) < 0 ? "#dc2626" : theme.inputText,
                        }}
                      />
                    </div>
                  </div>

                  {selectedProduct ? (
                    <p style={{ margin: 0, color: theme.muted, fontWeight: 900 }}>
                      {selectedProduct.name}｜RM {Number(selectedProduct.price || 0).toFixed(2)}
                    </p>
                  ) : null}
                </div>
              );
            })}

            <button
              type="button"
              onClick={addProductLine}
              style={{ ...addBtnStyle, background: theme.accent }}
            >
              {t.addProductLine}
            </button>
          </div>

          <h3>{t.extraCharges}</h3>

          <div style={chargeGridStyle}>
            {renderChargeInput(t.chargeDiscount, chargeDiscount, setChargeDiscount)}
            {renderChargeInput(t.sst, sst, setSst)}
            {renderChargeInput(t.serviceFee, serviceFee, setServiceFee)}
            {renderChargeInput(t.handlingFee, handlingFee, setHandlingFee)}
          </div>

          <h3>{t.yourSignature}</h3>

          <div
            className="sa-panel"
            style={{
              ...signatureInputBoxStyle,
              borderColor: theme.border,
              background: theme.panelBg,
              color: theme.panelText,
            }}
          >
            <select
              value={selectedSignatureId}
              onChange={(e) => chooseSavedSignature(e.target.value)}
              style={themedInputStyle}
            >
              <option value="">{t.noSignature}</option>
              {signatureOptions.map((sig) => (
                <option key={sig.id} value={sig.id}>
                  {sig.name}
                </option>
              ))}
            </select>

            <input
              placeholder={t.signatureText}
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              style={themedInputStyle}
            />

            <input
              placeholder={t.signatureImageUrl}
              value={signatureImageUrl}
              onChange={(e) => setSignatureImageUrl(e.target.value)}
              style={themedInputStyle}
            />

            <button
              type="button"
              onClick={() => setSignaturePadTarget("issuer")}
              style={{
                ...paymentToggleBtnStyle,
                borderColor: theme.border,
                color: theme.accent,
                background: theme.inputBg,
              }}
            >
              {t.handwriteSignature}
            </button>

            <div style={twoButtonRowStyle}>
              <label
                style={{
                  ...uploadQrBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  background: theme.inputBg,
                }}
              >
                {t.uploadSignature}
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadSignatureImage}
                  style={{ display: "none" }}
                />
              </label>

              <button
                type="button"
                onClick={saveSignatureOption}
                style={{ ...addBtnStyle, background: theme.accent }}
              >
                {t.saveSignature}
              </button>
            </div>

            <button type="button" onClick={deleteSignatureOption} style={dangerOutlineBtnStyle}>
              {t.deleteSignature}
            </button>

            <button
              type="button"
              onClick={() => setSignaturePadTarget("customer")}
              style={{
                ...paymentToggleBtnStyle,
                borderColor: theme.border,
                color: theme.accent,
                background: theme.inputBg,
              }}
            >
              {t.customerSignature}
            </button>

            {signatureImageUrl || signatureText ? (
              <div style={signatureMiniPreviewStyle}>
                {signatureImageUrl ? (
                  <img
                    src={signatureImageUrl}
                    style={signatureMiniImageStyle}
                    alt="Signature Preview"
                  />
                ) : null}
                {signatureText ? <strong>{signatureText}</strong> : null}
              </div>
            ) : null}
          </div>

          <h3>{t.preview}</h3>

          <div
            className="sa-panel"
            style={{
              ...screenPreviewWrapStyle,
              borderColor: theme.border,
              boxShadow: theme.glow,
            }}
          >
            <div style={screenInvoiceInnerStyle}>
              {renderOfficialInvoice(
                currentPreviewInvoice,
                itemCalcs.map((x) => ({ product: x.calc.product, calc: x.calc }))
              )}
            </div>
          </div>

          <button
            onClick={createInvoice}
            disabled={loading}
            style={{ ...submitBtn, background: theme.accent }}
          >
            {loading ? t.generating : editInvoiceId ? t.saveEdit : t.generate}
          </button>

          <div className="responsive-actions invoice-action-row" style={actionRow}>
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

      {signaturePadTarget ? (
        <div style={overlayStyle}>
          <section
            className="sa-card"
            style={{
              ...signatureModalStyle,
              background: theme.card,
              borderColor: theme.border,
              color: theme.text,
              boxShadow: theme.glow,
            }}
          >
            <div style={titleBarStyle}>
              <h2 style={{ margin: 0 }}>
                {signaturePadTarget === "issuer" ? t.handwriteSignature : t.customerSignature}
              </h2>

              <button className="sa-close-x" onClick={() => setSignaturePadTarget(null)}>
                {t.close}
              </button>
            </div>

            <p style={{ color: "#dc2626", fontWeight: 900 }}>
              {signaturePadTarget === "issuer" ? t.issuerSignNotice : t.customerSignNotice}
            </p>

            <canvas
              ref={canvasRef}
              width={900}
              height={360}
              className="signature-canvas"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />

            <div style={twoButtonRowStyle}>
              <button type="button" onClick={clearSignaturePad} style={dangerOutlineBtnStyle}>
                {t.clearSignature}
              </button>

              <button
                type="button"
                onClick={confirmSignaturePad}
                style={{ ...addBtnStyle, background: theme.accent }}
              >
                {t.confirmSignature}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <section id="printInvoiceArea" style={printAreaStyle}>
        {renderOfficialInvoice(printableInvoice, printableItems)}
      </section>
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
  fontSize: "var(--sa-fs-base)",
};

const cardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const listTitleRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: "clamp(10px, 3vw, 16px)",
  width: "100%",
};

const titleBarStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};

const plusBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  borderRadius: 999,
  border: "none",
  color: "#fff",
  fontSize: 30,
  fontWeight: 900,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.15,
};

const newTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.08,
  fontWeight: 900,
};

const descStyle: CSSProperties = {
  marginBottom: 20,
  fontSize: "var(--sa-fs-base)",
  lineHeight: 1.55,
};

const newDescStyle: CSSProperties = {
  marginTop: 4,
  marginBottom: 18,
  fontSize: "var(--sa-fs-base)",
  lineHeight: 1.55,
};

const invoiceNoBox: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "clamp(11px, 0.9em, 15px) var(--sa-control-x)",
  marginBottom: 20,
  minHeight: "var(--sa-control-h)",
  display: "flex",
  alignItems: "center",
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
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  flexWrap: "wrap",
};

const mutedTextStyle: CSSProperties = {
  fontSize: "var(--sa-fs-sm)",
  marginTop: 4,
  lineHeight: 1.5,
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
  borderRadius: 10,
  minHeight: 38,
  padding: "0 12px",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const recordDeleteBtnStyle: CSSProperties = {
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: 10,
  minHeight: 38,
  padding: "0 12px",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const recordWhatsappBtnStyle: CSSProperties = {
  border: "none",
  background: "#25D366",
  color: "#fff",
  borderRadius: 10,
  minHeight: 38,
  padding: "0 12px",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const recordShareBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid #0f766e",
  background: "#fff",
  color: "#0f766e",
  borderRadius: 10,
  minHeight: 38,
  padding: "0 12px",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const emptyStyle: CSSProperties = {
  fontWeight: 800,
};

const switchRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 10,
  marginBottom: 12,
};

const modeBtn = (active: boolean, theme: any): CSSProperties => ({
  minHeight: "48px",
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  border: `var(--sa-border-w) solid ${theme.accent}`,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
});

const formGrid: CSSProperties = {
  display: "grid",
  gap: 8,
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
};

const dateTwoColGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  width: "100%",
  marginBottom: 10,
};

const fieldBlockStyle: CSSProperties = {
  minWidth: 0,
  width: "100%",
};

const labelStyle: CSSProperties = {
  fontWeight: 900,
  marginTop: 6,
  marginBottom: 6,
  display: "block",
  fontSize: "var(--sa-fs-base)",
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
  fontSize: "var(--sa-input-fs)",
  marginBottom: 8,
  display: "block",
  outline: "none",
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  WebkitAppearance: "none" as any,
  appearance: "none" as any,
  textAlign: "center",
  paddingLeft: 10,
  paddingRight: 10,
};

const paymentToggleBtnStyle: CSSProperties = {
  width: "100%",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
  marginBottom: 10,
};

const paymentAddBoxStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  border: "var(--sa-border-w) dashed",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  marginBottom: 10,
};

const uploadQrBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "48px",
  padding: "0 14px",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
  cursor: "pointer",
};

const qrPreviewStyle: CSSProperties = {
  width: "clamp(92px, 22vw, 120px)",
  height: "clamp(92px, 22vw, 120px)",
  objectFit: "contain",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  background: "#fff",
  padding: 6,
};

const addBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "48px",
  padding: "0 16px",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const twoButtonRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  alignItems: "center",
};

const dangerOutlineBtnStyle: CSSProperties = {
  minHeight: "48px",
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid #fecaca",
  background: "#fff",
  color: "#dc2626",
  fontWeight: 900,
};

const companyBox: CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  flexWrap: "wrap",
};

const companyEditBoxStyle: CSSProperties = {
  marginTop: 12,
  border: "var(--sa-border-w) dashed",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const logoStyle: CSSProperties = {
  width: "clamp(64px, 15vw, 80px)",
  height: "clamp(64px, 15vw, 80px)",
  borderRadius: 12,
  objectFit: "cover",
};

const logoPlaceholder: CSSProperties = {
  width: "clamp(64px, 15vw, 80px)",
  height: "clamp(64px, 15vw, 80px)",
  borderRadius: 12,
  background: "#ccfbf1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  color: "#0f766e",
};

const editBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  background: "#fff",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "46px",
  padding: "0 14px",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const submitSmallBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "48px",
  padding: "0 16px",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const submitBtn: CSSProperties = {
  width: "100%",
  marginTop: 18,
  minHeight: "54px",
  padding: "0 16px",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  color: "#fff",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const actionRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
  marginTop: 12,
};

const secondaryBtn: CSSProperties = {
  minHeight: "50px",
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  background: "#fff",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const whatsappBtn: CSSProperties = {
  minHeight: "50px",
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  border: "none",
  background: "#25D366",
  color: "#fff",
  fontWeight: 900,
  fontSize: "var(--sa-btn-fs)",
};

const msgStyle: CSSProperties = {
  marginTop: 14,
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
};

const chargeGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const chargeBoxStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const chargeInputRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 92px",
  gap: 8,
  alignItems: "center",
};

const productLineBoxStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const productLineTitleStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
  marginBottom: 10,
};

const dangerMiniBtnStyle: CSSProperties = {
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: "var(--sa-radius-control)",
  minHeight: 40,
  padding: "0 12px",
  fontWeight: 900,
};

const signatureInputBoxStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  marginBottom: 14,
};

const signatureMiniPreviewStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 10,
};

const signatureMiniImageStyle: CSSProperties = {
  maxWidth: 160,
  maxHeight: 70,
  objectFit: "contain",
};

const screenPreviewWrapStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  background: "#f8fafc",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  boxSizing: "border-box",
};

const screenInvoiceInnerStyle: CSSProperties = {
  width: 780,
  minWidth: 780,
  maxWidth: "none",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.55)",
  padding: "clamp(10px, 3vw, 22px)",
  zIndex: 10000,
  overflowY: "auto",
};

const signatureModalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 900,
  margin: "0 auto",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
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
  fontSize: "clamp(12px, 1.7vw, 15px)",
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
  fontSize: "clamp(18px, 2.8vw, 24px)",
  fontWeight: 900,
};

const officialInvoiceTitleBlockStyle: CSSProperties = {
  textAlign: "right",
};

const officialInvoiceWordStyle: CSSProperties = {
  color: "#0f766e",
  fontSize: "clamp(26px, 4vw, 36px)",
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
  gap: 10,
  padding: "10px 0",
  borderBottom: "1px solid #e2e8f0",
};

const officialTotalRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "12px 0",
  color: "#0f766e",
  fontSize: "clamp(18px, 3vw, 24px)",
  fontWeight: 900,
};

const officialProfitRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "10px 0",
  color: "#16a34a",
  fontSize: "clamp(16px, 2.6vw, 20px)",
  fontWeight: 900,
};

const officialNoteStyle: CSSProperties = {
  marginTop: 28,
  color: "#64748b",
};

const officialSignatureWrapStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 28,
  marginTop: 44,
  pageBreakInside: "avoid",
};

const officialSignatureBoxStyle: CSSProperties = {
  minHeight: 120,
  textAlign: "center",
};

const officialSignatureImageStyle: CSSProperties = {
  maxWidth: 220,
  maxHeight: 90,
  objectFit: "contain",
  marginBottom: 6,
};

const officialSignatureTextStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 8,
  color: "#111827",
};

const officialSignatureLineStyle: CSSProperties = {
  borderTop: "1px solid #111827",
  width: "100%",
  marginTop: 8,
};

const officialSignatureLabelStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "#475569",
  fontWeight: 800,
};
