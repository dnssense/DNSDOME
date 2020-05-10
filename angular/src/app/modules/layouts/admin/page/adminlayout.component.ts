import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import { Location, PopStateEvent } from '@angular/common';
import 'rxjs/add/operator/filter';

import PerfectScrollbar from 'perfect-scrollbar';
import { NavbarComponent } from 'src/app/modules/shared/navbar/navbar.component';
import { NavItem } from 'src/app/modules/shared/md/md.module';
import { RkLayoutService } from 'roksit-lib';
import { SidebarComponent } from 'src/app/modules/shared/sidebar/sidebar.component';

@Component({
    selector: 'app-adminlayout',
    templateUrl: './adminlayout.component.html',
    styleUrls: ['./adminlayout.component.sass']
})
export class AdminLayoutComponent implements OnInit {

    public navItems: NavItem[];
    private lastPoppedUrl: string;
    private yScrollStack: number[] = [];
    url: string;
    location: Location;

    @ViewChild(SidebarComponent) sidebar: SidebarComponent;
    @ViewChild(NavbarComponent) navbar: NavbarComponent;

    collapsed: boolean;

    constructor(
        private router: Router,
        location: Location,
        private rkLayoutService: RkLayoutService
    ) {
        this.location = location;

        rkLayoutService.sidebarCollapsed.subscribe(collapsed => {
            this.collapsed = collapsed;
        });
    }

    ngOnInit() {
        const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
        this.location.subscribe((ev: PopStateEvent) => {
            this.lastPoppedUrl = ev.url;
        });
        this.router.events.subscribe((event: any) => {
            this.sidebar.setActiveMenuItemByRoute();

            if (event instanceof NavigationStart) {
                if (event.url !== this.lastPoppedUrl) {
                    this.yScrollStack.push(window.scrollY);
                }
            } else if (event instanceof NavigationEnd) {
                if (event.url === this.lastPoppedUrl) {
                    this.lastPoppedUrl = undefined;
                    window.scrollTo(0, this.yScrollStack.pop());
                } else {
                    window.scrollTo(0, 0);
                }
            }
        });

        // const html = document.getElementsByTagName('html')[0];
        // if (elemMainPanel && elemSidebar && window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
        //     let ps = new PerfectScrollbar(elemMainPanel);
        //     ps = new PerfectScrollbar(elemSidebar);
        //     html.classList.add('perfect-scrollbar-on');
        // } else {
        //     html.classList.add('perfect-scrollbar-off');
        // }

        this.navItems = [];
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

    runOnRouteChange(): void {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
            const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
            let ps = new PerfectScrollbar(elemMainPanel);
            ps = new PerfectScrollbar(elemSidebar);
            ps.update();
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
