import { Response, Headers, RequestOptions } from "@angular/http";
import { Injectable } from "@angular/core";
import "rxjs/Rx";
import { SearchSetting } from "../models/SearchSetting";
import { Observable } from "rxjs/Rx";
import { Dashboard } from "../models/Dashboard";
import { Constants } from "../../Constants";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { DashboardStatistic } from '../models/DashboardStatistic';
import { ElasticDashboardData } from '../models/ElasticDashboardData';

@Injectable()
export class DashBoardService {

  private _saveDashboardURL = this.config.getApiUrl() + '/services/dashboard/save';  // URL to graph api
  private _ListURL = this.config.getApiUrl()+ '/services/dashboard/list';  // URL to graph api
  private _deleteDashboardURL = this.config.getApiUrl() + '/services/dashboard/delete';  // URL to graph api
  private _setDefaultDashboardURL =this.config.getApiUrl() + '/services/dashboard/default';  // URL to graph api
  private _dashboardSettingsURL = this.config.getApiUrl()+ '/services/dashboard/get?';  // URL to graph api
  private _elasticDataForDashboardURL= this.config.getApiUrl() + '/dashboard/getdata';

  constructor(private http: HttpClient, private config: ConfigService) {
    
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
