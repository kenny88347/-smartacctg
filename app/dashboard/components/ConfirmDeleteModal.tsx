"use client";

import { CSSProperties, ReactNode } from "react";

type ConfirmDeleteModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
  theme?: any;
};

export default function ConfirmDeleteModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  children,
  theme,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <section
        className="sa-card"
        style={{
          ...modalStyle,
          background: theme?.card || "#ffffff",
          color: theme?.text || "#111827",
          borderColor: theme?.border || "#14b8a6",
          boxShadow: theme?.glow || "0 18px 42px rgba(15,118,110,0.18)",
        }}
      >
        <h2 style={titleStyle}>{title}</h2>

        {children ? <div style={infoBoxStyle}>{children}</div> : null}

        <p style={messageStyle}>{message}</p>

        <div style={actionRowStyle}>
          <button type="button" onClick={onConfirm} style={confirmBtnStyle}>
            {confirmText}
          </button>

          <button type="button" onClick={onCancel} style={cancelBtnStyle}>
            {cancelText}
          </button>
        </div>
      </section>
    </div>
  );
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(15, 23, 42, 0.58)",
  padding: "clamp(12px, 3vw, 24px)",
  overflowY: "auto",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 680,
  margin: "0 auto",
  border: "var(--sa-border-w, 2px) solid",
  borderRadius: "var(--sa-radius-card, 26px)",
  padding: "var(--sa-card-pad, 20px)",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--sa-fs-xl, 24px)",
  fontWeight: 900,
};

const infoBoxStyle: CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.55)",
  borderRadius: 18,
  padding: 14,
  marginTop: 14,
  marginBottom: 14,
  overflowWrap: "anywhere",
};

const messageStyle: CSSProperties = {
  color: "#dc2626",
  fontWeight: 900,
  marginTop: 14,
};

const actionRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 16,
};

const confirmBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h, 54px)",
  border: "none",
  borderRadius: "var(--sa-radius-control, 16px)",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 900,
};

const cancelBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h, 54px)",
  border: "var(--sa-border-w, 2px) solid #cbd5e1",
  borderRadius: "var(--sa-radius-control, 16px)",
  background: "#fff",
  color: "#111827",
  fontWeight: 900,
};