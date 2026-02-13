import type { IQuoteStreamService } from "./IQuoteStreamService";
import { createQuoteSocket } from "@/src/lib/network/quoteSocket";

export class QuoteStreamService implements IQuoteStreamService {
  subscribe(options: Parameters<IQuoteStreamService["subscribe"]>[0]) {
    return createQuoteSocket(options);
  }
}
