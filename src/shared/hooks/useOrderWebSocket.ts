import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";

const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");
const WS_URL = `${API_BASE.replace("https://", "wss://").replace("http://", "ws://")}/api/ws/websocket`;

interface OrderEvent {
  type: string;
  orderId: number;
}

export function useOrderWebSocket() {
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/orders", (message) => {
          const event: OrderEvent = JSON.parse(message.body);

          queryClient.invalidateQueries({ queryKey: ["active-orders"] });
          queryClient.invalidateQueries({ queryKey: ["tables"] });

          if (event.orderId) {
            queryClient.invalidateQueries({ queryKey: ["order", event.orderId] });
            queryClient.invalidateQueries({ queryKey: [`order-${event.orderId}`] });
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [queryClient]);
}
