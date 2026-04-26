"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type CustomerStatus = "normal" | "vip" | "debt" | "blocked";
type ThemeKey = "deepTeal" | "pink" | "blackGold" | "lightRed" | "nature" | "sky";

type Customer = {
  id: string;
  user_id?: string;
  name: string;
  phone: string | null;
  email: string | null;
  company_name: string | null;
  company_reg_no: string | null;
  company_phone: string | null;
  address: string | null;
  status: CustomerStatus | null;
  debt_amount: number | null;
  paid_amount: number | null;
  last_payment_date: string | null;
  note: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number | null;
};

type CustomerPrice = {
  id: string;
  user_id?: string;
  customer_id: string;
  product_id: string;
  custom_price: number;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_CUSTOMER_PRICES_KEY = "smartacctg_trial_customer_prices";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";

const LANG_KEY = "smartacctg_lang";
const THEME_KEY = "smartacctg_theme";

const today = () => new Date().toISOString().slice(0, 10);

const THEMES: Record<
  ThemeKey,
  {
    name: string;
    pageBg: string;
    card: string;
    border: string;
    accent: string;
    text: string;
    subText: string;
    softBg: string;
    glow: string;
  }
> = {
  deepTeal: {
    name: "深青色",
    pageBg: "#ecfdf5",
    card: "#ffffff",
    border: "#14b8a6",
    accent: "#0f766e",
    text: "#064e3b",
    subText: "#64748b",
    softBg: "#ccfbf1",
    glow: "0 0 0 1px rgba(20,184,166,0.35), 0 16px 36px rgba(20,184,166,0.22)",
  },
  pink: {
    name: "可爱粉色",
    pageBg: "#fff7fb",
    card: "#ffffff",
    border: "#f472b6",
    accent: "#db2777",
    text: "#4a044e",
    subText: "#831843",
    softBg: "#fce7f3",
    glow: "0 0 0 1px rgba(244,114,182,0.32), 0 16px 36px rgba(244,114,182,0.20)",
  },
  blackGold: {
    name: "黑金商务",
    pageBg: "#111111",
    card: "#1f1f1f",
    border: "#facc15",
    accent: "#d4af37",
    text: "#fff7ed",
    subText: "#d6c8a4",
    softBg: "#3b2f16",
    glow: "0 0 0 1px rgba(250,204,21,0.38), 0 16px 38px rgba(250,204,21,0.20)",
  },
  lightRed: {
    name: "可爱浅红",
    pageBg: "#fff1f2",
    card: "#ffffff",
    border: "#fb7185",
    accent: "#e11d48",
    text: "#881337",
    subText: "#9f1239",
    softBg: "#ffe4e6",
    glow: "0 0 0 1px rgba(251,113,133,0.35), 0 16px 36px rgba(251,113,133,0.20)",
  },
  nature: {
    name: "风景自然系",
    pageBg: "#f0fdf4",
    card: "#ffffff",
    border: "#22d3ee",
    accent: "#0f766e",
    text: "#14532d",
    subText: "#166534",
    softBg: "#dcfce7",
    glow: "0 0 0 1px rgba(34,211,238,0.32), 0 16px 36px rgba(34,211,238,0.20)",
  },
  sky: {
    name: "天空蓝",
    pageBg: "#eff6ff",
    card: "#ffffff",
    border: "#38bdf8",
    accent: "#0284c7",
    text: "#0f172a",
    subText: "#0369a1",
    softBg: "#dbeafe",
    glow: "0 0 0 1px rgba(56,189,248,0.35), 0 16px 36px rgba(56,189,248,0.20)",
  },
};

const TXT = {
  zh: {
    pageTitle: "客户资料记录",
    formTitle: "填写客户资料",
    back: "返回控制台",
    add: "新增",
    save: "保存资料",
    update: "保存修改",
    cancelEdit: "取消编辑",
    close: "关闭",
    search: "搜索客户名称 / 手机号码 / 公司名称 / 电子邮件",
    all: "全部",
    normal: "正常客户",
    vip: "VIP 客户",
    debt: "有欠款",
    blocked: "停止合作",
    personal: "个人资料",
    company: "公司资料",
    name: "客户名称",
    phone: "客户手机号码",
    email: "电子邮件",
    companyName: "公司名称",
    regNo: "SSM / 注册号",
    companyPhone: "公司电话",
    address: "地址",
    status: "客户状态",
    debtAmount: "欠款金额",
    paidAmount: "已付款金额",
    lastPaymentDate: "日期",
    note: "备注",
    edit: "编辑",
    delete: "删除",
    whatsapp: "WhatsApp",
    invoice: "开发票",
    accounting: "记账系统",
    products: "产品管理",
    invoices: "发票系统",
    noCustomers: "还没有客户资料",
    priceTitle: "产品专属价格",
    chooseCustomer: "选择客户",
    chooseProduct: "选择产品",
    customPrice: "这个客户的专属价格",
    savePrice: "保存专属价格",
    productNormalPrice: "产品原价",
    currentPrices: "目前已设置价格",
    noPrice: "还没有设置专属价格",
    saved: "保存成功",
    deleted: "删除成功",
    theme: "主题",
    language: "语言",
    related: "关联功能",
    chooseRelated: "请选择要前往的功能",
    goFeature: "前往",
    trialMode: "免费试用模式：资料只会暂存在本机",
    confirmDelete: "确定要删除这个客户吗？",
  },
  en: {
    pageTitle: "Customer Records",
    formTitle: "Customer Information",
    back: "Back to Dashboard",
    add: "Add",
    save: "Save",
    update: "Save Changes",
    cancelEdit: "Cancel Edit",
    close: "Close",
    search: "Search customer name / phone / company / email",
    all: "All",
    normal: "Normal",
    vip: "VIP",
    debt: "In Debt",
    blocked: "Blocked",
    personal: "Personal Info",
    company: "Company Info",
    name: "Customer Name",
    phone: "Phone",
    email: "Email",
    companyName: "Company Name",
    regNo: "SSM / Registration No.",
    companyPhone: "Company Phone",
    address: "Address",
    status: "Status",
    debtAmount: "Debt Amount",
    paidAmount: "Paid Amount",
    lastPaymentDate: "Date",
    note: "Note",
    edit: "Edit",
    delete: "Delete",
    whatsapp: "WhatsApp",
    invoice: "Invoice",
    accounting: "Accounting",
    products: "Products",
    invoices: "Invoices",
    noCustomers: "No customer records yet",
    priceTitle: "Product Special Price",
    chooseCustomer: "Choose Customer",
    chooseProduct: "Choose Product",
    customPrice: "Special Price",
    savePrice: "Save Special Price",
    productNormalPrice: "Normal Price",
    currentPrices: "Current Special Prices",
    noPrice: "No special price yet",
    saved: "Saved",
    deleted: "Deleted",
    theme: "Theme",
    language: "Language",
    related: "Linked Features",
    chooseRelated: "Choose linked feature",
    goFeature: "Go",
    trialMode: "Free trial mode: data is stored locally only",
    confirmDelete: "Confirm delete this customer?",
  },
  ms: {
    pageTitle: "Rekod Pelanggan",
    formTitle: "Maklumat Pelanggan",
    back: "Kembali ke Dashboard",
    add: "Tambah",
    save: "Simpan",
    update: "Simpan Perubahan",
    cancelEdit: "Batal Edit",
    close: "Tutup",
    search: "Cari nama pelanggan / telefon / syarikat / email",
    all: "Semua",
    normal: "Biasa",
    vip: "VIP",
    debt: "Ada Hutang",
    blocked: "Disekat",
    personal: "Maklumat Peribadi",
    company: "Maklumat Syarikat",
    name: "Nama Pelanggan",
    phone: "Telefon",
    email: "Email",
    companyName: "Nama Syarikat",
    regNo: "SSM / No. Daftar",
    companyPhone: "Telefon Syarikat",
    address: "Alamat",
    status: "Status",
    debtAmount: "Jumlah Hutang",
    paidAmount: "Jumlah Dibayar",
    lastPaymentDate: "Tarikh",
    note: "Catatan",
    edit: "Edit",
    delete: "Padam",
    whatsapp: "WhatsApp",
    invoice: "Invois",
    accounting: "Sistem Akaun",
    products: "Produk",
    invoices: "Invois",
    noCustomers: "Tiada rekod pelanggan",
    priceTitle: "Harga Khas Produk",
    chooseCustomer: "Pilih Pelanggan",
    chooseProduct: "Pilih Produk",
    customPrice: "Harga Khas",
    savePrice: "Simpan Harga Khas",
    productNormalPrice: "Harga Asal",
    currentPrices: "Harga Khas Semasa",
    noPrice: "Belum ada harga khas",
    saved: "Disimpan",
    deleted: "Dipadam",
    theme: "Tema",
    language: "Bahasa",
    related: "Fungsi Berkaitan",
    chooseRelated: "Pilih fungsi",
    goFeature: "Pergi",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
    confirmDelete: "Padam pelanggan ini?",
  },
};

export default function CustomersPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");
  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | CustomerStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceCustomerId, setPriceCustomerId] = useState("");
  const [priceCustomerName, setPriceCustomerName] = useState("");
  const [priceProductId, setPriceProductId] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const [formPriceProductId, setFormPriceProductId] = useState("");
  const [formCustomPrice, setFormCustomPrice] = useState("");

  const [relatedPath, setRelatedPath] = useState("/dashboard/accounting");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company_name: "",
    company_reg_no: "",
    company_phone: "",
    address: "",
    status: "normal" as CustomerStatus,
    debt_amount: "",
    paid_amount: "",
    last_payment_date: today(),
    note: "",
  });

  const t = TXT[lang];
  const theme = THEMES[themeKey];

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);

    const urlLang = q.get("lang") as Lang;
    const savedLang = localStorage.getItem(LANG_KEY) as Lang | null;

    if (urlLang === "zh" || urlLang === "en" || urlLang === "ms") {
      setLang(urlLang);
      localStorage.setItem(LANG_KEY, urlLang);
    } else if (savedLang === "zh" || savedLang === "en" || savedLang === "ms") {
      setLang(savedLang);
    }

    const urlTheme = q.get("theme") as ThemeKey;
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeKey | null;

    if (urlTheme && THEMES[urlTheme]) {
      setThemeKey(urlTheme);
      localStorage.setItem(THEME_KEY, urlTheme);
    } else if (savedTheme && THEMES[savedTheme]) {
      setThemeKey(savedTheme);
    }

    init();
  }, []);

  async function init() {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = localStorage.getItem(TRIAL_KEY);

    if ((mode === "trial" || trialRaw) && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);
        setSession(null);

        const savedCustomers = localStorage.getItem(TRIAL_CUSTOMERS_KEY);
        const savedPrices = localStorage.getItem(TRIAL_CUSTOMER_PRICES_KEY);
        const savedProducts = localStorage.getItem(TRIAL_PRODUCTS_KEY);

        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setCustomerPrices(savedPrices ? JSON.parse(savedPrices) : []);
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);

        return;
      }

      localStorage.removeItem(TRIAL_KEY);
      localStorage.removeItem(TRIAL_CUSTOMERS_KEY);
      localStorage.removeItem(TRIAL_CUSTOMER_PRICES_KEY);
      localStorage.removeItem(TRIAL_PRODUCTS_KEY);
      window.location.href = "/zh";
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/zh";
      return;
    }

    setIsTrial(false);
    setSession(data.session);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("theme")
      .eq("id", data.session.user.id)
      .single();

    if (profileData?.theme && THEMES[profileData.theme as ThemeKey]) {
      setThemeKey(profileData.theme as ThemeKey);
      localStorage.setItem(THEME_KEY, profileData.theme);
    }

    await loadAll(data.session.user.id);
  }

  async function loadAll(userId: string) {
    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: productData } = await supabase
      .from("products")
      .select("id,name,price")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: priceData } = await supabase
      .from("customer_prices")
      .select("*")
      .eq("user_id", userId);

    setCustomers((customerData || []) as Customer[]);
    setProducts((productData || []) as Product[]);
    setCustomerPrices((priceData || []) as CustomerPrice[]);
  }

  function saveTrialCustomers(nextCustomers: Customer[]) {
    setCustomers(nextCustomers);
    localStorage.setItem(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCustomers));
  }

  function saveTrialPrices(nextPrices: CustomerPrice[]) {
    setCustomerPrices(nextPrices);
    localStorage.setItem(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(nextPrices));
  }

  function buildUrl(path: string, extra?: string) {
    const base = isTrial
      ? `${path}?mode=trial&lang=${lang}&theme=${themeKey}`
      : `${path}?lang=${lang}&theme=${themeKey}`;

    return extra ? `${base}&${extra}` : base;
  }

  function go(path: string, extra?: string) {
    window.location.href = buildUrl(path, extra);
  }

  function backToDashboard() {
    go("/dashboard");
  }

  function goRelatedFeature() {
    go(relatedPath);
  }

  function openInvoiceForCustomer(c: Customer) {
    go(
      "/dashboard/invoices",
      `customerId=${encodeURIComponent(c.id)}&customerName=${encodeURIComponent(c.name)}&from=customers`
    );
  }

  function switchLang(next: Lang) {
    setLang(next);
    localStorage.setItem(LANG_KEY, next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    q.set("theme", themeKey);
    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  async function switchTheme(next: ThemeKey) {
    setThemeKey(next);
    localStorage.setItem(THEME_KEY, next);

    const q = new URLSearchParams(window.location.search);
    q.set("theme", next);
    q.set("lang", lang);
    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);

    if (!isTrial && session) {
      await supabase
        .from("profiles")
        .update({ theme: next })
        .eq("id", session.user.id);
    }
  }

  function openNewCustomerForm() {
    resetForm();
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      company_name: "",
      company_reg_no: "",
      company_phone: "",
      address: "",
      status: "normal",
      debt_amount: "",
      paid_amount: "",
      last_payment_date: today(),
      note: "",
    });

    setFormPriceProductId("");
    setFormCustomPrice("");
  }

  function upsertTrialPrice(customerId: string, productId: string, price: number) {
    const exists = customerPrices.find(
      (p) => p.customer_id === customerId && p.product_id === productId
    );

    const next = exists
      ? customerPrices.map((p) =>
          p.customer_id === customerId && p.product_id === productId
            ? { ...p, custom_price: price }
            : p
        )
      : [
          {
            id: crypto.randomUUID(),
            customer_id: customerId,
            product_id: productId,
            custom_price: price,
          },
          ...customerPrices,
        ];

    saveTrialPrices(next);
  }

  async function upsertDbPrice(customerId: string, productId: string, price: number) {
    if (!session) return "No session";

    const { error } = await supabase.from("customer_prices").upsert(
      {
        user_id: session.user.id,
        customer_id: customerId,
        product_id: productId,
        custom_price: price,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,customer_id,product_id",
      }
    );

    return error?.message || "";
  }

  async function saveCustomer() {
    if (!form.name.trim()) return;

    const customerId = editingId || crypto.randomUUID();

    const payload: Customer = {
      id: customerId,
      user_id: session?.user.id || "trial",
      name: form.name.trim(),
      phone: form.phone || null,
      email: form.email || null,
      company_name: form.company_name || null,
      company_reg_no: form.company_reg_no || null,
      company_phone: form.company_phone || null,
      address: form.address || null,
      status: form.status,
      debt_amount: Number(form.debt_amount || 0),
      paid_amount: Number(form.paid_amount || 0),
      last_payment_date: form.last_payment_date || today(),
      note: form.note || null,
    };

    if (isTrial) {
      const next = editingId
        ? customers.map((c) => (c.id === editingId ? payload : c))
        : [payload, ...customers];

      saveTrialCustomers(next);

      if (formPriceProductId && formCustomPrice) {
        upsertTrialPrice(customerId, formPriceProductId, Number(formCustomPrice));
      }

      setMsg(t.saved);
      closeForm();
      return;
    }

    if (!session) return;

    const dbPayload = {
      user_id: session.user.id,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      company_name: payload.company_name,
      company_reg_no: payload.company_reg_no,
      company_phone: payload.company_phone,
      address: payload.address,
      status: payload.status,
      debt_amount: payload.debt_amount,
      paid_amount: payload.paid_amount,
      last_payment_date: payload.last_payment_date,
      note: payload.note,
      updated_at: new Date().toISOString(),
    };

    let savedCustomerId = editingId || "";

    if (editingId) {
      const { error } = await supabase
        .from("customers")
        .update(dbPayload)
        .eq("id", editingId)
        .eq("user_id", session.user.id);

      if (error) {
        setMsg(error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("customers")
        .insert(dbPayload)
        .select("id")
        .single();

      if (error) {
        setMsg(error.message);
        return;
      }

      savedCustomerId = data.id;
    }

    if (formPriceProductId && formCustomPrice) {
      const priceError = await upsertDbPrice(
        savedCustomerId,
        formPriceProductId,
        Number(formCustomPrice)
      );

      if (priceError) {
        setMsg(priceError);
        return;
      }
    }

    setMsg(t.saved);
    closeForm();
    await loadAll(session.user.id);
  }

  function editCustomer(c: Customer) {
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",
      company_name: c.company_name || "",
      company_reg_no: c.company_reg_no || "",
      company_phone: c.company_phone || "",
      address: c.address || "",
      status: (c.status || "normal") as CustomerStatus,
      debt_amount: String(c.debt_amount || 0),
      paid_amount: String(c.paid_amount || 0),
      last_payment_date: c.last_payment_date || today(),
      note: c.note || "",
    });

    setFormPriceProductId("");
    setFormCustomPrice("");
    setShowForm(true);
  }

  async function deleteCustomer(id: string) {
    const yes = window.confirm(t.confirmDelete);
    if (!yes) return;

    if (isTrial) {
      const nextCustomers = customers.filter((c) => c.id !== id);
      const nextPrices = customerPrices.filter((p) => p.customer_id !== id);

      saveTrialCustomers(nextCustomers);
      saveTrialPrices(nextPrices);
      setMsg(t.deleted);
      return;
    }

    if (!session) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.deleted);
    await loadAll(session.user.id);
  }

  function openPriceModal(c: Customer) {
    setPriceCustomerId(c.id);
    setPriceCustomerName(c.name);
    setPriceProductId("");
    setCustomPrice("");
    setShowPriceModal(true);
  }

  function closePriceModal() {
    setShowPriceModal(false);
    setPriceCustomerId("");
    setPriceCustomerName("");
    setPriceProductId("");
    setCustomPrice("");
  }

  async function saveCustomerPrice() {
    if (!priceCustomerId || !priceProductId || !customPrice) return;

    if (isTrial) {
      upsertTrialPrice(priceCustomerId, priceProductId, Number(customPrice));
      setMsg(t.saved);
      setPriceProductId("");
      setCustomPrice("");
      return;
    }

    const priceError = await upsertDbPrice(priceCustomerId, priceProductId, Number(customPrice));

    if (priceError) {
      setMsg(priceError);
      return;
    }

    setMsg(t.saved);
    setPriceProductId("");
    setCustomPrice("");

    if (session) await loadAll(session.user.id);
  }

  function openCustomerWhatsApp(phone: string | null) {
    if (!phone) return;

    const clean = phone.replace(/\D/g, "");
    const malaysiaPhone = clean.startsWith("60")
      ? clean
      : clean.startsWith("0")
        ? `6${clean}`
        : `60${clean}`;

    window.location.href = `https://wa.me/${malaysiaPhone}`;
  }

  const filteredCustomers = useMemo(() => {
    const s = search.toLowerCase().trim();

    return customers.filter((c) => {
      const matchSearch =
        !s ||
        c.name?.toLowerCase().includes(s) ||
        c.phone?.toLowerCase().includes(s) ||
        c.company_name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s);

      const matchStatus = filterStatus === "all" || c.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [customers, search, filterStatus]);

  const selectedProduct = products.find((p) => p.id === priceProductId);
  const formSelectedProduct = products.find((p) => p.id === formPriceProductId);
  const targetPrices = customerPrices.filter((p) => p.customer_id === priceCustomerId);

  return (
    <main style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}>
      <section style={topBarStyle}>
        <button
          onClick={backToDashboard}
          style={{
            ...backBtnStyle,
            color: theme.accent,
            borderColor: theme.border,
          }}
        >
          ← {t.back}
        </button>

        <div style={topRightStyle}>
          <select
            value={themeKey}
            onChange={(e) => switchTheme(e.target.value as ThemeKey)}
            style={{
              ...selectSmallStyle,
              borderColor: theme.border,
              color: theme.accent,
            }}
          >
            <option value="deepTeal">深青色</option>
            <option value="pink">可爱粉色</option>
            <option value="blackGold">黑金商务</option>
            <option value="lightRed">可爱浅红</option>
            <option value="nature">风景自然系</option>
            <option value="sky">天空蓝</option>
          </select>

          <div style={langRowStyle}>
            <button onClick={() => switchLang("zh")} style={langBtn(lang === "zh", theme)}>中</button>
            <button onClick={() => switchLang("en")} style={langBtn(lang === "en", theme)}>EN</button>
            <button onClick={() => switchLang("ms")} style={langBtn(lang === "ms", theme)}>BM</button>
          </div>
        </div>
      </section>

      {isTrial ? <div style={trialMsgStyle}>{t.trialMode}</div> : null}
      {msg ? <div style={msgStyle}>{msg}</div> : null}

      <section
        style={{
          ...cardStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
        }}
      >
        <div style={recordHeaderStyle}>
          <h1 style={titleStyle}>{t.pageTitle}</h1>

          <button
            onClick={openNewCustomerForm}
            style={{
              ...plusBtnStyle,
              background: theme.accent,
            }}
          >
            ＋
          </button>
        </div>

        <input
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            borderColor: theme.border,
          }}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | CustomerStatus)}
          style={{
            ...inputStyle,
            borderColor: theme.border,
            marginTop: 12,
          }}
        >
          <option value="all">{t.all}</option>
          <option value="normal">{t.normal}</option>
          <option value="vip">{t.vip}</option>
          <option value="debt">{t.debt}</option>
          <option value="blocked">{t.blocked}</option>
        </select>

        <div style={customerListStyle}>
          {filteredCustomers.length === 0 ? (
            <p style={{ color: theme.subText }}>{t.noCustomers}</p>
          ) : (
            filteredCustomers.map((c) => {
              const debtLeft = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);
              const prices = customerPrices.filter((p) => p.customer_id === c.id);

              return (
                <div
                  key={c.id}
                  style={{
                    ...customerCardStyle,
                    borderColor: theme.border,
                    background: theme.card,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={customerNameStyle}>
                      {c.name}{" "}
                      <span
                        style={{
                          ...badgeStyle,
                          background: theme.softBg,
                          color: theme.accent,
                        }}
                      >
                        {statusText(c.status || "normal", t)}
                      </span>
                    </h3>

                    <p style={{ ...mutedStyle, color: theme.subText }}>
                      {t.phone}: {c.phone || "-"} | {t.email}: {c.email || "-"}
                    </p>

                    <p style={{ ...mutedStyle, color: theme.subText }}>
                      {t.companyName}: {c.company_name || "-"}
                    </p>

                    <p style={{ ...mutedStyle, color: theme.subText }}>
                      {t.debtAmount}: RM {Number(c.debt_amount || 0).toFixed(2)} |{" "}
                      {t.paidAmount}: RM {Number(c.paid_amount || 0).toFixed(2)} |{" "}
                      Balance: RM {debtLeft.toFixed(2)}
                    </p>

                    <p style={{ ...mutedStyle, color: theme.subText }}>
                      {t.lastPaymentDate}: {c.last_payment_date || "-"}
                    </p>

                    {prices.length > 0 ? (
                      <p style={{ ...mutedStyle, color: theme.subText }}>
                        {t.currentPrices}:{" "}
                        {prices
                          .map((cp) => {
                            const product = products.find((p) => p.id === cp.product_id);
                            return `${product?.name || "Product"} RM ${Number(cp.custom_price).toFixed(2)}`;
                          })
                          .join(" / ")}
                      </p>
                    ) : null}
                  </div>

                  <div style={actionRowStyle}>
                    <button onClick={() => openInvoiceForCustomer(c)} style={invoiceBtnStyle}>
                      {t.invoice}
                    </button>

                    <button
                      onClick={() => openPriceModal(c)}
                      style={{
                        ...priceBtnStyle,
                        borderColor: theme.border,
                        color: theme.accent,
                      }}
                    >
                      {t.priceTitle}
                    </button>

                    <button
                      onClick={() => openCustomerWhatsApp(c.phone)}
                      disabled={!c.phone}
                      aria-label={t.whatsapp}
                      title={t.whatsapp}
                      style={{
                        ...whatsappIconBtnStyle,
                        opacity: c.phone ? 1 : 0.45,
                      }}
                    >
                      💬
                    </button>

                    <button
                      onClick={() => editCustomer(c)}
                      style={{
                        ...editBtnStyle,
                        background: theme.accent,
                      }}
                    >
                      {t.edit}
                    </button>

                    <button onClick={() => deleteCustomer(c.id)} style={deleteBtnStyle}>
                      {t.delete}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section
        style={{
          ...cardStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
        }}
      >
        <h2 style={sectionTitleStyle}>{t.related}</h2>

        <div style={relatedMenuRowStyle}>
          <select
            value={relatedPath}
            onChange={(e) => setRelatedPath(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: theme.border,
            }}
          >
            <option value="/dashboard/accounting">{t.accounting}</option>
            <option value="/dashboard/products">{t.products}</option>
            <option value="/dashboard/invoices">{t.invoices}</option>
          </select>

          <button
            onClick={goRelatedFeature}
            style={{
              ...primaryBtnStyle,
              background: theme.accent,
              marginTop: 0,
            }}
          >
            {t.goFeature}
          </button>
        </div>
      </section>

      {showForm ? (
        <div style={overlayStyle}>
          <section
            style={{
              ...modalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{t.formTitle}</h2>

              <button onClick={closeForm} style={closeBtnStyle}>
                X
              </button>
            </div>

            <h3>{t.personal}</h3>
            <div style={responsiveGridStyle}>
              <input placeholder={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
              <input placeholder={t.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
              <input placeholder={t.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
            </div>

            <h3>{t.company}</h3>
            <div style={responsiveGridStyle}>
              <input placeholder={t.companyName} value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
              <input placeholder={t.regNo} value={form.company_reg_no} onChange={(e) => setForm({ ...form, company_reg_no: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
              <input placeholder={t.companyPhone} value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
              <input placeholder={t.address} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
            </div>

            <h3>{t.status}</h3>
            <div style={responsiveGridStyle}>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })} style={{ ...inputStyle, borderColor: theme.border }}>
                <option value="normal">{t.normal}</option>
                <option value="vip">{t.vip}</option>
                <option value="debt">{t.debt}</option>
                <option value="blocked">{t.blocked}</option>
              </select>

              <input placeholder={t.debtAmount} value={form.debt_amount} onChange={(e) => setForm({ ...form, debt_amount: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
              <input placeholder={t.paidAmount} value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />

              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: theme.subText }}>{t.lastPaymentDate}</label>
                <input
                  type="date"
                  value={form.last_payment_date}
                  onChange={(e) => setForm({ ...form, last_payment_date: e.target.value })}
                  style={{
                    ...dateInputStyle,
                    borderColor: theme.border,
                  }}
                />
              </div>

              <input placeholder={t.note} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={{ ...inputStyle, borderColor: theme.border }} />
            </div>

            <h3>{t.priceTitle}</h3>
            <div style={responsiveGridStyle}>
              <select
                value={formPriceProductId}
                onChange={(e) => setFormPriceProductId(e.target.value)}
                style={{ ...inputStyle, borderColor: theme.border }}
              >
                <option value="">{t.chooseProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - RM {Number(p.price || 0).toFixed(2)}
                  </option>
                ))}
              </select>

              <input
                placeholder={t.customPrice}
                value={formCustomPrice}
                onChange={(e) => setFormCustomPrice(e.target.value)}
                style={{ ...inputStyle, borderColor: theme.border }}
              />
            </div>

            {formSelectedProduct ? (
              <p style={{ ...mutedStyle, color: theme.subText }}>
                {t.productNormalPrice}: RM {Number(formSelectedProduct.price || 0).toFixed(2)}
              </p>
            ) : null}

            <button
              onClick={saveCustomer}
              style={{
                ...primaryBtnStyle,
                background: theme.accent,
              }}
            >
              {editingId ? t.update : t.save}
            </button>

            {editingId ? (
              <button
                onClick={resetForm}
                style={{
                  ...secondaryBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                }}
              >
                {t.cancelEdit}
              </button>
            ) : null}
          </section>
        </div>
      ) : null}

      {showPriceModal ? (
        <div style={overlayStyle}>
          <section
            style={{
              ...modalStyle,
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow,
              color: theme.text,
            }}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={modalTitleStyle}>{t.priceTitle}</h2>
                <p style={{ ...mutedStyle, color: theme.subText, margin: "6px 0 0" }}>
                  {t.chooseCustomer}: {priceCustomerName || "-"}
                </p>
              </div>

              <button onClick={closePriceModal} style={closeBtnStyle}>
                X
              </button>
            </div>

            <div style={responsiveGridStyle}>
              <select
                value={priceProductId}
                onChange={(e) => setPriceProductId(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: theme.border,
                }}
              >
                <option value="">{t.chooseProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - RM {Number(p.price || 0).toFixed(2)}
                  </option>
                ))}
              </select>

              <input
                placeholder={t.customPrice}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: theme.border,
                }}
              />
            </div>

            {selectedProduct ? (
              <p style={{ ...mutedStyle, color: theme.subText }}>
                {t.productNormalPrice}: RM {Number(selectedProduct.price || 0).toFixed(2)}
              </p>
            ) : null}

            <button
              onClick={saveCustomerPrice}
              style={{
                ...primaryBtnStyle,
                background: theme.accent,
              }}
            >
              {t.savePrice}
            </button>

            <div style={{ marginTop: 16 }}>
              <h3>{t.currentPrices}</h3>

              {targetPrices.length === 0 ? (
                <p style={{ color: theme.subText }}>{t.noPrice}</p>
              ) : (
                targetPrices.map((cp) => {
                  const product = products.find((p) => p.id === cp.product_id);

                  return (
                    <div
                      key={cp.id}
                      style={{
                        ...priceItemStyle,
                        borderColor: theme.border,
                        background: theme.softBg,
                      }}
                    >
                      <strong>{product?.name || "Product"}</strong>
                      <span>RM {Number(cp.custom_price || 0).toFixed(2)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function statusText(status: CustomerStatus, t: any) {
  if (status === "vip") return t.vip;
  if (status === "debt") return t.debt;
  if (status === "blocked") return t.blocked;
  return t.normal;
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "clamp(10px, 2vw, 24px)",
  fontFamily: "sans-serif",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 18,
  flexWrap: "wrap",
};

const topRightStyle: CSSProperties = {
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 12,
  padding: "clamp(8px, 1.6vw, 12px) clamp(10px, 2vw, 16px)",
  fontSize: "clamp(13px, 2.2vw, 16px)",
  fontWeight: 900,
  cursor: "pointer",
  maxWidth: "100%",
  whiteSpace: "normal",
  lineHeight: 1.25,
};

const selectSmallStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 999,
  padding: "8px 10px",
  fontWeight: 900,
  outline: "none",
  maxWidth: "100%",
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const langBtn = (active: boolean, theme: (typeof THEMES)[ThemeKey]): CSSProperties => ({
  padding: "8px 11px",
  borderRadius: 999,
  border: `2px solid ${theme.border}`,
  background: active ? theme.accent : "#fff",
  color: active ? "#fff" : theme.accent,
  fontWeight: 900,
  cursor: "pointer",
});

const cardStyle: CSSProperties = {
  border: "2px solid",
  borderRadius: 22,
  padding: "clamp(14px, 2vw, 22px)",
  marginBottom: 18,
};

const recordHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(24px, 4vw, 34px)",
  lineHeight: 1.15,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  fontSize: "clamp(20px, 3vw, 26px)",
};

const plusBtnStyle: CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: "999px",
  color: "#fff",
  border: "none",
  fontSize: 28,
  fontWeight: 900,
  lineHeight: 1,
  cursor: "pointer",
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 12,
  border: "1px solid",
  fontSize: "clamp(14px, 2vw, 16px)",
  outline: "none",
};

const responsiveGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const relatedMenuRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
};

const customerListStyle: CSSProperties = {
  marginTop: 18,
};

const customerCardStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: 18,
  padding: "clamp(14px, 2vw, 18px)",
  marginBottom: 14,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 14,
};

const customerNameStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(18px, 3vw, 22px)",
  overflowWrap: "anywhere",
};

const mutedStyle: CSSProperties = {
  fontSize: "clamp(13px, 2vw, 14px)",
  overflowWrap: "anywhere",
};

const badgeStyle: CSSProperties = {
  padding: "3px 9px",
  borderRadius: 999,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
};

const invoiceBtnStyle: CSSProperties = {
  background: "#0ea5e9",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const priceBtnStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 10,
  padding: "8px 12px",
  fontWeight: 900,
  cursor: "pointer",
};

const whatsappIconBtnStyle: CSSProperties = {
  width: 38,
  height: 38,
  background: "#25D366",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  fontSize: 20,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const editBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const deleteBtnStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const primaryBtnStyle: CSSProperties = {
  marginTop: 16,
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "13px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryBtnStyle: CSSProperties = {
  marginTop: 16,
  marginLeft: 10,
  background: "#fff",
  border: "2px solid",
  borderRadius: 12,
  padding: "11px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const msgStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
  fontWeight: 800,
};

const trialMsgStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
  fontWeight: 800,
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.52)",
  padding: "clamp(12px, 3vw, 24px)",
  zIndex: 999,
  overflowY: "auto",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 900,
  margin: "0 auto",
  border: "2px solid",
  borderRadius: 24,
  padding: "clamp(16px, 3vw, 24px)",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 12,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(22px, 4vw, 30px)",
};

const closeBtnStyle: CSSProperties = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  width: 42,
  height: 42,
  borderRadius: 999,
  fontWeight: 900,
  cursor: "pointer",
};

const dateWrapStyle: CSSProperties = {
  width: "100%",
};

const dateLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 5,
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  height: 48,
  minHeight: 48,
  appearance: "none",
  WebkitAppearance: "none",
};

const priceItemStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: 14,
  padding: "12px 14px",
  marginBottom: 10,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};
