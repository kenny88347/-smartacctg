"use client";

import { CSSProperties } from "react";
import { RecordText, normalizeCategory } from "../types";

type Props = {
  categories: string[];
  newCategory: string;
  setNewCategory: (value: string) => void;
  addCategory: () => void;
  removeCategory: (value: string) => void;
  displayCategory: (value?: string | null) => string;
  t: RecordText;
  theme: any;
  themedInputStyle: CSSProperties;
};

export default function CategoryManager({
  categories,
  newCategory,
  setNewCategory,
  addCategory,
  removeCategory,
  displayCategory,
  t,
  theme,
  themedInputStyle,
}: Props) {
  return (
    <>
      <h3 style={sectionTitleStyle}>{t.addCategory}</h3>

      <div style={categoryAddRowStyle}>
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder={t.categoryName}
          style={{ ...themedInputStyle, marginBottom: 0 }}
        />

        <button
          type="button"
          onClick={addCategory}
          style={{
            ...primaryBtnStyle,
            background: theme.accent,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          +
        </button>
      </div>

      <div style={categoryChipWrapStyle}>
        {categories.map((cat) => {
          const value = normalizeCategory(cat);

          return (
            <button
              key={value}
              type="button"
              onClick={() => removeCategory(value)}
              style={{
                ...categoryChipStyle,
                borderColor: theme.border,
                color: theme.accent,
                background: theme.inputBg || "#fff",
              }}
            >
              {displayCategory(value)} ×
            </button>
          );
        })}
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

const categoryAddRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
};

const categoryChipWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
  marginBottom: 16,
};

const categoryChipStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: 999,
  minHeight: 38,
  padding: "0 12px",
};

const primaryBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
};
