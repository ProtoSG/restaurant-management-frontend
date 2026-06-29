import { create } from 'zustand'

interface WsState {
  isConnected: boolean
  hasConnected: boolean   // evita banner en carga inicial antes del primer connect
  setConnected: (v: boolean) => void
}

export const useWsStore = create<WsState>((set) => ({
  isConnected: false,
  hasConnected: false,
  setConnected: (isConnected) =>
    set((state) => ({
      isConnected,
      hasConnected: state.hasConnected || isConnected,
    })),
}))
