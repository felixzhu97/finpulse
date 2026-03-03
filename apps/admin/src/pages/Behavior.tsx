import { useCallback, useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, RowClickedEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community'
import styled from '@emotion/styled'
import { Card, CardHeader, CardTitle, CardContent, AgGridWrap, StyledButton } from '@/styled'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const eventsUrl = `${apiBase.replace(/\/$/, '')}/analytics/events`

interface EventRow {
  id: string
  name: string
  properties: Record<string, unknown>
  timestamp?: number
}

function getUserSummary(p: Record<string, unknown>): string {
  const email = p?.email as string | undefined
  const name = p?.name as string | undefined
  const userId = p?.userId as string | undefined
  if (email) return name ? `${name} (${email})` : email
  if (userId) return String(userId).slice(0, 8) + '…'
  return '—'
}

const columnDefs: ColDef<EventRow>[] = [
  {
    field: 'timestamp',
    headerName: 'Time',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: (p: ValueFormatterParams<EventRow, number>) => (p.value != null ? new Date(p.value).toLocaleString() : '—'),
  },
  { headerName: 'Source', sortable: true, filter: true, valueGetter: (p: ValueGetterParams<EventRow>) => (p.data?.properties?.source as string) ?? '—' },
  { field: 'name', headerName: 'Event', sortable: true, filter: true },
  {
    headerName: 'User',
    sortable: true,
    filter: true,
    valueGetter: (p: ValueGetterParams<EventRow>) => getUserSummary(p.data?.properties ?? {}),
  },
  {
    headerName: 'Properties',
    valueGetter: (p: ValueGetterParams<EventRow>) => `${Object.keys(p.data?.properties ?? {}).length} keys`,
  },
]

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`

const DrawerBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
`

const DrawerPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: min(400px, 100vw);
  height: 100%;
  background: var(--card);
  border-left: 1px solid var(--border);
  box-shadow: -4px 0 24px rgba(0,0,0,0.15);
  z-index: 101;
  overflow: auto;
  padding: 1.5rem;
`

const DrawerTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--foreground);
`

const DrawerClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: var(--radius);
  background: var(--muted);
  color: var(--foreground);
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  &:hover { background: var(--muted-foreground); color: var(--background); }
`

const DrawerSection = styled.div`
  margin-bottom: 1.25rem;
`

const DrawerLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`

const DrawerValue = styled.div`
  font-size: 0.9375rem;
  color: var(--foreground);
`

const DrawerKv = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid var(--border);
`
const DrawerKvKey = styled.span`
  color: var(--muted-foreground);
  flex-shrink: 0;
`
const DrawerKvVal = styled.span`
  color: var(--foreground);
  word-break: break-all;
  text-align: right;
`

export function Behavior() {
  const [data, setData] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<EventRow | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`${eventsUrl}?limit=200`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((body: { data?: EventRow[] }) => setData(body.data ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const props = selected?.properties ?? {}
  const userId = props.userId as string | undefined
  const email = props.email as string | undefined
  const name = props.name as string | undefined
  const restEntries = Object.entries(props).filter(
    ([k]) => !['userId', 'email', 'name', 'source'].includes(k)
  )

  return (
    <Card className="glass">
      <CardHeader style={{ paddingBottom: '1rem' }}>
        <HeaderRow>
          <div>
            <CardTitle style={{ fontSize: '1.5rem' }}>Behavior Events</CardTitle>
            <p style={{ margin: 0, marginTop: 4, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              Recent events from portal, admin, and mobile. Click a row for user detail.
            </p>
          </div>
          <StyledButton type="button" onClick={load} disabled={loading} size="sm">
            {loading ? 'Loading…' : 'Refresh'}
          </StyledButton>
        </HeaderRow>
      </CardHeader>
      <CardContent>
        {error && <p style={{ margin: 0, padding: '1rem', color: 'var(--destructive)' }}>{error}</p>}
        {!error && (
          <AgGridWrap className="ag-theme-quartz-dark ag-robinhood">
            <AgGridReact<EventRow>
              rowData={data}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, sortable: true, filter: true }}
              pagination
              paginationPageSize={20}
              animateRows
              theme="legacy"
              onRowClicked={(e: RowClickedEvent<EventRow>) => e.data && setSelected(e.data)}
              loading={loading}
            />
          </AgGridWrap>
        )}
      </CardContent>

      {selected && (
        <>
          <DrawerBackdrop onClick={() => setSelected(null)} aria-hidden />
          <DrawerPanel role="dialog" aria-label="Event detail">
            <DrawerClose type="button" onClick={() => setSelected(null)} aria-label="Close">×</DrawerClose>
            <DrawerTitle>Event: {selected.name}</DrawerTitle>
            <DrawerSection>
              <DrawerLabel>Time</DrawerLabel>
              <DrawerValue>
                {selected.timestamp != null ? new Date(selected.timestamp).toLocaleString() : '—'}
              </DrawerValue>
            </DrawerSection>
            <DrawerSection>
              <DrawerLabel>User</DrawerLabel>
              {userId ?? email ?? name ? (
                <>
                  {userId && <DrawerKv><DrawerKvKey>User ID</DrawerKvKey><DrawerKvVal>{userId}</DrawerKvVal></DrawerKv>}
                  {email && <DrawerKv><DrawerKvKey>Email</DrawerKvKey><DrawerKvVal>{email}</DrawerKvVal></DrawerKv>}
                  {name && <DrawerKv><DrawerKvKey>Name</DrawerKvKey><DrawerKvVal>{name}</DrawerKvVal></DrawerKv>}
                </>
              ) : (
                <DrawerValue>—</DrawerValue>
              )}
            </DrawerSection>
            <DrawerSection>
              <DrawerLabel>Source</DrawerLabel>
              <DrawerValue>{(props.source as string) ?? '—'}</DrawerValue>
            </DrawerSection>
            {restEntries.length > 0 && (
              <DrawerSection>
                <DrawerLabel>Other properties</DrawerLabel>
                {restEntries.map(([k, v]) => (
                  <DrawerKv key={k}>
                    <DrawerKvKey>{k}</DrawerKvKey>
                    <DrawerKvVal>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</DrawerKvVal>
                  </DrawerKv>
                ))}
              </DrawerSection>
            )}
          </DrawerPanel>
        </>
      )}
    </Card>
  )
}
