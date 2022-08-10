import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { SearchSetting } from '../models/SearchSetting';
import { ErrorService } from './errorService';
import { ConfigService } from './config.service';
import { LogColumn } from '../models/LogColumn';

@Injectable({ providedIn: 'root' })
export class MonitorService {
  // public _initContentURL = this.configService.getApiUrl() + '/monitor/init'; // URL to subcategories api
  public _initTableColumnsURL = this.configService.getApiUrl() + '/monitor/tableColumns'; // URL to subcategories api
  public _monitor = this.configService.getApiUrl() + '/calculate/monitor'; // URL to graph api

  constructor(private http: HttpClient, public errorService: ErrorService, private configService: ConfigService) { }



  public getData(searchSettings: SearchSetting, page: number): Observable<Object> {
    const body = { searchSetting: searchSettings, page: page };

    return this.http
      .post(this._monitor, body, this.getOptions())
      .map((res: Response) => res);

  }


  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }
}
