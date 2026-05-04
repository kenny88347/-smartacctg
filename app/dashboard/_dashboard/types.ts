import { CSSProperties } from "react";

export type PageKey =
  | "home"
  | "accounting"
  | "customers"
  | "products"
  | "invoices"
  | "records"
  | "extensions"
  | "nkshop"
  | "app_center";

export type Lang = "zh" | "en" | "ms";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_reg_no: string | null;
  company_phone: string | null;
  company_address: string | null;
  theme: string | null;
  plan_type: string | null;
  plan_expiry: string | null;
};

export type Txn = {
  id: string;
  user_id?: string;
  txn_date: string;
  txn_type: "income" | "expense";
  amount: number;
  category_name?: string | null;
  note?: string | null;
  created_at?: string | null;
};

export type Customer = {
  id: string;
  user_id?: string;
  name?: string | null;
  phone?: string | null;
  company_name?: string | null;
  debt_amount?: number | null;
  paid_amount?: number | null;
  last_payment_date?: string | null;
  note?: string | null;
};

export type Invoice = {
  id: string;
  user_id?: string;
  invoice_no?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_company?: string | null;
  total?: number | null;
  status?: string | null;
  due_date?: string | null;
  invoice_date?: string | null;
  created_at?: string | null;
};

export type DebtItem = {
  id: string;
  name: string;
  source: "customer" | "invoice";
  amount: number;
  dueDate?: string;
  sortTime: number;
};

export type AppRegistry = {
  id?: string;
  app_key: string;
  title_zh?: string | null;
  title_en?: string | null;
  title_ms?: string | null;
  name?: string | null;
  icon?: string | null;
  app_path?: string | null;
  component_key?: string | null;
  description_zh?: string | null;
  description_en?: string | null;
  description_ms?: string | null;
  sort_order?: number | null;
  enabled?: boolean | null;
  is_active?: boolean | null;
  is_system?: boolean | null;
};

export type UserDashboardApp = {
  id?: string;
  user_id?: string;
  app_key?: string | null;
  app_id?: string | null;
  pinned?: boolean | null;
  created_at?: string | null;
};

export type StyleMap = Record<string, CSSProperties>;
