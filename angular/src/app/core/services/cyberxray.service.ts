import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Box } from '../models/Box';
import { ConfigService } from './config.service';
import AcrossTabs from 'across-tabs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class CyberXRayService {
  parent: any = null;
  constructor(private configService: ConfigService, private authService: AuthenticationService) {
    var config = {
      heartBeatInterval: 1000,
      removeClosedTabs: true,
      onHandshakeCallback: function () { },
      onPollingCallback: function () { }
    }
    this.parent = new AcrossTabs.Parent(config);
  }

  open(domain: string) {
    const currentSession = this.authService.currentSession;
    let token = currentSession.token;
    let refreshToken = currentSession.refreshToken;
    const tabs = this.parent.getOpenedTabs();
    if (tabs.length == 1) {
      //send message
      tabs.forEach(x => {

        x.ref.focus();
      })
      this.parent.broadCastAll({ domain: domain, token: token, refreshToken: refreshToken });
    } else {
      //open new tab

      console.log(`${this.configService.host.cyberXRayUrl + domain}?t=${token}&r=${refreshToken}`)
      let link = `${this.configService.host.cyberXRayUrl + domain}?t=${token}&r=${refreshToken}`;
      this.parent.openNewTab({ url: link, windowName: 'CyberXRay' });
    }
  }
}
