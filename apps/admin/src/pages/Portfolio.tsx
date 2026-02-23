import { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridReadyEvent } from 'ag-grid-community'
import { Card, CardHeader, CardTitle, CardContent } from '@fintech/ui'
import { finpulseAgGridTheme } from '@/shared/ag-grid-theme'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

interface PortfolioItem {
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  costBasis: number
  gainLoss: number
  gainLossPercent: number
  allocation: number
  sector: string
}

const rowData: PortfolioItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, avgPrice: 175.2, currentPrice: 182.52, marketValue: 9126, costBasis: 8760, gainLoss: 366, gainLossPercent: 4.18, allocation: 18.5, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft', quantity: 30, avgPrice: 365.8, currentPrice: 378.91, marketValue: 11367.3, costBasis: 10974, gainLoss: 393.3, gainLossPercent: 3.59, allocation: 23, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA', quantity: 20, avgPrice: 850, currentPrice: 875.28, marketValue: 17505.6, costBasis: 17000, gainLoss: 505.6, gainLossPercent: 2.98, allocation: 35.5, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla', quantity: 25, avgPrice: 240, currentPrice: 248.34, marketValue: 6208.5, costBasis: 6000, gainLoss: 208.5, gainLossPercent: 3.48, allocation: 12.6, sector: 'Automotive' },
  { symbol: 'GOOGL', name: 'Alphabet', quantity: 15, avgPrice: 138.5, currentPrice: 142.5, marketValue: 2137.5, costBasis: 2077.5, gainLoss: 60, gainLossPercent: 2.89, allocation: 4.3, sector: 'Technology' },
  { symbol: 'BABA', name: 'Alibaba', quantity: 100, avgPrice: 75, currentPrice: 78.45, marketValue: 7845, costBasis: 7500, gainLoss: 345, gainLossPercent: 4.6, allocation: 15.9, sector: 'E-commerce' },
  { symbol: 'JPM', name: 'JPMorgan Chase', quantity: 40, avgPrice: 145.2, currentPrice: 148.75, marketValue: 5950, costBasis: 5808, gainLoss: 142, gainLossPercent: 2.45, allocation: 12.1, sector: 'Finance' },
]

const columnDefs: ColDef<PortfolioItem>[] = [
  { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, width: 100, pinned: 'left' },
  { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 1 },
  { field: 'sector', headerName: 'Sector', sortable: true, filter: true, width: 120 },
  { field: 'quantity', headerName: 'Quantity', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
  { field: 'avgPrice', headerName: 'Avg Price', sortable: true, filter: 'agNumberColumnFilter', width: 110, valueFormatter: (p) => (p.value != null ? `¥${Number(p.value).toFixed(2)}` : '') },
  { field: 'currentPrice', headerName: 'Current Price', sortable: true, filter: 'agNumberColumnFilter', width: 120, valueFormatter: (p) => (p.value != null ? `¥${Number(p.value).toFixed(2)}` : '') },
  { field: 'marketValue', headerName: 'Market Value', sortable: true, filter: 'agNumberColumnFilter', width: 130, valueFormatter: (p) => (p.value != null ? `¥${Number(p.value).toFixed(2)}` : ''), cellClass: 'font-semibold' },
  { field: 'costBasis', headerName: 'Cost Basis', sortable: true, filter: 'agNumberColumnFilter', width: 120, valueFormatter: (p) => (p.value != null ? `¥${Number(p.value).toFixed(2)}` : '') },
  { field: 'gainLoss', headerName: 'Gain/Loss', sortable: true, filter: 'agNumberColumnFilter', width: 120, valueFormatter: (p) => (p.value != null ? `${p.value >= 0 ? '+' : ''}¥${Number(p.value).toFixed(2)}` : ''), cellClass: (p) => (p.value >= 0 ? 'text-accent font-semibold' : 'text-destructive font-semibold') },
  { field: 'gainLossPercent', headerName: 'Gain/Loss %', sortable: true, filter: 'agNumberColumnFilter', width: 120, valueFormatter: (p) => (p.value != null ? `${p.value >= 0 ? '+' : ''}${Number(p.value).toFixed(2)}%` : ''), cellClass: (p) => (p.value >= 0 ? 'text-accent font-semibold' : 'text-destructive font-semibold') },
  { field: 'allocation', headerName: 'Allocation %', sortable: true, filter: 'agNumberColumnFilter', width: 130, valueFormatter: (p) => (p.value != null ? `${Number(p.value).toFixed(1)}%` : '') },
]

export function Portfolio() {
  const gridRef = useRef<AgGridReact<PortfolioItem>>(null)

  const onGridReady = (params: GridReadyEvent<PortfolioItem>) => {
    params.api.sizeColumnsToFit()
  }

  return (
    <Card className="bg-card border-border glass">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold">Portfolio</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">View your complete investment portfolio</p>
      </CardHeader>
      <CardContent>
        <div className="ag-theme-quartz h-[600px] w-full rounded-xl overflow-hidden">
          <AgGridReact<PortfolioItem>
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{ resizable: true, sortable: true, filter: true }}
            pagination
            paginationPageSize={20}
            rowSelection="multiple"
            animateRows
            theme={finpulseAgGridTheme}
            onGridReady={onGridReady}
          />
        </div>
      </CardContent>
    </Card>
  )
}
