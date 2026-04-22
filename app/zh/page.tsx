"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  async function handleSignUp() {
    if (!email || !password) {
      alert("请输入邮箱和密码");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://smartacctg.vercel.app/zh",
      },
    });

    setLoading(false);

    if (error) {
      alert("注册失败：" + error.message);
      return;
    }

    alert("注册成功！请检查邮箱确认账号。");
    setShowRegister(false);
    setEmail("");
    setPassword("");
    setSelectedPlan("");
  }

  function openRegister(plan: string) {
    setSelectedPlan(plan);
    setShowRegister(true);
  }

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
        color: "#0f172a",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>SmartAcctg</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/zh" style={langLink}>中</a>
          <a href="/en" style={langLink}>EN</a>
          <a href="/ms" style={langLink}>BM</a>
        </div>
      </header>

      <section style={{ padding: "20px 20px 10px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 12 }}>
          智能记账 SaaS 系统
        </h1>

        <p style={{ color: "#64748b", margin: "0 auto 18px", maxWidth: 680 }}>
          支持个人与商业用户｜记账｜发票｜客户管理｜PDF｜WhatsApp
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => openRegister("免费试用")} style={btnPrimary}>
            免费试用
          </button>

          <button style={btnSecondary}>
            登录
          </button>
        </div>
      </section>

      <section style={{ padding: 20 }}>
        <h3 style={sectionTitle}>👤 个人使用</h3>

        <div style={card}>
          <h4>免费版</h4>
          <p>普通记账</p>
          <p>余额价格</p>
          <p>本月收入</p>
          <p>本月支出</p>

          <button onClick={() => openRegister("个人免费版")} style={btnOutline}>
            免费使用
          </button>
        </div>

        <div style={cardPrimary}>
          <div style={planHeader}>
            <div>
              <h4 style={{ margin: 0 }}>订阅版</h4>
              <p style={mutedText}>多账号管理 / 收支统计 / WhatsApp快速记账</p>
            </div>
            <span style={planBadge}>推荐</span>
          </div>

          <p>多账号管理</p>
          <p>本月收入 / 支出</p>
          <p>余额价格</p>
          <p>WhatsApp快速记账</p>

          <div style={priceBlock}>
            <div style={priceRow}>
              <div>
                <div style={priceText}>RM10 / 月</div>
              </div>
              <button onClick={() => openRegister("个人订阅（月）")} style={smallBtn}>
                订阅
              </button>
            </div>

            <div style={divider} />

            <div style={priceRow}>
              <div>
                <div style={priceText}>
                  RM100 / 年 <span style={badge}>-16%</span>
                </div>
              </div>
              <button onClick={() => openRegister("个人订阅（年）")} style={smallBtn}>
                订阅
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: 20 }}>
        <h3 style={sectionTitle}>🏢 商业使用</h3>

        <div style={card}>
          <h4>免费版</h4>
          <p>每日记账</p>
          <p>余额价格</p>
          <p>本月收入</p>
          <p>本月支出</p>

          <button onClick={() => openRegister("商业免费版")} style={btnOutline}>
            免费使用
          </button>
        </div>

        <div style={cardPrimary}>
          <div style={planHeader}>
            <div>
              <h4 style={{ margin: 0 }}>订阅版</h4>
              <p style={mutedText}>适合门店 / 小团队 / 商业用户</p>
            </div>
            <span style={planBadge}>热门</span>
          </div>

          <p>多账号管理</p>
          <p>WhatsApp记账</p>
          <p>导出PDF</p>
          <p>发票系统</p>
          <p>客户管理</p>
          <p>货源管理</p>

          <div style={priceBlock}>
            <div style={priceRow}>
              <div>
                <div style={priceText}>RM31.99 / 月</div>
              </div>
              <button onClick={() => openRegister("商业订阅（月）")} style={smallBtn}>
                订阅
              </button>
            </div>

            <div style={divider} />

            <div style={priceRow}>
              <div>
                <div style={priceText}>
                  RM307.10 / 年 <span style={badge}>-20%</span>
                </div>
              </div>
              <button onClick={() => openRegister("商业订阅（年）")} style={smallBtn}>
                订阅
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "30px 12px 40px",
          color: "#64748b",
          fontSize: 14,
        }}
      >
        © NK DIGITAL HUB. All rights reserved.
      </footer>

      {showRegister && (
        <div style={overlay}>
          <div style={modal}>
            <div style={modalTop}>
              <div>
                <h3 style={{ margin: 0 }}>注册账号</h3>
                <p style={{ ...mutedText, marginTop: 6 }}>
                  {selectedPlan ? `当前选择：${selectedPlan}` : "创建你的 SmartAcctg 账号"}
                </p>
              </div>
              <button
                onClick={() => setShowRegister(false)}
                style={closeBtn}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={label}>邮箱</label>
              <input
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={input}
              />

              <label style={{ ...label, marginTop: 14 }}>密码</label>
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={input}
              />
            </div>

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
              style={{
                ...btnSecondary,
                width: "100%",
                marginTop: 10,
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

const sectionTitle = {
  fontSize: 22,
  marginBottom: 16,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  marginTop: 15,
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
};

const cardPrimary = {
  ...card,
  border: "2px solid #0F766E",
};

const btnPrimary = {
  padding: "12px 22px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
};

const btnSecondary = {
  padding: "12px 22px",
  background: "#fff",
  color: "#0F766E",
  border: "2px solid #0F766E",
  borderRadius: 10,
  fontWeight: 600,
};

const btnOutline = {
  width: "100%",
  padding: 12,
  background: "#fff",
  color: "#0F766E",
  border: "2px solid #0F766E",
  borderRadius: 10,
  marginTop: 10,
  fontWeight: 600,
};

const smallBtn = {
  padding: "8px 16px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
};

const priceBlock = {
  marginTop: 18,
  background: "#f8fafc",
  borderRadius: 12,
  padding: 14,
};

const priceRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap" as const,
};

const priceText = {
  fontSize: 18,
  fontWeight: 700,
};

const badge = {
  background: "#0F766E",
  color: "#fff",
  padding: "2px 8px",
  borderRadius: 8,
  fontSize: 12,
  marginLeft: 8,
};

const langLink = {
  color: "#0F766E",
  textDecoration: "none",
  fontWeight: 600,
};

const mutedText = {
  color: "#64748b",
  fontSize: 14,
};

const planHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 10,
};

const planBadge = {
  background: "#DCFCE7",
  color: "#166534",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const divider = {
  height: 1,
  background: "#e2e8f0",
  margin: "14px 0",
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 999,
};

const modal = {
  width: "100%",
  maxWidth: 420,
  background: "#fff",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
};

const modalTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const closeBtn = {
  background: "transparent",
  border: "none",
  fontSize: 28,
  lineHeight: 1,
  cursor: "pointer",
  color: "#64748b",
};

const label = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
};

const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 16,
  boxSizing: "border-box" as const,
};
