
import {of as observableOf,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { SearchSetting } from '../models/SearchSetting';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { OperationResult } from '../models/OperationResult';
import {LogColumn} from "../models/LogColumn";

@Injectable({ providedIn: 'root' })
export class ReportService {

  public reportListURL = this.configuration.getApiUrl() + '/report2';
  public reportSaveURL = this.configuration.getApiUrl() + '/report2';
  public reportDeleteURL = this.configuration.getApiUrl() + '/report2';

  constructor(
    private http: HttpClient,
    private configuration: ConfigService
  ) { }

  public getReportList(): Observable<SearchSetting[]> {
    return this.http.get(this.reportListURL).pipe(map(res => {
      const items = res as SearchSetting[];
      items.forEach(x => x.dateInterval = 5);
      return items;
    }));
  }

  public saveReport(report: any): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.reportSaveURL, report, this.getOptions()).pipe(map(res => res));
  }

  public deleteReport(report: any): Observable<OperationResult> {
    return this.http.delete<OperationResult>(`${this.reportDeleteURL}/${report.id}`, this.getOptions()).pipe(map(res => res));
  }

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }

  public initTableColumns(): Observable<LogColumn[]> {
    return observableOf([
      { 'name': 'time', 'beautyName': 'Time', 'hrType': 'DNS_DATETIME', 'aggsType': '', 'checked': true, hide: true },
      { 'name': 'domain', 'beautyName': 'TableColumn.Domain', 'hrType': '', 'aggsType': 'TERM', 'checked': false, placeholder: 'example.com or example.*', inputPattern: /^(\*?|\*?(\.?-*\w+\.?-*)+\*?)$/i },
      { 'name': 'subdomain', 'beautyName': 'TableColumn.Subdomain', 'hrType': '', 'aggsType': 'TERM', 'checked': true, placeholder: 'example.com or example.*', inputPattern: /^(\*?|\*?(\.?-*\w+\.?-*)+\*?)$/i },
      { 'name': 'sourceIp', 'beautyName': 'TableColumn.SourceIp', 'hrType': '', 'aggsType': 'TERM', 'checked': true, placeholder: '10.11.12.13 or 10.11.*', inputPattern: /^(\*?[012]?\d{1,2}\*?|\*?([012]?\d{1,2}\.){1,3}\*?|\*?([012]?\d{1,2}\.){1,3}[012]?\d{1,2}\*?)$/i },
      { 'name': 'sourceIpCountryCode', 'beautyName': 'TableColumn.SourceCountry', 'hrType': 'COUNTRY_FLAG', 'aggsType': 'TERM', 'checked': false, inputPattern: /^([A-Z]*|N\/?A?)$/i },
      { 'name': 'destinationIp', 'beautyName': 'TableColumn.DestinationIp', 'hrType': '', 'aggsType': 'TERM', 'checked': true, placeholder: '10.11.12.13 or 10.11.*', inputPattern: /^(\*?[012]?\d{1,2}\*?|\*?([012]?\d{1,2}\.){1,3}\*?|\*?([012]?\d{1,2}\.){1,3}[012]?\d{1,2}\*?|N\/?A?)$/i },
      { 'name': 'destinationIpCountryCode', 'beautyName': 'TableColumn.DestinationCountry', 'hrType': 'COUNTRY_FLAG', 'aggsType': 'TERM', 'checked': false, inputPattern: /^([A-Z]*|N\/?A?)$/i },
      { 'name': 'agentAlias', 'beautyName': 'TableColumn.AgentAlias', 'hrType': '', 'aggsType': 'TERM', 'checked': false },
      { 'name': 'userId', 'beautyName': 'TableColumn.UserId', 'hrType': '', 'aggsType': 'TERM', 'checked': false, hide: true },
      { 'name': 'action', 'beautyName': 'TableColumn.Action', 'hrType': 'DNS_ACTION', 'aggsType': 'TERM', 'checked': true, placeholder: 'Allow / Deny', inputPattern: /^(a|al|all|allo|allow|d|de|den|deny)$/i },
      { 'name': 'applicationName', 'beautyName': 'TableColumn.ApplicationName', 'hrType': '', 'aggsType': 'TERM', 'checked': false, inputPattern: /^[*a-zA-Z0-9_ \/]{0,32}$/i },
      { 'name': 'category', 'beautyName': 'TableColumn.Category', 'hrType': '', 'aggsType': 'TERM', 'checked': false, hide: true },
      { 'name': 'reasonType', 'beautyName': 'TableColumn.ReasonType', 'hrType': '', 'aggsType': 'TERM', 'checked': false },
      { 'name': 'clientLocalIp', 'beautyName': 'TableColumn.ClientLocalIp', 'hrType': '', 'aggsType': 'TERM', 'checked': false, placeholder: '10.11.12.13 or 10.11.*', inputPattern: /^(\*?[012]?\d{1,2}\*?|\*?([012]?\d{1,2}\.){1,3}\*?|\*?([012]?\d{1,2}\.){1,3}[012]?\d{1,2}\*?|N\/?A?)$/i },
      { 'name': 'clientMacAddress', 'beautyName': 'TableColumn.ClientMacAddress', 'hrType': '', 'aggsType': 'TERM', 'checked': false, placeholder: '00:11:22:33:44:55 or 00:11:*', inputPattern: /^(\*?([0-9a-f]{1,2}?-?:?){1,6}\*?|N\/?A?)$/i },
      { 'name': 'clientBoxSerial', 'beautyName': 'TableColumn.ClientBoxSerial', 'hrType': '', 'aggsType': 'TERM', 'checked': false },
      { 'name': 'hostName', 'beautyName': 'TableColumn.HostName', 'hrType': '', 'aggsType': 'TERM', 'checked': false, inputPattern: /^(\*?|\*?([.-]?\w+[.-]?)+\*?|N\/?A?)$/ },
      { 'name': 'ruleNumber', 'beautyName': 'TableColumn.RuleNumber', 'hrType': '', 'aggsType': 'TERM', 'checked': false, inputPattern: /^\d*$/  },
      { 'name': 'ruleBy', 'beautyName': 'TableColumn.RuleBy', 'hrType': '', 'aggsType': 'TERM', 'checked': false, inputPattern: /^(A?D?U?S?R|A?D?G?R?P?|M?A?C?|L?O?C?I?P?|B?O?X?)$/ },
      { 'name': 'ruleKeyword', 'beautyName': 'TableColumn.RuleKeyword', 'hrType': '', 'aggsType': 'TERM', 'checked': false },
    ]);
  }



}
