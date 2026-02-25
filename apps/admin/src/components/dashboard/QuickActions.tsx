import styled from '@emotion/styled'
import { Card, CardHeader, CardTitle, CardContent, StyledButton } from '@/styled'

const ICONS: Record<string, string> = {
  'arrow-up-right': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  'arrow-down-left': 'M17 17l-8-8m0 0H6m3 0v3m8-3V6m0 0h-3m3 0l-8 8',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
}

const actions = [
  { icon: 'arrow-up-right', label: 'Buy', bg: 'oklch(0.7 0.22 160 / 0.1)', color: 'var(--accent)', hover: 'oklch(0.7 0.22 160 / 0.2)' },
  { icon: 'arrow-down-left', label: 'Sell', bg: 'oklch(0.6 0.2 25 / 0.1)', color: 'var(--destructive)', hover: 'oklch(0.6 0.2 25 / 0.2)' },
  { icon: 'refresh', label: 'Rebalance', bg: 'oklch(0.65 0.2 250 / 0.1)', color: 'var(--primary)', hover: 'oklch(0.65 0.2 250 / 0.2)' },
  { icon: 'send', label: 'Transfer', bg: 'oklch(0.75 0.18 80 / 0.1)', color: 'var(--chart-3)', hover: 'oklch(0.75 0.18 80 / 0.2)' },
  { icon: 'file-text', label: 'Reports', bg: 'oklch(0.7 0.15 300 / 0.1)', color: 'var(--chart-5)', hover: 'oklch(0.7 0.15 300 / 0.2)' },
  { icon: 'download', label: 'Export', bg: 'var(--muted)', color: 'var(--muted-foreground)', hover: 'oklch(0.2 0.015 260 / 0.8)' },
]

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`

const ActionBtn = styled(StyledButton)<{ bg: string; color: string; hover: string }>`
  height: auto;
  padding: 1rem;
  flex-direction: column;
  gap: 0.5rem;
  background: ${(p) => p.bg} !important;
  color: ${(p) => p.color} !important;
  transition: background 0.2s;
  &:hover {
    background: ${(p) => p.hover} !important;
  }
`

export function QuickActions() {
  return (
    <Card className="glass" style={{ height: '100%' }}>
      <CardHeader style={{ paddingBottom: '0.5rem' }}>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionGrid>
          {actions.map((action) => (
            <ActionBtn
              key={action.label}
              variant="ghost"
              type="button"
              bg={action.bg}
              color={action.color}
              hover={action.hover}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[action.icon] ?? ''} />
              </svg>
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{action.label}</span>
            </ActionBtn>
          ))}
        </ActionGrid>
      </CardContent>
    </Card>
  )
}
