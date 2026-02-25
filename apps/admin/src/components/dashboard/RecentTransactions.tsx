import styled from '@emotion/styled'
import { Card, CardHeader, CardTitle, CardContent, StyledButton, StyledBadge } from '@/styled'

const transactions = [
  { type: 'buy' as const, symbol: 'NVDA', name: 'NVIDIA', amount: '100 shares', price: '¥62,847', time: 'Today 14:32', status: 'completed' },
  { type: 'sell' as const, symbol: 'AAPL', name: 'Apple Inc.', amount: '50 shares', price: '¥65,234', time: 'Today 11:15', status: 'completed' },
  { type: 'buy' as const, symbol: 'TSLA', name: 'Tesla', amount: '30 shares', price: '¥53,456', time: 'Yesterday 15:47', status: 'completed' },
  { type: 'sell' as const, symbol: 'MSFT', name: 'Microsoft', amount: '20 shares', price: '¥54,238', time: 'Yesterday 10:23', status: 'completed' },
  { type: 'buy' as const, symbol: 'BABA', name: 'Alibaba', amount: '200 shares', price: '¥112,567', time: '01/15', status: 'pending' },
]

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
`

const TxRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: oklch(0.2 0.02 260 / 0.3);
  transition: background 0.15s;
  &:hover {
    background: oklch(0.2 0.02 260 / 0.5);
  }
`

const TxLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const TxIcon = styled.div<{ type: 'buy' | 'sell' }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => (p.type === 'buy' ? 'oklch(0.7 0.22 160 / 0.1)' : 'oklch(0.6 0.2 25 / 0.1)')};
`

const BadgeBuy = styled(StyledBadge)`
  background: oklch(0.7 0.22 160 / 0.1);
  color: var(--accent);
  font-size: 0.75rem;
`

const BadgeSell = styled(StyledBadge)`
  background: oklch(0.6 0.2 25 / 0.1);
  color: var(--destructive);
  font-size: 0.75rem;
`

export function RecentTransactions() {
  return (
    <Card className="glass">
      <CardHeader>
        <HeaderRow>
          <CardTitle>Recent Transactions</CardTitle>
          <StyledButton variant="ghost" size="sm" type="button" style={{ color: 'var(--primary)' }}>
            View All
          </StyledButton>
        </HeaderRow>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transactions.map((tx) => (
            <TxRow key={tx.symbol + tx.time}>
              <TxLeft>
                <TxIcon type={tx.type}>
                  {tx.type === 'buy' ? (
                    <svg width="20" height="20" fill="none" stroke="var(--accent)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="var(--destructive)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                    </svg>
                  )}
                </TxIcon>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{tx.symbol}</p>
                    {tx.type === 'buy' ? <BadgeBuy>Buy</BadgeBuy> : <BadgeSell>Sell</BadgeSell>}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{tx.name} · {tx.amount}</p>
                </div>
              </TxLeft>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{tx.price}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{tx.time}</p>
              </div>
              <StyledButton variant="ghost" size="icon" type="button" style={{ marginLeft: 8 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </StyledButton>
            </TxRow>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
