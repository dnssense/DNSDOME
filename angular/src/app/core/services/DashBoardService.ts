import { Injectable } from '@angular/core';
// tslint:disable-next-line: import-blacklist
import 'rxjs/Rx';
import { SearchSetting } from '../models/SearchSetting';
// tslint:disable-next-line: import-blacklist
import { Observable } from 'rxjs/Rx';
import { Dashboard, TopDomainsResponseV4, TopDomainValuesRequestV4, TopDomainValuesResponseV4 } from '../models/Dashboard';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';


export interface DurationRequest {
  duration: number;

}
export interface TopDomainsRequestV4 extends DurationRequest {

  type: 'malicious' | 'new' | 'harmful';
}

export interface AgentValue {
  id: number;
  count: number;
}
export interface DistinctAgentResponse {
  items: AgentValue[];
}

@Injectable()
export class DashBoardService {

  /* public _saveDashboardURL = this.configuration.getApiUrl() + '/services/dashboard/save';  // URL to graph api
  public _ListURL = this.configuration.getApiUrl() + '/services/dashboard/list';  // URL to graph api
  public _deleteDashboardURL = this.configuration.getApiUrl() + '/services/dashboard/delete';  // URL to graph api
  public _setDefaultDashboardURL = this.configuration.getApiUrl() + '/services/dashboard/default';  // URL to graph api
  public _dashboardSettingsURL = this.configuration.getApiUrl() + '/services/dashboard/get?';  // URL to graph api */
  // ES urls
  private _hourlyCompanySummaryURL = this.configuration.getApiUrl() + '/calculate/hourlyCompanySummaryV4';
  private _topDomainURL = this.configuration.getApiUrl() + '/calculate/topDomain';
  private _topDomainValueURL = this.configuration.getApiUrl() + '/calculate/topDomain';
  private _distinctAgentURL = this.configuration.getApiUrl() + '/calculate/distinctAgent';

  constructor(
    private http: HttpClient,
    private configuration: ConfigService
  ) { }

  public getHourlyCompanySummary(request: { duration: number }): Observable<any> {
    return this.http.post<{ duration: number }>(this._hourlyCompanySummaryURL, request).map(res => res);
  }

  public getTopDomains(request: TopDomainsRequestV4): Observable<TopDomainsResponseV4> {
    return this.http.post<TopDomainsResponseV4>(this._topDomainURL, request).map(res => res);
  }

  public getTopDomainValue(request: TopDomainValuesRequestV4): Observable<TopDomainValuesResponseV4> {
    return this.http.post<TopDomainValuesResponseV4>(this._topDomainValueURL, request).map(res => res);
  }

  public getDistinctAgent(request: DurationRequest): Observable<DistinctAgentResponse> {
    return this.http.post<DistinctAgentResponse>(this._distinctAgentURL, request).map(res => res);
  }

  /* public getDashboardSettings(dashboard: Dashboard): Observable<SearchSetting[]> {
    const url = this._dashboardSettingsURL + 'id=' + dashboard.id;

    return this.http.post<SearchSetting[]>(url, this.getOptions()).map(res => res);
  }

  public list() {
    return this.http.get(this._ListURL).map(res => res);
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
 */
  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return options;
  }

}
