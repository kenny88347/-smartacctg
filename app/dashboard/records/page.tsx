"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type TxnType = "income" | "expense";
type FilterType = "all" | TxnType;
type ThemeKey = "deepTeal" | "pink" | "blackGold" | "lightRed" | "nature" | "sky";

type Txn = {
  id: string;
  user_id?: string;
  txn_date: string;
  txn_type: TxnType;
  amount: number;
  category_name?: string | null;
  debt_amount?: number | null;
  note?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  created_at?: string | null;
};

type Profile = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  theme?: string | null;
  plan_type?: string | null;
  plan_expiry?: string | null;
};

type FormState = {
  txn_date: string;
  txn_type: TxnType;
  amount: string;
  category_name: string;
  debt_amount: string;
  note: string;
};

const THEME_DATA: Record<
  ThemeKey,
  {
    name: string;
    primary: string;
    primaryDark: string;
    bg: string;
    card: string;
    soft: string;
    border: string;
    text: string;
    muted: string;
    danger: string;
  }
> = {
  deepTeal: {
    name: "深青色",
    primary: "#0F766E",
    primaryDark: "#115E59",
    bg: "linear-gradient(135deg,#ECFDF5 0%,#F8FAFC 45%,#E0F2FE 100%)",
    card: "rgba(255,255,255,0.92)",
    soft: "#CCFBF1",
    border: "#99F6E4",
    text: "#0F172A",
    muted: "#64748B",
    danger: "#DC2626",
  },
  pink: {
    name: "可爱粉色",
    primary: "#DB2777",
    primaryDark: "#BE185D",
    bg: "linear-gradient(135deg,#FDF2F8 0%,#FFF7ED 55%,#FCE7F3 100%)",
    card: "rgba(255,255,255,0.92)",
    soft: "#FCE7F3",
    border: "#FBCFE8",
    text: "#1F2937",
    muted: "#6B7280",
    danger: "#DC2626",
  },
  blackGold: {
    name: "黑金商务",
    primary: "#B45309",
    primaryDark: "#92400E",
    bg: "linear-gradient(135deg,#111827 0%,#1F2937 50%,#78350F 100%)",
    card: "rgba(255,255,255,0.94)",
    soft: "#FEF3C7",
    border: "#F59E0B",
    text: "#111827",
    muted: "#6B7280",
    danger: "#DC2626",
  },
  lightRed: {
    name: "浅红风格",
    primary: "#E11D48",
    primaryDark: "#BE123C",
    bg: "linear-gradient(135deg,#FFF1F2 0%,#FFFFFF 50%,#FFE4E6 100%)",
    card: "rgba(255,255,255,0.92)",
    soft: "#FFE4E6",
    border: "#FDA4AF",
    text: "#1F2937",
    muted: "#6B7280",
    danger: "#DC2626",
  },
  nature: {
    name: "风景自然系",
    primary: "#15803D",
    primaryDark: "#166534",
    bg: "linear-gradient(135deg,#DCFCE7 0%,#F7FEE7 50%,#ECFCCB 100%)",
    card: "rgba(255,255,255,0.92)",
    soft: "#DCFCE7",
    border: "#86EFAC",
    text: "#14532D",
    muted: "#4B5563",
    danger: "#DC2626",
  },
  sky: {
    name: "天空蓝",
    primary: "#0284C7",
    primaryDark: "#0369A1",
    bg: "linear-gradient(135deg,#E0F2FE 0%,#F8FAFC 50%,#DBEAFE 100%)",
    card: "rgba(255,255,255,0.92)",
    soft: "#E0F2FE",
    border: "#7DD3FC",
    text: "#0F172A",
    muted: "#64748B",
    danger: "#DC2626",
  },
};

const incomeCategories = ["销售收入", "服务收入", "代理佣金", "充值收入", "订阅收入", "其他收入"];
const expenseCategories = ["进货成本", "广告费", "交通费", "电话费", "租金", "工资", "水电费", "系统费用", "其他支出"];

function getTodayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function getMonthISO() {
  return getTodayISO().slice(0, 7);
}

function money(value: number) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseAmount(value: string) {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function safeDate(value: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("zh-MY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function RecordsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [records, setRecords] = useState<Txn[]>([]);

  const [themeKey, setThemeKey] = useState<ThemeKey>("deepTeal");
  const theme = THEME_DATA[themeKey];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [filterType, setFilterType] = useState<FilterType>("all");
  const [monthFilter, setMonthFilter] = useState(getMonthISO());
  const [keyword, setKeyword] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    txn_date: getTodayISO(),
    txn_type: "income",
    amount: "",
    category_name: "",
    debt_amount: "",
    note: "",
  });

  async function loadData(userId: string) {
    setErrorMsg("");

    const profileRes = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

    if (!profileRes.error && profileRes.data) {
      const p = profileRes.data as Profile;
      setProfile(p);

      const savedTheme = p.theme as ThemeKey | null;
      if (savedTheme && THEME_DATA[savedTheme]) {
        setThemeKey(savedTheme);
      }
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("txn_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(`读取记账记录失败：${error.message}`);
      setRecords([]);
      return;
    }

    setRecords((data || []) as Txn[]);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);

      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession?.user?.id) {
        await loadData(currentSession.user.id);
      }

      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);

      if (currentSession?.user?.id) {
        setLoading(true);
        await loadData(currentSession.user.id);
        setLoading(false);
      } else {
        setRecords([]);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return records.filter((r) => {
      const byType = filterType === "all" ? true : r.txn_type === filterType;
      const byMonth = monthFilter ? r.txn_date?.startsWith(monthFilter) : true;

      const text = `${r.category_name || ""} ${r.note || ""} ${r.amount || ""}`.toLowerCase();
      const byKeyword = q ? text.includes(q) : true;

      return byType && byMonth && byKeyword;
    });
  }, [records, filterType, monthFilter, keyword]);

  const summary = useMemo(() => {
    const income = filteredRecords
      .filter((r) => r.txn_type === "income")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const expense = filteredRecords
      .filter((r) => r.txn_type === "expense")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const debt = filteredRecords.reduce((sum, r) => sum + Number(r.debt_amount || 0), 0);

    return {
      income,
      expense,
      balance: income - expense,
      debt,
      count: filteredRecords.length,
    };
  }, [filteredRecords]);

  function resetForm() {
    setEditingId(null);
    setForm({
      txn_date: getTodayISO(),
      txn_type: "income",
      amount: "",
      category_name: "",
      debt_amount: "",
      note: "",
    });
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!session?.user?.id) {
      setErrorMsg("请先登入后再记账。");
      return;
    }

    setMessage("");
    setErrorMsg("");

    const amount = parseAmount(form.amount);
    const debtAmount = parseAmount(form.debt_amount);

    if (!form.txn_date) {
      setErrorMsg("请选择日期。");
      return;
    }

    if (amount <= 0) {
      setErrorMsg("请输入正确的金额。");
      return;
    }

    if (!form.category_name.trim()) {
      setErrorMsg("请选择或填写分类。");
      return;
    }

    setSaving(true);

    const payload = {
      user_id: session.user.id,
      txn_date: form.txn_date,
      txn_type: form.txn_type,
      amount,
      category_name: form.category_name.trim(),
      debt_amount: debtAmount || 0,
      note: form.note.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", session.user.id);

      if (error) {
        setSaving(false);
        setErrorMsg(`修改失败：${error.message}`);
        return;
      }

      setMessage("记录已更新。");
    } else {
      const { error } = await supabase.from("transactions").insert(payload);

      if (error) {
        setSaving(false);
        setErrorMsg(`新增失败：${error.message}`);
        return;
      }

      setMessage("记录已新增。");
    }

    await loadData(session.user.id);
    resetForm();
    setSaving(false);
  }

  function handleEdit(record: Txn) {
    setEditingId(record.id);
    setForm({
      txn_date: record.txn_date || getTodayISO(),
      txn_type: record.txn_type,
      amount: String(record.amount || ""),
      category_name: record.category_name || "",
      debt_amount: record.debt_amount ? String(record.debt_amount) : "",
      note: record.note || "",
    });

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleDelete(record: Txn) {
    if (!session?.user?.id) return;

    const ok = window.confirm("确定要删除这条记账记录吗？");
    if (!ok) return;

    setMessage("");
    setErrorMsg("");

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", record.id)
      .eq("user_id", session.user.id);

    if (error) {
      setErrorMsg(`删除失败：${error.message}`);
      return;
    }

    setMessage("记录已删除。");
    await loadData(session.user.id);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  function exportCsv() {
    const header = ["日期", "类型", "分类", "金额", "欠款金额", "备注"];
    const rows = filteredRecords.map((r) => [
      r.txn_date,
      r.txn_type === "income" ? "收入" : "支出",
      r.category_name || "",
      String(r.amount || 0),
      String(r.debt_amount || 0),
      r.note || "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `SmartAcctg-records-${monthFilter || "all"}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  const currentCategories = form.txn_type === "income" ? incomeCategories : expenseCategories;

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: theme.bg,
      color: theme.text,
      padding: "18px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    },
    shell: {
      maxWidth: 1180,
      margin: "0 auto",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
      flexWrap: "wrap",
    },
    titleBox: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: 900,
      margin: 0,
      color: theme.text,
      letterSpacing: "-0.03em",
    },
    subtitle: {
      margin: 0,
      color: theme.muted,
      fontSize: 13,
      lineHeight: 1.5,
    },
    userBox: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: 18,
      padding: "8px 10px",
      boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      objectFit: "cover",
      background: theme.soft,
      border: `2px solid ${theme.border}`,
    },
    smallText: {
      fontSize: 12,
      color: theme.muted,
      lineHeight: 1.4,
    },
    card: {
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: 22,
      padding: 16,
      boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
      backdropFilter: "blur(16px)",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: 12,
      marginBottom: 14,
    },
    statCard: {
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: 20,
      padding: 14,
      boxShadow: "0 12px 30px rgba(15,23,42,0.07)",
    },
    statLabel: {
      fontSize: 12,
      color: theme.muted,
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 900,
      letterSpacing: "-0.03em",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "390px minmax(0, 1fr)",
      gap: 14,
      alignItems: "start",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    label: {
      fontSize: 12,
      color: theme.muted,
      fontWeight: 700,
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      border: `1px solid ${theme.border}`,
      borderRadius: 14,
      padding: "11px 12px",
      fontSize: 14,
      outline: "none",
      background: "rgba(255,255,255,0.96)",
      color: theme.text,
      minWidth: 0,
    },
    textarea: {
      width: "100%",
      boxSizing: "border-box",
      border: `1px solid ${theme.border}`,
      borderRadius: 14,
      padding: "11px 12px",
      fontSize: 14,
      outline: "none",
      background: "rgba(255,255,255,0.96)",
      color: theme.text,
      minHeight: 86,
      resize: "vertical",
      fontFamily: "inherit",
    },
    btnRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 12,
    },
    primaryBtn: {
      border: "none",
      borderRadius: 14,
      padding: "11px 14px",
      background: theme.primary,
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(15,118,110,0.22)",
    },
    ghostBtn: {
      border: `1px solid ${theme.border}`,
      borderRadius: 14,
      padding: "10px 14px",
      background: "rgba(255,255,255,0.8)",
      color: theme.text,
      fontWeight: 800,
      cursor: "pointer",
    },
    dangerBtn: {
      border: "none",
      borderRadius: 12,
      padding: "8px 10px",
      background: "#FEE2E2",
      color: theme.danger,
      fontWeight: 900,
      cursor: "pointer",
    },
    editBtn: {
      border: "none",
      borderRadius: 12,
      padding: "8px 10px",
      background: theme.soft,
      color: theme.primaryDark,
      fontWeight: 900,
      cursor: "pointer",
    },
    filterRow: {
      display: "grid",
      gridTemplateColumns: "120px 150px minmax(0, 1fr) auto",
      gap: 10,
      marginBottom: 12,
      alignItems: "center",
    },
    tableWrap: {
      overflowX: "auto",
      borderRadius: 16,
      border: `1px solid ${theme.border}`,
      background: "rgba(255,255,255,0.72)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 760,
      fontSize: 13,
    },
    th: {
      textAlign: "left",
      padding: "12px 10px",
      background: theme.soft,
      color: theme.text,
      fontSize: 12,
      whiteSpace: "nowrap",
    },
    td: {
      padding: "12px 10px",
      borderTop: `1px solid ${theme.border}`,
      verticalAlign: "top",
    },
    badgeIncome: {
      display: "inline-flex",
      borderRadius: 999,
      padding: "4px 9px",
      background: "#DCFCE7",
      color: "#166534",
      fontSize: 12,
      fontWeight: 900,
      whiteSpace: "nowrap",
    },
    badgeExpense: {
      display: "inline-flex",
      borderRadius: 999,
      padding: "4px 9px",
      background: "#FFE4E6",
      color: "#BE123C",
      fontSize: 12,
      fontWeight: 900,
      whiteSpace: "nowrap",
    },
    info: {
      padding: "10px 12px",
      borderRadius: 14,
      background: "#ECFDF5",
      color: "#047857",
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 12,
      border: "1px solid #A7F3D0",
    },
    error: {
      padding: "10px 12px",
      borderRadius: 14,
      background: "#FEF2F2",
      color: "#B91C1C",
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 12,
      border: "1px solid #FECACA",
    },
    empty: {
      textAlign: "center",
      color: theme.muted,
      padding: "34px 12px",
      fontSize: 14,
    },
    mobileList: {
      display: "none",
      flexDirection: "column",
      gap: 10,
    },
    mobileCard: {
      border: `1px solid ${theme.border}`,
      background: "rgba(255,255,255,0.82)",
      borderRadius: 18,
      padding: 12,
    },
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>
            <h1 style={styles.title}>每日记账</h1>
            <p style={styles.subtitle}>正在读取你的记账资料...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>
            <h1 style={styles.title}>每日记账</h1>
            <p style={styles.subtitle}>你还没有登入，请先登入后再使用记账功能。</p>

            <div style={styles.btnRow}>
              <button style={styles.primaryBtn} onClick={() => (window.location.href = "/zh")}>
                返回首页登入
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topBar}>
          <div style={styles.titleBox}>
            <h1 style={styles.title}>每日记账</h1>
            <p style={styles.subtitle}>新增收入 / 支出记录，系统会自动计算本月收入、本月支出和结余。</p>
          </div>

          <div style={styles.userBox}>
            <img
              src={profile?.avatar_url || "/default-avatar.png"}
              alt="avatar"
              style={styles.avatar}
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='100%25' height='100%25' rx='40' fill='%23ccfbf1'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='30' fill='%230f766e'%3E人%3C/text%3E%3C/svg%3E";
              }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: 13 }}>
                {profile?.full_name || session.user.email || "SmartAcctg 用户"}
              </div>
              <div style={styles.smallText}>
                {profile?.plan_type ? `配套：${profile.plan_type}` : "配套：Free"}
                {profile?.plan_expiry ? `｜到期：${profile.plan_expiry}` : ""}
              </div>
            </div>

            <button style={styles.ghostBtn} onClick={logout}>
              退出
            </button>
          </div>
        </div>

        {message && <div style={styles.info}>{message}</div>}
        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        <section style={styles.statsGrid} className="records-stats-grid">
          <div style={styles.statCard}>
            <div style={styles.statLabel}>筛选记录数</div>
            <div style={styles.statValue}>{summary.count}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>收入</div>
            <div style={{ ...styles.statValue, color: "#15803D" }}>{money(summary.income)}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>支出</div>
            <div style={{ ...styles.statValue, color: "#BE123C" }}>{money(summary.expense)}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>结余</div>
            <div
              style={{
                ...styles.statValue,
                color: summary.balance >= 0 ? theme.primaryDark : "#BE123C",
              }}
            >
              {money(summary.balance)}
            </div>
          </div>
        </section>

        <section style={styles.mainGrid} className="records-main-grid">
          <div style={styles.card}>
            <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 900 }}>
              {editingId ? "修改记录" : "新增记录"}
            </h2>

            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>日期</label>
                <input
                  style={styles.input}
                  type="date"
                  value={form.txn_date}
                  onChange={(e) => setField("txn_date", e.target.value)}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>类型</label>
                <select
                  style={styles.input}
                  value={form.txn_type}
                  onChange={(e) => {
                    const nextType = e.target.value as TxnType;
                    setForm((prev) => ({
                      ...prev,
                      txn_type: nextType,
                      category_name: "",
                    }));
                  }}
                >
                  <option value="income">收入</option>
                  <option value="expense">支出</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>金额</label>
                <input
                  style={styles.input}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="例如：100.00"
                  value={form.amount}
                  onChange={(e) => setField("amount", e.target.value)}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>欠款金额</label>
                <input
                  style={styles.input}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="没有可留空"
                  value={form.debt_amount}
                  onChange={(e) => setField("debt_amount", e.target.value)}
                />
              </div>
            </div>

            <div style={{ ...styles.field, marginTop: 10 }}>
              <label style={styles.label}>分类</label>
              <input
                style={styles.input}
                list="record-categories"
                placeholder="选择或自己输入分类"
                value={form.category_name}
                onChange={(e) => setField("category_name", e.target.value)}
              />
              <datalist id="record-categories">
                {currentCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div style={{ ...styles.field, marginTop: 10 }}>
              <label style={styles.label}>备注</label>
              <textarea
                style={styles.textarea}
                placeholder="例如：客户付款、购买产品、广告费用..."
                value={form.note}
                onChange={(e) => setField("note", e.target.value)}
              />
            </div>

            <div style={styles.btnRow}>
              <button style={styles.primaryBtn} onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : editingId ? "保存修改" : "新增记录"}
              </button>

              {editingId && (
                <button style={styles.ghostBtn} onClick={resetForm} disabled={saving}>
                  取消修改
                </button>
              )}

              <button style={styles.ghostBtn} onClick={resetForm} disabled={saving}>
                清空
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.filterRow} className="records-filter-row">
              <select
                style={styles.input}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
              >
                <option value="all">全部</option>
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>

              <input
                style={styles.input}
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="搜索分类 / 备注 / 金额"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />

              <button style={styles.ghostBtn} onClick={exportCsv}>
                导出
              </button>
            </div>

            {filteredRecords.length === 0 ? (
              <div style={styles.empty}>暂无记录。你可以先新增一条收入或支出。</div>
            ) : (
              <>
                <div style={styles.tableWrap} className="records-table-wrap">
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>日期</th>
                        <th style={styles.th}>类型</th>
                        <th style={styles.th}>分类</th>
                        <th style={styles.th}>金额</th>
                        <th style={styles.th}>欠款</th>
                        <th style={styles.th}>备注</th>
                        <th style={styles.th}>来源</th>
                        <th style={styles.th}>操作</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRecords.map((r) => (
                        <tr key={r.id}>
                          <td style={styles.td}>{safeDate(r.txn_date)}</td>
                          <td style={styles.td}>
                            <span style={r.txn_type === "income" ? styles.badgeIncome : styles.badgeExpense}>
                              {r.txn_type === "income" ? "收入" : "支出"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <strong>{r.category_name || "-"}</strong>
                          </td>
                          <td
                            style={{
                              ...styles.td,
                              fontWeight: 900,
                              color: r.txn_type === "income" ? "#15803D" : "#BE123C",
                            }}
                          >
                            {money(Number(r.amount || 0))}
                          </td>
                          <td style={styles.td}>{Number(r.debt_amount || 0) > 0 ? money(Number(r.debt_amount)) : "-"}</td>
                          <td style={styles.td}>{r.note || "-"}</td>
                          <td style={styles.td}>
                            {r.source_type ? (
                              <span style={{ ...styles.smallText, color: theme.primaryDark, fontWeight: 800 }}>
                                {r.source_type === "invoice" ? "发票系统" : r.source_type}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button style={styles.editBtn} onClick={() => handleEdit(r)}>
                                修改
                              </button>
                              <button style={styles.dangerBtn} onClick={() => handleDelete(r)}>
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={styles.mobileList} className="records-mobile-list">
                  {filteredRecords.map((r) => (
                    <div key={r.id} style={styles.mobileCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 900 }}>{r.category_name || "-"}</div>
                          <div style={styles.smallText}>{safeDate(r.txn_date)}</div>
                        </div>

                        <span style={r.txn_type === "income" ? styles.badgeIncome : styles.badgeExpense}>
                          {r.txn_type === "income" ? "收入" : "支出"}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: r.txn_type === "income" ? "#15803D" : "#BE123C",
                        }}
                      >
                        {money(Number(r.amount || 0))}
                      </div>

                      {Number(r.debt_amount || 0) > 0 && (
                        <div style={{ marginTop: 6, color: "#B45309", fontWeight: 800 }}>
                          欠款：{money(Number(r.debt_amount || 0))}
                        </div>
                      )}

                      {r.note && <div style={{ marginTop: 8, color: theme.muted, fontSize: 13 }}>{r.note}</div>}

                      {r.source_type && (
                        <div style={{ marginTop: 8, color: theme.primaryDark, fontSize: 12, fontWeight: 800 }}>
                          来源：{r.source_type === "invoice" ? "发票系统" : r.source_type}
                        </div>
                      )}

                      <div style={{ ...styles.btnRow, marginTop: 10 }}>
                        <button style={styles.editBtn} onClick={() => handleEdit(r)}>
                          修改
                        </button>
                        <button style={styles.dangerBtn} onClick={() => handleDelete(r)}>
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .records-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .records-main-grid {
            grid-template-columns: 1fr !important;
          }

          .records-filter-row {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .records-table-wrap {
            display: none;
          }

          .records-mobile-list {
            display: flex !important;
          }

          input[type="date"],
          input[type="month"] {
            min-width: 0;
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
