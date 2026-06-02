import type { QuoteStreamHandle, QuoteStreamOptions } from "../services/quoteStreamTypes";
import { getBaseUrl } from "./config";

const REFRESH_INTERVAL_MS = 1000;

function getWsUrl(): string {
  const base = getBaseUrl();
  const wsScheme = base.startsWith("https") ? "wss" : "ws";
  const host = base.replace(/^https?:\/\//, "");
  return `${wsScheme}://${host}/ws/quotes`;
}

function sendSubscribe(ws: WebSocket, symbols: string[]) {
  if (ws.readyState !== WebSocket.OPEN || symbols.length === 0) return;
  ws.send(JSON.stringify({ type: "subscribe", symbols }));
}

export function createQuoteSocket(options: QuoteStreamOptions): QuoteStreamHandle {
  let closed = false;
  let symbols = options.symbols ?? [];
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  options.onStatusChange?.("connecting");

  const ws = new WebSocket(getWsUrl());

  ws.onopen = () => {
    if (closed) return;
    options.onStatusChange?.("open");
    sendSubscribe(ws, symbols);
    refreshTimer = setInterval(() => {
      if (closed || ws.readyState !== WebSocket.OPEN) return;
      sendSubscribe(ws, symbols);
    }, REFRESH_INTERVAL_MS);
  };

  ws.onmessage = (event) => {
    if (closed) return;
    try {
      const msg = JSON.parse(event.data as string);
      if (msg?.type === "snapshot" && msg.quotes && typeof msg.quotes === "object") {
        options.onSnapshot(msg.quotes);
      }
    } catch {
      // ignore parse error
    }
  };

  ws.onerror = () => {
    if (!closed) options.onStatusChange?.("error");
  };

  ws.onclose = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    if (!closed) options.onStatusChange?.("closed");
  };

  return {
    updateSymbols(next: string[]) {
      if (closed) return;
      symbols = next ?? [];
      sendSubscribe(ws, symbols);
    },
    close() {
      closed = true;
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      ws.close();
      options.onStatusChange?.("closed");
    },
  };
}
