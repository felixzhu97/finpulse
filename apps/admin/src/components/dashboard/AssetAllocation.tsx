import styled from '@emotion/styled'
import { Card, CardHeader, CardTitle, CardContent } from '@/styled'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { name: 'Stocks', value: 45, color: 'oklch(0.78 0.19 145)' },
  { name: 'Bonds', value: 25, color: 'oklch(0.72 0.16 280)' },
  { name: 'Funds', value: 15, color: 'oklch(0.75 0.18 80)' },
  { name: 'Cash', value: 10, color: 'oklch(0.7 0.15 300)' },
  { name: 'Other', value: 5, color: 'oklch(0.5 0.02 260)' },
]

const ChartWrap = styled.div`
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CenterLabel = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
`

const LegendList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LegendLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const LegendDot = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
`

export function AssetAllocation() {
  return (
    <Card className="glass" style={{ height: '100%' }}>
      <CardHeader style={{ paddingBottom: '0.5rem' }}>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartWrap>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <CenterLabel>
            <div>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>¥12.8M</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Total Assets</p>
            </div>
          </CenterLabel>
        </ChartWrap>
        <LegendList>
          {data.map((item) => (
            <LegendRow key={item.name}>
              <LegendLeft>
                <LegendDot style={{ backgroundColor: item.color }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.name}</span>
              </LegendLeft>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.value}%</span>
            </LegendRow>
          ))}
        </LegendList>
      </CardContent>
    </Card>
  )
}
