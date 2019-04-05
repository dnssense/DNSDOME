import { Response, Headers, RequestOptions } from "@angular/http";
import { Injectable } from "@angular/core";
import "rxjs/Rx";
import { SearchSetting } from "../models/SearchSetting";
import { Observable } from "rxjs/Rx";
import { Dashboard } from "../models/Dashboard";
import { Constants } from "../../Constants";
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { ROUTER_CONFIGURATION } from '@angular/router';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable()
export class DashBoardService {

  public _saveDashboardURL = this.configuration.getApiUrl() + '/services/dashboard/save';  // URL to graph api
  public _ListURL = this.configuration.getApiUrl()  + '/services/dashboard/list';  // URL to graph api
  public _deleteDashboardURL = this.configuration.getApiUrl()  + '/services/dashboard/delete';  // URL to graph api
  public _setDefaultDashboardURL = this.configuration.getApiUrl()  + '/services/dashboard/default';  // URL to graph api
  public _dashboardSettingsURL = this.configuration.getApiUrl()  + '/services/dashboard/get?';  // URL to graph api

  public http;

  constructor(http: HttpClient,private configuration: ConfigService) {
    this.http = http;
  }

  public getDashboardSettings(dashboard: Dashboard): Observable<SearchSetting[]> {

    return this.http.post(this._dashboardSettingsURL + "id=" + dashboard.id).map((res) => {
      console.log(res);
      return res;
    })
      .catch((response: any, caught: any) => {
        // this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public list() {
    return this.http.post(this._ListURL)
      .map((res) => {
        return res;
      })
      .catch((response: any, caught: any) => {
        //  this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }


  public save(dashboard: Dashboard): Observable<Object> {
    let body = JSON.stringify(dashboard);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this._saveDashboardURL, body, options).map(res => res.json())
      .catch((response: any, caught: any) => {
        //     this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });

  }

  public delete(dashboard: Dashboard): Observable<Object> {
    let body = JSON.stringify(dashboard);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this._deleteDashboardURL, body, options).map(res => res.json())
      .catch((response: any, caught: any) => {
        //   this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });

  }


  public setDefaultDashboard(dashboard: Dashboard): Observable<Object> {
    let body = JSON.stringify(dashboard);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this._setDefaultDashboardURL, body, options).map(res => res.json()).catch((response: any, caught: any) => {
      // this.errorService.handleAuthenticatedError(response);
      return Observable.throw(response);
    });

  }



}
