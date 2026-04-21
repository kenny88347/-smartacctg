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

      {/* 个人使用 */}
      <section style={{ padding: 20 }}>
        <h3>👤 个人使用</h3>

        {/* 免费 */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 15
        }}>
          <h4>免费版</h4>
          <p>普通记账</p>
          <p>余额价格</p>
          <p>本月收入</p>
          <p>本月支出</p>

          <button style={{
            marginTop: 15,
            width: "100%",
            padding: 10,
            background: "#0F766E",
            color: "white",
            borderRadius: 8,
            border: "none"
          }}>
            开始使用
          </button>
        </div>

        {/* 订阅 */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 15,
          border: "2px solid #0F766E"
        }}>
          <h4>订阅版</h4>
          <p>多账号管理</p>
          <p>本月收入 / 支出</p>
          <p>余额价格</p>
          <p>WhatsApp快速记账</p>

          {/* 月 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 15
          }}>
            <h4>RM10/月</h4>
            <button style={{
              padding: "6px 14px",
              background: "#0F766E",
              color: "white",
              borderRadius: 6,
              border: "none"
            }}>
              订阅
            </button>
          </div>

          {/* 年 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10
          }}>
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
              padding: "6px 14px",
              background: "#0F766E",
              color: "white",
              borderRadius: 6,
              border: "none"
            }}>
              订阅
            </button>
          </div>
        </div>
      </section>

      {/* 商业使用 */}
      <section style={{ padding: 20 }}>
        <h3>🏢 商业使用</h3>

        {/* 免费 */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 15
        }}>
          <h4>免费版</h4>
          <p>每日记账</p>
          <p>余额价格</p>
          <p>本月收入</p>
          <p>本月支出</p>

          <button style={{
            marginTop: 15,
            width: "100%",
            padding: 10,
            background: "#0F766E",
            color: "white",
            borderRadius: 8,
            border: "none"
          }}>
            开始使用
          </button>
        </div>

        {/* 订阅 */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 15,
          border: "2px solid #0F766E"
        }}>
          <h4>订阅版</h4>
          <p>多账号管理</p>
          <p>WhatsApp记账</p>
          <p>导出PDF</p>
          <p>发票系统</p>
          <p>客户管理</p>
          <p>货源管理</p>

          {/* 月 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 15
          }}>
            <h4>RM31.99/月</h4>
            <button style={{
              padding: "6px 14px",
              background: "#0F766E",
              color: "white",
              borderRadius: 6,
              border: "none"
            }}>
              订阅
            </button>
          </div>

          {/* 年 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10
          }}>
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
              padding: "6px 14px",
              background: "#0F766E",
              color: "white",
              borderRadius: 6,
              border: "none"
            }}>
              订阅
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
