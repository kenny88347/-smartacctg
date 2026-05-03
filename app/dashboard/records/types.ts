export type Lang = "zh" | "en" | "ms";
export type TxnType = "income" | "expense";

export type Txn = {
  id: string;
  user_id?: string;
  txn_date: string;
  txn_type: TxnType;
  amount: number;
  category_name?: string | null;
  debt_amount?: number | null;
  note?: string | null;
  source_type?: string | null;
  source_id?: string | null;
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
};

export type Product = {
  id: string;
  user_id?: string;
  name?: string | null;
  price?: number | null;
  cost?: number | null;
  stock_qty?: number | null;
};

export type Invoice = {
  id: string;
  user_id?: string;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_company?: string | null;
  customer_phone?: string | null;
  invoice_no?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  created_at?: string | null;
  subtotal?: number | null;
  discount?: number | null;
  total?: number | null;
  total_cost?: number | null;
  total_profit?: number | null;
  note?: string | null;
};

export type Profile = {
  id?: string;
  theme?: string | null;
};

export type DebtItem = {
  id: string;
  source: "customer" | "invoice";
  customerLabel: string;
  amount: number;
  dueDate: string;
  sortTime: number;
};

export type RecordFormState = {
  txn_date: string;
  txn_type: TxnType;
  amount: string;
  category_name: string;
  debt_amount: string;
  note: string;
  customer_id: string;
  product_id: string;
  invoice_id: string;
};
