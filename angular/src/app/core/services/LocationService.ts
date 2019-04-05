import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorService } from './ErrorService';
import { Constants } from 'src/app/Constants';
import { OperationResult } from '../models/OperationResult';
import { ConfigService } from './config.service';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({ providedIn: 'root' })
export class LocationsService {
  public _agentsListURL = this.configService.getApiUrl() + '/services/mylocations/agent-list';
  public _locationsListURL =
  this.configService.getApiUrl() + '/services/mylocations/location-list';
  public _appUserProfilesListURL =
  this.configService.getApiUrl() + '/services/application-profiles/profile-list';
  public _domainProfilesListURL =
  this.configService.getApiUrl() + '/services/domain-profiles/profile-list';
  public _agentDeleteURL = this.configService.getApiUrl() + '/services/mylocations/delete';
  public _agentUpdateURL = this.configService.getApiUrl() + '/services/mylocations/update';
  public _agentSaveURL = this.configService.getApiUrl() + '/services/mylocations/save';

  constructor(private http: HttpClient, private errorService: ErrorService,private configService:ConfigService) {}

  public getAgents() {
    return this.http
      .post(this._agentsListURL, null)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getLocations() {
    return this.http
      .post(this._locationsListURL, null)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getAppUserProfiles() {
    return this.http
      .post(this._appUserProfilesListURL, null)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getDomainProfiles() {
    return this.http
      .post(this._domainProfilesListURL, null)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public save(agent: Location): Observable<OperationResult> {
    /*
         for (let ip of agent.agentIpGroups){
         ip.initIpBlocks();
         ip.ips=null;
         //todo . burda valuyu düzenlemen gerkeebilir..Burda agentip groups u basacaz...
         }
         */
    let body = JSON.stringify(agent);
    let headers = this.getHeaders();
    let options = { headers: headers };

    return this.http
      .post(this._agentSaveURL, body, options)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public delete(agent: Location): Observable<OperationResult> {
    let body = JSON.stringify(agent);
    let headers = this.getHeaders();
    let options = { headers: headers };

    return this.http
      .post(this._agentDeleteURL, body, options)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  private getHeaders(): HttpHeaders {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf8',
      Accept: 'application/json'
    });
    return headers;
  }
}
