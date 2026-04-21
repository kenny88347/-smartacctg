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
        <h1 style={{ fontSize: 36 }}>Sistem SaaS Perakaunan Pintar</h1>
        <p>Untuk pengguna peribadi dan perniagaan | Perakaunan | Invois | Pengurusan Pelanggan | PDF | WhatsApp</p>

        <div style={{ marginTop: 20 }}>
          <button style={{ marginRight: 10 }}>Cuba Percuma</button>
          <button>Log Masuk</button>
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>👤 Kegunaan Peribadi</h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
            <h3>Pelan Percuma</h3>
            <p>Rekod Akaun Asas</p>
            <p>Baki</p>
            <p>Pendapatan Bulanan</p>
            <p>Perbelanjaan Bulanan</p>
          </div>

          <div style={{ border: "2px solid #0f766e", padding: 20, borderRadius: 10 }}>
            <h3>Pelan Langganan</h3>
            <p>Pengurusan Berbilang Akaun</p>
            <p>Pendapatan / Perbelanjaan Bulanan</p>
            <p>Baki</p>
            <p>Rekod Akaun Pantas WhatsApp</p>

            <h4>RM10 / bulan</h4>
            <h4>RM100 / tahun (-16%)</h4>

            <button>Langgan</button>
          </div>
        </div>
      </section>

      <section>
        <h2>🏢 Kegunaan Perniagaan</h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
            <h3>Pelan Percuma</h3>
            <p>Rekod Harian</p>
            <p>Baki</p>
            <p>Pendapatan Bulanan</p>
            <p>Perbelanjaan Bulanan</p>
          </div>

          <div style={{ border: "2px solid #0f766e", padding: 20, borderRadius: 10 }}>
            <h3>Pelan Langganan</h3>
            <p>Pengurusan Berbilang Akaun</p>
            <p>Rekod Akaun WhatsApp</p>
            <p>Eksport PDF</p>
            <p>Sistem Invois</p>
            <p>Pengurusan Pelanggan</p>
            <p>Pengurusan Stok</p>

            <h4>RM31.99 / bulan</h4>
            <h4>RM307.10 / tahun (-20%)</h4>

            <button>Langgan</button>
          </div>
        </div>
      </section>
    </main>
  );
}
