import type { IQuoteStreamService } from "../../domain/services/IQuoteStreamService";
import { createQuoteSocket } from "../api/quoteSocket";

export class QuoteStreamService implements IQuoteStreamService {
  subscribe(options: Parameters<IQuoteStreamService["subscribe"]>[0]) {
    return createQuoteSocket(options);
  }
}
