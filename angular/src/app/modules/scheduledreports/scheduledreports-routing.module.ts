import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScheduledReportsComponent } from './page/scheduledreports.component';

const asRoutes: Routes = [
  {
    path: '',
    component: ScheduledReportsComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(asRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ScheduledReportsRoutingModule { }
