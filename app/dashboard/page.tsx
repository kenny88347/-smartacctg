"use client";

import { CSSProperties, useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TrialInfo = {
  startedAt: number;
  expiresAt: number;
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isTrial, setIsTrial] = useState(false);
  const [trialLeft, setTrialLeft] = useState("");

  useEffect(() => {
    let interval: number | undefined;

    const init = async () => {
      const trialRaw = localStorage.getItem("smartacctg_trial");
      const trial = trialRaw ? (JSON.parse(trialRaw) as TrialInfo) : null;

      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      // 有正式登录
      if (currentSession) {
        setSession(currentSession);
        setUserEmail(currentSession.user.email ?? "");
        return;
      }

      // 没登录，但有试用
      if (trial) {
        const expired = Date.now() >= trial.expiresAt;

        if (expired) {
          clearTrialData();
          window.location.href = "/zh";
          return;
        }

        setIsTrial(true);
        updateTrialLeft(trial);

        interval = window.setInterval(() => {
          const latestRaw = localStorage.getItem("smartacctg_trial");
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

          updateTrialLeft(latestTrial);
        }, 1000);

        return;
      }

      // 两个都没有，回首页
      window.location.href = "/zh";
    };

    init();

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, []);

  function clearTrialData() {
    localStorage.removeItem("smartacctg_trial");
    localStorage.removeItem("smartacctg_trial_records");
    localStorage.removeItem("smartacctg_trial_profile");
  }

  function updateTrialLeft(trial: TrialInfo) {
    const ms = Math.max(trial.expiresAt - Date.now(), 0);
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    setTrialLeft(`${min}分 ${sec}秒`);
  }

  async function handleLogout() {
    clearTrialData();
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  return (
    <main style={pageStyle}>
      <div style={topBarStyle}>
        <div>
          <h1 style={titleStyle}>欢迎来到 Dashboard</h1>
          <p style={subTitleStyle}>
            {isTrial
              ? `你正在使用免费试用版，剩余时间：${trialLeft}`
              : `你已经成功登录 SmartAcctg${userEmail ? `（${userEmail}）` : ""}`}
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
