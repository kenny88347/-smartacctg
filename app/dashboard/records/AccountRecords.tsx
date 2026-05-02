"use client";

import { CSSProperties } from "react";
import {
  Customer,
  DebtItem,
  Invoice,
  RecordsText,
  Txn,
  TxnType,
  displayRecordNote,
  formatRM,
  styles,
} from "./recordsShared";

type Props = {
  t: RecordsText;
  theme: any;
  themeSubText: string;
  activeMonthKey: string;
  currentYear: number;
  yearOptions: string[];
  monthOptions: string[];
  setSummaryMonth: (value: string) => void;

  summaryBalance: number;
  summaryIncome: number;
  summaryExpense: number;
  summaryProfit: number;
  totalCustomerDebt: number;
  nearestDebt: DebtItem | null;

  search: string;
  setSearch: (value: string) => void;
  filterType: "all" | TxnType;
  setFilterType: (value: "all" | TxnType) => void;
  filterCustomerId: string;
  setFilterCustomerId: (value: string) => void;
  filterStartDate: string;
  setFilterStartDate: (value: string) => void;
  filterEndDate: string;
  setFilterEndDate: (value: string) => void;

  customers: Customer[];
  filteredRecords: Txn[];
  getInvoice: (tx: Txn) => Invoice | null;
  isDebtRecord: (tx: Txn) => boolean;
  displayCategory: (value?: string | null) => string;

  openNewForm: () => void;
  editTransaction: (tx: Txn) => void;
  setDeleteTarget: (tx: Txn) => void;

  themedInputStyle: CSSProperties;
  themedDateInputStyle: CSSProperties;
  themedCardStyle: CSSProperties;
};

export default function AccountRecords({
  t,
  theme,
  themeSubText,
  activeMonthKey,
  currentYear,
  yearOptions,
  monthOptions,
  setSummaryMonth,
  summaryBalance,
  summaryIncome,
  summaryExpense,
  summaryProfit,
  totalCustomerDebt,
  nearestDebt,
  search,
  setSearch,
  filterType,
  setFilterType,
  filterCustomerId,
  setFilterCustomerId,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  customers,
  filteredRecords,
  getInvoice,
  isDebtRecord,
  displayCategory,
  openNewForm,
  editTransaction,
  setDeleteTarget,
  themedInputStyle,
  themedDateInputStyle,
  themedCardStyle,
}: Props) {
  return (
    <>
      <section className="sa-card" style={{ ...styles.cardStyle, ...themedCardStyle }}>
        <div style={styles.recordHeaderStyle}>
          <h1 style={styles.titleStyle}>{t.title}</h1>

          <button
            type="button"
            onClick={openNewForm}
            aria-label={t.add}
            style={{
              ...styles.plusBtnStyle,
              background: theme.accent,
            }}
          >
            +
          </button>
        </div>

        <div style={styles.summaryBoxStyle}>
          <div style={styles.monthRowStyle}>
            <strong style={{ color: theme.text }}>
              {t.summaryMonth}: {activeMonthKey}
            </strong>

            <div className="records-month-select-grid" style={styles.monthSelectGridStyle}>
              <div style={styles.dateWrapStyle}>
                <label style={{ ...styles.dateLabelStyle, color: themeSubText }}>{t.year}</label>
                <select
                  value={activeMonthKey.slice(0, 4)}
                  onChange={(e) => {
                    const nextYear = e.target.value;
                    const currentMonthValue = activeMonthKey.slice(5, 7) || "01";
                    setSummaryMonth(`${nextYear}-${currentMonthValue}`);
                  }}
                  style={themedInputStyle}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.dateWrapStyle}>
                <label style={{ ...styles.dateLabelStyle, color: themeSubText }}>{t.month}</label>
                <select
                  value={activeMonthKey.slice(5, 7)}
                  onChange={(e) => {
                    const currentYearValue = activeMonthKey.slice(0, 4) || String(currentYear);
                    setSummaryMonth(`${currentYearValue}-${e.target.value}`);
                  }}
                  style={themedInputStyle}
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={styles.summaryDividerStyle} />

          <div className="records-summary-line">
            <span>{t.balance}</span>
            <strong style={{ color: theme.accent }}>{formatRM(summaryBalance)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthIncome}</span>
            <strong style={{ color: "#16a34a" }}>{formatRM(summaryIncome)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthExpense}</span>
            <strong style={{ color: "#dc2626" }}>{formatRM(summaryExpense)}</strong>
          </div>

          <div className="records-summary-line">
            <span>{t.monthProfit}</span>
            <strong style={{ color: summaryProfit < 0 ? "#dc2626" : "#16a34a" }}>
              {formatRM(summaryProfit)}
            </strong>
          </div>

          <div className="records-summary-line">
            <span style={{ color: "#dc2626" }}>{t.customerDebt}</span>
            <strong style={{ color: "#dc2626" }}>{formatRM(totalCustomerDebt)}</strong>
          </div>

          <div style={{ ...styles.debtDetailStyle, color: "#dc2626" }}>
            {nearestDebt ? (
              <>
                <div>{nearestDebt.customerLabel}</div>
                <div>{formatRM(nearestDebt.amount)}</div>
                <div>
                  {t.dueDate}: {nearestDebt.dueDate}
                </div>
              </>
            ) : (
              <div>{t.noDebt}</div>
            )}
          </div>
        </div>
      </section>

      <section className="sa-card" style={{ ...styles.cardStyle, ...themedCardStyle }}>
        <h2 style={styles.sectionTitleStyle}>{t.searchTitle}</h2>

        <div style={styles.responsiveGridStyle}>
          <input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={themedInputStyle}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | TxnType)}
            style={themedInputStyle}
          >
            <option value="all">{t.all}</option>
            <option value="income">{t.income}</option>
            <option value="expense">{t.expense}</option>
          </select>

          <select
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
            style={themedInputStyle}
          >
            <option value="">{t.filterCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "-"}
              </option>
            ))}
          </select>

          <div style={styles.dateWrapStyle}>
            <label style={{ ...styles.dateLabelStyle, color: themeSubText }}>{t.startDate}</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={themedDateInputStyle}
            />
          </div>

          <div style={styles.dateWrapStyle}>
            <label style={{ ...styles.dateLabelStyle, color: themeSubText }}>{t.endDate}</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={themedDateInputStyle}
            />
          </div>
        </div>
      </section>

      <section className="sa-card" style={{ ...styles.cardStyle, ...themedCardStyle }}>
        {filteredRecords.length === 0 ? (
          <p style={{ color: themeSubText }}>{t.noRecord}</p>
        ) : (
          <div className="records-list" style={styles.recordListStyle}>
            {filteredRecords.map((tx) => {
              const invoice = getInvoice(tx);
              const isIncome = tx.txn_type === "income";
              const debtRecord = isDebtRecord(tx);

              return (
                <div
                  key={tx.id}
                  className={`record-card ${debtRecord ? "debt-record" : ""}`}
                  style={{
                    ...styles.recordCardStyle,
                    borderColor: debtRecord ? "#dc2626" : theme.border,
                    background: debtRecord ? "#fee2e2" : theme.itemBg || theme.card,
                    color: debtRecord ? "#7f1d1d" : theme.text,
                    boxShadow: debtRecord ? undefined : theme.glow,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={styles.recordTitleStyle}>
                      {isIncome ? t.income : t.expense} · {displayCategory(tx.category_name)}
                    </h3>

                    <p style={{ ...styles.mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                      {t.date}: {tx.txn_date} ｜ {t.amount}:{" "}
                      <strong style={{ color: isIncome ? "#16a34a" : "#dc2626" }}>
                        {formatRM(Number(tx.amount || 0))}
                      </strong>
                    </p>

                    {Number(tx.debt_amount || 0) > 0 ? (
                      <p style={{ ...styles.mutedStyle, color: "#dc2626" }}>
                        {t.debtAmount}: {formatRM(Number(tx.debt_amount || 0))}
                      </p>
                    ) : null}

                    {invoice ? (
                      <p style={{ ...styles.mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                        {t.sourceInvoice}: {invoice.invoice_no || invoice.id}{" "}
                        {invoice.customer_name ? `｜${invoice.customer_name}` : ""}
                      </p>
                    ) : (
                      <p style={{ ...styles.mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                        {t.manualRecord}
                      </p>
                    )}

                    {tx.note ? (
                      <p style={{ ...styles.mutedStyle, color: debtRecord ? "#7f1d1d" : themeSubText }}>
                        {t.note}: {displayRecordNote(tx.note, t)}
                      </p>
                    ) : null}
                  </div>

                  <div className="records-action-row" style={styles.actionRowStyle}>
                    <button
                      type="button"
                      onClick={() => editTransaction(tx)}
                      style={{
                        ...styles.actionBtnStyle,
                        background: theme.accent,
                      }}
                    >
                      {t.edit}
                    </button>

                    <button type="button" onClick={() => setDeleteTarget(tx)} style={styles.deleteBtnStyle}>
                      {t.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
