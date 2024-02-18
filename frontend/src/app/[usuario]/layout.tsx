import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Usuário",
  description: "Casinha do usuário...",
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
