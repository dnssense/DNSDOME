import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './page/authlayout.component';




const authlayoutRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [{
      path: 'login',
      loadChildren: '../../login/login.module#LoginModule'
    },{
      path: 'cytelogin',
      loadChildren: '../../cytelogin/cytelogin.module#CyteLoginModule'
    }, {
      path: 'register',
      loadChildren: '../../register/register.module#RegisterModule'
    }, {
      path: 'forgot-password-confirm',
      loadChildren: '../../forgotpasswordconfirm/forgotpasswordconfirm.module#ForgotPasswordConfirmModule'
    },{
      path: 'account-confirm',
      loadChildren: '../../accountconfirm/accountconfirm.module#AccountConfirmModule'
    }, {
      path: '',
      loadChildren: '../../login/login.module#LoginModule'
    }

    ]
  }


];

@NgModule({
  imports: [
    RouterModule.forChild(authlayoutRoutes)
  ],
  exports: [
    RouterModule,

  ]
})
export class AuthLayoutRoutingModule { }