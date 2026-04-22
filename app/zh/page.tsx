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
    });

    if (error) {
      alert("注册失败：" + error.message);
    } else {
      alert("注册成功！请检查邮箱");
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>

      <h1>智能记账 SaaS 系统</h1>

      <h2>👤 个人使用</h2>

      <div style={card}>
        <h3>免费版</h3>
        <button style={btnOutline}>免费使用</button>
      </div>

      <div style={cardPrimary}>
        <h3>订阅版（月）</h3>
        <p>RM10/月</p>
        <button onClick={handleSignUp} style={btnPrimary}>
          订阅（月）
        </button>
      </div>

      <div style={cardPrimary}>
        <h3>订阅版（年）</h3>
        <p>RM100/年 (-16%)</p>
        <button onClick={handleSignUp} style={btnPrimary}>
          订阅（年）
        </button>
      </div>

      <h2>🏢 商业使用</h2>

      <div style={card}>
        <h3>免费版</h3>
        <button style={btnOutline}>免费使用</button>
      </div>

      <div style={cardPrimary}>
        <h3>订阅（月）</h3>
        <p>RM31.99/月</p>
        <button onClick={handleSignUp} style={btnPrimary}>
          订阅（月）
        </button>
      </div>

      <div style={cardPrimary}>
        <h3>订阅（年）</h3>
        <p>RM307.10/年 (-20%)</p>
        <button onClick={handleSignUp} style={btnPrimary}>
          订阅（年）
        </button>
      </div>

      <p style={{ textAlign: "center", marginTop: 40 }}>
        © NK DIGITAL HUB. All rights reserved.
      </p>

    </div>
  );
}

/* UI */
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
