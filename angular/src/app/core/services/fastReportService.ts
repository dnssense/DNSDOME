import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/Rx';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { ConfigItem } from '../models/ConfigItem';
import { Dashboard } from '../models/Dashboard';
import { LogColumn } from '../models/LogColumn';
import { SearchSetting } from '../models/SearchSetting';
import { ErrorService } from './errorService';
import { ConfigService } from './config.service';
import { Config } from 'protractor';


@Injectable({ providedIn: 'root' })
export class FastReportService {


  public _histogramURL = this.configService.getApiUrl() + '/calculate/customreport/logcounthistogram'; // URL to graph api



  constructor(private http: HttpClient, private errorService: ErrorService, private configService: ConfigService) {
  //  this.initTableColumns();
  //  this.initFormData();
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
