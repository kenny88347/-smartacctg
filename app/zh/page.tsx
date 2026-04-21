export default function HomePage() {
  return (
    <main style={{ fontFamily: "sans-serif", background: "#f8fafc" }}>
      
      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "20px",
        alignItems: "center"
      }}>
        <h2>SmartAcctg</h2>
        <div>
          <span style={{ marginRight: 10 }}>中</span>
          <span style={{ marginRight: 10 }}>EN</span>
          <span>BM</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
          智能记账 SaaS 系统
        </h1>
        <p style={{ color: "#64748b", marginTop: 10 }}>
          支持个人与商业用户｜记账｜发票｜客户管理｜PDF｜WhatsApp
        </p>
      </section>

      {/* 個人使用 */}
      <section style={{ padding: 20 }}>
        <h3>👤 個人使用</h3>

        {/* 免費 */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 15
        }}>
          <h4>免費版</h4>
          <p>普通記帳</p>
          <p>結餘價格</p>
          <p>本月收入</p>
          <p>本月支出</p>

          <button style={{
            marginTop: 15,
            width: "100%",
            padding: 10,
            background: "#e2e8f0",
            color: "#0f172a",
            borderRadius: 8,
            border: "none"
          }}>
            開始使用
          </button>
        </div>

        {/* 訂閱 */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 15,
          border: "2px solid #0F766E"
        }}>
          <h4>訂閱版</h4>
          <p>多帳號管理</p>
          <p>本月收入 / 支出</p>
          <p>結餘價格</p>
          <p>WhatsApp快速記帳</p>

          {/* 月 */}
          <div style={{ marginTop: 15 }}>
            <h4>RM10/月</h4>
            <button style={{
              marginTop: 6,
              width: "100%",
              padding: 10,
              background: "#0F766E",
              color: "white",
              borderRadius: 8,
              border: "none"
            }}>
              訂閱（月）
            </button>
          </div>

          {/* 年 */}
          <div style={{ marginTop: 15 }}>
            <h4>
              RM100/年{" "}
              <span style={{
                background: "#0F766E",
                color: "white",
                padding: "2px 8px",
                borderRadius: 6,
                fontSize: 12
              }}>
                -16%
              </span>
            </h4>

            <button style={{
              marginTop: 6,
              width: "100%",
              padding: 10,
              background: "#0F766E",
              color: "white",
              borderRadius: 8,
              border: "none"
            }}>
              訂閱（年）
            </button>
          </div>
        </div>
      </section>

      {/* 商業使用 */}
      <section style={{ padding: 20 }}>
        <h3>🏢 商業使用</h3>

        {/* 免費 */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 15
        }}>
          <h4>免費版</h4>
          <p>每日記帳</p>
          <p>結餘價格</p>
          <p>本月收入</p>
          <p>本月支出</p>

          <button style={{
            marginTop: 15,
            width: "100%",
            padding: 10,
            background: "#e2e8f0",
            color: "#0f172a",
            borderRadius: 8,
            border: "none"
          }}>
            開始使用
          </button>
        </div>

        {/* 訂閱 */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 15,
          border: "2px solid #0F766E"
        }}>
          <h4>訂閱版</h4>
          <p>多帳號管理</p>
          <p>WhatsApp記帳</p>
          <p>導出PDF</p>
          <p>發票系統</p>
          <p>客戶管理</p>
          <p>貨源管理</p>

          {/* 月 */}
          <div style={{ marginTop: 15 }}>
            <h4>RM31.99/月</h4>
            <button style={{
              marginTop: 6,
              width: "100%",
              padding: 10,
              background: "#0F766E",
              color: "white",
              borderRadius: 8,
              border: "none"
            }}>
              訂閱（月）
            </button>
          </div>

          {/* 年 */}
          <div style={{ marginTop: 15 }}>
            <h4>
              RM307.10/年{" "}
              <span style={{
                background: "#0F766E",
                color: "white",
                padding: "2px 8px",
                borderRadius: 6,
                fontSize: 12
              }}>
                -20%
              </span>
            </h4>

            <button style={{
              marginTop: 6,
              width: "100%",
              padding: 10,
              background: "#0F766E",
              color: "white",
              borderRadius: 8,
              border: "none"
            }}>
              訂閱（年）
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: 30,
        color: "#64748b"
      }}>
        © NK DIGITAL HUB. All rights reserved.
      </footer>

    </main>
  );
}
