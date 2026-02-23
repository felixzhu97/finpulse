import { Card, CardContent } from '@fintech/ui'

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

export function PortfolioOverview() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="p-5 bg-card border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer glass glow-border"
        >
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <div
                  className={`inline-flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-accent' : 'text-destructive'}`}
                >
                  {stat.trend === 'up' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                    </svg>
                  )}
                  {stat.change}
                  <span className="text-muted-foreground ml-1">This month</span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-${stat.color}/10`}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: `var(--${stat.color})` }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[stat.icon] ?? ''} />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
