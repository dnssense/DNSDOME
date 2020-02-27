import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { PublicIP } from '../models/PublicIP';
import { WAgentIpGroup } from '../models/WAgentIpGroup';
import { OperationResult } from '../models/OperationResult';
import { geoLocation } from 'src/app/core/services/geoLocation';

@Injectable({ providedIn: 'root' })
export class PublicIPService {

  public _agentsListURL = this.config.getApiUrl() + '/services/mylocations/agent-list';
  public _locationsListURL = this.config.getApiUrl() + '/services/mylocations/location-list';
  public _appUserProfilesListURL = this.config.getApiUrl() + '/services/application-profiles/profile-list';
  public _domainProfilesListURL = this.config.getApiUrl() + '/services/domain-profiles/profile-list';
  public _agentDeleteURL = this.config.getApiUrl() + '/services/mylocations/delete';
  public _agentUpdateURL = this.config.getApiUrl() + '/services/mylocations/update';
  public _agentSaveURL = this.config.getApiUrl() + '/services/mylocations/save';


  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public getMyIp(): Observable<any> {
    return geoLocation.getCurrent(this.http).map(res => res.ip);
  }

  public getAgentLocation() {
    return this.http.get(this._agentsListURL).map(res => res);
  }

  public getPublicIPs(): Observable<PublicIP[]> {
    return this.http.get<PublicIP[]>(this._locationsListURL).map(res => res);
  }

  public getAppUserProfiles() {
    return this.http.get(this._appUserProfilesListURL).map(res => res);
  }

  public getDomainProfiles() {
    return this.http.get(this._domainProfilesListURL).map(res => res);
  }

  public save(agent: PublicIP): Observable<OperationResult> {

    agent.agentIpGroups = [];
    for (let i = 0; i < agent.ips.length; i++) {
      const ip = agent.ips[i];
      let nip = [Number(ip[0]), Number(ip[1]), Number(ip[2]), Number(ip[3]), Number(ip[4])];
      let g: WAgentIpGroup = new WAgentIpGroup();
      g.initIpBlocks();
      g.ips = nip;
      agent.agentIpGroups.push(g);
    }
    let body = JSON.stringify(agent, null, ' ');

    return this.http.post<OperationResult>(this._agentSaveURL, body, this.getOptions()).map(res => res);
  }


  public delete(agent: PublicIP): Observable<OperationResult> {

    let body = JSON.stringify(agent, null, ' ');

    return this.http.post<OperationResult>(this._agentDeleteURL, body, this.getOptions()).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf8', 'Accept': 'application/json' })
    }

    return options;
  }

  public getRangeOrSubnetMask(type: number, mask: number) {
    //type==1: mask to range 
    //type==2: range to mask
    if (type == 1) {
      if (mask == 255) {
        return 24;
      } else if (mask == 127) {
        return 25;
      } else if (mask == 63) {
        return 26;
      } else if (mask == 31) {
        return 27;
      } else if (mask == 15) {
        return 28;
      } else if (mask == 7) {
        return 29;
      } else if (mask == 3) {
        return 30;
      } else {
        return 32;
      }
    } else {
      if (mask == 24) {
        return 255;
      } else if (mask == 25) {
        return 127;
      } else if (mask == 26) {
        return 63;
      } else if (mask == 27) {
        return 31;
      } else if (mask == 28) {
        return 15;
      } else if (mask == 29) {
        return 7;
      } else if (mask == 30) {
        return 3;
      } else {
        return 0;
      }
    }
  }

}


