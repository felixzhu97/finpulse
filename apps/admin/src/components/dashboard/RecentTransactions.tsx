import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@fintech/ui'

const transactions = [
  { type: 'buy' as const, symbol: 'NVDA', name: 'NVIDIA', amount: '100 shares', price: '¥62,847', time: 'Today 14:32', status: 'completed' },
  { type: 'sell' as const, symbol: 'AAPL', name: 'Apple Inc.', amount: '50 shares', price: '¥65,234', time: 'Today 11:15', status: 'completed' },
  { type: 'buy' as const, symbol: 'TSLA', name: 'Tesla', amount: '30 shares', price: '¥53,456', time: 'Yesterday 15:47', status: 'completed' },
  { type: 'sell' as const, symbol: 'MSFT', name: 'Microsoft', amount: '20 shares', price: '¥54,238', time: 'Yesterday 10:23', status: 'completed' },
  { type: 'buy' as const, symbol: 'BABA', name: 'Alibaba', amount: '200 shares', price: '¥112,567', time: '01/15', status: 'pending' },
]

export function RecentTransactions() {
  return (
    <Card className="bg-card border-border glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.symbol + tx.time}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'buy' ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                  {tx.type === 'buy' ? (
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{tx.symbol}</p>
                    <Badge className={tx.type === 'buy' ? 'text-xs bg-accent/10 text-accent hover:bg-accent/20' : 'text-xs bg-destructive/10 text-destructive hover:bg-destructive/20'}>
                      {tx.type === 'buy' ? 'Buy' : 'Sell'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{tx.name} · {tx.amount}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{tx.price}</p>
                <p className="text-xs text-muted-foreground">{tx.time}</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-2 text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
