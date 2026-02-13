export interface Instrument {
  instrument_id: string;
  symbol: string;
  name: string | null;
  asset_class: string | null;
  currency: string | null;
  exchange: string | null;
}
