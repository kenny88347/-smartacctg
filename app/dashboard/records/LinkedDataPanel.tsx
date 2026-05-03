"use client";

import { CSSProperties } from "react";

type Props = {
  title?: string;
  children?: React.ReactNode;
};

export default function LinkedDataPanel({
  title = "Linked Data",
  children,
}: Props) {
  const boxStyle: CSSProperties = {
    border: "1px solid #14b8a6",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    background: "rgba(20, 184, 166, 0.08)",
  };

  return (
    <section style={boxStyle}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children || <p style={{ marginBottom: 0 }}>No linked data</p>}
    </section>
  );
}
