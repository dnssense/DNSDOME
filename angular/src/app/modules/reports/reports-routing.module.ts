import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditComponent } from './audit/audit.component';
import { CustomReportComponent } from './customreport/customreport.component';
import { MonitorComponent } from './monitor/monitor.component';
import {LicenceGuard} from '../../core/guards/LicenceGuard';
import {LicenceProductCode, LicenceTypeCode} from 'roksit-lib';

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
    canMatch: [LicenceGuard],
    data: {
      productTypeCode: LicenceProductCode.Eye,
      licenceTypeCode: LicenceTypeCode.Eye_DDR
    },
    loadComponent: () => import('./dns-tunnel/dns-tunnel.component')
  },
];

@NgModule({
  imports: [RouterModule.forChild(reportsRoutes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
