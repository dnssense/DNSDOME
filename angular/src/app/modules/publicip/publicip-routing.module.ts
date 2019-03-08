import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicipComponent } from './page/publicip.component';

const publicipRoutes: Routes = [
  {
    path: '',
    component: PublicipComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(publicipRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class PublicipRoutingModule { }
