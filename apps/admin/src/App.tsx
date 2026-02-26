import { Routes, Route } from 'react-router-dom'
import { AllCommunityModule } from 'ag-grid-community'
import { AgGridProvider } from 'ag-grid-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Dashboard } from '@/pages/Dashboard'
import { Portfolio } from '@/pages/Portfolio'
import { Transactions } from '@/pages/Transactions'
import { Clients } from '@/pages/Clients'
import { Reports } from '@/pages/Reports'
import { AppRoot, MainCol, Main } from '@/styled'

const modules = [AllCommunityModule]

export default function App() {
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
          </Routes>
        </Main>
      </MainCol>
    </AppRoot>
    </AgGridProvider>
  )
}
