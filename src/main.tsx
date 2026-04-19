import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './features/auth'
import { useOrderWebSocket } from './shared/hooks/useOrderWebSocket'

const queryClient = new QueryClient()

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const verifyAuth = useAuthStore((state) => state.verifyAuth);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  return <>{children}</>;
}

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useOrderWebSocket();
  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <WebSocketProvider>
            <App />
          </WebSocketProvider>
        </AuthInitializer>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
