"use client";

import { CSSProperties, Dispatch, SetStateAction } from "react";
import CategoryManager from "./CategoryManager";
import LinkedInfoPanel from "./LinkedInfoPanel";
import {
  Customer,
  Invoice,
  Product,
  RecordFormState,
  RecordText,
  TxnType,
} from "../types";

type Props = {
  isFullscreen: boolean;
  editingId: string | null;
  form: RecordFormState;
  setForm: Dispatch<SetStateAction<RecordFormState>>;
  categories: string[];
  newCategory: string;
  setNewCategory: (value: string) => void;
  addCategory: () => void;
  removeCategory: (value: string) => void;
  displayCategory: (value?: string | null) => string;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  t: RecordText;
  theme: any;
  themeSubText: string;
  themedInputStyle: CSSProperties;
  themedDateInputStyle: CSSProperties;
  saveTransaction: () => void;
  closeForm: () => void;
};

export default function AddRecordForm({
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
  t,
  theme,
  themeSubText,
  themedInputStyle,
  themedDateInputStyle,
  saveTransaction,
  closeForm,
}: Props) {
  return (
    <div
      className={isFullscreen ? "records-fullscreen-overlay" : ""}
      style={isFullscreen ? {} : overlayStyle}
    >
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
            {categories.map((cat) => {
              const value = String(cat || "").trim();

              return (
                <option key={value} value={value}>
                  {displayCategory(value)}
                </option>
              );
            })}
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

        <CategoryManager
          categories={categories}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          addCategory={addCategory}
          removeCategory={removeCategory}
          displayCategory={displayCategory}
          t={t}
          theme={theme}
          themedInputStyle={themedInputStyle}
        />

        <LinkedInfoPanel
          form={form}
          setForm={setForm}
          customers={customers}
          products={products}
          invoices={invoices}
          t={t}
          themedInputStyle={themedInputStyle}
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
