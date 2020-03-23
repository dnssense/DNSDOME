import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { SearchSetting } from '../models/SearchSetting';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { OperationResult } from '../models/OperationResult';

@Injectable({ providedIn: 'root' })
export class ReportService {

  public reportListURL = this.configuration.getApiUrl() + '/report/saved/list';
  public reportSaveURL = this.configuration.getApiUrl() + '/report/saved/save';
  public reportDeleteURL = this.configuration.getApiUrl() + '/report/saved/delete';

  constructor(
    private http: HttpClient,
    private configuration: ConfigService
  ) { }

  public getReportList(): Observable<SearchSetting[]> {
    return this.http.get(this.reportListURL).map(res => res as SearchSetting[]);
  }

  public saveReport(report: any): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.reportSaveURL, JSON.stringify(report), this.getOptions()).map(res => res);
  }

  public deleteReport(report: any): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.reportDeleteURL, JSON.stringify(report), this.getOptions()).map(res => res);
  }

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }

  public initTableColumns() {
    return Observable.of( [{'name': 'time', 'beautyName': 'Time', 'hrType': 'DNS_DATETIME', 'aggsType': '', 'checked': true}, {'name': 'domain', 'beautyName': 'Domain', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'subdomain', 'beautyName': 'Subdomain', 'hrType': '', 'aggsType': 'TERM', 'checked': true}, {'name': 'sourceIp', 'beautyName': 'Src.Ip', 'hrType': '', 'aggsType': 'TERM', 'checked': true}, {'name': 'sourceIpCountryCode', 'beautyName': 'Src. Country', 'hrType': 'COUNTRY_FLAG', 'aggsType': 'TERM', 'checked': false}, {'name': 'destinationIp', 'beautyName': 'Dst.Ip', 'hrType': '', 'aggsType': 'TERM', 'checked': true}, {'name': 'destinationIpCountryCode', 'beautyName': 'Dst.Country', 'hrType': 'COUNTRY_FLAG', 'aggsType': 'TERM', 'checked': false}, {'name': 'agentAlias', 'beautyName': 'Location/Agent', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'userId', 'beautyName': 'User Id', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'action', 'beautyName': 'Action', 'hrType': 'DNS_ACTION', 'aggsType': 'TERM', 'checked': true}, {'name': 'applicationName', 'beautyName': 'Application', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'category', 'beautyName': 'Category', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'reasonType', 'beautyName': 'Reason', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'clientLocalIp', 'beautyName': 'Local Src. Ip', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'clientMacAddress', 'beautyName': 'Mac Address', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'clientBoxSerial', 'beautyName': 'Box Serial', 'hrType': '', 'aggsType': 'TERM', 'checked': false}, {'name': 'hostName', 'beautyName': 'Host Name', 'hrType': '', 'aggsType': 'TERM', 'checked': false}]
    );
  }



}
