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
  // public _initContentURL = this.configService.getApiUrl() + '/quick-reports/init'; // URL to subcategories api

  public _histogramURL = this.configService.getApiUrl() + '/calculate/customreport/logcounthistogram'; // URL to graph api




  // public _initTableColumnsURL = this.configService.getApiUrl() + '/quick-reports/tableColumns'; // URL to subcategories api

/*
  private _tableColumnsSubject: BehaviorSubject<LogColumn[]> = new BehaviorSubject(null);
  public tableColumns = this._tableColumnsSubject.asObservable();

  public _configItems: BehaviorSubject<ConfigItem[]> = new BehaviorSubject(
    null
  );
 */


  constructor(private http: HttpClient, private errorService: ErrorService, private configService: ConfigService) {
  //  this.initTableColumns();
  //  this.initFormData();
  }

  /* get configItems(): BehaviorSubject<ConfigItem[]> {
    return this._configItems;
  } */

   /* public initFormData() {
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
        this._tableColumnsSubject.next(logColumnArray);
      });
  } */





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
