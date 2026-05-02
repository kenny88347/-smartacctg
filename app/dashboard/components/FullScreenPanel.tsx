"use client";

import { CSSProperties, ReactNode, useEffect } from "react";

type FullScreenPanelProps = {
  open: boolean;
  title: string;
  closeText: string;
  onClose: () => void;
  children: ReactNode;
  theme?: any;
  footer?: ReactNode;
};

export default function FullScreenPanel({
  open,
  title,
  closeText,
  onClose,
  children,
  theme,
  footer,
}: FullScreenPanelProps) {
  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);

  if (!open) return null;

  const accent = theme?.accent || "#0f766e";
  const card = theme?.card || "#ffffff";
  const text = theme?.text || "#111827";
  const border = theme?.border || "#14b8a6";
  const glow = theme?.glow || "0 18px 42px rgba(15,118,110,0.18)";

  return (
    <div className="sa-fullscreen-overlay" style={overlayStyle}>
      <section
        className="sa-card sa-fullscreen-modal"
        style={{
          ...panelStyle,
          background: card,
          color: text,
          borderColor: border,
          boxShadow: glow,
        }}
      >
        <div className="sa-modal-top" style={{ ...topStyle, background: card }}>
          <h1 style={{ ...titleStyle, color: accent }}>{title}</h1>

          <button type="button" onClick={onClose} style={closeBtnStyle}>
            {closeText}
          </button>
        </div>

        <div style={bodyStyle}>{children}</div>

        {footer ? <div style={footerStyle}>{footer}</div> : null}
      </section>
    </div>
  );
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  width: "100vw",
  height: "100dvh",
  overflow: "hidden",
  background: "rgba(15, 23, 42, 0.58)",
  padding: 0,
};

const panelStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  maxWidth: "100vw",
  height: "100dvh",
  minHeight: "100dvh",
  maxHeight: "100dvh",
  margin: 0,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 0,
  border: "none",
  padding:
    "max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom))",
  boxSizing: "border-box",
};

const topStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  paddingBottom: 12,
  marginBottom: 12,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-2xl, 30px)",
  lineHeight: 1.15,
  fontWeight: 900,
  overflowWrap: "anywhere",
};

const closeBtnStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: "var(--sa-fs-base, 16px)",
  fontWeight: 900,
  padding: "8px 4px",
  whiteSpace: "nowrap",
};

const bodyStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
};

const footerStyle: CSSProperties = {
  marginTop: 18,
};