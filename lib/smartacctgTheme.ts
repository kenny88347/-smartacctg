export type ThemeKey =
  | "deepTeal"
  | "pink"
  | "blackGold"
  | "lightRed"
  | "nature"
  | "sky"
  | "futureForest";

export const THEME_KEY = "smartacctg_theme";

export type SmartAcctgTheme = {
  name: string;

  pageBg: string;
  banner: string;
  card: string;

  panelBg: string;
  itemBg: string;
  itemCard: string;
  itemText: string;

  inputBg: string;
  inputText: string;

  border: string;
  glow: string;
  accent: string;
  text: string;
  panelText: string;

  muted: string;
  subText: string;

  soft: string;
  softBg: string;
};

export const THEMES: Record<ThemeKey, SmartAcctgTheme> = {
  deepTeal: {
    name: "深青色",
    pageBg: "#ecfdf5",
    banner: "#ffffff",
    card: "#ffffff",

    panelBg: "#f8fafc",
    itemBg: "#f8fafc",
    itemCard: "#ffffff",
    itemText: "#064e3b",

    inputBg: "#ffffff",
    inputText: "#111827",

    border: "#14b8a6",
    glow:
      "0 0 0 1px rgba(20,184,166,0.42), 0 0 18px rgba(45,212,191,0.55), 0 18px 42px rgba(15,118,110,0.25)",
    accent: "#0f766e",
    text: "#064e3b",
    panelText: "#111827",

    muted: "#64748b",
    subText: "#64748b",

    soft: "#ccfbf1",
    softBg: "#ccfbf1",
  },

  pink: {
    name: "可爱粉色",
    pageBg: "#fff7fb",
    banner: "linear-gradient(135deg,#ffd6e7,#fff1f2)",
    card: "#ffffff",

    panelBg: "#fdf2f8",
    itemBg: "#fdf2f8",
    itemCard: "#ffffff",
    itemText: "#4a044e",

    inputBg: "#ffffff",
    inputText: "#111827",

    border: "#f472b6",
    glow:
      "0 0 0 1px rgba(244,114,182,0.36), 0 0 18px rgba(244,114,182,0.45), 0 18px 38px rgba(244,114,182,0.22)",
    accent: "#db2777",
    text: "#4a044e",
    panelText: "#111827",

    muted: "#64748b",
    subText: "#831843",

    soft: "#fce7f3",
    softBg: "#fce7f3",
  },

  blackGold: {
    name: "黑金商务",
    pageBg: "#111111",
    banner: "linear-gradient(135deg,#111111,#3b2f16)",
    card: "#1f1f1f",

    panelBg: "#2a2a2a",
    itemBg: "#2a2a2a",
    itemCard: "#ffffff",
    itemText: "#111827",

    inputBg: "#ffffff",
    inputText: "#111827",

    border: "#facc15",
    glow:
      "0 0 0 1px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.45), 0 18px 42px rgba(250,204,21,0.22)",
    accent: "#d4af37",
    text: "#fff7ed",
    panelText: "#fff7ed",

    muted: "#fef3c7",
    subText: "#d6c8a4",

    soft: "#2a2112",
    softBg: "#3b2f16",
  },

  lightRed: {
    name: "可爱浅红",
    pageBg: "#fff1f2",
    banner: "linear-gradient(135deg,#fecdd3,#ffe4e6)",
    card: "#ffffff",

    panelBg: "#fff1f2",
    itemBg: "#fff1f2",
    itemCard: "#ffffff",
    itemText: "#881337",

    inputBg: "#ffffff",
    inputText: "#111827",

    border: "#fb7185",
    glow:
      "0 0 0 1px rgba(251,113,133,0.45), 0 0 20px rgba(251,113,133,0.5), 0 18px 38px rgba(251,113,133,0.26)",
    accent: "#e11d48",
    text: "#881337",
    panelText: "#111827",

    muted: "#64748b",
    subText: "#9f1239",

    soft: "#ffe4e6",
    softBg: "#ffe4e6",
  },

  nature: {
    name: "风景自然系",
    pageBg: "#f0fdf4",
    banner: "linear-gradient(135deg,#d9f99d,#bae6fd)",
    card: "#ffffff",

    panelBg: "#f8fafc",
    itemBg: "#f8fafc",
    itemCard: "#ffffff",
    itemText: "#14532d",

    inputBg: "#ffffff",
    inputText: "#111827",

    border: "#22d3ee",
    glow:
      "0 0 0 1px rgba(34,211,238,0.42), 0 0 18px rgba(34,211,238,0.42), 0 18px 38px rgba(34,211,238,0.22)",
    accent: "#0f766e",
    text: "#14532d",
    panelText: "#111827",

    muted: "#64748b",
    subText: "#166534",

    soft: "#dcfce7",
    softBg: "#dcfce7",
  },

  sky: {
    name: "天空蓝",
    pageBg: "#eff6ff",
    banner: "linear-gradient(135deg,#bfdbfe,#e0f2fe)",
    card: "#ffffff",

    panelBg: "#f8fafc",
    itemBg: "#f8fafc",
    itemCard: "#ffffff",
    itemText: "#0f172a",

    inputBg: "#ffffff",
    inputText: "#111827",

    border: "#38bdf8",
    glow:
      "0 0 0 1px rgba(56,189,248,0.42), 0 0 18px rgba(56,189,248,0.48), 0 18px 38px rgba(56,189,248,0.24)",
    accent: "#0284c7",
    text: "#0f172a",
    panelText: "#111827",

    muted: "#64748b",
    subText: "#0369a1",

    soft: "#dbeafe",
    softBg: "#dbeafe",
  },

  futureForest: {
    name: "未来世界｜深林青色",
    pageBg:
      "radial-gradient(circle at 8% 0%, rgba(45,212,191,0.32), transparent 30%), radial-gradient(circle at 92% 8%, rgba(20,184,166,0.22), transparent 32%), linear-gradient(135deg,#011c1a 0%,#032b29 38%,#064e3b 100%)",
    banner:
      "linear-gradient(135deg, rgba(1,28,26,0.98), rgba(6,78,59,0.96)), radial-gradient(circle at top right, rgba(45,212,191,0.32), transparent 34%)",
    card: "rgba(6,47,42,0.94)",

    panelBg: "rgba(8,64,57,0.92)",
    itemBg: "rgba(8,64,57,0.92)",
    itemCard: "rgba(6,47,42,0.94)",
    itemText: "#ecfeff",

    inputBg: "#ecfeff",
    inputText: "#042f2e",

    border: "#2dd4bf",
    glow:
      "0 0 0 1px rgba(45,212,191,0.55), 0 0 26px rgba(45,212,191,0.42), 0 22px 58px rgba(6,78,59,0.62)",
    accent: "#2dd4bf",
    text: "#ecfeff",
    panelText: "#ecfeff",

    muted: "#99f6e4",
    subText: "#99f6e4",

    soft: "rgba(20,184,166,0.22)",
    softBg: "rgba(20,184,166,0.22)",
  },
};

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === "string" && value in THEMES;
}

export function getThemeKeyFromUrlOrLocalStorage(defaultTheme: ThemeKey = "deepTeal"): ThemeKey {
  if (typeof window === "undefined") return defaultTheme;

  const q = new URLSearchParams(window.location.search);
  const urlTheme = q.get("theme");
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (isThemeKey(urlTheme)) return urlTheme;
  if (isThemeKey(savedTheme)) return savedTheme;

  return defaultTheme;
}

export function saveThemeKey(themeKey: ThemeKey) {
  if (typeof window === "undefined") return;

  localStorage.setItem(THEME_KEY, themeKey);
}
