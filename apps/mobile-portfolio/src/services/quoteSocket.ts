import { getPortfolioApiBaseUrl } from "../config/api";

export type QuoteSnapshot = Record<
  string,
  {
    price: number;
    change: number;
    changeRate: number;
    timestamp: number;
  }
>;

export type QuoteConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";

export interface QuoteSocketOptions {
  symbols: string[];
  onSnapshot: (quotes: QuoteSnapshot) => void;
  onStatusChange?: (status: QuoteConnectionStatus) => void;
}

export interface QuoteSocketHandle {
  updateSymbols(symbols: string[]): void;
  close(): void;
}

function toWebSocketUrl(httpUrl: string): string {
  if (httpUrl.startsWith("https://")) {
    return "wss://" + httpUrl.slice("https://".length);
  }
  if (httpUrl.startsWith("http://")) {
    return "ws://" + httpUrl.slice("http://".length);
  }
  return httpUrl;
}

export function createQuoteSocket(options: QuoteSocketOptions): QuoteSocketHandle {
  let symbols = Array.from(new Set(options.symbols.map((s) => s.toUpperCase())));
  let socket: WebSocket | null = null;
  let closed = false;
  let reconnectDelay = 1000;
  let timer: ReturnType<typeof setInterval> | null = null;

  const notifyStatus = (status: QuoteConnectionStatus) => {
    if (options.onStatusChange) {
      options.onStatusChange(status);
    }
  };

  const sendSubscribe = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(
      JSON.stringify({
        type: "subscribe",
        symbols,
      }),
    );
  };

  const connect = () => {
    if (closed) {
      return;
    }
    notifyStatus("connecting");
    const base = getPortfolioApiBaseUrl();
    const wsUrl = toWebSocketUrl(base) + "/ws/quotes";
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      reconnectDelay = 1000;
      notifyStatus("open");
      sendSubscribe();
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => {
        sendSubscribe();
      }, 1000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === "snapshot" && data.quotes && typeof data.quotes === "object") {
          options.onSnapshot(data.quotes as QuoteSnapshot);
        }
      } catch {
      }
    };

    socket.onerror = () => {
      notifyStatus("error");
    };

    socket.onclose = () => {
      notifyStatus("closed");
      socket = null;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (closed) {
        return;
      }
      setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, 10000);
        connect();
      }, reconnectDelay);
    };
  };

  connect();

  return {
    updateSymbols(next: string[]) {
      symbols = Array.from(new Set(next.map((s) => s.toUpperCase())));
      sendSubscribe();
    },
    close() {
      closed = true;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (socket) {
        socket.close();
        socket = null;
      }
    },
  };
}

