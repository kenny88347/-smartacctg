"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TrialInfo = {
  startedAt: number;
  expiresAt: number;
};

type Txn = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  note: string;
};

type TabKey =
  | "daily"
  | "income"
  | "expense"
  | "pdf"
  | "invoice"
  | "customer";

const STORAGE_KEY = "smartacctg_trial_records";

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isTrial, setIsTrial] = useState(false);
  const [trialLeft, setTrialLeft] = useState("");
  const [trialPercent, setTrialPercent] = useState(100);

  const [activeTab, setActiveTab] = useState<TabKey>("daily");

  const [records, setRecords] = useState<Txn[]>([]);
  const [date, setDate] = useState("");
  const [type, setType] = useState("收款");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const [customers, setCustomers] = useState<
    { id: string; name: string; phone: string; address: string; note: string }[]
  >([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [invoices, setInvoices] = useState<
    { id: string; customer: string; item: string; amount: string }[]
  >([]);
  const [invoiceCustomer, setInvoiceCustomer] = useState("");
  const [invoiceItem, setInvoiceItem] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");

  useEffect(() => {
    let interval: number | undefined;

    const init = async () => {
      const trialRaw = localStorage.getItem("smartacctg_trial");
      const trial = trialRaw ? (JSON.parse(trialRaw) as TrialInfo) : null;

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecords(parsed.records || []);
        setCustomers(parsed.customers || []);
        setInvoices(parsed.invoices || []);
      }

      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      if (currentSession) {
        setSession(currentSession);
        setUserEmail(currentSession.user.email ?? "");
        return;
      }

      if (trial) {
        const expired = Date.now() >= trial.expiresAt;

        if (expired) {
          clearTrialData();
          window.location.href = "/zh";
          return;
        }

        setIsTrial(true);
        updateTrialBar(trial);

        interval = window.setInterval(() => {
          const latestRaw = localStorage.getItem("smartacctg_trial");
          const latestTrial = latestRaw ? (JSON.parse(latestRaw) as TrialInfo) : null;

          if (!latestTrial) {
            window.location.href = "/zh";
            return;
          }

          const isExpired = Date.now() >= latestTrial.expiresAt;

          if (isExpired) {
            clearTrialData();
            window.location.href = "/zh";
            return;
          }

          updateTrialBar(latestTrial);
        }, 1000);

        return;
      }

      window.location.href = "/zh";
    };

    init();

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        records,
        customers,
        invoices,
      })
    );
  }, [records, customers, invoices]);

  function clearTrialData() {
    localStorage.removeItem("smartacctg_trial");
    localStorage.removeItem("smartacctg_trial_records");
    localStorage.removeItem("smartacctg_trial_profile");
  }

  function updateTrialBar(trial: TrialInfo) {
    const totalMs = trial.expiresAt - trial.startedAt;
    const leftMs = Math.max(trial.expiresAt - Date.now(), 0);
    const totalSec = Math.floor(leftMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    setTrialLeft(`${min}分 ${sec}秒`);

    const pct = Math.max((leftMs / totalMs) * 100, 0);
    setTrialPercent(pct);
  }

  async function handleLogout() {
    clearTrialData();
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  function addRecord() {
    if (!date || !amount || !category) return;

    const newRecord: Txn = {
      id: String(Date.now()),
      date,
      type,
      amount,
      category,
      note,
    };

    setRecords((prev) => [newRecord, ...prev]);
    setDate("");
    setType("收款");
    setAmount("");
    setCategory("");
    setNote("");
  }

  function addCustomer() {
    if (!customerName) return;

    setCustomers((prev) => [
      {
        id: String(Date.now()),
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        note: customerNote,
      },
      ...prev,
    ]);

    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerNote("");
  }

  function addInvoice() {
    if (!invoiceCustomer || !invoiceItem || !invoiceAmount) return;

    setInvoices((prev) => [
      {
        id: String(Date.now()),
        customer: invoiceCustomer,
        item: invoiceItem,
        amount: invoiceAmount,
      },
      ...prev,
    ]);

    setInvoiceCustomer("");
    setInvoiceItem("");
    setInvoiceAmount("");
  }

  const totalIncome = useMemo(() => {
    return records
      .filter((r) => r.type === "收款")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [records]);

  const totalExpense = useMemo(() => {
    return records
      .filter((r) => r.type === "付款")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [records]);

  return (
    <main style={pageStyle}>
      {isTrial && (
        <div style={trialWrapStyle}>
          <div style={trialTopRowStyle}>
            <span style={trialLabelStyle}>免费试用版</span>
            <span style={trialTimeStyle}>剩余时间：{trialLeft}</span>
          </div>
          <div style={trialBarBgStyle}>
            <div
              style={{
                ...trialBarFillStyle,
                width: `${trialPercent}%`,
              }}
            />
          </div>
        </div>
      )}

      <div style={topBarStyle}>
        <div>
          <h1 style={titleStyle}>欢迎来到 Dashboard</h1>
          <p style={subTitleStyle}>
            {isTrial
              ? "你正在使用免费试用版，全部功能已开放"
              : `你已经成功登录 SmartAcctg${userEmail ? `（${userEmail}）` : ""}`}
          </p>
        </div>

        <button onClick={handleLogout} style={logoutBtnStyle}>
          退出登录
        </button>
      </div>

      <div style={menuGridStyle}>
        <button style={menuBtn(activeTab === "daily")} onClick={() => setActiveTab("daily")}>
          每日记账
        </button>
        <button style={menuBtn(activeTab === "income")} onClick={() => setActiveTab("income")}>
          本月收入
        </button>
        <button style={menuBtn(activeTab === "expense")} onClick={() => setActiveTab("expense")}>
          本月支出
        </button>
        <button style={menuBtn(activeTab === "pdf")} onClick={() => setActiveTab("pdf")}>
          导出 PDF
        </button>
        <button style={menuBtn(activeTab === "invoice")} onClick={() => setActiveTab("invoice")}>
          发票系统
        </button>
        <button style={menuBtn(activeTab === "customer")} onClick={() => setActiveTab("customer")}>
          客户管理
        </button>
      </div>

      {activeTab === "daily" && (
        <section style={sectionCardStyle}>
          <h3>每日记账</h3>

          <div style={formGridStyle}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
              <option value="收款">收款</option>
              <option value="付款">付款</option>
            </select>
            <input
              placeholder="金额（RM）"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="分类"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="备注"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button onClick={addRecord} style={primaryBtnStyle}>
            新增记录
          </button>

          <div style={{ marginTop: 18 }}>
            {records.length === 0 ? (
              <p style={emptyTextStyle}>还没有记录</p>
            ) : (
              records.map((r) => (
                <div key={r.id} style={listItemStyle}>
                  <div>
                    <strong>{r.type}</strong> · {r.category}
                    <div style={mutedTextStyle}>
                      {r.date} {r.note ? `· ${r.note}` : ""}
                    </div>
                  </div>
                  <strong>RM {r.amount}</strong>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "income" && (
        <section style={sectionCardStyle}>
          <h3>本月收入</h3>
          <div style={bigStatStyle}>RM {totalIncome.toFixed(2)}</div>
          <p style={mutedTextStyle}>这里统计所有「收款」记录。</p>
        </section>
      )}

      {activeTab === "expense" && (
        <section style={sectionCardStyle}>
          <h3>本月支出</h3>
          <div style={bigStatStyle}>RM {totalExpense.toFixed(2)}</div>
          <p style={mutedTextStyle}>这里统计所有「付款」记录。</p>
        </section>
      )}

      {activeTab === "pdf" && (
        <section style={sectionCardStyle}>
          <h3>导出 PDF</h3>
          <p style={mutedTextStyle}>当前先做可点击版本，后面再接真正 PDF 导出。</p>
          <button
            style={primaryBtnStyle}
            onClick={() => {
              alert("导出 PDF 功能下一步可继续接上");
            }}
          >
            导出 PDF
          </button>
        </section>
      )}

      {activeTab === "invoice" && (
        <section style={sectionCardStyle}>
          <h3>发票系统</h3>

          <div style={formGridStyle}>
            <input
              placeholder="客户名称"
              value={invoiceCustomer}
              onChange={(e) => setInvoiceCustomer(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="项目 / 产品"
              value={invoiceItem}
              onChange={(e) => setInvoiceItem(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="金额（RM）"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button onClick={addInvoice} style={primaryBtnStyle}>
            新增发票
          </button>

          <div style={{ marginTop: 18 }}>
            {invoices.length === 0 ? (
              <p style={emptyTextStyle}>还没有发票</p>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} style={listItemStyle}>
                  <div>
                    <strong>{inv.customer}</strong>
                    <div style={mutedTextStyle}>{inv.item}</div>
                  </div>
                  <strong>RM {inv.amount}</strong>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "customer" && (
        <section style={sectionCardStyle}>
          <h3>客户管理</h3>

          <div style={formGridStyle}>
            <input
              placeholder="姓名"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="电话号码"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="地址"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="备注"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button onClick={addCustomer} style={primaryBtnStyle}>
            新增客户
          </button>

          <div style={{ marginTop: 18 }}>
            {customers.length === 0 ? (
              <p style={emptyTextStyle}>还没有客户资料</p>
            ) : (
              customers.map((c) => (
                <div key={c.id} style={listItemStyle}>
                  <div>
                    <strong>{c.name}</strong>
                    <div style={mutedTextStyle}>
                      {c.phone || "未填电话"} {c.address ? `· ${c.address}` : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "20px",
  fontFamily: "sans-serif",
  color: "#0f172a",
};

const trialWrapStyle: CSSProperties = {
  background: "#dcfce7",
  border: "1px solid #86efac",
  borderRadius: 16,
  padding: 14,
  marginBottom: 18,
};

const trialTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 10,
  flexWrap: "wrap",
};

const trialLabelStyle: CSSProperties = {
  color: "#166534",
  fontWeight: 800,
};

const trialTimeStyle: CSSProperties = {
  color: "#166534",
  fontWeight: 700,
};

const trialBarBgStyle: CSSProperties = {
  width: "100%",
  height: 12,
  borderRadius: 999,
  background: "#bbf7d0",
  overflow: "hidden",
};

const trialBarFillStyle: CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "#0F766E",
  transition: "width 1s linear",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 20,
};

const titleStyle: CSSProperties = {
  fontSize: 30,
  margin: 0,
};

const subTitleStyle: CSSProperties = {
  color: "#64748b",
  marginTop: 10,
};

const logoutBtnStyle: CSSProperties = {
  padding: "10px 18px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
};

const menuGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const menuBtn = (active: boolean): CSSProperties => ({
  padding: "14px 12px",
  borderRadius: 12,
  border: active ? "2px solid #0F766E" : "1px solid #cbd5e1",
  background: active ? "#ecfdf5" : "#fff",
  color: active ? "#0F766E" : "#0f172a",
  fontWeight: 700,
});

const sectionCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 16,
  boxSizing: "border-box",
};

const primaryBtnStyle: CSSProperties = {
  marginTop: 14,
  padding: "12px 18px",
  background: "#0F766E",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
};

const listItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
};

const mutedTextStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  marginTop: 4,
};

const emptyTextStyle: CSSProperties = {
  color: "#64748b",
};

const bigStatStyle: CSSProperties = {
  fontSize: 36,
  fontWeight: 900,
  color: "#0F766E",
  marginTop: 14,
};
