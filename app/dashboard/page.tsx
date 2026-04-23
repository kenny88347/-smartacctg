"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TrialInfo = {
  startedAt: number;
  expiresAt: number;
};

type TabKey = "overview" | "daily" | "settings" | "themes";

type Txn = {
  id: string;
  date: string;
  type: "收款" | "付款";
  amount: number;
  category: string;
  note: string;
};

type CompanyProfile = {
  companyName: string;
  regNo: string;
  phone: string;
  email: string;
  address: string;
  logoDataUrl: string;
};

type ThemePackKey =
  | "cutePink"
  | "blackGold"
  | "pandaChina"
  | "nature";

const TRIAL_KEY = "smartacctg_trial";
const RECORDS_KEY = "smartacctg_trial_records";
const PROFILE_KEY = "smartacctg_trial_profile";
const THEME_KEY = "smartacctg_theme_pack";

const THEME_PACKS: Record<
  ThemePackKey,
  {
    name: string;
    pageBg: string;
    heroBg: string;
    cardBg: string;
    cardBorder: string;
    accent: string;
    text: string;
    subText: string;
    bannerText: string;
    preview: string;
  }
> = {
  cutePink: {
    name: "可爱粉色",
    pageBg: "#fff7fb",
    heroBg: "linear-gradient(135deg, #ffd6e7 0%, #ffeaf3 100%)",
    cardBg: "#ffffff",
    cardBorder: "#f9a8d4",
    accent: "#db2777",
    text: "#4a044e",
    subText: "#831843",
    bannerText: "#831843",
    preview: "粉嫩、柔和、可爱",
  },
  blackGold: {
    name: "黑金商务",
    pageBg: "#0f0f10",
    heroBg: "linear-gradient(135deg, #1c1c1f 0%, #2a2112 100%)",
    cardBg: "#17171a",
    cardBorder: "#d4af37",
    accent: "#d4af37",
    text: "#f8f5ee",
    subText: "#d6c8a4",
    bannerText: "#f8f5ee",
    preview: "高端、稳重、商务",
  },
  pandaChina: {
    name: "熊猫中国风",
    pageBg: "#f6f4ef",
    heroBg: "linear-gradient(135deg, #ffffff 0%, #ece7dc 100%)",
    cardBg: "#ffffff",
    cardBorder: "#111827",
    accent: "#b91c1c",
    text: "#111827",
    subText: "#57534e",
    bannerText: "#111827",
    preview: "东方、干净、书卷感",
  },
  nature: {
    name: "风景自然系",
    pageBg: "#f0fdf4",
    heroBg: "linear-gradient(135deg, #d9f99d 0%, #bae6fd 100%)",
    cardBg: "#ffffff",
    cardBorder: "#16a34a",
    accent: "#0f766e",
    text: "#14532d",
    subText: "#166534",
    bannerText: "#14532d",
    preview: "清新、自然、舒服",
  },
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isTrial, setIsTrial] = useState(false);
  const [trialLeft, setTrialLeft] = useState("");
  const [trialPercent, setTrialPercent] = useState(100);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [records, setRecords] = useState<Txn[]>([]);
  const [date, setDate] = useState("");
  const [type, setType] = useState<"收款" | "付款">("收款");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const [company, setCompany] = useState<CompanyProfile>({
    companyName: "",
    regNo: "",
    phone: "",
    email: "",
    address: "",
    logoDataUrl: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [settingsMsgType, setSettingsMsgType] = useState<"success" | "error" | "">("");

  const [themePack, setThemePack] = useState<ThemePackKey>("nature");

  const theme = THEME_PACKS[themePack];

  useEffect(() => {
    let interval: number | undefined;

    const init = async () => {
      const savedTheme = localStorage.getItem(THEME_KEY) as ThemePackKey | null;
      if (savedTheme && THEME_PACKS[savedTheme]) {
        setThemePack(savedTheme);
      }

      const savedRecords = localStorage.getItem(RECORDS_KEY);
      if (savedRecords) {
        try {
          setRecords(JSON.parse(savedRecords));
        } catch {}
      }

      const savedProfile = localStorage.getItem(PROFILE_KEY);
      if (savedProfile) {
        try {
          setCompany(JSON.parse(savedProfile));
        } catch {}
      }

      const trialRaw = localStorage.getItem(TRIAL_KEY);
      const trial = trialRaw ? (JSON.parse(trialRaw) as TrialInfo) : null;

      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      if (currentSession) {
        setSession(currentSession);
        setUserEmail(currentSession.user.email ?? "");
        return;
      }

      if (trial) {
        const expired = Date.now() >= trial.expiresAt;

        if (expired) {
          clearTrialData();
          window.location.href = "/zh";
          return;
        }

        setIsTrial(true);
        updateTrialBar(trial);

        interval = window.setInterval(() => {
          const latestRaw = localStorage.getItem(TRIAL_KEY);
          const latestTrial = latestRaw ? (JSON.parse(latestRaw) as TrialInfo) : null;

          if (!latestTrial) {
            window.location.href = "/zh";
            return;
          }

          const isExpired = Date.now() >= latestTrial.expiresAt;

          if (isExpired) {
            clearTrialData();
            window.location.href = "/zh";
            return;
          }

          updateTrialBar(latestTrial);
        }, 1000);

        return;
      }

      window.location.href = "/zh";
    };

    init();

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isTrial) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    }
  }, [records, isTrial]);

  useEffect(() => {
    if (isTrial) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(company));
    }
  }, [company, isTrial]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themePack);
  }, [themePack]);

  function clearTrialData() {
    localStorage.removeItem(TRIAL_KEY);
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  function updateTrialBar(trial: TrialInfo) {
    const totalMs = trial.expiresAt - trial.startedAt;
    const leftMs = Math.max(trial.expiresAt - Date.now(), 0);
    const totalSec = Math.floor(leftMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    setTrialLeft(`${min}分 ${sec}秒`);

    const pct = Math.max((leftMs / totalMs) * 100, 0);
    setTrialPercent(pct);
  }

  async function handleLogout() {
    clearTrialData();
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  function addRecord() {
    if (!date || !amount || !category) return;

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newRecord: Txn = {
      id: String(Date.now()),
      date,
      type,
      amount: parsedAmount,
      category,
      note,
    };

    setRecords((prev) => [newRecord, ...prev]);
    setDate("");
    setType("收款");
    setAmount("");
    setCategory("");
    setNote("");
  }

  function removeRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleChangePassword() {
    setSettingsMsg("");
    setSettingsMsgType("");

    if (!newPassword || newPassword.length < 6) {
      setSettingsMsg("新密码至少 6 位");
      setSettingsMsgType("error");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setSettingsMsg("修改密码失败：" + error.message);
      setSettingsMsgType("error");
      return;
    }

    setSettingsMsg("密码修改成功");
    setSettingsMsgType("success");
    setNewPassword("");
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCompany((prev) => ({
        ...prev,
        logoDataUrl: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  }

  const currentMonthRecords = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return records.filter((r) => r.date.startsWith(ym));
  }, [records]);

  const totalIncome = useMemo(() => {
    return records
      .filter((r) => r.type === "收款")
      .reduce((sum, r) => sum + r.amount, 0);
  }, [records]);

  const totalExpense = useMemo(() => {
    return records
      .filter((r) => r.type === "付款")
      .reduce((sum, r) => sum + r.amount, 0);
  }, [records]);

  const monthIncome = useMemo(() => {
    return currentMonthRecords
      .filter((r) => r.type === "收款")
      .reduce((sum, r) => sum + r.amount, 0);
  }, [currentMonthRecords]);

  const monthExpense = useMemo(() => {
    return currentMonthRecords
      .filter((r) => r.type === "付款")
      .reduce((sum, r) => sum + r.amount, 0);
  }, [currentMonthRecords]);

  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  return (
    <main
      style={{
        ...pageStyle,
        background: theme.pageBg,
        color: theme.text,
      }}
    >
      {isTrial && (
        <div style={trialWrapStyle}>
          <div style={trialTopRowStyle}>
            <span style={trialLabelStyle}>免费试用版</span>
            <span style={trialTimeStyle}>剩余时间：{trialLeft}</span>
          </div>
          <div style={trialBarBgStyle}>
            <div
              style={{
                ...trialBarFillStyle,
                width: `${trialPercent}%`,
              }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          ...heroCardStyle,
          background: theme.heroBg,
          color: theme.bannerText,
        }}
      >
        <div>
          <h1 style={titleStyle}>Dashboard</h1>
          <p style={{ ...subTitleStyle, color: theme.subText }}>
            {isTrial
              ? "你正在使用免费试用版，全部功能已开放"
              : `你已经成功登录 SmartAcctg${userEmail ? `（${userEmail}）` : ""}`}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            ...logoutBtnStyle,
            background: theme.accent,
          }}
        >
          退出登录
        </button>
      </div>

      <div style={statsGridStyle}>
        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>当前余额</div>
          <div style={{ ...statValueStyle, color: theme.accent }}>RM {balance.toFixed(2)}</div>
        </div>

        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>本月收入</div>
          <div style={{ ...statValueStyle, color: "#16a34a" }}>RM {monthIncome.toFixed(2)}</div>
        </div>

        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>本月支出</div>
          <div style={{ ...statValueStyle, color: "#dc2626" }}>RM {monthExpense.toFixed(2)}</div>
        </div>
      </div>

      <div style={menuGridStyle}>
        <button style={menuBtn(activeTab === "overview", theme)} onClick={() => setActiveTab("overview")}>
          总览
        </button>
        <button style={menuBtn(activeTab === "daily", theme)} onClick={() => setActiveTab("daily")}>
          每日记账
        </button>
        <button style={menuBtn(activeTab === "settings", theme)} onClick={() => setActiveTab("settings")}>
          设定
        </button>
        <button style={menuBtn(activeTab === "themes", theme)} onClick={() => setActiveTab("themes")}>
          主题切换
        </button>
      </div>

      {activeTab === "overview" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>总览</h3>
          <p style={{ ...mutedTextStyle, color: theme.subText }}>
            这里会根据你的记账记录自动更新金额。
          </p>

          <div style={overviewBoxGridStyle}>
            <div style={previewBox(theme)}>
              <h4>首页 Banner 预览</h4>
              <div style={bannerPreview(theme)}>SmartAcctg Banner</div>
            </div>

            <div style={previewBox(theme)}>
              <h4>个人卡片背景预览</h4>
              <div style={smallCardPreview(theme)}>个人卡片背景</div>
            </div>

            <div style={previewBox(theme)}>
              <h4>名片封面预览</h4>
              <div style={nameCardPreview(theme)}>名片封面</div>
            </div>

            <div style={previewBox(theme)}>
              <h4>Container 背景预览</h4>
              <div style={containerPreview(theme)}>某些 container 背景图</div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "daily" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>每日记账</h3>

          <div style={formGridStyle}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            <select value={type} onChange={(e) => setType(e.target.value as "收款" | "付款")} style={inputStyle}>
              <option value="收款">收款</option>
              <option value="付款">付款</option>
            </select>
            <input
              placeholder="金额（RM）"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="分类"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="备注"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            onClick={addRecord}
            style={{
              ...primaryBtnStyle,
              background: theme.accent,
            }}
          >
            新增记录
          </button>

          <div style={{ marginTop: 18 }}>
            {records.length === 0 ? (
              <p style={{ ...emptyTextStyle, color: theme.subText }}>还没有记录</p>
            ) : (
              records.map((r) => (
                <div key={r.id} style={listItemStyle}>
                  <div>
                    <strong>{r.type}</strong> · {r.category}
                    <div style={{ ...mutedTextStyle, color: theme.subText }}>
                      {r.date} {r.note ? `· ${r.note}` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong>RM {r.amount.toFixed(2)}</strong>
                    <button
                      onClick={() => removeRecord(r.id)}
                      style={deleteBtnStyle}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "settings" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>设定</h3>

          <div style={settingsBlockStyle}>
            <h4>修改密码</h4>
            <input
              type="password"
              placeholder="请输入新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={handleChangePassword}
              style={{
                ...primaryBtnStyle,
                background: theme.accent,
              }}
            >
              更新密码
            </button>
          </div>

          <div style={settingsBlockStyle}>
            <h4>公司资料（发票会显示）</h4>

            <div style={formGridStyle}>
              <input
                placeholder="公司名称"
                value={company.companyName}
                onChange={(e) => setCompany((p) => ({ ...p, companyName: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="公司注册号"
                value={company.regNo}
                onChange={(e) => setCompany((p) => ({ ...p, regNo: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="公司电话"
                value={company.phone}
                onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="公司 Email"
                value={company.email}
                onChange={(e) => setCompany((p) => ({ ...p, email: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="公司地址"
                value={company.address}
                onChange={(e) => setCompany((p) => ({ ...p, address: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                上传公司 Logo
              </label>
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
            </div>

            <div style={companyPreviewCard(theme)}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                {company.logoDataUrl ? (
                  <img
                    src={company.logoDataUrl}
                    alt="company-logo"
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 12,
                      objectFit: "cover",
                      border: `1px solid ${theme.cardBorder}`,
                    }}
                  />
                ) : (
                  <div style={logoPlaceholderStyle}>Logo</div>
                )}

                <div>
                  <h4 style={{ margin: 0 }}>{company.companyName || "你的公司名称"}</h4>
                  <div style={{ ...mutedTextStyle, color: theme.subText }}>
                    {company.regNo || "公司注册号"}
                  </div>
                  <div style={{ ...mutedTextStyle, color: theme.subText }}>
                    {company.phone || "公司电话"}
                  </div>
                  <div style={{ ...mutedTextStyle, color: theme.subText }}>
                    {company.email || "公司 Email"}
                  </div>
                  <div style={{ ...mutedTextStyle, color: theme.subText }}>
                    {company.address || "公司地址"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {settingsMsg ? (
            <div
              style={{
                ...messageBoxStyle,
                background: settingsMsgType === "error" ? "#fee2e2" : "#dcfce7",
                color: settingsMsgType === "error" ? "#b91c1c" : "#166534",
              }}
            >
              {settingsMsg}
            </div>
          ) : null}
        </section>
      )}

      {activeTab === "themes" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>主题切换</h3>
          <p style={{ ...mutedTextStyle, color: theme.subText }}>
            目前只做 4 套视觉风格包，并保存到浏览器本地。
          </p>

          <div style={themeGridStyle}>
            {(Object.keys(THEME_PACKS) as ThemePackKey[]).map((key) => {
              const pack = THEME_PACKS[key];
              const active = key === themePack;

              return (
                <div
                  key={key}
                  style={{
                    ...themeCardStyle,
                    border: active ? `2px solid ${pack.accent}` : "1px solid #d1d5db",
                    background: pack.pageBg,
                    color: pack.text,
                  }}
                >
                  <div
                    style={{
                      ...themeHeroPreviewStyle,
                      background: pack.heroBg,
                      color: pack.bannerText,
                    }}
                  >
                    {pack.name}
                  </div>

                  <div style={{ fontWeight: 700, marginTop: 10 }}>{pack.name}</div>
                  <div style={{ fontSize: 13, marginTop: 6, color: pack.subText }}>{pack.preview}</div>

                  <button
                    onClick={() => setThemePack(key)}
                    style={{
                      ...primaryBtnStyle,
                      background: pack.accent,
                      width: "100%",
                    }}
                  >
                    {active ? "当前使用中" : "切换主题"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "20px",
  fontFamily: "sans-serif",
};

const heroCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 20,
  marginBottom: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const trialWrapStyle: CSSProperties = {
  background: "#dcfce7",
  border: "1px solid #86efac",
  borderRadius: 16,
  padding: 14,
  marginBottom: 18,
};

const trialTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 10,
  flexWrap: "wrap",
};

const trialLabelStyle: CSSProperties = {
  color: "#166534",
  fontWeight: 800,
};

const trialTimeStyle: CSSProperties = {
  color: "#166534",
  fontWeight: 700,
};

const trialBarBgStyle: CSSProperties = {
  width: "100%",
  height: 12,
  borderRadius: 999,
  background: "#bbf7d0",
  overflow: "hidden",
};

const trialBarFillStyle: CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "#0F766E",
  transition: "width 1s linear",
};

const titleStyle: CSSProperties = {
  fontSize: 30,
  margin: 0,
};

const subTitleStyle: CSSProperties = {
  marginTop: 10,
};

const logoutBtnStyle: CSSProperties = {
  padding: "10px 18px",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const statCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 18,
  border: "2px solid",
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
};

const statLabelStyle: CSSProperties = {
  fontSize: 14,
  color: "#64748b",
};

const statValueStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  marginTop: 8,
};

const menuGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const menuBtn = (
  active: boolean,
  theme: (typeof THEME_PACKS)[ThemePackKey]
): CSSProperties => ({
  padding: "14px 12px",
  borderRadius: 12,
  border: active ? `2px solid ${theme.accent}` : "1px solid #cbd5e1",
  background: active ? "#ecfdf5" : "#fff",
  color: active ? theme.accent : "#0f172a",
  fontWeight: 700,
});

const sectionCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 20,
  border: "2px solid",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 16,
  boxSizing: "border-box",
};

const primaryBtnStyle: CSSProperties = {
  marginTop: 14,
  padding: "12px 18px",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
};

const listItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
};

const mutedTextStyle: CSSProperties = {
  fontSize: 14,
  marginTop: 4,
};

const emptyTextStyle: CSSProperties = {};

const bigStatStyle: CSSProperties = {
  fontSize: 36,
  fontWeight: 900,
  marginTop: 14,
};

const deleteBtnStyle: CSSProperties = {
  padding: "8px 10px",
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
};

const settingsBlockStyle: CSSProperties = {
  marginTop: 18,
};

const companyPreviewCard = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 16,
  padding: 16,
  borderRadius: 16,
  background: "#ffffff",
  border: `1px solid ${theme.cardBorder}`,
});

const logoPlaceholderStyle: CSSProperties = {
  width: 68,
  height: 68,
  borderRadius: 12,
  background: "#e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  color: "#475569",
};

const messageBoxStyle: CSSProperties = {
  marginTop: 16,
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
};

const overviewBoxGridStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const previewBox = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  background: "#ffffff",
  borderRadius: 16,
  padding: 16,
  border: `1px solid ${theme.cardBorder}`,
});

const bannerPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 10,
  padding: "20px 16px",
  borderRadius: 14,
  background: theme.heroBg,
  color: theme.bannerText,
  fontWeight: 800,
  textAlign: "center",
});

const smallCardPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 10,
  padding: "18px 14px",
  borderRadius: 14,
  background: theme.cardBg,
  border: `2px solid ${theme.cardBorder}`,
  color: theme.text,
});

const nameCardPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 10,
  padding: "22px 16px",
  borderRadius: 14,
  background: theme.heroBg,
  color: theme.bannerText,
  fontWeight: 700,
});

const containerPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 10,
  padding: "18px 14px",
  borderRadius: 14,
  background: theme.pageBg,
  border: `1px dashed ${theme.cardBorder}`,
  color: theme.text,
});

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const themeCardStyle: CSSProperties = {
  borderRadius: 16,
  padding: 14,
};

const themeHeroPreviewStyle: CSSProperties = {
  borderRadius: 12,
  padding: "18px 12px",
  textAlign: "center",
  fontWeight: 800,
};
