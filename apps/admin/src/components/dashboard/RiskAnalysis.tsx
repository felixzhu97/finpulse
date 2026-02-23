import { Card, CardHeader, CardTitle, CardContent, Progress } from '@fintech/ui'

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
    case 'good': return 'bg-accent/10 text-accent'
    case 'medium': return 'bg-chart-3/10 text-chart-3'
    case 'bad': return 'bg-destructive/10 text-destructive'
    default: return 'bg-muted text-muted-foreground'
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

export function RiskAnalysis() {
  return (
    <Card className="bg-card border-border glass h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Risk Analysis</CardTitle>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.shield} />
            </svg>
            <span className="text-xs font-medium text-accent">Low Risk</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskMetrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[metric.icon] ?? ''} />
                </svg>
                <span className="text-sm font-medium">{metric.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {metric.name === 'Sharpe Ratio' ? metric.value.toFixed(2) : `${metric.value}%`}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusClass(metric.status)}`}>
                  {getStatusText(metric.status)}
                </span>
              </div>
            </div>
            <Progress value={(metric.value / metric.max) * 100} className="h-2 bg-secondary" />
          </div>
        ))}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Risk Score</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-accent">82</span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
