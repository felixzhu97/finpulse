import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { AssetAllocation } from '@/components/dashboard/AssetAllocation'
import { MarketTrends } from '@/components/dashboard/MarketTrends'
import { WatchList } from '@/components/dashboard/WatchList'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { RiskAnalysis } from '@/components/dashboard/RiskAnalysis'
import { PageGrid, Col12, Col8, Col4, Col5, Col7, Col3 } from '@/styled'

export function Dashboard() {
  return (
    <PageGrid>
      <Col12>
        <PortfolioOverview />
      </Col12>
      <Col8>
        <PerformanceChart />
      </Col8>
      <Col4>
        <AssetAllocation />
      </Col4>
      <Col5>
        <MarketTrends />
      </Col5>
      <Col4>
        <WatchList />
      </Col4>
      <Col3>
        <QuickActions />
      </Col3>
      <Col7>
        <RecentTransactions />
      </Col7>
      <Col5>
        <RiskAnalysis />
      </Col5>
    </PageGrid>
  )
}
