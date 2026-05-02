"use client";

import { CSSProperties } from "react";
import { RecordsText, normalizeCategory, styles } from "./recordsShared";

type Props = {
  t: RecordsText;
  theme: any;
  categories: string[];
  newCategory: string;
  setNewCategory: (value: string) => void;
  addCategory: () => void;
  removeCategory: (value: string) => void;
  displayCategory: (value?: string | null) => string;
  themedInputStyle: CSSProperties;
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
  themedInputStyle,
}: Props) {
  return (
    <>
      <h3 style={styles.sectionTitleStyle}>{t.addCategory}</h3>

      <div style={styles.categoryAddRowStyle}>
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
            ...styles.primaryBtnStyle,
            background: theme.accent,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          +
        </button>
      </div>

      <div style={styles.categoryChipWrapStyle}>
        {categories.map((cat) => {
          const value = normalizeCategory(cat);

          return (
            <button
              key={value}
              type="button"
              onClick={() => removeCategory(value)}
              style={{
                ...styles.categoryChipStyle,
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