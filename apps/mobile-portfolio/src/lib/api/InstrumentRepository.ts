import type { Instrument } from "@/src/lib/types/instrument";
import type { IInstrumentRepository } from "@/src/lib/types/IInstrumentRepository";
import { httpClient } from "@/src/lib/network/httpClient";

export class InstrumentRepository implements IInstrumentRepository {
  async list(limit = 500, offset = 0): Promise<Instrument[]> {
    return httpClient.getList<Instrument>("instruments", limit, offset);
  }

  async getById(instrumentId: string): Promise<Instrument | null> {
    return httpClient.getById<Instrument>("instruments", instrumentId);
  }

  getBySymbol(instruments: Instrument[], symbol: string): Instrument | null {
    const upper = symbol.trim().toUpperCase();
    return (
      instruments.find(
        (i) => i.symbol && i.symbol.toUpperCase() === upper
      ) ?? null
    );
  }
}
