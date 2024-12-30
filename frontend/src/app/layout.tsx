import type { Metadata } from "next";

// These styles apply to every route in the application
import './globals.css'

export const metadata: Metadata = {
  title: "Bemte.li",
  description: "Em construção...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
