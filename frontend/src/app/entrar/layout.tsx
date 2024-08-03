import Navbar from "@/components/navbar";
import { UserContextProvider } from "@/contexts/userContext";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Entrar",
  description: "Fazer login",
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
        <UserContextProvider>
        {children}
        </UserContextProvider>
      </body>
    </html>
  );
}
