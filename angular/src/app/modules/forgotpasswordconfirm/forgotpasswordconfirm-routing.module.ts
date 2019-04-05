import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordConfirmComponent } from './page/forgotpasswordconfirm.component';


const forgotpasswordconfirmRoutes: Routes = [
  {
    path: '',
    component: ForgotPasswordConfirmComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(forgotpasswordconfirmRoutes)
  ],
  exports: [
    RouterModule,

  ]
})
export class ForgotPasswordConfirmComponentRoutingModule { }
