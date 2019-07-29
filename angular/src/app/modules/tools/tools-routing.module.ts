import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsComponent } from './page/tools.component'

const asRoutes: Routes = [{ path: '', component: ToolsComponent }];

@NgModule({
  imports: [
    RouterModule.forChild(asRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ToolsRoutingModule { }
