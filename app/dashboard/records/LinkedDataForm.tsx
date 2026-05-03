"use client";

import { CSSProperties } from "react";
import type { Customer, Product, Invoice, RecordFormState } from "./types";
import { formatRM } from "./recordsShared";

type Props = {
  t: any;
  theme: any;
  form: RecordFormState;
  setForm: (form: RecordFormState) => void;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
};

export default function LinkedDataForm({
  t,
  theme,
  form,
  setForm,
  customers,
  products,
  invoices,
}: Props) {
  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  return (
    <>
      <h3 style={sectionTitleStyle}>{t.linkedInfo}</h3>

      <div style={responsiveGridStyle}>
        <select
          value={form.customer_id}
          onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
          style={themedInputStyle}
        >
          <option value="">{t.noCustomer}</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name || "-"}
            </option>
          ))}
        </select>

        <select
          value={form.product_id}
          onChange={(e) => setForm({ ...form, product_id: e.target.value })}
          style={themedInputStyle}
        >
          <option value="">{t.noProduct}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || "-"} - {formatRM(Number(p.price || 0))}
            </option>
          ))}
        </select>

        <select
          value={form.invoice_id}
          onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
          style={themedInputStyle}
        >
          <option value="">{t.noInvoice}</option>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoice_no || inv.id}
              {inv.customer_name ? ` - ${inv.customer_name}` : ""} -{" "}
              {formatRM(Number(inv.total || 0))}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

const sectionTitleStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 14,
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
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
  outline: "none",
  fontSize: 16,
};

const responsiveGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};
