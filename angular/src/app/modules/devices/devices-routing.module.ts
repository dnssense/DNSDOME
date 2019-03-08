import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevicesComponent } from './page/devices.component';

const devicesRoutes: Routes = [
  {
    path: '',
    component: DevicesComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(devicesRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class DevicesRoutingModule { }
