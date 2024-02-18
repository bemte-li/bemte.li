import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Bem-te-li",
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
