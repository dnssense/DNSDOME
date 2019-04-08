import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountConfirmComponent } from './page/accountconfirm.component';



const accountconfirmRoutes: Routes = [
  {
    path: '',
    component: AccountConfirmComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(accountconfirmRoutes)
  ],
  exports: [
    RouterModule,

  ]
})
export class AccountConfirmComponentRoutingModule { }
