from typing import List

from pydantic import BaseModel


class HoldingDto(BaseModel):
  id: str
  symbol: str
  name: str
  quantity: float
  price: float
  costBasis: float
  marketValue: float
  profit: float
  profitRate: float
  assetClass: str
  riskLevel: str


class AccountDto(BaseModel):
  id: str
  name: str
  type: str
  currency: str
  balance: float
  todayChange: float
  holdings: List[HoldingDto]


class PortfolioSummaryDto(BaseModel):
  totalAssets: float
  totalLiabilities: float
  netWorth: float
  todayChange: float
  weekChange: float


class HistoryPointDto(BaseModel):
  date: str
  value: float


class PortfolioDto(BaseModel):
  id: str
  ownerName: str
  baseCurrency: str
  accounts: List[AccountDto]
  summary: PortfolioSummaryDto
  history: List[HistoryPointDto]

