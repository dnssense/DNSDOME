import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RkLayoutService } from 'roksit-lib';
import { RkMenuItem } from 'roksit-lib/lib/models/rk-menu.model';
import { User } from 'src/app/core/models/User';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { TranslatorService } from 'src/app/core/services/translator.service';

declare const $: any;


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
    public configService: ConfigService,
    private rkLayout: RkLayoutService
  ) {
    this.host = this.configService.host;
    this.menuItems = new Array();

    this.getUserName();
  }

  @Input() collapsed: boolean;

  public menuItems: any[];
  //public profileMenuItems: any[];
  currentUser: User;
  host: ConfigHost;

  _menuItems = ConfigService.menuItems;

  setActive(menuItem: RkMenuItem, subMenuItem?: RkMenuItem, hasSub?: RkMenuItem) {

    // Butonları toggle yapmak için
    if (menuItem.subMenu !== undefined) {
      if (menuItem.selected == true) {
        this._menuItems.forEach(elem => elem.selected = false);
        menuItem.selected = false;
      } else {
        this._menuItems.forEach(elem => elem.selected = false);
        menuItem.selected = true;
      }
    } else {
      this._menuItems.forEach(elem => elem.selected = false);
      menuItem.selected = true;
    }

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
    const currentUser = this.authService.currentSession?.currentUser;
    window.dispatchEvent(new Event('resize'));

    localStorage.setItem(`menuCollapsed_for_user_${currentUser?.id}`, JSON.stringify(!this.collapsed));
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
      && this.authService.currentSession.currentUser.role && this.authService.currentSession.currentUser.role.name) {

      const roleName: string = this.authService.currentSession.currentUser.role.name;

      this.menuItems = this._menuItems.filter(x => !x.roles || x.roles.includes(roleName));
      for (const menu of this.menuItems) {

        if (menu.subMenu)
          menu.subMenu = menu.subMenu.filter(y => !y.roles || y.roles.includes(roleName));
      }

    }

    // this.profileMenuItems = ProfileRoutes;
  }

  ngOnInit() {
    /* if (this.host.brand == "CMERP") {
      const deployments = this._menuItems.find(x => x.id == 3);
      deployments.subMenu = deployments.subMenu?.slice(0, 1);
    } */
    const currentUser = this.authService.currentSession?.currentUser;

    const isCollapsed = JSON.parse(localStorage.getItem(`menuCollapsed_for_user_${currentUser?.id}`));

    if (isCollapsed) {
      this.rkLayout.setSidebarCollapse(true);
    } else {
      this.rkLayout.setSidebarCollapse(false);
    }

    this.refreshMenus();

    this.authService.currentUserPropertiesChanged.subscribe(data => {
      this.refreshMenus();
    });

    this.setActiveMenuItemByRoute();

    /*  this.menuItems = new Array();
     //todo burada bir sıkıntı var
     let roleName: string = this.authService.currentSession.currentUser.roles.name;
     if (roleName) {
       this.menuItems = ROUTES.filter(m =>m.role == null || m.role == '' || (m.role != null && roleName == m.role));
     } */



  }

  setActiveMenuItemByRoute() {
    this._menuItems.forEach(elem => {
      elem.selected = false;

      if (!elem.subMenu) {
        if (elem.path === this.router.url.split('?')[0]) {
          elem.selected = true;
        }
      } else {
        elem.subMenu.forEach(subElem => {
          subElem.selected = false;

          if (elem.path + subElem.path === this.router.url.split('?')[0]) {
            elem.selected = true;
            subElem.selected = true;
          }
        });
      }
    });
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
