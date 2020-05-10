import { Component } from '@angular/core';
import { ConfigService, ConfigHost } from './core/services/config.service';
import { AuthenticationService } from './core/services/authentication.service';
import { RkUtilityService, ThemeColor } from 'roksit-lib';
import { LOCAL_STORAGE_THEME_COLOR } from './modules/theme/theme.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: []
})
export class AppComponent {

  host: ConfigHost;
  title?: string;
  iconImage?: string;

  constructor(
    private config: ConfigService,
    private authenticationService: AuthenticationService,
    private configService: ConfigService,
    private rkUtilityService: RkUtilityService
  ) {
    this.config.init();
    this.authenticationService.checkSessionIsValid();
    this.host = this.configService.host;
    this.title = this.host.title;
    this.iconImage = this.host.iconImage;
    // authenticationService.checkSessionIsValid();

    const lang = localStorage.getItem('language');

    if (lang) {
      this.config.setDefaultLanguage(lang);
    }

    const themeColor = localStorage.getItem(LOCAL_STORAGE_THEME_COLOR);

    if (themeColor) {
      this.rkUtilityService.changeTheme(themeColor === 'dark');
    }

  }
}
