import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/AuthGuard';
import { RoleGuard } from 'src/app/core/guards/RoleGuard';
import { AdminLayoutComponent } from './page/adminlayout.component';

const adminlayoutRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: () => import('../../dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'reports',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: () => import('../../reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'deployment/dns-relay',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: () => import('../../devices/devices.module').then(m => m.DevicesModule)
      },
      {
        path: 'deployment/public-ip',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: () => import('../../publicip/publicip.module').then(m => m.PublicipModule)
      },
      {
        path: 'settings/profiles',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: () => import('../../securityprofiles/securityprofiles.module').then(m => m.SecurityProfilesModule)
      },
      {
        path: 'account-settings',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: () => import('../../accountsettings/accountsettings.module').then(m => m.AccountSettingsModule)
      },
      {
        path: 'settings/scheduled-reports',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren:
          () => import('../../scheduledreports/scheduledreports.module').then(m => m.ScheduledReportsModule)
      },
      {
        path: 'settings/users',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: () => import('../../users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'settings/apikeys',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: () => import('../../apikeys/apikeys.module').then(m => m.ApiKeysModule)
      },
      {
        path: 'deployment/roaming-clients',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER'
        },
        loadChildren: () => import('../../roaming/roaming.module').then(m => m.RoamingModule)
      },
      {
        path: 'settings/query-category',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: () => import('../../tools/tools.module').then(m => m.ToolsModule)
      },
      {
        path: 'settings/common-bwlist',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: () => import('../../commonbwlistprofile/commonbwlistprofile.module').then(m => m.CommonBWListProfileModule)
      },
      {
        path: 'settings/theme-mode',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: () => import('../../theme/theme.module').then(m => m.ThemeModule)
      },
      {
        path: 'anomaly-detection',
        canActivate: [RoleGuard],
        data: {
          expectedRole: 'ROLE_CUSTOMER,ROLE_USER'
        },
        loadChildren: () => import('../../anomaly-detection/anomaly-detection.module').then(m => m.AnomalyDetectionModule)
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
