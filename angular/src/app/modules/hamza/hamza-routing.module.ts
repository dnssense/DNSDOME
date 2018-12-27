import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HamzaComponent } from './page/hamza.component';



 

 
const hamzaRoutes: Routes = [
  {
    path: '',
    component:HamzaComponent
    
    
  }
  
  
];
 
@NgModule({
  imports: [
    RouterModule.forChild(hamzaRoutes)
  ],
  exports: [
    RouterModule,
    
  ]
})
export class HamzaRoutingModule { }