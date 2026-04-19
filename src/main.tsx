import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './features/auth'

const queryClient = new QueryClient()

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const verifyAuth = useAuthStore((state) => state.verifyAuth);
  
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);
  
  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
