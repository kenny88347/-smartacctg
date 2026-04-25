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

type InvoiceRecord = {
  id: string;
  invoice_no?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_company?: string | null;
  total?: number | null;
  payment_method?: string | null;
  note?: string | null;
  created_at?: string | null;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_INVOICES_KEY = "smartacctg_trial_invoices";

const PAYMENT_OPTIONS_KEY = "smartacctg_payment_options";

const DEFAULT_PAYMENT_OPTIONS = [
  "Cash",
  "Bank Transfer",
  "Cash / Bank Transfer",
  "TNG eWallet",
  "DuitNow QR",
  "Cheque",
  "Credit Terms",
];

const TXT = {
  zh: {
    back: "返回",
    title: "专业发票系统",
    desc: "正式 Invoice｜客户联动｜产品联动｜自动进记账｜自动扣库存",
    invoiceList: "发票记录",
    newInvoice: "新发票",
    searchPlaceholder: "搜索发票号、客户名字、公司名字、电话号码",
    noInvoice: "还没有发票记录",
    invoiceInfo: "1. 发票资料",
    invoiceDate: "发票日期",
    dueDate: "到期日",
    status: "状态",
    draft: "草稿",
    sent: "已发出",
    paid: "已付款",
    cancelled: "取消",
    paymentMethod: "付款方式",
    addPayment: "新增付款方式",
    newPaymentPlaceholder: "输入新的付款方式",
    note: "备注",
    companyInfo: "2. 公司资料",
    editCompany: "编辑公司资料 / 更换 Logo",
    closeEdit: "收起编辑",
    saveCompany: "保存公司资料",
    uploadLogo: "上传公司 Logo",
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
    stockUnavailable: "库存栏位未启用",
    invoiceContent: "5. 发票内容",
    qty: "数量",
    extraDiscount: "额外折扣 RM",
    lhdn: "6. Malaysia LHDN e-Invoice 预留资料",
    preview: "正式发票预览",
    subtotal: "小计",
    discount: "折扣",
    total: "总额",
    profit: "预计利润 / 差价",
    generate: "生成发票 + 加入记账 + 扣库存",
    generating: "生成中...",
    print: "列印",
    pdf: "下载 PDF",
    whatsapp: "WhatsApp 发送",
    needCustomer: "请选择客户",
    needNewCustomer: "请填写新客户名称",
    needProduct: "请选择产品",
    needNewProduct: "请填写新产品名称、价格和成本",
    qtyError: "数量必须大过 0",
    stockNotEnough: "库存不足，目前库存：",
    trialSuccess: "试用版发票已生成，已加入记账，并已扣库存",
    success: "发票已生成，已自动加入记账，并已扣除库存",
    successNoStock: "发票已生成并加入记账；但 products 表没有 stock_qty 栏位，所以暂时跳过扣库存",
    fail: "生成失败：",
    incomplete: "客户或产品资料不完整",
    trialProductNote: "由发票系统新增",
    companySaved: "公司资料已保存",
    logoUploaded: "Logo 已更新",
  },
  en: {
    back: "Back",
    title: "Professional Invoice System",
    desc: "Official Invoice｜Customer Link｜Product Link｜Auto Accounting｜Auto Stock Deduction",
    invoiceList: "Invoice Records",
    newInvoice: "New Invoice",
    searchPlaceholder: "Search invoice no, customer name, company or phone",
    noInvoice: "No invoice records yet",
    invoiceInfo: "1. Invoice Info",
    invoiceDate: "Invoice Date",
    dueDate: "Due Date",
    status: "Status",
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    cancelled: "Cancelled",
    paymentMethod: "Payment Method",
    addPayment: "Add Payment Method",
    newPaymentPlaceholder: "Enter new payment method",
    note: "Note",
    companyInfo: "2. Company Info",
    editCompany: "Edit Company / Change Logo",
    closeEdit: "Close Edit",
    saveCompany: "Save Company Info",
    uploadLogo: "Upload Company Logo",
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
    stockUnavailable: "Stock column not enabled",
    invoiceContent: "5. Invoice Content",
    qty: "Quantity",
    extraDiscount: "Extra Discount RM",
    lhdn: "6. Malaysia LHDN e-Invoice Reserved Fields",
    preview: "Official Invoice Preview",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    profit: "Estimated Profit / Margin",
    generate: "Generate Invoice + Add Accounting + Deduct Stock",
    generating: "Generating...",
    print: "Print",
    pdf: "Download PDF",
    whatsapp: "Send WhatsApp",
    needCustomer: "Please select customer",
    needNewCustomer: "Please enter new customer name",
    needProduct: "Please select product",
    needNewProduct: "Please enter product name, price and cost",
    qtyError: "Quantity must be more than 0",
    stockNotEnough: "Insufficient stock. Current stock: ",
    trialSuccess: "Trial invoice generated, added to accounting and stock deducted",
    success: "Invoice generated, added to accounting and stock deducted",
    successNoStock: "Invoice generated and added to accounting; stock deduction skipped because products.stock_qty does not exist",
    fail: "Failed: ",
    incomplete: "Customer or product information is incomplete",
    trialProductNote: "Added from invoice system",
    companySaved: "Company info saved",
    logoUploaded: "Logo updated",
  },
  ms: {
    back: "Kembali",
    title: "Sistem Invois Profesional",
    desc: "Invois Rasmi｜Pelanggan｜Produk｜Auto Akaun｜Auto Tolak Stok",
    invoiceList: "Rekod Invois",
    newInvoice: "Invois Baru",
    searchPlaceholder: "Cari nombor invois, nama pelanggan, syarikat atau telefon",
    noInvoice: "Tiada rekod invois lagi",
    invoiceInfo: "1. Maklumat Invois",
    invoiceDate: "Tarikh Invois",
    dueDate: "Tarikh Tamat",
    status: "Status",
    draft: "Draf",
    sent: "Dihantar",
    paid: "Dibayar",
    cancelled: "Dibatalkan",
    paymentMethod: "Cara Bayaran",
    addPayment: "Tambah Cara Bayaran",
    newPaymentPlaceholder: "Masukkan cara bayaran baru",
    note: "Nota",
    companyInfo: "2. Maklumat Syarikat",
    editCompany: "Edit Syarikat / Tukar Logo",
    closeEdit: "Tutup Edit",
    saveCompany: "Simpan Maklumat Syarikat",
    uploadLogo: "Muat Naik Logo Syarikat",
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
    stockUnavailable: "Ruangan stok belum diaktifkan",
    invoiceContent: "5. Kandungan Invois",
    qty: "Kuantiti",
    extraDiscount: "Diskaun Tambahan RM",
    lhdn: "6. Ruang Simpanan Malaysia LHDN e-Invoice",
    preview: "Pratonton Invois Rasmi",
    subtotal: "Subtotal",
    discount: "Diskaun",
    total: "Jumlah",
    profit: "Anggaran Untung / Margin",
    generate: "Jana Invois + Masuk Akaun + Tolak Stok",
    generating: "Sedang Jana...",
    print: "Cetak",
    pdf: "Muat Turun PDF",
    whatsapp: "Hantar WhatsApp",
    needCustomer: "Sila pilih pelanggan",
    needNewCustomer: "Sila isi nama pelanggan baru",
    needProduct: "Sila pilih produk",
    needNewProduct: "Sila isi nama produk, harga dan kos",
    qtyError: "Kuantiti mesti lebih daripada 0",
    stockNotEnough: "Stok tidak cukup. Stok semasa: ",
    trialSuccess: "Invois percubaan berjaya dijana, masuk akaun dan stok ditolak",
    success: "Invois berjaya dijana, masuk akaun dan stok ditolak",
    successNoStock: "Invois berjaya dijana dan masuk akaun; stok tidak ditolak kerana products.stock_qty belum wujud",
    fail: "Gagal: ",
    incomplete: "Maklumat pelanggan atau produk tidak lengkap",
    trialProductNote: "Ditambah dari sistem invois",
    companySaved: "Maklumat syarikat disimpan",
    logoUploaded: "Logo dikemas kini",
  },
};

export default function InvoicePage() {
  const [lang, setLang] = useState<Lang>("zh");
  const t = TXT[lang];

  const [userId, setUserId] = useState("");
  const [isTrial, setIsTrial] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [searchText, setSearchText] = useState("");

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
  const [newPaymentOption, setNewPaymentOption] = useState("");
  const [paymentOptions, setPaymentOptions] = useState<string[]>(DEFAULT_PAYMENT_OPTIONS);

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

  const [companyEditing, setCompanyEditing] = useState(false);
  const [companyName, setCompanyName] = useState("NK DIGITAL HUB");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedProduct = products.find((p) => p.id === productId);

  const invoiceNo = useMemo(() => {
    return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }, [showForm]);

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

  const filteredInvoices = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return invoices;

    return invoices.filter((inv) => {
      const customerFromList = customers.find((c) => c.id === inv.customer_id);

      const text = [
        inv.invoice_no,
        inv.customer_name,
        inv.customer_phone,
        inv.customer_company,
        inv.status,
        inv.payment_method,
        customerFromList?.name,
        customerFromList?.phone,
        customerFromList?.company_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [searchText, invoices, customers]);

  useEffect(() => {
    init();
  }, []);

  function isSchemaCacheError(message: string) {
    const text = message.toLowerCase();
    return (
      text.includes("schema cache") ||
      text.includes("could not find") ||
      text.includes("column")
    );
  }

  function getCurrentLang(): Lang {
    const q = new URLSearchParams(window.location.search);
    const urlLang = q.get("lang") as Lang | null;
    const savedLang = localStorage.getItem("smartacctg_lang") as Lang | null;

    if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") return urlLang;
    if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") return savedLang;
    return "zh";
  }

  function switchLang(next: Lang) {
    setLang(next);
    localStorage.setItem("smartacctg_lang", next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);

    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  async function init() {
    const currentLang = getCurrentLang();
    setLang(currentLang);

    const savedPaymentOptions = localStorage.getItem(PAYMENT_OPTIONS_KEY);
    if (savedPaymentOptions) {
      setPaymentOptions(JSON.parse(savedPaymentOptions));
    }

    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = localStorage.getItem(TRIAL_KEY);

    if (mode === "trial" && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);

        const savedCustomers = localStorage.getItem(TRIAL_CUSTOMERS_KEY);
        const savedProducts = localStorage.getItem(TRIAL_PRODUCTS_KEY);
        const savedInvoices = localStorage.getItem(TRIAL_INVOICES_KEY);

        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
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
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    setProducts((data || []) as Product[]);
  }

  async function loadInvoices(uid: string) {
    const result = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (result.error) {
      const fallback = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", uid);

      setInvoices((fallback.data || []) as InvoiceRecord[]);
      return;
    }

    setInvoices((result.data || []) as InvoiceRecord[]);
  }

  function saveTrialData(nextCustomers: Customer[], nextProducts: Product[]) {
    localStorage.setItem(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
    localStorage.setItem(TRIAL_PRODUCTS_KEY, JSON.stringify(nextProducts));
  }

  function saveTrialInvoices(nextInvoices: InvoiceRecord[]) {
    localStorage.setItem(TRIAL_INVOICES_KEY, JSON.stringify(nextInvoices));
  }

  function addPaymentOption() {
    const value = newPaymentOption.trim();
    if (!value) return;

    const exists = paymentOptions.some((x) => x.toLowerCase() === value.toLowerCase());
    if (exists) {
      setPaymentMethod(value);
      setNewPaymentOption("");
      return;
    }

    const next = [...paymentOptions, value];
    setPaymentOptions(next);
    localStorage.setItem(PAYMENT_OPTIONS_KEY, JSON.stringify(next));
    setPaymentMethod(value);
    setNewPaymentOption("");
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
          lang === "zh" ? "发票收入" : lang === "en" ? "Invoice Income" : "Pendapatan Invois",
        note: `${invNo}｜${customer.name}｜${product.name}`,
      },
      ...oldTx,
    ];

    localStorage.setItem(TRIAL_TX_KEY, JSON.stringify(nextTx));
  }

  async function saveCompanyInfo() {
    if (isTrial) {
      setMsg(t.companySaved);
      setCompanyEditing(false);
      return;
    }

    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: companyName,
        company_reg_no: companyRegNo,
        company_phone: companyPhone,
        company_address: companyAddress,
        company_logo_url: companyLogoUrl,
      })
      .eq("id", userId);

    if (error) {
      setMsg(t.fail + error.message);
      return;
    }

    setMsg(t.companySaved);
    setCompanyEditing(false);
  }

  async function uploadCompanyLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isTrial) {
      const previewUrl = URL.createObjectURL(file);
      setCompanyLogoUrl(previewUrl);
      setMsg(t.logoUploaded);
      return;
    }

    if (!userId) return;

    const filePath = `${userId}/company-logo-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("company-assets")
      .upload(filePath, file, { upsert: true });

    if (error) {
      setMsg(t.fail + error.message);
      return;
    }

    const { data } = supabase.storage.from("company-assets").getPublicUrl(filePath);

    setCompanyLogoUrl(data.publicUrl);

    await supabase
      .from("profiles")
      .update({ company_logo_url: data.publicUrl })
      .eq("id", userId);

    setMsg(t.logoUploaded);
  }

  async function insertProductSmart(payload: any) {
    const fullInsert = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    if (!fullInsert.error) return fullInsert.data as Product;

    if (!isSchemaCacheError(fullInsert.error.message)) {
      throw fullInsert.error;
    }

    const { stock_qty, ...withoutStock } = payload;

    const fallback = await supabase
      .from("products")
      .insert(withoutStock)
      .select()
      .single();

    if (fallback.error) throw fallback.error;

    return fallback.data as Product;
  }

  async function updateStockSmart(productIdValue: string, newStock: number) {
    const result = await supabase
      .from("products")
      .update({ stock_qty: newStock })
      .eq("id", productIdValue);

    if (!result.error) return true;

    if (isSchemaCacheError(result.error.message)) return false;

    throw result.error;
  }

  async function insertInvoiceSmart(payload: any) {
    const full = await supabase
      .from("invoices")
      .insert(payload)
      .select()
      .single();

    if (!full.error) return full.data;

    const corePayload = {
      user_id: payload.user_id,
      customer_id: payload.customer_id,
      customer_name: payload.customer_name,
      invoice_no: payload.invoice_no,
      invoice_date: payload.invoice_date,
      due_date: payload.due_date,
      status: payload.status,
      payment_method: payload.payment_method,
      subtotal: payload.subtotal,
      discount: payload.discount,
      total: payload.total,
      total_cost: payload.total_cost,
      total_profit: payload.total_profit,
      note: payload.note,
    };

    const core = await supabase
      .from("invoices")
      .insert(corePayload)
      .select()
      .single();

    if (!core.error) return core.data;

    const minimalPayload = {
      user_id: payload.user_id,
      customer_name: payload.customer_name,
      invoice_no: payload.invoice_no,
      total: payload.total,
      note: payload.note,
    };

    const minimal = await supabase
      .from("invoices")
      .insert(minimalPayload)
      .select()
      .single();

    if (minimal.error) throw minimal.error;

    return minimal.data;
  }

  async function insertTransactionSmart(payload: any) {
    const full = await supabase.from("transactions").insert(payload);

    if (!full.error) return;

    const minimalPayload = {
      user_id: payload.user_id,
      txn_date: payload.txn_date,
      txn_type: payload.txn_type,
      amount: payload.amount,
      category_name: payload.category_name,
      debt_amount: 0,
      note: payload.note,
    };

    const minimal = await supabase.from("transactions").insert(minimalPayload);

    if (minimal.error) throw minimal.error;
  }

  async function createInvoice() {
    setMsg("");

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

      if (customerMode === "new") {
        finalCustomer = {
          id: String(Date.now()),
          name: newCustomerName,
          phone: newCustomerPhone,
          company_name: newCustomerCompany,
          address: newCustomerAddress,
        };

        if (isTrial) {
          const next = [finalCustomer, ...customers];
          setCustomers(next);
          saveTrialData(next, products);
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
          await loadCustomers(userId);
        }
      }

      if (productMode === "new") {
        finalProduct = {
          id: String(Date.now() + 1),
          name: newProductName,
          price: Number(newProductPrice),
          cost: Number(newProductCost),
          discount: 0,
          stock_qty: Number(newProductStock || 0),
          note: t.trialProductNote,
        };

        if (isTrial) {
          const next = [finalProduct, ...products];
          setProducts(next);
          saveTrialData(customers, next);
        } else {
          finalProduct = await insertProductSmart({
            user_id: userId,
            name: newProductName,
            price: Number(newProductPrice),
            cost: Number(newProductCost),
            discount: 0,
            stock_qty: Number(newProductStock || 0),
            note: t.trialProductNote,
          });

          await loadProducts(userId);
        }
      }

      if (!finalCustomer || !finalProduct) {
        setMsg(t.incomplete);
        setLoading(false);
        return;
      }

      const hasStockColumn =
        finalProduct.stock_qty !== undefined && finalProduct.stock_qty !== null;

      let stockDeducted = false;
      let newStock = Number(finalProduct.stock_qty || 0);

      if (hasStockColumn) {
        const currentStock = Number(finalProduct.stock_qty || 0);

        if (currentStock < preview.finalQty) {
          setMsg(`${t.stockNotEnough}${currentStock}`);
          setLoading(false);
          return;
        }

        newStock = Math.max(currentStock - preview.finalQty, 0);
      }

      if (isTrial) {
        const nextProducts = products.map((p) =>
          p.id === finalProduct!.id ? { ...p, stock_qty: newStock } : p
        );

        const newInvoice: InvoiceRecord = {
          id: String(Date.now() + 2),
          invoice_no: invoiceNo,
          invoice_date: invoiceDate,
          due_date: dueDate,
          status,
          customer_id: finalCustomer.id,
          customer_name: finalCustomer.name,
          customer_phone: finalCustomer.phone || "",
          customer_company: finalCustomer.company_name || "",
          total: preview.total,
          payment_method: paymentMethod,
          note,
          created_at: new Date().toISOString(),
        };

        const nextInvoices = [newInvoice, ...invoices];

        setProducts(nextProducts);
        setInvoices(nextInvoices);
        saveTrialData(customers, nextProducts);
        saveTrialInvoices(nextInvoices);
        addTrialTransaction(preview.total, finalCustomer, finalProduct, invoiceNo);

        setMsg(t.trialSuccess);
        setShowForm(false);
        setLoading(false);
        return;
      }

      const invoiceData = await insertInvoiceSmart({
        user_id: userId,
        customer_id: finalCustomer.id,
        customer_name: finalCustomer.name,
        customer_phone: finalCustomer.phone || "",
        customer_company: finalCustomer.company_name || "",
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status,
        payment_method: paymentMethod,
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
      });

      await supabase.from("invoice_items").insert({
        invoice_id: invoiceData.id,
        product_id: finalProduct.id,
        product_name: finalProduct.name,
        qty: preview.finalQty,
        unit_price: preview.price,
        unit_cost: preview.cost,
        discount: preview.discount,
        line_total: preview.total,
        line_profit: preview.profit,
      });

      if (hasStockColumn) {
        stockDeducted = await updateStockSmart(finalProduct.id, newStock);
      }

      await insertTransactionSmart({
        user_id: userId,
        txn_date: invoiceDate,
        txn_type: "income",
        amount: preview.total,
        category_name:
          lang === "zh" ? "发票收入" : lang === "en" ? "Invoice Income" : "Pendapatan Invois",
        debt_amount: 0,
        source_type: "invoice",
        source_id: invoiceData.id,
        note: `${invoiceNo}｜${finalCustomer.name}｜${finalProduct.name}`,
      });

      await loadProducts(userId);
      await loadInvoices(userId);

      setMsg(stockDeducted ? t.success : t.successNoStock);
      setShowForm(false);
    } catch (error: any) {
      setMsg(t.fail + error.message);
    }

    setLoading(false);
  }

  function printInvoice() {
    window.print();
  }

  function downloadPdf() {
    window.print();
  }

  function sendWhatsApp() {
    const customer = customerMode === "select" ? selectedCustomer : { name: newCustomerName };
    const text = `Invoice ${invoiceNo}%0A${t.customerName}：${customer?.name || ""}%0A${t.total}：RM ${preview.total.toFixed(2)}%0A${t.paymentMethod}：${paymentMethod}`;
    window.location.href = `https://wa.me/?text=${text}`;
  }

  function goBack() {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");

    window.location.href =
      mode === "trial"
        ? `/dashboard?mode=trial&lang=${lang}`
        : `/dashboard?lang=${lang}`;
  }

  function getStatusText(value?: string | null) {
    if (value === "draft") return t.draft;
    if (value === "sent") return t.sent;
    if (value === "paid") return t.paid;
    if (value === "cancelled") return t.cancelled;
    return value || "-";
  }

  return (
    <main style={pageStyle}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #printable-invoice,
          #printable-invoice * {
            visibility: visible !important;
          }

          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>

      <div style={topRowStyle} className="no-print">
        <button onClick={goBack} style={backBtn}>
          ← {t.back}
        </button>

        <div style={langRowStyle}>
          <button onClick={() => switchLang("zh")} style={langBtn(lang === "zh")}>
            中文
          </button>
          <button onClick={() => switchLang("en")} style={langBtn(lang === "en")}>
            EN
          </button>
          <button onClick={() => switchLang("ms")} style={langBtn(lang === "ms")}>
            BM
          </button>
        </div>
      </div>

      {!showForm && (
        <section style={cardStyle} className="no-print">
          <div style={listHeaderStyle}>
            <div>
              <h1 style={titleStyle}>{t.invoiceList}</h1>
              <p style={descStyle}>{t.desc}</p>
            </div>

            <button onClick={() => setShowForm(true)} style={plusBtnStyle}>
              + {t.newInvoice}
            </button>
          </div>

          <input
            placeholder={t.searchPlaceholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={inputStyle}
          />

          {filteredInvoices.length === 0 ? (
            <p style={emptyTextStyle}>{t.noInvoice}</p>
          ) : (
            <div style={invoiceListStyle}>
              {filteredInvoices.map((inv) => {
                const customerFromList = customers.find((c) => c.id === inv.customer_id);

                return (
                  <div key={inv.id} style={invoiceItemStyle}>
                    <div>
                      <strong>{inv.invoice_no || "-"}</strong>
                      <div style={mutedStyle}>
                        {inv.invoice_date || "-"} · {getStatusText(inv.status)}
                      </div>
                      <div style={mutedStyle}>
                        {inv.customer_name || customerFromList?.name || "-"}
                        {inv.customer_company || customerFromList?.company_name
                          ? `｜${inv.customer_company || customerFromList?.company_name}`
                          : ""}
                      </div>
                      <div style={mutedStyle}>
                        {inv.customer_phone || customerFromList?.phone || ""}
                      </div>
                    </div>

                    <strong style={amountStyle}>
                      RM {Number(inv.total || 0).toFixed(2)}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}

          {msg ? <p style={msgStyle}>{msg}</p> : null}
        </section>
      )}

      {showForm && (
        <section style={cardStyle}>
          <div className="no-print" style={formTopActionStyle}>
            <button onClick={() => setShowForm(false)} style={backBtn}>
              ← {t.back}
            </button>
          </div>

          <h1 style={titleStyle} className="no-print">{t.title}</h1>
          <p style={descStyle} className="no-print">{t.desc}</p>

          <div style={invoiceNoBox} className="no-print">
            <strong>Invoice No：</strong> {invoiceNo}
          </div>

          <div className="no-print">
            <h3>{t.invoiceInfo}</h3>

            <div style={formGrid}>
              <label style={labelStyle}>{t.invoiceDate}</label>
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={smallDateInput} />

              <label style={labelStyle}>{t.dueDate}</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={smallDateInput} />

              <label style={labelStyle}>{t.status}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="draft">{t.draft}</option>
                <option value="sent">{t.sent}</option>
                <option value="paid">{t.paid}</option>
                <option value="cancelled">{t.cancelled}</option>
              </select>

              <label style={labelStyle}>{t.paymentMethod}</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
                {paymentOptions.map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>

              <div style={paymentAddRowStyle}>
                <input
                  placeholder={t.newPaymentPlaceholder}
                  value={newPaymentOption}
                  onChange={(e) => setNewPaymentOption(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
                <button onClick={addPaymentOption} style={miniBtnStyle}>
                  {t.addPayment}
                </button>
              </div>

              <label style={labelStyle}>{t.note}</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} style={inputStyle} />
            </div>

            <h3>{t.companyInfo}</h3>

            <div style={companyBox}>
              {companyLogoUrl ? <img src={companyLogoUrl} style={logoStyle} /> : <div style={logoPlaceholder}>LOGO</div>}

              <div style={{ flex: 1 }}>
                <strong>{companyName}</strong>
                <div>SSM：{companyRegNo || "-"}</div>
                <div>{t.phone}：{companyPhone || "-"}</div>
                <div>{t.address}：{companyAddress || "-"}</div>
              </div>

              <button
                onClick={() => setCompanyEditing((v) => !v)}
                style={miniBtnStyle}
              >
                {companyEditing ? t.closeEdit : t.editCompany}
              </button>
            </div>

            {companyEditing && (
              <div style={companyEditBoxStyle}>
                <label style={labelStyle}>{t.uploadLogo}</label>
                <input type="file" accept="image/*" onChange={uploadCompanyLogo} style={inputStyle} />

                <input placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
                <input placeholder="SSM / Registration No" value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} style={inputStyle} />
                <input placeholder={t.phone} value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} style={inputStyle} />
                <input placeholder={t.address} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} style={inputStyle} />

                <button onClick={saveCompanyInfo} style={submitBtn}>
                  {t.saveCompany}
                </button>
              </div>
            )}

            <h3>{t.customerInfo}</h3>

            <div style={switchRow}>
              <button onClick={() => setCustomerMode("select")} style={modeBtn(customerMode === "select")}>{t.selectCustomer}</button>
              <button onClick={() => setCustomerMode("new")} style={modeBtn(customerMode === "new")}>{t.newCustomer}</button>
            </div>

            {customerMode === "select" ? (
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={inputStyle}>
                <option value="">{t.chooseCustomer}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.company_name ? `｜${c.company_name}` : ""}</option>
                ))}
              </select>
            ) : (
              <div style={formGrid}>
                <input placeholder={t.customerName} value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} style={inputStyle} />
                <input placeholder={t.customerPhone} value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} style={inputStyle} />
                <input placeholder={t.customerCompany} value={newCustomerCompany} onChange={(e) => setNewCustomerCompany(e.target.value)} style={inputStyle} />
                <input placeholder={t.customerAddress} value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} style={inputStyle} />
              </div>
            )}

            <h3>{t.productInfo}</h3>

            <div style={switchRow}>
              <button onClick={() => setProductMode("select")} style={modeBtn(productMode === "select")}>{t.selectProduct}</button>
              <button onClick={() => setProductMode("new")} style={modeBtn(productMode === "new")}>{t.newProduct}</button>
            </div>

            {productMode === "select" ? (
              <select value={productId} onChange={(e) => setProductId(e.target.value)} style={inputStyle}>
                <option value="">{t.chooseProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}｜{t.price} {Number(p.price).toFixed(2)}｜{t.cost} {Number(p.cost).toFixed(2)}｜
                    {p.stock_qty === undefined || p.stock_qty === null
                      ? t.stockUnavailable
                      : `${t.stock} ${Number(p.stock_qty || 0)}`}
                  </option>
                ))}
              </select>
            ) : (
              <div style={formGrid}>
                <input placeholder={t.productName} value={newProductName} onChange={(e) => setNewProductName(e.target.value)} style={inputStyle} />
                <input placeholder={t.price} value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} style={inputStyle} />
                <input placeholder={t.cost} value={newProductCost} onChange={(e) => setNewProductCost(e.target.value)} style={inputStyle} />
                <input placeholder={t.stock} value={newProductStock} onChange={(e) => setNewProductStock(e.target.value)} style={inputStyle} />
              </div>
            )}

            <h3>{t.invoiceContent}</h3>

            <div style={formGrid}>
              <label style={labelStyle}>{t.qty}</label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>{t.extraDiscount}</label>
              <input value={extraDiscount} onChange={(e) => setExtraDiscount(e.target.value)} style={inputStyle} />
            </div>

            <h3>{t.lhdn}</h3>

            <div style={formGrid}>
              <input placeholder="Supplier TIN" value={supplierTin} onChange={(e) => setSupplierTin(e.target.value)} style={inputStyle} />
              <input placeholder="Buyer TIN" value={buyerTin} onChange={(e) => setBuyerTin(e.target.value)} style={inputStyle} />
              <input placeholder="SST No" value={sstNo} onChange={(e) => setSstNo(e.target.value)} style={inputStyle} />
              <input placeholder="MSIC Code" value={msicCode} onChange={(e) => setMsicCode(e.target.value)} style={inputStyle} />
              <input placeholder="e-Invoice UUID" value={einvoiceUuid} onChange={(e) => setEinvoiceUuid(e.target.value)} style={inputStyle} />
              <input placeholder="Validation Status" value={validationStatus} onChange={(e) => setValidationStatus(e.target.value)} style={inputStyle} />
              <input placeholder="QR Code URL" value={qrCodeUrl} onChange={(e) => setQrCodeUrl(e.target.value)} style={inputStyle} />
              <input placeholder="MyInvois Submission Status" value={myinvoisStatus} onChange={(e) => setMyinvoisStatus(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <section id="printable-invoice" style={printInvoiceBoxStyle}>
            <div style={printHeaderStyle}>
              <div style={printCompanyStyle}>
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} style={printLogoStyle} />
                ) : (
                  <div style={printLogoPlaceholderStyle}>LOGO</div>
                )}

                <div>
                  <h2 style={{ margin: 0 }}>{companyName}</h2>
                  <div>SSM：{companyRegNo || "-"}</div>
                  <div>{t.phone}：{companyPhone || "-"}</div>
                  <div>{t.address}：{companyAddress || "-"}</div>
                </div>
              </div>

              <div style={printInvoiceTitleStyle}>
                <h1 style={{ margin: 0 }}>INVOICE</h1>
                <div>{invoiceNo}</div>
              </div>
            </div>

            <div style={printTwoColStyle}>
              <div style={printBoxStyle}>
                <strong>{t.customerInfo}</strong>
                <div>{customerMode === "select" ? selectedCustomer?.name || "-" : newCustomerName || "-"}</div>
                <div>{customerMode === "select" ? selectedCustomer?.phone || "-" : newCustomerPhone || "-"}</div>
                <div>{customerMode === "select" ? selectedCustomer?.company_name || "-" : newCustomerCompany || "-"}</div>
                <div>{customerMode === "select" ? selectedCustomer?.address || "-" : newCustomerAddress || "-"}</div>
              </div>

              <div style={printBoxStyle}>
                <div style={rowStyle}><span>{t.invoiceDate}</span><strong>{invoiceDate}</strong></div>
                <div style={rowStyle}><span>{t.dueDate}</span><strong>{dueDate}</strong></div>
                <div style={rowStyle}><span>{t.status}</span><strong>{getStatusText(status)}</strong></div>
                <div style={rowStyle}><span>{t.paymentMethod}</span><strong>{paymentMethod}</strong></div>
              </div>
            </div>

            <table style={printTableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>{t.productName}</th>
                  <th style={thStyle}>{t.qty}</th>
                  <th style={thStyle}>{t.price}</th>
                  <th style={thStyle}>{t.discount}</th>
                  <th style={thStyle}>{t.total}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>{productMode === "select" ? selectedProduct?.name || "-" : newProductName || "-"}</td>
                  <td style={tdStyle}>{preview.finalQty}</td>
                  <td style={tdStyle}>RM {preview.price.toFixed(2)}</td>
                  <td style={tdStyle}>RM {preview.discount.toFixed(2)}</td>
                  <td style={tdStyle}>RM {preview.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style={printTotalBoxStyle}>
              <div style={rowStyle}><span>{t.subtotal}</span><strong>RM {preview.subtotal.toFixed(2)}</strong></div>
              <div style={rowStyle}><span>{t.discount}</span><strong>RM {preview.discount.toFixed(2)}</strong></div>
              <div style={totalRowStyle}><span>{t.total}</span><strong>RM {preview.total.toFixed(2)}</strong></div>
              <div style={profitRowStyle} className="no-print">
                <span>{t.profit}</span><strong>RM {preview.profit.toFixed(2)}</strong>
              </div>
            </div>

            {note ? (
              <div style={printNoteStyle}>
                <strong>{t.note}：</strong>
                <div>{note}</div>
              </div>
            ) : null}
          </section>

          <div className="no-print">
            <button onClick={createInvoice} disabled={loading} style={submitBtn}>
              {loading ? t.generating : t.generate}
            </button>

            <div style={actionRow}>
              <button onClick={printInvoice} style={secondaryBtn}>{t.print}</button>
              <button onClick={downloadPdf} style={secondaryBtn}>{t.pdf}</button>
              <button onClick={sendWhatsApp} style={whatsappBtn}>{t.whatsapp}</button>
            </div>

            {msg ? <p style={msgStyle}>{msg}</p> : null}
          </div>
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 16,
  background: "#ecfdf5",
  fontFamily: "sans-serif",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const langBtn = (active: boolean): CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: "2px solid #0f766e",
  background: active ? "#0f766e" : "#fff",
  color: active ? "#fff" : "#0f766e",
  fontWeight: 900,
});

const backBtn: CSSProperties = {
  background: "#fff",
  color: "#0f766e",
  border: "2px solid #0f766e",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 900,
};

const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "3px solid #14b8a6",
  boxShadow: "0 0 0 1px rgba(20,184,166,0.42), 0 0 18px rgba(45,212,191,0.55), 0 18px 42px rgba(15,118,110,0.25)",
  borderRadius: 24,
  padding: 20,
};

const listHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#0f766e",
  fontSize: 30,
};

const descStyle: CSSProperties = {
  color: "#64748b",
  marginBottom: 20,
};

const plusBtnStyle: CSSProperties = {
  background: "#0f766e",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "12px 16px",
  fontWeight: 900,
};

const invoiceListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 14,
};

const invoiceItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  border: "2px solid #14b8a6",
  borderRadius: 16,
  padding: 14,
  background: "#f8fafc",
};

const mutedStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  marginTop: 4,
};

const amountStyle: CSSProperties = {
  color: "#0f766e",
  whiteSpace: "nowrap",
};

const emptyTextStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 700,
};

const formTopActionStyle: CSSProperties = {
  marginBottom: 14,
};

const invoiceNoBox: CSSProperties = {
  background: "#ecfdf5",
  border: "2px solid #14b8a6",
  borderRadius: 14,
  padding: 12,
  marginBottom: 20,
};

const switchRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 12,
};

const modeBtn = (active: boolean): CSSProperties => ({
  padding: "12px",
  borderRadius: 12,
  border: "2px solid #0f766e",
  background: active ? "#0f766e" : "#fff",
  color: active ? "#fff" : "#0f766e",
  fontWeight: 900,
});

const formGrid: CSSProperties = {
  display: "grid",
  gap: 6,
};

const labelStyle: CSSProperties = {
  fontWeight: 900,
  color: "#0f766e",
  marginTop: 6,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  borderRadius: 12,
  border: "2px solid #14b8a6",
  fontSize: 16,
  marginBottom: 8,
};

const smallDateInput: CSSProperties = {
  ...inputStyle,
  maxWidth: 220,
};

const paymentAddRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 10,
  marginBottom: 8,
};

const miniBtnStyle: CSSProperties = {
  background: "#0f766e",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "10px 12px",
  fontWeight: 900,
};

const companyBox: CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  background: "#f8fafc",
  border: "2px solid #14b8a6",
  borderRadius: 16,
  padding: 14,
  flexWrap: "wrap",
};

const companyEditBoxStyle: CSSProperties = {
  marginTop: 12,
  padding: 14,
  border: "2px dashed #14b8a6",
  borderRadius: 16,
  background: "#f8fafc",
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

const printInvoiceBoxStyle: CSSProperties = {
  background: "#ffffff",
  border: "2px solid #0f766e",
  borderRadius: 18,
  padding: 18,
  marginTop: 20,
};

const printHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  borderBottom: "2px solid #0f766e",
  paddingBottom: 16,
  marginBottom: 16,
};

const printCompanyStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const printLogoStyle: CSSProperties = {
  width: 70,
  height: 70,
  borderRadius: 10,
  objectFit: "cover",
};

const printLogoPlaceholderStyle: CSSProperties = {
  width: 70,
  height: 70,
  borderRadius: 10,
  background: "#ccfbf1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0f766e",
  fontWeight: 900,
};

const printInvoiceTitleStyle: CSSProperties = {
  textAlign: "right",
  color: "#0f766e",
};

const printTwoColStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginBottom: 16,
};

const printBoxStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 12,
};

const printTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
};

const thStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  padding: 10,
  textAlign: "left",
  background: "#ecfdf5",
};

const tdStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  padding: 10,
};

const printTotalBoxStyle: CSSProperties = {
  marginTop: 16,
  marginLeft: "auto",
  maxWidth: 360,
};

const printNoteStyle: CSSProperties = {
  marginTop: 16,
  padding: 12,
  border: "1px solid #cbd5e1",
  borderRadius: 12,
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "8px 0",
  borderBottom: "1px solid #e2e8f0",
};

const totalRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "12px 0",
  fontSize: 20,
  color: "#0f766e",
};

const profitRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "10px 0",
  color: "#16a34a",
  fontWeight: 900,
};

const submitBtn: CSSProperties = {
  width: "100%",
  marginTop: 18,
  padding: "14px",
  border: "none",
  borderRadius: 14,
  background: "#0f766e",
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
  border: "2px solid #0f766e",
  background: "#fff",
  color: "#0f766e",
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
  color: "#0f766e",
  fontWeight: 900,
};
