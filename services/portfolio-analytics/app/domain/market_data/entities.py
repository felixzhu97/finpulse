from dataclasses import dataclass


@dataclass
class Quote:
  symbol: str
  price: float
  change: float
  change_rate: float
  timestamp: float

