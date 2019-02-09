import { Injectable } from "@angular/core";
import { Response, Headers, RequestOptions } from "@angular/http";
import { SearchSetting } from "../models/SearchSetting";
import { Observable, BehaviorSubject } from "rxjs/Rx";
import { Constants } from "../../Constants";
import { Category } from "../models/Category";
import { WApplication } from "../models/WApplication";
import { HttpClient } from '@angular/common/http';

/**
 * Created by fatih on 02.08.2016.
 * Edited by abdurrahman on 30.01.2019
 */

@Injectable()
export class CustomReportService {

  public _initContentURL = Constants.getServerPath() + '/custom-reports/init';  // URL to subcategories api
  public _dataURL = Constants.getServerPath() + '/custom-reports/data';  // URL to graph api
  public _tableDataURL = Constants.getServerPath() + '/custom-reports/tableData';  // URL to graph api
  public _multiValueHistogramDataURL = Constants.getServerPath() + '/custom-reports/multiValueHistogramData';  // URL to graph api
  public _singleValueDataURL = Constants.getServerPath() + '/custom-reports/singleValue';  // URL to graph api
  public _applicationListURL = Constants.getServerPath() + '/custom-reports/application-list';  // URL to graph api
  public _categoryListURL = Constants.getServerPath() + '/custom-reports/category-list';  // URL to graph api
  public _dashboardHeaderURL = Constants.getServerPath() + '/custom-reports/dashboard-header';  // URL to graph api

  public http;

  public _categories: BehaviorSubject<Category[]> = new BehaviorSubject(null);
  public _applications: BehaviorSubject<WApplication[]> = new BehaviorSubject(null);

  constructor(http: HttpClient) {
    this.http = http;

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
debugger;
    return this.http.post(this._dataURL, { 'searchSetting': searchSettings })
      .map(res => {
        console.log("I am in getData: ");
        console.log( res);
        return res;
      })
      .catch((response: any, caught: any) => {
        return Observable.throw(response);
      });

  }

  public getTableData(searchSettings: SearchSetting): Observable<Object> {
    debugger;
    console.log(searchSettings);
    return this.http.post(this._tableDataURL, {'searchSetting': searchSettings }).map((res:Response)=> {return res;});
      // .map(res => {
      //   console.log("I am in getTableData: ")
      //   console.log(res);
      //   return res;
      // })
      // .catch((response: any, caught: any) => {
      //   return Observable.throw(response);
      // });
  }

  public singleValue(searchSettings: SearchSetting): Observable<Object> {

    return this.http.post(this._singleValueDataURL, { 'searchSetting': searchSettings }).map(res => {
      console.log(res);
      return res;
    })
      .catch((response: any, caught: any) => {
        return Observable.throw(response);
      });

  }

  public getApplicationList(): Observable<Object> {
    return this.http.post(this._applicationListURL).map((res: Response) => res).subscribe((res: WApplication[]) => {
      this._applications.next(res);
    });

  }

  public getCategorylist(): Observable<Category[]> {
    return this.http.post(this._categoryListURL).map((res: Response) => res).subscribe((res: Category[]) => {
      this._categories.next(res);
    });

  }

  save(content: SearchSetting): Observable<Object> {

    return this.http.post(this._initContentURL, content).map(res => res)
      .catch((response: any, caught: any) => {
        return Observable.throw(response);
      });
  }

  getDashboardHeaderSetting(setting: SearchSetting) {

    return this.http.post(this._dashboardHeaderURL, { 'searchSetting': setting }).map(res => {
      console.log(res);
      return res;
    })
      .catch((response: any, caught: any) => {
        return Observable.throw(response);
      });
  }
}
