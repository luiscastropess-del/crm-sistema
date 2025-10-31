import { redirect } from 'next/navigation'

export default function Home() {
  // Redirecionar do lado do servidor
  redirect('auth/login')
}