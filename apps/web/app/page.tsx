import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { MarketTrends } from "@/components/market-trends"
import { AssetAllocation } from "@/components/asset-allocation"
import { RecentTransactions } from "@/components/recent-transactions"
import { PerformanceChart } from "@/components/performance-chart"
import { WatchList } from "@/components/watch-list"
import { RiskAnalysis } from "@/components/risk-analysis"
import { QuickActions } from "@/components/quick-actions"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Top row - Portfolio Overview */}
            <div className="col-span-12">
              <PortfolioOverview />
            </div>

            {/* Second row - Charts */}
            <div className="col-span-8">
              <PerformanceChart />
            </div>
            <div className="col-span-4">
              <AssetAllocation />
            </div>

            {/* Third row - Market & Watch */}
            <div className="col-span-5">
              <MarketTrends />
            </div>
            <div className="col-span-4">
              <WatchList />
            </div>
            <div className="col-span-3">
              <QuickActions />
            </div>

            {/* Bottom row - Transactions & Risk */}
            <div className="col-span-7">
              <RecentTransactions />
            </div>
            <div className="col-span-5">
              <RiskAnalysis />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
