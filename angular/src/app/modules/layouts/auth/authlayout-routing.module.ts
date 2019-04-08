import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../../login/page/login.component';
import { AuthLayoutComponent } from './page/authlayout.component';




const authlayoutRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [{
      path: 'login',
      loadChildren: '../../login/login.module#LoginModule'
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
      /* , {
          path: 'lock',
          component: LockComponent
      }, {
          path: 'register',
          component: RegisterComponent
      }, {
          path: 'pricing',
          component: PricingComponent
      }] */

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