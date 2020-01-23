import { Component, OnInit, Input } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { User } from 'src/app/core/models/User';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { Router } from '@angular/router';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { RkLayoutService } from 'roksit-lib';
import { RkMenuItem } from 'roksit-lib/lib/models/rk-menu.model';

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
    role: 'ROLE_CUSTOMER,ROLE_USER'
  },
  {
    path: '/admin/reports/monitor',
    title: ' Monitor',
    type: 'link',
    icontype: 'av_timer',
    role: 'ROLE_CUSTOMER,ROLE_USER'
  },
  {
    path: '/admin/reports/customreport',
    title: 'Custom Reports',
    type: 'link',
    icontype: 'timeline',
    role: 'ROLE_CUSTOMER,ROLE_USER'
  },
  {
    path: '/admin',
    title: 'Deployment',
    type: 'sub',
    icontype: 'wifi_tethering',
    role: 'ROLE_CUSTOMER',
    collapse: 'network',
    children: [
      { path: 'publicip', title: 'Public IP', ab: 'PI' },
      { path: 'devices', title: 'Devices', ab: 'LD' },
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
      { path: 'scheduledreports', title: 'Saved Reports', ab: 'SP' },
      { path: 'profiles', title: 'Security Profiles', ab: 'SP' },
      { path: 'tools', title: 'Tools', ab: 'T' }
    ]
  },
  {
    path: '/admin/help',
    title: 'Help',
    type: 'link',
    icontype: 'live_help',
    role: null
  }
];

@Component({
  selector: 'app-sidebar-cmp',
  templateUrl: 'sidebar.component.html'
})
export class SidebarComponent implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private translator: TranslatorService,
    private alert: AlertService,
    private configService: ConfigService,
    private rkLayout: RkLayoutService
  ) {
    this.host = this.configService.host;
    this.menuItems = new Array();

    this.getUserName();
  }

  @Input() collapsed: boolean;

  public menuItems: any[];
  public profileMenuItems: any[];
  currentUser: User;
  host: ConfigHost;

  _menuItems: RkMenuItem[] = [
    { id: 0, path: '/admin/dashboard', text: 'Dashboard', icon: 'dashboard', selected: false },
    { id: 1, path: '/admin/reports/monitor', text: 'Monitor', icon: 'monitor', selected: false },
    { id: 2, path: '/admin/reports/customreport', text: 'Custom Reports', icon: 'custom-reports', selected: false },
    {
      id: 3, path: '/admin/', text: 'Deployment', icon: 'dashboard', selected: false,
      subMenu: [
        { id: 3.1, path: 'publicip', text: 'Public IP', icon: 'public-ip', selected: false },
        { id: 3.2, path: 'devices', text: 'Devices', icon: 'device', selected: false },
        { id: 3.3, path: 'roaming', text: 'Roaming Clients', icon: 'roaming-clients', selected: false },
      ]
    },
    {
      id: 4, path: '/admin/', text: 'Settings', icon: 'settings', selected: false,
      subMenu: [
        { id: 4.1, path: 'users', text: 'User', icon: 'user', selected: false },
        { id: 4.2, path: 'scheduledreports', text: 'Saved Reports', icon: 'saved-reports', selected: false },
        { id: 4.3, path: 'profiles', text: 'Security Profiles', icon: 'security-profiles', selected: false },
        { id: 4.4, path: 'tools', text: 'Tools', icon: 'tools', selected: false },
        { id: 4.5, path: '', text: 'Request Changing Domain Category', icon: 'request-category', selected: false },
        { id: 4.6, path: '', text: 'Theme Mode', icon: 'theme-mode', selected: false },
      ]
    },
    { id: 5, path: '/admin/help', text: 'Help', icon: 'help', selected: false }
  ];

  setActive(menuItem: RkMenuItem, subMenuItem?: RkMenuItem) {
    this._menuItems.forEach(elem => elem.selected = false);

    menuItem.selected = true;

    this._menuItems.forEach(elem => {
      if (elem.subMenu) {
        elem.subMenu.forEach(subMenuElem => subMenuElem.selected = false);
      }
    });

    if (subMenuItem) {
      subMenuItem.selected = true;
    }
  }

  toggleCollapse() {
    this.rkLayout.setSidebarCollapse(!this.collapsed);
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
  private refreshMenus() {
    if (this.authService.currentSession && this.authService.currentSession.currentUser
      && this.authService.currentSession.currentUser.roles && this.authService.currentSession.currentUser.roles.name) {

      let roleName: string = this.authService.currentSession.currentUser.roles.name;

      this.menuItems = ROUTES.filter(
        menuItem => menuItem.role == null || (menuItem.role != null && menuItem.role.split(',').includes(roleName))
      );
    }

    this.profileMenuItems = ProfileRoutes;
  }
  ngOnInit() {

    this.refreshMenus();
    this.authService.currentUserPropertiesChanged.subscribe(data => {

      this.refreshMenus();

    })


    /*  this.menuItems = new Array();
     //todo burada bir sıkıntı var
     let roleName: string = this.authService.currentSession.currentUser.roles.name;
     if (roleName) {
       this.menuItems = ROUTES.filter(m =>m.role == null || m.role == '' || (m.role != null && roleName == m.role));
     } */


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