import { Injectable } from '@angular/core';
// tslint:disable-next-line: import-blacklist
import 'rxjs/Rx';
import { SearchSetting } from '../models/SearchSetting';
// tslint:disable-next-line: import-blacklist
import { Observable } from 'rxjs/Rx';
import { Dashboard, TopDomainValuesRequestV4, TopDomainValuesResponseV4, TopDomainsResponseV5, TopDomainsRequestV5 } from '../models/Dashboard';
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

export interface BoxValue {
  serial: string;
  count: number;
}
export interface DistinctBoxResponse {
  items: BoxValue[];
}

export interface HourlyCompanySummaryV5Request {
  duration?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class DashBoardService {


  // ES urls
  private _hourlyCompanySummaryURL = this.configuration.getApiUrl() + '/calculate/hourlyCompanySummaryV5';
  private _topDomainURL = this.configuration.getApiUrl() + '/calculate/topDomainV5';
  private _topDomainValueURL = this.configuration.getApiUrl() + '/calculate/topDomainValue';
  private _distinctAgentURL = this.configuration.getApiUrl() + '/calculate/distinctAgent';
  private _distinctBoxURL = this.configuration.getApiUrl() + '/calculate/distinctBox';

  constructor(
    private http: HttpClient,
    private configuration: ConfigService
  ) { }

  public getHourlyCompanySummary(request: HourlyCompanySummaryV5Request): Observable<any> {
    return this.http.post<{ duration: number }>(this._hourlyCompanySummaryURL, request).map(res => res);
  }

  public getTopDomains(request: TopDomainsRequestV5): Observable<TopDomainsResponseV5> {
    return this.http.post<TopDomainsResponseV5>(this._topDomainURL, request).map(res => res);
  }

  public getTopDomainValue(request: TopDomainValuesRequestV4): Observable<TopDomainValuesResponseV4> {
    return this.http.post<TopDomainValuesResponseV4>(this._topDomainValueURL, request).map(res => res);
  }

  public getDistinctAgent(request: DurationRequest): Observable<DistinctAgentResponse> {
    return this.http.post<DistinctAgentResponse>(this._distinctAgentURL, request).map(res => res);
  }
  public getDistinctBox(request: DurationRequest): Observable<DistinctBoxResponse> {
    return this.http.post<DistinctBoxResponse>(this._distinctBoxURL, request).map(res => res);
  }


  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return options;
  }

}
