import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorService } from './ErrorService';
import { Constants } from 'src/app/Constants';
import { Category } from '../models/Category';
import { WApplication } from '../models/WApplication';
import { SearchSetting } from '../models/SearchSetting';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({ providedIn: 'root' })
export class CustomReportService {
  public _initContentURL = Constants.getServerPath() + '/custom-reports/init'; // URL to subcategories api
  public _dataURL = Constants.getServerPath() + '/custom-reports/data'; // URL to graph api
  public _tableDataURL =
    Constants.getServerPath() + '/custom-reports/tableData'; // URL to graph api
  public _multiValueHistogramDataURL =
    Constants.getServerPath() + '/custom-reports/multiValueHistogramData'; // URL to graph api
  public _singleValueDataURL =
    Constants.getServerPath() + '/custom-reports/singleValue'; // URL to graph api
  public _applicationListURL =
    Constants.getServerPath() + '/custom-reports/application-list'; // URL to graph api
  public _categoryListURL =
    Constants.getServerPath() + '/custom-reports/category-list'; // URL to graph api
  public _dashboardHeaderURL =
    Constants.getServerPath() + '/custom-reports/dashboard-header'; // URL to graph api

  public _categories: BehaviorSubject<Category[]> = new BehaviorSubject(null);
  public _applications: BehaviorSubject<WApplication[]> = new BehaviorSubject(
    null
  );

  constructor(private http: HttpClient, private errorService: ErrorService) {
    // this.getCategorylist();
    // this.getApplicationList();
  }

  get applications(): BehaviorSubject<WApplication[]> {
    return this._applications;
  }

  get categories(): BehaviorSubject<Category[]> {
    return this._categories;
  }

  public getData(searchSettings: SearchSetting): Observable<Object> {
    let body = JSON.stringify({ searchSetting: searchSettings });
    return this.http
      .post(this._dataURL, body)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getTableData(searchSettings: SearchSetting): Observable<Object> {
    let body = JSON.stringify({ searchSetting: searchSettings });
    return this.http
      .post(this._tableDataURL, body)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public singleValue(searchSettings: SearchSetting): Observable<Object> {
    let body = JSON.stringify({ searchSetting: searchSettings });
    return this.http
      .post(this._singleValueDataURL, body)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  // public getApplicationList(): Observable<Object> {
  //   return this.http
  //     .post(this._applicationListURL)
  //     .map(res => res.json())
  //     .subscribe((res: WApplication[]) => {
  //       this._applications.next(res);
  //     });
  // }

  // public getCategorylist(): Observable<Category[]> {
  //   return this.http
  //     .post(this._categoryListURL)
  //     .map((res: Response) => res.json())
  //     .subscribe((res: Category[]) => {
  //       this._categories.next(res);
  //     });
  // }

  save(content: SearchSetting): Observable<Object> {
    let body = JSON.stringify(content);

    return this.http
      .post(this._initContentURL, body)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  getDashboardHeaderSetting(setting: SearchSetting) {
    let body = JSON.stringify({ searchSetting: setting });
    return this.http
      .post(this._dashboardHeaderURL, body)
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }
}
