import type { Metadata } from "next";
import { Cousine } from "next/font/google";
import Footer from '@/components/Footer'

// These styles apply to every route in the application
import './globals.css'

const cousine = Cousine({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-cousine',
});

// const panelMono = localFont({
//   src: '../fonts/PanelMonoItalic.woff2',
//   display: 'swap',
//   style: 'italic',
//   variable: '--font-panel-mono',
// });

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
    <html lang="pt-BR" className={`${cousine.variable}`}>
      <body className="font-regular bg-marfim text-sombra flex flex-col min-h-screen">
        {children}
        <Footer />
      </body>
    </html>
  );
}
