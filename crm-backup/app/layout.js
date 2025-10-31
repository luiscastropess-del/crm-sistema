import './globals.css'

export const metadata = {
  title: 'CRM Sistema',
  description: 'Sistema de CRM completo com Next.js e Firebase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-gray-50 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}