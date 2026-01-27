import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'transactions',
    component: TransactionsComponent
  },
  {
    path: 'clients',
    component: ClientsComponent
  },
  {
    path: 'reports',
    component: ReportsComponent
  },
  {
    path: 'portfolio',
    component: PortfolioComponent
  }
];
