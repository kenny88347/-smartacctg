"use client";

import { CSSProperties } from "react";

type Props = {
  t: any;
  theme: any;
  categories: string[];
  newCategory: string;
  setNewCategory: (value: string) => void;
  addCategory: () => void;
  removeCategory: (value: string) => void;
  displayCategory: (value?: string | null) => string;
};

export default function CategoryTagManager({
  t,
  theme,
  categories,
  newCategory,
  setNewCategory,
  addCategory,
  removeCategory,
  displayCategory,
}: Props) {
  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    borderColor: theme.border,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
  };

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
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => removeCategory(cat)}
            style={{
              ...categoryChipStyle,
              borderColor: theme.border,
              color: theme.accent,
              background: theme.inputBg || "#fff",
            }}
          >
            {displayCategory(cat)} ×
          </button>
        ))}
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

const primaryBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 18px",
  minHeight: "var(--sa-control-h)",
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
