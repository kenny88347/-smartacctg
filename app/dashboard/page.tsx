"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type PageKey = "accounting" | "customers" | "products" | "invoices";
type Lang = "zh" | "en" | "ms";

type Txn = {
  id: string;
  user_id?: string;
  txn_date: string;
  txn_type: "income" | "expense";
  amount: number;
  category_name: string | null;
  debt_amount: number | null;
  note: string | null;
};

type Customer = {
  id: string;
  user_id?: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  company_phone?: string | null;
  address: string | null;
  note?: string | null;
};

type Product = {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  cost: number;
  discount: number | null;
  stock_qty?: number | null;
  note: string | null;
};

type CustomerPrice = {
  id: string;
  user_id?: string;
  customer_id: string;
  product_id: string;
  custom_price: number;
};

const I18N = {
  zh: {
    dashboard: "控制台",
    accounting: "记账系统",
    customers: "客户管理",
    products: "产品管理",
    invoices: "发票系统",
    balance: "当前余额",
    income: "本月收入",
    expense: "本月支出",
    logout: "退出登录",
    date: "日期",
    type: "类型",
    receive: "收款",
    pay: "付款",
    amount: "金额（RM）",
    category: "分类 / 标签",
    debt: "欠款（可留空）",
    note: "备注",
    addRecord: "新增记录",
    name: "名称",
    phone: "电话号码",
    companyInfo: "公司资料",
    companyName: "公司名称",
    companyPhone: "公司电话号码",
    companyAddress: "公司地址",
    addCustomer: "新增客户",
    edit: "编辑",
    save: "保存修改",
    productName: "产品名称",
    price: "价格",
    cost: "成本",
    discount: "折扣",
    stock: "货数数量 / 库存",
    addProduct: "新增产品",
    customerPrice: "客户专属价格",
    selectCustomer: "选择客户",
    selectProduct: "选择产品",
    customPrice: "这个客户的专属价格",
    saveCustomPrice: "保存客户专属价格",
    chooseCustomer: "选择客户管理",
    newCustomer: "新增客户",
    chooseProduct: "选择产品管理",
    newProduct: "新增产品",
    qty: "出货数量",
    unitPrice: "单价",
    total: "总价",
    profit: "预计差价 / 利润",
    createInvoice: "生成发票并加入记账",
    noData: "还没有资料",
  },
  en: {
    dashboard: "Dashboard",
    accounting: "Accounting System",
    customers: "Customer Management",
    products: "Product Management",
    invoices: "Invoice System",
    balance: "Balance",
    income: "Monthly Income",
    expense: "Monthly Expense",
    logout: "Logout",
    date: "Date",
    type: "Type",
    receive: "Income",
    pay: "Expense",
    amount: "Amount (RM)",
    category: "Category / Tag",
    debt: "Debt (Optional)",
    note: "Note",
    addRecord: "Add Record",
    name: "Name",
    phone: "Phone Number",
    companyInfo: "Company Info",
    companyName: "Company Name",
    companyPhone: "Company Phone",
    companyAddress: "Company Address",
    addCustomer: "Add Customer",
    edit: "Edit",
    save: "Save Changes",
    productName: "Product Name",
    price: "Price",
    cost: "Cost",
    discount: "Discount",
    stock: "Stock Quantity",
    addProduct: "Add Product",
    customerPrice: "Customer Special Price",
    selectCustomer: "Select Customer",
    selectProduct: "Select Product",
    customPrice: "Special Price",
    saveCustomPrice: "Save Special Price",
    chooseCustomer: "Choose Customer",
    newCustomer: "New Customer",
    chooseProduct: "Choose Product",
    newProduct: "New Product",
    qty: "Quantity",
    unitPrice: "Unit Price",
    total: "Total",
    profit: "Estimated Profit",
    createInvoice: "Create Invoice & Add Record",
    noData: "No data yet",
  },
  ms: {
    dashboard: "Papan Pemuka",
    accounting: "Sistem Akaun",
    customers: "Pengurusan Pelanggan",
    products: "Pengurusan Produk",
    invoices: "Sistem Invois",
    balance: "Baki Semasa",
    income: "Pendapatan Bulan Ini",
    expense: "Perbelanjaan Bulan Ini",
    logout: "Log Keluar",
    date: "Tarikh",
    type: "Jenis",
    receive: "Terima",
    pay: "Bayar",
    amount: "Jumlah (RM)",
    category: "Kategori / Tag",
    debt: "Hutang (Pilihan)",
    note: "Nota",
    addRecord: "Tambah Rekod",
    name: "Nama",
    phone: "Nombor Telefon",
    companyInfo: "Maklumat Syarikat",
    companyName: "Nama Syarikat",
    companyPhone: "Telefon Syarikat",
    companyAddress: "Alamat Syarikat",
    addCustomer: "Tambah Pelanggan",
    edit: "Edit",
    save: "Simpan",
    productName: "Nama Produk",
    price: "Harga",
    cost: "Kos",
    discount: "Diskaun",
    stock: "Stok",
    addProduct: "Tambah Produk",
    customerPrice: "Harga Khas Pelanggan",
    selectCustomer: "Pilih Pelanggan",
    selectProduct: "Pilih Produk",
    customPrice: "Harga Khas",
    saveCustomPrice: "Simpan Harga Khas",
    chooseCustomer: "Pilih Pelanggan",
    newCustomer: "Pelanggan Baru",
    chooseProduct: "Pilih Produk",
    newProduct: "Produk Baru",
    qty: "Kuantiti",
    unitPrice: "Harga Seunit",
    total: "Jumlah",
    profit: "Anggaran Untung",
    createInvoice: "Buat Invois & Tambah Rekod",
    noData: "Tiada data lagi",
  },
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [lang, setLang] = useState<Lang>("zh");
  const [page, setPage] = useState<PageKey>("accounting");

  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);

  const [txDate, setTxDate] = useState("");
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("");
  const [txDebt, setTxDebt] = useState("");
  const [txNote, setTxNote] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerCompanyPhone, setCustomerCompanyPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCost, setProductCost] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [productStockQty, setProductStockQty] = useState("");
  const [productNote, setProductNote] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [priceCustomerId, setPriceCustomerId] = useState("");
  const [priceProductId, setPriceProductId] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const [invoiceCustomerMode, setInvoiceCustomerMode] = useState<"select" | "new">("select");
  const [invoiceProductMode, setInvoiceProductMode] = useState<"select" | "new">("select");
  const [invoiceCustomerId, setInvoiceCustomerId] = useState("");
  const [invoiceProductId, setInvoiceProductId] = useState("");
  const [invoiceQty, setInvoiceQty] = useState("1");
  const [invoiceMsg, setInvoiceMsg] = useState("");

  const [newInvoiceCustomerName, setNewInvoiceCustomerName] = useState("");
  const [newInvoiceCustomerPhone, setNewInvoiceCustomerPhone] = useState("");
  const [newInvoiceCustomerCompany, setNewInvoiceCustomerCompany] = useState("");
  const [newInvoiceCustomerAddress, setNewInvoiceCustomerAddress] = useState("");

  const [newInvoiceProductName, setNewInvoiceProductName] = useState("");
  const [newInvoiceProductPrice, setNewInvoiceProductPrice] = useState("");
  const [newInvoiceProductCost, setNewInvoiceProductCost] = useState("");
  const [newInvoiceProductStockQty, setNewInvoiceProductStockQty] = useState("");

  const t = I18N[lang];

  useEffect(() => {
    const url = new URL(window.location.href);
    const qPage = url.searchParams.get("page") as PageKey | null;
    const qLang = url.searchParams.get("lang") as Lang | null;

    if (qPage && ["accounting", "customers", "products", "invoices"].includes(qPage)) setPage(qPage);
    if (qLang && ["zh", "en", "ms"].includes(qLang)) setLang(qLang);

    init();
  }, []);

  async function init() {
    const { data } = await supabase.auth.getSession();
    const currentSession = data.session;

    if (!currentSession) {
      window.location.href = "/zh";
      return;
    }

    setSession(currentSession);
    await loadAll(currentSession.user.id);
  }

  async function loadAll(userId: string) {
    const [tx, cs, ps, cp] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("customers").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("products").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("customer_prices").select("*").eq("user_id", userId),
    ]);

    setTransactions((tx.data || []) as Txn[]);
    setCustomers((cs.data || []) as Customer[]);
    setProducts((ps.data || []) as Product[]);
    setCustomerPrices((cp.data || []) as CustomerPrice[]);
  }

  function goPage(next: PageKey) {
    setPage(next);
    window.history.pushState({}, "", `/dashboard?page=${next}&lang=${lang}`);
  }

  function changeLang(next: Lang) {
    setLang(next);
    window.history.pushState({}, "", `/dashboard?page=${page}&lang=${next}`);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  async function addTransaction() {
    if (!session || !txDate || !txAmount || !txCategory) return;

    await supabase.from("transactions").insert({
      user_id: session.user.id,
      txn_date: txDate,
      txn_type: txType,
      amount: Number(txAmount),
      category_name: txCategory,
      debt_amount: Number(txDebt || 0),
      note: txNote,
    });

    setTxDate("");
    setTxAmount("");
    setTxCategory("");
    setTxDebt("");
    setTxNote("");

    await loadAll(session.user.id);
  }

  async function addCustomer() {
    if (!session || !customerName) return;

    await supabase.from("customers").insert({
      user_id: session.user.id,
      name: customerName,
      phone: customerPhone,
      company_name: customerCompany,
      address: customerAddress,
      note: customerCompanyPhone,
    });

    setCustomerName("");
    setCustomerPhone("");
    setCustomerCompany("");
    setCustomerCompanyPhone("");
    setCustomerAddress("");

    await loadAll(session.user.id);
  }

  async function updateCustomer(c: Customer) {
    if (!session) return;

    await supabase
      .from("customers")
      .update({
        name: c.name,
        phone: c.phone,
        company_name: c.company_name,
        address: c.address,
        note: c.company_phone || c.note || "",
      })
      .eq("id", c.id);

    setEditingCustomerId(null);
    await loadAll(session.user.id);
  }

  async function addProduct() {
    if (!session || !productName || !productPrice || !productCost) return;

    await supabase.from("products").insert({
      user_id: session.user.id,
      name: productName,
      price: Number(productPrice),
      cost: Number(productCost),
      discount: Number(productDiscount || 0),
      stock_qty: Number(productStockQty || 0),
      note: productNote,
    });

    setProductName("");
    setProductPrice("");
    setProductCost("");
    setProductDiscount("");
    setProductStockQty("");
    setProductNote("");

    await loadAll(session.user.id);
  }

  async function updateProduct(p: Product) {
    if (!session) return;

    await supabase
      .from("products")
      .update({
        name: p.name,
        price: Number(p.price),
        cost: Number(p.cost),
        discount: Number(p.discount || 0),
        stock_qty: Number(p.stock_qty || 0),
        note: p.note,
      })
      .eq("id", p.id);

    setEditingProductId(null);
    await loadAll(session.user.id);
  }

  async function saveCustomerPrice() {
    if (!session || !priceCustomerId || !priceProductId || !customPrice) return;

    await supabase.from("customer_prices").upsert(
      {
        user_id: session.user.id,
        customer_id: priceCustomerId,
        product_id: priceProductId,
        custom_price: Number(customPrice),
      },
      { onConflict: "customer_id,product_id" }
    );

    setCustomPrice("");
    await loadAll(session.user.id);
  }

  const invoiceProduct = products.find((p) => p.id === invoiceProductId);
  const specialPrice = customerPrices.find(
    (x) => x.customer_id === invoiceCustomerId && x.product_id === invoiceProductId
  );

  const invoiceUnitPrice =
    invoiceProductMode === "new"
      ? Number(newInvoiceProductPrice || 0)
      : Number(specialPrice?.custom_price || invoiceProduct?.price || 0);

  const invoiceUnitCost =
    invoiceProductMode === "new"
      ? Number(newInvoiceProductCost || 0)
      : Number(invoiceProduct?.cost || 0);

  const invoiceQtyNumber = Number(invoiceQty || 1);
  const invoiceTotal = invoiceUnitPrice * invoiceQtyNumber;
  const invoiceProfit = (invoiceUnitPrice - invoiceUnitCost) * invoiceQtyNumber;

  async function createInvoice() {
    if (!session) return;

    setInvoiceMsg("");

    let customer = customers.find((c) => c.id === invoiceCustomerId);
    let product = products.find((p) => p.id === invoiceProductId);

    if (invoiceCustomerMode === "new") {
      if (!newInvoiceCustomerName) {
        setInvoiceMsg("请填写客户名称");
        return;
      }

      const { data } = await supabase
        .from("customers")
        .insert({
          user_id: session.user.id,
          name: newInvoiceCustomerName,
          phone: newInvoiceCustomerPhone,
          company_name: newInvoiceCustomerCompany,
          address: newInvoiceCustomerAddress,
        })
        .select()
        .single();

      customer = data as Customer;
    }

    if (invoiceProductMode === "new") {
      if (!newInvoiceProductName || !newInvoiceProductPrice || !newInvoiceProductCost) {
        setInvoiceMsg("请填写产品名称、价格和成本");
        return;
      }

      const { data } = await supabase
        .from("products")
        .insert({
          user_id: session.user.id,
          name: newInvoiceProductName,
          price: Number(newInvoiceProductPrice),
          cost: Number(newInvoiceProductCost),
          discount: 0,
          stock_qty: Number(newInvoiceProductStockQty || 0),
          note: "发票新增产品",
        })
        .select()
        .single();

      product = data as Product;
    }

    if (!customer || !product) {
      setInvoiceMsg("请选择或新增客户和产品");
      return;
    }

    const qty = Number(invoiceQty || 1);
    const stock = Number(product.stock_qty || 0);

    if (stock < qty) {
      setInvoiceMsg(`库存不足，目前库存：${stock}`);
      return;
    }

    const newStock = stock - qty;
    const invoiceNo = `INV-${Date.now()}`;

    const { data: invoiceData, error } = await supabase
      .from("invoices")
      .insert({
        user_id: session.user.id,
        customer_id: customer.id,
        customer_name: customer.name,
        invoice_no: invoiceNo,
        subtotal: invoiceTotal,
        total: invoiceTotal,
        total_cost: invoiceUnitCost * qty,
        total_profit: invoiceProfit,
        note: "由发票系统生成",
      })
      .select()
      .single();

    if (error) {
      setInvoiceMsg("发票生成失败：" + error.message);
      return;
    }

    await supabase.from("invoice_items").insert({
      invoice_id: invoiceData.id,
      product_id: product.id,
      product_name: product.name,
      qty,
      unit_price: invoiceUnitPrice,
      unit_cost: invoiceUnitCost,
      discount: 0,
      line_total: invoiceTotal,
      line_profit: invoiceProfit,
    });

    await supabase.from("products").update({ stock_qty: newStock }).eq("id", product.id);

    await supabase.from("transactions").insert({
      user_id: session.user.id,
      txn_date: new Date().toISOString().slice(0, 10),
      txn_type: "income",
      amount: invoiceTotal,
      category_name: "发票收入",
      debt_amount: 0,
      source_type: "invoice",
      source_id: invoiceData.id,
      note: `${invoiceNo}｜${customer.name}｜${product.name}｜出货 ${qty} 件`,
    });

    setInvoiceMsg("发票已生成，已加入记账，并已扣库存");
    setInvoiceCustomerId("");
    setInvoiceProductId("");
    setInvoiceQty("1");

    await loadAll(session.user.id);
  }

  const totalIncome = useMemo(
    () => transactions.filter((x) => x.txn_type === "income").reduce((s, x) => s + Number(x.amount || 0), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () => transactions.filter((x) => x.txn_type === "expense").reduce((s, x) => s + Number(x.amount || 0), 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>{t.dashboard}</h1>
          <div style={langRowStyle}>
            <button onClick={() => changeLang("zh")} style={langBtn(lang === "zh")}>中文</button>
            <button onClick={() => changeLang("en")} style={langBtn(lang === "en")}>English</button>
            <button onClick={() => changeLang("ms")} style={langBtn(lang === "ms")}>BM</button>
          </div>
        </div>

        <button onClick={handleLogout} style={logoutBtnStyle}>{t.logout}</button>
      </header>

      <section style={statsGridStyle}>
        <div style={statCardStyle}>
          <div>{t.balance}</div>
          <strong>RM {balance.toFixed(2)}</strong>
        </div>
        <div style={statCardStyle}>
          <div>{t.income}</div>
          <strong>RM {totalIncome.toFixed(2)}</strong>
        </div>
        <div style={statCardStyle}>
          <div>{t.expense}</div>
          <strong>RM {totalExpense.toFixed(2)}</strong>
        </div>
      </section>

      <nav style={menuGridStyle}>
        <button onClick={() => goPage("accounting")} style={menuBtn(page === "accounting")}>{t.accounting}</button>
        <button onClick={() => goPage("customers")} style={menuBtn(page === "customers")}>{t.customers}</button>
        <button onClick={() => goPage("products")} style={menuBtn(page === "products")}>{t.products}</button>
        <button onClick={() => goPage("invoices")} style={menuBtn(page === "invoices")}>{t.invoices}</button>
      </nav>

      {page === "accounting" && (
        <section style={sectionCardStyle}>
          <h2>{t.accounting}</h2>

          <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} style={inputStyle} />

          <select value={txType} onChange={(e) => setTxType(e.target.value as "income" | "expense")} style={inputStyle}>
            <option value="income">{t.receive}</option>
            <option value="expense">{t.pay}</option>
          </select>

          <input placeholder={t.amount} value={txAmount} onChange={(e) => setTxAmount(e.target.value)} style={inputStyle} />
          <input placeholder={t.category} value={txCategory} onChange={(e) => setTxCategory(e.target.value)} style={inputStyle} />
          <input placeholder={t.debt} value={txDebt} onChange={(e) => setTxDebt(e.target.value)} style={inputStyle} />
          <input placeholder={t.note} value={txNote} onChange={(e) => setTxNote(e.target.value)} style={inputStyle} />

          <button onClick={addTransaction} style={primaryBtnStyle}>{t.addRecord}</button>

          {transactions.map((x) => (
            <div key={x.id} style={listItemStyle}>
              <strong>{x.txn_type === "income" ? t.receive : t.pay}</strong>
              <span>{x.category_name}</span>
              <b>RM {Number(x.amount).toFixed(2)}</b>
            </div>
          ))}
        </section>
      )}

      {page === "customers" && (
        <section style={sectionCardStyle}>
          <h2>{t.customers}</h2>

          <input placeholder={t.name} value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
          <input placeholder={t.phone} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputStyle} />
          <input placeholder={t.companyName} value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} style={inputStyle} />
          <input placeholder={t.companyPhone} value={customerCompanyPhone} onChange={(e) => setCustomerCompanyPhone(e.target.value)} style={inputStyle} />
          <input placeholder={t.companyAddress} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} style={inputStyle} />

          <button onClick={addCustomer} style={primaryBtnStyle}>{t.addCustomer}</button>

          {customers.map((c) => (
            <div key={c.id} style={listItemStyle}>
              {editingCustomerId === c.id ? (
                <div style={{ width: "100%" }}>
                  <label style={fieldLabelStyle}>{t.name}</label>
                  <input value={c.name} onChange={(e) => setCustomers((p) => p.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} style={inputStyle} />

                  <label style={fieldLabelStyle}>{t.phone}</label>
                  <input value={c.phone || ""} onChange={(e) => setCustomers((p) => p.map((x) => x.id === c.id ? { ...x, phone: e.target.value } : x))} style={inputStyle} />

                  <label style={fieldLabelStyle}>{t.companyName}</label>
                  <input value={c.company_name || ""} onChange={(e) => setCustomers((p) => p.map((x) => x.id === c.id ? { ...x, company_name: e.target.value } : x))} style={inputStyle} />

                  <label style={fieldLabelStyle}>{t.companyAddress}</label>
                  <input value={c.address || ""} onChange={(e) => setCustomers((p) => p.map((x) => x.id === c.id ? { ...x, address: e.target.value } : x))} style={inputStyle} />

                  <button onClick={() => updateCustomer(c)} style={primaryBtnStyle}>{t.save}</button>
                </div>
              ) : (
                <>
                  <div>
                    <strong>{c.name}</strong>
                    <p>{c.phone || "-"}</p>
                    <p>{c.company_name || "-"}</p>
                  </div>
                  <button onClick={() => setEditingCustomerId(c.id)} style={editBtnStyle}>{t.edit}</button>
                </>
              )}
            </div>
          ))}
        </section>
      )}

      {page === "products" && (
        <section style={sectionCardStyle}>
          <h2>{t.products}</h2>

          <input placeholder={t.productName} value={productName} onChange={(e) => setProductName(e.target.value)} style={inputStyle} />
          <input placeholder={t.price} value={productPrice} onChange={(e) => setProductPrice(e.target.value)} style={inputStyle} />
          <input placeholder={t.cost} value={productCost} onChange={(e) => setProductCost(e.target.value)} style={inputStyle} />
          <input placeholder={t.discount} value={productDiscount} onChange={(e) => setProductDiscount(e.target.value)} style={inputStyle} />
          <input placeholder={t.stock} value={productStockQty} onChange={(e) => setProductStockQty(e.target.value)} style={inputStyle} />
          <input placeholder={t.note} value={productNote} onChange={(e) => setProductNote(e.target.value)} style={inputStyle} />

          <button onClick={addProduct} style={primaryBtnStyle}>{t.addProduct}</button>

          <div style={dashBoxStyle}>
            <h3>{t.customerPrice}</h3>

            <select value={priceCustomerId} onChange={(e) => setPriceCustomerId(e.target.value)} style={inputStyle}>
              <option value="">{t.selectCustomer}</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={priceProductId} onChange={(e) => setPriceProductId(e.target.value)} style={inputStyle}>
              <option value="">{t.selectProduct}</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <input placeholder={t.customPrice} value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} style={inputStyle} />
            <button onClick={saveCustomerPrice} style={primaryBtnStyle}>{t.saveCustomPrice}</button>
          </div>

          {products.map((p) => (
            <div key={p.id} style={listItemStyle}>
              {editingProductId === p.id ? (
                <div style={{ width: "100%" }}>
                  <label style={fieldLabelStyle}>{t.productName}</label>
                  <input value={p.name} onChange={(e) => setProducts((a) => a.map((x) => x.id === p.id ? { ...x, name: e.target.value } : x))} style={inputStyle} />

                  <label style={fieldLabelStyle}>{t.price}</label>
                  <input value={String(p.price)} onChange={(e) => setProducts((a) => a.map((x) => x.id === p.id ? { ...x, price: Number(e.target.value) } : x))} style={inputStyle} />

                  <label style={fieldLabelStyle}>{t.stock}</label>
                  <input value={String(p.stock_qty || 0)} onChange={(e) => setProducts((a) => a.map((x) => x.id === p.id ? { ...x, stock_qty: Number(e.target.value) } : x))} style={inputStyle} />

                  <button onClick={() => updateProduct(p)} style={primaryBtnStyle}>{t.save}</button>
                </div>
              ) : (
                <>
                  <div>
                    <strong>{p.name}</strong>
                    <p>RM {Number(p.price).toFixed(2)} ｜ {t.stock}: {Number(p.stock_qty || 0)}</p>
                  </div>
                  <button onClick={() => setEditingProductId(p.id)} style={editBtnStyle}>{t.edit}</button>
                </>
              )}
            </div>
          ))}
        </section>
      )}

      {page === "invoices" && (
        <section style={sectionCardStyle}>
          <h2>{t.invoices}</h2>

          <div style={switchRowStyle}>
            <button onClick={() => setInvoiceCustomerMode("select")} style={modeBtn(invoiceCustomerMode === "select")}>{t.chooseCustomer}</button>
            <button onClick={() => setInvoiceCustomerMode("new")} style={modeBtn(invoiceCustomerMode === "new")}>{t.newCustomer}</button>
          </div>

          {invoiceCustomerMode === "select" ? (
            <select value={invoiceCustomerId} onChange={(e) => setInvoiceCustomerId(e.target.value)} style={inputStyle}>
              <option value="">{t.selectCustomer}</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <>
              <input placeholder={t.name} value={newInvoiceCustomerName} onChange={(e) => setNewInvoiceCustomerName(e.target.value)} style={inputStyle} />
              <input placeholder={t.phone} value={newInvoiceCustomerPhone} onChange={(e) => setNewInvoiceCustomerPhone(e.target.value)} style={inputStyle} />
              <input placeholder={t.companyName} value={newInvoiceCustomerCompany} onChange={(e) => setNewInvoiceCustomerCompany(e.target.value)} style={inputStyle} />
              <input placeholder={t.companyAddress} value={newInvoiceCustomerAddress} onChange={(e) => setNewInvoiceCustomerAddress(e.target.value)} style={inputStyle} />
            </>
          )}

          <div style={switchRowStyle}>
            <button onClick={() => setInvoiceProductMode("select")} style={modeBtn(invoiceProductMode === "select")}>{t.chooseProduct}</button>
            <button onClick={() => setInvoiceProductMode("new")} style={modeBtn(invoiceProductMode === "new")}>{t.newProduct}</button>
          </div>

          {invoiceProductMode === "select" ? (
            <select value={invoiceProductId} onChange={(e) => setInvoiceProductId(e.target.value)} style={inputStyle}>
              <option value="">{t.selectProduct}</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ｜ {t.stock}: {Number(p.stock_qty || 0)}</option>)}
            </select>
          ) : (
            <>
              <input placeholder={t.productName} value={newInvoiceProductName} onChange={(e) => setNewInvoiceProductName(e.target.value)} style={inputStyle} />
              <input placeholder={t.price} value={newInvoiceProductPrice} onChange={(e) => setNewInvoiceProductPrice(e.target.value)} style={inputStyle} />
              <input placeholder={t.cost} value={newInvoiceProductCost} onChange={(e) => setNewInvoiceProductCost(e.target.value)} style={inputStyle} />
              <input placeholder={t.stock} value={newInvoiceProductStockQty} onChange={(e) => setNewInvoiceProductStockQty(e.target.value)} style={inputStyle} />
            </>
          )}

          <input placeholder={t.qty} value={invoiceQty} onChange={(e) => setInvoiceQty(e.target.value)} style={inputStyle} />

          <div style={summaryStyle}>
            <div>{t.unitPrice}: RM {invoiceUnitPrice.toFixed(2)}</div>
            <div>{t.total}: RM {invoiceTotal.toFixed(2)}</div>
            <div>{t.profit}: RM {invoiceProfit.toFixed(2)}</div>
          </div>

          <button onClick={createInvoice} style={primaryBtnStyle}>{t.createInvoice}</button>
          {invoiceMsg && <p style={{ color: "#0F766E", fontWeight: 800 }}>{invoiceMsg}</p>}
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 16,
  background: "#f0fdf4",
  fontFamily: "sans-serif",
  color: "#0f172a",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 18,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 30,
  color: "#0F766E",
  fontWeight: 900,
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 10,
  flexWrap: "wrap",
};

const langBtn = (active: boolean): CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #0F766E",
  background: active ? "#0F766E" : "#fff",
  color: active ? "#fff" : "#0F766E",
  fontWeight: 800,
});

const logoutBtnStyle: CSSProperties = {
  padding: "10px 14px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 800,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 18,
};

const statCardStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid #16a34a",
  borderRadius: 16,
  padding: 12,
  fontSize: 14,
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
};

const menuGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const menuBtn = (active: boolean): CSSProperties => ({
  padding: "14px 12px",
  borderRadius: 12,
  border: active ? "2px solid #0F766E" : "1px solid #cbd5e1",
  background: active ? "#ecfdf5" : "#fff",
  color: active ? "#0F766E" : "#0f172a",
  fontWeight: 900,
});

const sectionCardStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid #16a34a",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 16,
  boxSizing: "border-box",
  marginTop: 10,
};

const primaryBtnStyle: CSSProperties = {
  marginTop: 14,
  padding: "12px 18px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 900,
};

const editBtnStyle: CSSProperties = {
  padding: "8px 12px",
  background: "#ecfdf5",
  color: "#0F766E",
  border: "1px solid #0F766E",
  borderRadius: 8,
  fontWeight: 800,
};

const listItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
};

const fieldLabelStyle: CSSProperties = {
  display: "block",
  marginTop: 12,
  fontSize: 14,
  fontWeight: 900,
  color: "#14532d",
};

const dashBoxStyle: CSSProperties = {
  marginTop: 20,
  padding: 14,
  border: "1px dashed #0F766E",
  borderRadius: 14,
};

const switchRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 14,
};

const modeBtn = (active: boolean): CSSProperties => ({
  padding: "12px 10px",
  borderRadius: 10,
  border: "2px solid #0F766E",
  background: active ? "#0F766E" : "#fff",
  color: active ? "#fff" : "#0F766E",
  fontWeight: 900,
});

const summaryStyle: CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  lineHeight: 1.8,
  fontWeight: 800,
};
