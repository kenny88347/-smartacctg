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
    fail: "生成失败：",
    incomplete: "客户或产品资料不完整",
    trialProductNote: "由发票系统新增",
  },
  en: {
    back: "Back",
    title: "Professional Invoice System",
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
    note: "Note",
    companyInfo: "2. Company Info",
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
    fail: "Failed: ",
    incomplete: "Customer or product information is incomplete",
    trialProductNote: "Added from invoice system",
  },
  ms: {
    back: "Kembali",
    title: "Sistem Invois Profesional",
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
    note: "Nota",
    companyInfo: "2. Maklumat Syarikat",
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
    fail: "Gagal: ",
    incomplete: "Maklumat pelanggan atau produk tidak lengkap",
    trialProductNote: "Ditambah dari sistem invois",
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

    const q = new URLSearchParams(window.location.search);
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
        category_name: lang === "zh" ? "发票收入" : lang === "en" ? "Invoice Income" : "Pendapatan Invois",
        note: `${invNo}｜${customer.name}｜${product.name}`,
      },
      ...oldTx,
    ];

    localStorage.setItem(TRIAL_TX_KEY, JSON.stringify(nextTx));
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
          const { data, error } = await supabase
            .from("products")
            .insert({
              user_id: userId,
              name: newProductName,
              price: Number(newProductPrice),
              cost: Number(newProductCost),
              discount: 0,
              stock_qty: Number(newProductStock || 0),
              note: t.trialProductNote,
            })
            .select()
            .single();

          if (error) throw error;
          finalProduct = data as Product;
        }
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

      if (isTrial) {
        const nextProducts = products.map((p) =>
          p.id === finalProduct!.id ? { ...p, stock_qty: newStock } : p
        );

        setProducts(nextProducts);
        saveTrialData(customers, nextProducts);
        addTrialTransaction(preview.total, finalCustomer, finalProduct, invoiceNo);

        setMsg(t.trialSuccess);
        setLoading(false);
        return;
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          customer_id: finalCustomer.id,
          customer_name: finalCustomer.name,
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
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const { error: itemError } = await supabase.from("invoice_items").insert({
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

      if (itemError) throw itemError;

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock_qty: newStock })
        .eq("id", finalProduct.id);

      if (stockError) throw stockError;

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: userId,
        txn_date: invoiceDate,
        txn_type: "income",
        amount: preview.total,
        category_name: lang === "zh" ? "发票收入" : lang === "en" ? "Invoice Income" : "Pendapatan Invois",
        debt_amount: 0,
        source_type: "invoice",
        source_id: invoiceData.id,
        note: `${invoiceNo}｜${finalCustomer.name}｜${finalProduct.name}`,
      });

      if (txError) throw txError;

      await loadProducts(userId);

      setMsg(t.success);
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

  return (
    <main style={pageStyle}>
      <div style={topRowStyle}>
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

      <section style={cardStyle}>
        <h1 style={titleStyle}>{t.title}</h1>
        <p style={descStyle}>{t.desc}</p>

        <div style={invoiceNoBox}>
          <strong>Invoice No：</strong> {invoiceNo}
        </div>

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
          <input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>{t.note}</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} style={inputStyle} />
        </div>

        <h3>{t.companyInfo}</h3>

        <div style={companyBox}>
          {companyLogoUrl ? <img src={companyLogoUrl} style={logoStyle} /> : <div style={logoPlaceholder}>LOGO</div>}
          <div>
            <strong>{companyName}</strong>
            <div>SSM：{companyRegNo || "-"}</div>
            <div>{t.phone}：{companyPhone || "-"}</div>
            <div>{t.address}：{companyAddress || "-"}</div>
          </div>
        </div>

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
                {p.name}｜{t.price} {Number(p.price).toFixed(2)}｜{t.cost} {Number(p.cost).toFixed(2)}｜{t.stock} {Number(p.stock_qty || 0)}
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

        <section style={previewBox}>
          <h3>{t.preview}</h3>

          <div style={rowStyle}><span>Invoice No</span><strong>{invoiceNo}</strong></div>
          <div style={rowStyle}><span>{t.invoiceDate}</span><strong>{invoiceDate}</strong></div>
          <div style={rowStyle}><span>{t.dueDate}</span><strong>{dueDate}</strong></div>
          <div style={rowStyle}><span>{t.status}</span><strong>{status}</strong></div>
          <div style={rowStyle}><span>{t.price}</span><strong>RM {preview.price.toFixed(2)}</strong></div>
          <div style={rowStyle}><span>{t.qty}</span><strong>{preview.finalQty}</strong></div>
          <div style={rowStyle}><span>{t.subtotal}</span><strong>RM {preview.subtotal.toFixed(2)}</strong></div>
          <div style={rowStyle}><span>{t.discount}</span><strong>RM {preview.discount.toFixed(2)}</strong></div>
          <div style={totalRowStyle}><span>{t.total}</span><strong>RM {preview.total.toFixed(2)}</strong></div>
          <div style={profitRowStyle}><span>{t.profit}</span><strong>RM {preview.profit.toFixed(2)}</strong></div>
        </section>

        <button onClick={createInvoice} disabled={loading} style={submitBtn}>
          {loading ? t.generating : t.generate}
        </button>

        <div style={actionRow}>
          <button onClick={printInvoice} style={secondaryBtn}>{t.print}</button>
          <button onClick={downloadPdf} style={secondaryBtn}>{t.pdf}</button>
          <button onClick={sendWhatsApp} style={whatsappBtn}>{t.whatsapp}</button>
        </div>

        {msg ? <p style={msgStyle}>{msg}</p> : null}
      </section>
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

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#0f766e",
  fontSize: 30,
};

const descStyle: CSSProperties = {
  color: "#64748b",
  marginBottom: 20,
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

const companyBox: CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  background: "#f8fafc",
  border: "2px solid #14b8a6",
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

const previewBox: CSSProperties = {
  background: "#f8fafc",
  border: "2px solid #14b8a6",
  borderRadius: 18,
  padding: 16,
  marginTop: 18,
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #e2e8f0",
};

const totalRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  fontSize: 20,
  color: "#0f766e",
};

const profitRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
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
