import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { Constants } from 'src/app/Constants';
import { SearchSetting } from '../models/SearchSetting';
import { ErrorService } from './ErrorService';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class MonitorService {
  public _initContentURL = this.configService.getApiUrl() + '/services/monitor/init'; // URL to subcategories api
  public _initTableColumnsURL =
  this.configService.getApiUrl() + '/services/monitor/tableColumns'; // URL to subcategories api
  public _graphURL = this.configService.getApiUrl() + '/services/monitor/data'; // URL to graph api

  constructor(private http: HttpClient, public errorService: ErrorService,private configService:ConfigService) {}

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
