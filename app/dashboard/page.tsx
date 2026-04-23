export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
        fontFamily: "sans-serif",
        color: "#0f172a",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>欢迎来到 Dashboard</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        你已经成功登录 SmartAcctg。
      </p>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: 16,
        }}
      >
        <h3>每日记账</h3>
        <p>这里之后会放你的记账功能。</p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: 16,
        }}
      >
        <h3>本月收入</h3>
        <p>这里之后会放收入统计。</p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <h3>本月支出</h3>
        <p>这里之后会放支出统计。</p>
      </div>
    </main>
  );
}
