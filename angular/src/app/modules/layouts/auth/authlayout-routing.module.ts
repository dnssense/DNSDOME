import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthLayoutComponent} from './page/authlayout.component';

const authlayoutRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [{
      path: 'login',
      loadChildren: () => import('../../login/login.module').then(m => m.LoginModule)
    }, {
      path: 'cytelogin',
      loadChildren: () => import('../../cytelogin/cytelogin.module').then(m => m.CyteLoginModule)
    }, {
      path: 'register',
      loadChildren: () => import('../../register/register.module').then(m => m.RegisterModule)
    }, {
      path: 'forgot-password-confirm',
      loadChildren: () => import('../../forgotpasswordconfirm/forgotpasswordconfirm.module').then(m => m.ForgotPasswordConfirmModule)
    }, {
      path: 'account-confirm',
      loadChildren: () => import('../../accountconfirm/accountconfirm.module').then(m => m.AccountConfirmModule)
    }, {
      path: 'account-created-parent',
      loadChildren: () => import('../../createdparentconfirm/createtparentconfirm.module').then(m => m.CreatetparentconfirmModule)
    },
      {
        path: 'activate-licence',
        loadComponent: () => import('../../licence-activation/licence-activation.component')
      },
      {
      path: '',
      loadChildren: () => import('../../login/login.module').then(m => m.LoginModule)
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
export class AuthLayoutRoutingModule {
}
