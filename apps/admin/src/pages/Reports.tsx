import { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridReadyEvent } from 'ag-grid-community'
import { Card, CardHeader, CardTitle, CardContent, AgGridWrap } from '@/styled'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

interface Report {
  id: string
  title: string
  type: 'Performance' | 'Risk' | 'Tax' | 'Compliance' | 'Custom'
  generatedDate: string
  period: string
  status: 'Ready' | 'Generating' | 'Failed'
  fileSize: string
  format: 'PDF' | 'Excel' | 'CSV'
}

const rowData: Report[] = [
  { id: '1', title: 'Q4 2025 Performance Report', type: 'Performance', generatedDate: '2026-01-15', period: 'Q4 2025', status: 'Ready', fileSize: '2.4 MB', format: 'PDF' },
  { id: '2', title: 'Annual Risk Assessment', type: 'Risk', generatedDate: '2026-01-10', period: '2025', status: 'Ready', fileSize: '1.8 MB', format: 'PDF' },
  { id: '3', title: 'Tax Report 2025', type: 'Tax', generatedDate: '2026-01-05', period: '2025', status: 'Ready', fileSize: '3.2 MB', format: 'Excel' },
  { id: '4', title: 'Monthly Compliance Report', type: 'Compliance', generatedDate: '2026-01-27', period: 'January 2026', status: 'Generating', fileSize: '-', format: 'PDF' },
  { id: '5', title: 'Portfolio Analysis Q4', type: 'Custom', generatedDate: '2026-01-20', period: 'Q4 2025', status: 'Ready', fileSize: '4.1 MB', format: 'PDF' },
  { id: '6', title: 'Transaction History Export', type: 'Custom', generatedDate: '2026-01-18', period: '2025', status: 'Ready', fileSize: '856 KB', format: 'CSV' },
  { id: '7', title: 'Risk Metrics Dashboard', type: 'Risk', generatedDate: '2026-01-12', period: 'Q4 2025', status: 'Ready', fileSize: '1.2 MB', format: 'PDF' },
  { id: '8', title: 'Client Portfolio Summary', type: 'Performance', generatedDate: '2026-01-25', period: 'January 2026', status: 'Failed', fileSize: '-', format: 'PDF' },
]

const typeClass = (v: string) => ({ Performance: 'bg-primary-10', Risk: 'bg-destructive-10', Tax: 'bg-chart-3-10', Compliance: 'bg-accent-10', Custom: 'bg-muted-10' }[v] ?? '')
const statusClass = (v: string) => ({ Ready: 'bg-accent-10', Generating: 'bg-chart-3-10', Failed: 'bg-destructive-10' }[v] ?? '')

const columnDefs: ColDef<Report>[] = [
  { field: 'title', headerName: 'Report Title', sortable: true, filter: true, flex: 2, pinned: 'left' },
  { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 130, cellClass: (p) => typeClass(p.value ?? '') },
  { field: 'period', headerName: 'Period', sortable: true, filter: true, width: 150 },
  { field: 'generatedDate', headerName: 'Generated Date', sortable: true, filter: 'agDateColumnFilter', width: 150 },
  { field: 'format', headerName: 'Format', sortable: true, filter: true, width: 100 },
  { field: 'fileSize', headerName: 'File Size', sortable: true, filter: true, width: 100 },
  { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 130, cellClass: (p) => statusClass(p.value ?? '') },
]

export function Reports() {
  const gridRef = useRef<AgGridReact<Report>>(null)

  const onGridReady = (params: GridReadyEvent<Report>) => {
    params.api.sizeColumnsToFit()
  }

  return (
    <Card className="glass">
      <CardHeader style={{ paddingBottom: '1rem' }}>
        <CardTitle style={{ fontSize: '1.5rem' }}>Reports</CardTitle>
        <p style={{ margin: 0, marginTop: 4, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Generate and download financial reports</p>
      </CardHeader>
      <CardContent>
        <AgGridWrap className="ag-theme-quartz-dark ag-robinhood">
          <AgGridReact<Report>
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{ resizable: true, sortable: true, filter: true }}
            pagination
            paginationPageSize={20}
            rowSelection="multiple"
            animateRows
            theme="legacy"
            onGridReady={onGridReady}
          />
        </AgGridWrap>
      </CardContent>
    </Card>
  )
}
