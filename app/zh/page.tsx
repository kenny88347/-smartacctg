import zh from "@/messages/zh.json";

export default function Page() {
  const t = zh;

  return (
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <nav
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          marginBottom: 40,
          flexWrap: "wrap",
        }}
      >
        <b>SmartAcctg</b>
        <span>{t.nav.home}</span>
        <span>{t.nav.features}</span>
        <span>{t.nav.pricing}</span>
        <span>{t.nav.login}</span>
        <span>{t.nav.register}</span>
      </nav>

      <section style={{ padding: "40px 0" }}>
        <h1 style={{ fontSize: 40, marginBottom: 10 }}>{t.hero.title}</h1>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>{t.hero.subtitle}</h2>
        <p style={{ fontSize: 18, marginBottom: 24 }}>{t.hero.desc}</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            {t.hero.cta1}
          </button>
          <button
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            {t.hero.cta2}
          </button>
        </div>
      </section>
    </main>
  );
}
