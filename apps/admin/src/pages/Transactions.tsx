import { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridReadyEvent } from 'ag-grid-community'
import { Card, CardHeader, CardTitle, CardContent } from '@fintech/ui'
import { finpulseAgGridTheme } from '@/shared/ag-grid-theme'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

interface Transaction {
  id: string
  date: string
  type: 'Buy' | 'Sell' | 'Deposit' | 'Withdrawal'
  symbol: string
  name: string
  quantity: number
  price: number
  amount: number
  status: 'Completed' | 'Pending' | 'Failed'
  fee: number
}

const rowData: Transaction[] = [
  { id: '1', date: '2026-01-27', type: 'Buy', symbol: 'AAPL', name: 'Apple Inc.', quantity: 10, price: 182.52, amount: 1825.2, status: 'Completed', fee: 1 },
  { id: '2', date: '2026-01-26', type: 'Sell', symbol: 'TSLA', name: 'Tesla', quantity: 5, price: 248.34, amount: 1241.7, status: 'Completed', fee: 1 },
  { id: '3', date: '2026-01-25', type: 'Buy', symbol: 'NVDA', name: 'NVIDIA', quantity: 2, price: 875.28, amount: 1750.56, status: 'Completed', fee: 1 },
  { id: '4', date: '2026-01-24', type: 'Deposit', symbol: '-', name: 'Cash Deposit', quantity: 0, price: 0, amount: 5000, status: 'Completed', fee: 0 },
  { id: '5', date: '2026-01-23', type: 'Buy', symbol: 'MSFT', name: 'Microsoft', quantity: 3, price: 378.91, amount: 1136.73, status: 'Pending', fee: 1 },
  { id: '6', date: '2026-01-22', type: 'Sell', symbol: 'BABA', name: 'Alibaba', quantity: 8, price: 78.45, amount: 627.6, status: 'Completed', fee: 1 },
  { id: '7', date: '2026-01-21', type: 'Withdrawal', symbol: '-', name: 'Cash Withdrawal', quantity: 0, price: 0, amount: 1000, status: 'Completed', fee: 0 },
  { id: '8', date: '2026-01-20', type: 'Buy', symbol: 'GOOGL', name: 'Alphabet', quantity: 1, price: 142.5, amount: 142.5, status: 'Failed', fee: 0 },
]

const typeClass = (v: string) => ({ Buy: 'text-accent', Sell: 'text-destructive', Deposit: 'text-chart-3', Withdrawal: 'text-chart-4' }[v] ?? '')
const statusClass = (v: string) => ({ Completed: 'bg-accent/10 text-accent', Pending: 'bg-chart-3/10 text-chart-3', Failed: 'bg-destructive/10 text-destructive' }[v] ?? '')

const columnDefs: ColDef<Transaction>[] = [
  { field: 'date', headerName: 'Date', sortable: true, filter: 'agDateColumnFilter', width: 120 },
  { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 100, cellClass: (p) => typeClass(p.value ?? '') },
  { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, width: 100 },
  { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 1 },
  { field: 'quantity', headerName: 'Quantity', sortable: true, filter: 'agNumberColumnFilter', width: 100, valueFormatter: (p) => (p.value != null && p.value !== 0 ? String(p.value) : '-') },
  { field: 'price', headerName: 'Price', sortable: true, filter: 'agNumberColumnFilter', width: 100, valueFormatter: (p) => (p.value ? `¥${Number(p.value).toFixed(2)}` : '-') },
  { field: 'amount', headerName: 'Amount', sortable: true, filter: 'agNumberColumnFilter', width: 120, valueFormatter: (p) => (p.value != null ? `¥${Number(p.value).toFixed(2)}` : ''), cellClass: 'font-semibold' },
  { field: 'fee', headerName: 'Fee', sortable: true, filter: 'agNumberColumnFilter', width: 80, valueFormatter: (p) => (p.value ? `¥${Number(p.value).toFixed(2)}` : '-') },
  { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120, cellClass: (p) => statusClass(p.value ?? '') },
]

export function Transactions() {
  const gridRef = useRef<AgGridReact<Transaction>>(null)

  const onGridReady = (params: GridReadyEvent<Transaction>) => {
    params.api.sizeColumnsToFit()
  }

  return (
    <Card className="bg-card border-border glass">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold">Transactions</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">View and manage all your transaction history</p>
      </CardHeader>
      <CardContent>
        <div className="ag-theme-quartz h-[600px] w-full rounded-xl overflow-hidden">
          <AgGridReact<Transaction>
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
