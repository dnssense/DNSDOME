import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoamingComponent } from './page/roaming.component';

const asRoutes: Routes = [
  {
    path: '',
    component: RoamingComponent
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
export class RoamingRoutingModule { }
