import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';

import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';
import { ROUTES, ProfileRoutes } from '../sidebar/sidebar.component';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Notification, NotificationApiService, NotificationRequest } from 'src/app/core/services/notification-api.service';
import { RkMenuItem } from 'roksit-lib/lib/models/rk-menu.model';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { LOCAL_STORAGE_THEME_COLOR } from '../../theme/theme.component';

const misc: any = {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0
};

export interface HelpRoute {
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
    { appRoute: '/admin/deployment/devices', helpRouteEn: 'devices/dns-relay-nedir', helpRouteTr: 'devices/dns-relay-nedir', dnscyteRoute: 'deployment/devices' },
    { appRoute: '/admin/deployment/roaming-clients', helpRouteEn: 'roaming-client/roaming-client', helpRouteTr: 'roaming-client/genel-bakis', dnscyteRoute: 'deployment/roaming-clients' },
    { appRoute: '/admin/settings/profiles', helpRouteEn: 'kurulum/guvenlik-profilleri', helpRouteTr: 'kurulum/guevenlik-profilleri', dnscyteRoute: 'settings/profiles' },
    { appRoute: '/admin/settings/users', helpRouteEn: 'ayarlar/user-settings', helpRouteTr: 'ayarlar/kullanici-ayarlari', dnscyteRoute: 'settings/users' },
    { appRoute: '/admin/settings/scheduled-reports', helpRouteEn: 'ayarlar/saved-reports', helpRouteTr: 'ayarlar/saved-reports', dnscyteRoute: 'settings/scheduled-reports' },
    { appRoute: '/admin/settings/query-category', helpRouteEn: 'kurulum/query-category', helpRouteTr: 'ayarlar/query-category-araci', dnscyteRoute: 'settings/query-category' },
    { appRoute: '/admin/settings/change-domain-category', helpRouteEn: 'kurulum/request-changing-domain-category', helpRouteTr: 'ayarlar/request-changing-domain-category', dnscyteRoute: 'settings/change-domain-category' },
    { appRoute: '/admin/settings/theme-mode', helpRouteEn: 'kurulum/theme-mode', helpRouteTr: 'ayarlar/theme-mode', dnscyteRoute: 'settings/theme-mode' },
    { appRoute: '/admin/account-settings', helpRouteEn: '', helpRouteTr: '', dnscyteRoute: 'account-settings' },
];

declare var $: any;
@Component({
    selector: 'app-navbar-cmp',
    templateUrl: 'navbar.component.html',
    styleUrls: ['navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    private listTitles: any[];
    location: Location;
    mobile_menu_visible: any = 0;
    private nativeElement: Node;
    private toggleButton: any;
    private sidebarVisible: boolean;
    private _router: Subscription;
    host: ConfigHost;
    private _;
    @ViewChild('app-navbar-cmp') button: any;

    title: string;
    subtitle?: string;

    currentUser: any;

    breadcrumb: string[] = [];

    helpRoute = 'https://docs.roksit.com/';

    constructor(
        location: Location,
        private element: ElementRef,
        private router: Router,
        private notification: NotificationService,
        private alert: AlertService,
        private auth: AuthenticationService,
        private config: ConfigService,
        private translator: TranslatorService,
        private notificationApiService: NotificationApiService,
        private activatedRoute: ActivatedRoute
    ) {
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.host = this.config.host;

        const theme = localStorage.getItem(LOCAL_STORAGE_THEME_COLOR);
        if (theme) {
            this.theme = theme;
        }

        this.helpUrlChanged(location.path(), this.currentLanguage.toLocaleLowerCase());
    }

    theme = 'white';

    notifications: Notification[] = [];

    unReadedNotificationsCount = 0;

    showSidebar = false;

    @ViewChild('sidebar') sidebar: RkModalModel;

    _menuItems: RkMenuItem[] = [
        { id: 0, path: '/admin/dashboard', text: 'Dashboard', icon: 'dashboard', selected: false },
        { id: 1, path: '/admin/reports/monitor', text: 'Monitor', icon: 'monitor', selected: false },
        { id: 2, path: '/admin/reports/custom-reports', text: 'Custom Reports', icon: 'custom-reports', selected: false, },
        {
            id: 3, path: '/admin/', text: 'Deployment', icon: 'dashboard', selected: false,
            subMenu: [
                { id: 3.1, path: 'deployment/public-ip', text: 'Public IP', icon: 'public-ip', selected: false },
                { id: 3.2, path: 'deployment/devices', text: 'Devices', icon: 'device', selected: false },
                { id: 3.3, path: 'deployment/roaming-clients', text: 'Roaming Clients', icon: 'roaming-clients', selected: false },
            ]
        },
        {
            id: 4, path: '/admin/', text: 'Settings', icon: 'settings', selected: false,
            subMenu: [
                { id: 4.1, path: 'settings/users', text: 'User', icon: 'user', selected: false },
               /*  { id: 4.2, path: 'settings/scheduled-reports', text: 'Saved Reports', icon: 'saved-reports', selected: false }, */
                { id: 4.3, path: 'settings/profiles', text: 'Security Profiles', icon: 'security-profiles', selected: false },
                { id: 4.4, path: 'settings/query-category', text: 'Query Category', icon: 'tools', selected: false },
                { id: 4.5, path: 'settings/change-domain-category', text: 'Request Changing Domain Category', icon: 'request-category', selected: false },
                { id: 4.6, path: 'settings/theme-mode', text: 'Theme Mode', icon: 'theme-mode', selected: false },
            ]
        }
    ];

    ngOnInit() {
        this.listTitles = ROUTES.filter(listTitle => listTitle);

        this.getNotifications();

        const user = JSON.parse(localStorage.getItem('currentSession'));

        if (user) {
            this.currentUser = user.currentUser;
        }

        this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {

            const url = event.url;

            this.helpUrlChanged(url, this.currentLanguage.toLocaleLowerCase());

            const $layer = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
            }
        });
    }

    getBaseHelpPage(lang?: string) {
        let url = this.host.docUrl + '/';

        if (!this.host.title.toLocaleLowerCase().includes('dnscyte')) {
            if (lang === 'tr') {
                url = this.host.docUrl + '/';
            }

            if (lang === 'en') {
                url = this.host.docUrl + '/v/' + this.currentLanguage.toLocaleLowerCase() + '/';
            }
        }

        return url;
    }

    getNotifications() {
        this.notificationApiService.getNotifications(new NotificationRequest()).subscribe(result => {
            this.notifications = result;

            this.unReadedNotificationsCount = this.notifications.filter(x => x.status === 0).length;
        });
    }

    setAsRead(notification: Notification) {
        if (notification.status === 0) {
            notification.status = 1;

            this.notificationApiService.updateNotification(notification).subscribe(result => { });
        }
    }

    get getTitle() {
        let title: string = this.location.prepareExternalUrl(this.location.path()).substring(7);

        const questionIndex = title.indexOf('?');

        if (questionIndex > -1) {
            title = title.substring(0, questionIndex);
        }

        this.breadcrumb = title.substring(1).trim().split('/').map(x => this.getCleanText(x));

        return title.split('/').map(x => this.getCleanText(x));
    }

    getCleanText(t: string) {
        return t
            .replace('-', ' ')
            .replace('/', ' ');
    }

    getPath() {
        const path = this.location.prepareExternalUrl(this.location.path());

        return path;
    }

    logout() {
        this.alert.alertWarningAndCancel(
            this.translator.translate('AreYouSure'),
            this.translator.translate('LOGOUT.LogoutMessage')
        ).subscribe(
            res => {
                if (res) {
                    this.alert.alertAutoClose(
                        this.translator.translate('LOGOUT.LoggingOut'),
                        this.translator.translate('LOGOUT.LoggingOutMessage'), 1000);
                    this.auth.logout();
                }
            }
        );
    }

    get currentLanguage() {
        return this.config.getTranslationLanguage().toUpperCase();
    }

    setLanguage(lang: string) {
        this.config.setDefaultLanguage(lang);
        this.notification.success(this.translator.translate('LanguageChanged'));

        this.helpUrlChanged(this.router.url, lang);
    }

    helpUrlChanged(url: string, lang: string) {
        const findedAppRoute = helpRoutes.find(x => x.appRoute === url);

        if (findedAppRoute) {
            this.helpRoute = this.getBaseHelpPage(lang);

            if (!this.host.title.toLocaleLowerCase().includes('dnscyte')) {
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

    setActive(menuItem: RkMenuItem, subMenuItem?: RkMenuItem, existsSubMenu = false) {
        this._menuItems.forEach(elem => elem.selected = false);

        menuItem.selected = true;

        this._menuItems.forEach(elem => {
            if (elem.subMenu) {
                elem.subMenu.forEach(subMenuElem => subMenuElem.selected = false);
            }
        });

        if (!existsSubMenu) {
            this.sidebar.toggle();
        }

        if (subMenuItem) {
            subMenuItem.selected = true;

            this.sidebar.toggle();
        }
    }
}
