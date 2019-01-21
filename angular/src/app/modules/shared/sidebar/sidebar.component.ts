import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { Session } from 'src/app/core/models/Session';
import { LoggerService } from 'src/app/core/services/logger.service';
import { User } from 'src/app/core/models/User';
import { forEach } from '@angular/router/src/utils/collection';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Role } from 'src/app/core/models/Role';

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
        path: '/admin/settings',
        title: 'Settings',
        type: 'sub',
        icontype: 'settings',
        role: 'ROLE_CUSTOMER',
        collapse: 'settings',
        children: [
            { path: 'buttons', title: 'Security Profiles', ab: 'SP' },
            { path: 'grid', title: 'IP Configurations', ab: 'IC' },
            { path: 'panels', title: 'Users', ab: 'U' },
            { path: 'sweet-alert', title: 'Tools', ab: 'T' }
        ]
    }
    /*, {
        path: '/admin/hamza',
        title: 'hamza',
        type: 'link',
        icontype: 'date_range'
    }
    ,{
        path: '/components',
        title: 'Components',
        type: 'sub',
        icontype: 'apps',
        collapse: 'components',
        children: [
            { path: 'buttons', title: 'Buttons', ab: 'B' },
            { path: 'grid', title: 'Grid System', ab: 'GS' },
            { path: 'panels', title: 'Panels', ab: 'P' },
            { path: 'sweet-alert', title: 'Sweet Alert', ab: 'SA' },
            { path: 'notifications', title: 'Notifications', ab: 'N' },
            { path: 'icons', title: 'Icons', ab: 'I' },
            { path: 'typography', title: 'Typography', ab: 'T' }
        ]
    }, {
        path: '/forms',
        title: 'Forms',
        type: 'sub',
        icontype: 'content_paste',
        collapse: 'forms',
        children: [
            { path: 'regular', title: 'Regular Forms', ab: 'RF' },
            { path: 'extended', title: 'Extended Forms', ab: 'EF' },
            { path: 'validation', title: 'Validation Forms', ab: 'VF' },
            { path: 'wizard', title: 'Wizard', ab: 'W' }
        ]
    }, {
        path: '/tables',
        title: 'Tables',
        type: 'sub',
        icontype: 'grid_on',
        collapse: 'tables',
        children: [
            { path: 'regular', title: 'Regular Tables', ab: 'RT' },
            { path: 'extended', title: 'Extended Tables', ab: 'ET' },
            { path: 'datatables.net', title: 'Datatables.net', ab: 'DT' }
        ]
    }, {
        path: '/maps',
        title: 'Maps',
        type: 'sub',
        icontype: 'place',
        collapse: 'maps',
        children: [
            { path: 'google', title: 'Google Maps', ab: 'GM' },
            { path: 'fullscreen', title: 'Full Screen Map', ab: 'FSM' },
            { path: 'vector', title: 'Vector Map', ab: 'VM' }
        ]
    }, {
        path: '/widgets',
        title: 'Widgets',
        type: 'link',
        icontype: 'widgets'
    
    }, {
        path: '/charts',
        title: 'Charts',
        type: 'link',
        icontype: 'timeline'
    
    }, {
        path: '/calendar',
        title: 'Calendar',
        type: 'link',
        icontype: 'date_range'
    }, {
        path: '/pages',
        title: 'Pages',
        type: 'sub',
        icontype: 'image',
        collapse: 'pages',
        children: [
            { path: 'pricing', title: 'Pricing', ab: 'P' },
            { path: 'timeline', title: 'Timeline Page', ab: 'TP' },
            { path: 'login', title: 'Login Page', ab: 'LP' },
            { path: 'register', title: 'Register Page', ab: 'RP' },
            { path: 'lock', title: 'Lock Screen Page', ab: 'LSP' },
            { path: 'user', title: 'User Page', ab: 'UP' }
        ]
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

    constructor(private logger: LoggerService, private authService: AuthenticationService) {
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
            debugger;
            this.menuItems = ROUTES.filter(
                menuItem => (
                    menuItem.role == null || (menuItem.role != null && roleName == menuItem.role)
                )
            );
        }


        //this.menuItems = filteredMenus;
    }

    checkMenuRole(menuRole: string): boolean {

        if (this.authService.currentSession.roles != null) {
            debugger;
            for (let i = 0; i < this.authService.currentSession.roles.length; i++) {
                if (menuRole == this.authService.currentSession.roles[i]) {
                    return true;
                }
            }
            return false;
        }

        return true;
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
