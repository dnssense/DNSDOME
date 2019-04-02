import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { User } from 'src/app/core/models/User';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { Router } from '@angular/router';

declare const $: any;

//Metadata
export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
  role?: string;
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

export const ProfileRoutes: RouteInfo[] = [
  {
    path: '/admin/accountsettings',
    title: 'Account Settings',
    type: 'link',
    icontype: 'settings',
    role: 'ROLE_CUSTOMER'
  }
];

//Menu Items
export const ROUTES: RouteInfo[] = [
  {
    path: '/admin/dashboard',
    title: 'Dashboard',
    type: 'link',
    icontype: 'dashboard',
    role: 'ROLE_CUSTOMER'
  },
  {
    path: '/admin/reports/monitor',
    title: ' Monitor',
    type: 'link',
    icontype: 'av_timer',
    role: 'ROLE_CUSTOMER'
  },
  {
    path: '/admin/reports/customreport',
    title: 'Custom Reports',
    type: 'link',
    icontype: 'timeline',
    role: 'ROLE_CUSTOMER'
  },
  {
    path: '/admin',
    title: 'Network',
    type: 'sub',
    icontype: 'wifi_tethering',
    role: 'ROLE_CUSTOMER',
    collapse: 'network',
    children: [
      { path: 'publicip', title: 'Public IP', ab: 'PI' },
      { path: 'devices', title: 'Local Devices', ab: 'LD' },
      { path: 'roaming', title: 'Roaming Clients', ab: 'RC' }
    ]
  },
  {
    path: '/admin',
    title: 'Settings',
    type: 'sub',
    icontype: 'settings',
    role: 'ROLE_CUSTOMER',
    collapse: 'settings',
    children: [
      { path: 'users', title: 'Users', ab: 'U' },
      { path: 'scheduledreports', title: 'Scheduled Reports', ab: 'SP' },
      { path: 'profiles', title: 'Security Profiles', ab: 'EP' }
    ]
  },
  {
    path: '/admin/help',
    title: 'Help',
    type: 'link',
    icontype: 'live_help',
    role: 'ROLE_CUSTOMER'
  }
];

@Component({
  selector: 'app-sidebar-cmp',
  templateUrl: 'sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public profileMenuItems: any[];
  currentUser: User;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private translator: TranslatorService,
    private alert: AlertService
  ) {
    this.getUserName();
  }

  getUserName() {
    if (this.authService.currentSession) {
      this.currentUser = this.authService.currentSession.currentUser;
    }
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
  ngOnInit() {
    this.menuItems = new Array();
    //todo burada bir sıkıntı var
    let roleName: string = this.authService.currentSession.currentUser.roles
      .name;
    if (roleName) {
      this.menuItems = ROUTES.filter(
        menuItem =>
          menuItem.role == null ||
          (menuItem.role != null && roleName == menuItem.role)
      );
    }

    this.profileMenuItems = ProfileRoutes;
  }

  logout() {
    this.alert
      .alertWarningAndCancel(
        this.translator.translate('AreYouSure'),
        this.translator.translate('LOGOUT.LogoutMessage')
      )
      .subscribe(res => {
        if (res) {
          this.alert.alertAutoClose(
            this.translator.translate('LOGOUT.LoggingOut'),
            this.translator.translate('LOGOUT.LoggingOutMessage'),
            1000
          );
          this.authService.logout();
        }
      });
  }

  updatePS(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>(
        document.querySelector('.sidebar .sidebar-wrapper')
      );
      let ps = new PerfectScrollbar(elemSidebar, {
        wheelSpeed: 2,
        suppressScrollX: true
      });
    }
  }

  isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
      navigator.platform.toUpperCase().indexOf('IPAD') >= 0
    ) {
      bool = true;
    }
    return bool;
  }
}
