import { Card, CardHeader, CardTitle, CardContent, Button } from '@fintech/ui'

const watchItems = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '182.52', change: '+2.34%', trend: 'up' as const },
  { symbol: 'TSLA', name: 'Tesla', price: '248.34', change: '-1.23%', trend: 'down' as const },
  { symbol: 'NVDA', name: 'NVIDIA', price: '875.28', change: '+4.56%', trend: 'up' as const },
  { symbol: 'BABA', name: 'Alibaba', price: '78.45', change: '+1.87%', trend: 'up' as const },
  { symbol: 'MSFT', name: 'Microsoft', price: '378.91', change: '+0.89%', trend: 'up' as const },
]

export function WatchList() {
  return (
    <Card className="bg-card border-border glass h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Watch List</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {watchItems.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-chart-3 fill-chart-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div>
                <p className="font-semibold text-sm">{item.symbol}</p>
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm">${item.price}</p>
              <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${item.trend === 'up' ? 'text-accent' : 'text-destructive'}`}>
                {item.trend === 'up' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                  </svg>
                )}
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
