import "./globals.css";

export const metadata = {
  title: "SmartAcctg",
  description: "SaaS accounting system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
