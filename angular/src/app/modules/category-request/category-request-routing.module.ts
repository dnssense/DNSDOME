import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryRequestComponent } from './category-request.component';

const asRoutes: Routes = [{ path: '', component: CategoryRequestComponent }];

@NgModule({
  imports: [
    RouterModule.forChild(asRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CategoryRequestRoutingModule { }
