import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AuditResponse, AuditSearchRequest } from '../models/AuditSearch';
import { SearchSetting } from '../models/SearchSetting';
import { ConfigService } from './config.service';
import { ErrorService } from './errorService';

@Injectable({ providedIn: 'root' })
export class AuditService {

  public _audit = this.configService.getApiUrl() + '/audit/log/search'; // URL to graph api

  constructor(private http: HttpClient, public errorService: ErrorService, private configService: ConfigService) { }



  public getData(searchSettings: SearchSetting, page: number): Observable<AuditResponse> {


    const body: AuditSearchRequest = {
      page: page,
      topNumber: searchSettings.topNumber,
      dateInterval: searchSettings.dateInterval,
      duration: searchSettings.dateInterval,
      must: searchSettings.must,
      mustnot: searchSettings.mustnot,
      should: searchSettings.should,
      endDate: searchSettings.endDate,
      startDate: searchSettings.startDate
    } as AuditSearchRequest;

    return this.http
      .post(this._audit, body, this.getOptions())
      .map((res: AuditResponse) => res);
    /* .catch((response: any, caught: any) => {
      this.errorService.handleAuthenticatedError(response);
      return Observable.throw(response);
    }); */
  }

  /*  save(content: SearchSetting): Observable<Object> {
     const body = JSON.stringify(content);
     const headers: HttpHeaders = new HttpHeaders({
       'Content-Type': 'application/json'
     });
     const options = { headers: headers };

     return this.http
       .post(this._initContentURL, body, options)
       .map((res: Response) => res.json())
       .catch((response: any, caught: any) => {
         this.errorService.handleAuthenticatedError(response);
         return Observable.throw(response);
       });
   } */

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }

  public initTableColumns() {
    return Observable.of([
      { 'name': 'time', 'beautyName': 'Time', 'hrType': 'DNS_DATETIME', 'aggsType': '', 'checked': true },
      { 'name': 'username', 'beautyName': 'Username', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'ip', 'beautyName': 'Src.Ip', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'severity', 'beautyName': 'Severity', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'message', 'beautyName': 'Message', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'messageDetail', 'beautyName': 'Message Detail', 'hrType': '', 'aggsType': 'TERM', 'checked': true }]
    );
  }
}
