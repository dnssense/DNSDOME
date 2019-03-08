import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityProfilesComponent } from './page/securityprofiles.component';

const spRoutes: Routes = [
  {
    path: '',
    component: SecurityProfilesComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(spRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class SecurityProfilesRoutingModule { }
