import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './page/dashboard.component';
import {Dashboardv2Component} from './page/dashboardv2.component';

const dashboardRoutes: Routes = [
  {
    path: '',
    component: Dashboardv2Component ,
  },
  {
    path: 'v1',
    component: DashboardComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(dashboardRoutes)
  ],
  exports: [
    RouterModule,
  ]
})
export class DashboardRoutingModule { }
