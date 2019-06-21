import { Injectable } from "@angular/core";
import "rxjs/Rx";
import { SearchSetting } from "../models/SearchSetting";
import { Observable } from "rxjs/Rx";
import { Dashboard } from "../models/Dashboard";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { ElasticDashboardResponse } from '../models/ElasticDashboardResponse';
import { OperationResult } from '../models/OperationResult';

@Injectable({ providedIn: 'root' })
export class ReportService {

  public reportListURL = this.configuration.getApiUrl() + '/report/saved/list';
  public reportSaveURL = this.configuration.getApiUrl() + '/report/saved/save';
  public reportDeleteURL = this.configuration.getApiUrl() + '/report/saved/delete';

  constructor(private http: HttpClient, private configuration: ConfigService) {
  }

  public getReportList():Observable<any> {
    return this.http.get(this.reportListURL).map(res => res);
  }

  public saveReport(report: any): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.reportSaveURL, JSON.stringify(report), this.getOptions()).map(res => res);
  }

  public deleteReport(report: any): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.reportDeleteURL, JSON.stringify(report), this.getOptions()).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }

}
