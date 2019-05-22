import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; 
import { ProfileWizardComponent } from './page/profile-wizard.component';

const profileWizardRoutes: Routes = [
  {
    path: '',
    component: ProfileWizardComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(profileWizardRoutes)
  ],
  exports: [
    RouterModule,

  ]
})
export class ProfileWizardRoutingModule { }
