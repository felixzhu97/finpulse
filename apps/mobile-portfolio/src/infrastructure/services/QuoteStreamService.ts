import type { IQuoteStreamService } from "../../features/quotes/services/IQuoteStreamService";
import { createQuoteSocket } from "../api/quoteSocket";

export class QuoteStreamService implements IQuoteStreamService {
  subscribe(options: Parameters<IQuoteStreamService["subscribe"]>[0]) {
    return createQuoteSocket(options);
  }
}
