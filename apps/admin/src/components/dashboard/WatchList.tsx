import styled from '@emotion/styled'
import { Card, CardHeader, CardTitle, CardContent, StyledButton } from '@/styled'

const watchItems = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '182.52', change: '+2.34%', trend: 'up' as const },
  { symbol: 'TSLA', name: 'Tesla', price: '248.34', change: '-1.23%', trend: 'down' as const },
  { symbol: 'NVDA', name: 'NVIDIA', price: '875.28', change: '+4.56%', trend: 'up' as const },
  { symbol: 'BABA', name: 'Alibaba', price: '78.45', change: '+1.87%', trend: 'up' as const },
  { symbol: 'MSFT', name: 'Microsoft', price: '378.91', change: '+0.89%', trend: 'up' as const },
]

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
`

const WatchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: oklch(0.2 0.02 260 / 0.5);
  }
`

const WatchLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const WatchRight = styled.div`
  text-align: right;
`

const TrendUp = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.125rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--accent);
`

const TrendDown = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.125rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--destructive);
`

export function WatchList() {
  return (
    <Card className="glass" style={{ height: '100%' }}>
      <CardHeader>
        <HeaderRow>
          <CardTitle>Watch List</CardTitle>
          <StyledButton variant="ghost" size="sm" type="button">
            <svg width="16" height="16" style={{ marginRight: 4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </StyledButton>
        </HeaderRow>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {watchItems.map((item) => (
          <WatchRow key={item.symbol}>
            <WatchLeft>
              <svg width="16" height="16" fill="var(--chart-3)" style={{ opacity: 0.5 }} viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{item.symbol}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{item.name}</p>
              </div>
            </WatchLeft>
            <WatchRight>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>${item.price}</p>
              {item.trend === 'up' ? (
                <TrendUp>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {item.change}
                </TrendUp>
              ) : (
                <TrendDown>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                  </svg>
                  {item.change}
                </TrendDown>
              )}
            </WatchRight>
          </WatchRow>
        ))}
      </CardContent>
    </Card>
  )
}
