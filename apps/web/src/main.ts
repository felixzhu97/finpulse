import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideCharts(withDefaultRegisterables())
  ]
}).catch(err => console.error(err));
