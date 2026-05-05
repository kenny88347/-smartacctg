"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import type { AppRegistry, Lang } from "./types";
import { appDescription, appTitle, isImageIcon } from "./utils";

type AppCenterAppCardProps = {
  app: AppRegistry;
  lang: Lang;
  theme: any;
  pinned: boolean;
  openText: string;
  addText: string;
  removeText: string;
  onOpen: (app: AppRegistry) => void;
  onTogglePinned: (app: AppRegistry, pinned: boolean) => Promise<void> | void;
};

export default function AppCenterAppCard({
  app,
  lang,
  theme,
  pinned,
  openText,
  addText,
  removeText,
  onOpen,
  onTogglePinned,
}: AppCenterAppCardProps) {
  const [localPinned, setLocalPinned] = useState(Boolean(pinned));
  const [busy, setBusy] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    setLocalPinned(Boolean(pinned));
  }, [pinned]);

  const desc = appDescription(app, lang);

  function stopEvent(e: any) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
  }

  function unlockSoon() {
    window.setTimeout(() => {
      lockRef.current = false;
    }, 500);
  }

  function handleOpen(e: any) {
    stopEvent(e);

    if (lockRef.current) return;

    lockRef.current = true;
    unlockSoon();

    onOpen(app);
  }

  async function handleToggle(e: any) {
    stopEvent(e);

    if (busy) return;
    if (lockRef.current) return;

    lockRef.current = true;
    unlockSoon();

    const nextPinned = !localPinned;

    setLocalPinned(nextPinned);
    setBusy(true);

    try {
      await onTogglePinned(app, nextPinned);
    } catch (err) {
      console.warn("[AppCenterAppCard] toggle failed:", err);
      setLocalPinned(!nextPinned);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        ...appCenterCardStyle,
        borderColor: theme.border,
        background: theme.panelBg || theme.card,
        color: theme.panelText || theme.text,
      }}
    >
      <button
        type="button"
        onClick={handleOpen}
        onPointerDown={handleOpen}
        style={phoneAppIconStyle(theme)}
      >
        {isImageIcon(app.icon) ? (
          <img src={app.icon || ""} alt={appTitle(app, lang)} style={appImgStyle} />
        ) : (
          <span style={appEmojiStyle}>{app.icon || "📱"}</span>
        )}
      </button>

      <div style={{ minWidth: 0 }}>
        <h2 style={appCenterTitleStyle}>{appTitle(app, lang)}</h2>

        {desc ? (
          <p
            style={{
              margin: "6px 0 0",
              color: theme.muted || theme.subText || "#64748b",
            }}
          >
            {desc}
          </p>
        ) : null}
      </div>

      <div style={appCenterActionStyle}>
        <button
          type="button"
          onClick={handleOpen}
          onPointerDown={handleOpen}
          style={{
            ...appCenterSmallBtnStyle,
            background: theme.accent,
            color: "#fff",
            opacity: busy ? 0.75 : 1,
          }}
        >
          {openText}
        </button>

        <button
          type="button"
          onClick={handleToggle}
          onPointerDown={handleToggle}
          disabled={busy}
          style={
            localPinned
              ? {
                  ...appCenterRemoveBtnStyle,
                  opacity: busy ? 0.75 : 1,
                }
              : {
                  ...appCenterSmallBtnStyle,
                  borderColor: theme.border,
                  color: theme.accent,
                  background: theme.inputBg || "#fff",
                  opacity: busy ? 0.75 : 1,
                }
          }
        >
          {busy ? "..." : localPinned ? removeText : addText}
        </button>
      </div>
    </div>
  );
}

const phoneAppIconStyle = (theme: any): CSSProperties => ({
  width: 76,
  height: 76,
  minWidth: 76,
  minHeight: 76,
  borderRadius: 22,
  border: `2px solid ${theme.border}`,
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.72))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 22px rgba(15,23,42,0.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  overflow: "hidden",
  cursor: "pointer",
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
  position: "relative",
  zIndex: 10,
});

const appImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const appEmojiStyle: CSSProperties = {
  fontSize: 34,
  lineHeight: 1,
};

const appCenterCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  gap: 14,
  alignItems: "center",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  position: "relative",
  zIndex: 1,
};

const appCenterTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(20px, 5.2vw, 28px)",
  fontWeight: 900,
  lineHeight: 1.2,
};

const appCenterActionStyle: CSSProperties = {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  position: "relative",
  zIndex: 20,
};

const appCenterSmallBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid transparent",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 12px",
  fontWeight: 900,
  cursor: "pointer",
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
  position: "relative",
  zIndex: 30,
};

const appCenterRemoveBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid #fecaca",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 12px",
  fontWeight: 900,
  background: "#fff",
  color: "#dc2626",
  cursor: "pointer",
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
  position: "relative",
  zIndex: 30,
};
