import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/Rx';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { Constants } from 'src/app/Constants';
import { ConfigItem } from '../models/ConfigItem';
import { Dashboard } from '../models/Dashboard';
import { LogColumn } from '../models/LogColumn';
import { SearchSetting } from '../models/SearchSetting';
import { ErrorService } from './ErrorService';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({ providedIn: 'root' })
export class FastReportService {
  public _initContentURL = Constants.getServerPath() + '/quick-reports/init'; // URL to subcategories api
  public _graphURL = Constants.getServerPath() + '/quick-reports/tableData'; // URL to graph api
  public _histogramURL =
    Constants.getServerPath() + '/quick-reports/logCountHistogram'; // URL to graph api
  public _dashboardHistogramURL =
    Constants.getServerPath() + '/quick-reports/dashboardHistogram'; // URL to graph api
  public _saveSearchSettingURL =
    Constants.getServerPath() + '/quick-reports/saveSearchSetting'; // URL to graph api
  public _savedSearchURL =
    Constants.getServerPath() + '/quick-reports/saved-search?'; // URL to graph api
  public _savedSearchListURL =
    Constants.getServerPath() + '/quick-reports/saved-search-list'; // URL to graph api
  public _initTableColumnsURL =
    Constants.getServerPath() + '/quick-reports/tableColumns'; // URL to subcategories api
  public _multiValueHistogramDataURL =
    Constants.getServerPath() + '/quick-reports/multiValueHistogramData'; // URL to graph api

  public _tableColumns: BehaviorSubject<LogColumn[]> = new BehaviorSubject(
    null
  );
  public _configItems: BehaviorSubject<ConfigItem[]> = new BehaviorSubject(
    null
  );

  constructor(private http: HttpClient, private errorService: ErrorService) {
    // this.initTableColumns();
    // this.initFormData();
  }

  get tableColumns(): BehaviorSubject<LogColumn[]> {
    return this._tableColumns;
  }

  get configItems(): BehaviorSubject<ConfigItem[]> {
    return this._configItems;
  }

  // public initFormData(): Observable<Object> {
  //   return this.http
  //     .get(this._initContentURL)
  //     .map((res: Response) => res.json())
  //     .subscribe((res: Object) => {
  //       this._configItems.next(res['configItems']);
  //     });
  // }

  // public initTableColumns(): Observable<LogColumn[]> {
  //   return this.http
  //     .get(this._initTableColumnsURL)
  //     .map((res: Response) => res.json())
  //     .subscribe((res: LogColumn[]) => {
  //       this._tableColumns.next(res);
  //     });
  // }

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
      .map((res: Response) => res.json())
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
