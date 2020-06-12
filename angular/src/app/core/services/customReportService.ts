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

  public _dataURL = this.configService.getApiUrl() + '/calculate/customreport/topdomain'; //
  public _histogramURL = this.configService.getApiUrl() + '/calculate/customreport/logcounthistogram'; // URL to graph api

  constructor(private http: HttpClient, private errorService: ErrorService, private configService: ConfigService) {
  //  this.getCategorylist();
   // this.getApplicationList();
  }



  public getData(searchSettings: SearchSetting): Observable<Object> {
    const body = JSON.stringify({ searchSetting: searchSettings });
    return this.http
      .post(this._dataURL, body, this.getOptions())
      .map((res: Response) => res);

  }


  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }

  public loadHistogram(searchSettings: SearchSetting): Observable<Object> {
    const body = { searchSetting: searchSettings };
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http
      .post(this._histogramURL, body, options)
      .map((res: Response) => res);

  }

}
