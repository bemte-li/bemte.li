import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Postagem do Usuário",
  description: "Postagens do usuário...",
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
