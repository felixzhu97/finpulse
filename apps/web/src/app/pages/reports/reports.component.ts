import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi, themeQuartz } from 'ag-grid-community';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';

interface Report {
  id: string;
  title: string;
  type: 'Performance' | 'Risk' | 'Tax' | 'Compliance' | 'Custom';
  generatedDate: string;
  period: string;
  status: 'Ready' | 'Generating' | 'Failed';
  fileSize: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

const fintechDarkGridTheme = themeQuartz.withParams({
  backgroundColor: '#101827',
  foregroundColor: '#ffffff',
  browserColorScheme: 'dark'
});

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, AgGridAngular, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  template: `
    <app-card className="bg-card border-border glass">
      <app-card-header className="pb-4">
        <app-card-title className="text-2xl font-semibold">Reports</app-card-title>
        <p class="text-sm text-muted-foreground mt-1">Generate and download financial reports</p>
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
export class ReportsComponent {
  private gridApi!: GridApi;
  gridTheme = fintechDarkGridTheme;

  rowData: Report[] = [
    { id: '1', title: 'Q4 2025 Performance Report', type: 'Performance', generatedDate: '2026-01-15', period: 'Q4 2025', status: 'Ready', fileSize: '2.4 MB', format: 'PDF' },
    { id: '2', title: 'Annual Risk Assessment', type: 'Risk', generatedDate: '2026-01-10', period: '2025', status: 'Ready', fileSize: '1.8 MB', format: 'PDF' },
    { id: '3', title: 'Tax Report 2025', type: 'Tax', generatedDate: '2026-01-05', period: '2025', status: 'Ready', fileSize: '3.2 MB', format: 'Excel' },
    { id: '4', title: 'Monthly Compliance Report', type: 'Compliance', generatedDate: '2026-01-27', period: 'January 2026', status: 'Generating', fileSize: '-', format: 'PDF' },
    { id: '5', title: 'Portfolio Analysis Q4', type: 'Custom', generatedDate: '2026-01-20', period: 'Q4 2025', status: 'Ready', fileSize: '4.1 MB', format: 'PDF' },
    { id: '6', title: 'Transaction History Export', type: 'Custom', generatedDate: '2026-01-18', period: '2025', status: 'Ready', fileSize: '856 KB', format: 'CSV' },
    { id: '7', title: 'Risk Metrics Dashboard', type: 'Risk', generatedDate: '2026-01-12', period: 'Q4 2025', status: 'Ready', fileSize: '1.2 MB', format: 'PDF' },
    { id: '8', title: 'Client Portfolio Summary', type: 'Performance', generatedDate: '2026-01-25', period: 'January 2026', status: 'Failed', fileSize: '-', format: 'PDF' },
  ];

  columnDefs: ColDef[] = [
    { 
      field: 'title', 
      headerName: 'Report Title',
      sortable: true,
      filter: true,
      flex: 2,
      pinned: 'left'
    },
    { 
      field: 'type', 
      headerName: 'Type',
      sortable: true,
      filter: true,
      width: 130,
      cellRenderer: (params: any) => {
        const colors: { [key: string]: string } = {
          'Performance': 'bg-primary/10 text-primary',
          'Risk': 'bg-destructive/10 text-destructive',
          'Tax': 'bg-chart-3/10 text-chart-3',
          'Compliance': 'bg-accent/10 text-accent',
          'Custom': 'bg-muted/10 text-muted-foreground'
        };
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colors[params.value] || ''}">${params.value}</span>`;
      }
    },
    { 
      field: 'period', 
      headerName: 'Period',
      sortable: true,
      filter: true,
      width: 150
    },
    { 
      field: 'generatedDate', 
      headerName: 'Generated Date',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 150
    },
    { 
      field: 'format', 
      headerName: 'Format',
      sortable: true,
      filter: true,
      width: 100
    },
    { 
      field: 'fileSize', 
      headerName: 'File Size',
      sortable: true,
      filter: true,
      width: 100
    },
    { 
      field: 'status', 
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 130,
      cellRenderer: (params: any) => {
        const colors: { [key: string]: string } = {
          'Ready': 'bg-accent/10 text-accent',
          'Generating': 'bg-chart-3/10 text-chart-3',
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
