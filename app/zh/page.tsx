"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      
      {/* 标题 */}
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        智能记账 SaaS 系统
      </h1>

      <p style={{ color: "#666" }}>
        支持个人与商业用户｜记账｜发票｜客户管理｜PDF｜WhatsApp
      </p>

      {/* ========================= */}
      {/* 👤 个人使用 */}
      {/* ========================= */}
      <h2 style={{ marginTop: 30 }}>👤 个人使用</h2>

      {/* 免费版 */}
      <div style={card}>
        <h3>免费版</h3>
        <p>普通记账</p>
        <p>结余价格</p>
        <p>本月收入</p>
        <p>本月支出</p>

        <button style={btnOutline}>
          免费使用
        </button>
      </div>

      {/* 订阅版（月） */}
      <div style={cardPrimary}>
        <h3>订阅版（月）</h3>
        <p>多账号管理</p>
        <p>本月收入 / 支出</p>
        <p>结余价格</p>
        <p>WhatsApp快速记账</p>

        <h3>RM10/月</h3>

        <button onClick={handleSignUp} style={btnPrimary}>
          订阅（月）
        </button>
      </div>

      {/* 订阅版（年） */}
      <div style={cardPrimary}>
        <h3>订阅版（年）</h3>
        <p>全部功能</p>

        <h3>
          RM100/年 
          <span style={badge}>-16%</span>
        </h3>

        <button onClick={handleSignUp} style={btnPrimary}>
          订阅（年）
        </button>
      </div>

      {/* ========================= */}
      {/* 🏢 商业使用 */}
      {/* ========================= */}
      <h2 style={{ marginTop: 40 }}>🏢 商业使用</h2>

      {/* 免费版 */}
      <div style={card}>
        <h3>免费版</h3>
        <p>每日记账</p>
        <p>结余价格</p>
        <p>本月收入</p>
        <p>本月支出</p>

        <button style={btnOutline}>
          免费使用
        </button>
      </div>

      {/* 订阅（月） */}
      <div style={cardPrimary}>
        <h3>订阅版（月）</h3>
        <p>多账号管理</p>
        <p>WhatsApp记账</p>
        <p>导出PDF</p>
        <p>发票系统</p>
        <p>客户管理</p>
        <p>货源管理</p>

        <h3>RM31.99/月</h3>

        <button onClick={handleSignUp} style={btnPrimary}>
          订阅（月）
        </button>
      </div>

      {/* 订阅（年） */}
      <div style={cardPrimary}>
        <h3>订阅版（年）</h3>

        <h3>
          RM307.10/年 
          <span style={badge}>-20%</span>
        </h3>

        <button onClick={handleSignUp} style={btnPrimary}>
          订阅（年）
        </button>
      </div>

      {/* 底部 */}
      <p style={{ textAlign: "center", marginTop: 40, color: "#999" }}>
        © NK DIGITAL HUB. All rights reserved.
      </p>

    </div>
  );
}

/* ========================= */
/* 🔥 注册功能 */
/* ========================= */
async function handleSignUp() {
  const email = prompt("请输入邮箱");
  const password = prompt("请输入密码");

  if (!email || !password) return;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert("注册失败：" + error.message);
  } else {
    alert("注册成功！请检查邮箱");
  }
}

/* ========================= */
/* 🎨 UI样式 */
/* ========================= */
const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginTop: 15,
};

const cardPrimary = {
  ...card,
  border: "2px solid #0F766E",
};

const btnPrimary = {
  width: "100%",
  padding: 12,
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  marginTop: 10,
};

const btnOutline = {
  ...btnPrimary,
  background: "#fff",
  color: "#0F766E",
  border: "2px solid #0F766E",
};

const badge = {
  marginLeft: 10,
  background: "#0F766E",
  color: "#fff",
  padding: "2px 8px",
  borderRadius: 8,
  fontSize: 12,
};
