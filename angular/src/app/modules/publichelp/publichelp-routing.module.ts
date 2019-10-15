import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicHelpComponent } from './page/publichelp.component';


const phRoutes: Routes = [
  {
    path: '',
    component: PublicHelpComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(phRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class PublicHelpRoutingModule {

}
