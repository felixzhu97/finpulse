import { Card, CardHeader, CardTitle, CardContent } from '@fintech/ui'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const markets = [
  { name: 'Shanghai Composite', code: 'SH000001', price: '3,254.68', change: '+1.24%', trend: 'up' as const, data: [30, 32, 35, 33, 38, 40, 42, 45, 43, 48] },
  { name: 'Shenzhen Component', code: 'SZ399001', price: '10,847.32', change: '+0.87%', trend: 'up' as const, data: [40, 38, 42, 45, 43, 47, 50, 48, 52, 55] },
  { name: 'ChiNext Index', code: 'SZ399006', price: '2,156.47', change: '-0.32%', trend: 'down' as const, data: [50, 48, 52, 49, 47, 45, 48, 46, 44, 42] },
  { name: 'Hang Seng Index', code: 'HK.HSI', price: '17,432.56', change: '+2.15%', trend: 'up' as const, data: [35, 38, 40, 42, 45, 48, 50, 53, 56, 58] },
  { name: 'NASDAQ', code: 'NASDAQ', price: '16,742.89', change: '+0.56%', trend: 'up' as const, data: [60, 62, 58, 65, 63, 68, 70, 72, 69, 74] },
]

export function MarketTrends() {
  return (
    <Card className="bg-card border-border glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Market Trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {markets.map((market) => (
          <div
            key={market.code}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{market.name}</p>
              <p className="text-xs text-muted-foreground">{market.code}</p>
            </div>
            <div className="w-20 h-8 mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={market.data.map((v, i) => ({ x: i, v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={market.trend === 'up' ? 'oklch(0.7 0.22 160)' : 'oklch(0.6 0.2 25)'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{market.price}</p>
              <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${market.trend === 'up' ? 'text-accent' : 'text-destructive'}`}>
                {market.trend === 'up' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                  </svg>
                )}
                {market.change}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
