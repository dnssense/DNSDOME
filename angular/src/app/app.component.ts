import { Component } from '@angular/core';
import { ConfigService, ConfigHost } from './core/services/config.service';
import { AuthenticationService } from './core/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  host:ConfigHost;
  title?:string;
  constructor(private config: ConfigService,private authenticationService:AuthenticationService,private configService:ConfigService) {
    config.init();
    this.authenticationService.checkSessionIsValid();
    this.host=configService.host;
    this.title=this.host.title;
   // authenticationService.checkSessionIsValid();

  }
}
