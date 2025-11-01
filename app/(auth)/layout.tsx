// app/(auth)/layout.tsx
import { BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">CRM Sistema</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p>© 2024 CRM Sistema. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
