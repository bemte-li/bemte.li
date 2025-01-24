import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solicitar Convite | Bemte.li",
  description: "Solicite um convite para participar do Bemte.li",
};

export default function SolicitarConviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
