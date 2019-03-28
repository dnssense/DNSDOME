import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { BWList } from '../models/BWList';
import { OperationResult } from '../models/OperationResult';

@Injectable({ providedIn: 'root' })
export class BlackWhiteListService {

  private _bwlistDetailsURL = this.config.getApiUrl() + '/bwlist/get?id=';
  private _roleSaveURL = this.config.getApiUrl() + '/bwlist/save';
  private _roleListRL = this.config.getApiUrl() + '/bwlist/list';
  private _roleDeleteURL = this.config.getApiUrl() + '/bwlist/delete?id=';

  constructor(private http: HttpClient, private config: ConfigService) {
  }

  public getBwListDetails(profile: BWList): Observable<BWList> {
    return this.http.post<BWList>(this._bwlistDetailsURL + profile.id, this.getOptions()).map(res => res);
  }

  public getBwList(): Observable<BWList[]> {
    return this.http.post<BWList[]>(this._roleListRL, this.getOptions()).map(res => res);
  }

  public save(bwprofile: BWList): Observable<OperationResult> {
    let body = JSON.stringify(bwprofile);
    return this.http.post<OperationResult>(this._roleSaveURL, body).map(res => res);
  }

  public delete(bwprofile: BWList): Observable<OperationResult> {
    return this.http.post<OperationResult>(this._roleDeleteURL + bwprofile.id, this.getOptions()).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }

}
