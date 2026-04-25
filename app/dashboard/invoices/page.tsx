"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  company_name: string | null;
  address: string | null;
};

type Product = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  cost: number;
  discount: number | null;
  stock_qty: number | null;
  note: string | null;
};

type InvoiceItem = {
  product_id: string;
  product_name: string;
  qty: number;
  unit_price: number;
  unit_cost: number;
  discount: number;
  line_total: number;
  line_profit: number;
};

export default function InvoicePage() {
  const [userId, setUserId] = useState("");
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

  const [qty, setQty] = useState("1");
  const [extraDiscount, setExtraDiscount] = useState("0");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/zh";
      return;
    }

    const uid = data.session.user.id;
    setUserId(uid);

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

  const preview = useMemo(() => {
    const q = Number(qty || 1);
    const discount = Number(extraDiscount || 0);

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

    const totalDiscount = productDiscount + discount;
    const subtotal = price * q;
    const total = Math.max(subtotal - totalDiscount, 0);
    const totalCost = cost * q;
    const profit = total - totalCost;

    return {
      qty: q,
      price,
      cost,
      productDiscount,
      extraDiscount: discount,
      totalDiscount,
      subtotal,
      total,
      totalCost,
      profit,
    };
  }, [qty, extraDiscount, productMode, newProductPrice, newProductCost, selectedProduct]);

  async function createInvoice() {
    setMsg("");

    if (!userId) return;

    if (customerMode === "select" && !selectedCustomer) {
      setMsg("请选择客户");
      return;
    }

    if (productMode === "select" && !selectedProduct) {
      setMsg("请选择产品");
      return;
    }

    if (customerMode === "new" && !newCustomerName) {
      setMsg("请填写新客户名称");
      return;
    }

    if (productMode === "new" && (!newProductName || !newProductPrice || !newProductCost)) {
      setMsg("请填写新产品名称、价格和成本");
      return;
    }

    const invoiceQty = Number(qty || 1);

    if (invoiceQty <= 0) {
      setMsg("数量必须大过 0");
      return;
    }

    setLoading(true);

    try {
      let finalCustomer = selectedCustomer;
      let finalProduct = selectedProduct;

      if (customerMode === "new") {
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

      if (productMode === "new") {
        const { data, error } = await supabase
          .from("products")
          .insert({
            user_id: userId,
            name: newProductName,
            price: Number(newProductPrice || 0),
            cost: Number(newProductCost || 0),
            discount: 0,
            stock_qty: Number(newProductStock || 0),
            note: "由发票系统新增",
          })
          .select()
          .single();

        if (error) throw error;

        finalProduct = data as Product;
        await loadProducts(userId);
      }

      if (!finalCustomer || !finalProduct) {
        setMsg("客户或产品资料不完整");
        setLoading(false);
        return;
      }

      const currentStock = Number(finalProduct.stock_qty || 0);

      if (currentStock < invoiceQty) {
        setMsg(`库存不足，目前库存：${currentStock}`);
        setLoading(false);
        return;
      }

      const invoiceNo = `INV-${new Date().getFullYear()}-${Date.now()}`;
      const today = new Date().toISOString().slice(0, 10);

      const item: InvoiceItem = {
        product_id: finalProduct.id,
        product_name: finalProduct.name,
        qty: invoiceQty,
        unit_price: preview.price,
        unit_cost: preview.cost,
        discount: preview.totalDiscount,
        line_total: preview.total,
        line_profit: preview.profit,
      };

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          customer_id: finalCustomer.id,
          customer_name: finalCustomer.name,
          invoice_no: invoiceNo,
          invoice_date: today,
          due_date: dueDate || null,
          subtotal: preview.subtotal,
          discount: preview.totalDiscount,
          total: preview.total,
          total_cost: preview.totalCost,
          total_profit: preview.profit,
          status: "sent",
          note: note || "由发票系统生成",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const { error: itemError } = await supabase.from("invoice_items").insert({
        invoice_id: invoiceData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        qty: item.qty,
        unit_price: item.unit_price,
        unit_cost: item.unit_cost,
        discount: item.discount,
        line_total: item.line_total,
        line_profit: item.line_profit,
      });

      if (itemError) throw itemError;

      const newStock = Math.max(currentStock - invoiceQty, 0);

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock_qty: newStock })
        .eq("id", finalProduct.id);

      if (stockError) throw stockError;

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: userId,
        txn_date: today,
        txn_type: "income",
        amount: preview.total,
        category_name: "发票收入",
        debt_amount: 0,
        source_type: "invoice",
        source_id: invoiceData.id,
        note: `${invoiceNo}｜${finalCustomer.name}｜${finalProduct.name}｜出货 ${invoiceQty}`,
      });

      if (txError) throw txError;

      setMsg("发票已生成，已自动加入记账，并已扣除库存");

      setCustomerId("");
      setProductId("");
      setQty("1");
      setExtraDiscount("0");
      setNote("");
      setDueDate("");
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerCompany("");
      setNewCustomerAddress("");
      setNewProductName("");
      setNewProductPrice("");
      setNewProductCost("");
      setNewProductStock("");

      await loadProducts(userId);
    } catch (error: any) {
      setMsg("生成失败：" + error.message);
    }

    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      <button onClick={() => (window.location.href = "/dashboard")} style={backBtn}>
        ← 返回
      </button>

      <section style={cardStyle}>
        <h1 style={titleStyle}>专业发票系统</h1>
        <p style={descStyle}>客户管理 × 产品管理 × 记账系统 自动联动</p>

        <h3>客户资料</h3>

        <div style={switchRow}>
          <button
            onClick={() => setCustomerMode("select")}
            style={modeBtn(customerMode === "select")}
          >
            选择客户
          </button>
          <button
            onClick={() => setCustomerMode("new")}
            style={modeBtn(customerMode === "new")}
          >
            新增客户
          </button>
        </div>

        {customerMode === "select" ? (
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={inputStyle}>
            <option value="">请选择客户</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company_name ? `｜${c.company_name}` : ""}
              </option>
            ))}
          </select>
        ) : (
          <div style={formGrid}>
            <input placeholder="客户名称" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} style={inputStyle} />
            <input placeholder="客户电话" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} style={inputStyle} />
            <input placeholder="客户公司名称" value={newCustomerCompany} onChange={(e) => setNewCustomerCompany(e.target.value)} style={inputStyle} />
            <input placeholder="客户地址" value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} style={inputStyle} />
          </div>
        )}

        <h3>产品资料</h3>

        <div style={switchRow}>
          <button
            onClick={() => setProductMode("select")}
            style={modeBtn(productMode === "select")}
          >
            选择产品
          </button>
          <button
            onClick={() => setProductMode("new")}
            style={modeBtn(productMode === "new")}
          >
            新增产品
          </button>
        </div>

        {productMode === "select" ? (
          <select value={productId} onChange={(e) => setProductId(e.target.value)} style={inputStyle}>
            <option value="">请选择产品</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}｜售价 RM {Number(p.price).toFixed(2)}｜库存 {Number(p.stock_qty || 0)}
              </option>
            ))}
          </select>
        ) : (
          <div style={formGrid}>
            <input placeholder="产品名称" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} style={inputStyle} />
            <input placeholder="售价 RM" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} style={inputStyle} />
            <input placeholder="成本 RM" value={newProductCost} onChange={(e) => setNewProductCost(e.target.value)} style={inputStyle} />
            <input placeholder="库存数量" value={newProductStock} onChange={(e) => setNewProductStock(e.target.value)} style={inputStyle} />
          </div>
        )}

        <h3>发票内容</h3>

        <div style={formGrid}>
          <input placeholder="数量" value={qty} onChange={(e) => setQty(e.target.value)} style={inputStyle} />
          <input placeholder="额外折扣 RM" value={extraDiscount} onChange={(e) => setExtraDiscount(e.target.value)} style={inputStyle} />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          <input placeholder="备注" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} />
        </div>

        <section style={previewBox}>
          <h3>发票预览</h3>

          <div style={rowStyle}>
            <span>单价</span>
            <strong>RM {preview.price.toFixed(2)}</strong>
          </div>

          <div style={rowStyle}>
            <span>数量</span>
            <strong>{preview.qty}</strong>
          </div>

          <div style={rowStyle}>
            <span>小计</span>
            <strong>RM {preview.subtotal.toFixed(2)}</strong>
          </div>

          <div style={rowStyle}>
            <span>折扣</span>
            <strong>RM {preview.totalDiscount.toFixed(2)}</strong>
          </div>

          <div style={totalRowStyle}>
            <span>总额</span>
            <strong>RM {preview.total.toFixed(2)}</strong>
          </div>

          <div style={profitRowStyle}>
            <span>预计利润 / 差价</span>
            <strong>RM {preview.profit.toFixed(2)}</strong>
          </div>
        </section>

        <button onClick={createInvoice} disabled={loading} style={submitBtn}>
          {loading ? "生成中..." : "生成发票 + 加入记账 + 扣库存"}
        </button>

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

const backBtn: CSSProperties = {
  background: "#fff",
  color: "#0f766e",
  border: "2px solid #0f766e",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 900,
  marginBottom: 14,
};

const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "3px solid #14b8a6",
  boxShadow:
    "0 0 0 1px rgba(20,184,166,0.42), 0 0 18px rgba(45,212,191,0.55), 0 18px 42px rgba(15,118,110,0.25)",
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
  gap: 10,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  borderRadius: 12,
  border: "2px solid #14b8a6",
  fontSize: 16,
  marginBottom: 10,
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

const msgStyle: CSSProperties = {
  marginTop: 14,
  color: "#0f766e",
  fontWeight: 900,
};
