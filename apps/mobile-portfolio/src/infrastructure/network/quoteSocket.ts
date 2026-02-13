import type { QuoteConnectionStatus, QuoteSnapshot } from "@/src/core/domain/entities/quotes";
import { getBaseUrl } from "./config";

export type { QuoteConnectionStatus, QuoteSnapshot };

export interface QuoteSocketOptions {
  symbols: string[];
  onSnapshot: (quotes: QuoteSnapshot) => void;
  onStatusChange?: (status: QuoteConnectionStatus) => void;
}

export interface QuoteSocketHandle {
  updateSymbols(symbols: string[]): void;
  close(): void;
}

const DEBUG = typeof __DEV__ !== "undefined" && __DEV__;

function socketLog(ev: string, detail?: unknown): void {
  if (DEBUG) {
    if (detail !== undefined) {
      console.log(`[QuoteSocket] ${ev}`, detail);
    } else {
      console.log(`[QuoteSocket] ${ev}`);
    }
  }
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

class QuoteSocket implements QuoteSocketHandle {
  private symbols: string[];
  private socket: WebSocket | null = null;
  private closed = false;
  private reconnectDelay = 1000;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly options: QuoteSocketOptions) {
    this.symbols = Array.from(
      new Set(options.symbols.map((s) => s.toUpperCase()))
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
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const payload = { type: "subscribe", symbols: this.symbols };
    this.socket.send(JSON.stringify(payload));
  }

  private connect(): void {
    if (this.closed) return;
    this.notifyStatus("connecting");
    const wsUrl = toWebSocketUrl(getBaseUrl()) + "/ws/quotes";
    socketLog("connect", { wsUrl });
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      socketLog("onopen");
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
          data?.type === "snapshot" &&
          data.quotes &&
          typeof data.quotes === "object"
        ) {
          this.options.onSnapshot(data.quotes as QuoteSnapshot);
        }
      } catch {
      }
    };

    this.socket.onerror = () => {
      socketLog("onerror");
      this.notifyStatus("error");
    };

    this.socket.onclose = (event) => {
      socketLog("onclose", { code: event.code, reason: event.reason });
      this.notifyStatus("closed");
      this.socket = null;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.closed) return;
      const delay = this.reconnectDelay;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000);
      socketLog("reconnect scheduled", { delayMs: delay });
      setTimeout(() => this.connect(), delay);
    };
  }
}

export function createQuoteSocket(
  options: QuoteSocketOptions
): QuoteSocketHandle {
  return new QuoteSocket(options);
}
