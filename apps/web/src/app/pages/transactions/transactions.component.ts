import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { finpulseAgGridTheme } from '../../shared/ag-grid/ag-grid-theme';

interface Transaction {
  id: string;
  date: string;
  type: 'Buy' | 'Sell' | 'Deposit' | 'Withdrawal';
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  fee: number;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, AgGridAngular, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  template: `
    <app-card className="bg-card border-border glass">
      <app-card-header className="pb-4">
        <app-card-title className="text-2xl font-semibold">Transactions</app-card-title>
        <p class="text-sm text-muted-foreground mt-1">View and manage all your transaction history</p>
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
export class TransactionsComponent {
  private gridApi!: GridApi;
  gridTheme = finpulseAgGridTheme;

  rowData: Transaction[] = [
    { id: '1', date: '2026-01-27', type: 'Buy', symbol: 'AAPL', name: 'Apple Inc.', quantity: 10, price: 182.52, amount: 1825.20, status: 'Completed', fee: 1.00 },
    { id: '2', date: '2026-01-26', type: 'Sell', symbol: 'TSLA', name: 'Tesla', quantity: 5, price: 248.34, amount: 1241.70, status: 'Completed', fee: 1.00 },
    { id: '3', date: '2026-01-25', type: 'Buy', symbol: 'NVDA', name: 'NVIDIA', quantity: 2, price: 875.28, amount: 1750.56, status: 'Completed', fee: 1.00 },
    { id: '4', date: '2026-01-24', type: 'Deposit', symbol: '-', name: 'Cash Deposit', quantity: 0, price: 0, amount: 5000.00, status: 'Completed', fee: 0 },
    { id: '5', date: '2026-01-23', type: 'Buy', symbol: 'MSFT', name: 'Microsoft', quantity: 3, price: 378.91, amount: 1136.73, status: 'Pending', fee: 1.00 },
    { id: '6', date: '2026-01-22', type: 'Sell', symbol: 'BABA', name: 'Alibaba', quantity: 8, price: 78.45, amount: 627.60, status: 'Completed', fee: 1.00 },
    { id: '7', date: '2026-01-21', type: 'Withdrawal', symbol: '-', name: 'Cash Withdrawal', quantity: 0, price: 0, amount: 1000.00, status: 'Completed', fee: 0 },
    { id: '8', date: '2026-01-20', type: 'Buy', symbol: 'GOOGL', name: 'Alphabet', quantity: 1, price: 142.50, amount: 142.50, status: 'Failed', fee: 0 },
  ];

  columnDefs: ColDef[] = [
    { 
      field: 'date', 
      headerName: 'Date',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 120
    },
    { 
      field: 'type', 
      headerName: 'Type',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const colors: { [key: string]: string } = {
          'Buy': 'text-accent',
          'Sell': 'text-destructive',
          'Deposit': 'text-chart-3',
          'Withdrawal': 'text-chart-4'
        };
        return `<span class="${colors[params.value] || ''} font-medium">${params.value}</span>`;
      },
      width: 100
    },
    { 
      field: 'symbol', 
      headerName: 'Symbol',
      sortable: true,
      filter: true,
      width: 100
    },
    { 
      field: 'name', 
      headerName: 'Name',
      sortable: true,
      filter: true,
      flex: 1
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      cellRenderer: (params: any) => params.value || '-'
    },
    { 
      field: 'price', 
      headerName: 'Price',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: (params: any) => params.value ? `¥${params.value.toFixed(2)}` : '-',
      cellRenderer: (params: any) => params.value ? `¥${params.value.toFixed(2)}` : '-'
    },
    { 
      field: 'amount', 
      headerName: 'Amount',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      valueFormatter: (params: any) => `¥${params.value.toFixed(2)}`,
      cellRenderer: (params: any) => `<span class="font-semibold">¥${params.value.toFixed(2)}</span>`
    },
    { 
      field: 'fee', 
      headerName: 'Fee',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 80,
      valueFormatter: (params: any) => params.value ? `¥${params.value.toFixed(2)}` : '-'
    },
    { 
      field: 'status', 
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const colors: { [key: string]: string } = {
          'Completed': 'bg-accent/10 text-accent',
          'Pending': 'bg-chart-3/10 text-chart-3',
          'Failed': 'bg-destructive/10 text-destructive'
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
