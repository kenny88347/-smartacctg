"use client";

import { createClient } from "@supabase/supabase-js";

export default function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignUp() {
    const email = prompt("请输入邮箱");
    const password = prompt("请输入密码");

    if (!email || !password) return;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://smartacctg.vercel.app/zh",
      },
    });

    if (error) {
      alert("注册失败：" + error.message);
    } else {
      alert("注册成功！请检查邮箱确认");
    }
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
      {/* Header */}
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

      {/* Hero */}
      <section style={{ padding: "20px 20px 10px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 12 }}>
          智能记账 SaaS 系统
        </h1>

        <p style={{ color: "#64748b", margin: "0 auto 18px", maxWidth: 680 }}>
          支持个人与商业用户｜记账｜发票｜客户管理｜PDF｜WhatsApp
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={handleSignUp} style={btnPrimary}>
            免费试用
          </button>

          <button style={btnSecondary}>
            登录
          </button>
        </div>
      </section>

      {/* 个人使用 */}
      <section style={{ padding: 20 }}>
        <h3 style={sectionTitle}>👤 个人使用</h3>

        <div style={card}>
          <h4>免费版</h4>
          <p>普通记账</p>
          <p>余额价格</p>
          <p>本月收入</p>
          <p>本月支出</p>

          <button onClick={handleSignUp} style={btnOutline}>
            免费使用
          </button>
        </div>

        <div style={cardPrimary}>
          <h4>订阅（月）</h4>
          <p>多账号管理</p>
          <p>本月收入 / 支出</p>
          <p>余额价格</p>
          <p>WhatsApp快速记账</p>

          <div style={priceRow}>
            <span style={priceText}>RM10/月</span>
            <button onClick={handleSignUp} style={smallBtn}>
              订阅
            </button>
          </div>
        </div>

        <div style={cardPrimary}>
          <h4>订阅（年）</h4>
          <p>多账号管理</p>
          <p>本月收入 / 支出</p>
          <p>余额价格</p>
          <p>WhatsApp快速记账</p>

          <div style={priceRow}>
            <span style={priceText}>
              RM100/年 <span style={badge}>-16%</span>
            </span>
            <button onClick={handleSignUp} style={smallBtn}>
              订阅
            </button>
          </div>
        </div>
      </section>

      {/* 商业使用 */}
      <section style={{ padding: 20 }}>
        <h3 style={sectionTitle}>🏢 商业使用</h3>

        <div style={card}>
          <h4>免费版</h4>
          <p>每日记账</p>
          <p>余额价格</p>
          <p>本月收入</p>
          <p>本月支出</p>

          <button onClick={handleSignUp} style={btnOutline}>
            免费使用
          </button>
        </div>

        <div style={cardPrimary}>
          <h4>订阅（月）</h4>
          <p>多账号管理</p>
          <p>WhatsApp记账</p>
          <p>导出PDF</p>
          <p>发票系统</p>
          <p>客户管理</p>
          <p>货源管理</p>

          <div style={priceRow}>
            <span style={priceText}>RM31.99/月</span>
            <button onClick={handleSignUp} style={smallBtn}>
              订阅
            </button>
          </div>
        </div>

        <div style={cardPrimary}>
          <h4>订阅（年）</h4>
          <p>多账号管理</p>
          <p>WhatsApp记账</p>
          <p>导出PDF</p>
          <p>发票系统</p>
          <p>客户管理</p>
          <p>货源管理</p>

          <div style={priceRow}>
            <span style={priceText}>
              RM307.10/年 <span style={badge}>-20%</span>
            </span>
            <button onClick={handleSignUp} style={smallBtn}>
              订阅
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
};

const btnSecondary = {
  padding: "12px 22px",
  background: "#fff",
  color: "#0F766E",
  border: "2px solid #0F766E",
  borderRadius: 10,
};

const btnOutline = {
  width: "100%",
  padding: 12,
  background: "#fff",
  color: "#0F766E",
  border: "2px solid #0F766E",
  borderRadius: 10,
  marginTop: 10,
};

const smallBtn = {
  padding: "8px 16px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 8,
};

const priceRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginTop: 18,
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
