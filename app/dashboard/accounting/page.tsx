"use client";

import { useEffect } from "react";

export default function AccountingRedirectPage() {
  useEffect(() => {
    const query = window.location.search || "";
    window.location.replace(`/dashboard/records${query}`);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "var(--sa-page-bg, #ecfdf5)",
        color: "var(--sa-text, #064e3b)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      }}
    >
      <section
        style={{
          border: "2px solid var(--sa-border, #14b8a6)",
          borderRadius: "24px",
          padding: "24px",
          background: "var(--sa-card-bg, #ffffff)",
          boxShadow:
            "0 0 0 1px rgba(20,184,166,0.25), 0 16px 36px rgba(20,184,166,0.18)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 900 }}>
          正在打开记账系统...
        </h1>

        <p style={{ marginTop: "12px", fontWeight: 800 }}>
          请稍等，系统会自动跳转到每日记账页面。
        </p>
      </section>
    </main>
  );
}
