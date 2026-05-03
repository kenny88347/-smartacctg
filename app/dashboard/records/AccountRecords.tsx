"use client";

import { CSSProperties } from "react";
import type { Txn, Invoice } from "./types";
import { formatRM } from "./recordsShared";

type Props = {
  t: any;
  theme: any;
  themeSubText: string;
  filteredRecords: Txn[];
  getInvoice: (tx: Txn) => Invoice | null;
  isDebtRecord: (tx: Txn) => boolean;
  displayCategory: (value?: string | null) => string;
  editTransaction: (tx: Txn) => void;
  setDeleteTarget: (tx: Txn) => void;
};

export default function AccountRecords({
  t,
  theme,
  themeSubText,
  filteredRecords,
  getInvoice,
  isDebtRecord,
  displayCategory,
  editTransaction,
  setDeleteTarget,
}: Props) {
  if (filteredRecords.length === 0) {
    return (
      <section className="sa-card" style={{ ...cardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow, color: theme.text }}>
        <p style={{ color: themeSubText }}>{t.noRecord}</p>
      </section>
    );
  }

  return (
    <section className="sa-card" style={{ ...cardStyle, background: theme.card, borderColor: theme.border, boxShadow: theme.glow, color: theme.text }}>
      <div className="records-list" style={recordListStyle}>
        {filteredRecords.map((tx) => {
          const invoice = getInvoice(tx);
          const isIncome = tx.txn_type === "income";
          const debtRecord = isDebtRecord(tx);

          return (
            <div
              key={tx.id}
              className={`record-card ${debtRecord ? "debt-record" : ""}`}
              style={{
                ...recordCardStyle,
                borderColor: debtRecord ? "#dc2626" : theme.border,
                background: debtRecord ? "#fee2e2" : theme.itemBg || theme.card,
                color: debtRecord ? "#7f1d1d" : theme.text,
                boxShadow: debtRecord ? undefined : theme.glow,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h3 style={recordTitleStyle}>
                  {isIncome ? t.income : t.expense} · {displayCategory(tx.category_name)}
                </h3>

                <p style={{ ...mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                  {t.date}: {tx.txn_date} ｜ {t.amount}:{" "}
                  <strong style={{ color: isIncome ? "#16a34a" : "#dc2626" }}>
                    {formatRM(Number(tx.amount || 0))}
                  </strong>
                </p>

                {Number(tx.debt_amount || 0) > 0 ? (
                  <p style={{ ...mutedStyle, color: "#dc2626" }}>
                    {t.debtAmount}: {formatRM(Number(tx.debt_amount || 0))}
                  </p>
                ) : null}

                {invoice ? (
                  <p style={{ ...mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                    {t.sourceInvoice}: {invoice.invoice_no || invoice.id}
                    {invoice.customer_name ? `｜${invoice.customer_name}` : ""}
                  </p>
                ) : (
                  <p style={{ ...mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                    {t.manualRecord}
                  </p>
                )}

                {tx.note ? (
                  <p style={{ ...mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                    {t.note}: {tx.note}
                  </p>
                ) : null}
              </div>

              <div className="records-action-row" style={actionRowStyle}>
                <button
                  type="button"
                  onClick={() => editTransaction(tx)}
                  style={{
                    ...actionBtnStyle,
                    background: theme.accent,
                  }}
                >
                  {t.edit}
                </button>

                <button type="button" onClick={() => setDeleteTarget(tx)} style={deleteBtnStyle}>
                  {t.delete}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const cardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  marginBottom: 14,
};

const recordListStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 18,
  width: "100%",
};

const recordCardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 14,
  width: "100%",
  minWidth: 0,
  height: "auto",
  minHeight: "auto",
  overflowWrap: "anywhere",
};

const recordTitleStyle: CSSProperties = {
  margin: 0,
  overflowWrap: "anywhere",
  fontSize: "var(--sa-fs-lg)",
  fontWeight: 900,
};

const mutedStyle: CSSProperties = {
  overflowWrap: "anywhere",
  lineHeight: 1.55,
  margin: "8px 0 0",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "wrap",
};

const actionBtnStyle: CSSProperties = {
  minWidth: 104,
  minHeight: 44,
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
};

const deleteBtnStyle: CSSProperties = {
  minWidth: 104,
  minHeight: 44,
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
};
