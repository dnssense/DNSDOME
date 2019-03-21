import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent } from './page/help.component';

const asRoutes: Routes = [
  {
    path: '',
    component: HelpComponent
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
export class HelpRoutingModule { }
