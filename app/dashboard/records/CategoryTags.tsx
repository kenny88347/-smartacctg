"use client";

import { CSSProperties } from "react";

type Props = {
  t?: any;
  theme?: any;
  categories?: string[];
  categoryOptions?: string[];
  newCategory?: string;
  setNewCategory?: (value: string) => void;
  onAddCategory?: () => void;
  addCategory?: () => void;
  onRemoveCategory?: (value: string) => void;
  removeCategory?: (value: string) => void;
  displayCategory?: (value: string) => string;
  inputStyle?: CSSProperties;
  primaryBtnStyle?: CSSProperties;
  chipStyle?: CSSProperties;
  [key: string]: any;
};

export default function CategoryTagManager(props: Props) {
  const t = props.t || {};
  const theme = props.theme || {};

  const categories = props.categories || props.categoryOptions || [];
  const newCategory = props.newCategory || "";
  const setNewCategory = props.setNewCategory || (() => {});
  const addCategory = props.onAddCategory || props.addCategory || (() => {});
  const removeCategory = props.onRemoveCategory || props.removeCategory || (() => {});
  const displayCategory = props.displayCategory || ((value: string) => value);

  const inputStyle: CSSProperties = {
    width: "100%",
    minHeight: "var(--sa-control-h, 54px)",
    borderRadius: "var(--sa-radius-control, 16px)",
    border: `var(--sa-border-w, 2px) solid ${theme.border || "#cbd5e1"}`,
    background: theme.inputBg || "#ffffff",
    color: theme.inputText || "#111827",
    padding: "0 var(--sa-control-x, 16px)",
    fontSize: 16,
    outline: "none",
    ...props.inputStyle,
  };

  const addBtnStyle: CSSProperties = {
    minHeight: "var(--sa-control-h, 54px)",
    minWidth: 58,
    border: "none",
    borderRadius: "var(--sa-radius-control, 16px)",
    background: theme.accent || "#0f766e",
    color: "#fff",
    fontSize: 24,
    fontWeight: 900,
    ...props.primaryBtnStyle,
  };

  const chipStyle: CSSProperties = {
    minHeight: 38,
    borderRadius: 999,
    border: `var(--sa-border-w, 2px) solid ${theme.border || "#cbd5e1"}`,
    background: theme.inputBg || "#ffffff",
    color: theme.accent || "#0f766e",
    padding: "0 12px",
    fontWeight: 800,
    ...props.chipStyle,
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder={t.categoryName || t.addCategory || "Category Name"}
          style={inputStyle}
        />

        <button type="button" onClick={addCategory} style={addBtnStyle}>
          +
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => removeCategory(cat)}
            style={chipStyle}
          >
            {displayCategory(cat)} ×
          </button>
        ))}
      </div>
    </div>
  );
}
