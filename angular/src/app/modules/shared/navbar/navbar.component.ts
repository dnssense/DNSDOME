import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';
import { ROUTES, ProfileRoutes } from '../sidebar/sidebar.component';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Notification, NotificationApiService, NotificationRequest } from 'src/app/core/services/notification-api.service';

const misc: any = {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0
};

const helpRoutes = [
    { appRoute: '/admin/dashboard', helpRoute: '' },
    { appRoute: '/admin/reports/monitor', helpRoute: 'monitor' },
    { appRoute: '/admin/reports/custom-reports', helpRoute: 'custom-reports' },
    { appRoute: '/admin/deployment/public-ip', helpRoute: 'deployment-1/public-ip' },
    { appRoute: '/admin/deployment/devices', helpRoute: 'deployment-1/devices' },
    { appRoute: '/admin/deployment/roaming-clients', helpRoute: 'deployment-1/roaming-clients' },
    { appRoute: '/admin/settings/profiles', helpRoute: 'guevenlik-profilleri' },
];

declare var $: any;
@Component({
    selector: 'app-navbar-cmp',
    templateUrl: 'navbar.component.html'
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
    ) {
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.host = this.config.host;

        this.helpRoute = `${this.host.docUrl}/${this.currentLanguage.toLocaleLowerCase()}`;
    }

    notifications: Notification[] = [];

    unReadedNotificationsCount = 0;

    ngOnInit() {
        this.listTitles = ROUTES.filter(listTitle => listTitle);

        this.getNotifications();

        const user = JSON.parse(localStorage.getItem('currentSession'));

        if (user) {
            this.currentUser = user.currentUser;
        }

        this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {

            const url = event.url;

            this.helpUrlChanged(url);

            const $layer = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
            }
        });
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

    helpUrlChanged(url: string, lang?: string) {
        const findedAppRoute = helpRoutes.find(x => x.appRoute === url);

        if (findedAppRoute) {
            this.helpRoute = `${this.host.docUrl}/${lang ? lang : this.currentLanguage.toLocaleLowerCase()}/${findedAppRoute.helpRoute}`;
        } else {
            this.helpRoute = `${this.host.docUrl}/${lang ? lang : this.currentLanguage.toLocaleLowerCase()}`;
        }
    }
}
