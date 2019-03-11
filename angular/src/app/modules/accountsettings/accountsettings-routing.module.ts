import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSettingsComponent } from './page/accountsettings.component';

const asRoutes: Routes = [
  {
    path: '',
    component: AccountSettingsComponent
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
export class AccountSettingsRoutingModule { }
