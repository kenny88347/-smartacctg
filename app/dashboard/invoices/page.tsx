"use client";

import {
  CSSProperties,
  ChangeEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
type Mode = "list" | "new";
type ChargeMode = "%" | "RM";

type Customer = {
  id: string;
  user_id?: string;
  name: string;
  phone?: string | null;
  company_name?: string | null;
  address?: string | null;
  debt_amount?: number | null;
  paid_amount?: number | null;
  last_payment_date?: string | null;
  status?: string | null;
  customer_status?: string | null;
};

type Product = {
  id: string;
  user_id?: string;
  name: string;
  price?: number | null;
  cost?: number | null;
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

type PrintableItem = {
  product?: Partial<Product> | null;
  calc: {
    name?: string;
    qty?: number;
    price?: number;
    cost?: number;
    stock?: number;
    discount?: number;
    lineSubtotal?: number;
    lineTotal?: number;
    lineCost?: number;
    lineProfit?: number;
  };
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";

const PAYMENT_OPTIONS_KEY = "smartacctg_payment_options";
const SIGNATURE_OPTIONS_KEY = "smartacctg_signature_options";
const LANG_KEY = "smartacctg_lang";

const today = () => new Date().toISOString().slice(0, 10);

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
    customerSignNotice: "客户签名不会保存到签名库，只会显示在这张发票预览。",
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
  .smartacctg-invoice-page input[type="date"] {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    height: var(--sa-control-h, 54px) !important;
    min-height: var(--sa-control-h, 54px) !important;
    text-align: center !important;
    text-align-last: center !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    line-height: var(--sa-control-h, 54px) !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  .smartacctg-invoice-page input[type="date"]::-webkit-date-and-time-value {
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    min-height: 1.6em !important;
    line-height: normal !important;
  }

  .smartacctg-invoice-page input[type="date"]::-webkit-datetime-edit {
    width: 100% !important;
    padding: 0 !important;
    text-align: center !important;
  }

  .smartacctg-invoice-page input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
  }

  .smartacctg-invoice-page .same-size-action-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
    align-items: stretch !important;
  }

  .smartacctg-invoice-page .same-size-action-row > button {
    width: 100% !important;
    min-width: 0 !important;
    min-height: var(--sa-control-h, 54px) !important;
    height: 100% !important;
    margin: 0 !important;
  }

  .smartacctg-invoice-page .company-info-box {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 14px !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  .smartacctg-invoice-page .company-info-text {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    white-space: normal !important;
    line-height: 1.45 !important;
  }

  .smartacctg-invoice-page .company-info-text * {
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    white-space: normal !important;
  }

  .smartacctg-invoice-page .invoice-preview-action-row {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
    margin-top: 14px !important;
  }

  .smartacctg-invoice-page .invoice-preview-action-row button {
    width: 100% !important;
    min-width: 0 !important;
    min-height: 50px !important;
    padding: 0 8px !important;
    white-space: nowrap !important;
    font-weight: 900 !important;
  }

  .smartacctg-invoice-page .invoice-record-action-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
    margin-top: 14px !important;
  }

  .smartacctg-invoice-page .invoice-record-action-row button {
    width: 100% !important;
    min-width: 0 !important;
    min-height: 52px !important;
    border-radius: var(--sa-radius-control, 16px) !important;
    padding: 0 12px !important;
    font-weight: 900 !important;
    white-space: nowrap !important;
    line-height: 1.15 !important;
  }

  .smartacctg-invoice-page .fullscreen-invoice-modal {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-radius: 0 !important;
    border: none !important;
    padding: max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)) !important;
    box-sizing: border-box !important;
  }

  .smartacctg-invoice-page .fullscreen-invoice-modal .sa-titlebar {
    position: sticky !important;
    top: 0 !important;
    z-index: 20 !important;
    background: inherit !important;
    padding-bottom: 12px !important;
    margin-bottom: 12px !important;
  }

  .smartacctg-invoice-page .signature-canvas {
    width: 100% !important;
    height: 220px !important;
    background: #fff !important;
    border: 3px solid var(--sa-border, #14b8a6) !important;
    border-radius: 18px !important;
    touch-action: none !important;
  }

  @media (max-width: 768px) {
    .smartacctg-invoice-page .company-info-box {
      grid-template-columns: auto minmax(0, 1fr) !important;
    }

    .smartacctg-invoice-page .company-info-box button {
      grid-column: 1 / -1 !important;
      width: 100% !important;
    }

    .smartacctg-invoice-page .invoice-preview-action-row {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 8px !important;
    }

    .smartacctg-invoice-page .invoice-preview-action-row button {
      font-size: 14px !important;
      padding: 0 5px !important;
    }

    .smartacctg-invoice-page .invoice-record-action-row {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .smartacctg-invoice-page .fullscreen-invoice-modal input,
    .smartacctg-invoice-page .fullscreen-invoice-modal select,
    .smartacctg-invoice-page .fullscreen-invoice-modal textarea {
      font-size: 16px !important;
    }
  }

  @media (max-width: 390px) {
    .smartacctg-invoice-page .invoice-preview-action-row {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-invoice-page .same-size-action-row {
      grid-template-columns: 1fr !important;
    }
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
  const sign = num < 0 ? "-" : "";
  return `${sign}RM ${Math.abs(num).toFixed(2)}`;
}

function formatRM(value: number) {
  return `RM ${Number(value || 0).toFixed(2)}`;
}

function formatDateTime(createdAt?: string | null, fallbackDate?: string | null) {
  if (createdAt) {
    try {
      return new Date(createdAt).toLocaleString();
    } catch {
      return createdAt;
    }
  }

  return fallbackDate || "-";
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

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "list";
  const q = new URLSearchParams(window.location.search);
  return q.get("open") === "new" ? "new" : "list";
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
  const theme = (THEMES[fixedKey] || THEMES.deepTeal) as any;

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
    lower.includes("column") ||
    lower.includes("does not exist")
  );
}

function isMissingTable(message: string) {
  const lower = String(message || "").toLowerCase();

  return (
    lower.includes("relation") ||
    lower.includes("does not exist") ||
    lower.includes("table")
  );
}

function isPaidStatus(status?: string | null) {
  return String(status || "").toLowerCase() === "paid";
}

function isCancelledStatus(status?: string | null) {
  const s = String(status || "").toLowerCase();
  return s === "cancelled" || s === "canceled";
}

export default function InvoicesPage() {
  const [mode, setMode] = useState<Mode>(getInitialMode);
  const [isFullscreen, setIsFullscreen] = useState(getIsFullscreenFromUrl);
  const [returnTo, setReturnTo] = useState(getReturnFromUrl);

  const [sessionUserId, setSessionUserId] = useState("");
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(DEFAULT_PAYMENT_OPTIONS);
  const [signatureOptions, setSignatureOptions] = useState<SignatureOption[]>([]);

  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [invoiceNo, setInvoiceNo] = useState(makeInvoiceNo());
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState(today());
  const [status, setStatus] = useState("sent");

  const [selectedPaymentId, setSelectedPaymentId] = useState("cash");
  const [showPaymentAdd, setShowPaymentAdd] = useState(false);
  const [paymentName, setPaymentName] = useState("");
  const [paymentBankAccount, setPaymentBankAccount] = useState("");
  const [paymentReceiverName, setPaymentReceiverName] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [paymentQrCodeUrl, setPaymentQrCodeUrl] = useState("");

  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const [customerMode, setCustomerMode] = useState<"select" | "new">("select");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([makeInvoiceItem()]);

  const [discountInput, setDiscountInput] = useState<ChargeInput>({ mode: "RM", value: "0" });
  const [sstInput, setSstInput] = useState<ChargeInput>({ mode: "%", value: "0" });
  const [serviceFeeInput, setServiceFeeInput] = useState<ChargeInput>({ mode: "RM", value: "0" });
  const [handlingFeeInput, setHandlingFeeInput] = useState<ChargeInput>({ mode: "RM", value: "0" });
  const [note, setNote] = useState("");

  const [selectedSignatureId, setSelectedSignatureId] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [signatureImageUrl, setSignatureImageUrl] = useState("");
  const [customerSignatureImageUrl, setCustomerSignatureImageUrl] = useState("");

  const [signaturePadTarget, setSignaturePadTarget] = useState<"issuer" | "customer" | null>(
    null
  );

  const [lastPrintableInvoice, setLastPrintableInvoice] = useState<InvoiceRecord | null>(null);
  const [lastPrintableItems, setLastPrintableItems] = useState<PrintableItem[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const t = TXT[lang];
  const theme = (THEMES[themeKey] || THEMES.deepTeal) as any;

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

  const themedPanelStyle: CSSProperties = {
    borderColor: theme.border,
    background: theme.panelBg || theme.card,
    color: theme.panelText || theme.text,
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
    const openParam = q.get("open");
    const fullscreenParam = q.get("fullscreen");
    const returnParam = q.get("return");

    setReturnTo(returnParam || "");
    setIsFullscreen(fullscreenParam === "1");

    if (openParam === "new") setMode("new");

    init(initialLang, initialTheme);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(currentLang: Lang, currentTheme: ThemeKey) {
    const q = new URLSearchParams(window.location.search);
    const modeParam = q.get("mode");
    const trialRaw = safeLocalGet(TRIAL_KEY);

    const savedPayment = safeParseArray<PaymentOption>(safeLocalGet(PAYMENT_OPTIONS_KEY));
    const savedSignatures = safeParseArray<SignatureOption>(safeLocalGet(SIGNATURE_OPTIONS_KEY));

    if (savedPayment.length > 0) setPaymentOptions(savedPayment);
    if (savedSignatures.length > 0) setSignatureOptions(savedSignatures);

    if ((modeParam === "trial" || trialRaw) && trialRaw) {
      try {
        const trial = JSON.parse(trialRaw);

        if (Date.now() < Number(trial.expiresAt)) {
          setIsTrial(true);
          setSessionUserId("trial");

          setCustomers(safeParseArray<Customer>(safeLocalGet(TRIAL_CUSTOMERS_KEY)));
          setProducts(safeParseArray<Product>(safeLocalGet(TRIAL_PRODUCTS_KEY)));
          setInvoices(safeParseArray<InvoiceRecord>(safeLocalGet(TRIAL_INVOICES_KEY)));

          replaceUrlLangTheme(currentLang, currentTheme);
          return;
        }
      } catch {
        // Bad trial data, clear below.
      }

      safeLocalRemove(TRIAL_KEY);
      safeLocalRemove(TRIAL_TX_KEY);
      safeLocalRemove(TRIAL_CUSTOMERS_KEY);
      safeLocalRemove(TRIAL_PRODUCTS_KEY);
      safeLocalRemove(TRIAL_INVOICES_KEY);

      window.location.href = "/zh";
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/zh";
      return;
    }

    const userId = data.session.user.id;

    setSessionUserId(userId);
    setIsTrial(false);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    let finalTheme = currentTheme;

    if (profileData) {
      const profileTheme = normalizeThemeKey(profileData.theme || currentTheme);

      finalTheme = profileTheme;
      setThemeKey(profileTheme);
      saveThemeKey(profileTheme);
      applyThemeEverywhere(profileTheme);

      setCompanyLogoUrl(profileData.company_logo_url || profileData.logo_url || "");
      setCompanyName(profileData.company_name || "");
      setCompanyRegNo(profileData.company_reg_no || "");
      setCompanyPhone(profileData.company_phone || profileData.phone || "");
      setCompanyAddress(profileData.company_address || "");
    }

    replaceUrlLangTheme(currentLang, finalTheme);

    await loadAll(userId);
  }

  async function loadAll(userId: string) {
    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setCustomers((customerData || []) as Customer[]);
    setProducts((productData || []) as Product[]);
    setInvoices((invoiceData || []) as InvoiceRecord[]);
  }

  async function loadProducts(userId: string) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setProducts((data || []) as Product[]);
  }

  function savePaymentOptions(next: PaymentOption[]) {
    setPaymentOptions(next);
    safeLocalSet(PAYMENT_OPTIONS_KEY, JSON.stringify(next));
  }

  function saveSignatureOptions(next: SignatureOption[]) {
    setSignatureOptions(next);
    safeLocalSet(SIGNATURE_OPTIONS_KEY, JSON.stringify(next));
  }

  function getSelectedPayment() {
    return (
      paymentOptions.find((p) => p.id === selectedPaymentId) ||
      paymentOptions[0] ||
      DEFAULT_PAYMENT_OPTIONS[0]
    );
  }

  function getPaymentText() {
    return getSelectedPayment()?.name || "-";
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Upload failed"));
      reader.readAsDataURL(file);
    });
  }

  async function uploadPaymentQr(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setPaymentQrCodeUrl(dataUrl);
    } catch (error: any) {
      setMsg(t.fail + (error?.message || String(error)));
    }
  }

  async function uploadSignatureImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setSignatureImageUrl(dataUrl);
      setMsg(t.saved);
    } catch (error: any) {
      setMsg(t.fail + (error?.message || String(error)));
    }
  }

  function addPaymentOption() {
    const name = paymentName.trim();

    if (!name) return;

    const nextOption: PaymentOption = {
      id: makeId("pay"),
      name,
      bankAccount: paymentBankAccount.trim(),
      receiverName: paymentReceiverName.trim(),
      link: paymentLink.trim(),
      qrCodeUrl: paymentQrCodeUrl.trim(),
    };

    const next = [...paymentOptions, nextOption];

    savePaymentOptions(next);
    setSelectedPaymentId(nextOption.id);

    setPaymentName("");
    setPaymentBankAccount("");
    setPaymentReceiverName("");
    setPaymentLink("");
    setPaymentQrCodeUrl("");
    setShowPaymentAdd(false);

    setMsg(t.saved);
  }

  function deletePaymentOption() {
    if (!selectedPaymentId) return;

    const next = paymentOptions.filter((p) => p.id !== selectedPaymentId);
    const fixed = next.length > 0 ? next : DEFAULT_PAYMENT_OPTIONS;

    savePaymentOptions(fixed);
    setSelectedPaymentId(fixed[0].id);
    setMsg(t.saved);
  }

  function saveSignatureOption() {
    const text = signatureText.trim();
    const image = signatureImageUrl.trim();

    if (!text && !image) return;

    const nextOption: SignatureOption = {
      id: makeId("sig"),
      name: text || "Signature",
      signatureText: text,
      signatureImageUrl: image,
    };

    const next = [nextOption, ...signatureOptions];

    saveSignatureOptions(next);
    setSelectedSignatureId(nextOption.id);
    setMsg(t.saved);
  }

  function deleteSignatureOption() {
    if (!selectedSignatureId) return;

    const next = signatureOptions.filter((x) => x.id !== selectedSignatureId);

    saveSignatureOptions(next);
    setSelectedSignatureId("");
    setSignatureText("");
    setSignatureImageUrl("");
    setMsg(t.saved);
  }

  function chooseSignature(id: string) {
    setSelectedSignatureId(id);

    const sig = signatureOptions.find((x) => x.id === id);

    if (!sig) {
      setSignatureText("");
      setSignatureImageUrl("");
      return;
    }

    setSignatureText(sig.signatureText || "");
    setSignatureImageUrl(sig.signatureImageUrl || "");
  }

  function switchLang(next: Lang) {
    setLang(next);
    safeLocalSet(LANG_KEY, next);
    replaceUrlLangTheme(next, themeKey);
  }

  function buildDashboardUrl() {
    const q = new URLSearchParams();

    if (isTrial) q.set("mode", "trial");

    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    return `/dashboard?${q.toString()}`;
  }

  function goBack() {
    window.location.href = buildDashboardUrl();
  }

  function resetInvoiceForm() {
    setInvoiceNo(makeInvoiceNo());
    setInvoiceDate(today());
    setDueDate(today());
    setStatus("sent");

    setSelectedPaymentId(paymentOptions[0]?.id || DEFAULT_PAYMENT_OPTIONS[0].id);
    setShowPaymentAdd(false);

    setCustomerMode("select");
    setSelectedCustomerId("");
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerCompany("");
    setNewCustomerAddress("");

    setItems([makeInvoiceItem()]);

    setDiscountInput({ mode: "RM", value: "0" });
    setSstInput({ mode: "%", value: "0" });
    setServiceFeeInput({ mode: "RM", value: "0" });
    setHandlingFeeInput({ mode: "RM", value: "0" });

    setNote("");

    setSelectedSignatureId("");
    setSignatureText("");
    setSignatureImageUrl("");
    setCustomerSignatureImageUrl("");

    setLastPrintableInvoice(null);
    setLastPrintableItems([]);

    setMsg("");
  }

  function openNewInvoice(forceFullscreen = false) {
    resetInvoiceForm();
    setMode("new");
    setIsFullscreen(forceFullscreen);
  }

  function closeInvoiceForm() {
    const q = new URLSearchParams(window.location.search);
    const returnParam = q.get("return") || returnTo;

    if (returnParam === "dashboard") {
      window.location.href = buildDashboardUrl();
      return;
    }

    setMode("list");
    setIsFullscreen(false);

    q.delete("open");
    q.delete("fullscreen");
    q.delete("return");
    q.set("lang", lang);
    q.set("theme", themeKey);
    q.set("refresh", String(Date.now()));

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
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

  function getProduct(item: InvoiceItem) {
    return products.find((p) => p.id === item.productId) || null;
  }

  function getItemCalc(item: InvoiceItem) {
    const product = getProduct(item);

    const name =
      item.productMode === "new" ? item.newProductName || "-" : product?.name || "-";

    const price =
      item.productMode === "new"
        ? Number(item.newProductPrice || 0)
        : Number(product?.price || 0);

    const cost =
      item.productMode === "new"
        ? Number(item.newProductCost || 0)
        : Number(product?.cost || 0);

    const stock =
      item.productMode === "new"
        ? Number(item.newProductStock || 0)
        : Number(product?.stock_qty || 0);

    const qty = Number(item.qty || 0);
    const discount = Number(item.discount || 0);

    const lineSubtotal = roundMoney(price * qty);
    const lineTotal = roundMoney(lineSubtotal - discount);
    const lineCost = roundMoney(cost * qty);
    const lineProfit = roundMoney(lineTotal - lineCost);

    return {
      product,
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

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  const activeCustomer: Customer =
    customerMode === "select"
      ? selectedCustomer || {
          id: "",
          name: "-",
          phone: "",
          company_name: "",
          address: "",
        }
      : {
          id: "",
          name: newCustomerName || "-",
          phone: newCustomerPhone,
          company_name: newCustomerCompany,
          address: newCustomerAddress,
        };

  const itemCalcs = useMemo(() => {
    return items.map((item) => ({ item, calc: getItemCalc(item) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, products]);

  const preview = useMemo(() => {
    const subtotal = roundMoney(itemCalcs.reduce((s, x) => s + x.calc.lineSubtotal, 0));
    const productDiscount = roundMoney(itemCalcs.reduce((s, x) => s + x.calc.discount, 0));

    const afterProductDiscount = roundMoney(subtotal - productDiscount);

    const extraDiscount = calcDiscountCharge(
      discountInput.value,
      discountInput.mode,
      afterProductDiscount
    );

    const sst = calcCharge(sstInput.value, sstInput.mode, afterProductDiscount);
    const serviceFee = calcCharge(serviceFeeInput.value, serviceFeeInput.mode, afterProductDiscount);
    const handlingFee = calcCharge(
      handlingFeeInput.value,
      handlingFeeInput.mode,
      afterProductDiscount
    );

    const total = roundMoney(afterProductDiscount + extraDiscount + sst + serviceFee + handlingFee);
    const totalCost = roundMoney(itemCalcs.reduce((s, x) => s + x.calc.lineCost, 0));
    const profit = roundMoney(total - totalCost);

    return {
      subtotal,
      productDiscount,
      afterProductDiscount,
      extraDiscount,
      sst,
      serviceFee,
      handlingFee,
      total,
      totalCost,
      profit,
    };
  }, [itemCalcs, discountInput, sstInput, serviceFeeInput, handlingFeeInput]);

  const filteredInvoices = useMemo(() => {
    const s = search.trim().toLowerCase();

    if (!s) return invoices;

    return invoices.filter((inv) => {
      return [
        inv.invoice_no,
        inv.customer_name,
        inv.customer_phone,
        inv.customer_company,
        inv.total,
        inv.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s);
    });
  }, [invoices, search]);

  const currentPreviewInvoice: InvoiceRecord = {
    id: "",
    user_id: sessionUserId,
    invoice_no: invoiceNo,
    invoice_date: invoiceDate,
    due_date: dueDate,
    status,
    customer_id: activeCustomer.id || "",
    customer_name: activeCustomer.name || "",
    customer_phone: activeCustomer.phone || "",
    customer_company: activeCustomer.company_name || "",
    customer_address: activeCustomer.address || "",
    subtotal: preview.subtotal,
    discount: preview.productDiscount + Math.abs(preview.extraDiscount),
    total: preview.total,
    total_cost: preview.totalCost,
    total_profit: preview.profit,
    payment_method: getPaymentText(),
    note,
    created_at: new Date().toISOString(),
  };

  function statusText(statusValue?: string | null) {
    if (statusValue === "draft") return t.draft;
    if (statusValue === "paid") return t.paid;
    if (statusValue === "cancelled") return t.cancelled;
    return t.sent;
  }

  function selectedPaymentDetail(inv?: InvoiceRecord | null) {
    const paymentNameText = inv?.payment_method || getPaymentText();

    return (
      paymentOptions.find((p) => p.id === paymentNameText || p.name === paymentNameText) ||
      getSelectedPayment()
    );
  }

  async function insertAdaptive(table: string, payloadInput: Record<string, any>) {
    let payload: Record<string, any> = { ...payloadInput };
    let lastError: any = null;

    const optionalKeys = [
      "customer_phone",
      "customer_company",
      "customer_address",
      "due_date",
      "status",
      "payment_method",
      "subtotal",
      "discount",
      "total_cost",
      "total_profit",
      "note",
      "source_type",
      "source_id",
      "debt_amount",
      "category_name",
      "product_name",
      "qty",
      "unit_price",
      "unit_cost",
      "line_total",
      "line_profit",
      "stock_qty",
      "cost",
      "company_logo_url",
      "logo_url",
      "company_reg_no",
      "company_phone",
      "company_address",
      "last_payment_date",
      "customer_status",
    ];

    for (let i = 0; i < 40; i++) {
      const { data, error } = await supabase.from(table).insert(payload).select("*").single();

      if (!error) return data;

      lastError = error;

      if (isMissingTable(error.message) && table === "invoice_items") {
        return null;
      }

      if (!isSchemaCacheMissing(error.message)) throw error;

      const missingMatch =
        error.message.match(/Could not find the '([^']+)' column/i) ||
        error.message.match(/column "([^"]+)" does not exist/i);

      const missing = missingMatch?.[1];

      if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
        const next = { ...payload };
        delete next[missing];
        payload = next;
        continue;
      }

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

  async function updateAdaptive(
    table: string,
    id: string,
    userId: string,
    payloadInput: Record<string, any>
  ) {
    let payload: Record<string, any> = { ...payloadInput };
    let lastError: any = null;

    const optionalKeys = [
      "company_logo_url",
      "logo_url",
      "company_name",
      "company_reg_no",
      "company_phone",
      "company_address",
      "phone",
      "debt_amount",
      "paid_amount",
      "last_payment_date",
      "status",
      "customer_status",
    ];

    for (let i = 0; i < 30; i++) {
      const { error } = await supabase.from(table).update(payload).eq("id", id).eq("user_id", userId);

      if (!error) return;

      lastError = error;

      if (!isSchemaCacheMissing(error.message)) throw error;

      const missingMatch =
        error.message.match(/Could not find the '([^']+)' column/i) ||
        error.message.match(/column "([^"]+)" does not exist/i);

      const missing = missingMatch?.[1];

      if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
        const next = { ...payload };
        delete next[missing];
        payload = next;
        continue;
      }

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

  async function saveCompanyInfo() {
    if (isTrial) {
      setMsg(t.saved);
      return;
    }

    if (!sessionUserId) return;

    try {
      await updateAdaptive("profiles", sessionUserId, sessionUserId, {
        company_logo_url: companyLogoUrl,
        logo_url: companyLogoUrl,
        company_name: companyName,
        company_reg_no: companyRegNo,
        company_phone: companyPhone,
        phone: companyPhone,
        company_address: companyAddress,
      });

      setMsg(t.saved);
      setShowCompanyForm(false);
    } catch (error: any) {
      setMsg(t.fail + (error?.message || String(error)));
    }
  }

  async function updateProductStock(productId: string, nextStock: number) {
    if (!productId || isTrial) return;

    const columns = ["stock_qty", "stock", "stock_quantity", "quantity", "qty"];

    for (const col of columns) {
      const { error } = await supabase
        .from("products")
        .update({ [col]: nextStock })
        .eq("id", productId)
        .eq("user_id", sessionUserId);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock_qty: nextStock } : p))
        );
        return;
      }

      if (!isSchemaCacheMissing(error.message)) throw error;
    }
  }

  async function createCustomerIfNeeded() {
    if (customerMode === "select") {
      return selectedCustomer;
    }

    const name = newCustomerName.trim();

    if (!name) {
      throw new Error(t.needNewCustomer);
    }

    const trialCustomer: Customer = {
      id: makeId("customer"),
      user_id: isTrial ? "trial" : sessionUserId,
      name,
      phone: newCustomerPhone.trim(),
      company_name: newCustomerCompany.trim(),
      address: newCustomerAddress.trim(),
      debt_amount: 0,
      paid_amount: 0,
      last_payment_date: dueDate,
    };

    if (isTrial) {
      const nextCustomers = [trialCustomer, ...customers];
      setCustomers(nextCustomers);
      safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
      return trialCustomer;
    }

    const data = await insertAdaptive("customers", {
      user_id: sessionUserId,
      name,
      phone: newCustomerPhone.trim(),
      company_name: newCustomerCompany.trim(),
      address: newCustomerAddress.trim(),
      debt_amount: 0,
      paid_amount: 0,
      last_payment_date: dueDate,
    });

    const saved = data as Customer;
    setCustomers((prev) => [saved, ...prev]);

    return saved;
  }

  async function createProductIfNeeded(item: InvoiceItem) {
    const calc = getItemCalc(item);

    if (item.productMode === "select") {
      if (!calc.product) throw new Error(t.needProduct);
      return calc.product;
    }

    const productName = item.newProductName.trim();

    if (!productName) throw new Error(t.needProduct);

    const newProduct: Product = {
      id: makeId("product"),
      user_id: isTrial ? "trial" : sessionUserId,
      name: productName,
      price: Number(item.newProductPrice || 0),
      cost: Number(item.newProductCost || 0),
      stock_qty: Number(item.newProductStock || 0),
      note: t.productNote,
    };

    if (isTrial) {
      const nextProducts = [newProduct, ...products];
      setProducts(nextProducts);
      safeLocalSet(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
      return newProduct;
    }

    const data = await insertAdaptive("products", {
      user_id: sessionUserId,
      name: newProduct.name,
      price: newProduct.price,
      cost: newProduct.cost,
      stock_qty: newProduct.stock_qty,
      note: newProduct.note,
    });

    const saved = data as Product;
    setProducts((prev) => [saved, ...prev]);

    return saved;
  }

  async function addDebtToCustomer(customerId: string, amount: number) {
    if (!customerId || amount <= 0 || isPaidStatus(status) || isCancelledStatus(status)) return;

    const current = customers.find((c) => c.id === customerId);
    const nextDebt = Number(current?.debt_amount || 0) + Number(amount || 0);

    if (isTrial) {
      const next = customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              debt_amount: nextDebt,
              last_payment_date: dueDate,
              status: "debt",
              customer_status: "debt",
            }
          : c
      );

      setCustomers(next);
      safeLocalSet(TRIAL_CUSTOMERS_KEY, JSON.stringify(next));
      return;
    }

    try {
      await updateAdaptive("customers", customerId, sessionUserId, {
        debt_amount: nextDebt,
        last_payment_date: dueDate,
        status: "debt",
        customer_status: "debt",
      });

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                debt_amount: nextDebt,
                last_payment_date: dueDate,
                status: "debt",
                customer_status: "debt",
              }
            : c
        )
      );
    } catch {
      // Do not block invoice generation if the debt columns do not exist.
    }
  }

  async function createInvoice() {
    setMsg("");

    if (customerMode === "select" && !selectedCustomer) {
      setMsg(t.needCustomer);
      return;
    }

    if (customerMode === "new" && !newCustomerName.trim()) {
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

      if (item.productMode === "new" && !item.newProductName.trim()) {
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

    setIsGenerating(true);

    try {
      const finalCustomer = await createCustomerIfNeeded();

      if (!finalCustomer) {
        setMsg(t.needCustomer);
        setIsGenerating(false);
        return;
      }

      const finalItems: PrintableItem[] = [];

      for (const pair of itemCalcs) {
        const product = await createProductIfNeeded(pair.item);
        const calc = getItemCalc({
          ...pair.item,
          productId: product.id,
          productMode: "select",
        });

        finalItems.push({
          product,
          calc: {
            ...pair.calc,
            product,
            name: product.name,
            price: Number(product.price || pair.calc.price || 0),
            cost: Number(product.cost || pair.calc.cost || 0),
            stock: Number(product.stock_qty || pair.calc.stock || 0),
          },
        });
      }

      const invoicePayload = {
        user_id: sessionUserId,
        customer_id: finalCustomer.id,
        customer_name: finalCustomer.name,
        customer_phone: finalCustomer.phone || "",
        customer_company: finalCustomer.company_name || "",
        customer_address: finalCustomer.address || "",
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status,
        payment_method: getPaymentText(),
        subtotal: preview.subtotal,
        discount: preview.productDiscount + Math.abs(preview.extraDiscount),
        total: preview.total,
        total_cost: preview.totalCost,
        total_profit: preview.profit,
        note,
      };

      const printableRecord: InvoiceRecord = {
        id: makeId("invoice"),
        ...invoicePayload,
        created_at: new Date().toISOString(),
      };

      if (isTrial) {
        const nextProducts = products.map((p) => {
          const used = finalItems.find((x) => x.product?.id === p.id);
          if (!used) return p;

          const nextStock = Math.max(Number(p.stock_qty || 0) - Number(used.calc.qty || 0), 0);

          return { ...p, stock_qty: nextStock };
        });

        const nextInvoices = [printableRecord, ...invoices];

        const oldTx = safeParseArray<any>(safeLocalGet(TRIAL_TX_KEY));
        const nextTx = [
          {
            id: makeId("txn"),
            user_id: "trial",
            txn_date: invoiceDate,
            txn_type: "income",
            amount: preview.total,
            category_name:
              lang === "zh" ? "发票收入" : lang === "en" ? "Invoice Income" : "Pendapatan Invois",
            debt_amount: 0,
            source_type: "invoice",
            source_id: printableRecord.id,
            note: `${invoiceNo}｜${finalCustomer.name}`,
            created_at: new Date().toISOString(),
          },
          ...oldTx,
        ];

        setProducts(nextProducts);
        setInvoices(nextInvoices);
        setLastPrintableInvoice(printableRecord);
        setLastPrintableItems(finalItems);

        safeLocalSet(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
        safeLocalSet(TRIAL_INVOICES_KEY, JSON.stringify(nextInvoices));
        safeLocalSet(TRIAL_TX_KEY, JSON.stringify(nextTx));

        await addDebtToCustomer(finalCustomer.id, preview.total);

        setMsg(t.trialSuccess);
        setIsGenerating(false);

        if (returnTo === "dashboard") {
          setTimeout(() => {
            window.location.href = buildDashboardUrl();
          }, 500);
          return;
        }

        setMode("list");
        setIsFullscreen(false);
        return;
      }

      const savedInvoice = (await insertAdaptive("invoices", invoicePayload)) as InvoiceRecord;

      for (const { product, calc } of finalItems) {
        await insertAdaptive("invoice_items", {
          invoice_id: savedInvoice.id,
          product_id: product?.id,
          product_name: product?.name,
          qty: calc.qty,
          unit_price: calc.price,
          unit_cost: calc.cost,
          discount: calc.discount,
          line_total: calc.lineTotal,
          line_profit: calc.lineProfit,
        });

        const newStock = Math.max(Number(product?.stock_qty || 0) - Number(calc.qty || 0), 0);

        if (product?.id) await updateProductStock(product.id, newStock);
      }

      await insertAdaptive("transactions", {
        user_id: sessionUserId,
        txn_date: invoiceDate,
        txn_type: "income",
        amount: preview.total,
        category_name:
          lang === "zh" ? "发票收入" : lang === "en" ? "Invoice Income" : "Pendapatan Invois",
        debt_amount: 0,
        source_type: "invoice",
        source_id: savedInvoice.id,
        note: `${invoiceNo}｜${finalCustomer.name}`,
      });

      await addDebtToCustomer(finalCustomer.id, preview.total);

      const finalRecord: InvoiceRecord = {
        ...printableRecord,
        ...savedInvoice,
        invoice_no: savedInvoice.invoice_no || invoiceNo,
        invoice_date: savedInvoice.invoice_date || invoiceDate,
        due_date: savedInvoice.due_date || dueDate,
        status: savedInvoice.status || status,
        customer_name: savedInvoice.customer_name || finalCustomer.name,
        customer_phone: savedInvoice.customer_phone || finalCustomer.phone || "",
        customer_company: savedInvoice.customer_company || finalCustomer.company_name || "",
        customer_address: savedInvoice.customer_address || finalCustomer.address || "",
        payment_method: savedInvoice.payment_method || getPaymentText(),
        subtotal: savedInvoice.subtotal ?? preview.subtotal,
        discount:
          savedInvoice.discount ?? preview.productDiscount + Math.abs(preview.extraDiscount),
        total: savedInvoice.total ?? preview.total,
        total_cost: savedInvoice.total_cost ?? preview.totalCost,
        total_profit: savedInvoice.total_profit ?? preview.profit,
        created_at: savedInvoice.created_at || new Date().toISOString(),
      };

      setInvoices((prev) => [finalRecord, ...prev]);
      setLastPrintableInvoice(finalRecord);
      setLastPrintableItems(finalItems);

      await loadProducts(sessionUserId);

      setMsg(t.success);
      setIsGenerating(false);

      if (returnTo === "dashboard") {
        setTimeout(() => {
          window.location.href = buildDashboardUrl();
        }, 500);
        return;
      }

      setMode("list");
      setIsFullscreen(false);
    } catch (error: any) {
      setMsg(t.fail + (error?.message || String(error)));
      setIsGenerating(false);
    }
  }

  function setPrintableInvoice(record?: InvoiceRecord) {
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
      return;
    }

    setLastPrintableInvoice(currentPreviewInvoice);
    setLastPrintableItems(itemCalcs.map((x) => ({ product: x.calc.product, calc: x.calc })));
  }

  function printInvoice(record?: InvoiceRecord) {
    setPrintableInvoice(record);
    setTimeout(() => window.print(), 150);
  }

  function downloadPdf(record?: InvoiceRecord) {
    setPrintableInvoice(record);
    setTimeout(() => window.print(), 150);
  }

  function buildShareText(record?: InvoiceRecord) {
    const inv = record || currentPreviewInvoice;
    const payment = selectedPaymentDetail(inv);

    const lines = [
      `Invoice ${inv.invoice_no}`,
      `${t.customerName}: ${inv.customer_name || "-"}`,
      `${t.total}: RM ${Number(inv.total || 0).toFixed(2)}`,
      `${t.paymentMethod}: ${inv.payment_method || getPaymentText()}`,
      payment?.bankAccount ? `${t.paymentBankAccount}: ${payment.bankAccount}` : "",
      payment?.receiverName ? `${t.paymentReceiverName}: ${payment.receiverName}` : "",
      payment?.link ? `Payment Link: ${payment.link}` : "",
      payment?.qrCodeUrl && !payment.qrCodeUrl.startsWith("data:")
        ? `QR Code: ${payment.qrCodeUrl}`
        : "",
    ].filter(Boolean);

    return lines.join("\n");
  }

  async function shareInvoice(record?: InvoiceRecord) {
    setPrintableInvoice(record);

    const inv = record || currentPreviewInvoice;
    const text = buildShareText(record);

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Invoice ${inv.invoice_no}`,
          text,
        });
        setMsg(t.copied);
        return;
      } catch {
        // User cancelled share.
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setMsg(t.copied);
    } catch {
      setMsg(t.copied);
    }
  }

  function sendWhatsApp(record?: InvoiceRecord) {
    const text = encodeURIComponent(buildShareText(record));
    window.location.href = `https://wa.me/?text=${text}`;
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

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", inv.id)
      .eq("user_id", sessionUserId);

    if (error) {
      setMsg(t.fail + error.message);
      return;
    }

    setInvoices((prev) => prev.filter((x) => x.id !== inv.id));
    setMsg(t.saved);
  }

  function getCanvasPoint(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDraw(e: PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawingRef.current = true;

    const point = getCanvasPoint(e);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function draw(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getCanvasPoint(e);

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  function stopDraw() {
    drawingRef.current = false;
  }

  function openSignaturePad(target: "issuer" | "customer") {
    setSignaturePadTarget(target);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 80);
  }

  function clearSignaturePad() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (signaturePadTarget === "issuer") setSignatureImageUrl("");
    if (signaturePadTarget === "customer") setCustomerSignatureImageUrl("");
  }

  function confirmSignaturePad() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");

    if (signaturePadTarget === "issuer") {
      setSignatureImageUrl(dataUrl);
      setMsg(t.saved);
    }

    if (signaturePadTarget === "customer") {
      setCustomerSignatureImageUrl(dataUrl);
      setMsg(t.saved);
    }

    setSignaturePadTarget(null);
  }

  function renderChargeInput(
    label: string,
    charge: ChargeInput,
    setCharge: (v: ChargeInput) => void
  ) {
    return (
      <div className="sa-panel" style={{ ...chargeBoxStyle, ...themedPanelStyle }}>
        <label style={{ ...labelStyle, color: theme.accent }}>{label}</label>

        <div style={chargeInputRowStyle}>
          <input
            value={charge.value}
            onChange={(e) => setCharge({ ...charge, value: e.target.value })}
            placeholder={t.chargeValue}
            inputMode="decimal"
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

  function renderOfficialChargeRow(label: string, amount: number, input: ChargeInput) {
    const show = Number(amount || 0) !== 0 || Number(input.value || 0) !== 0;
    if (!show) return null;

    const isNegative = Number(amount || 0) < 0;

    return (
      <div style={officialSummaryRowStyle}>
        <span>
          {label} {input.mode === "%" ? `(${input.value || 0}%)` : "(RM)"}
        </span>

        <strong style={{ color: isNegative ? "#dc2626" : "#111827" }}>
          {formatSignedRM(amount)}
        </strong>
      </div>
    );
  }

  function renderOfficialInvoice(inv: InvoiceRecord, officialItems: PrintableItem[]) {
    const payment = selectedPaymentDetail(inv);

    const subtotal = Number(inv.subtotal || 0);
    const discount = Number(inv.discount || 0);
    const total = Number(inv.total || 0);
    const totalCost = Number(inv.total_cost || 0);
    const profit = Number(inv.total_profit ?? total - totalCost);
    const afterDiscount = subtotal - discount;

    const showIssuerSignature = Boolean(signatureText.trim()) || Boolean(signatureImageUrl.trim());
    const showCustomerSignature = Boolean(customerSignatureImageUrl);

    return (
      <div style={officialInvoiceStyle}>
        <div style={officialHeaderStyle}>
          <div style={officialCompanyBlockStyle}>
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt="Company Logo" style={officialLogoStyle} />
            ) : (
              <div style={officialLogoPlaceholderStyle}>LOGO</div>
            )}

            <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
              <h2 style={officialCompanyNameStyle}>{companyName || "-"}</h2>
              <div>SSM: {companyRegNo || "-"}</div>
              <div>
                {t.phone}: {companyPhone || "-"}
              </div>
              <div>
                {t.address}: {companyAddress || "-"}
              </div>
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

                {payment?.bankAccount ? (
                  <div style={officialPaymentDetailTextStyle}>
                    {t.paymentBankAccount}: {payment.bankAccount}
                  </div>
                ) : null}

                {payment?.receiverName ? (
                  <div style={officialPaymentDetailTextStyle}>
                    {t.paymentReceiverName}: {payment.receiverName}
                  </div>
                ) : null}

                {payment?.link ? (
                  <div style={officialPaymentDetailTextStyle}>{payment.link}</div>
                ) : null}

                {payment?.qrCodeUrl ? (
                  <img src={payment.qrCodeUrl} alt="Payment QR" style={officialInlineQrStyle} />
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
                <td style={officialTdStyle}>{Number(x.calc.qty || 1)}</td>
                <td style={officialTdStyle}>RM {Number(x.calc.price || 0).toFixed(2)}</td>
                <td style={officialTdStyle}>{formatSignedRM(Number(x.calc.discount || 0))}</td>
                <td style={officialTdStyle}>{formatSignedRM(Number(x.calc.lineTotal || 0))}</td>
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
            <strong style={{ color: "#dc2626" }}>{formatSignedRM(-Math.abs(discount))}</strong>
          </div>

          <div style={officialSummaryRowStyle}>
            <span>{t.taxableTotal}</span>
            <strong>{formatSignedRM(afterDiscount)}</strong>
          </div>

          {renderOfficialChargeRow(t.chargeDiscount, preview.extraDiscount, discountInput)}
          {renderOfficialChargeRow(t.sst, preview.sst, sstInput)}
          {renderOfficialChargeRow(t.serviceFee, preview.serviceFee, serviceFeeInput)}
          {renderOfficialChargeRow(t.handlingFee, preview.handlingFee, handlingFeeInput)}

          <div style={officialTotalRowStyle}>
            <span>{t.total}</span>
            <strong>{formatSignedRM(total)}</strong>
          </div>

          <div style={officialProfitRowStyle}>
            <span>{t.profit}</span>
            <strong>{formatSignedRM(profit)}</strong>
          </div>
        </div>

        {inv.note ? <div style={officialNoteStyle}>Note: {inv.note}</div> : null}

        {showIssuerSignature || showCustomerSignature ? (
          <div
            style={{
              ...officialSignatureWrapStyle,
              gridTemplateColumns:
                showIssuerSignature && showCustomerSignature ? "1fr 1fr" : "1fr",
              width: showIssuerSignature && showCustomerSignature ? "100%" : "58%",
              marginLeft: "auto",
            }}
          >
            {showIssuerSignature ? (
              <div style={officialSignatureBoxStyle}>
                {signatureImageUrl ? (
                  <img
                    src={signatureImageUrl}
                    alt="Issuer Signature"
                    style={officialSignatureImageStyle}
                  />
                ) : null}

                {signatureText ? (
                  <div style={officialSignatureTextStyle}>{signatureText}</div>
                ) : null}

                <div style={officialSignatureLineStyle} />
                <div style={officialSignatureLabelStyle}>{t.issuerSignature}</div>
              </div>
            ) : null}

            {showCustomerSignature ? (
              <div style={officialSignatureBoxStyle}>
                <img
                  src={customerSignatureImageUrl}
                  alt="Customer Signature"
                  style={officialSignatureImageStyle}
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

  const printableInvoice = lastPrintableInvoice || currentPreviewInvoice;
  const printableItems =
    lastPrintableItems.length > 0
      ? lastPrintableItems
      : itemCalcs.map((x) => ({ product: x.calc.product, calc: x.calc }));

  return (
    <main
      className="smartacctg-page smartacctg-invoice-page"
      data-sa-theme={themeKey}
      data-smartacctg-theme={themeKey}
      style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}
    >
      <style jsx global>{INVOICE_PAGE_CSS}</style>

      <div className="no-print sa-user-toolbar" style={topToolbarStyle}>
        <button
          type="button"
          onClick={goBack}
          className="sa-back-btn"
          style={{
            borderColor: theme.border,
            color: theme.accent,
            background: theme.inputBg,
          }}
        >
          ← {t.dashboardBack}
        </button>

        <div className="sa-lang-row">
          <button
            type="button"
            onClick={() => switchLang("zh")}
            className="sa-lang-btn"
            style={{
              borderColor: theme.accent,
              background: lang === "zh" ? theme.accent : theme.inputBg,
              color: lang === "zh" ? "#fff" : theme.accent,
            }}
          >
            中文
          </button>

          <button
            type="button"
            onClick={() => switchLang("en")}
            className="sa-lang-btn"
            style={{
              borderColor: theme.accent,
              background: lang === "en" ? theme.accent : theme.inputBg,
              color: lang === "en" ? "#fff" : theme.accent,
            }}
          >
            EN
          </button>

          <button
            type="button"
            onClick={() => switchLang("ms")}
            className="sa-lang-btn"
            style={{
              borderColor: theme.accent,
              background: lang === "ms" ? theme.accent : theme.inputBg,
              color: lang === "ms" ? "#fff" : theme.accent,
            }}
          >
            BM
          </button>
        </div>
      </div>

      {mode === "list" ? (
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
              type="button"
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
                    background: theme.itemBg || theme.card,
                    color: theme.panelText || theme.text,
                    borderColor: theme.border,
                    boxShadow: theme.glow,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong>{inv.invoice_no}</strong>

                    <div style={{ ...mutedTextStyle, color: theme.muted }}>
                      {inv.customer_name || "-"}{" "}
                      {inv.customer_company ? `｜${inv.customer_company}` : ""}
                    </div>

                    <div style={{ ...mutedTextStyle, color: theme.muted }}>
                      {t.recordDateTime}: {formatDateTime(inv.created_at, inv.invoice_date)}
                    </div>

                    <div style={{ ...mutedTextStyle, color: theme.muted }}>
                      {t.phone}: {inv.customer_phone || "-"}
                    </div>

                    <div className="invoice-record-action-row">
                      <button
                        type="button"
                        onClick={() => printInvoice(inv)}
                        style={{
                          ...recordEditBtnStyle,
                          background: theme.accent,
                        }}
                      >
                        {t.print}
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadPdf(inv)}
                        style={{
                          ...recordShareBtnStyle,
                          borderColor: theme.accent,
                          color: theme.accent,
                          background: theme.inputBg,
                        }}
                      >
                        {t.pdf}
                      </button>

                      <button type="button" onClick={() => shareInvoice(inv)} style={recordWhatsappBtnStyle}>
                        {t.share}
                      </button>

                      <button type="button" onClick={() => deleteInvoice(inv)} style={recordDeleteBtnStyle}>
                        {t.delete}
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <strong style={{ color: theme.accent }}>{formatRM(Number(inv.total || 0))}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {msg ? <p style={{ ...msgStyle, color: theme.accent }}>{msg}</p> : null}
        </section>
      ) : null}

      {mode === "new" ? (
        <section
          className={`no-print sa-card ${isFullscreen ? "fullscreen-invoice-modal" : ""}`}
          style={{
            ...cardStyle,
            background: theme.card,
            borderColor: theme.border,
            boxShadow: theme.glow,
            color: theme.text,
          }}
        >
          <div className="sa-titlebar" style={titleBarStyle}>
            <h1 style={{ ...newTitleStyle, color: theme.accent }}>{t.createTitle}</h1>

            <button
              type="button"
              className="sa-close-x"
              onClick={closeInvoiceForm}
              aria-label={t.close}
            >
              {t.close}
            </button>
          </div>

          <p style={{ ...newDescStyle, color: theme.muted }}>{t.desc}</p>

          <div className="sa-panel" style={{ ...invoiceNoBox, ...themedPanelStyle }}>
            <strong>Invoice No:</strong>&nbsp;{invoiceNo}
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
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={themedInputStyle}>
              <option value="draft">{t.draft}</option>
              <option value="sent">{t.sent}</option>
              <option value="paid">{t.paid}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>

            <label style={{ ...labelStyle, color: theme.accent }}>{t.paymentMethod}</label>
            <select
              value={selectedPaymentId}
              onChange={(e) => setSelectedPaymentId(e.target.value)}
              style={themedInputStyle}
            >
              {paymentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="same-size-action-row" style={twoButtonRowStyle}>
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

            {showPaymentAdd ? (
              <div className="sa-panel" style={{ ...paymentAddBoxStyle, ...themedPanelStyle }}>
                <input
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  placeholder={t.paymentName}
                  style={themedInputStyle}
                />

                <input
                  value={paymentBankAccount}
                  onChange={(e) => setPaymentBankAccount(e.target.value)}
                  placeholder={t.paymentBankAccount}
                  style={themedInputStyle}
                />

                <input
                  value={paymentReceiverName}
                  onChange={(e) => setPaymentReceiverName(e.target.value)}
                  placeholder={t.paymentReceiverName}
                  style={themedInputStyle}
                />

                <input
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder={t.paymentLink}
                  style={themedInputStyle}
                />

                <input
                  value={paymentQrCodeUrl}
                  onChange={(e) => setPaymentQrCodeUrl(e.target.value)}
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
                  <input type="file" accept="image/*" onChange={uploadPaymentQr} style={{ display: "none" }} />
                </label>

                {paymentQrCodeUrl ? (
                  <img src={paymentQrCodeUrl} alt="QR Preview" style={qrPreviewStyle} />
                ) : null}

                <button type="button" onClick={addPaymentOption} style={{ ...addBtnStyle, background: theme.accent }}>
                  {t.savePayment}
                </button>
              </div>
            ) : null}

            <label style={{ ...labelStyle, color: theme.accent }}>{t.note}</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} style={themedInputStyle} />
          </div>

          <h3>{t.companyInfo}</h3>

          <div className="sa-panel company-info-box" style={{ ...companyBox, ...themedPanelStyle }}>
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt="Company Logo" style={logoStyle} />
            ) : (
              <div style={{ ...logoPlaceholder, background: theme.softBg || "#ccfbf1", color: theme.accent }}>
                LOGO
              </div>
            )}

            <div className="company-info-text" style={{ color: theme.panelText || theme.text }}>
              <strong>{companyName || "-"}</strong>
              <div>SSM: {companyRegNo || "-"}</div>
              <div>
                {t.phone}: {companyPhone || "-"}
              </div>
              <div>
                {t.address}: {companyAddress || "-"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCompanyForm((v) => !v)}
              style={{
                ...editBtnStyle,
                borderColor: theme.border,
                color: theme.accent,
                background: theme.inputBg,
              }}
            >
              {t.editCompany}
            </button>
          </div>

          {showCompanyForm ? (
            <div className="sa-panel" style={{ ...companyEditBoxStyle, ...themedPanelStyle }}>
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

              <button type="button" onClick={saveCompanyInfo} style={{ ...submitSmallBtnStyle, background: theme.accent }}>
                {t.saveCompany}
              </button>
            </div>
          ) : null}

          <h3>{t.customerInfo}</h3>

          <div style={switchRow}>
            <button type="button" onClick={() => setCustomerMode("select")} style={modeBtn(customerMode === "select", theme)}>
              {t.selectCustomer}
            </button>

            <button type="button" onClick={() => setCustomerMode("new")} style={modeBtn(customerMode === "new", theme)}>
              {t.newCustomer}
            </button>
          </div>

          {customerMode === "select" ? (
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
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
              const selectedProduct = getProduct(item);

              return (
                <div key={item.id} className="sa-panel" style={{ ...productLineBoxStyle, ...themedPanelStyle }}>
                  <div style={productLineTitleStyle}>
                    <strong>
                      {t.productInfo} #{index + 1}
                    </strong>

                    <button type="button" onClick={() => removeProductLine(item.id)} style={dangerMiniBtnStyle}>
                      {t.removeProductLine}
                    </button>
                  </div>

                  <div style={switchRow}>
                    <button
                      type="button"
                      onClick={() => updateItem(item.id, { productMode: "select" })}
                      style={modeBtn(item.productMode === "select", theme)}
                    >
                      {t.selectProduct}
                    </button>

                    <button
                      type="button"
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
                          {p.name}｜{t.price} {Number(p.price || 0).toFixed(2)}｜{t.cost}{" "}
                          {Number(p.cost || 0).toFixed(2)}｜{t.stock} {Number(p.stock_qty || 0)}
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
                        inputMode="decimal"
                      />

                      <input
                        placeholder={t.cost}
                        value={item.newProductCost}
                        onChange={(e) => updateItem(item.id, { newProductCost: e.target.value })}
                        style={themedInputStyle}
                        inputMode="decimal"
                      />

                      <input
                        placeholder={t.stock}
                        value={item.newProductStock}
                        onChange={(e) => updateItem(item.id, { newProductStock: e.target.value })}
                        style={themedInputStyle}
                        inputMode="decimal"
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
                        inputMode="decimal"
                      />
                    </div>

                    <div>
                      <label style={{ ...labelStyle, color: theme.accent }}>{t.lineDiscount}</label>
                      <input
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, { discount: e.target.value })}
                        style={{
                          ...themedInputStyle,
                          color: Number(item.discount || 0) < 0 ? "#dc2626" : theme.inputText,
                        }}
                        inputMode="decimal"
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

            <button type="button" onClick={addProductLine} style={{ ...addBtnStyle, background: theme.accent }}>
              {t.addProductLine}
            </button>
          </div>

          <h3>{t.extraCharges}</h3>

          <div style={chargeGridStyle}>
            {renderChargeInput(t.chargeDiscount, discountInput, setDiscountInput)}
            {renderChargeInput(t.sst, sstInput, setSstInput)}
            {renderChargeInput(t.serviceFee, serviceFeeInput, setServiceFeeInput)}
            {renderChargeInput(t.handlingFee, handlingFeeInput, setHandlingFeeInput)}
          </div>

          <h3>{t.yourSignature}</h3>

          <div className="sa-panel" style={{ ...signatureInputBoxStyle, ...themedPanelStyle }}>
            <select value={selectedSignatureId} onChange={(e) => chooseSignature(e.target.value)} style={themedInputStyle}>
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
              onClick={() => openSignaturePad("issuer")}
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
                <input type="file" accept="image/*" onChange={uploadSignatureImage} style={{ display: "none" }} />
              </label>

              <button type="button" onClick={saveSignatureOption} style={{ ...addBtnStyle, background: theme.accent }}>
                {t.saveSignature}
              </button>
            </div>

            <button type="button" onClick={deleteSignatureOption} style={dangerOutlineBtnStyle}>
              {t.deleteSignature}
            </button>

            <button
              type="button"
              onClick={() => openSignaturePad("customer")}
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
                  <img src={signatureImageUrl} alt="Signature Preview" style={signatureMiniImageStyle} />
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

          <div className="invoice-preview-action-row" style={previewActionRowStyle}>
            <button
              type="button"
              onClick={() => printInvoice()}
              style={{
                ...secondaryBtn,
                borderColor: theme.border,
                color: theme.accent,
                background: theme.inputBg,
              }}
            >
              {t.print}
            </button>

            <button
              type="button"
              onClick={() => downloadPdf()}
              style={{
                ...secondaryBtn,
                borderColor: theme.border,
                color: theme.accent,
                background: theme.inputBg,
              }}
            >
              {t.pdf}
            </button>

            <button
              type="button"
              onClick={() => shareInvoice()}
              style={{
                ...secondaryBtn,
                borderColor: theme.border,
                color: theme.accent,
                background: theme.inputBg,
              }}
            >
              {t.share}
            </button>
          </div>

          <button
            type="button"
            onClick={createInvoice}
            disabled={isGenerating}
            style={{
              ...submitBtn,
              background: theme.accent,
              opacity: isGenerating ? 0.65 : 1,
            }}
          >
            {isGenerating ? t.generating : t.generate}
          </button>

          {msg ? <p style={{ ...msgStyle, color: theme.accent }}>{msg}</p> : null}
        </section>
      ) : null}

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

              <button type="button" className="sa-close-x" onClick={() => setSignaturePadTarget(null)}>
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
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={stopDraw}
              onPointerLeave={stopDraw}
            />

            <div style={twoButtonRowStyle}>
              <button type="button" onClick={clearSignaturePad} style={dangerOutlineBtnStyle}>
                {t.clearSignature}
              </button>

              <button type="button" onClick={confirmSignaturePad} style={{ ...addBtnStyle, background: theme.accent }}>
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

const topToolbarStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const cardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const listTitleRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
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
  minHeight: 52,
  borderRadius: 999,
  border: "none",
  color: "#fff",
  fontSize: 30,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  lineHeight: 1.15,
  fontWeight: 900,
};

const newTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-xl)",
  lineHeight: 1.1,
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
  overflowWrap: "anywhere",
};

const invoiceListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const invoiceItemStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const mutedTextStyle: CSSProperties = {
  fontSize: "var(--sa-fs-sm)",
  marginTop: 4,
  lineHeight: 1.5,
};

const recordEditBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  borderRadius: "var(--sa-radius-control)",
  minHeight: 44,
  padding: "0 12px",
  fontWeight: 900,
};

const recordDeleteBtnStyle: CSSProperties = {
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: "var(--sa-radius-control)",
  minHeight: 44,
  padding: "0 12px",
  fontWeight: 900,
};

const recordWhatsappBtnStyle: CSSProperties = {
  border: "none",
  background: "#25D366",
  color: "#fff",
  borderRadius: "var(--sa-radius-control)",
  minHeight: 44,
  padding: "0 12px",
  fontWeight: 900,
};

const recordShareBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid #0f766e",
  background: "#fff",
  color: "#0f766e",
  borderRadius: "var(--sa-radius-control)",
  minHeight: 44,
  padding: "0 12px",
  fontWeight: 900,
};

const emptyStyle: CSSProperties = {
  fontWeight: 800,
};

const formGrid: CSSProperties = {
  display: "grid",
  gap: 8,
  width: "100%",
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
  fontSize: 16,
  marginBottom: 8,
  display: "block",
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

const twoButtonRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  alignItems: "stretch",
};

const paymentToggleBtnStyle: CSSProperties = {
  width: "100%",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  padding: "0 var(--sa-control-x)",
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
  marginBottom: 0,
};

const dangerOutlineBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid #fecaca",
  background: "#fff",
  color: "#dc2626",
  fontWeight: 900,
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
  minHeight: "var(--sa-control-h)",
  padding: "0 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const qrPreviewStyle: CSSProperties = {
  width: 120,
  height: 120,
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
  minHeight: "var(--sa-control-h)",
  padding: "0 16px",
  fontWeight: 900,
};

const companyBox: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  gap: 14,
  alignItems: "center",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  width: "100%",
  minWidth: 0,
};

const logoStyle: CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: 12,
  objectFit: "contain",
  background: "#fff",
};

const logoPlaceholder: CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
};

const editBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  padding: "0 14px",
  fontWeight: 900,
};

const companyEditBoxStyle: CSSProperties = {
  marginTop: 12,
  border: "var(--sa-border-w) dashed",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const submitSmallBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  padding: "0 16px",
  fontWeight: 900,
};

const switchRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 10,
  marginBottom: 12,
};

const modeBtn = (active: boolean, theme: any): CSSProperties => ({
  minHeight: "var(--sa-control-h)",
  padding: "0 14px",
  borderRadius: "var(--sa-radius-control)",
  border: `var(--sa-border-w) solid ${theme.accent}`,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
  fontWeight: 900,
});

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
  color: "#111827",
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
};

const previewActionRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginTop: 14,
};

const secondaryBtn: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  padding: "0 10px",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const submitBtn: CSSProperties = {
  width: "100%",
  marginTop: 12,
  minHeight: "var(--sa-control-h)",
  padding: "0 16px",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  color: "#fff",
  fontWeight: 900,
};

const msgStyle: CSSProperties = {
  marginTop: 14,
  fontWeight: 900,
  fontSize: "var(--sa-fs-base)",
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
  minWidth: 0,
  overflowWrap: "anywhere",
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
  overflowWrap: "anywhere",
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
