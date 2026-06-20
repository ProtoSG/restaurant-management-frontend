import { useWsStore } from '../store/wsStore'

export function WsStatusBanner() {
  const isConnected = useWsStore((s) => s.isConnected)
  const hasConnected = useWsStore((s) => s.hasConnected)

  if (!hasConnected || isConnected) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white"
    >
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
      Conexión en tiempo real perdida. Reconectando...
    </div>
  )
}
