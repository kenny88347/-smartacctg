"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Lang = "zh" | "en" | "ms";
type CustomerStatus = "normal" | "vip" | "debt" | "blocked";

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
  customer_id: string;
  product_id: string;
  custom_price: number;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_CUSTOMER_PRICES_KEY = "smartacctg_trial_customer_prices";

const today = () => new Date().toISOString().slice(0, 10);

const TXT = {
  zh: {
    title: "客户管理",
    back: "返回控制台",
    addCustomer: "新增客户",
    updateCustomer: "保存修改",
    cancelEdit: "取消编辑",
    search: "搜索客户名称 / 电话 / 公司",
    all: "全部",
    normal: "正常客户",
    vip: "VIP 客户",
    debt: "有欠款",
    blocked: "停止合作",
    personal: "个人资料",
    company: "公司资料",
    name: "客户名称",
    phone: "电话号码",
    email: "Email",
    companyName: "公司名称",
    regNo: "SSM / 注册号",
    companyPhone: "公司电话",
    address: "地址",
    status: "客户状态",
    debtAmount: "欠款金额",
    paidAmount: "已付款金额",
    lastPaymentDate: "最后付款日期",
    note: "备注",
    edit: "编辑",
    delete: "删除",
    whatsapp: "WhatsApp",
    noCustomers: "还没有客户资料",
    priceTitle: "客户专属价格",
    chooseCustomer: "选择客户",
    chooseProduct: "选择产品",
    customPrice: "这个客户的专属价格",
    savePrice: "保存专属价格",
    productNormalPrice: "产品原价",
    saved: "保存成功",
    deleted: "删除成功",
    trialMode: "免费试用模式：资料只会暂存在本机",
  },
  en: {
    title: "Customer Management",
    back: "Back to Dashboard",
    addCustomer: "Add Customer",
    updateCustomer: "Save Changes",
    cancelEdit: "Cancel Edit",
    search: "Search name / phone / company",
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
    lastPaymentDate: "Last Payment Date",
    note: "Note",
    edit: "Edit",
    delete: "Delete",
    whatsapp: "WhatsApp",
    noCustomers: "No customers yet",
    priceTitle: "Customer Special Price",
    chooseCustomer: "Choose Customer",
    chooseProduct: "Choose Product",
    customPrice: "Special Price",
    savePrice: "Save Special Price",
    productNormalPrice: "Normal Price",
    saved: "Saved",
    deleted: "Deleted",
    trialMode: "Free trial mode: data is stored locally only",
  },
  ms: {
    title: "Pengurusan Pelanggan",
    back: "Kembali ke Dashboard",
    addCustomer: "Tambah Pelanggan",
    updateCustomer: "Simpan Perubahan",
    cancelEdit: "Batal Edit",
    search: "Cari nama / telefon / syarikat",
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
    lastPaymentDate: "Tarikh Bayaran Akhir",
    note: "Catatan",
    edit: "Edit",
    delete: "Padam",
    whatsapp: "WhatsApp",
    noCustomers: "Tiada pelanggan lagi",
    priceTitle: "Harga Khas Pelanggan",
    chooseCustomer: "Pilih Pelanggan",
    chooseProduct: "Pilih Produk",
    customPrice: "Harga Khas",
    savePrice: "Simpan Harga Khas",
    productNormalPrice: "Harga Asal",
    saved: "Disimpan",
    deleted: "Dipadam",
    trialMode: "Mod percubaan: data hanya disimpan dalam telefon ini",
  },
};

export default function CustomersPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | CustomerStatus>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

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

  const [priceCustomerId, setPriceCustomerId] = useState("");
  const [priceProductId, setPriceProductId] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const t = TXT[lang];

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const l = q.get("lang") as Lang;

    if (l === "zh" || l === "en" || l === "ms") setLang(l);

    init();
  }, []);

  async function init() {
    const q = new URLSearchParams(window.location.search);
    const mode = q.get("mode");
    const trialRaw = localStorage.getItem(TRIAL_KEY);

    if (mode === "trial" && trialRaw) {
      const trial = JSON.parse(trialRaw);

      if (Date.now() < Number(trial.expiresAt)) {
        setIsTrial(true);
        setSession(null);

        const savedCustomers = localStorage.getItem(TRIAL_CUSTOMERS_KEY);
        const savedPrices = localStorage.getItem(TRIAL_CUSTOMER_PRICES_KEY);

        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setCustomerPrices(savedPrices ? JSON.parse(savedPrices) : []);
        setProducts([]);

        return;
      }

      localStorage.removeItem(TRIAL_KEY);
      localStorage.removeItem(TRIAL_CUSTOMERS_KEY);
      localStorage.removeItem(TRIAL_CUSTOMER_PRICES_KEY);
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

  function switchLang(next: Lang) {
    setLang(next);

    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
  }

  function backToDashboard() {
    window.location.href = isTrial
      ? `/dashboard?mode=trial&lang=${lang}`
      : `/dashboard?lang=${lang}`;
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
  }

  async function saveCustomer() {
    if (!form.name.trim()) return;

    const payload: Customer = {
      id: editingId || crypto.randomUUID(),
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
      setMsg(t.saved);
      resetForm();
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
      const { error } = await supabase.from("customers").insert(dbPayload);

      if (error) {
        setMsg(error.message);
        return;
      }
    }

    setMsg(t.saved);
    resetForm();
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

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteCustomer(id: string) {
    const yes = window.confirm("Confirm delete?");
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

  async function saveCustomerPrice() {
    if (!priceCustomerId || !priceProductId || !customPrice) return;

    if (isTrial) {
      const exists = customerPrices.find(
        (p) => p.customer_id === priceCustomerId && p.product_id === priceProductId
      );

      const next = exists
        ? customerPrices.map((p) =>
            p.customer_id === priceCustomerId && p.product_id === priceProductId
              ? { ...p, custom_price: Number(customPrice) }
              : p
          )
        : [
            {
              id: crypto.randomUUID(),
              customer_id: priceCustomerId,
              product_id: priceProductId,
              custom_price: Number(customPrice),
            },
            ...customerPrices,
          ];

      saveTrialPrices(next);
      setMsg(t.saved);
      setCustomPrice("");
      return;
    }

    if (!session) return;

    const { error } = await supabase.from("customer_prices").upsert(
      {
        user_id: session.user.id,
        customer_id: priceCustomerId,
        product_id: priceProductId,
        custom_price: Number(customPrice),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,customer_id,product_id",
      }
    );

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(t.saved);
    setCustomPrice("");
    await loadAll(session.user.id);
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
    const s = search.toLowerCase();

    return customers.filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(s) ||
        c.phone?.toLowerCase().includes(s) ||
        c.company_name?.toLowerCase().includes(s);

      const matchStatus = filterStatus === "all" || c.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [customers, search, filterStatus]);

  const selectedProduct = products.find((p) => p.id === priceProductId);

  return (
    <main style={pageStyle}>
      <section style={topBarStyle}>
        <button onClick={backToDashboard} style={backBtnStyle}>
          ← {t.back}
        </button>

        <div style={langRowStyle}>
          <button onClick={() => switchLang("zh")} style={langBtn(lang === "zh")}>中文</button>
          <button onClick={() => switchLang("en")} style={langBtn(lang === "en")}>EN</button>
          <button onClick={() => switchLang("ms")} style={langBtn(lang === "ms")}>BM</button>
        </div>
      </section>

      <h1 style={titleStyle}>{t.title}</h1>

      {isTrial ? <div style={trialMsgStyle}>{t.trialMode}</div> : null}
      {msg ? <div style={msgStyle}>{msg}</div> : null}

      <section style={cardStyle}>
        <h2>{editingId ? t.updateCustomer : t.addCustomer}</h2>

        <h3>{t.personal}</h3>
        <div style={gridStyle}>
          <input placeholder={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          <input placeholder={t.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
          <input placeholder={t.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        </div>

        <h3>{t.company}</h3>
        <div style={gridStyle}>
          <input placeholder={t.companyName} value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} style={inputStyle} />
          <input placeholder={t.regNo} value={form.company_reg_no} onChange={(e) => setForm({ ...form, company_reg_no: e.target.value })} style={inputStyle} />
          <input placeholder={t.companyPhone} value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} style={inputStyle} />
          <input placeholder={t.address} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} />
        </div>

        <h3>{t.status}</h3>
        <div style={gridStyle}>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })} style={inputStyle}>
            <option value="normal">{t.normal}</option>
            <option value="vip">{t.vip}</option>
            <option value="debt">{t.debt}</option>
            <option value="blocked">{t.blocked}</option>
          </select>

          <input placeholder={t.debtAmount} value={form.debt_amount} onChange={(e) => setForm({ ...form, debt_amount: e.target.value })} style={inputStyle} />
          <input placeholder={t.paidAmount} value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} style={inputStyle} />

          <input
            type="date"
            value={form.last_payment_date}
            onChange={(e) => setForm({ ...form, last_payment_date: e.target.value })}
            style={dateInputStyle}
          />

          <input placeholder={t.note} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={inputStyle} />
        </div>

        <button onClick={saveCustomer} style={primaryBtnStyle}>
          {editingId ? t.updateCustomer : t.addCustomer}
        </button>

        {editingId ? (
          <button onClick={resetForm} style={secondaryBtnStyle}>
            {t.cancelEdit}
          </button>
        ) : null}
      </section>

      <section style={cardStyle}>
        <h2>{t.priceTitle}</h2>

        <div style={gridStyle}>
          <select value={priceCustomerId} onChange={(e) => setPriceCustomerId(e.target.value)} style={inputStyle}>
            <option value="">{t.chooseCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select value={priceProductId} onChange={(e) => setPriceProductId(e.target.value)} style={inputStyle}>
            <option value="">{t.chooseProduct}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - RM {Number(p.price || 0).toFixed(2)}
              </option>
            ))}
          </select>

          <input placeholder={t.customPrice} value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} style={inputStyle} />
        </div>

        {selectedProduct ? (
          <p style={mutedStyle}>
            {t.productNormalPrice}: RM {Number(selectedProduct.price || 0).toFixed(2)}
          </p>
        ) : null}

        <button onClick={saveCustomerPrice} style={primaryBtnStyle}>
          {t.savePrice}
        </button>
      </section>

      <section style={cardStyle}>
        <div style={filterGridStyle}>
          <input placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle} />

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | CustomerStatus)} style={inputStyle}>
            <option value="all">{t.all}</option>
            <option value="normal">{t.normal}</option>
            <option value="vip">{t.vip}</option>
            <option value="debt">{t.debt}</option>
            <option value="blocked">{t.blocked}</option>
          </select>
        </div>

        {filteredCustomers.length === 0 ? (
          <p>{t.noCustomers}</p>
        ) : (
          filteredCustomers.map((c) => {
            const debtLeft = Number(c.debt_amount || 0) - Number(c.paid_amount || 0);
            const prices = customerPrices.filter((p) => p.customer_id === c.id);

            return (
              <div key={c.id} style={customerCardStyle}>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {c.name} <span style={badgeStyle}>{statusText(c.status || "normal", t)}</span>
                  </h3>

                  <p style={mutedStyle}>
                    {t.phone}: {c.phone || "-"} | {t.companyName}: {c.company_name || "-"}
                  </p>

                  <p style={mutedStyle}>
                    {t.debtAmount}: RM {Number(c.debt_amount || 0).toFixed(2)} |{" "}
                    {t.paidAmount}: RM {Number(c.paid_amount || 0).toFixed(2)} |{" "}
                    Balance: RM {debtLeft.toFixed(2)}
                  </p>

                  <p style={mutedStyle}>
                    {t.lastPaymentDate}: {c.last_payment_date || "-"}
                  </p>

                  {prices.length > 0 ? (
                    <p style={mutedStyle}>
                      {t.priceTitle}:{" "}
                      {prices.map((cp) => {
                        const product = products.find((p) => p.id === cp.product_id);
                        return `${product?.name || "Product"} RM ${Number(cp.custom_price).toFixed(2)}`;
                      }).join(" / ")}
                    </p>
                  ) : null}
                </div>

                <div style={actionRowStyle}>
                  <button onClick={() => editCustomer(c)} style={editBtnStyle}>{t.edit}</button>

                  <button
                    onClick={() => openCustomerWhatsApp(c.phone)}
                    disabled={!c.phone}
                    style={{
                      ...whatsappBtnStyle,
                      opacity: c.phone ? 1 : 0.45,
                    }}
                  >
                    {t.whatsapp}
                  </button>

                  <button onClick={() => deleteCustomer(c.id)} style={deleteBtnStyle}>{t.delete}</button>
                </div>
              </div>
            );
          })
        )}
      </section>
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
  padding: 16,
  background: "#ecfdf5",
  color: "#064e3b",
  fontFamily: "sans-serif",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 18,
};

const titleStyle: CSSProperties = {
  margin: "0 0 18px",
  fontSize: 32,
};

const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "2px solid #14b8a6",
  borderRadius: 22,
  padding: 18,
  marginBottom: 18,
  boxShadow: "0 12px 30px rgba(20,184,166,0.18)",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const filterGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginBottom: 18,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 12,
  border: "1px solid #99f6e4",
  fontSize: 16,
  outline: "none",
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  height: 48,
  minHeight: 48,
  appearance: "none",
  WebkitAppearance: "none",
};

const primaryBtnStyle: CSSProperties = {
  marginTop: 14,
  background: "#0f766e",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "13px 18px",
  fontWeight: 900,
};

const secondaryBtnStyle: CSSProperties = {
  marginTop: 14,
  marginLeft: 10,
  background: "#fff",
  color: "#0f766e",
  border: "2px solid #0f766e",
  borderRadius: 12,
  padding: "11px 18px",
  fontWeight: 900,
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  color: "#0f766e",
  border: "2px solid #0f766e",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 900,
};

const langRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
};

const langBtn = (active: boolean): CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: "2px solid #0f766e",
  background: active ? "#0f766e" : "#fff",
  color: active ? "#fff" : "#0f766e",
  fontWeight: 900,
});

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

const mutedStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
};

const customerCardStyle: CSSProperties = {
  borderBottom: "1px solid #ccfbf1",
  padding: "16px 0",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const badgeStyle: CSSProperties = {
  background: "#ccfbf1",
  color: "#0f766e",
  padding: "3px 9px",
  borderRadius: 999,
  fontSize: 12,
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const editBtnStyle: CSSProperties = {
  background: "#0f766e",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 800,
};

const whatsappBtnStyle: CSSProperties = {
  background: "#25D366",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 800,
};

const deleteBtnStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 800,
};
