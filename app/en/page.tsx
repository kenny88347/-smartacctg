export default function Page() {
  return (
    <main style={{ padding: 20, fontFamily: "Arial", background: "#f8fafc" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <b style={{ fontSize: 20 }}>SmartAcctg</b>

        <div style={{ display: "flex", gap: 10 }}>
          <a href="/zh">中</a>
          <a href="/en">EN</a>
          <a href="/ms">BM</a>
        </div>
      </nav>

      <section style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36 }}>Smart Accounting SaaS System</h1>
        <p>For personal and business users | Bookkeeping | Invoices | Customer Management | PDF | WhatsApp</p>

        <div style={{ marginTop: 20 }}>
          <button style={{ marginRight: 10 }}>Start Free Trial</button>
          <button>Login</button>
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>👤 Personal Use</h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
            <h3>Free Plan</h3>
            <p>Basic Bookkeeping</p>
            <p>Balance</p>
            <p>Monthly Income</p>
            <p>Monthly Expense</p>
          </div>

          <div style={{ border: "2px solid #0f766e", padding: 20, borderRadius: 10 }}>
            <h3>Subscription Plan</h3>
            <p>Multi-Account Management</p>
            <p>Monthly Income / Expense</p>
            <p>Balance</p>
            <p>WhatsApp Quick Bookkeeping</p>

            <h4>RM10 / month</h4>
            <h4>RM100 / year (-16%)</h4>

            <button>Subscribe</button>
          </div>
        </div>
      </section>

      <section>
        <h2>🏢 Business Use</h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
            <h3>Free Plan</h3>
            <p>Daily Bookkeeping</p>
            <p>Balance</p>
            <p>Monthly Income</p>
            <p>Monthly Expense</p>
          </div>

          <div style={{ border: "2px solid #0f766e", padding: 20, borderRadius: 10 }}>
            <h3>Subscription Plan</h3>
            <p>Multi-Account Management</p>
            <p>WhatsApp Bookkeeping</p>
            <p>Export PDF</p>
            <p>Invoice System</p>
            <p>Customer Management</p>
            <p>Inventory Management</p>

            <h4>RM31.99 / month</h4>
            <h4>RM307.10 / year (-20%)</h4>

            <button>Subscribe</button>
          </div>
        </div>
      </section>
    </main>
  );
}
