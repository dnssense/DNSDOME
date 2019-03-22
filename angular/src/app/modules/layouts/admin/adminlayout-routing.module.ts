import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
    },{
      path: 'devices',
      loadChildren: '../../devices/devices.module#DevicesModule'
    },{
      path: 'publicip',
      loadChildren: '../../publicip/publicip.module#PublicipModule'
    },{
      path: 'profiles',
      loadChildren: '../../securityprofiles/securityprofiles.module#SecurityProfilesModule'
    },{
      path: 'accountsettings',
      loadChildren: '../../accountsettings/accountsettings.module#AccountSettingsModule'
    },{
      path: 'scheduledreports',
      loadChildren: '../../scheduledreports/scheduledreports.module#ScheduledReportsModule'
    },{
      path: 'users',
      loadChildren: '../../users/users.module#UsersModule'
    },{
      path: 'help',
      loadChildren: '../../help/help.module#HelpModule'
    },{
      path: 'realtime',
      loadChildren: '../../realtime/realtime.module#RealTimeModule'
    },{
      path: 'roaming',
      loadChildren: '../../roaming/roaming.module#RoamingModule'
    }]
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
