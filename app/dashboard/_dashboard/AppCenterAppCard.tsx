const pageStyle: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  padding: "clamp(12px, 3vw, 22px)",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
};

const topCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "clamp(16px, 4vw, 22px)",
};

const leftTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const avatarBtnStyle: CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: 999,
  border: "none",
  background: "#fff",
  fontSize: 24,
  overflow: "hidden",
  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  padding: 0,
};

const avatarImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarMenuStyle: CSSProperties = {
  position: "absolute",
  top: 62,
  left: 0,
  width: 250,
  background: "#fff",
  color: "#111827",
  borderRadius: 18,
  padding: 10,
  zIndex: 99999,
  boxShadow: "0 18px 46px rgba(0,0,0,0.28)",
  border: "1px solid rgba(15,23,42,0.1)",
};

const menuItemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  border: "none",
  background: "transparent",
  textAlign: "left",
  borderRadius: 10,
  color: "#111827",
  fontSize: 16,
};

const avatarLangBoxStyle: CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  marginTop: 8,
  paddingTop: 8,
};

const avatarLangTitleStyle: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 8,
};

const avatarLangBtnRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
};

const avatarLangBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  border: `2px solid ${theme.accent}`,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
  borderRadius: 999,
  minHeight: 38,
  padding: "0 8px",
});

const planTextStyle: CSSProperties = {
  lineHeight: 1.3,
  overflowWrap: "anywhere",
  fontSize: "clamp(15px, 3.8vw, 18px)",
};

const logoutBtnStyle: CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 14px",
  minHeight: "var(--sa-control-h)",
  whiteSpace: "nowrap",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(26px, 7vw, 36px)",
  lineHeight: 1.12,
  fontWeight: 900,
  letterSpacing: "-0.03em",
  overflowWrap: "anywhere",
};

const noticeWrapStyle: CSSProperties = {
  marginTop: 8,
  overflow: "hidden",
  width: "100%",
};

const noticeMarqueeStyle: CSSProperties = {
  display: "inline-block",
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  marginTop: 12,
  marginBottom: 12,
};

const summaryBoxStyle: CSSProperties = {
  minHeight: 0,
  padding: "clamp(12px, 3vw, 16px)",
  border: "var(--sa-border-w) solid",
  borderRadius: 22,
};

const summaryHeaderBtnStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  border: "none",
  background: "transparent",
  color: "inherit",
  padding: 0,
  minHeight: 0,
  fontSize: "clamp(20px, 5.2vw, 26px)",
  lineHeight: 1.12,
};

const smallMutedStyle: CSSProperties = {
  marginTop: 8,
  fontSize: "clamp(15px, 3.8vw, 17px)",
};

const summaryDetailListStyle: CSSProperties = {
  display: "grid",
  gap: 7,
  marginTop: 8,
};

const summaryRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
  lineHeight: 1.18,
};

const debtRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "start",
  lineHeight: 1.25,
};

const quickCardStyle: CSSProperties = {
  marginBottom: 12,
  padding: "clamp(12px, 3vw, 16px)",
  borderRadius: 22,
};

const quickHeaderBtnStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  border: "none",
  background: "transparent",
  color: "inherit",
  padding: 0,
  minHeight: 0,
  fontSize: "clamp(20px, 5.2vw, 26px)",
  lineHeight: 1.12,
};

const quickGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
  marginTop: 10,
};

const quickBtnStyle = (theme: any): CSSProperties => ({
  background: theme.inputBg || "#fff",
  border: `var(--sa-border-w) solid ${theme.border}`,
  color: theme.accent,
  borderRadius: 18,
  minHeight: 54,
  padding: "8px 10px",
  fontSize: "clamp(15px, 4vw, 17px)",
  lineHeight: 1.15,
  whiteSpace: "normal",
  textAlign: "center",
});

const appGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "18px 10px",
  width: "100%",
};

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

const appCenterIconStyle: CSSProperties = {
  width: 86,
  height: 86,
  minWidth: 86,
  minHeight: 86,
  borderRadius: 28,
  border: "2px solid rgba(94, 255, 239, 0.95)",
  background:
    "linear-gradient(145deg, #ccfffa 0%, #46f0df 34%, #10b8aa 62%, #06675e 100%)",
  boxShadow:
    "inset 0 4px 10px rgba(255,255,255,0.78), inset 0 -12px 22px rgba(0,0,0,0.22), 0 0 0 2px rgba(45,212,191,0.22), 0 16px 34px rgba(20,184,166,0.48)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 6,
  overflow: "hidden",
};

const appCenterLogoCircleStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: 24,
  background:
    "radial-gradient(circle at 32% 22%, #ffffff 0%, #d7fff9 18%, #8cf7ea 34%, #25d7c8 62%, #08756d 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  boxShadow:
    "inset 0 3px 8px rgba(255,255,255,0.8), inset 0 -9px 18px rgba(0,0,0,0.2), 0 5px 14px rgba(0,0,0,0.16)",
};

const appCenterLogoImgStyle: CSSProperties = {
  width: "88%",
  height: "88%",
  objectFit: "contain",
  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.28))",
};

const backBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-control)",
  padding: "0 var(--sa-control-x)",
  minHeight: "var(--sa-control-h)",
  marginBottom: 14,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0 var(--sa-control-x)",
  borderRadius: "var(--sa-radius-control)",
  border: "var(--sa-border-w) solid",
  minHeight: "var(--sa-control-h)",
  marginBottom: 12,
  fontSize: 16,
  background: "#fff",
  color: "#111827",
  outline: "none",
};

const primaryBtnStyle: CSSProperties = {
  border: "none",
  color: "#fff",
  padding: "0 18px",
  borderRadius: "var(--sa-radius-control)",
  minHeight: "var(--sa-control-h)",
  marginBottom: 16,
};

const modalTopStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(24px, 6vw, 34px)",
  fontWeight: 900,
  lineHeight: 1.15,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 12,
  fontSize: "clamp(20px, 5.2vw, 28px)",
  fontWeight: 900,
  lineHeight: 1.2,
};

const closeBtnStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: "var(--sa-fs-base)",
  padding: 8,
};

const modalLangRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const modalLangBtnStyle = (active: boolean, theme: any): CSSProperties => ({
  minHeight: "var(--sa-control-h)",
  borderRadius: "var(--sa-radius-control)",
  border: `var(--sa-border-w) solid ${theme.accent}`,
  background: active ? theme.accent : theme.inputBg || "#fff",
  color: active ? "#fff" : theme.accent,
});

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const themeBtnStyle: CSSProperties = {
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
  minHeight: 84,
  textAlign: "left",
};

const appCenterListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 16,
};

const appCenterTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(20px, 5.2vw, 28px)",
  fontWeight: 900,
  lineHeight: 1.2,
};

const deleteAppModalStyle: CSSProperties = {
  width: "min(92vw, 520px)",
  margin: "18vh auto 0",
  border: "var(--sa-border-w) solid",
  borderRadius: "var(--sa-radius-card)",
  padding: "var(--sa-card-pad)",
};

const deleteAppPreviewStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  textAlign: "center",
  gap: 12,
  marginTop: 18,
  marginBottom: 18,
};

const deleteAppActionRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 16,
};

const deleteAppConfirmBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "none",
  borderRadius: "var(--sa-radius-control)",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 900,
};

const deleteAppCancelBtnStyle: CSSProperties = {
  minHeight: "var(--sa-control-h)",
  border: "var(--sa-border-w) solid #cbd5e1",
  borderRadius: "var(--sa-radius-control)",
  background: "#fff",
  color: "#111827",
  fontWeight: 900,
};
