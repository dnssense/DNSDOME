import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonBWListProfileComponent } from './page/commonbwlistprofile.component';

const spRoutes: Routes = [
  {
    path: '',
    component: CommonBWListProfileComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(spRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CommonBWListProfileRoutingModule { }
