"use client";

import { CSSProperties, useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      if (!currentSession) {
        window.location.href = "/zh";
        return;
      }

      setSession(currentSession);
      setUserEmail(currentSession.user.email ?? "");
    };

    init();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  return (
    <main style={pageStyle}>
      <div style={topBarStyle}>
        <div>
          <h1 style={titleStyle}>欢迎来到 Dashboard</h1>
          <p style={subTitleStyle}>
            你已经成功登录 SmartAcctg{userEmail ? `（${userEmail}）` : ""}
          </p>
        </div>

        <button onClick={handleLogout} style={logoutBtnStyle}>
          退出登录
        </button>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3>每日记账</h3>
          <p>这里之后会放你的记账功能。</p>
        </div>

        <div style={cardStyle}>
          <h3>本月收入</h3>
          <p>这里之后会放收入统计。</p>
        </div>

        <div style={cardStyle}>
          <h3>本月支出</h3>
          <p>这里之后会放支出统计。</p>
        </div>

        <div style={cardStyle}>
          <h3>导出 PDF</h3>
          <p>这里之后会放 PDF 导出功能。</p>
        </div>

        <div style={cardStyle}>
          <h3>发票系统</h3>
          <p>这里之后会放发票管理功能。</p>
        </div>

        <div style={cardStyle}>
          <h3>客户管理</h3>
          <p>这里之后会放客户资料功能。</p>
        </div>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "24px",
  fontFamily: "sans-serif",
  color: "#0f172a",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 24,
};

const titleStyle: CSSProperties = {
  fontSize: 30,
  margin: 0,
};

const subTitleStyle: CSSProperties = {
  color: "#64748b",
  marginTop: 12,
};

const logoutBtnStyle: CSSProperties = {
  padding: "10px 18px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gap: 16,
};

const cardStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};
