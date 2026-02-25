import { useState } from 'react'
import styled from '@emotion/styled'
import { Card, CardHeader, CardTitle, CardContent, StyledButton } from '@/styled'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'All']

const data = [
  { date: 'Jan', value: 10000000, benchmark: 9800000 },
  { date: 'Feb', value: 10500000, benchmark: 10000000 },
  { date: 'Mar', value: 10200000, benchmark: 10100000 },
  { date: 'Apr', value: 11200000, benchmark: 10400000 },
  { date: 'May', value: 11800000, benchmark: 10600000 },
  { date: 'Jun', value: 11500000, benchmark: 10800000 },
  { date: 'Jul', value: 12100000, benchmark: 11000000 },
  { date: 'Aug', value: 12400000, benchmark: 11200000 },
  { date: 'Sep', value: 12000000, benchmark: 11100000 },
  { date: 'Oct', value: 12300000, benchmark: 11300000 },
  { date: 'Nov', value: 12600000, benchmark: 11500000 },
  { date: 'Dec', value: 12847382, benchmark: 11700000 },
]

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
`

const RangeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  background: var(--secondary);
  border-radius: var(--radius);
`

const ChartWrap = styled.div`
  height: 300px;
`

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const LegendDot = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
`

export function PerformanceChart() {
  const [activeRange, setActiveRange] = useState('1Y')

  return (
    <Card className="glass">
      <CardHeader>
        <HeaderRow>
          <div>
            <CardTitle>Portfolio Performance</CardTitle>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>vs Benchmark Index</p>
          </div>
          <RangeGroup>
            {timeRanges.map((range) => (
              <StyledButton
                key={range}
                variant={activeRange === range ? 'default' : 'ghost'}
                size="sm"
                active={activeRange === range}
                type="button"
                onClick={() => setActiveRange(range)}
              >
                {range}
              </StyledButton>
            ))}
          </RangeGroup>
        </HeaderRow>
      </CardHeader>
      <CardContent style={{ paddingTop: '1rem' }}>
        <ChartWrap>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="portfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.19 145)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.78 0.19 145)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.02 260)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="oklch(0.55 0.02 260)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `¥${(v / 1e6).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value: number) => [`¥${(value / 1e6).toFixed(2)}M`, '']}
                labelFormatter={(label) => label}
              />
              <Area type="monotone" dataKey="value" stroke="oklch(0.78 0.19 145)" fill="url(#portfolio)" strokeWidth={2} name="Portfolio" />
              <Area type="monotone" dataKey="benchmark" stroke="var(--muted-foreground)" fill="url(#benchmark)" strokeWidth={2} name="Benchmark" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrap>
        <LegendRow>
          <LegendItem>
            <LegendDot style={{ background: 'var(--primary)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Portfolio</span>
          </LegendItem>
          <LegendItem>
            <LegendDot style={{ background: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Benchmark</span>
          </LegendItem>
        </LegendRow>
      </CardContent>
    </Card>
  )
}
