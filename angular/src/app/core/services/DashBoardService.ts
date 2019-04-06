import { Response, Headers, RequestOptions } from "@angular/http";
import { Injectable } from "@angular/core";
import "rxjs/Rx";
import { SearchSetting } from "../models/SearchSetting";
import { Observable } from "rxjs/Rx";
import { Dashboard } from "../models/Dashboard";
import { Constants } from "../../Constants";

import { ROUTER_CONFIGURATION } from '@angular/router';

/**
 * Created by fatih on 02.08.2016.
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { DashboardStatistic } from '../models/DashboardStatistic';
import { ElasticDashboardData } from '../models/ElasticDashboardData';


@Injectable()
export class DashBoardService {


  public _saveDashboardURL = this.configuration.getApiUrl() + '/services/dashboard/save';  // URL to graph api
  public _ListURL = this.configuration.getApiUrl()  + '/services/dashboard/list';  // URL to graph api
  public _deleteDashboardURL = this.configuration.getApiUrl()  + '/services/dashboard/delete';  // URL to graph api
  public _setDefaultDashboardURL = this.configuration.getApiUrl()  + '/services/dashboard/default';  // URL to graph api
  public _dashboardSettingsURL = this.configuration.getApiUrl()  + '/services/dashboard/get?';  // URL to graph api


  private _elasticDataForDashboardURL= this.configuration.getApiUrl() + '/dashboard/getdata';





  constructor(private http: HttpClient,private configuration: ConfigService) {

  }


  public getElasticData():Observable<ElasticDashboardData>{

    return this.http.get<ElasticDashboardData>(this._elasticDataForDashboardURL).map(res=> res);
  }

  public getDashboardSettings(dashboard: Dashboard): Observable<SearchSetting[]> {
    const url = this._dashboardSettingsURL + "id=" + dashboard.id;

    return this.http.post<SearchSetting[]>(url, this.getOptions()).map(res => res);

  }

  public list() {
    return this.http.get(this._ListURL).map(res=> res);
  }


  public save(dashboard: Dashboard): Observable<Object> {
    return this.http.post(this._saveDashboardURL, JSON.stringify(dashboard), this.getOptions()).map(res => res);

  }

  public delete(dashboard: Dashboard): Observable<Object> {

    return this.http.post(this._deleteDashboardURL, JSON.stringify(dashboard), this.getOptions()).map(res => res);
  }


  public setDefaultDashboard(dashboard: Dashboard): Observable<Object> {

    return this.http.post(this._setDefaultDashboardURL, JSON.stringify(dashboard), this.getOptions()).map(res => res);
  }

private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }

}
