"use client";

import { CSSProperties } from "react";
import type { Customer, Product, Invoice, RecordFormState, TxnType } from "./types";
import CategoryTagManager from "./CategoryTagManager";
import LinkedDataForm from "./LinkedDataForm";

type Props = {
  t: any;
  theme: any;
  themeSubText: string;
  isFullscreen: boolean;
  editingId: string | null;
  form: RecordFormState;
  setForm: (form: RecordFormState) => void;
  categories: string[];
  newCategory: string;
  setNewCategory: (value: string) => void;
  addCategory: () => void;
  removeCategory: (value: string) => void;
  displayCategory: (value?: string | null) => string;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  saveTransaction: () => void;
  closeForm: () => void;
};

export default function AddRecordModal({
  t,
  theme,
  themeSubText,
  isFullscreen,
  editingId,
  form,
  setForm,
  categories,
  newCategory,
  setNewCategory,
  addCategory,
  removeCategory,
  displayCategory,
  customers,
  products,
  invoices,
  saveTransaction,
  closeForm,
}: Props) {
  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  const themedDateInputStyle: CSSProperties = {
    ...dateInputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

  return (
    <div className={isFullscreen ? "records-fullscreen-overlay" : ""} style={isFullscreen ? {} : overlayStyle}>
      <section
        className={`sa-modal ${isFullscreen ? "records-fullscreen-modal" : ""}`}
        style={{
          ...modalStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div className="records-modal-header" style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>{editingId ? t.update : t.add}</h2>

          <button type="button" onClick={closeForm} style={closeBtnStyle}>
            {t.close}
          </button>
        </div>

        <div style={responsiveGridStyle}>
          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.date}</label>
            <input
              type="date"
              value={form.txn_date}
              onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
              style={themedDateInputStyle}
            />
          </div>

          <select
            value={form.txn_type}
            onChange={(e) => setForm({ ...form, txn_type: e.target.value as TxnType })}
            style={themedInputStyle}
          >
            <option value="income">{t.income}</option>
            <option value="expense">{t.expense}</option>
          </select>

          <input
            placeholder={t.amount}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={themedInputStyle}
            inputMode="decimal"
          />

          <select
            value={form.category_name}
            onChange={(e) => setForm({ ...form, category_name: e.target.value })}
            style={themedInputStyle}
          >
            <option value="">{t.category}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {displayCategory(cat)}
              </option>
            ))}
          </select>

          <input
            placeholder={t.debtAmount}
            value={form.debt_amount}
            onChange={(e) => setForm({ ...form, debt_amount: e.target.value })}
            style={themedInputStyle}
            inputMode="decimal"
          />

          <input
            placeholder={t.note}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            style={themedInputStyle}
          />
        </div>

        <CategoryTagManager
          t={t}
          theme={theme}
          categories={categories}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          addCategory={addCategory}
          removeCategory={removeCategory}
          displayCategory={displayCategory}
        />

        <LinkedDataForm
          t={t}
          theme={theme}
          form={form}
          setForm={setForm}
          customers={customers}
          products={products}
          invoices={invoices}
        />

        <div style={modalActionRowStyle}>
          <button
            type="button"
            onClick={saveTransaction}
            style={{
              ...primaryBtnStyle,
              background: theme.accent,
              marginTop: 0,
            }}
          >
            {editingId ? t.update : t.save}
          </button>

          <button
            type="button"
            onClick={closeForm}
            style={{
              ...secondaryBtnStyle,
              borderColor: theme.border,
              color: theme.accent,
              background: theme.inputBg || "#ffffff",
              marginTop: 0,
            }}
          >
            {t.cancel}
          </button>
        </div>
      </section>
    </div>
  );
}

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

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  textAlign: "center",
  textAlignLast: "center" as any,
  display: "block",
  lineHeight: "var(--sa-control-h)",
  paddingTop: 0,
  paddingBottom: 0,
};

const responsiveGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
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
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const modalHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
};

const closeBtnStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: "var(--sa-fs-base)",
  padding: 8,
};

const dateWrapStyle: CSSProperties = {
  width: "100%",
};

const dateLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
};

const modalActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 18,
  flexWrap: "wrap",
};

const primaryBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
};

const secondaryBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
};
