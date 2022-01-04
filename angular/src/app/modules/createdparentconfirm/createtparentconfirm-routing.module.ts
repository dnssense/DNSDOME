import {RouterModule, Routes} from '@angular/router';
import {CreatetparentconfirmComponent} from './page/createtparentconfirm/createtparentconfirm.component';
import {NgModule} from '@angular/core';

const createtparentconfirmRoutes: Routes = [
  {
    path: '',
    component: CreatetparentconfirmComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(createtparentconfirmRoutes)
  ],
  exports: [
    RouterModule,
  ]
})
export class CreatetparentconfirmRoutingModule { }
