import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi, themeQuartz } from 'ag-grid-community';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  portfolioValue: number;
  totalAssets: number;
  activeInvestments: number;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
}

const fintechDarkGridTheme = themeQuartz.withParams({
  backgroundColor: '#101827',
  foregroundColor: '#ffffff',
  browserColorScheme: 'dark'
});

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, AgGridAngular, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  template: `
    <app-card className="bg-card border-border glass">
      <app-card-header className="pb-4">
        <app-card-title className="text-2xl font-semibold">Clients</app-card-title>
        <p class="text-sm text-muted-foreground mt-1">Manage your client portfolio and relationships</p>
      </app-card-header>
      <app-card-content>
        <div class="ag-theme-quartz h-[600px] w-full rounded-xl overflow-hidden">
          <ag-grid-angular
            [rowData]="rowData"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [pagination]="true"
            [paginationPageSize]="20"
            [rowSelection]="'multiple'"
            [animateRows]="true"
            [theme]="gridTheme"
            (gridReady)="onGridReady($event)"
            style="width: 100%; height: 100%;">
          </ag-grid-angular>
        </div>
      </app-card-content>
    </app-card>
  `,
  styles: []
})
export class ClientsComponent {
  private gridApi!: GridApi;
  gridTheme = fintechDarkGridTheme;

  rowData: Client[] = [
    { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '+1 234-567-8900', portfolioValue: 1250000, totalAssets: 8, activeInvestments: 5, joinDate: '2024-01-15', status: 'Active', riskProfile: 'Moderate' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 234-567-8901', portfolioValue: 850000, totalAssets: 6, activeInvestments: 4, joinDate: '2024-03-20', status: 'Active', riskProfile: 'Conservative' },
    { id: '3', name: 'Michael Chen', email: 'm.chen@email.com', phone: '+1 234-567-8902', portfolioValue: 2100000, totalAssets: 12, activeInvestments: 8, joinDate: '2023-11-10', status: 'Active', riskProfile: 'Aggressive' },
    { id: '4', name: 'Emily Davis', email: 'emily.d@email.com', phone: '+1 234-567-8903', portfolioValue: 450000, totalAssets: 4, activeInvestments: 3, joinDate: '2025-01-05', status: 'Pending', riskProfile: 'Moderate' },
    { id: '5', name: 'David Wilson', email: 'd.wilson@email.com', phone: '+1 234-567-8904', portfolioValue: 3200000, totalAssets: 15, activeInvestments: 10, joinDate: '2023-08-22', status: 'Active', riskProfile: 'Aggressive' },
    { id: '6', name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+1 234-567-8905', portfolioValue: 680000, totalAssets: 5, activeInvestments: 3, joinDate: '2024-06-12', status: 'Inactive', riskProfile: 'Conservative' },
    { id: '7', name: 'Robert Brown', email: 'robert.b@email.com', phone: '+1 234-567-8906', portfolioValue: 950000, totalAssets: 7, activeInvestments: 5, joinDate: '2024-09-30', status: 'Active', riskProfile: 'Moderate' },
    { id: '8', name: 'Jennifer Taylor', email: 'j.taylor@email.com', phone: '+1 234-567-8907', portfolioValue: 1750000, totalAssets: 10, activeInvestments: 7, joinDate: '2023-12-05', status: 'Active', riskProfile: 'Aggressive' },
  ];

  columnDefs: ColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name',
      sortable: true,
      filter: true,
      flex: 1,
      pinned: 'left'
    },
    { 
      field: 'email', 
      headerName: 'Email',
      sortable: true,
      filter: true,
      flex: 1
    },
    { 
      field: 'phone', 
      headerName: 'Phone',
      sortable: true,
      filter: true,
      width: 150
    },
    { 
      field: 'portfolioValue', 
      headerName: 'Portfolio Value',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 150,
      valueFormatter: (params: any) => `¥${(params.value / 1000000).toFixed(2)}M`,
      cellRenderer: (params: any) => `<span class="font-semibold">¥${(params.value / 1000000).toFixed(2)}M</span>`
    },
    { 
      field: 'totalAssets', 
      headerName: 'Total Assets',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120
    },
    { 
      field: 'activeInvestments', 
      headerName: 'Active Investments',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 150
    },
    { 
      field: 'joinDate', 
      headerName: 'Join Date',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 120
    },
    { 
      field: 'status', 
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const colors: { [key: string]: string } = {
          'Active': 'bg-accent/10 text-accent',
          'Inactive': 'bg-muted/10 text-muted-foreground',
          'Pending': 'bg-chart-3/10 text-chart-3'
        };
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colors[params.value] || ''}">${params.value}</span>`;
      }
    },
    { 
      field: 'riskProfile', 
      headerName: 'Risk Profile',
      sortable: true,
      filter: true,
      width: 140,
      cellRenderer: (params: any) => {
        const colors: { [key: string]: string } = {
          'Conservative': 'bg-chart-3/10 text-chart-3',
          'Moderate': 'bg-chart-2/10 text-chart-2',
          'Aggressive': 'bg-destructive/10 text-destructive'
        };
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colors[params.value] || ''}">${params.value}</span>`;
      }
    }
  ];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
}
