import styled from '@emotion/styled'
import { Card, CardHeader, CardTitle, CardContent } from '@/styled'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const markets = [
  { name: 'Shanghai Composite', code: 'SH000001', price: '3,254.68', change: '+1.24%', trend: 'up' as const, data: [30, 32, 35, 33, 38, 40, 42, 45, 43, 48] },
  { name: 'Shenzhen Component', code: 'SZ399001', price: '10,847.32', change: '+0.87%', trend: 'up' as const, data: [40, 38, 42, 45, 43, 47, 50, 48, 52, 55] },
  { name: 'ChiNext Index', code: 'SZ399006', price: '2,156.47', change: '-0.32%', trend: 'down' as const, data: [50, 48, 52, 49, 47, 45, 48, 46, 44, 42] },
  { name: 'Hang Seng Index', code: 'HK.HSI', price: '17,432.56', change: '+2.15%', trend: 'up' as const, data: [35, 38, 40, 42, 45, 48, 50, 53, 56, 58] },
  { name: 'NASDAQ', code: 'NASDAQ', price: '16,742.89', change: '+0.56%', trend: 'up' as const, data: [60, 62, 58, 65, 63, 68, 70, 72, 69, 74] },
]

const MarketRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: oklch(0.2 0.02 260 / 0.3);
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: oklch(0.2 0.02 260 / 0.5);
  }
`

const MarketLeft = styled.div`
  flex: 1;
`

const SparkWrap = styled.div`
  width: 5rem;
  height: 2rem;
  margin: 0 1rem;
`

const MarketRight = styled.div`
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

export function MarketTrends() {
  return (
    <Card className="glass" style={{ height: '100%' }}>
      <CardHeader style={{ paddingBottom: '0.5rem' }}>
        <CardTitle>Market Trends</CardTitle>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {markets.map((market) => (
          <MarketRow key={market.code}>
            <MarketLeft>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>{market.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{market.code}</p>
            </MarketLeft>
            <SparkWrap>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={market.data.map((v, i) => ({ x: i, v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={market.trend === 'up' ? 'oklch(0.78 0.19 145)' : 'oklch(0.55 0.22 25)'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </SparkWrap>
            <MarketRight>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{market.price}</p>
              {market.trend === 'up' ? (
                <TrendUp>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {market.change}
                </TrendUp>
              ) : (
                <TrendDown>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                  </svg>
                  {market.change}
                </TrendDown>
              )}
            </MarketRight>
          </MarketRow>
        ))}
      </CardContent>
    </Card>
  )
}
