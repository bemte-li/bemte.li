import { Navbar } from '@/components/Navbar';

export default function ExemploNiusPagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar isLoggedIn={false} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
