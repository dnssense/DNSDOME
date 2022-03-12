import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './page/dashboard.component';
import {Dashboardv2Component} from "./page/dashboardv2.component";
import {AgentsComponent} from "./page/childpages/agents.component";

const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent ,
  },
  {
    path: 'v2',
    component: Dashboardv2Component
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
