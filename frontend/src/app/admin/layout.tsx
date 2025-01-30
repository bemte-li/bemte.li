import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel Administrativo | Bemte.li",
  description: "Painel administrativo interno para páginas de exemplo do Bemte.li",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 