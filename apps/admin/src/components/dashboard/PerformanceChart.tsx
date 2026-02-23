import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@fintech/ui'
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

export function PerformanceChart() {
  const [activeRange, setActiveRange] = useState('1Y')

  return (
    <Card className="bg-card border-border glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Portfolio Performance</CardTitle>
          <p className="text-sm text-muted-foreground">vs Benchmark Index</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={activeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveRange(range)}
              className={activeRange === range ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="portfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.22 160)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.7 0.22 160)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260)" />
              <XAxis dataKey="date" stroke="oklch(0.6 0.02 260)" fontSize={11} />
              <YAxis stroke="oklch(0.6 0.02 260)" fontSize={11} tickFormatter={(v) => `¥${(v / 1e6).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.14 0.015 260 / 0.95)',
                  border: '1px solid oklch(0.25 0.02 260)',
                  borderRadius: 8,
                }}
                labelStyle={{ color: 'oklch(0.98 0 0)' }}
                formatter={(value: number) => [`¥${(value / 1e6).toFixed(2)}M`, '']}
                labelFormatter={(label) => label}
              />
              <Area type="monotone" dataKey="value" stroke="oklch(0.65 0.2 250)" fill="url(#portfolio)" strokeWidth={2} name="Portfolio" />
              <Area type="monotone" dataKey="benchmark" stroke="oklch(0.7 0.22 160)" fill="url(#benchmark)" strokeWidth={2} name="Benchmark" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Benchmark</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
