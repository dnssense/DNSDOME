import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RkAlertService, RkLayoutService } from 'roksit-lib';
import { RkMenuItem } from 'roksit-lib/lib/models/rk-menu.model';
import { User } from 'src/app/core/models/User';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import {takeUntil} from 'rxjs/operators';
import { Subject } from 'rxjs';


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
    private _translateService: TranslateService,
    private alert: RkAlertService,
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
  private ngUnsubscribe: Subject<any> = new Subject<any>();



  toggleCollapse(event) {
    this.collapsed = event.collapsed;
    this.rkLayout.setSidebarCollapse(this.collapsed);
    const currentUser = this.authService.currentSession?.currentUser;
    window.dispatchEvent(new Event('resize'));

    localStorage.setItem(`menuCollapsed_for_user_${currentUser?.id}`, JSON.stringify(this.collapsed));
  }

  getUserName() {
    if (this.authService.currentSession) {
      this.currentUser = this.authService.currentSession.currentUser;
    }
  }

  private refreshMenus() {
    if (this.authService.currentSession && this.authService.currentSession.currentUser
      && this.authService.currentSession.currentUser.role && this.authService.currentSession.currentUser.role.length > 0) {
        this._menuItems = ConfigService.menuItems;
      //const roleName: string = this.authService.currentSession.currentUser.role.name;

      this.menuItems = this._menuItems.filter(x => !x.roles || this.checkExistRole(x.roles));
      for (const menu of this.menuItems) {

        if (menu.subMenu)
          menu.subMenu = menu.subMenu.filter(y => !y.roles || this.checkExistRole(y.roles));
      }

    }

    // this.profileMenuItems = ProfileRoutes;
  }

  private checkExistRole(arr: string[]): boolean {
    if (this.authService.currentSession && this.authService.currentSession.currentUser
      && this.authService.currentSession.currentUser.role && this.authService.currentSession.currentUser.role.length > 0) {
      let role = this.authService.currentSession.currentUser.role.find(s=>arr.includes(s.name));
      return role != null
    }
    return false
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

    this._translateService.onLangChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      this.configService.translateMenu();
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
}
