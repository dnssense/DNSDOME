import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { OperationResult } from '../models/OperationResult';
import { ConfigService } from './config.service';
import { ErrorService } from './errorService';
import { Location } from '../models/Location';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({ providedIn: 'root' })
export class LocationsService {
  public _agentsListURL = this.configService.getApiUrl() + '/locations/agent-list';
  public _locationsListURL =
    this.configService.getApiUrl() + '/locations/location-list';
  public _appUserProfilesListURL =
    this.configService.getApiUrl() + '/application-profiles/profile-list';
  public _domainProfilesListURL =
    this.configService.getApiUrl() + '/domain-profiles/profile-list';
  public _agentDeleteURL = this.configService.getApiUrl() + '/locations/delete';
  public _agentUpdateURL = this.configService.getApiUrl() + '/locations/update';
  public _agentSaveURL = this.configService.getApiUrl() + '/locations/save';

  constructor(private http: HttpClient, private errorService: ErrorService, private configService: ConfigService) { }

  public getAgentLocation() {
    return this.http
      .post<Location[]>(this._agentsListURL, null)
      .map((res: Location[]) => res)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getLocations() {
    return this.http
      .post<Location[]>(this._locationsListURL, null)
      .map((res: Location[]) => res)
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
    const body = JSON.stringify(agent);
    const headers = this.getHeaders();
    const options = { headers: headers };

    return this.http
      .post(this._agentSaveURL, body, options)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public delete(agent: Location): Observable<OperationResult> {
    const body = JSON.stringify(agent);
    const headers = this.getHeaders();
    const options = { headers: headers };

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
