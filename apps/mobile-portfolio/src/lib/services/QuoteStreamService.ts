import type { IQuoteStreamService } from "./IQuoteStreamService";
import { createQuoteSocket } from "@/src/lib/api/client/quoteSocket";

export class QuoteStreamService implements IQuoteStreamService {
  subscribe(options: Parameters<IQuoteStreamService["subscribe"]>[0]) {
    return createQuoteSocket(options);
  }
}
