import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomReportComponent } from './customreport/customreport.component';
import { MonitorComponent } from './monitor/monitor.component';

const reportsRoutes: Routes = [
  {
    path: 'customreport',
    component: CustomReportComponent
  },
  {
    path: 'monitor',
    component: MonitorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(reportsRoutes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {}
