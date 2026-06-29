import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import { useWsStore } from "../store/wsStore";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace("/api", "");
const WS_URL = `${API_BASE.replace("https://", "wss://").replace("http://", "ws://")}/api/ws/websocket`;

interface OrderEvent {
  type: string;
  orderId: number;
  tableId: number | null;
}

export function useOrderWebSocket() {
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);
  const setConnected = useWsStore((s) => s.setConnected);

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/orders", (message) => {
          const event: OrderEvent = JSON.parse(message.body);

          queryClient.invalidateQueries({ queryKey: ["active-orders"] });
          queryClient.invalidateQueries({ queryKey: ["tables"] });

          if (event.orderId) {
            queryClient.invalidateQueries({ queryKey: ["order", event.orderId] });
          }
          if (event.tableId) {
            queryClient.invalidateQueries({ queryKey: [`order-${event.tableId}`] });
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [queryClient, setConnected]);
}
