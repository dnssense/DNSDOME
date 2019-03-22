import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RealTimeComponent } from './page/realtime.component';

const asRoutes: Routes = [
  {
    path: '',
    component: RealTimeComponent
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
export class RealTimeRoutingModule { }
