"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";

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

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";

const TXT = {
  zh: {
    back: "返回",
    title: "专业发票系统",
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
    note: "备注",
    companyInfo: "2. 公司资料",
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
    productPrice: "售价 RM",
    productCost: "成本 RM",
    productStock: "库存数量",
    invoiceContent: "5. 发票内容",
    qty: "数量",
    extraDiscount: "额外折扣 RM",
    lhdn: "6. Malaysia LHDN e-Invoice 预留资料",
    preview: "正式发票预览",
    unitPrice: "单价",
    subtotal: "小计",
    discount: "折扣",
    total: "总额",
    profit: "预计利润 / 差价",
    generate: "生成发票 + 加入记账 + 扣库存",
    generating: "生成中...",
    print: "列印",
    pdf: "下载 PDF",
    whatsapp: "WhatsApp 发送",
    noCustomer: "请选择客户",
    noNewCustomer: "请填写新客户名称",
    noProduct: "请选择产品",
    noNewProduct: "请填写新产品名称、价格和成本",
    qtyError: "数量必须大过 0",
    stockError: "库存不足，目前库存：",
    trialSuccess: "试用版发票已生成，已加入记账，并已扣库存",
    success: "发票已生成，已自动加入记账，并已扣除库存",
    failed: "生成失败：",
    trialExpired: "免费试用已过期",
    ssm: "SSM",
    phone: "电话",
    address: "地址",
    stock: "库存",
  },
  en: {
    back: "Back",
    title: "Professional Invoice System",
    desc: "Official Invoice | Customer Link | Product Link | Auto Accounting | Auto Stock Deduction",
    invoiceInfo: "1. Invoice Details",
    invoiceDate: "Invoice Date",
    dueDate: "Due Date",
    status: "Status",
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    cancelled: "Cancelled",
    paymentMethod: "Payment Method",
    note: "Note",
    companyInfo: "2. Company Details",
    customerInfo: "3. Customer Details",
    selectCustomer: "Select from Customer Management",
    newCustomer: "Add New Customer",
    chooseCustomer: "Please select customer",
    customerName: "Customer Name",
    customerPhone: "Customer Phone",
    customerCompany: "Customer Company",
    customerAddress: "Customer Address",
    productInfo: "4. Product Details",
    selectProduct: "Select from Product Management",
    newProduct: "Add New Product",
    chooseProduct: "Please select product",
    productName: "Product Name",
    productPrice: "Selling Price RM",
    productCost: "Cost RM",
    productStock: "Stock Quantity",
    invoiceContent: "5. Invoice Content",
    qty: "Quantity",
    extraDiscount: "Extra Discount RM",
    lhdn: "6. Malaysia LHDN e-Invoice Reserved Fields",
    preview: "Official Invoice Preview",
    unitPrice: "Unit Price",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    profit: "Estimated Profit / Margin",
    generate: "Generate Invoice + Add Accounting + Deduct Stock",
    generating: "Generating...",
    print: "Print",
    pdf: "Download PDF",
    whatsapp: "Send WhatsApp",
    noCustomer: "Please select customer",
    noNewCustomer: "Please enter new customer name",
    noProduct: "Please select product",
    noNewProduct: "Please enter new product name, price and cost",
    qtyError: "Quantity must be greater than 0",
    stockError: "Insufficient stock. Current stock: ",
    trialSuccess: "Trial invoice generated, added to accounting, and stock deducted",
    success: "Invoice generated, added to accounting, and stock deducted",
    failed: "Failed: ",
    trialExpired: "Free trial expired",
    ssm: "SSM",
    phone: "Phone",
    address: "Address",
    stock: "Stock",
  },
  ms: {
    back: "Kembali",
    title: "Sistem Invois Profesional",
    desc: "Invois Rasmi | Hubung Pelanggan | Hubung Produk | Auto Akaun | Auto Tolak Stok",
    invoiceInfo: "1. Maklumat Invois",
    invoiceDate: "Tarikh Invois",
    dueDate: "Tarikh Tamat",
    status: "Status",
    draft: "Draf",
    sent: "Telah Dihantar",
    paid: "Telah Dibayar",
    cancelled: "Dibatalkan",
    paymentMethod: "Kaedah Bayaran",
    note: "Nota",
    companyInfo: "2. Maklumat Syarikat",
    customerInfo: "3. Maklumat Pelanggan",
    selectCustomer: "Pilih dari Pengurusan Pelanggan",
    newCustomer: "Tambah Pelanggan Baru",
    chooseCustomer: "Sila pilih pelanggan",
    customerName: "Nama Pelanggan",
    customerPhone: "Telefon Pelanggan",
    customerCompany: "Syarikat Pelanggan",
    customerAddress: "Alamat Pelanggan",
    productInfo: "4. Maklumat Produk",
    selectProduct: "Pilih dari Pengurusan Produk",
    newProduct: "Tambah Produk Baru",
    chooseProduct: "Sila pilih produk",
    productName: "Nama Produk",
    productPrice: "Harga Jualan RM",
    productCost: "Kos RM",
    productStock: "Kuantiti Stok",
    invoiceContent: "5. Kandungan Invois",
    qty: "Kuantiti",
    extraDiscount: "Diskaun Tambahan RM",
    lhdn: "6. Medan Simpanan Malaysia LHDN e-Invoice",
    preview: "Pratonton Invois Rasmi",
    unitPrice: "Harga Unit",
    subtotal: "Subtotal",
    discount: "Diskaun",
    total: "Jumlah",
    profit: "Anggaran Untung / Margin",
    generate: "Jana Invois + Masuk Akaun + Tolak Stok",
    generating: "Sedang Jana...",
    print: "Cetak",
    pdf: "Muat Turun PDF",
    whatsapp: "Hantar WhatsApp",
    noCustomer: "Sila pilih pelanggan",
    noNewCustomer: "Sila isi nama pelanggan baru",
    noProduct: "Sila pilih produk",
    noNewProduct: "Sila isi nama produk baru, harga dan kos",
    qtyError: "Kuantiti mesti lebih daripada 0",
    stockError: "Stok tidak mencukupi. Stok semasa: ",
    trialSuccess: "Invois percubaan dijana, dimasukkan ke akaun, dan stok ditolak",
    success: "Invois dijana, dimasukkan ke akaun, dan stok ditolak",
    failed: "Gagal: ",
    trialExpired: "Percubaan percuma tamat",
    ssm: "SSM",
    phone: "Telefon",
    address: "Alamat",
    stock: "Stok",
  },
};

export default function InvoicePage() {
  const [lang, setLang] = useState<Lang>("zh");
  const t = TXT[lang];

  const [userId, setUserId] = useState("");
  const [isTrial, setIsTrial] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

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
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [status, setStatus] = useState("sent");
  const [paymentMethod, setPaymentMethod] = useState("Cash / Bank Transfer");
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

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const q = new URLSearchParams(window.location.search);
    const urlLang = q.get("lang") as Lang;
    const savedLang = localStorage.getItem("smartacctg_lang") as Lang;

    if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") {
      setLang(urlLang);
      localStorage.setItem("smartacctg_lang", urlLang);
    } else if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") {
      setLang(savedLang);
    }

    const mode = q.get("mode");
    const trialRaw = localStorage.getItem(TRIAL_KEY);

    if (mode === "trial" && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);

        const savedCustomers = localStorage.getItem(TRIAL_CUSTOMERS_KEY);
        const savedProducts = localStorage.getItem(TRIAL_PRODUCTS_KEY);

        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
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
    }

    await loadCustomers(uid);
    await loadProducts(uid);
  }

  function switchLang(next: Lang) {
    setLang(next);
    localStorage.setItem("smartacctg_lang", next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function backToDashboard() {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    window.location.href =
      mode === "trial"
        ? `/dashboard?mode=trial&lang=${lang}`
        : `/dashboard?lang=${lang}`;
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
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    setProducts((data || []) as Product[]);
  }

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedProduct = products.find((p) => p.id === productId);

  const invoiceNo = useMemo(() => {
    return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }, []);

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

  function saveTrialData(nextCustomers: Customer[], nextProducts: Product[]) {
    localStorage.setItem(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
    localStorage.setItem(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
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
        category_name: "发票收入",
        note: `${invNo}｜${customer.name}｜${product.name}`,
      },
      ...oldTx,
    ];

    localStorage.setItem(TRIAL_TX_KEY, JSON.stringify(nextTx));
  }

  async function createInvoice() {
    setMsg("");

    if (customerMode === "select" && !selectedCustomer) {
      setMsg(t.noCustomer);
      return;
    }

    if (customerMode === "new" && !newCustomerName) {
      setMsg(t.noNewCustomer);
      return;
    }

    if (productMode === "select" && !selectedProduct) {
      setMsg(t.noProduct);
      return;
    }

    if (productMode === "new" && (!newProductName || !newProductPrice || !newProductCost)) {
      setMsg(t.noNewProduct);
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

      if (customerMode === "new") {
        finalCustomer = {
          id: String(Date.now()),
          name: newCustomerName,
          phone: newCustomerPhone
