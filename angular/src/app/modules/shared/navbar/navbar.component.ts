import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';
import { ROUTES, ProfileRoutes } from '../sidebar/sidebar.component';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ConfigService } from 'src/app/core/services/config.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Notification, NotificationApiService, NotificationRequest } from 'src/app/core/services/notification-api.service';

const misc: any = {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0
};

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

    @ViewChild('app-navbar-cmp') button: any;

    title: string;
    subtitle?: string;

    currentUser: any;

    constructor(
        location: Location,
        private element: ElementRef,
        private router: Router,
        private notification: NotificationService,
        private alert: AlertService,
        private auth: AuthenticationService,
        private config: ConfigService,
        private translator: TranslatorService,
        private notificationApiService: NotificationApiService
    ) {
        this.location = location;
        this.nativeElement = element.nativeElement;
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
        const title: string = this.location.prepareExternalUrl(this.location.path()).substring(7);

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

    currentLanguage() {
       return this.config.getTranslationLanguage().toUpperCase();
    }

    setLanguage(lang: string) {

        this.config.setDefaultLanguage(lang);
        this.notification.success(this.translator.translate('LanguageChanged'));
    }
}
