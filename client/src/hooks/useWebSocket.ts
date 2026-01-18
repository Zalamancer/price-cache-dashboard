import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketOptions {
  url: string;
  onMessage: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: WebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const connect = useCallback(() => {
    try {
      // Convert http/https to ws/wss
      const wsUrl = url.replace(/^https?:/, (match) => {
        return match === "https:" ? "wss:" : "ws:";
      });

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`✓ WebSocket connected: ${wsUrl}`);
        setIsConnected(true);
        setLastError(null);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onerror = (event) => {
        // Silently handle connection errors (expected when API unavailable)
        console.debug("WebSocket error (expected when API unavailable):", event);
        setLastError("WebSocket connection error");
        // Don't call onError callback to prevent user-facing errors
      };

      ws.onclose = () => {
        console.log("✗ WebSocket disconnected");
        setIsConnected(false);
        onClose?.();

        // Attempt reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const backoffMs = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`Reconnecting in ${backoffMs}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, backoffMs);
        } else {
          setLastError("Max reconnection attempts reached");
        }
      };

      wsRef.current = ws;
    } catch (error) {
      // Silently handle WebSocket creation errors
      console.debug("Failed to create WebSocket (expected when API unavailable):", error);
      setLastError(String(error));
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected");
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastError,
    send,
    disconnect,
  };
}
