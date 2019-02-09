import { Response, Headers, RequestOptions } from "@angular/http";
import { Injectable } from "@angular/core";
import "rxjs/Rx";
import { ConfigItem } from "../models/ConfigItem";
import { SearchSetting } from "../models/SearchSetting";
import { Dashboard } from "../models/Dashboard";
import { Observable, BehaviorSubject, Subscription } from "rxjs/Rx";
import { Constants } from "../../Constants";
import { LogColumn } from "../models/LogColumn";
import { HttpClient } from '@angular/common/http';

/**
 * Created by fatih on 02.08.2016.
 * Edited by abdurrahman on 30.01.2019
 */

@Injectable()
export class FastReportService {

  public _initContentURL = Constants.getServerPath() + '/quick-reports/init';  // URL to subcategories api
  public _graphURL = Constants.getServerPath() + '/quick-reports/tableData';  // URL to graph api
  public _histogramURL = Constants.getServerPath() + '/quick-reports/logCountHistogram';  // URL to graph api
  public _dashboardHistogramURL = Constants.getServerPath() + '/quick-reports/dashboardHistogram';  // URL to graph api
  public _saveSearchSettingURL = Constants.getServerPath() + '/quick-reports/saveSearchSetting';  // URL to graph api
  public _savedSearchURL = Constants.getServerPath() + '/quick-reports/saved-search?';  // URL to graph api
  public _savedSearchListURL = Constants.getServerPath() + '/quick-reports/saved-search-list';  // URL to graph api
  public _initTableColumnsURL = Constants.getServerPath() + '/quick-reports/tableColumns';  // URL to subcategories api
  public _multiValueHistogramDataURL = Constants.getServerPath() + '/quick-reports/multiValueHistogramData';  // URL to graph api

  public _tableColumns: BehaviorSubject<LogColumn[]> = new BehaviorSubject(null);
  public _configItems: BehaviorSubject<ConfigItem[]> = new BehaviorSubject(null);

  public http;

  constructor(http: HttpClient) {
    this.http = http;
    this.initTableColumns();
    this.initFormData();

  }

  get tableColumns(): BehaviorSubject<LogColumn[]> {
    return this._tableColumns;
  }

  get configItems(): BehaviorSubject<ConfigItem[]> {
    return this._configItems;
  }


  public initFormData(): Observable<Object> {
    return this.http.get(this._initContentURL).map((res: Response) => res).subscribe((res: Object) => {
      this._configItems.next(res["configItems"]);
    });

  }


  public initTableColumns(): Observable<LogColumn[]> {
    return this.http.get(this._initTableColumnsURL).map((res: Response) => res).subscribe((res: LogColumn[]) => {
      this._tableColumns.next(res);
    });

  }


  public openSavedSearch(value: number): Observable<Object> {
    return this.http.post(this._savedSearchURL + "id=" + value).map((res: Response) => res)
      .catch((response: any, caught: any) => {
        //this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });

  }

  public listSavedSearchSettings(): Observable<Object> {
    return this.http.post(this._savedSearchListURL)
      .map((res: Response) => res)
      .catch((response: any, caught: any) => {
        //this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });

  }


  public getGraphData(configItem: ConfigItem, searchSettings: SearchSetting, maxItems: number): Observable<Object> {

    let cloneSetting = <SearchSetting>JSON.parse(JSON.stringify(searchSettings));
    cloneSetting.columns = configItem;
    cloneSetting.type = configItem.type;

    let body = JSON.stringify({ 'searchSetting': cloneSetting, "maxItems": maxItems });
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this._graphURL, { 'searchSetting': cloneSetting, "maxItems": maxItems })
      .map(res => res)
      .catch((response: any, caught: any) => {
        // this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });

  }

  public loadHistogram(searchSettings: SearchSetting): Observable<Object> {
    // let body = JSON.stringify({ 'searchSetting': searchSettings });
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    return this.http.post(this._histogramURL, { 'searchSetting': searchSettings })
      .map(res => res)
      .catch((response: any, caught: any) => {
        // this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }


  public getMultiValueHistogramData(searchSettings: SearchSetting, dashboard: Dashboard): Observable<Object> {
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });
    return this.http.post(this._multiValueHistogramDataURL + "?id=" +
      searchSettings.id + "&dashboardid=" + dashboard.id, "").map(res => res)
      .catch((response: any, caught: any) => {
        //  this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });

  }


  public loadDashbaordHistogram(searchSettings: SearchSetting): Observable<Object> {
    //let body = JSON.stringify({'searchSetting': searchSettings});
    //let headers = new Headers({'Content-Type': 'application/json'});
    // let options = new RequestOptions({headers: headers});
    debugger;

    return this.http.post(this._dashboardHistogramURL, { 'searchSetting': searchSettings })
      .map(res => {
        return res;
      })
      .catch((response: any, caught: any) => {
        return Observable.throw(response);
      });

  }


}
