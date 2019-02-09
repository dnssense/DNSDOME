import {Response, Headers, RequestOptions} from "@angular/http";
import {Injectable} from "@angular/core";
import {SearchSetting} from "../models/SearchSetting";
import {Observable} from "rxjs/Rx";
import {Dashboard} from "../models/Dashboard";
import {Constants} from "../../Constants"; 
import { HttpClient } from '@angular/common/http';

/**
 * Created by fatih on 02.08.2016.
 * Edited by abdurrahman on 30.01.2019
 */

@Injectable()
export class SearchSettingService {

  public _saveSearchSettingURL = Constants.getServerPath() + '/search-settings/save';  // URL to graph api
  public _saveDashboardSearchSettingURL = Constants.getServerPath() + '/dashboard/save-setting?id=';  // URL to graph api
  public _savedSearchURL = Constants.getServerPath() + '/search-settings/saved-search?';  // URL to graph api
  public _ListURL = Constants.getServerPath() + '/search-settings/list';  // URL to graph api
  public _ListUserURL = Constants.getServerPath() + '/search-settings/list-user-settings';  // URL to graph api
  public _deleteSearchListURL = Constants.getServerPath() + '/search-settings/delete';  // URL to graph api
  public _scheduleSearchSettingURL = Constants.getServerPath() + '/search-settings/schedule';  // URL to graph api

  public http;

  constructor(http: HttpClient) {
    this.http = http;
  }

  public openSavedSearch(value: number) {
    return this.http.post(this._savedSearchURL + "id=" + value).map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
       // this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });;

  }

  public listSavedSearchSettings() {
    return this.http.post(this._ListURL).map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        //this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });;

  }

  public listUserSavedSearchSettings() {
    return this.http.post(this._ListUserURL).map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        //this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });;

  }

  public saveSearchSetting(searchSetting: SearchSetting): Observable<Object> {
    let body = JSON.stringify(searchSetting);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(this._saveSearchSettingURL, body, options).map(res => res.json())
      .catch((response: any, caught: any) => {
      //  this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });;

  }

  public scheduleSearchSetting(searchSetting: SearchSetting): Observable<Object> {
    let body = JSON.stringify(searchSetting);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(this._scheduleSearchSettingURL, body, options).map(res => res.json())
      .catch((response: any, caught: any) => {
       // this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });;
  }

  public saveDashboardSearchSetting(dashboard: Dashboard, searchSetting: SearchSetting): Observable<Object> {
    let body = JSON.stringify(searchSetting);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(this._saveDashboardSearchSettingURL + dashboard.id, body, options).map(res => res.json())
      .catch((response: any, caught: any) => {
      //  this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });;
  }

  public deleteSearchSetting(searchSetting: SearchSetting): Observable<Object> {
    let body = JSON.stringify(searchSetting);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(this._deleteSearchListURL, body, options).map(res => res.json())
      .catch((response: any, caught: any) => {
      //  this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });;
  }

}
