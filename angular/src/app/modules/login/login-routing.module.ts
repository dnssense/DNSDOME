import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './page/login.component';
 

 
const loginRoutes: Routes = [
  { path: 'login',  component: LoginComponent,pathMatch:'full' },
  { path:'',component:LoginComponent,pathMatch:'full'}
  
];
 
@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class LoginRoutingModule { }