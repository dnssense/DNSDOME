import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { Session } from 'src/app/core/models/Session';
import { LoggerService } from 'src/app/core/services/logger.service';
import { User } from 'src/app/core/models/User';
import { forEach } from '@angular/router/src/utils/collection';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Role } from 'src/app/core/models/Role';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { AlertService } from 'src/app/core/services/alert.service';

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

//Menu Items
export const ROUTES: RouteInfo[] = [
    // {
    //     path: '/admin/devices',
    //     title: 'Devices',
    //     type: 'link',
    //     icontype: 'select_all',
    //     role: 'ROLE_CUSTOMER'
    // },
    {
        path: '/admin/dashboard',
        title: 'Dashboard',
        type: 'link',
        icontype: 'dashboard',
        role: 'ROLE_CUSTOMER'
    }, {
        path: '/admin/reports',
        title: 'Reports',
        type: 'link',
        icontype: 'timeline',
        role: 'ROLE_CUSTOMER'
    },
    {
        path: '/admin',
        title: 'Security',
        type: 'sub',
        icontype: 'settings',
        role: 'ROLE_CUSTOMER',
        collapse: 'settings',
        children: [
            { path: 'publicIp', title: 'Public IP', ab: 'PI' },
            { path: 'boxes', title: 'Boxes', ab: 'B' },
            { path: 'devices', title: 'Hosts', ab: 'H' }
        ]
    }
    /*, {
        path: '/admin/hamza',
        title: 'hamza',
        type: 'link',
        icontype: 'date_range'
    }
    */
];

@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit {
    public menuItems: any[];
    currentUser: User;

    constructor(private logger: LoggerService, private authService: AuthenticationService,
        private translator: TranslatorService, private alert: AlertService) {
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
        let roleName: string = this.authService.currentSession.currentUser.roles.name;
        if (roleName) {
            this.menuItems = ROUTES.filter(
                menuItem => (
                    menuItem.role == null || (menuItem.role != null && roleName == menuItem.role)
                )
            );
        }
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
                    this.authService.logout();
                }
            }
        );
    }

    updatePS(): void {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
            let ps = new PerfectScrollbar(elemSidebar, { wheelSpeed: 2, suppressScrollX: true });
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }
}
