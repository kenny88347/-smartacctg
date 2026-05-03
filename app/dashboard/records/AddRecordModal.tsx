"use client";

import { CSSProperties } from "react";
import CategoryTagManager from "./CategoryTagManager";
import { LinkedDataForm } from "./LinkedDataPanel";
import {
  Customer,
  Invoice,
  Product,
  RecordFormState,
  RecordsText,
  TxnType,
  normalizeCategory,
  styles,
} from "./recordsShared";

type Props = {
  showForm: boolean;
  isFullscreen: boolean;
  editingId: string | null;
  t: RecordsText;
  theme: any;
  themeSubText: string;

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

  themedInputStyle: CSSProperties;
  themedDateInputStyle: CSSProperties;
};

export default function AddRecordModal({
  showForm,
  isFullscreen,
  editingId,
  t,
  theme,
  themeSubText,
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
  themedInputStyle,
  themedDateInputStyle,
}: Props) {
  if (!showForm) return null;

  return (
    <div className={isFullscreen ? "records-fullscreen-overlay" : ""} style={isFullscreen ? {} : styles.overlayStyle}>
      <section
        className={`sa-modal ${isFullscreen ? "records-fullscreen-modal" : ""}`}
        style={{
          ...styles.modalStyle,
          background: theme.card,
          borderColor: theme.border,
          boxShadow: theme.glow,
          color: theme.text,
        }}
      >
        <div className="records-modal-header" style={styles.modalHeaderStyle}>
          <h2 style={styles.modalTitleStyle}>{editingId ? t.update : t.add}</h2>

          <button type="button" onClick={closeForm} style={styles.closeBtnStyle}>
            {t.close}
          </button>
        </div>

        <div style={styles.responsiveGridStyle}>
          <div style={styles.dateWrapStyle}>
            <label style={{ ...styles.dateLabelStyle, color: themeSubText }}>{t.date}</label>
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
              const value = normalizeCategory(cat);

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

        <CategoryTagManager
          t={t}
          theme={theme}
          categories={categories}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          addCategory={addCategory}
          removeCategory={removeCategory}
          displayCategory={displayCategory}
          themedInputStyle={themedInputStyle}
        />

        <LinkedDataForm
          t={t}
          themeSubText={themeSubText}
          form={form}
          setForm={setForm}
          customers={customers}
          products={products}
          invoices={invoices}
          themedInputStyle={themedInputStyle}
        />

        <div style={styles.modalActionRowStyle}>
          <button
            type="button"
            onClick={saveTransaction}
            style={{
              ...styles.primaryBtnStyle,
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
              ...styles.secondaryBtnStyle,
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
