import { Component } from '@angular/core';
import { ConfigService, ConfigHost } from './core/services/config.service';
import { AuthenticationService } from './core/services/authentication.service';
import { RkUtilityService } from 'roksit-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers : []
})
export class AppComponent {
  host: ConfigHost;
  title?: string;
  iconImage?: string;
  constructor(
    private config: ConfigService,
    private authenticationService: AuthenticationService,
    utilityService: RkUtilityService,
    private configService: ConfigService) {
    this.config.init();
    this.authenticationService.checkSessionIsValid();
    this.host = this.configService.host;
    this.title = this.host.title;
    this.iconImage = this.host.iconImage;
    // authenticationService.checkSessionIsValid();


    // utilityService.changeTheme(true);

  }
}
