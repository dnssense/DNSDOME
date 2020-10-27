import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/AuthGuard';
import { RoleGuard } from 'src/app/core/guards/RoleGuard';
import { AdminLayoutComponent } from './page/adminlayout.component';

const adminlayoutRoutes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: '../../dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'reports',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: '../../reports/reports.module#ReportsModule'
      },
      {
        path: 'deployment/devices',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: '../../devices/devices.module#DevicesModule'
      },
      {
        path: 'deployment/public-ip',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: '../../publicip/publicip.module#PublicipModule'
      },
      {
        path: 'settings/profiles',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: '../../securityprofiles/securityprofiles.module#SecurityProfilesModule'
      },
      {
        path: 'account-settings',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: '../../accountsettings/accountsettings.module#AccountSettingsModule'
      },
      {
        path: 'settings/scheduled-reports',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren:
          '../../scheduledreports/scheduledreports.module#ScheduledReportsModule'
      },
      {
        path: 'settings/users',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: '../../users/users.module#UsersModule'
      },
      {
        path: 'deployment/roaming-clients',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: '../../roaming/roaming.module#RoamingModule'
      },
      {
        path: 'settings/query-category',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: '../../tools/tools.module#ToolsModule'
      },
      {
        path: 'settings/change-domain-category',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: '../../category-request/category-request.module#CategoryRequestModule'
      },
      {
        path: 'settings/theme-mode',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: '../../theme/theme.module#ThemeModule'
      },
      {
        path: 'anomaly-detection',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: '../../anomaly-detection/anomaly-detection.module#AnomalyDetectionModule'
      },
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(adminlayoutRoutes)],
  exports: [RouterModule]
})
export class AdminLayoutRoutingModule { }
