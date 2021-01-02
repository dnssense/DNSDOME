import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { AuditData, AuditResponse, AuditSearchRequest } from '../models/AuditSearch';
import { SearchSetting } from '../models/SearchSetting';
import { AuthenticationService } from './authentication.service';
import { ConfigService } from './config.service';
import { ErrorService } from './errorService';

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
      .post(this._audit, body, this.getOptions())
      .map((res: AuditResponse) => {

        res.result.map(x => {
          const items = this.tryParse(x.messageDetail);
          x.messageDetail = items[0];
          x.popoverRows = items.length > 0 ? items : undefined;
          x.popoverClass = theme == 'dark' ? 'auditDetailDark' : "auditDetailWhite";
          return x;
        });
        return res;
      });

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

  public initTableColumns() {
    return Observable.of([
      { 'name': 'time', 'beautyName': 'Time', 'hrType': 'DNS_DATETIME', 'aggsType': '', 'checked': true },
      { 'name': 'username', 'beautyName': 'Username', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'isApiKey', 'beautyName': 'Is Api Key', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'ip', 'beautyName': 'Src.Ip', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'severity', 'beautyName': 'Severity', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'message', 'beautyName': 'Message', 'hrType': '', 'aggsType': 'TERM', 'checked': true },
      { 'name': 'messageDetail', 'beautyName': 'Message Detail', 'hrType': '', 'aggsType': 'TERM', 'checked': true }]
    );
  }
}
