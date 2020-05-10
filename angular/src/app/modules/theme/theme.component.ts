import { Component, OnInit } from '@angular/core';
import { RkUtilityService } from 'roksit-lib';

export type ThemeColor = 'white' | 'dark';

export const LOCAL_STORAGE_THEME_COLOR = 'themeColor';

@Component({
    selector: 'app-theme',
    templateUrl: 'theme.component.html'
})

export class ThemeComponent implements OnInit {

    constructor(
        private rkUtilitiyService: RkUtilityService
    ) { }

    themeMode: ThemeColor = 'white';

    ngOnInit() {
        const themeColor = localStorage.getItem(LOCAL_STORAGE_THEME_COLOR);

        if (themeColor) {
            this.themeMode = themeColor as ThemeColor;
        }
    }

    colorChanged($event: { color: ThemeColor }) {
        localStorage.setItem(LOCAL_STORAGE_THEME_COLOR, $event.color);

        this.rkUtilitiyService.changeTheme($event.color === 'dark');
    }
}
