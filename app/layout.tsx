import type { Metadata } from "next";
import "./globals.css";
import "./update.css";
export const metadata: Metadata = {
  title: "Matias Meneclier — Portfolio",
  description: "Ingeniería Informática · Buenos Aires",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
