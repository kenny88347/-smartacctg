"use client";

import { CSSProperties, ReactNode } from "react";

type AppIconButtonProps = {
  children: ReactNode;
  title: string;
  onClick: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  onPointerCancel?: () => void;
};

type AppPinButtonProps = {
  pinned: boolean;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

type AppIconImageProps = {
  src: string;
  alt: string;
};

export function AppIconButton({
  children,
  title,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}: AppIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={title}
      className="app-main-icon"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      style={appIconButtonStyle}
    >
      {children}
    </button>
  );
}

export function AppPinButton({
  pinned,
  busy = false,
  disabled = false,
  onClick,
}: AppPinButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className="app-pin-dot"
      style={{
        ...appPinButtonStyle,
        background: pinned ? "#22c55e" : "#ecfeff",
        color: pinned ? "#ffffff" : "#0f766e",
        borderColor: pinned ? "#86efac" : "#2dd4bf",
        opacity: disabled || busy ? 0.7 : 1,
      }}
    >
      {busy ? "…" : pinned ? "✓" : "+"}
    </button>
  );
}

export function AppIconImage({ src, alt }: AppIconImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="app-icon-img"
      style={appIconImageStyle}
      onError={(e) => {
        const img = e.currentTarget;
        const current = img.getAttribute("src") || "";
        const tried = img.getAttribute("data-tried") || "";

        if (tried === "1") {
          img.style.display = "none";

          const parent = img.parentElement;
          if (parent) {
            parent.textContent = "📱";
            parent.style.fontSize = "30px";
          }

          return;
        }

        img.setAttribute("data-tried", "1");

        if (current.endsWith(".PNG")) {
          img.src = current.replace(/\.PNG$/i, ".png");
          return;
        }

        if (current.endsWith(".png")) {
          img.src = current.replace(/\.png$/i, ".PNG");
        }
      }}
    />
  );
}

const appIconButtonStyle: CSSProperties = {
  width: 70,
  height: 70,
  minWidth: 70,
  minHeight: 70,
  maxWidth: 70,
  maxHeight: 70,
  border: "none",
  borderRadius: 20,
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  padding: 0,
  margin: 0,
  boxShadow: "none",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
};

const appIconImageStyle: CSSProperties = {
  width: 70,
  height: 70,
  minWidth: 70,
  minHeight: 70,
  maxWidth: 70,
  maxHeight: 70,
  objectFit: "contain",
  borderRadius: 20,
  display: "block",
  background: "transparent",
};

const appPinButtonStyle: CSSProperties = {
  position: "absolute",
  top: -4,
  right: -4,
  width: 22,
  height: 22,
  minWidth: 22,
  minHeight: 22,
  maxWidth: 22,
  maxHeight: 22,
  padding: 0,
  margin: 0,
  borderRadius: 999,
  border: "1.6px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 900,
  lineHeight: 1,
  textAlign: "center",
  boxShadow: "0 5px 10px rgba(0,0,0,0.2)",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
};
