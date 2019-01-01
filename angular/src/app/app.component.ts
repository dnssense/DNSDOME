import { Component } from '@angular/core';
import { ConfigService } from './core/services/config.service';
import { AuthenticationService } from './core/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'Dnssense';
  constructor(private config: ConfigService,private authenticationService:AuthenticationService) {
    config.init();
   // authenticationService.checkSessionIsValid();

  }
}
