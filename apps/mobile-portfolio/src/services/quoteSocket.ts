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

export type QuoteConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

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

export class QuoteSocket implements QuoteSocketHandle {
  private symbols: string[];
  private socket: WebSocket | null = null;
  private closed = false;
  private reconnectDelay = 1000;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly options: QuoteSocketOptions) {
    this.symbols = Array.from(
      new Set(options.symbols.map((s) => s.toUpperCase())),
    );
    this.connect();
  }

  updateSymbols(next: string[]): void {
    this.symbols = Array.from(new Set(next.map((s) => s.toUpperCase())));
    this.sendSubscribe();
  }

  close(): void {
    this.closed = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private notifyStatus(status: QuoteConnectionStatus): void {
    if (this.options.onStatusChange) {
      this.options.onStatusChange(status);
    }
  }

  private sendSubscribe(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    this.socket.send(
      JSON.stringify({
        type: "subscribe",
        symbols: this.symbols,
      }),
    );
  }

  private connect(): void {
    if (this.closed) return;
    this.notifyStatus("connecting");
    const base = getPortfolioApiBaseUrl();
    const wsUrl = toWebSocketUrl(base) + "/ws/quotes";
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.reconnectDelay = 1000;
      this.notifyStatus("open");
      this.sendSubscribe();
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => this.sendSubscribe(), 1000);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data &&
          data.type === "snapshot" &&
          data.quotes &&
          typeof data.quotes === "object"
        ) {
          this.options.onSnapshot(data.quotes as QuoteSnapshot);
        }
      } catch {
      }
    };

    this.socket.onerror = () => {
      this.notifyStatus("error");
    };

    this.socket.onclose = () => {
      this.notifyStatus("closed");
      this.socket = null;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.closed) return;
      setTimeout(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000);
        this.connect();
      }, this.reconnectDelay);
    };
  }
}

export function createQuoteSocket(options: QuoteSocketOptions): QuoteSocketHandle {
  return new QuoteSocket(options);
}
