import type { IQuoteStreamService } from "../../domain/services/IQuoteStreamService";
import { createQuoteSocket } from "@/src/infrastructure/network/quoteSocket";

export class QuoteStreamService implements IQuoteStreamService {
  subscribe(options: Parameters<IQuoteStreamService["subscribe"]>[0]) {
    return createQuoteSocket(options);
  }
}
