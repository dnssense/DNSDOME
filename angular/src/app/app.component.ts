import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './core/services/authentication.service';
import { ConfigHost, ConfigService } from './core/services/config.service';
import {RkLayoutService, RkUtilityService} from "roksit-lib";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [],
})
export class AppComponent implements OnInit {

  host: ConfigHost;
  title?: string;
  iconImage?: string;
  favicon: string;
  constructor(
    private config: ConfigService,
    private authenticationService: AuthenticationService,
    private configService: ConfigService,
    private rkUtilityService: RkUtilityService
  ) {
    this.rkUtilityService.changeToNewPrimaryColor();
    const user = this.authenticationService.currentSession?.currentUser;
    this.config.init(user?.id);
    this.authenticationService.checkSessionIsValid();
    this.host = this.configService.host;
    this.title = this.host.title;
    this.iconImage = this.host.iconImage;
    const element = document.getElementById('appIcon');
    element.setAttribute('href', `/assets/img/${this.iconImage}`);
  }
  ngOnInit(): void {

  }
}
