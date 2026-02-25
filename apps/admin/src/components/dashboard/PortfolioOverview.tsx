import styled from '@emotion/styled'
import { Card, CardContent, Grid4 } from '@/styled'

interface Stat {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
  color: string
}

const ICONS: Record<string, string> = {
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  target: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  activity: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
}

const stats: Stat[] = [
  { title: 'Total Net Assets', value: '¥12,847,382', change: '+12.5%', trend: 'up', icon: 'wallet', color: 'primary' },
  { title: "Today's Profit", value: '¥128,473', change: '+2.34%', trend: 'up', icon: 'trending', color: 'accent' },
  { title: 'Cumulative Return', value: '34.82%', change: '+5.2%', trend: 'up', icon: 'target', color: 'chart-3' },
  { title: 'Active Trades', value: '47', change: '-3', trend: 'down', icon: 'activity', color: 'chart-5' },
]

const StatCard = styled(Card)`
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.3s;
  &:hover {
    border-color: oklch(0.78 0.19 145 / 0.35);
  }
`

const StatInner = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`

const StatLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const StatTitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted-foreground);
`

const StatValue = styled.p`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
`

const ChangeRow = styled.div<{ trend: 'up' | 'down' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(p) => (p.trend === 'up' ? 'var(--accent)' : 'var(--destructive)')};
`

const ChangeMuted = styled.span`
  margin-left: 0.25rem;
  color: var(--muted-foreground);
`

const IconBoxVar = styled.div<{ color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
`

const colorMap: Record<string, string> = {
  primary: 'var(--primary)',
  accent: 'var(--accent)',
  'chart-3': 'var(--chart-3)',
  'chart-5': 'var(--chart-5)',
}

const bgMap: Record<string, string> = {
  primary: 'oklch(0.65 0.2 250 / 0.1)',
  accent: 'oklch(0.7 0.22 160 / 0.1)',
  'chart-3': 'oklch(0.75 0.18 80 / 0.1)',
  'chart-5': 'oklch(0.7 0.15 300 / 0.1)',
}

export function PortfolioOverview() {
  return (
    <Grid4>
      {stats.map((stat) => (
        <StatCard key={stat.title} className="glass glow-border">
          <CardContent style={{ padding: '1.25rem' }}>
            <StatInner>
              <StatLeft>
                <StatTitle>{stat.title}</StatTitle>
                <StatValue>{stat.value}</StatValue>
                <ChangeRow trend={stat.trend}>
                  {stat.trend === 'up' ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                    </svg>
                  )}
                  {stat.change}
                  <ChangeMuted>This month</ChangeMuted>
                </ChangeRow>
              </StatLeft>
              <IconBoxVar color={stat.color} style={{ background: bgMap[stat.color], color: colorMap[stat.color] }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[stat.icon] ?? ''} />
                </svg>
              </IconBoxVar>
            </StatInner>
          </CardContent>
        </StatCard>
      ))}
    </Grid4>
  )
}
