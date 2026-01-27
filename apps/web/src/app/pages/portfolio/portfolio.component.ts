import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi, themeQuartz } from 'ag-grid-community';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';

interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  allocation: number;
  sector: string;
}

const fintechDarkGridTheme = themeQuartz.withParams({
  backgroundColor: '#101827',
  foregroundColor: '#ffffff',
  browserColorScheme: 'dark'
});

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, AgGridAngular, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  template: `
    <app-card className="bg-card border-border glass">
      <app-card-header className="pb-4">
        <app-card-title className="text-2xl font-semibold">Portfolio</app-card-title>
        <p class="text-sm text-muted-foreground mt-1">View your complete investment portfolio</p>
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
export class PortfolioComponent {
  private gridApi!: GridApi;
  gridTheme = fintechDarkGridTheme;

  rowData: PortfolioItem[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, avgPrice: 175.20, currentPrice: 182.52, marketValue: 9126.00, costBasis: 8760.00, gainLoss: 366.00, gainLossPercent: 4.18, allocation: 18.5, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft', quantity: 30, avgPrice: 365.80, currentPrice: 378.91, marketValue: 11367.30, costBasis: 10974.00, gainLoss: 393.30, gainLossPercent: 3.59, allocation: 23.0, sector: 'Technology' },
    { symbol: 'NVDA', name: 'NVIDIA', quantity: 20, avgPrice: 850.00, currentPrice: 875.28, marketValue: 17505.60, costBasis: 17000.00, gainLoss: 505.60, gainLossPercent: 2.98, allocation: 35.5, sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla', quantity: 25, avgPrice: 240.00, currentPrice: 248.34, marketValue: 6208.50, costBasis: 6000.00, gainLoss: 208.50, gainLossPercent: 3.48, allocation: 12.6, sector: 'Automotive' },
    { symbol: 'GOOGL', name: 'Alphabet', quantity: 15, avgPrice: 138.50, currentPrice: 142.50, marketValue: 2137.50, costBasis: 2077.50, gainLoss: 60.00, gainLossPercent: 2.89, allocation: 4.3, sector: 'Technology' },
    { symbol: 'BABA', name: 'Alibaba', quantity: 100, avgPrice: 75.00, currentPrice: 78.45, marketValue: 7845.00, costBasis: 7500.00, gainLoss: 345.00, gainLossPercent: 4.60, allocation: 15.9, sector: 'E-commerce' },
    { symbol: 'JPM', name: 'JPMorgan Chase', quantity: 40, avgPrice: 145.20, currentPrice: 148.75, marketValue: 5950.00, costBasis: 5808.00, gainLoss: 142.00, gainLossPercent: 2.45, allocation: 12.1, sector: 'Finance' },
  ];

  columnDefs: ColDef[] = [
    { 
      field: 'symbol', 
      headerName: 'Symbol',
      sortable: true,
      filter: true,
      width: 100,
      pinned: 'left'
    },
    { 
      field: 'name', 
      headerName: 'Name',
      sortable: true,
      filter: true,
      flex: 1
    },
    { 
      field: 'sector', 
      headerName: 'Sector',
      sortable: true,
      filter: true,
      width: 120
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100
    },
    { 
      field: 'avgPrice', 
      headerName: 'Avg Price',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 110,
      valueFormatter: (params: any) => `¥${params.value.toFixed(2)}`
    },
    { 
      field: 'currentPrice', 
      headerName: 'Current Price',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      valueFormatter: (params: any) => `¥${params.value.toFixed(2)}`
    },
    { 
      field: 'marketValue', 
      headerName: 'Market Value',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params: any) => `¥${params.value.toFixed(2)}`,
      cellRenderer: (params: any) => `<span class="font-semibold">¥${params.value.toFixed(2)}</span>`
    },
    { 
      field: 'costBasis', 
      headerName: 'Cost Basis',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      valueFormatter: (params: any) => `¥${params.value.toFixed(2)}`
    },
    { 
      field: 'gainLoss', 
      headerName: 'Gain/Loss',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      cellRenderer: (params: any) => {
        const isPositive = params.value >= 0;
        const color = isPositive ? 'text-accent' : 'text-destructive';
        const sign = isPositive ? '+' : '';
        return `<span class="font-semibold ${color}">${sign}¥${params.value.toFixed(2)}</span>`;
      }
    },
    { 
      field: 'gainLossPercent', 
      headerName: 'Gain/Loss %',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      cellRenderer: (params: any) => {
        const isPositive = params.value >= 0;
        const color = isPositive ? 'text-accent' : 'text-destructive';
        const sign = isPositive ? '+' : '';
        return `<span class="font-semibold ${color}">${sign}${params.value.toFixed(2)}%</span>`;
      }
    },
    { 
      field: 'allocation', 
      headerName: 'Allocation %',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      cellRenderer: (params: any) => `${params.value.toFixed(1)}%`
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
