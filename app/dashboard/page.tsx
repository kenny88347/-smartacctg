"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type TabKey = "overview" | "daily" | "customers" | "products" | "invoices" | "settings" | "themes";

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
  email?: string | null;
  address: string | null;
  tags?: string[] | null;
  debt_amount?: number | null;
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
  image_url?: string | null;
  note: string | null;
};

type CustomerPrice = {
  id: string;
  user_id?: string;
  customer_id: string;
  product_id: string;
  custom_price: number;
};

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  theme: string | null;
  company_name: string | null;
  company_reg_no: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_address: string | null;
  company_logo_url: string | null;
  plan_type: string | null;
  plan_expiry: string | null;
};

type ThemePackKey = "cutePink" | "blackGold" | "pandaChina" | "nature";

type TrialInfo = {
  startedAt: number;
  expiresAt: number;
};

const TRIAL_KEY = "smartacctg_trial";
const TRIAL_TX_KEY = "smartacctg_trial_transactions";
const TRIAL_CUSTOMERS_KEY = "smartacctg_trial_customers";
const TRIAL_PRODUCTS_KEY = "smartacctg_trial_products";
const TRIAL_CUSTOMER_PRICES_KEY = "smartacctg_trial_customer_prices";

const THEME_PACKS: Record<
  ThemePackKey,
  {
    name: string;
    pageBg: string;
    heroBg: string;
    cardBg: string;
    cardBorder: string;
    accent: string;
    text: string;
    subText: string;
    bannerText: string;
    preview: string;
  }
> = {
  cutePink: {
    name: "可爱粉色",
    pageBg: "#fff7fb",
    heroBg: "linear-gradient(135deg, #ffd6e7 0%, #ffeaf3 100%)",
    cardBg: "#ffffff",
    cardBorder: "#f9a8d4",
    accent: "#db2777",
    text: "#4a044e",
    subText: "#831843",
    bannerText: "#831843",
    preview: "粉嫩、柔和、可爱",
  },
  blackGold: {
    name: "黑金商务",
    pageBg: "#0f0f10",
    heroBg: "linear-gradient(135deg, #1c1c1f 0%, #2a2112 100%)",
    cardBg: "#17171a",
    cardBorder: "#d4af37",
    accent: "#d4af37",
    text: "#f8f5ee",
    subText: "#d6c8a4",
    bannerText: "#f8f5ee",
    preview: "高端、稳重、商务",
  },
  pandaChina: {
    name: "熊猫中国风",
    pageBg: "#f6f4ef",
    heroBg: "linear-gradient(135deg, #ffffff 0%, #ece7dc 100%)",
    cardBg: "#ffffff",
    cardBorder: "#111827",
    accent: "#b91c1c",
    text: "#111827",
    subText: "#57534e",
    bannerText: "#111827",
    preview: "东方、干净、书卷感",
  },
  nature: {
    name: "风景自然系",
    pageBg: "#f0fdf4",
    heroBg: "linear-gradient(135deg, #d9f99d 0%, #bae6fd 100%)",
    cardBg: "#ffffff",
    cardBorder: "#16a34a",
    accent: "#0f766e",
    text: "#14532d",
    subText: "#166534",
    bannerText: "#14532d",
    preview: "清新、自然、舒服",
  },
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [isTrial, setIsTrial] = useState(false);
  const [trialLeft, setTrialLeft] = useState("");
  const [trialPercent, setTrialPercent] = useState(100);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [themePack, setThemePack] = useState<ThemePackKey>("nature");

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
  const [invoicePrice, setInvoicePrice] = useState(0);
  const [invoiceMsg, setInvoiceMsg] = useState("");

  const [newInvoiceCustomerName, setNewInvoiceCustomerName] = useState("");
  const [newInvoiceCustomerPhone, setNewInvoiceCustomerPhone] = useState("");
  const [newInvoiceCustomerCompany, setNewInvoiceCustomerCompany] = useState("");
  const [newInvoiceCustomerAddress, setNewInvoiceCustomerAddress] = useState("");

  const [newInvoiceProductName, setNewInvoiceProductName] = useState("");
  const [newInvoiceProductPrice, setNewInvoiceProductPrice] = useState("");
  const [newInvoiceProductCost, setNewInvoiceProductCost] = useState("");
  const [newInvoiceProductStockQty, setNewInvoiceProductStockQty] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "">("");

  const theme = THEME_PACKS[themePack];

  useEffect(() => {
    let interval: number | undefined;

    const init = async () => {
      const trialRaw = localStorage.getItem(TRIAL_KEY);
      const trial = trialRaw ? (JSON.parse(trialRaw) as TrialInfo) : null;

      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      if (currentSession) {
        setSession(currentSession);
        const userId = currentSession.user.id;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || "");
          setCompanyName(profileData.company_name || "");
          setCompanyRegNo(profileData.company_reg_no || "");
          setCompanyPhone(profileData.company_phone || "");
          setCompanyEmail(profileData.company_email || "");
          setCompanyAddress(profileData.company_address || "");

          if (profileData.theme && THEME_PACKS[profileData.theme as ThemePackKey]) {
            setThemePack(profileData.theme as ThemePackKey);
          }
        }

        await loadTransactions(userId);
        await loadCustomers(userId);
        await loadProducts(userId);
        await loadCustomerPrices(userId);
        return;
      }

      if (trial) {
        if (Date.now() >= trial.expiresAt) {
          clearTrialData();
          window.location.href = "/zh";
          return;
        }

        setIsTrial(true);
        loadTrialData();
        updateTrialBar(trial);

        interval = window.setInterval(() => {
          const raw = localStorage.getItem(TRIAL_KEY);
          const latest = raw ? (JSON.parse(raw) as TrialInfo) : null;

          if (!latest || Date.now() >= latest.expiresAt) {
            clearTrialData();
            window.location.href = "/zh";
            return;
          }

          updateTrialBar(latest);
        }, 1000);

        return;
      }

      window.location.href = "/zh";
    };

    init();

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const product = products.find((p) => p.id === invoiceProductId);
    if (!product || !invoiceCustomerId) {
      setInvoicePrice(0);
      return;
    }

    const special = customerPrices.find(
      (x) => x.customer_id === invoiceCustomerId && x.product_id === invoiceProductId
    );

    setInvoicePrice(Number(special?.custom_price || product.price || 0));
  }, [invoiceCustomerId, invoiceProductId, products, customerPrices]);

  function clearTrialData() {
    localStorage.removeItem(TRIAL_KEY);
    localStorage.removeItem(TRIAL_TX_KEY);
    localStorage.removeItem(TRIAL_CUSTOMERS_KEY);
    localStorage.removeItem(TRIAL_PRODUCTS_KEY);
    localStorage.removeItem(TRIAL_CUSTOMER_PRICES_KEY);
  }

  function loadTrialData() {
    const tx = localStorage.getItem(TRIAL_TX_KEY);
    const cs = localStorage.getItem(TRIAL_CUSTOMERS_KEY);
    const ps = localStorage.getItem(TRIAL_PRODUCTS_KEY);
    const cps = localStorage.getItem(TRIAL_CUSTOMER_PRICES_KEY);

    if (tx) setTransactions(JSON.parse(tx));
    if (cs) setCustomers(JSON.parse(cs));
    if (ps) setProducts(JSON.parse(ps));
    if (cps) setCustomerPrices(JSON.parse(cps));
  }

  function saveTrialData(
    nextTx = transactions,
    nextCs = customers,
    nextPs = products,
    nextCp = customerPrices
  ) {
    localStorage.setItem(TRIAL_TX_KEY, JSON.stringify(nextTx));
    localStorage.setItem(TRIAL_CUSTOMERS_KEY, JSON.stringify(nextCs));
    localStorage.setItem(TRIAL_PRODUCTS_KEY, JSON.stringify(nextPs));
    localStorage.setItem(TRIAL_CUSTOMER_PRICES_KEY, JSON.stringify(nextCp));
  }

  function updateTrialBar(trial: TrialInfo) {
    const totalMs = trial.expiresAt - trial.startedAt;
    const leftMs = Math.max(trial.expiresAt - Date.now(), 0);
    const totalSec = Math.floor(leftMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    setTrialLeft(`${min}分 ${sec}秒`);
    setTrialPercent(Math.max((leftMs / totalMs) * 100, 0));
  }

  async function loadTransactions(userId: string) {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setTransactions((data || []) as Txn[]);
  }

  async function loadCustomers(userId: string) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setCustomers((data || []) as Customer[]);
  }

  async function loadProducts(userId: string) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setProducts((data || []) as Product[]);
  }

  async function loadCustomerPrices(userId: string) {
    const { data } = await supabase
      .from("customer_prices")
      .select("*")
      .eq("user_id", userId);

    setCustomerPrices((data || []) as CustomerPrice[]);
  }

  async function handleLogout() {
    clearTrialData();
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  async function addTransaction() {
    if (!txDate || !txAmount || !txCategory) return;

    const amount = Number(txAmount);
    const debt = Number(txDebt || 0);

    if (isTrial) {
      const newTx: Txn = {
        id: String(Date.now()),
        txn_date: txDate,
        txn_type: txType,
        amount,
        category_name: txCategory,
        debt_amount: debt,
        note: txNote,
      };

      const next = [newTx, ...transactions];
      setTransactions(next);
      saveTrialData(next, customers, products, customerPrices);
    } else {
      if (!session) return;

      await supabase.from("transactions").insert({
        user_id: session.user.id,
        txn_date: txDate,
        txn_type: txType,
        amount,
        category_name: txCategory,
        debt_amount: debt,
        note: txNote,
      });

      await loadTransactions(session.user.id);
    }

    setTxDate("");
    setTxType("income");
    setTxAmount("");
    setTxCategory("");
    setTxDebt("");
    setTxNote("");
  }

  async function deleteTransaction(id: string) {
    if (isTrial) {
      const next = transactions.filter((x) => x.id !== id);
      setTransactions(next);
      saveTrialData(next, customers, products, customerPrices);
      return;
    }

    await supabase.from("transactions").delete().eq("id", id);
    if (session) await loadTransactions(session.user.id);
  }

  async function addCustomer() {
    if (!customerName) return;

    if (isTrial) {
      const newCustomer: Customer = {
        id: String(Date.now()),
        name: customerName,
        phone: customerPhone,
        company_name: customerCompany,
        company_phone: customerCompanyPhone,
        address: customerAddress,
        email: null,
        tags: [],
        debt_amount: 0,
        note: null,
      };

      const next = [newCustomer, ...customers];
      setCustomers(next);
      saveTrialData(transactions, next, products, customerPrices);
    } else {
      if (!session) return;

      await supabase.from("customers").insert({
        user_id: session.user.id,
        name: customerName,
        phone: customerPhone,
        company_name: customerCompany,
        address: customerAddress,
        note: customerCompanyPhone,
      });

      await loadCustomers(session.user.id);
    }

    setCustomerName("");
    setCustomerPhone("");
    setCustomerCompany("");
    setCustomerCompanyPhone("");
    setCustomerAddress("");
  }

  async function updateCustomer(c: Customer) {
    if (isTrial) {
      const next = customers.map((x) => (x.id === c.id ? c : x));
      setCustomers(next);
      saveTrialData(transactions, next, products, customerPrices);
      setEditingCustomerId(null);
      return;
    }

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
    if (session) await loadCustomers(session.user.id);
  }

  async function addProduct() {
    if (!productName || !productPrice || !productCost) return;

    const stock = Number(productStockQty || 0);

    if (isTrial) {
      const newProduct: Product = {
        id: String(Date.now()),
        name: productName,
        price: Number(productPrice),
        cost: Number(productCost),
        discount: Number(productDiscount || 0),
        stock_qty: stock,
        note: productNote,
      };

      const next = [newProduct, ...products];
      setProducts(next);
      saveTrialData(transactions, customers, next, customerPrices);
    } else {
      if (!session) return;

      await supabase.from("products").insert({
        user_id: session.user.id,
        name: productName,
        price: Number(productPrice),
        cost: Number(productCost),
        discount: Number(productDiscount || 0),
        stock_qty: stock,
        note: productNote,
      });

      await loadProducts(session.user.id);
    }

    setProductName("");
    setProductPrice("");
    setProductCost("");
    setProductDiscount("");
    setProductStockQty("");
    setProductNote("");
  }

  async function updateProduct(p: Product) {
    if (isTrial) {
      const next = products.map((x) => (x.id === p.id ? p : x));
      setProducts(next);
      saveTrialData(transactions, customers, next, customerPrices);
      setEditingProductId(null);
      return;
    }

    await supabase
      .from("products")
      .update({
        name: p.name,
        price: p.price,
        cost: p.cost,
        discount: p.discount,
        stock_qty: Number(p.stock_qty || 0),
        note: p.note,
      })
      .eq("id", p.id);

    setEditingProductId(null);
    if (session) await loadProducts(session.user.id);
  }

  async function saveCustomerPrice() {
    if (!priceCustomerId || !priceProductId || !customPrice) return;

    if (isTrial) {
      const exists = customerPrices.find(
        (x) => x.customer_id === priceCustomerId && x.product_id === priceProductId
      );

      const next: CustomerPrice[] = exists
        ? customerPrices.map((x) =>
            x.customer_id === priceCustomerId && x.product_id === priceProductId
              ? { ...x, custom_price: Number(customPrice) }
              : x
          )
        : [
            {
              id: String(Date.now()),
              customer_id: priceCustomerId,
              product_id: priceProductId,
              custom_price: Number(customPrice),
            },
            ...customerPrices,
          ];

      setCustomerPrices(next);
      saveTrialData(transactions, customers, products, next);
    } else {
      if (!session) return;

      await supabase.from("customer_prices").upsert(
        {
          user_id: session.user.id,
          customer_id: priceCustomerId,
          product_id: priceProductId,
          custom_price: Number(customPrice),
        },
        {
          onConflict: "customer_id,product_id",
        }
      );

      await loadCustomerPrices(session.user.id);
    }

    setCustomPrice("");
  }

  async function createInvoice() {
    setInvoiceMsg("");

    let customer = customers.find((c) => c.id === invoiceCustomerId);
    let product = products.find((p) => p.id === invoiceProductId);

    if (invoiceCustomerMode === "new") {
      if (!newInvoiceCustomerName) {
        setInvoiceMsg("请填写新客户名称");
        return;
      }

      customer = {
        id: String(Date.now()),
        name: newInvoiceCustomerName,
        phone: newInvoiceCustomerPhone,
        company_name: newInvoiceCustomerCompany,
        company_phone: "",
        address: newInvoiceCustomerAddress,
        note: "",
      };

      if (isTrial) {
        const nextCustomers = [customer, ...customers];
        setCustomers(nextCustomers);
        saveTrialData(transactions, nextCustomers, products, customerPrices);
      } else {
        if (!session) return;

        const { data: newCustomerData, error } = await supabase
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

        if (error) {
          setInvoiceMsg("新增客户失败：" + error.message);
          return;
        }

        customer = newCustomerData as Customer;
        await loadCustomers(session.user.id);
      }
    }

    if (invoiceProductMode === "new") {
      if (!newInvoiceProductName || !newInvoiceProductPrice || !newInvoiceProductCost) {
        setInvoiceMsg("请填写新产品名称、价格和成本");
        return;
      }

      product = {
        id: String(Date.now() + 1),
        name: newInvoiceProductName,
        price: Number(newInvoiceProductPrice),
        cost: Number(newInvoiceProductCost),
        discount: 0,
        stock_qty: Number(newInvoiceProductStockQty || 0),
        note: "发票新增产品",
      };

      if (isTrial) {
        const nextProducts = [product, ...products];
        setProducts(nextProducts);
        saveTrialData(transactions, customers, nextProducts, customerPrices);
      } else {
        if (!session) return;

        const { data: newProductData, error } = await supabase
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

        if (error) {
          setInvoiceMsg("新增产品失败：" + error.message);
          return;
        }

        product = newProductData as Product;
        await loadProducts(session.user.id);
      }
    }

    if (!customer || !product) {
      setInvoiceMsg("请选择或新增客户和产品");
      return;
    }

    const qty = Number(invoiceQty || 1);
    const currentStock = Number(product.stock_qty || 0);

    if (currentStock < qty) {
      setInvoiceMsg(`库存不足，目前库存：${currentStock}`);
      return;
    }

    const unitPrice =
      invoiceProductMode === "new"
        ? Number(newInvoiceProductPrice || 0)
        : Number(invoicePrice || product.price || 0);

    const unitCost =
      invoiceProductMode === "new"
        ? Number(newInvoiceProductCost || 0)
        : Number(product.cost || 0);

    const discount = Number(product.discount || 0);
    const total = unitPrice * qty - discount;
    const totalCost = unitCost * qty;
    const totalProfit = total - totalCost;
    const invoiceNo = `INV-${Date.now()}`;
    const newStock = Math.max(currentStock - qty, 0);

    if (isTrial) {
      const nextProducts = products.map((p) =>
        p.id === product!.id ? { ...p, stock_qty: newStock } : p
      );

      const newTx: Txn = {
        id: String(Date.now() + 2),
        txn_date: new Date().toISOString().slice(0, 10),
        txn_type: "income",
        amount: total,
        category_name: "发票收入",
        debt_amount: 0,
        note: `${invoiceNo}｜${customer.name}｜${product.name}｜出货 ${qty} 件`,
      };

      const nextTx = [newTx, ...transactions];
      setProducts(nextProducts);
      setTransactions(nextTx);
      saveTrialData(nextTx, customers, nextProducts, customerPrices);
      setInvoiceMsg("试用版发票已生成，已加入记账，并已自动扣库存");
    } else {
      if (!session) return;

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: session.user.id,
          customer_id: customer.id,
          customer_name: customer.name,
          invoice_no: invoiceNo,
          subtotal: total,
          total,
          total_cost: totalCost,
          total_profit: totalProfit,
          note: "由发票系统生成",
        })
        .select()
        .single();

      if (invoiceError) {
        setInvoiceMsg("发票生成失败：" + invoiceError.message);
        return;
      }

      await supabase.from("invoice_items").insert({
        invoice_id: invoiceData.id,
        product_id: product.id,
        product_name: product.name,
        qty,
        unit_price: unitPrice,
        unit_cost: unitCost,
        discount,
        line_total: total,
        line_profit: totalProfit,
      });

      await supabase
        .from("products")
        .update({ stock_qty: newStock })
        .eq("id", product.id);

      await supabase.from("transactions").insert({
        user_id: session.user.id,
        txn_date: new Date().toISOString().slice(0, 10),
        txn_type: "income",
        amount: total,
        category_name: "发票收入",
        debt_amount: 0,
        source_type: "invoice",
        source_id: invoiceData.id,
        note: `${invoiceNo}｜${customer.name}｜${product.name}｜出货 ${qty} 件`,
      });

      await loadTransactions(session.user.id);
      await loadProducts(session.user.id);
      setInvoiceMsg("发票已生成，已自动加入记账，并已扣除库存");
    }

    setInvoiceCustomerId("");
    setInvoiceProductId("");
    setInvoiceQty("1");
    setInvoicePrice(0);
    setNewInvoiceCustomerName("");
    setNewInvoiceCustomerPhone("");
    setNewInvoiceCustomerCompany("");
    setNewInvoiceCustomerAddress("");
    setNewInvoiceProductName("");
    setNewInvoiceProductPrice("");
    setNewInvoiceProductCost("");
    setNewInvoiceProductStockQty("");
  }

  async function saveProfile() {
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        company_name: companyName,
        company_reg_no: companyRegNo,
        company_phone: companyPhone,
        company_email: companyEmail,
        company_address: companyAddress,
      })
      .eq("id", session.user.id);

    if (error) {
      setMsg("保存资料失败：" + error.message);
      setMsgType("error");
      return;
    }

    setMsg("资料保存成功");
    setMsgType("success");
  }

  async function changePassword() {
    if (!newPassword || newPassword.length < 6) {
      setMsg("新密码至少 6 位");
      setMsgType("error");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMsg("修改密码失败：" + error.message);
      setMsgType("error");
      return;
    }

    setMsg("密码修改成功");
    setMsgType("success");
    setNewPassword("");
  }

  async function saveTheme(newTheme: ThemePackKey) {
    setThemePack(newTheme);

    if (session) {
      await supabase.from("profiles").update({ theme: newTheme }).eq("id", session.user.id);
    }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    if (!session) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const filePath = `${session.user.id}/avatar-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("company-assets")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (error) return;

    const { data } = supabase.storage.from("company-assets").getPublicUrl(filePath);

    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", session.user.id);

    setProfile((prev) => (prev ? { ...prev, avatar_url: data.publicUrl } : prev));
  }

  async function uploadCompanyLogo(e: React.ChangeEvent<HTMLInputElement>) {
    if (!session) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const filePath = `${session.user.id}/company-logo-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("company-assets")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (error) return;

    const { data } = supabase.storage.from("company-assets").getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ company_logo_url: data.publicUrl })
      .eq("id", session.user.id);

    setProfile((prev) => (prev ? { ...prev, company_logo_url: data.publicUrl } : prev));
  }

  const totalIncome = useMemo(() => {
    return transactions
      .filter((r) => r.txn_type === "income")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((r) => r.txn_type === "expense")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return transactions.filter((r) => r.txn_date.startsWith(ym));
  }, [transactions]);

  const monthIncome = currentMonthTransactions
    .filter((r) => r.txn_type === "income")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const monthExpense = currentMonthTransactions
    .filter((r) => r.txn_type === "expense")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const expiryText = isTrial
    ? "免费试用"
    : profile?.plan_expiry
      ? new Date(profile.plan_expiry).toLocaleDateString()
      : "未订阅";

  const invoiceProduct = products.find((p) => p.id === invoiceProductId);
  const invoiceQtyNumber = Number(invoiceQty || 1);
  const invoiceDiscount = Number(invoiceProduct?.discount || 0);
  const invoiceTotal = Math.max(invoicePrice * invoiceQtyNumber - invoiceDiscount, 0);
  const invoiceProfit = invoiceTotal - Number(invoiceProduct?.cost || 0) * invoiceQtyNumber;

  return (
    <main style={{ ...pageStyle, background: theme.pageBg, color: theme.text }}>
      {isTrial && (
        <div style={trialWrapStyle}>
          <div style={trialTopRowStyle}>
            <strong>免费试用版</strong>
            <strong>剩余时间：{trialLeft}</strong>
          </div>
          <div style={trialBarBgStyle}>
            <div style={{ ...trialBarFillStyle, width: `${trialPercent}%` }} />
          </div>
        </div>
      )}

      <div style={{ ...heroCardStyle, background: theme.heroBg, color: theme.bannerText }}>
        <div>
          <h1 style={titleStyle}>控制台</h1>
          <p style={{ ...subTitleStyle, color: theme.subText }}>
            欢迎回来{profile?.full_name ? `，${profile.full_name}` : ""}，订阅到期：{expiryText}
          </p>
        </div>

        <div style={topRightStyle}>
          <div style={{ color: theme.subText, fontWeight: 700 }}>到期：{expiryText}</div>

          <div style={{ position: "relative" }}>
            <button onClick={() => setShowAvatarMenu((v) => !v)} style={avatarBtnStyle}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={avatarImgStyle} />
              ) : (
                "👤"
              )}
            </button>

            {showAvatarMenu && (
              <div style={avatarMenuStyle}>
                <label style={menuUploadLabel}>
                  换头像
                  <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: "none" }} />
                </label>

                <button style={avatarMenuItemStyle} onClick={() => { setActiveTab("settings"); setShowAvatarMenu(false); }}>
                  设置 / 公司资料
                </button>

                <button style={avatarMenuItemStyle} onClick={() => { setActiveTab("themes"); setShowAvatarMenu(false); }}>
                  切换主题
                </button>

                <button style={avatarMenuItemStyle} onClick={handleLogout}>
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={statsGridStyle}>
        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>当前余额</div>
          <div style={{ ...statValueStyle, color: theme.accent }}>RM {balance.toFixed(2)}</div>
        </div>

        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>本月收入</div>
          <div style={{ ...statValueStyle, color: "#16a34a" }}>RM {monthIncome.toFixed(2)}</div>
        </div>

        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>本月支出</div>
          <div style={{ ...statValueStyle, color: "#dc2626" }}>RM {monthExpense.toFixed(2)}</div>
        </div>
      </div>

      <div style={menuGridStyle}>
        <button style={menuBtn(activeTab === "overview", theme)} onClick={() => setActiveTab("overview")}>总览</button>
        <button style={menuBtn(activeTab === "daily", theme)} onClick={() => setActiveTab("daily")}>每日记账</button>
        <button style={menuBtn(activeTab === "customers", theme)} onClick={() => setActiveTab("customers")}>客户管理</button>
        <button style={menuBtn(activeTab === "products", theme)} onClick={() => setActiveTab("products")}>产品管理</button>
        <button style={menuBtn(activeTab === "invoices", theme)} onClick={() => setActiveTab("invoices")}>发票系统</button>
      </div>

      {activeTab === "overview" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>总览</h3>
          <p style={{ ...mutedTextStyle, color: theme.subText }}>
            这里会根据你的记账记录自动更新金额。
          </p>
        </section>
      )}

      {activeTab === "daily" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>每日记账</h3>

          <div style={formGridStyle}>
            <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} style={dateInputStyle} />
            <select value={txType} onChange={(e) => setTxType(e.target.value as "income" | "expense")} style={inputStyle}>
              <option value="income">收款</option>
              <option value="expense">付款</option>
            </select>
            <input placeholder="金额（RM）" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} style={inputStyle} />
            <input placeholder="分类 / 标签" value={txCategory} onChange={(e) => setTxCategory(e.target.value)} style={inputStyle} />
            <input placeholder="欠款（可留空）" value={txDebt} onChange={(e) => setTxDebt(e.target.value)} style={inputStyle} />
            <input placeholder="备注" value={txNote} onChange={(e) => setTxNote(e.target.value)} style={inputStyle} />
          </div>

          <button onClick={addTransaction} style={{ ...primaryBtnStyle, background: theme.accent }}>
            新增记录
          </button>
        </section>
      )}

      {activeTab === "customers" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>客户管理</h3>

          <h4>个人资料</h4>
          <div style={formGridStyle}>
            <input placeholder="名称" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
            <input placeholder="电话号码" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputStyle} />
          </div>

          <h4 style={{ marginTop: 18 }}>公司资料</h4>
          <div style={formGridStyle}>
            <input placeholder="公司名称" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} style={inputStyle} />
            <input placeholder="公司电话号码" value={customerCompanyPhone} onChange={(e) => setCustomerCompanyPhone(e.target.value)} style={inputStyle} />
            <input placeholder="公司地址" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} style={inputStyle} />
          </div>

          <button onClick={addCustomer} style={{ ...primaryBtnStyle, background: theme.accent }}>
            新增客户
          </button>

          <div style={{ marginTop: 18 }}>
            {customers.length === 0 ? (
              <p style={{ color: theme.subText }}>还没有客户资料</p>
            ) : (
              customers.map((c) => (
                <div key={c.id} style={listItemStyle}>
                  {editingCustomerId === c.id ? (
                    <div style={{ width: "100%" }}>
                      <label style={fieldLabelStyle}>名称</label>
                      <input placeholder="名称" value={c.name} onChange={(e) => setCustomers((prev) => prev.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>电话号码</label>
                      <input placeholder="电话号码" value={c.phone || ""} onChange={(e) => setCustomers((prev) => prev.map((x) => x.id === c.id ? { ...x, phone: e.target.value } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>公司名称</label>
                      <input placeholder="公司名称" value={c.company_name || ""} onChange={(e) => setCustomers((prev) => prev.map((x) => x.id === c.id ? { ...x, company_name: e.target.value } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>公司电话号码</label>
                      <input placeholder="公司电话号码" value={c.company_phone || c.note || ""} onChange={(e) => setCustomers((prev) => prev.map((x) => x.id === c.id ? { ...x, company_phone: e.target.value } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>公司地址</label>
                      <input placeholder="公司地址" value={c.address || ""} onChange={(e) => setCustomers((prev) => prev.map((x) => x.id === c.id ? { ...x, address: e.target.value } : x))} style={inputStyle} />

                      <button onClick={() => updateCustomer(c)} style={{ ...primaryBtnStyle, background: theme.accent }}>
                        保存修改
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{c.name}</strong>
                        <div style={{ ...mutedTextStyle, color: theme.subText }}>电话：{c.phone || "无"}</div>
                        <div style={{ ...mutedTextStyle, color: theme.subText }}>
                          公司：{c.company_name || "无"} · 公司电话：{c.company_phone || c.note || "无"}
                        </div>
                        <div style={{ ...mutedTextStyle, color: theme.subText }}>地址：{c.address || "无"}</div>
                      </div>

                      <button onClick={() => setEditingCustomerId(c.id)} style={editBtnStyle}>
                        编辑
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "products" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>产品管理</h3>

          <div style={formGridStyle}>
            <input placeholder="产品名称" value={productName} onChange={(e) => setProductName(e.target.value)} style={inputStyle} />
            <input placeholder="价格" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} style={inputStyle} />
            <input placeholder="成本" value={productCost} onChange={(e) => setProductCost(e.target.value)} style={inputStyle} />
            <input placeholder="折扣" value={productDiscount} onChange={(e) => setProductDiscount(e.target.value)} style={inputStyle} />
            <input placeholder="货数数量 / 库存" value={productStockQty} onChange={(e) => setProductStockQty(e.target.value)} style={inputStyle} />
            <input placeholder="备注" value={productNote} onChange={(e) => setProductNote(e.target.value)} style={inputStyle} />
          </div>

          <button onClick={addProduct} style={{ ...primaryBtnStyle, background: theme.accent }}>
            新增产品
          </button>

          <div style={priceSettingBoxStyle}>
            <h4>客户专属价格</h4>

            <select value={priceCustomerId} onChange={(e) => setPriceCustomerId(e.target.value)} style={inputStyle}>
              <option value="">选择客户</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select value={priceProductId} onChange={(e) => setPriceProductId(e.target.value)} style={inputStyle}>
              <option value="">选择产品</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <input placeholder="这个客户的专属价格" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} style={inputStyle} />

            <button onClick={saveCustomerPrice} style={{ ...primaryBtnStyle, background: theme.accent }}>
              保存客户专属价格
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            {products.length === 0 ? (
              <p style={{ color: theme.subText }}>还没有产品</p>
            ) : (
              products.map((p) => (
                <div key={p.id} style={listItemStyle}>
                  {editingProductId === p.id ? (
                    <div style={{ width: "100%" }}>
                      <label style={fieldLabelStyle}>产品名称</label>
                      <input placeholder="产品名称" value={p.name} onChange={(e) => setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, name: e.target.value } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>价格</label>
                      <input placeholder="价格" value={String(p.price)} onChange={(e) => setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, price: Number(e.target.value) } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>成本</label>
                      <input placeholder="成本" value={String(p.cost)} onChange={(e) => setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, cost: Number(e.target.value) } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>折扣</label>
                      <input placeholder="折扣" value={String(p.discount || 0)} onChange={(e) => setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, discount: Number(e.target.value) } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>货数数量 / 库存</label>
                      <input placeholder="货数数量 / 库存" value={String(p.stock_qty || 0)} onChange={(e) => setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, stock_qty: Number(e.target.value) } : x))} style={inputStyle} />

                      <label style={fieldLabelStyle}>备注</label>
                      <input placeholder="备注" value={p.note || ""} onChange={(e) => setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, note: e.target.value } : x))} style={inputStyle} />

                      <button onClick={() => updateProduct(p)} style={{ ...primaryBtnStyle, background: theme.accent }}>
                        保存修改
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{p.name}</strong>
                        <div style={{ ...mutedTextStyle, color: theme.subText }}>
                          售价：RM {Number(p.price).toFixed(2)} · 成本：RM {Number(p.cost).toFixed(2)}
                        </div>
                        <div style={{ ...mutedTextStyle, color: theme.subText }}>
                          库存：{Number(p.stock_qty || 0)} · 折扣：RM {Number(p.discount || 0).toFixed(2)}
                        </div>
                      </div>

                      <button onClick={() => setEditingProductId(p.id)} style={editBtnStyle}>
                        编辑
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "invoices" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>发票系统</h3>

          <h4>客户</h4>
          <div style={switchRowStyle}>
            <button onClick={() => setInvoiceCustomerMode("select")} style={modeBtn(invoiceCustomerMode === "select", theme)}>
              选择客户管理
            </button>
            <button onClick={() => setInvoiceCustomerMode("new")} style={modeBtn(invoiceCustomerMode === "new", theme)}>
              新增客户
            </button>
          </div>

          {invoiceCustomerMode === "select" ? (
            <select value={invoiceCustomerId} onChange={(e) => setInvoiceCustomerId(e.target.value)} style={inputStyle}>
              <option value="">选择客户</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div style={formGridStyle}>
              <input placeholder="新客户名称" value={newInvoiceCustomerName} onChange={(e) => setNewInvoiceCustomerName(e.target.value)} style={inputStyle} />
              <input placeholder="新客户电话" value={newInvoiceCustomerPhone} onChange={(e) => setNewInvoiceCustomerPhone(e.target.value)} style={inputStyle} />
              <input placeholder="新客户公司名称" value={newInvoiceCustomerCompany} onChange={(e) => setNewInvoiceCustomerCompany(e.target.value)} style={inputStyle} />
              <input placeholder="新客户地址" value={newInvoiceCustomerAddress} onChange={(e) => setNewInvoiceCustomerAddress(e.target.value)} style={inputStyle} />
            </div>
          )}

          <h4 style={{ marginTop: 18 }}>产品</h4>
          <div style={switchRowStyle}>
            <button onClick={() => setInvoiceProductMode("select")} style={modeBtn(invoiceProductMode === "select", theme)}>
              选择产品管理
            </button>
            <button onClick={() => setInvoiceProductMode("new")} style={modeBtn(invoiceProductMode === "new", theme)}>
              新增产品
            </button>
          </div>

          {invoiceProductMode === "select" ? (
            <select value={invoiceProductId} onChange={(e) => setInvoiceProductId(e.target.value)} style={inputStyle}>
              <option value="">选择产品</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}｜库存 {Number(p.stock_qty || 0)}
                </option>
              ))}
            </select>
          ) : (
            <div style={formGridStyle}>
              <input placeholder="新产品名称" value={newInvoiceProductName} onChange={(e) => setNewInvoiceProductName(e.target.value)} style={inputStyle} />
              <input placeholder="新产品价格" value={newInvoiceProductPrice} onChange={(e) => setNewInvoiceProductPrice(e.target.value)} style={inputStyle} />
              <input placeholder="新产品成本" value={newInvoiceProductCost} onChange={(e) => setNewInvoiceProductCost(e.target.value)} style={inputStyle} />
              <input placeholder="新产品货数数量 / 库存" value={newInvoiceProductStockQty} onChange={(e) => setNewInvoiceProductStockQty(e.target.value)} style={inputStyle} />
            </div>
          )}

          <label style={fieldLabelStyle}>出货数量</label>
          <input placeholder="数量" value={invoiceQty} onChange={(e) => setInvoiceQty(e.target.value)} style={inputStyle} />

          <div style={invoiceSummaryStyle}>
            <div>单价：RM {invoiceProductMode === "new" ? Number(newInvoiceProductPrice || 0).toFixed(2) : invoicePrice.toFixed(2)}</div>
            <div>产品折扣：RM {invoiceDiscount.toFixed(2)}</div>
            <div>总价：RM {invoiceProductMode === "new" ? Math.max(Number(newInvoiceProductPrice || 0) * invoiceQtyNumber, 0).toFixed(2) : invoiceTotal.toFixed(2)}</div>
            <div>预计差价 / 利润：RM {invoiceProductMode === "new" ? ((Number(newInvoiceProductPrice || 0) - Number(newInvoiceProductCost || 0)) * invoiceQtyNumber).toFixed(2) : invoiceProfit.toFixed(2)}</div>
          </div>

          <button onClick={createInvoice} style={{ ...primaryBtnStyle, background: theme.accent }}>
            生成发票并加入记账
          </button>

          {invoiceMsg ? <p style={{ color: theme.accent, fontWeight: 700 }}>{invoiceMsg}</p> : null}
        </section>
      )}

      {activeTab === "settings" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>设置</h3>

          <div style={settingsBlockStyle}>
            <h4>个人资料</h4>
            <input placeholder="你的名字" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
          </div>

          <div style={settingsBlockStyle}>
            <h4>公司资料（发票时会显示）</h4>
            <div style={formGridStyle}>
              <input placeholder="公司名称" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
              <input placeholder="公司注册号" value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} style={inputStyle} />
              <input placeholder="公司电话" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} style={inputStyle} />
              <input placeholder="公司 Email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} style={inputStyle} />
              <input placeholder="公司地址" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                上传公司标识
              </label>
              <input type="file" accept="image/*" onChange={uploadCompanyLogo} />
            </div>

            <button onClick={saveProfile} style={{ ...primaryBtnStyle, background: theme.accent }}>
              保存资料
            </button>
          </div>

          <div style={settingsBlockStyle}>
            <h4>修改密码</h4>
            <input type="password" placeholder="请输入新密码" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
            <button onClick={changePassword} style={{ ...primaryBtnStyle, background: theme.accent }}>
              更新密码
            </button>
          </div>

          {msg ? (
            <div style={{
              ...messageBoxStyle,
              background: msgType === "error" ? "#fee2e2" : "#dcfce7",
              color: msgType === "error" ? "#b91c1c" : "#166534",
            }}>
              {msg}
            </div>
          ) : null}
        </section>
      )}

      {activeTab === "themes" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>主题切换</h3>

          <div style={themeGridStyle}>
            {(Object.keys(THEME_PACKS) as ThemePackKey[]).map((key) => {
              const pack = THEME_PACKS[key];
              const active = key === themePack;

              return (
                <div key={key} style={{
                  ...themeCardStyle,
                  border: active ? `2px solid ${pack.accent}` : "1px solid #d1d5db",
                  background: pack.pageBg,
                  color: pack.text,
                }}>
                  <div style={{ ...themeHeroPreviewStyle, background: pack.heroBg, color: pack.bannerText }}>
                    {pack.name}
                  </div>

                  <div style={{ fontWeight: 700, marginTop: 10 }}>{pack.name}</div>
                  <div style={{ fontSize: 13, marginTop: 6, color: pack.subText }}>{pack.preview}</div>

                  <button onClick={() => saveTheme(key)} style={{ ...primaryBtnStyle, background: pack.accent, width: "100%" }}>
                    {active ? "当前使用中" : "切换主题"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "16px",
  fontFamily: "sans-serif",
};

const trialWrapStyle: CSSProperties = {
  background: "#dcfce7",
  border: "1px solid #86efac",
  borderRadius: 16,
  padding: 14,
  marginBottom: 18,
};

const trialTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#166534",
  marginBottom: 10,
};

const trialBarBgStyle: CSSProperties = {
  width: "100%",
  height: 12,
  background: "#bbf7d0",
  borderRadius: 999,
  overflow: "hidden",
};

const trialBarFillStyle: CSSProperties = {
  height: "100%",
  background: "#0F766E",
  borderRadius: 999,
};

const heroCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 20,
  marginBottom: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const topRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const avatarBtnStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: "999px",
  border: "none",
  background: "#ffffff",
  fontSize: 22,
  cursor: "pointer",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const avatarImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarMenuStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 54,
  background: "#ffffff",
  borderRadius: 14,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  padding: 10,
  minWidth: 180,
  zIndex: 20,
};

const avatarMenuItemStyle: CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  background: "transparent",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
};

const menuUploadLabel: CSSProperties = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
};

const titleStyle: CSSProperties = {
  fontSize: 30,
  margin: 0,
};

const subTitleStyle: CSSProperties = {
  marginTop: 10,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 18,
};

const statCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 14,
  border: "2px solid",
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  minWidth: 0,
};

const statLabelStyle: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
};

const statValueStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  marginTop: 8,
  wordBreak: "break-word",
};

const menuGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const menuBtn = (active: boolean, theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  padding: "14px 12px",
  borderRadius: 12,
  border: active ? `2px solid ${theme.accent}` : "1px solid #cbd5e1",
  background: active ? "#ecfdf5" : "#fff",
  color: active ? theme.accent : "#0f172a",
  fontWeight: 700,
});

const sectionCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 20,
  border: "2px solid",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  overflow: "hidden",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 16,
  boxSizing: "border-box",
  marginTop: 8,
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
};

const primaryBtnStyle: CSSProperties = {
  marginTop: 14,
  padding: "12px 18px",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
};

const listItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
};

const mutedTextStyle: CSSProperties = {
  fontSize: 14,
  marginTop: 4,
};

const deleteBtnStyle: CSSProperties = {
  padding: "8px 10px",
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
};

const editBtnStyle: CSSProperties = {
  padding: "8px 12px",
  background: "#ecfdf5",
  color: "#0F766E",
  border: "1px solid #0F766E",
  borderRadius: 8,
  fontWeight: 700,
};

const settingsBlockStyle: CSSProperties = {
  marginTop: 18,
};

const messageBoxStyle: CSSProperties = {
  marginTop: 16,
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
};

const priceSettingBoxStyle: CSSProperties = {
  marginTop: 20,
  padding: 14,
  border: "1px dashed #0F766E",
  borderRadius: 14,
};

const invoiceSummaryStyle: CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  lineHeight: 1.8,
  fontWeight: 700,
};

const fieldLabelStyle: CSSProperties = {
  display: "block",
  marginTop: 12,
  marginBottom: 2,
  fontSize: 14,
  fontWeight: 800,
  color: "#14532d",
};

const switchRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 10,
};

const modeBtn = (
  active: boolean,
  theme: (typeof THEME_PACKS)[ThemePackKey]
): CSSProperties => ({
  padding: "12px 10px",
  borderRadius: 10,
  border: `2px solid ${theme.accent}`,
  background: active ? theme.accent : "#ffffff",
  color: active ? "#ffffff" : theme.accent,
  fontWeight: 800,
});

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const themeCardStyle: CSSProperties = {
  borderRadius: 16,
  padding: 14,
};

const themeHeroPreviewStyle: CSSProperties = {
  borderRadius: 12,
  padding: "18px 12px",
  textAlign: "center",
  fontWeight: 800,
};
