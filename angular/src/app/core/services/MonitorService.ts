import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { Constants } from 'src/app/Constants';
import { SearchSetting } from '../models/SearchSetting';
import { ErrorService } from './ErrorService';

@Injectable({ providedIn: 'root' })
export class MonitorService {
  public _initContentURL = Constants.getServerPath() + '/monitor/init'; // URL to subcategories api
  public _initTableColumnsURL =
    Constants.getServerPath() + '/monitor/tableColumns'; // URL to subcategories api
  public _graphURL = Constants.getServerPath() + '/monitor/data'; // URL to graph api

  constructor(private http: HttpClient, public errorService: ErrorService) {}

  public initFormData() {
    return this.http
      .get(this._initContentURL)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public initTableColumns() {
    return this.http
      .get(this._initTableColumnsURL)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }

  public getGraphData(
    searchSettings: SearchSetting,
    page: number
  ): Observable<Object> {
    let body = JSON.stringify({ searchSetting: searchSettings, page: page });
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

  save(content: SearchSetting): Observable<Object> {
    let body = JSON.stringify(content);
    let headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = { headers: headers };

    return this.http
      .post(this._initContentURL, body, options)
      .map((res: Response) => res.json())
      .catch((response: any, caught: any) => {
        this.errorService.handleAuthenticatedError(response);
        return Observable.throw(response);
      });
  }
}
