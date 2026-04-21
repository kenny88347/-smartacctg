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
        <h2 style={{ color: "#0f172a" }}>SmartAcctg</h2>
        <div>
          <span style={{ marginRight: 10 }}>中</span>
          <span style={{ marginRight: 10 }}>EN</span>
          <span>BM</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        textAlign: "center",
        padding: "40px 20px"
      }}>
        <h1 style={{ fontSize: 32, fontWeight: "bold", color: "#0f172a" }}>
          智能记账 SaaS 系统
        </h1>
        <p style={{ marginTop: 10, color: "#64748b" }}>
          支持个人与商业用户｜记账｜发票｜客户管理｜PDF｜WhatsApp
        </p>

        <div style={{ marginTop: 20 }}>
          <button style={{
            padding: "10px 20px",
            marginRight: 10,
            borderRadius: 8,
            border: "none",
            background: "#0F766E",
            color: "white"
          }}>
            免费试用
          </button>

          <button style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #cbd5f5",
            background: "white"
          }}>
            登录
          </button>
        </div>
      </section>

      {/* 個人使用 */}
      <section style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 20 }}>👤 個人使用</h3>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          
          {/* 免費 */}
          <div style={{
            flex: 1,
            padding: 20,
            background: "white",
            borderRadius: 12
          }}>
            <h4>免費版</h4>
            <p>普通記帳</p>
            <p>結餘價格</p>
            <p>本月收入</p>
            <p>本月支出</p>
          </div>

          {/* 訂閱 */}
          <div style={{
            flex: 1,
            padding: 20,
            background: "white",
            borderRadius: 12,
            border: "2px solid #0F766E"
          }}>
            <h4>訂閱版</h4>
            <p>多帳號管理</p>
            <p>本月收入 / 支出</p>
            <p>結餘價格</p>
            <p>WhatsApp快速記帳</p>

            <div style={{ marginTop: 15 }}>

              {/* 月費 */}
              <div style={{ marginBottom: 15 }}>
                <h4>RM10/月</h4>
                <button style={{
                  marginTop: 6,
                  padding: "10px",
                  width: "100%",
                  background: "#0F766E",
                  color: "white",
                  border: "none",
                  borderRadius: 8
                }}>
                  訂閱（月）
                </button>
              </div>

              {/* 年費 */}
              <div>
                <h4>
                  RM100/年{" "}
                  <span style={{
                    background: "#0F766E",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 12,
                    marginLeft: 6
                  }}>
                    -16%
                  </span>
                </h4>

                <button style={{
                  marginTop: 6,
                  padding: "10px",
                  width: "100%",
                  background: "#0F766E",
                  color: "white",
                  border: "none",
                  borderRadius: 8
                }}>
                  訂閱（年）
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 商業使用 */}
      <section style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 20 }}>🏢 商業使用</h3>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          
          {/* 免費 */}
          <div style={{
            flex: 1,
            padding: 20,
            background: "white",
            borderRadius: 12
          }}>
            <h4>免費版</h4>
            <p>每日記帳</p>
            <p>結餘價格</p>
            <p>本月收入</p>
            <p>本月支出</p>
          </div>

          {/* 訂閱 */}
          <div style={{
            flex: 1,
            padding: 20,
            background: "white",
            borderRadius: 12,
            border: "2px solid #0F766E"
          }}>
            <h4>訂閱版</h4>
            <p>多帳號管理</p>
            <p>WhatsApp記帳</p>
            <p>導出PDF</p>
            <p>發票系統</p>
            <p>客戶管理</p>
            <p>貨源管理</p>

            <div style={{ marginTop: 15 }}>

              {/* 月費 */}
              <div style={{ marginBottom: 15 }}>
                <h4>RM31.99/月</h4>
                <button style={{
                  marginTop: 6,
                  padding: "10px",
                  width: "100%",
                  background: "#0F766E",
                  color: "white",
                  border: "none",
                  borderRadius: 8
                }}>
                  訂閱（月）
                </button>
              </div>

              {/* 年費 */}
              <div>
                <h4>
                  RM307.10/年{" "}
                  <span style={{
                    background: "#0F766E",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 12,
                    marginLeft: 6
                  }}>
                    -20%
                  </span>
                </h4>

                <button style={{
                  marginTop: 6,
                  padding: "10px",
                  width: "100%",
                  background: "#0F766E",
                  color: "white",
                  border: "none",
                  borderRadius: 8
                }}>
                  訂閱（年）
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "30px 10px",
        marginTop: 40,
        fontSize: 14,
        color: "#64748b"
      }}>
        © NK DIGITAL HUB. All rights reserved.
      </footer>

    </main>
  );
}
