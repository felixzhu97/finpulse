import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AllCommunityModule } from 'ag-grid-community'
import { AgGridProvider } from 'ag-grid-react'
import { PAGE_VIEW } from '@fintech/analytics'
import { useAnalytics } from '@fintech/analytics/react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Dashboard } from '@/pages/Dashboard'
import { Portfolio } from '@/pages/Portfolio'
import { Transactions } from '@/pages/Transactions'
import { Clients } from '@/pages/Clients'
import { Reports } from '@/pages/Reports'
import { Behavior } from '@/pages/Behavior'
import { AppRoot, MainCol, Main } from '@/styled'

const modules = [AllCommunityModule]

export default function App() {
  const location = useLocation()
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.track(PAGE_VIEW, { path: location.pathname })
  }, [location.pathname, analytics])

  return (
    <AgGridProvider modules={modules}>
      <AppRoot>
        <Sidebar />
        <MainCol>
          <Header />
          <Main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/behavior" element={<Behavior />} />
            </Routes>
          </Main>
        </MainCol>
      </AppRoot>
    </AgGridProvider>
  )
}
