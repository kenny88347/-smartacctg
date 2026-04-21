export default function Page() {
  return (
    <main style={{ fontFamily: "Arial", background: "#f1f5f9", minHeight: "100vh" }}>

      {/* Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "16px 24px",
        background: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>
        <b style={{ fontSize: 20, color: "#0f172a" }}>SmartAcctg</b>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/zh">中</a>
          <a href="/en">EN</a>
          <a href="/ms">BM</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "50px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 36, fontWeight: "bold", color: "#0f172a" }}>
          智能记账 SaaS 系统
        </h1>

        <p style={{ marginTop: 10, color: "#475569" }}>
          支持个人与商业用户｜记账｜发票｜客户管理｜PDF｜WhatsApp
        </p>

        <div style={{ marginTop: 20 }}>
          <button style={{
            background: "#0F766E",
            color: "white",
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            marginRight: 10,
            fontWeight: "bold"
          }}>
            免费试用
          </button>

          <button style={{
            background: "white",
            border: "1px solid #ccc",
            padding: "12px 24px",
            borderRadius: 8
          }}>
            登录
          </button>
        </div>
      </section>

      {/* Personal */}
      <section style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 20 }}>👤 個人使用</h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

          {/* Free */}
          <div style={{
            flex: 1,
            background: "white",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
          }}>
            <h3>免費版</h3>
            <p>普通記帳</p>
            <p>結餘價格</p>
            <p>本月收入</p>
            <p>本月支出</p>
          </div>

          {/* Pro */}
          <div style={{
            flex: 1,
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "2px solid #0F766E",
            boxShadow: "0 6px 14px rgba(0,0,0,0.08)"
          }}>
            <h3>訂閱版</h3>
            <p>多帳號管理</p>
            <p>本月收入 / 支出</p>
            <p>結餘價格</p>
            <p>WhatsApp快速記帳</p>

            <h4 style={{ marginTop: 10 }}>RM10/月</h4>
            <h4>RM100/年（-16%）</h4>

            <button style={{
              marginTop: 10,
              background: "#0F766E",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none"
            }}>
              訂閱
            </button>
          </div>

        </div>
      </section>

      {/* Business */}
      <section style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 20 }}>🏢 商業使用</h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

          {/* Free */}
          <div style={{
            flex: 1,
            background: "white",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
          }}>
            <h3>免費版</h3>
            <p>每日記帳</p>
            <p>結餘價格</p>
            <p>本月收入</p>
            <p>本月支出</p>
          </div>

          {/* Pro */}
          <div style={{
            flex: 1,
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "2px solid #0F766E",
            boxShadow: "0 6px 14px rgba(0,0,0,0.08)"
          }}>
            <h3>訂閱版</h3>
            <p>多帳號管理</p>
            <p>WhatsApp記帳</p>
            <p>導出PDF</p>
            <p>發票系統</p>
            <p>客戶管理</p>
            <p>貨源管理</p>

            <h4 style={{ marginTop: 10 }}>RM31.99/月</h4>
            <h4>RM307.10/年（-20%）</h4>

            <button style={{
              marginTop: 10,
              background: "#0F766E",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none"
            }}>
              訂閱
            </button>
          </div>

        </div>
      </section>

    </main>
  );
}
