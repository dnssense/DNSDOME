import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CyteLoginComponent } from './page/cytelogin.component';


const cyteloginRoutes: Routes = [
  {
    path: '',
    component: CyteLoginComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(cyteloginRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CyteLoginRoutingModule {

}
