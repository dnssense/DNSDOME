import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditComponent } from './audit/audit.component';
import { CustomReportComponent } from './customreport/customreport.component';
import { MonitorComponent } from './monitor/monitor.component';

const reportsRoutes: Routes = [
  {
    path: 'custom-reports',
    component: CustomReportComponent
  },
  {
    path: 'monitor',
    component: MonitorComponent
  },
  {
    path: 'audit',
    component: AuditComponent
  },
  {
    path: 'dns-tunnel',
    loadComponent: () => import('./dns-tunnel/dns-tunnel.component')
  },
];

@NgModule({
  imports: [RouterModule.forChild(reportsRoutes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
