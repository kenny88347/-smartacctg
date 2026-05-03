"use client";

import { CSSProperties } from "react";

type Props = {
  title?: string;
  categories?: string[];
  onAdd?: (value: string) => void;
  onRemove?: (value: string) => void;
};

export default function CategoryTags({
  title = "Categories",
  categories = [],
}: Props) {
  const wrapStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  };

  const chipStyle: CSSProperties = {
    border: "1px solid #14b8a6",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#ecfeff",
    color: "#0f766e",
    fontWeight: 800,
  };

  return (
    <div>
      <h3>{title}</h3>
      <div style={wrapStyle}>
        {categories.map((cat) => (
          <span key={cat} style={chipStyle}>
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
