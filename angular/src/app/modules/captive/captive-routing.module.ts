import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaptiveComponent } from './page/captive.component';

const captiveRoutes: Routes = [
  {
    path: '',
    component: CaptiveComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(captiveRoutes)
  ],
  exports: [
    RouterModule,
  ]
})
export class CaptiveRoutingModule { }
