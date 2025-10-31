import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Páginas públicas que não precisam de autenticação
  const publicPaths = ['/login', '/registro']
  const isPublicPath = publicPaths.includes(pathname)

  // Pegar token do cookie
  const token = request.cookies.get('token')?.value

  // Se está na raiz, redirecionar para login ou dashboard
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se está em página pública e tem token, redirecionar para dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Se está em página privada e não tem token, redirecionar para login
  if (!isPublicPath && !token && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}