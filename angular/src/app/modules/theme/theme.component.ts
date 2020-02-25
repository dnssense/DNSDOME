import { Component, OnInit } from '@angular/core';

export type ThemeColor = 'white' | 'dark';

const LOCAL_STORAGE_THEME_COLOR = 'themeColor';

@Component({
    selector: 'app-theme',
    templateUrl: 'theme.component.html'
})

export class ThemeComponent implements OnInit {

    constructor() { }

    themeMode: ThemeColor = 'white';

    ngOnInit() {
        const themeColor = localStorage.getItem(LOCAL_STORAGE_THEME_COLOR);

        if (themeColor) {
            this.themeMode = themeColor as ThemeColor;
        }
    }

    colorChanged($event: { color: ThemeColor }) {
        localStorage.setItem(LOCAL_STORAGE_THEME_COLOR, $event.color);
    }
}
