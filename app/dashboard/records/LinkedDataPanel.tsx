"use client";

import { CSSProperties } from "react";

type AnyRow = {
  id: string;
  name?: string | null;
  company_name?: string | null;
  price?: number | null;
  total?: number | null;
  invoice_no?: string | null;
  customer_name?: string | null;
  [key: string]: any;
};

type Props = {
  t?: any;
  theme?: any;
  form?: any;
  setForm?: (next: any) => void;
  customers?: AnyRow[];
  products?: AnyRow[];
  invoices?: AnyRow[];
  inputStyle?: CSSProperties;
  formatRM?: (value: number) => string;
  [key: string]: any;
};

export function LinkedDataForm(props: Props) {
  const t = props.t || {};
  const theme = props.theme || {};
  const form = props.form || {};

  const customers = props.customers || [];
  const products = props.products || [];
  const invoices = props.invoices || [];

  const formatRM =
    props.formatRM ||
    ((value: number) =>
      `RM ${Number(value || 0).toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`);

  function updateField(key: string, value: string) {
    if (props.setForm) {
      props.setForm({
        ...form,
        [key]: value,
      });
    }
  }

  const selectStyle: CSSProperties = {
    width: "100%",
    minHeight: "var(--sa-control-h, 54px)",
    borderRadius: "var(--sa-radius-control, 16px)",
    border: `var(--sa-border-w, 2px) solid ${theme.border || "#cbd5e1"}`,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
    padding: "0 var(--sa-control-x, 16px)",
    fontSize: 16,
    outline: "none",
    ...props.inputStyle,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
      }}
    >
      <select
        value={form.customer_id || ""}
        onChange={(e) => updateField("customer_id", e.target.value)}
        style={selectStyle}
      >
        <option value="">{t.noCustomer || "No Customer"}</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name || "-"}
            {c.company_name ? ` / ${c.company_name}` : ""}
          </option>
        ))}
      </select>

      <select
        value={form.product_id || ""}
        onChange={(e) => updateField("product_id", e.target.value)}
        style={selectStyle}
      >
        <option value="">{t.noProduct || "No Product"}</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name || "-"} - {formatRM(Number(p.price || 0))}
          </option>
        ))}
      </select>

      <select
        value={form.invoice_id || ""}
        onChange={(e) => updateField("invoice_id", e.target.value)}
        style={selectStyle}
      >
        <option value="">{t.noInvoice || "No Invoice"}</option>
        {invoices.map((inv) => (
          <option key={inv.id} value={inv.id}>
            {inv.invoice_no || inv.id}
            {inv.customer_name ? ` - ${inv.customer_name}` : ""} -{" "}
            {formatRM(Number(inv.total || 0))}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LinkedDataForm;
