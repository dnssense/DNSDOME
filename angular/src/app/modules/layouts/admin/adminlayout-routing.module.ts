import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../../login/page/login.component';
import { AdminLayoutComponent } from './page/adminlayout.component';
import { AuthGuard } from 'src/app/core/guards/AuthGuard';




const adminlayoutRoutes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [{
      path: 'hamza',
      loadChildren: '../../hamza/hamza.module#HamzaModule'
    },{
      path: 'dashboard',
      loadChildren: '../../dashboard/dashboard.module#DashboardModule'
    },{
      path: 'reports',
      loadChildren: '../../reports/reports.module#ReportsModule'
    }]
    /*,{
     path:'',
     loadChildren: '../../login/login.module#LoginModule'
   }

   ]*/
  }


];

@NgModule({
  imports: [
    RouterModule.forChild(adminlayoutRoutes)
  ],
  exports: [
    RouterModule,

  ]
})
export class AdminLayoutRoutingModule { }
