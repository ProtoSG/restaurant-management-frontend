import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOrderWebSocket } from './shared/hooks/useOrderWebSocket'
import { ErrorBoundary } from './shared/components/ErrorBoundary.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30 * 1000,       // 30s — no re-fetch innecesario
      gcTime:               5 * 60 * 1000,   // 5min en caché
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        const status = (error as { status?: number })?.status
        if (status === 401 || status === 403) return false
        return failureCount < 2
      },
    },
    mutations: {
      onError: (error: unknown) => {
        const status = (error as { status?: number })?.status
        if (status === 401) {
          queryClient.clear()
          window.location.href = '/login'
        }
      },
    },
  },
})

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useOrderWebSocket()
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <WebSocketProvider>
            <App />
          </WebSocketProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
