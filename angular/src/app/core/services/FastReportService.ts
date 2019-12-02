import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/Rx';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { ConfigItem } from '../models/ConfigItem';
import { Dashboard } from '../models/Dashboard';
import { LogColumn } from '../models/LogColumn';
import { SearchSetting } from '../models/SearchSetting';
import { ErrorService } from './ErrorService';
import { ConfigService } from './config.service';
import { Config } from 'protractor';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({ providedIn: 'root' })
export class FastReportService {
  public _initContentURL = this.configService.getApiUrl() + '/quick-reports/init'; // URL to subcategories api
  public _graphURL = this.configService.getApiUrl() + '/quick-reports/tableData'; // URL to graph api
  public _histogramURL = this.configService.getApiUrl() + '/quick-reports/logCountHistogram'; // URL to graph api
  public _dashboardHistogramURL = this.configService.getApiUrl() + '/quick-reports/dashboardHistogram'; // URL to graph api
  public _saveSearchSettingURL = this.configService.getApiUrl() + '/quick-reports/saveSearchSetting'; // URL to graph api
  public _savedSearchURL = this.configService.getApiUrl() + '/quick-reports/saved-search?'; // URL to graph api
  public _savedSearchListURL = this.configService.getApiUrl() + '/quick-reports/saved-search-list'; // URL to graph api
  public _initTableColumnsURL = this.configService.getApiUrl() + '/quick-reports/tableColumns'; // URL to subcategories api
  public _multiValueHistogramDataURL = this.configService.getApiUrl() + '/quick-reports/multiValueHistogramData'; // URL to graph api

  public _tableColumns: BehaviorSubject<LogColumn[]> = new BehaviorSubject(
    null
  );
  public _configItems: BehaviorSubject<ConfigItem[]> = new BehaviorSubject(
    null
  );

  constructor(private http: HttpClient, private errorService: ErrorService, private configService: ConfigService) {
    this.initTableColumns();
    this.initFormData();
  }

  get tableColumns(): BehaviorSubject<LogColumn[]> {
    return this._tableColumns;
  }

  get configItems(): BehaviorSubject<ConfigItem[]> {
    return this._configItems;
  }

  public initFormData() {
    return this.http
      .get<Object>(this._initContentURL)
      .map((response: Object) => response)
      .subscribe((configItemArray: Object) => {
        this._configItems.next(configItemArray['configItems']);
      });
  }

  public initTableColumns() {
    return this.http
      .get<LogColumn[]>(this._initTableColumnsURL)
      .map((response: LogColumn[]) => response)
      .subscribe((logColumnArray: LogColumn[]) => {
        this._tableColumns.next(logColumnArray)
      });
  }

  public openSavedSearch(value: number): Observable<Object> {
    return this.http
      .post(this._savedSearchURL + 'id=' + value, null)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public listSavedSearchSettings(): Observable<Object> {
    return this.http
      .post(this._savedSearchListURL, null)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getGraphData(
    configItem: ConfigItem,
    searchSettings: SearchSetting,
    maxItems: number
  ): Observable<Object> {
    let cloneSetting = <SearchSetting>(
      JSON.parse(JSON.stringify(searchSettings))
    );
    cloneSetting.columns = configItem;
    cloneSetting.type = configItem.type;

    let body = JSON.stringify({
      searchSetting: cloneSetting,
      maxItems: maxItems
    });
    let headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = { headers: headers };
    return this.http
      .post(this._graphURL, body, options)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public loadHistogram(searchSettings: SearchSetting): Observable<Object> {
    let body = JSON.stringify({ searchSetting: searchSettings });
    let options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http
      .post(this._histogramURL, body, options)
      .map((res: Response) => res)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getMultiValueHistogramData(
    searchSettings: SearchSetting,
    dashboard: Dashboard
  ): Observable<Object> {
    let options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .post(
        this._multiValueHistogramDataURL +
        '?id=' +
        searchSettings.id +
        '&dashboardid=' +
        dashboard.id,
        '',
        options
      )
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public loadDashbaordHistogram(
    searchSettings: SearchSetting
  ): Observable<Object> {
    let body = JSON.stringify({ searchSetting: searchSettings });
    let options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http
      .post(this._dashboardHistogramURL, body, options)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }
}
