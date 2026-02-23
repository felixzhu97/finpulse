import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { AssetAllocation } from '@/components/dashboard/AssetAllocation'
import { MarketTrends } from '@/components/dashboard/MarketTrends'
import { WatchList } from '@/components/dashboard/WatchList'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { RiskAnalysis } from '@/components/dashboard/RiskAnalysis'

export function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <PortfolioOverview />
      </div>
      <div className="col-span-8">
        <PerformanceChart />
      </div>
      <div className="col-span-4">
        <AssetAllocation />
      </div>
      <div className="col-span-5">
        <MarketTrends />
      </div>
      <div className="col-span-4">
        <WatchList />
      </div>
      <div className="col-span-3">
        <QuickActions />
      </div>
      <div className="col-span-7">
        <RecentTransactions />
      </div>
      <div className="col-span-5">
        <RiskAnalysis />
      </div>
    </div>
  )
}
