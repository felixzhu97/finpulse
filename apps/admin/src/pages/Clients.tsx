import { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridReadyEvent } from 'ag-grid-community'
import { Card, CardHeader, CardTitle, CardContent } from '@fintech/ui'
import { finpulseAgGridTheme } from '@/shared/ag-grid-theme'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  portfolioValue: number
  totalAssets: number
  activeInvestments: number
  joinDate: string
  status: 'Active' | 'Inactive' | 'Pending'
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive'
}

const rowData: Client[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '+1 234-567-8900', portfolioValue: 1250000, totalAssets: 8, activeInvestments: 5, joinDate: '2024-01-15', status: 'Active', riskProfile: 'Moderate' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 234-567-8901', portfolioValue: 850000, totalAssets: 6, activeInvestments: 4, joinDate: '2024-03-20', status: 'Active', riskProfile: 'Conservative' },
  { id: '3', name: 'Michael Chen', email: 'm.chen@email.com', phone: '+1 234-567-8902', portfolioValue: 2100000, totalAssets: 12, activeInvestments: 8, joinDate: '2023-11-10', status: 'Active', riskProfile: 'Aggressive' },
  { id: '4', name: 'Emily Davis', email: 'emily.d@email.com', phone: '+1 234-567-8903', portfolioValue: 450000, totalAssets: 4, activeInvestments: 3, joinDate: '2025-01-05', status: 'Pending', riskProfile: 'Moderate' },
  { id: '5', name: 'David Wilson', email: 'd.wilson@email.com', phone: '+1 234-567-8904', portfolioValue: 3200000, totalAssets: 15, activeInvestments: 10, joinDate: '2023-08-22', status: 'Active', riskProfile: 'Aggressive' },
  { id: '6', name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+1 234-567-8905', portfolioValue: 680000, totalAssets: 5, activeInvestments: 3, joinDate: '2024-06-12', status: 'Inactive', riskProfile: 'Conservative' },
  { id: '7', name: 'Robert Brown', email: 'robert.b@email.com', phone: '+1 234-567-8906', portfolioValue: 950000, totalAssets: 7, activeInvestments: 5, joinDate: '2024-09-30', status: 'Active', riskProfile: 'Moderate' },
  { id: '8', name: 'Jennifer Taylor', email: 'j.taylor@email.com', phone: '+1 234-567-8907', portfolioValue: 1750000, totalAssets: 10, activeInvestments: 7, joinDate: '2023-12-05', status: 'Active', riskProfile: 'Aggressive' },
]

const statusClass = (v: string) => ({ Active: 'bg-accent/10 text-accent', Inactive: 'bg-muted/10 text-muted-foreground', Pending: 'bg-chart-3/10 text-chart-3' }[v] ?? '')
const riskClass = (v: string) => ({ Conservative: 'bg-chart-3/10 text-chart-3', Moderate: 'bg-chart-2/10 text-chart-2', Aggressive: 'bg-destructive/10 text-destructive' }[v] ?? '')

const columnDefs: ColDef<Client>[] = [
  { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 1, pinned: 'left' },
  { field: 'email', headerName: 'Email', sortable: true, filter: true, flex: 1 },
  { field: 'phone', headerName: 'Phone', sortable: true, filter: true, width: 150 },
  { field: 'portfolioValue', headerName: 'Portfolio Value', sortable: true, filter: 'agNumberColumnFilter', width: 150, valueFormatter: (p) => (p.value != null ? `¥${(p.value / 1e6).toFixed(2)}M` : ''), cellClass: 'font-semibold' },
  { field: 'totalAssets', headerName: 'Total Assets', sortable: true, filter: 'agNumberColumnFilter', width: 120 },
  { field: 'activeInvestments', headerName: 'Active Investments', sortable: true, filter: 'agNumberColumnFilter', width: 150 },
  { field: 'joinDate', headerName: 'Join Date', sortable: true, filter: 'agDateColumnFilter', width: 120 },
  { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120, cellClass: (p) => statusClass(p.value ?? '') },
  { field: 'riskProfile', headerName: 'Risk Profile', sortable: true, filter: true, width: 140, cellClass: (p) => riskClass(p.value ?? '') },
]

export function Clients() {
  const gridRef = useRef<AgGridReact<Client>>(null)

  const onGridReady = (params: GridReadyEvent<Client>) => {
    params.api.sizeColumnsToFit()
  }

  return (
    <Card className="bg-card border-border glass">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold">Clients</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Manage your client portfolio and relationships</p>
      </CardHeader>
      <CardContent>
        <div className="ag-theme-quartz h-[600px] w-full rounded-xl overflow-hidden">
          <AgGridReact<Client>
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
