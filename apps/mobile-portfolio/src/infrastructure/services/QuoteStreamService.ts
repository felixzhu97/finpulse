import type { IQuoteStreamService } from "./quoteStreamTypes";
import { createQuoteSocket } from "../network/quoteSocket";

export class QuoteStreamService implements IQuoteStreamService {
  subscribe(options: Parameters<IQuoteStreamService["subscribe"]>[0]) {
    return createQuoteSocket(options);
  }
}

export const quoteStreamService = new QuoteStreamService();
