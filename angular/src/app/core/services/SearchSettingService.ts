import { Response, Headers, RequestOptions } from "@angular/http";
import { Injectable } from "@angular/core";
import { SearchSetting } from "../models/SearchSetting";
import { Observable } from "rxjs/Rx";
import { Dashboard } from "../models/Dashboard";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { OperationResult } from '../models/OperationResult';

/**
 * Created by fatih on 02.08.2016.
 * Edited by abdurrahman on 30.01.2019
 */

@Injectable({ providedIn: 'root' })
export class SearchSettingService {

  private _saveSearchSettingURL = this.config.getApiUrl() + '/search-settings/save';
  private _saveDashboardSearchSettingURL = this.config.getApiUrl() + '/dashboard/save-setting?id=';
  private _savedSearchURL = this.config.getApiUrl() + '/search-settings/saved-search?';
  private _ListURL = this.config.getApiUrl() + '/search-settings/list';
  private _ListUserURL = this.config.getApiUrl() + '/search-settings/list-user-settings';
  private _deleteSearchListURL = this.config.getApiUrl() + '/search-settings/delete';
  private _scheduleSearchSettingURL = this.config.getApiUrl() + '/search-settings/schedule';


  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public openSavedSearch(value: number) {

    return this.http.post(this._savedSearchURL + "id=" + value, null).map(res => res);
  }

  public listSavedSearchSettings(): Observable<any> {
    return this.http.get(this._ListURL).map(res => res);
  }

  public listUserSavedSearchSettings() {
    return this.http.get(this._ListUserURL).map(res => res);
  }

  public saveSearchSetting(searchSetting: SearchSetting): Observable<any> {
    let body = JSON.stringify(searchSetting);

    return this.http.post(this._saveSearchSettingURL, body, this.getOptions()).map(res => res);
  }

  public scheduleSearchSetting(searchSetting: SearchSetting): Observable<any> {
    let body = JSON.stringify(searchSetting);

    return this.http.post(this._scheduleSearchSettingURL, body, this.getOptions()).map(res => res);
  }

  public saveDashboardSearchSetting(dashboard: Dashboard, searchSetting: SearchSetting): Observable<any> {
    let body = JSON.stringify(searchSetting, null, ' ');

    return this.http.post(this._saveDashboardSearchSettingURL + dashboard.id, body, this.getOptions()).map(res => res);
  }

  public deleteSearchSetting(searchSetting: SearchSetting): Observable<OperationResult> {
    let body = JSON.stringify(searchSetting, null, ' ');

    return this.http.post<OperationResult>(this._deleteSearchListURL, body, this.getOptions()).map(res => res);
  }

  getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json;' })
    }

    return options;
  }

}
