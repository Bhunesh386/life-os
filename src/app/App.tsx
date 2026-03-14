import { RouterProvider } from 'react-router'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from 'sonner'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  )
}
