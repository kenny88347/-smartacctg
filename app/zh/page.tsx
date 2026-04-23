"use client";

import { CSSProperties, useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [showLoginHint, setShowLoginHint] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  function resetForm() {
    setEmail("");
    setPassword("");
    setMessage("");
    setMessageType("");
    setShowLoginHint(false);
    setLoading(false);
  }

  function openRegister(plan: string) {
    setSelectedPlan(plan);
    setShowLogin(false);
    setShowRegister(true);
    resetForm();
  }

  function openLogin() {
    setSelectedPlan("");
    setShowRegister(false);
    setShowLogin(true);
    resetForm();
  }

  function startFreeTrial() {
    const now = Date.now();
    const expiresAt = now + 30 * 60 * 1000; // 30分钟

    localStorage.setItem(
      "smartacctg_trial",
      JSON.stringify({
        startedAt: now,
        expiresAt,
      })
    );

    // 清空旧的试用记录，再进入
    localStorage.removeItem("smartacctg_trial_records");
    localStorage.removeItem("smartacctg_trial_profile");
    window.location.href = "/dashboard?mode=trial";
  }

  async function handleSignUp() {
    if (!email || !password) {
      setMessage("请输入邮箱和密码");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");
    setShowLoginHint(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://smartacctg.vercel.app/zh",
      },
    });

    setLoading(false);

    if (error) {
      if (
        error.message.includes("User already registered") ||
        error.message.includes("already registered")
      ) {
        setMessage("这个 email 已经注册过了，请直接登录");
        setMessageType("error");
        setShowLoginHint(true);
        return;
      }

      setMessage("注册失败：" + error.message);
      setMessageType("error");
      return;
    }

    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setMessage("这个 email 已经注册过了，请直接登录");
      setMessageType("error");
      setShowLoginHint(true);
      return;
    }

    setMessage("注册成功，请检查邮箱确认账号");
    setMessageType("success");
  }

  async function handleLogin() {
    if (!email || !password) {
      setMessage("请输入邮箱和密码");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("登录失败：" + error.message);
      setMessageType("error");
      return;
    }

    setMessage("登录成功！");
    setMessageType("success");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 900);
  }

  async function handleResetPassword() {
    if (!email) {
      setMessage("请先输入邮箱");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://smartacctg.vercel.app/zh",
    });

    setLoading(false);

    if (error) {
      setMessage("发送重设密码邮件失败：" + error.message);
      setMessageType("error");
      return;
    }

    setMessage("重设密码邮件已发送，请检查邮箱");
    setMessageType("success");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("smartacctg_trial");
    localStorage.removeItem("smartacctg_trial_records");
    localStorage.removeItem("smartacctg_trial_profile");
    window.location.href = "/zh";
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <h2 style={brandStyle}>SmartAcctg</h2>

        <div style={headerRightStyle}>
          <a href="/zh" style={langLink}>中</a>
          <a href="/en" style={langLink}>EN</a>
          <a href="/ms" style={langLink}>BM</a>
        </div>
      </header>

      <section style={heroStyle}>
        <h1 style={heroTitleStyle}>智能记账 SaaS 系统</h1>
        <p style={heroDescStyle}>
          支持个人与商业用户｜记账｜发票｜客户管理｜PDF｜WhatsApp
        </p>

        <div style={heroButtonsWrap}>
          {!session ? (
            <>
              <button onClick={startFreeTrial} style={btnPrimary}>
                免费试用
              </button>

              <button onClick={openLogin} style={btnSecondary}>
                登录
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                style={btnPrimary}
              >
                进入后台
              </button>

              <button onClick={handleLogout} style={btnSecondary}>
                退出登录
              </button>
            </>
          )}
        </div>
      </section>

      <section style={sectionWrap}>
        <h3 style={sectionTitle}>👤 个人使用</h3>

        <div style={cardPrimaryStyle}>
          <div style={planHeaderStyle}>
            <div>
              <h4 style={cardTitle}>订阅版</h4>
              <p style={mutedText}>多账号管理 / 收支统计 / WhatsApp快速记账</p>
            </div>
            <span style={planBadgeStyle}>推荐</span>
          </div>

          <p>多账号管理</p>
          <p>本月收入 / 支出</p>
          <p>余额价格</p>
          <p>WhatsApp快速记账</p>

          <div style={priceBlockStyle}>
            <div style={priceRowStyle}>
              <div style={priceTextStyle}>RM10 / 月</div>
              <button onClick={() => openRegister("个人订阅（月）")} style={smallBtnStyle}>
                订阅
              </button>
            </div>

            <div style={dividerStyle} />

            <div style={priceRowStyle}>
              <div style={priceTextStyle}>
                RM100 / 年 <span style={badgeStyle}>-16%</span>
              </div>
              <button onClick={() => openRegister("个人订阅（年）")} style={smallBtnStyle}>
                订阅
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={sectionWrap}>
        <h3 style={sectionTitle}>🏢 商业使用</h3>

        <div style={cardPrimaryStyle}>
          <div style={planHeaderStyle}>
            <div>
              <h4 style={cardTitle}>订阅版</h4>
              <p style={mutedText}>适合门店 / 小团队 / 商业用户</p>
            </div>
            <span style={planBadgeStyle}>热门</span>
          </div>

          <p>多账号管理</p>
          <p>WhatsApp记账</p>
          <p>导出PDF</p>
          <p>发票系统</p>
          <p>客户管理</p>
          <p>货源管理</p>

          <div style={priceBlockStyle}>
            <div style={priceRowStyle}>
              <div style={priceTextStyle}>RM31.99 / 月</div>
              <button onClick={() => openRegister("商业订阅（月）")} style={smallBtnStyle}>
                订阅
              </button>
            </div>

            <div style={dividerStyle} />

            <div style={priceRowStyle}>
              <div style={priceTextStyle}>
                RM307.10 / 年 <span style={badgeStyle}>-20%</span>
              </div>
              <button onClick={() => openRegister("商业订阅（年）")} style={smallBtnStyle}>
                订阅
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer style={footerStyle}>© NK DIGITAL HUB. All rights reserved.</footer>

      {showRegister && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={{ margin: 0 }}>注册账号</h3>
                <p style={{ ...mutedText, marginTop: 6 }}>
                  当前选择：{selectedPlan || "订阅方案"}
                </p>
              </div>
              <button onClick={() => setShowRegister(false)} style={closeBtnStyle}>
                ×
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>邮箱</label>
              <input
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />

              <label style={{ ...labelStyle, marginTop: 14 }}>密码</label>
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            {message ? (
              <div
                style={{
                  ...messageBoxStyle,
                  background: messageType === "error" ? "#fee2e2" : "#dcfce7",
                  color: messageType === "error" ? "#b91c1c" : "#166534",
                }}
              >
                {message}
              </div>
            ) : null}

            {showLoginHint && (
              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                  setMessage("");
                  setMessageType("");
                  setShowLoginHint(false);
                }}
                style={{ ...btnPrimary, width: "100%", marginTop: 12 }}
              >
                去登录
              </button>
            )}

            <button
              onClick={handleSignUp}
              disabled={loading}
              style={{
                ...btnPrimary,
                width: "100%",
                marginTop: 18,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "注册中..." : "确认注册"}
            </button>

            <button
              onClick={() => setShowRegister(false)}
              style={{ ...btnSecondary, width: "100%", marginTop: 10 }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showLogin && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={{ margin: 0 }}>登录账号</h3>
                <p style={{ ...mutedText, marginTop: 6 }}>登录你的 SmartAcctg 账号</p>
              </div>
              <button onClick={() => setShowLogin(false)} style={closeBtnStyle}>
                ×
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>邮箱</label>
              <input
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />

              <label style={{ ...labelStyle, marginTop: 14 }}>密码</label>
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            {message ? (
              <div
                style={{
                  ...messageBoxStyle,
                  background: messageType === "error" ? "#fee2e2" : "#dcfce7",
                  color: messageType === "error" ? "#b91c1c" : "#166534",
                }}
              >
                {message}
              </div>
            ) : null}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                ...btnPrimary,
                width: "100%",
                marginTop: 18,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "登录中..." : "确认登录"}
            </button>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              style={resetPasswordBtnStyle}
            >
              忘记密码？
            </button>

            <button
              onClick={() => setShowLogin(false)}
              style={{ ...btnSecondary, width: "100%", marginTop: 10 }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  fontFamily: "sans-serif",
  background: "#f8fafc",
  minHeight: "100vh",
  color: "#0f172a",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
};

const brandStyle: CSSProperties = {
  margin: 0,
  color: "#0F766E",
  fontSize: 30,
  fontWeight: 900,
  letterSpacing: 0.3,
  textShadow:
    "0 1px 0 #d1fae5, 0 2px 0 #a7f3d0, 0 3px 8px rgba(15,118,110,0.15)",
};

const headerRightStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const heroStyle: CSSProperties = {
  padding: "20px 20px 10px 20px",
  textAlign: "center",
};

const heroTitleStyle: CSSProperties = {
  fontSize: 32,
  fontWeight: "bold",
  marginBottom: 12,
};

const heroDescStyle: CSSProperties = {
  color: "#64748b",
  margin: "0 auto 18px",
  maxWidth: 680,
};

const heroButtonsWrap: CSSProperties = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  flexWrap: "wrap",
};

const sectionWrap: CSSProperties = {
  padding: 20,
};

const sectionTitle: CSSProperties = {
  fontSize: 22,
  marginBottom: 16,
};

const cardPrimaryStyle: CSSProperties = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  marginTop: 15,
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  border: "2px solid #0F766E",
};

const cardTitle: CSSProperties = {
  marginTop: 0,
};

const btnPrimary: CSSProperties = {
  padding: "12px 22px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
};

const btnSecondary: CSSProperties = {
  padding: "12px 22px",
  background: "#fff",
  color: "#0F766E",
  border: "2px solid #0F766E",
  borderRadius: 10,
  fontWeight: 600,
};

const smallBtnStyle: CSSProperties = {
  padding: "8px 16px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
};

const priceBlockStyle: CSSProperties = {
  marginTop: 18,
  background: "#f8fafc",
  borderRadius: 12,
  padding: 14,
};

const priceRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const priceTextStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
};

const badgeStyle: CSSProperties = {
  background: "#0F766E",
  color: "#fff",
  padding: "2px 8px",
  borderRadius: 8,
  fontSize: 12,
  marginLeft: 8,
};

const langLink: CSSProperties = {
  color: "#0F766E",
  textDecoration: "none",
  fontWeight: 600,
};

const mutedText: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
};

const planHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 10,
};

const planBadgeStyle: CSSProperties = {
  background: "#DCFCE7",
  color: "#166534",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const dividerStyle: CSSProperties = {
  height: 1,
  background: "#e2e8f0",
  margin: "14px 0",
};

const footerStyle: CSSProperties = {
  textAlign: "center",
  padding: "30px 12px 40px",
  color: "#64748b",
  fontSize: 14,
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 999,
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: "#fff",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const closeBtnStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 28,
  lineHeight: 1,
  cursor: "pointer",
  color: "#64748b",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
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

const messageBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
};

const resetPasswordBtnStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#0F766E",
  fontWeight: 600,
  marginTop: 12,
  marginBottom: 4,
  width: "100%",
};
