
import {of as observableOf,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuditData, AuditResponse, AuditSearchRequest } from '../models/AuditSearch';
import { SearchSetting } from '../models/SearchSetting';
import { AuthenticationService } from './authentication.service';
import { ConfigService } from './config.service';
import { ErrorService } from './errorService';
import { LogColumn } from "../models/LogColumn";

@Injectable({ providedIn: 'root' })
export class AuditService {

  public _audit = this.configService.getApiUrl() + '/audit/log/search'; // URL to graph api

  constructor(private http: HttpClient, public errorService: ErrorService, private configService: ConfigService,
    private translate: TranslateService, private authenticationService: AuthenticationService) { }



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

    const theme = this.configService.getThemeColor(this.authenticationService.currentSession?.currentUser?.id) || 'dark';
    return this.http
      .post(this._audit, body, this.getOptions()).pipe(
      map((res: AuditResponse) => {

        res.result.map(x => {
          const items = this.tryParse(x.messageDetail);
          x.messageDetail = items[0];
          x.hiddenCopy = true;
          x.popoverRows = items.length > 1 ? items : undefined;
          x.popoverClass = theme == 'dark' ? 'auditDetailDark' : "auditDetailWhite";
          (x as any).json = JSON.stringify(items);
          return x;
        });
        return res;
      }));

  }


  tryParse(x: string): string[] {
    try {

      return JSON.parse(x);
    } catch (err) {
      return [x || ''];
    }
  }


  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }

  public initTableColumns(): Observable<LogColumn[]> {
    return observableOf([
      { 'name': 'time', 'beautyName': 'AuditTableColumn.Time', 'hrType': 'DNS_DATETIME', 'aggsType': '', 'checked': true, hide: true },
      { 'name': 'username', 'beautyName': 'AuditTableColumn.Username', 'hrType': '', 'aggsType': 'TERM', 'checked': true, inputPattern: /^[a-z0-9@_*?-]*$/i },
      { 'name': 'isApiKey', 'beautyName': 'AuditTableColumn.IsApiKey', 'hrType': '', 'aggsType': 'TERM', 'checked': true, placeholder: '1 or 0', inputPattern: /^[01]$/ },
      { 'name': 'ip', 'beautyName': 'AuditTableColumn.Ip', 'hrType': '', 'aggsType': 'TERM', 'checked': true, placeholder: '10.11.12.13 or 10.11.*', inputPattern: /^(\*?[012]?\d{1,2}\*?|\*?([012]?\d{1,2}\.){1,3}\*?|\*?([012]?\d{1,2}\.){1,3}[012]?\d{1,2}\*?)$/ },
      { 'name': 'severity', 'beautyName': 'AuditTableColumn.Severity', 'hrType': '', 'aggsType': 'TERM', 'checked': true, placeholder: 'info / warn / alert / critical', inputPattern: /^(in?f?o?|wa?r?n?|cr?i?t?i?c?a?l?|al?e?r?t?)$/ },
      { 'name': 'message', 'beautyName': 'AuditTableColumn.Message', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'messageDetail', 'beautyName': 'AuditTableColumn.MessageDetail', 'hrType': '', 'aggsType': 'TERM', 'checked': true }] as LogColumn[]
    );
  }
}
