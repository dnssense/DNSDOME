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

    @ViewChild('app-navbar-cmp', { static: false }) button: any;

    constructor(
        location: Location,
        private element: ElementRef,
        private router: Router,
        private notification: NotificationService,
        private alert: AlertService,
        private auth: AuthenticationService,
        private config: ConfigService,
        private translator: TranslatorService
    ) {
        this.location = location;
        this.nativeElement = element.nativeElement;
    }

    ngOnInit() {
        this.listTitles = ROUTES.filter(listTitle => listTitle);

        this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {

            const $layer = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
            }
        });
    }

    getTitle() {
        let titlee: string = this.location.prepareExternalUrl(this.location.path());
        titlee = titlee.substring(1);
        for (let i = 0; i < this.listTitles.length; i++) {
            if (this.listTitles[i].type === "link" && this.listTitles[i].path === titlee) {
                return this.listTitles[i].title;
            } else if (this.listTitles[i].type === "sub") {
                for (let j = 0; j < this.listTitles[i].children.length; j++) {
                    let subtitle = this.listTitles[i].path + '/' + this.listTitles[i].children[j].path;
                    if (subtitle === titlee) {
                        return this.listTitles[i].children[j].title;
                    }
                }
            }
        }
        return 'Dashboard';
    }

    getPath() {
        return this.location.prepareExternalUrl(this.location.path());
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

    language(lang: string) {
        this.config.setTranslationLanguage(lang);
        this.notification.success(this.translator.translate('LanguageChanged'));
    }
}
