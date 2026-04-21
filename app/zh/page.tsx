export default function Page() {
  return (
    <main style={{ padding: 20, fontFamily: "Arial", background: "#f8fafc" }}>
      
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <b style={{ fontSize: 20 }}>SmartAcctg</b>

        <div style={{ display: "flex", gap: 10 }}>
          <a href="/zh">中</a>
          <a href="/en">EN</a>
          <a href="/ms">BM</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36 }}>智能记账 SaaS 系统</h1>
        <p>支持个人与商业用户｜记账｜发票｜客户管理｜PDF｜WhatsApp</p>

        <div style={{ marginTop: 20 }}>
          <button style={{ marginRight: 10 }}>免费试用</button>
          <button>登录</button>
        </div>
      </section>

      {/* Personal Plan */}
      <section style={{ marginBottom: 40 }}>
        <h2>👤 個人使用</h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          
          {/* Free */}
          <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
            <h3>免費版</h3>
            <p>普通記帳</p>
            <p>結餘價格</p>
            <p>本月收入</p>
            <p>本月支出</p>
          </div>

          {/* Pro */}
          <div style={{ border: "2px solid #0f766e", padding: 20, borderRadius: 10 }}>
            <h3>訂閱版</h3>
            <p>多帳號管理</p>
            <p>本月收入 / 支出</p>
            <p>結餘價格</p>
            <p>WhatsApp快速記帳</p>

            <h4>RM10/月</h4>
            <h4>RM100/年（-16%）</h4>

            <button>訂閱</button>
          </div>

        </div>
      </section>

      {/* Business Plan */}
      <section>
        <h2>🏢 商業使用</h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          
          {/* Free */}
          <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
            <h3>免費版</h3>
            <p>每日記帳</p>
            <p>結餘價格</p>
            <p>本月收入</p>
            <p>本月支出</p>
          </div>

          {/* Pro */}
          <div style={{ border: "2px solid #0f766e", padding: 20, borderRadius: 10 }}>
            <h3>訂閱版</h3>
            <p>多帳號管理</p>
            <p>WhatsApp記帳</p>
            <p>導出PDF</p>
            <p>發票系統</p>
            <p>客戶管理</p>
            <p>貨源管理</p>

            <h4>RM31.99/月</h4>
            <h4>RM307.10/年（-20%）</h4>

            <button>訂閱</button>
          </div>

        </div>
      </section>

    </main>
  );
}
