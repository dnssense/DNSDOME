import {Component, Injector, OnDestroy, OnInit, ViewChild, inject} from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

import {Subject} from 'rxjs';
import { Location, PopStateEvent } from '@angular/common';


import PerfectScrollbar from 'perfect-scrollbar';
import { NavItem } from 'src/app/modules/shared/md/md.module';
import { RkLayoutService, RkSidebarComponent, RkNavbarComponent, RkAlertService, HelpSupportComponent, CommonDialogCustomConfig, NestedDialogCustomConfig, HelpSupportService } from 'roksit-lib';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { MatDialog } from '@angular/material/dialog';
import { HelpSupportServiceImpl } from 'src/app/core/services/help-support.service';
interface HelpRoute {
    appRoute: string;
    helpRouteEn: string;
    helpRouteTr: string;
    dnscyteRoute: string;
}

const helpRoutes: HelpRoute[] = [
    { appRoute: '/admin/dashboard', helpRouteEn: 'dashboard/overview', helpRouteTr: 'dashboard/genel-bakis', dnscyteRoute: 'dashboard' },
    { appRoute: '/admin/reports/monitor', helpRouteEn: 'monitor/overview', helpRouteTr: 'monitoer/genel-bakis', dnscyteRoute: 'monitor' },
    { appRoute: '/admin/reports/custom-reports', helpRouteEn: 'custom-report/overview', helpRouteTr: 'oezellestirilmis-raporlar-custom-report/genel-bakis', dnscyteRoute: 'reports' },
    { appRoute: '/admin/deployment/public-ip', helpRouteEn: 'kurulum/public-ip', helpRouteTr: 'kurulum/gercek-public-ip', dnscyteRoute: 'deployment/public-ip' },
    { appRoute: '/admin/deployment/dns-relay', helpRouteEn: 'devices/dns-relay-nedir', helpRouteTr: 'devices/dns-relay-nedir', dnscyteRoute: 'deployment/dns-relay' },
    { appRoute: '/admin/deployment/roaming-clients', helpRouteEn: 'roaming-client/roaming-client', helpRouteTr: 'roaming-client/genel-bakis', dnscyteRoute: 'deployment/roaming-clients' },
    { appRoute: '/admin/settings/profiles', helpRouteEn: 'kurulum/guvenlik-profilleri', helpRouteTr: 'kurulum/guevenlik-profilleri', dnscyteRoute: 'settings/profiles' },
    { appRoute: '/admin/settings/users', helpRouteEn: 'ayarlar/user-settings', helpRouteTr: 'ayarlar/kullanici-ayarlari', dnscyteRoute: 'settings/users' },
    { appRoute: '/admin/settings/apikeys', helpRouteEn: 'ayarlar/user-settings', helpRouteTr: 'ayarlar/kullanici-ayarlari', dnscyteRoute: 'settings/users' },
    { appRoute: '/admin/settings/scheduled-reports', helpRouteEn: 'ayarlar/saved-reports', helpRouteTr: 'ayarlar/saved-reports', dnscyteRoute: 'settings/scheduled-reports' },
    { appRoute: '/admin/settings/common-bwlist', helpRouteEn: 'ayarlar/common-bwlist', helpRouteTr: 'ayarlar/common-bwlist', dnscyteRoute: 'settings/common-bwlist' },
    { appRoute: '/admin/settings/query-category', helpRouteEn: 'kurulum/query-category', helpRouteTr: 'ayarlar/query-category-araci', dnscyteRoute: 'settings/query-category' },
    { appRoute: '/admin/settings/change-domain-category', helpRouteEn: 'kurulum/request-changing-domain-category', helpRouteTr: 'ayarlar/request-changing-domain-category', dnscyteRoute: 'settings/change-domain-category' },
    { appRoute: '/admin/settings/theme-mode', helpRouteEn: 'kurulum/theme-mode', helpRouteTr: 'ayarlar/theme-mode', dnscyteRoute: 'settings/theme-mode' },
    { appRoute: '/admin/account-settings', helpRouteEn: '', helpRouteTr: '', dnscyteRoute: 'account-settings' },
];

@Component({
    selector: 'app-adminlayout',
    templateUrl: './adminlayout.component.html',
    styleUrls: ['./adminlayout.component.sass'],
    providers: [
      {provide: HelpSupportService, useClass: HelpSupportServiceImpl},
]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

    public navItems: NavItem[];
    private lastPoppedUrl: string;
    private yScrollStack: number[] = [];
    dialog = inject(MatDialog);
    url: string;
    location: Location;

    @ViewChild(RkSidebarComponent, {static: true}) sidebar: RkSidebarComponent;
    @ViewChild(RkNavbarComponent) navbar: RkNavbarComponent;
    host: ConfigHost;
    collapsed = true;
    hiddenMenus: string[];
    masterDV: string;
    public menuItems: any[];

    _menuItems = ConfigService.menuItems;
    helpRoute = 'https://www.dnssense.com/support';
    private ngUnsubscribe: Subject<any> = new Subject<any>();

    constructor(
        private router: Router,
        location: Location,
        private alert: RkAlertService,
        private authService: AuthenticationService,
        private rkLayoutService: RkLayoutService,
        public configService: ConfigService,
       private _translateService: TranslateService,
       private translator: TranslatorService,
       private injector: Injector
     ) {
        this.location = location;
        this.host = this.configService.host;
        this.helpRoute = this.host.onlineHelpUrl;
        this._menuItems.forEach(i => {
            if(i.path === 'logout'){
                i.customClick = this.logout;
            } else if(i.path === 'help'){
                i.customClick = this.openHelp;
            }
        })

        this.menuItems = [];
    }

    ngOnInit() {
        this.location.subscribe((ev: PopStateEvent) => {
            this.lastPoppedUrl = ev.url;
        });
        this.router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: any) => {
            this.setActiveMenuItemByRoute();

            if (event instanceof NavigationStart) {
                if (event.url !== this.lastPoppedUrl) {
                    this.yScrollStack.push(window.scrollY);
                }
            } else if (event instanceof NavigationEnd) {

              this.helpUrlChanged(event.url, this.currentLanguage.toLocaleLowerCase());
              if (event.url === this.lastPoppedUrl) {
                    this.lastPoppedUrl = undefined;
                    window.scrollTo(0, this.yScrollStack.pop());
                } else {
                    window.scrollTo(0, 0);
                }
            }
        });

        this.navItems = [];
        // translation reload when language changes.
        this._translateService.onLangChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          const currentUrl = this.router.url;
          this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
            this.router.navigate([currentUrl]);
          });
        });
        this.refreshMenus();

        this.authService.currentUserPropertiesChanged.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.refreshMenus();
        });
        if (this._translateService.store.translations[this._translateService.currentLang]) {
          this.translateMenu();
        }
        /*
        this._translateService.onLangChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.translateMenu();
          this.refreshMenus();
        });*/
    
        this.setActiveMenuItemByRoute();
    }

    get currentLanguage() {
        return this.configService.getTranslationLanguage().toUpperCase();
    }

    private refreshMenus() {
        if (this.authService.currentSession && this.authService.currentSession.currentUser
          && this.authService.currentSession.currentUser.role && this.authService.currentSession.currentUser.role.length > 0) {
            this._menuItems = ConfigService.menuItems;
    
          this.menuItems = this._menuItems.filter(x => !x.roles || this.checkExistRole(x.roles));
          for (const menu of this.menuItems) {
    
            if (menu.subMenu)
              menu.subMenu = menu.subMenu.filter(y => !y.roles || this.checkExistRole(y.roles));
          }
    
        }
    }
    translateMenu() {
        ConfigService.menuItems.forEach(elem => {
          elem.translateText = this.translator.translate(elem.text);
          if (elem.subMenu) {
            elem.subMenu.forEach(subMenuElem => subMenuElem.translateText = this.translator.translate(subMenuElem.text));
          }
        });
    }
    setCollapsed(collapsed: boolean) {
        this.collapsed = collapsed;
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

    toggleCollapse() {
        this.rkLayoutService.setSidebarCollapse(!this.collapsed);
    }

    public isMap() {
        if (this.location.prepareExternalUrl(this.location.path()) === '/maps/fullscreen') {
            return true;
        } else {
            return false;
        }
    }


    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  logout = () => {
        this.authService.logout();
  }
  openHelp = () => {
        //window.open(this.helpRoute, "_blank");
        this.dialog.open(HelpSupportComponent, {data: {injector: this.injector}, ...NestedDialogCustomConfig, ...CommonDialogCustomConfig});

  }

  helpUrlChanged(url: string, lang: string) {
        const findedAppRoute = helpRoutes.find(x => x.appRoute === url);

        if (findedAppRoute) {
            this.helpRoute = this.getBaseHelpPage(lang);

            if (!this.host?.title?.toLocaleLowerCase()?.includes('dnscyte')) {
                if (lang.toLocaleLowerCase() === 'en') {
                    this.helpRoute += findedAppRoute.helpRouteEn;
                }

                if (lang.toLocaleLowerCase() === 'tr') {
                    this.helpRoute += findedAppRoute.helpRouteTr;
                }
            } else {
                this.helpRoute += findedAppRoute.dnscyteRoute;
            }
        } else {
            this.helpRoute = this.getBaseHelpPage(lang);
        }
    }

    getBaseHelpPage(lang?: string) {
        let url = this.host.docUrl + '/';

        if (!this.host?.title?.toLocaleLowerCase()?.includes('dnscyte')) {
            if (lang === 'tr') {
                url = this.host.docUrl + '/';
            }

            if (lang === 'en') {
                url = this.host.docUrl + '/v/' + this.currentLanguage.toLocaleLowerCase() + '/';
            }
        }

        return url;
    }
    private checkExistRole(arr: string[]): boolean {
        if (this.authService.currentSession && this.authService.currentSession.currentUser
          && this.authService.currentSession.currentUser.role && this.authService.currentSession.currentUser.role.length > 0) {
          const role = this.authService.currentSession.currentUser.role.find(s => arr?.includes(s.name));
          return role != null;
        }
        return false;
      }
    isCmerp() {
        return this.host.brand == "CMERP";
    }

    isDnssense() {
        return this.host.brand == 'DNSSense';
    }
}
