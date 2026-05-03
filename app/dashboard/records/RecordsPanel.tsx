"use client";

import { CSSProperties } from "react";
import type { Customer, TxnType, DebtItem } from "./types";
import { formatRM } from "./recordsShared";

type Props = {
  t: any;
  theme: any;
  themeSubText: string;
  title: string;
  activeMonthKey: string;
  yearOptions: string[];
  monthOptions: string[];
  currentYear: number;
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
  openNewForm: () => void;
  relatedPath: string;
  setRelatedPath: (value: string) => void;
  goRelatedFeature: () => void;
};

export default function RecordsPanel({
  t,
  theme,
  themeSubText,
  title,
  activeMonthKey,
  yearOptions,
  monthOptions,
  currentYear,
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
  openNewForm,
  relatedPath,
  setRelatedPath,
  goRelatedFeature,
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

  const themedCardStyle: CSSProperties = {
    background: theme.card,
    borderColor: theme.border,
    boxShadow: theme.glow,
    color: theme.text,
  };

  return (
    <>
      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <div style={recordHeaderStyle}>
          <h1 style={titleStyle}>{title}</h1>

          <button
            type="button"
            onClick={openNewForm}
            aria-label={t.add}
            style={{
              ...plusBtnStyle,
              background: theme.accent,
            }}
          >
            +
          </button>
        </div>

        <div style={summaryBoxStyle}>
          <div style={monthRowStyle}>
            <strong style={{ color: theme.text }}>
              {t.summaryMonth}: {activeMonthKey}
            </strong>

            <div className="records-month-select-grid" style={monthSelectGridStyle}>
              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.year}</label>
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

              <div style={dateWrapStyle}>
                <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.month}</label>
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

          <div style={summaryDividerStyle} />

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

          <div style={{ ...debtDetailStyle, color: "#dc2626" }}>
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

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <h2 style={sectionTitleStyle}>{t.searchTitle}</h2>

        <div style={responsiveGridStyle}>
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

          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.startDate}</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={themedDateInputStyle}
            />
          </div>

          <div style={dateWrapStyle}>
            <label style={{ ...dateLabelStyle, color: themeSubText }}>{t.endDate}</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={themedDateInputStyle}
            />
          </div>
        </div>
      </section>

      <section className="sa-card" style={{ ...cardStyle, ...themedCardStyle }}>
        <h2 style={sectionTitleStyle}>{t.related}</h2>

        <div style={relatedMenuRowStyle}>
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
              ...primaryBtnStyle,
              background: theme.accent,
              marginTop: 0,
            }}
          >
            {t.goFeature}
          </button>
        </div>
      </section>
    </>
  );
}

const cardStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  marginBottom: 14,
};

const recordHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl)",
  fontWeight: 900,
  lineHeight: 1.12,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: "var(--sa-fs-xl)",
  fontWeight: 900,
};

const plusBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  color: "#fff",
  border: "none",
  fontSize: 30,
  fontWeight: 900,
  lineHeight: 1,
  padding: 0,
};

const summaryBoxStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  marginTop: 8,
};

const monthRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 10,
  alignItems: "center",
};

const monthSelectGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  width: "100%",
};

const summaryDividerStyle: CSSProperties = {
  height: 1,
  width: "100%",
  background: "rgba(148, 163, 184, 0.38)",
};

const debtDetailStyle: CSSProperties = {
  marginTop: 2,
  paddingTop: 4,
  display: "grid",
  gap: 4,
  lineHeight: 1.35,
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

const relatedMenuRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
};

const dateWrapStyle: CSSProperties = {
  width: "100%",
};

const dateLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
};

const primaryBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
};
