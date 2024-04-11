import Navbar from "@/components/navbar";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Criar",
  description: "Criar postagem...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
