import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createConsoleTransport, createHttpTransport } from '@fintech/analytics'
import { AnalyticsProvider } from '@fintech/analytics/react'
import App from './App'
import './styles.css'

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
const analyticsTransport = apiBase ? createHttpTransport(apiBase, 'admin') : createConsoleTransport()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AnalyticsProvider transport={analyticsTransport}>
        <App />
      </AnalyticsProvider>
    </BrowserRouter>
  </StrictMode>,
)
