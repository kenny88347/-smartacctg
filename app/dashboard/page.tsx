"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type TabKey =
  | "overview"
  | "daily"
  | "customers"
  | "products"
  | "invoices"
  | "settings"
  | "themes";

type Txn = {
  id: string;
  user_id: string;
  txn_date: string;
  txn_type: "income" | "expense";
  amount: number;
  category_name: string | null;
  debt_amount: number | null;
  note: string | null;
};

type Customer = {
  id: string;
  user_id: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  tags: string[] | null;
  debt_amount: number | null;
  note: string | null;
};

type Product = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  cost: number;
  discount: number | null;
  image_url: string | null;
  note: string | null;
};

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  theme: string | null;
  company_name: string | null;
  company_reg_no: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_address: string | null;
  company_logo_url: string | null;
  plan_type: string | null;
  plan_expiry: string | null;
};

type ThemePackKey =
  | "cutePink"
  | "blackGold"
  | "pandaChina"
  | "nature";

const THEME_PACKS: Record<
  ThemePackKey,
  {
    name: string;
    pageBg: string;
    heroBg: string;
    cardBg: string;
    cardBorder: string;
    accent: string;
    text: string;
    subText: string;
    bannerText: string;
    preview: string;
  }
> = {
  cutePink: {
    name: "可爱粉色",
    pageBg: "#fff7fb",
    heroBg: "linear-gradient(135deg, #ffd6e7 0%, #ffeaf3 100%)",
    cardBg: "#ffffff",
    cardBorder: "#f9a8d4",
    accent: "#db2777",
    text: "#4a044e",
    subText: "#831843",
    bannerText: "#831843",
    preview: "粉嫩、柔和、可爱",
  },
  blackGold: {
    name: "黑金商务",
    pageBg: "#0f0f10",
    heroBg: "linear-gradient(135deg, #1c1c1f 0%, #2a2112 100%)",
    cardBg: "#17171a",
    cardBorder: "#d4af37",
    accent: "#d4af37",
    text: "#f8f5ee",
    subText: "#d6c8a4",
    bannerText: "#f8f5ee",
    preview: "高端、稳重、商务",
  },
  pandaChina: {
    name: "熊猫中国风",
    pageBg: "#f6f4ef",
    heroBg: "linear-gradient(135deg, #ffffff 0%, #ece7dc 100%)",
    cardBg: "#ffffff",
    cardBorder: "#111827",
    accent: "#b91c1c",
    text: "#111827",
    subText: "#57534e",
    bannerText: "#111827",
    preview: "东方、干净、书卷感",
  },
  nature: {
    name: "风景自然系",
    pageBg: "#f0fdf4",
    heroBg: "linear-gradient(135deg, #d9f99d 0%, #bae6fd 100%)",
    cardBg: "#ffffff",
    cardBorder: "#16a34a",
    accent: "#0f766e",
    text: "#14532d",
    subText: "#166534",
    bannerText: "#14532d",
    preview: "清新、自然、舒服",
  },
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const [themePack, setThemePack] = useState<ThemePackKey>("nature");

  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [txDate, setTxDate] = useState("");
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("");
  const [txDebt, setTxDebt] = useState("");
  const [txNote, setTxNote] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerTags, setCustomerTags] = useState("");
  const [customerDebt, setCustomerDebt] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCost, setProductCost] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [productNote, setProductNote] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "">("");

  const theme = THEME_PACKS[themePack];

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      if (!currentSession) {
        window.location.href = "/zh";
        return;
      }

      setSession(currentSession);

      const userId = currentSession.user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setCompanyName(profileData.company_name || "");
        setCompanyRegNo(profileData.company_reg_no || "");
        setCompanyPhone(profileData.company_phone || "");
        setCompanyEmail(profileData.company_email || "");
        setCompanyAddress(profileData.company_address || "");
        if (profileData.theme && THEME_PACKS[profileData.theme as ThemePackKey]) {
          setThemePack(profileData.theme as ThemePackKey);
        }
      }

      await loadTransactions(userId);
      await loadCustomers(userId);
      await loadProducts(userId);
    };

    init();
  }, []);

  async function loadTransactions(userId: string) {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setTransactions((data || []) as Txn[]);
  }

  async function loadCustomers(userId: string) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setCustomers((data || []) as Customer[]);
  }

  async function loadProducts(userId: string) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setProducts((data || []) as Product[]);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/zh";
  }

  async function addTransaction() {
    if (!session) return;
    if (!txDate || !txAmount || !txCategory) return;

    const amount = Number(txAmount);
    const debt = Number(txDebt || 0);

    await supabase.from("transactions").insert({
      user_id: session.user.id,
      txn_date: txDate,
      txn_type: txType,
      amount,
      category_name: txCategory,
      debt_amount: debt,
      note: txNote,
    });

    setTxDate("");
    setTxType("income");
    setTxAmount("");
    setTxCategory("");
    setTxDebt("");
    setTxNote("");

    await loadTransactions(session.user.id);
  }

  async function deleteTransaction(id: string) {
    await supabase.from("transactions").delete().eq("id", id);
    if (session) await loadTransactions(session.user.id);
  }

  async function addCustomer() {
    if (!session) return;
    if (!customerName) return;

    await supabase.from("customers").insert({
      user_id: session.user.id,
      name: customerName,
      company_name: customerCompany,
      phone: customerPhone,
      email: customerEmail,
      address: customerAddress,
      tags: customerTags
        ? customerTags.split(",").map((x) => x.trim()).filter(Boolean)
        : [],
      debt_amount: Number(customerDebt || 0),
      note: customerNote,
    });

    setCustomerName("");
    setCustomerCompany("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
    setCustomerTags("");
    setCustomerDebt("");
    setCustomerNote("");

    await loadCustomers(session.user.id);
  }

  async function addProduct() {
    if (!session) return;
    if (!productName || !productPrice || !productCost) return;

    await supabase.from("products").insert({
      user_id: session.user.id,
      name: productName,
      price: Number(productPrice),
      cost: Number(productCost),
      discount: Number(productDiscount || 0),
      note: productNote,
    });

    setProductName("");
    setProductPrice("");
    setProductCost("");
    setProductDiscount("");
    setProductNote("");

    await loadProducts(session.user.id);
  }

  async function saveProfile() {
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        company_name: companyName,
        company_reg_no: companyRegNo,
        company_phone: companyPhone,
        company_email: companyEmail,
        company_address: companyAddress,
      })
      .eq("id", session.user.id);

    if (error) {
      setMsg("保存资料失败：" + error.message);
      setMsgType("error");
      return;
    }

    setMsg("资料保存成功");
    setMsgType("success");
  }

  async function changePassword() {
    if (!newPassword || newPassword.length < 6) {
      setMsg("新密码至少 6 位");
      setMsgType("error");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMsg("修改密码失败：" + error.message);
      setMsgType("error");
      return;
    }

    setMsg("密码修改成功");
    setMsgType("success");
    setNewPassword("");
  }

  async function saveTheme(newTheme: ThemePackKey) {
    if (!session) return;

    setThemePack(newTheme);

    await supabase
      .from("profiles")
      .update({ theme: newTheme })
      .eq("id", session.user.id);
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    if (!session) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const filePath = `${session.user.id}/avatar-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("company-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      setMsg("头像上传失败：" + error.message);
      setMsgType("error");
      return;
    }

    const { data } = supabase.storage.from("company-assets").getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", session.user.id);

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            avatar_url: data.publicUrl,
          }
        : prev
    );

    setMsg("头像上传成功");
    setMsgType("success");
  }

  async function uploadCompanyLogo(e: React.ChangeEvent<HTMLInputElement>) {
    if (!session) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const filePath = `${session.user.id}/company-logo-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("company-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      setMsg("公司标识上传失败：" + error.message);
      setMsgType("error");
      return;
    }

    const { data } = supabase.storage.from("company-assets").getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ company_logo_url: data.publicUrl })
      .eq("id", session.user.id);

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            company_logo_url: data.publicUrl,
          }
        : prev
    );

    setMsg("公司标识上传成功");
    setMsgType("success");
  }

  const totalIncome = useMemo(() => {
    return transactions
      .filter((r) => r.txn_type === "income")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((r) => r.txn_type === "expense")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [transactions]);

  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return transactions.filter((r) => r.txn_date.startsWith(ym));
  }, [transactions]);

  const monthIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((r) => r.txn_type === "income")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [currentMonthTransactions]);

  const monthExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((r) => r.txn_type === "expense")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [currentMonthTransactions]);

  const expiryText = profile?.plan_expiry
    ? new Date(profile.plan_expiry).toLocaleDateString()
    : "未订阅";

  return (
    <main
      style={{
        ...pageStyle,
        background: theme.pageBg,
        color: theme.text,
      }}
    >
      <div
        style={{
          ...heroCardStyle,
          background: theme.heroBg,
          color: theme.bannerText,
        }}
      >
        <div>
          <h1 style={titleStyle}>Dashboard</h1>
          <p style={{ ...subTitleStyle, color: theme.subText }}>
            欢迎回来{profile?.full_name ? `，${profile.full_name}` : ""}，
            订阅到期：{expiryText}
          </p>
        </div>

        <div style={topRightStyle}>
          <div style={{ color: theme.subText, fontWeight: 700 }}>
            到期：{expiryText}
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAvatarMenu((v) => !v)}
              style={avatarBtnStyle}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  style={avatarImgStyle}
                />
              ) : (
                "👤"
              )}
            </button>

            {showAvatarMenu && (
              <div style={avatarMenuStyle}>
                <label style={menuUploadLabel}>
                  换头像
                  <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: "none" }} />
                </label>

                <button style={avatarMenuItemStyle} onClick={() => setActiveTab("settings")}>
                  公司资料 / 密码
                </button>

                <button style={avatarMenuItemStyle} onClick={() => setActiveTab("themes")}>
                  换主题
                </button>

                <button style={avatarMenuItemStyle} onClick={handleLogout}>
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={statsGridStyle}>
        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>当前余额</div>
          <div style={{ ...statValueStyle, color: theme.accent }}>RM {balance.toFixed(2)}</div>
        </div>

        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>本月收入</div>
          <div style={{ ...statValueStyle, color: "#16a34a" }}>RM {monthIncome.toFixed(2)}</div>
        </div>

        <div style={{ ...statCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={statLabelStyle}>本月支出</div>
          <div style={{ ...statValueStyle, color: "#dc2626" }}>RM {monthExpense.toFixed(2)}</div>
        </div>
      </div>

      <div style={menuGridStyle}>
        <button style={menuBtn(activeTab === "overview", theme)} onClick={() => setActiveTab("overview")}>
          总览
        </button>
        <button style={menuBtn(activeTab === "daily", theme)} onClick={() => setActiveTab("daily")}>
          每日记账
        </button>
        <button style={menuBtn(activeTab === "customers", theme)} onClick={() => setActiveTab("customers")}>
          客户管理
        </button>
        <button style={menuBtn(activeTab === "products", theme)} onClick={() => setActiveTab("products")}>
          产品管理
        </button>
        <button style={menuBtn(activeTab === "invoices", theme)} onClick={() => setActiveTab("invoices")}>
          发票系统
        </button>
        <button style={menuBtn(activeTab === "settings", theme)} onClick={() => setActiveTab("settings")}>
          设定
        </button>
        <button style={menuBtn(activeTab === "themes", theme)} onClick={() => setActiveTab("themes")}>
          主题切换
        </button>
      </div>

      {activeTab === "overview" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>总览</h3>
          <p style={{ ...mutedTextStyle, color: theme.subText }}>
            这里会根据你的记账记录自动更新金额。
          </p>

          <div style={overviewBoxGridStyle}>
            <div style={previewBox(theme)}>
              <h4>首页 Banner 预览</h4>
              <div style={bannerPreview(theme)}>SmartAcctg Banner</div>
            </div>

            <div style={previewBox(theme)}>
              <h4>个人卡片背景预览</h4>
              <div style={smallCardPreview(theme)}>个人卡片背景</div>
            </div>

            <div style={previewBox(theme)}>
              <h4>名片封面预览</h4>
              <div style={nameCardPreview(theme)}>名片封面</div>
            </div>

            <div style={previewBox(theme)}>
              <h4>Container 背景预览</h4>
              <div style={containerPreview(theme)}>某些 container 背景图</div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "daily" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>每日记账</h3>

          <div style={formGridStyle}>
            <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} style={inputStyle} />
            <select value={txType} onChange={(e) => setTxType(e.target.value as "income" | "expense")} style={inputStyle}>
              <option value="income">收款</option>
              <option value="expense">付款</option>
            </select>
            <input
              placeholder="金额（RM）"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="分类 / 标签"
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="欠款（可留空）"
              value={txDebt}
              onChange={(e) => setTxDebt(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="备注"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            onClick={addTransaction}
            style={{
              ...primaryBtnStyle,
              background: theme.accent,
            }}
          >
            新增记录
          </button>

          <div style={{ marginTop: 18 }}>
            {transactions.length === 0 ? (
              <p style={{ ...emptyTextStyle, color: theme.subText }}>还没有记录</p>
            ) : (
              transactions.map((r) => (
                <div key={r.id} style={listItemStyle}>
                  <div>
                    <strong>{r.txn_type === "income" ? "收款" : "付款"}</strong> · {r.category_name || "未分类"}
                    <div style={{ ...mutedTextStyle, color: theme.subText }}>
                      {r.txn_date} {r.note ? `· ${r.note}` : ""}{" "}
                      {Number(r.debt_amount || 0) > 0 ? `· 欠款 RM ${Number(r.debt_amount).toFixed(2)}` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong>RM {Number(r.amount).toFixed(2)}</strong>
                    <button onClick={() => deleteTransaction(r.id)} style={deleteBtnStyle}>
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "customers" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>客户管理</h3>

          <div style={formGridStyle}>
            <input placeholder="姓名" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
            <input placeholder="客户公司资料" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} style={inputStyle} />
            <input placeholder="电话号码" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputStyle} />
            <input placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={inputStyle} />
            <input placeholder="地址" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} style={inputStyle} />
            <input placeholder="标签（逗号分隔，例如：VIP,欠款）" value={customerTags} onChange={(e) => setCustomerTags(e.target.value)} style={inputStyle} />
            <input placeholder="欠款金额" value={customerDebt} onChange={(e) => setCustomerDebt(e.target.value)} style={inputStyle} />
            <input placeholder="备注" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} style={inputStyle} />
          </div>

          <button onClick={addCustomer} style={{ ...primaryBtnStyle, background: theme.accent }}>
            新增客户
          </button>

          <div style={{ marginTop: 18 }}>
            {customers.length === 0 ? (
              <p style={{ ...emptyTextStyle, color: theme.subText }}>还没有客户资料</p>
            ) : (
              customers.map((c) => (
                <div key={c.id} style={listItemStyle}>
                  <div>
                    <strong>{c.name}</strong>
                    <div style={{ ...mutedTextStyle, color: theme.subText }}>
                      {c.company_name || "无公司资料"} · {c.phone || "无电话"}
                    </div>
                    <div style={{ ...mutedTextStyle, color: theme.subText }}>
                      标签：{(c.tags || []).join("、") || "无"}
                    </div>
                  </div>
                  <strong>欠款：RM {Number(c.debt_amount || 0).toFixed(2)}</strong>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "products" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>产品管理</h3>

          <div style={formGridStyle}>
            <input placeholder="产品名称" value={productName} onChange={(e) => setProductName(e.target.value)} style={inputStyle} />
            <input placeholder="价格" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} style={inputStyle} />
            <input placeholder="成本" value={productCost} onChange={(e) => setProductCost(e.target.value)} style={inputStyle} />
            <input placeholder="折扣" value={productDiscount} onChange={(e) => setProductDiscount(e.target.value)} style={inputStyle} />
            <input placeholder="备注" value={productNote} onChange={(e) => setProductNote(e.target.value)} style={inputStyle} />
          </div>

          <button onClick={addProduct} style={{ ...primaryBtnStyle, background: theme.accent }}>
            新增产品
          </button>

          <div style={{ marginTop: 18 }}>
            {products.length === 0 ? (
              <p style={{ ...emptyTextStyle, color: theme.subText }}>还没有产品</p>
            ) : (
              products.map((p) => (
                <div key={p.id} style={listItemStyle}>
                  <div>
                    <strong>{p.name}</strong>
                    <div style={{ ...mutedTextStyle, color: theme.subText }}>
                      成本：RM {Number(p.cost).toFixed(2)} · 折扣：RM {Number(p.discount || 0).toFixed(2)}
                    </div>
                  </div>
                  <strong>售价：RM {Number(p.price).toFixed(2)}</strong>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "invoices" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>发票系统</h3>
          <p style={{ ...mutedTextStyle, color: theme.subText }}>
            这版先把基础数据结构搭好。下一步我可以直接给你「可选客户 + 可选产品 +
            自动算差价 + 自动进记账」的完整发票页。
          </p>

          <div style={previewBox(theme)}>
            <h4>发票会显示以下公司资料</h4>
            <div style={{ ...mutedTextStyle, color: theme.subText }}>
              公司名称：{profile?.company_name || "未填写"}
            </div>
            <div style={{ ...mutedTextStyle, color: theme.subText }}>
              注册号：{profile?.company_reg_no || "未填写"}
            </div>
            <div style={{ ...mutedTextStyle, color: theme.subText }}>
              电话：{profile?.company_phone || "未填写"}
            </div>
            <div style={{ ...mutedTextStyle, color: theme.subText }}>
              Email：{profile?.company_email || "未填写"}
            </div>
            <div style={{ ...mutedTextStyle, color: theme.subText }}>
              地址：{profile?.company_address || "未填写"}
            </div>
          </div>
        </section>
      )}

      {activeTab === "settings" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>设定</h3>

          <div style={settingsBlockStyle}>
            <h4>个人资料</h4>
            <input
              placeholder="你的名字"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={settingsBlockStyle}>
            <h4>公司资料（发票时会显示）</h4>

            <div style={formGridStyle}>
              <input placeholder="公司名称" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
              <input placeholder="公司注册号" value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} style={inputStyle} />
              <input placeholder="公司电话" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} style={inputStyle} />
              <input placeholder="公司 Email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} style={inputStyle} />
              <input placeholder="公司地址" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                上传公司标识
              </label>
              <input type="file" accept="image/*" onChange={uploadCompanyLogo} />
            </div>

            {profile?.company_logo_url ? (
              <img
                src={profile.company_logo_url}
                alt="company-logo"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginTop: 14,
                  border: `1px solid ${theme.cardBorder}`,
                }}
              />
            ) : null}

            <button onClick={saveProfile} style={{ ...primaryBtnStyle, background: theme.accent }}>
              保存资料
            </button>
          </div>

          <div style={settingsBlockStyle}>
            <h4>修改密码</h4>
            <input
              type="password"
              placeholder="请输入新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
            <button onClick={changePassword} style={{ ...primaryBtnStyle, background: theme.accent }}>
              更新密码
            </button>
          </div>

          {msg ? (
            <div
              style={{
                ...messageBoxStyle,
                background: msgType === "error" ? "#fee2e2" : "#dcfce7",
                color: msgType === "error" ? "#b91c1c" : "#166534",
              }}
            >
              {msg}
            </div>
          ) : null}
        </section>
      )}

      {activeTab === "themes" && (
        <section style={{ ...sectionCardStyle, background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3>主题切换</h3>
          <p style={{ ...mutedTextStyle, color: theme.subText }}>
            每位用户切换主题后，不会影响其他用户。
          </p>

          <div style={themeGridStyle}>
            {(Object.keys(THEME_PACKS) as ThemePackKey[]).map((key) => {
              const pack = THEME_PACKS[key];
              const active = key === themePack;

              return (
                <div
                  key={key}
                  style={{
                    ...themeCardStyle,
                    border: active ? `2px solid ${pack.accent}` : "1px solid #d1d5db",
                    background: pack.pageBg,
                    color: pack.text,
                  }}
                >
                  <div
                    style={{
                      ...themeHeroPreviewStyle,
                      background: pack.heroBg,
                      color: pack.bannerText,
                    }}
                  >
                    {pack.name}
                  </div>

                  <div style={{ fontWeight: 700, marginTop: 10 }}>{pack.name}</div>
                  <div style={{ fontSize: 13, marginTop: 6, color: pack.subText }}>{pack.preview}</div>

                  <button
                    onClick={() => saveTheme(key)}
                    style={{
                      ...primaryBtnStyle,
                      background: pack.accent,
                      width: "100%",
                    }}
                  >
                    {active ? "当前使用中" : "切换主题"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "20px",
  fontFamily: "sans-serif",
};

const heroCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 20,
  marginBottom: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const topRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const avatarBtnStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: "999px",
  border: "none",
  background: "#ffffff",
  fontSize: 22,
  cursor: "pointer",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const avatarImgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarMenuStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 54,
  background: "#ffffff",
  borderRadius: 14,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  padding: 10,
  minWidth: 180,
  zIndex: 20,
};

const avatarMenuItemStyle: CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  background: "transparent",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
};

const menuUploadLabel: CSSProperties = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
};

const titleStyle: CSSProperties = {
  fontSize: 30,
  margin: 0,
};

const subTitleStyle: CSSProperties = {
  marginTop: 10,
};

const logoutBtnStyle: CSSProperties = {
  padding: "10px 18px",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const statCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 18,
  border: "2px solid",
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
};

const statLabelStyle: CSSProperties = {
  fontSize: 14,
  color: "#64748b",
};

const statValueStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  marginTop: 8,
};

const menuGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const menuBtn = (
  active: boolean,
  theme: (typeof THEME_PACKS)[ThemePackKey]
): CSSProperties => ({
  padding: "14px 12px",
  borderRadius: 12,
  border: active ? `2px solid ${theme.accent}` : "1px solid #cbd5e1",
  background: active ? "#ecfdf5" : "#fff",
  color: active ? theme.accent : "#0f172a",
  fontWeight: 700,
});

const sectionCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 20,
  border: "2px solid",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
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
  fontSize: 14,
  marginTop: 4,
};

const emptyTextStyle: CSSProperties = {};

const deleteBtnStyle: CSSProperties = {
  padding: "8px 10px",
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
};

const settingsBlockStyle: CSSProperties = {
  marginTop: 18,
};

const messageBoxStyle: CSSProperties = {
  marginTop: 16,
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
};

const overviewBoxGridStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const previewBox = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  background: "#ffffff",
  borderRadius: 16,
  padding: 16,
  border: `1px solid ${theme.cardBorder}`,
});

const bannerPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 10,
  padding: "20px 16px",
  borderRadius: 14,
  background: theme.heroBg,
  color: theme.bannerText,
  fontWeight: 800,
  textAlign: "center",
});

const smallCardPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 10,
  padding: "18px 14px",
  borderRadius: 14,
  background: theme.cardBg,
  border: `2px solid ${theme.cardBorder}`,
  color: theme.text,
});

const nameCardPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 10,
  padding: "22px 16px",
  borderRadius: 14,
  background: theme.heroBg,
  color: theme.bannerText,
  fontWeight: 700,
});

const containerPreview = (theme: (typeof THEME_PACKS)[ThemePackKey]): CSSProperties => ({
  marginTop: 10,
  padding: "18px 14px",
  borderRadius: 14,
  background: theme.pageBg,
  border: `1px dashed ${theme.cardBorder}`,
  color: theme.text,
});

const themeGridStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const themeCardStyle: CSSProperties = {
  borderRadius: 16,
  padding: 14,
};

const themeHeroPreviewStyle: CSSProperties = {
  borderRadius: 12,
  padding: "18px 12px",
  textAlign: "center",
  fontWeight: 800,
};
