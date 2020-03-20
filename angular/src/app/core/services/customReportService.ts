import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorService } from './errorService';
import { Category } from '../models/Category';
import { WApplication } from '../models/WApplication';
import { SearchSetting } from '../models/SearchSetting';
import { ConfigService } from './config.service';
import { LogColumn } from '../models/LogColumn';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({ providedIn: 'root' })
export class CustomReportService {
  public _initContentURL = this.configService.getApiUrl() + '/custom-reports/init'; // URL to subcategories api
  public _dataURL = this.configService.getApiUrl() + '/custom-reports/data'; // URL to graph api
  public _tableDataURL =
    this.configService.getApiUrl() + '/custom-reports/tableData'; // URL to graph api
  public _multiValueHistogramDataURL =
    this.configService.getApiUrl() + '/custom-reports/multiValueHistogramData'; // URL to graph api
  public _singleValueDataURL =
    this.configService.getApiUrl() + '/custom-reports/singleValue'; // URL to graph api
  public _applicationListURL =
    this.configService.getApiUrl() + '/custom-reports/application-list'; // URL to graph api
  public _categoryListURL =
    this.configService.getApiUrl() + '/custom-reports/category-list'; // URL to graph api
  public _dashboardHeaderURL =
    this.configService.getApiUrl() + '/custom-reports/dashboard-header'; // URL to graph api

  public _initTableColumnsURL = this.configService.getApiUrl() + '/custom-reports/tableColumns'; // URL to subcategories api


  public _categories: BehaviorSubject<Category[]> = new BehaviorSubject(null);
  public _applications: BehaviorSubject<WApplication[]> = new BehaviorSubject(
    null
  );

  public initTableColumns(): Observable<LogColumn[]> {
    return this.http.post<LogColumn[]>(this._initTableColumnsURL, this.getOptions()).map(res => res);
  }

  constructor(private http: HttpClient, private errorService: ErrorService, private configService: ConfigService) {
    this.getCategorylist();
    this.getApplicationList();
  }

  get applications(): BehaviorSubject<WApplication[]> {
    return this._applications;
  }

  get categories(): BehaviorSubject<Category[]> {
    return this._categories;
  }

  public getData(searchSettings: SearchSetting): Observable<Object> {
    const body = JSON.stringify({ searchSetting: searchSettings });
    return this.http
      .post(this._dataURL, body, this.getOptions())
      .map((res: Response) => res)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getTableData(searchSettings: SearchSetting): Observable<Object> {
    const body = JSON.stringify({ searchSetting: searchSettings });
    return this.http
      .post(this._tableDataURL, body)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public singleValue(searchSettings: SearchSetting): Observable<Object> {
    const body = JSON.stringify({ searchSetting: searchSettings });
    return this.http
      .post(this._singleValueDataURL, body)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getApplicationList() {
    return this.http
      .post<WApplication[]>(this._applicationListURL, null)
      .map(response => response)
      .subscribe((applicationnArray: WApplication[]) => {
        this._applications.next(applicationnArray);
      });
  }

  public getCategorylist() {
    return this.http
      .post<Category[]>(this._categoryListURL, null)
      .map(response => response)
      .subscribe((categoryArray: Category[]) => {
        this._categories.next(categoryArray);
      });
  }

  save(content: SearchSetting): Observable<Object> {
    const body = JSON.stringify(content);

    return this.http
      .post(this._initContentURL, body)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  getDashboardHeaderSetting(setting: SearchSetting) {
    const body = JSON.stringify({ searchSetting: setting });
    return this.http
      .post(this._dashboardHeaderURL, body)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }
}
