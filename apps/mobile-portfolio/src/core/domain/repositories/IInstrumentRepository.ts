import type { Instrument } from "../entities/instrument";

export interface IInstrumentRepository {
  list(limit?: number, offset?: number): Promise<Instrument[]>;
  getById(instrumentId: string): Promise<Instrument | null>;
  getBySymbol(instruments: Instrument[], symbol: string): Instrument | null;
}
