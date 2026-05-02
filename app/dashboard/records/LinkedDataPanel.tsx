"use client";

import { CSSProperties } from "react";
import {
  Customer,
  Invoice,
  Product,
  RecordFormState,
  RecordsText,
  formatRM,
  styles,
} from "./recordsShared";

type LinkedDataFormProps = {
  t: RecordsText;
  themeSubText: string;
  form: RecordFormState;
  setForm: (form: RecordFormState) => void;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  themedInputStyle: CSSProperties;
};

export function LinkedDataForm({
  t,
  form,
  setForm,
  customers,
  products,
  invoices,
  themedInputStyle,
}: LinkedDataFormProps) {
  return (
    <>
      <h3 style={styles.sectionTitleStyle}>{t.linkedInfo}</h3>

      <div style={styles.responsiveGridStyle}>
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

type RelatedFeaturesPanelProps = {
  t: RecordsText;
  theme: any;
  themeSubText: string;
  relatedPath: string;
  setRelatedPath: (value: string) => void;
  goRelatedFeature: () => void;
  themedInputStyle: CSSProperties;
  themedCardStyle: CSSProperties;
};

export function RelatedFeaturesPanel({
  t,
  theme,
  relatedPath,
  setRelatedPath,
  goRelatedFeature,
  themedInputStyle,
  themedCardStyle,
}: RelatedFeaturesPanelProps) {
  return (
    <section className="sa-card" style={{ ...styles.cardStyle, ...themedCardStyle }}>
      <h2 style={styles.sectionTitleStyle}>{t.related}</h2>

      <div style={styles.relatedMenuRowStyle}>
        <select
          value={relatedPath}
          onChange={(e) => setRelatedPath(e.target.value)}
          style={themedInputStyle}
        >
          <option value="/dashboard/customers">{t.customers}</option>
          <option value="/dashboard/products">{t.products}</option>
          <option value="/dashboard/invoices">{t.invoices}</option>
        </select>

        <button
          type="button"
          onClick={goRelatedFeature}
          style={{
            ...styles.primaryBtnStyle,
            background: theme.accent,
            marginTop: 0,
          }}
        >
          {t.goFeature}
        </button>
      </div>
    </section>
  );
}