export type SmartApp = {
  key: string;
  label: string;
  href: string;
  icon: string;
};

export const SMART_APPS: SmartApp[] = [
  {
    key: "records",
    label: "记账系统",
    href: "/dashboard/records",
    icon: "/icons/records.png",
  },
  {
    key: "customers",
    label: "客户管理",
    href: "/dashboard/customers",
    icon: "/icons/customers.png",
  },
  {
    key: "products",
    label: "产品管理",
    href: "/dashboard/products",
    icon: "/icons/products.png",
  },
  {
    key: "invoices",
    label: "发票系统",
    href: "/dashboard/invoices",
    icon: "/dashboard/invoices.png",
  },
  {
    key: "extensions",
    label: "扩展功能",
    href: "/dashboard/extensions",
    icon: "/icons/extensions.png",
  },
  {
    key: "nkshop",
    label: "NK网店",
    href: "/dashboard/nkshop",
    icon: "/icons/nkshop.png",
  },
  {
    key: "app_center",
    label: "App Center",
    href: "/dashboard/app-center",
    icon: "/icons/app-center.png",
  },
];
