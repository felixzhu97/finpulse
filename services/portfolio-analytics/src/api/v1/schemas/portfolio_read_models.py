from typing import List

from pydantic import BaseModel


class HoldingView(BaseModel):
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


class AccountView(BaseModel):
    id: str
    name: str
    type: str
    currency: str
    balance: float
    todayChange: float
    holdings: List[HoldingView]


class PortfolioSummaryView(BaseModel):
    totalAssets: float
    totalLiabilities: float
    netWorth: float
    todayChange: float
    weekChange: float


class HistoryPointView(BaseModel):
    date: str
    value: float


class PortfolioView(BaseModel):
    id: str
    ownerName: str
    baseCurrency: str
    accounts: List[AccountView]
    summary: PortfolioSummaryView
    history: List[HistoryPointView]


class RiskSummaryView(BaseModel):
    highRatio: float
    topHoldingsConcentration: float


class AssetAllocationItemView(BaseModel):
    type: str
    value: float
