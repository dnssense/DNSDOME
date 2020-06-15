import { Component, OnInit } from '@angular/core';
import { RkUtilityService } from 'roksit-lib';
import { ConfigService } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

export type ThemeColor = 'white' | 'dark';

export const LOCAL_STORAGE_THEME_COLOR = 'themeColor';

@Component({
    selector: 'app-theme',
    templateUrl: 'theme.component.html'
})

export class ThemeComponent implements OnInit {

    constructor(
        private rkUtilitiyService: RkUtilityService, private config: ConfigService, private authentication: AuthenticationService, private configService: ConfigService
    ) {

    }

    themeMode: ThemeColor = 'white';

    ngOnInit() {
        const user = this.authentication.currentSession?.currentUser;
        // const themeColor = localStorage.getItem(LOCAL_STORAGE_THEME_COLOR);
        const themeColor = this.configService.getThemeColor(user?.id);

        if (themeColor) {
            this.themeMode = themeColor as ThemeColor;
        }
    }

    colorChanged($event: { color: ThemeColor }) {
        this.configService.saveThemeColor(this.authentication.currentSession?.currentUser?.id, $event.color);
        // localStorage.setItem(LOCAL_STORAGE_THEME_COLOR, $event.color);

        this.rkUtilitiyService.changeTheme($event.color === 'dark');
    }
}
