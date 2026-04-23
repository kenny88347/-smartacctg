"use client";

import { CSSProperties, useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ThemePackKey = "cutePink" | "blackGold" | "pandaChina" | "nature";
type TabKey = "overview" | "themes" | "settings";

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
  const [themePack, setThemePack] = useState<ThemePackKey>("nature");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "">("");

  const theme = THEME_PACKS[themePack];

  useEffect(() => {
    initPage();
  }, []);

  async function initPage() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/zh";
      return;
    }

    setSession(session);
    setUserEmail(session.user.email ?? "");

    await ensureProfile(session.user.id, session.user.email ?? "");
    await loadTheme(session.user.id);
  }

  async function ensureProfile(userId: string, email: string) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, company_name, company_phone, company_email, company_address, theme")
      .eq("id", userId)
      .maybeSingle();

    if (!existing) {
      await supabase.from("profiles").insert({
        id: userId,
        email,
        theme: "nature",
        plan_type: "free",
      });
      return;
    }

    setCompanyName(existing.company_name || "");
    setCompanyPhone(existing.company_phone || "");
    setCompanyEmail(existing.company_email || "");
    setCompanyAddress(existing.company_address || "");
    if (existing.theme && THEME_PACKS[existing.theme as ThemePackKey]) {
      setThemePack(existing.theme as ThemePackKey);
    }
  }

  async function loadTheme(userId?: string) {
    const uid =
      userId ||
      session?.user?.id ||
      (await supabase.auth.getUser()).data.user?.id;

    if (!uid) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("theme")
      .eq("id", uid)
      .single();

    if (!error && data?.theme && THEME_PACKS[data.theme as ThemePackKey]) {
      setThemePack(data.theme as ThemePackKey);
    }
  }

  async function saveTheme(newTheme: ThemePackKey) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ theme: newTheme })
      .eq("id", user.id);

    if (error) {
      setMsg("主题保存失败：" + error.message);
      setMsgType("error");
      return;
    }

    setThemePack(newTheme);
    setMsg("主题已保存");
    setMsgType("success");
  }

  async function saveCompanyProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: companyName,
        company_phone: companyPhone,
        company_email: companyEmail,
        company_address: companyAddress,
      })
      .eq("id", user.id);

    if (error) {
      setMsg("公司资料保存失败：" + error.message);
      setMsgType("error");
      return;
    }

    setMsg("公司资料已保存");
    setMsgType("success");
  }

  async function changePassword() {
    if (!newPassword || newPassword.length < 6) {
      setMsg("新密码至少 6 位");
      setMsgType("error");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMsg("修改密码失败：" + error.message);
      setMsgType("error");
      return;
    }

    setNewPassword("");
    setMsg("密码修改成功");
    setMsgType("success");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  return (
    <main
      style={{
        ...pageStyle,
        background: theme.pageBg,
        color: theme.text,
      }}
    >
      <div
        style={{
          ...heroStyle,
          background: theme.heroBg,
          color: theme.bannerText,
        }}
      >
        <div>
          <h1 style={titleStyle}>Dashboard</h1>
          <p style={{ ...subTitleStyle, color: theme.subText }}>
            欢迎回来 {userEmail || "用户"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            ...primaryBtnStyle,
            background: theme.accent,
            marginTop: 0,
          }}
        >
          退出登录
        </button>
      </div>

      <div style={menuGridStyle}>
        <button style={menuBtn(activeTab === "overview", theme)} onClick={() => setActiveTab("overview")}>
          总览
        </button>
        <button style={menuBtn(activeTab === "themes", theme)} onClick={() => setActiveTab("themes")}>
          主题切换
        </button>
        <button style={menuBtn(activeTab === "settings", theme)} onClick={() => setActiveTab("settings")}>
          设定
        </button>
      </div>

      {activeTab === "overview" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>总览</h3>
          <p style={{ ...mutedTextStyle, color: theme.subText }}>
            这里会根据你的主题显示不同风格。
          </p>

          <div style={previewGridStyle}>
            <div style={previewBox(theme)}>
              <h4>首页 Banner 预览</h4>
              <div style={bannerPreview(theme)}>SmartAcctg Banner</div>
            </div>

            <div style={previewBox(theme)}>
              <h4>个人卡片背景预览</h4>
              <div style={cardPreview(theme)}>个人卡片背景</div>
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

      {activeTab === "themes" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>主题切换</h3>
          <p style={{ ...mutedTextStyle, color: theme.subText }}>
            每位用户的主题会独立保存，不影响其他用户。
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
                    background: pack.pageBg,
                    color: pack.text,
                    border: active ? `2px solid ${pack.accent}` : "1px solid #d1d5db",
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
                    onClick={() => saveTheme(key)}
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

      {activeTab === "settings" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>设定</h3>

          <div style={settingsBlockStyle}>
            <h4>公司资料</h4>

            <div style={formGridStyle}>
              <input
                placeholder="公司名称"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="公司电话"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="公司 Email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="公司地址"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              onClick={saveCompanyProfile}
              style={{
                ...primaryBtnStyle,
                background: theme.accent,
              }}
            >
              保存公司资料
            </button>
          </div>

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
              onClick={changePassword}
              style={{
                ...primaryBtnStyle,
                background: theme.accent,
              }}
            >
              更新密码
            </button>
          </div>

          {msg ? (
            <div
              style={{
                ...messageBoxStyle,
                background: msgType === "error" ? "#fee2e2" : "#dcfce7",
                color: msgType === "error" ? "#b91c1c" : "#166534",
              }}
            >
              {msg}
            </div>
          ) : null}
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

const heroStyle: CSSProperties = {
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

const titleStyle: CSSProperties = {
  fontSize: 30,
  margin: 0,
};

const subTitleStyle: CSSProperties = {
  marginTop: 10,
};

const menuGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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

const previewGridStyle: CSSProperties = {
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

const cardPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
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

const settingsBlockStyle: CSSProperties = {
  marginTop: 18,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
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

const mutedTextStyle: CSSProperties = {
  fontSize: 14,
  marginTop: 4,
};

const messageBoxStyle: CSSProperties = {
  marginTop: 16,
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
};
