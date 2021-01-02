import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiKeysComponent } from './page/apikeys.component';

const asRoutes: Routes = [
  {
    path: '',
    component: ApiKeysComponent
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
export class ApiKeysRoutingModule { }
