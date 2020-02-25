import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThemeComponent } from './theme.component';

const asRoutes: Routes = [{ path: '', component: ThemeComponent }];

@NgModule({
  imports: [
    RouterModule.forChild(asRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ThemeRoutingModule { }
