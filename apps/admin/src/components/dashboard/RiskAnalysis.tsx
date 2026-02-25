import styled from '@emotion/styled'
import { Card, CardHeader, CardTitle, CardContent, StyledProgress } from '@/styled'

const ICONS: Record<string, string> = {
  activity: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
}

const riskMetrics = [
  { name: 'Volatility', value: 18.5, max: 30, status: 'medium' as const, icon: 'activity' },
  { name: 'Sharpe Ratio', value: 1.85, max: 3, status: 'good' as const, icon: 'trending' },
  { name: 'Max Drawdown', value: 12.3, max: 25, status: 'good' as const, icon: 'alert' },
  { name: 'VaR (95%)', value: 5.2, max: 10, status: 'medium' as const, icon: 'shield' },
]

function getStatusClass(status: string) {
  switch (status) {
    case 'good': return 'bg-accent-10'
    case 'medium': return 'bg-chart-3-10'
    case 'bad': return 'bg-destructive-10'
    default: return 'bg-muted-10'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'good': return 'Excellent'
    case 'medium': return 'Normal'
    case 'bad': return 'Warning'
    default: return 'Unknown'
  }
}

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
`

const RiskBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: oklch(0.7 0.22 160 / 0.1);
`

const MetricBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const MetricLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const StatusPill = styled.span`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
`

const Footer = styled.div`
  padding-top: 1rem;
  border-top: 1px solid var(--border);
`

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
`

export function RiskAnalysis() {
  return (
    <Card className="glass" style={{ height: '100%' }}>
      <CardHeader>
        <HeaderRow>
          <CardTitle>Risk Analysis</CardTitle>
          <RiskBadge>
            <svg width="16" height="16" fill="none" stroke="var(--accent)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.shield} />
            </svg>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent)' }}>Low Risk</span>
          </RiskBadge>
        </HeaderRow>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {riskMetrics.map((metric) => (
          <MetricBlock key={metric.name}>
            <MetricRow>
              <MetricLeft>
                <svg width="16" height="16" fill="none" stroke="var(--muted-foreground)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[metric.icon] ?? ''} />
                </svg>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{metric.name}</span>
              </MetricLeft>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {metric.name === 'Sharpe Ratio' ? metric.value.toFixed(2) : `${metric.value}%`}
                </span>
                <StatusPill className={getStatusClass(metric.status)}>
                  {getStatusText(metric.status)}
                </StatusPill>
              </div>
            </MetricRow>
            <StyledProgress value={(metric.value / metric.max) * 100} />
          </MetricBlock>
        ))}
        <Footer>
          <FooterRow>
            <span style={{ color: 'var(--muted-foreground)' }}>Overall Risk Score</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>82</span>
              <span style={{ color: 'var(--muted-foreground)' }}>/100</span>
            </div>
          </FooterRow>
        </Footer>
      </CardContent>
    </Card>
  )
}
