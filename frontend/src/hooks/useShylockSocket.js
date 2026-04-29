import { useState, useRef, useEffect, useCallback } from 'react';

export function useShylockSocket(url) {
  const [synthesis, setSynthesis] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(url);
      ws.onopen = () => {};
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'synthesis') {
            setSynthesis((prev) => prev + msg.chunk);
          } else if (msg.type === 'done') {
            setIsStreaming(false);
          } else if (msg.type === 'error') {
            setIsStreaming(false);
          }
        } catch {}
      };
      ws.onerror = () => setIsStreaming(false);
      ws.onclose = () => setIsStreaming(false);
      wsRef.current = ws;
    } catch {}
  }, [url]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  const requestSynthesis = useCallback((payload) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      connect();
      setTimeout(() => {
        wsRef.current?.send(JSON.stringify(payload));
      }, 500);
    } else {
      wsRef.current.send(JSON.stringify(payload));
    }
    setSynthesis('');
    setIsStreaming(true);
  }, [connect]);

  return { synthesis, isStreaming, requestSynthesis };
}
