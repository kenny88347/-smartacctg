"use client";

import { CSSProperties, Dispatch, SetStateAction } from "react";
import {
  Customer,
  Invoice,
  Product,
  RecordFormState,
  RecordText,
  formatRM,
} from "../types";

type Props = {
  form: RecordFormState;
  setForm: Dispatch<SetStateAction<RecordFormState>>;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  t: RecordText;
  themedInputStyle: CSSProperties;
};

export default function LinkedInfoPanel({
  form,
  setForm,
  customers,
  products,
  invoices,
  t,
  themedInputStyle,
}: Props) {
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
              {inv.invoice_no || inv.id} {inv.customer_name ? `- ${inv.customer_name}` : ""} -{" "}
              {formatRM(Number(inv.total || 0))}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
};

const responsiveGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};
