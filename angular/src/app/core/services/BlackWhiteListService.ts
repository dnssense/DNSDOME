import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { BWList } from '../models/BWList';
import { OperationResult } from '../models/OperationResult';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({
  providedIn: 'root'
})
export class BlackWhiteListService {

  public _bwlistDetailsURL = this.config.getApiUrl() + '/bwlist/get?id=';
  public _roleSaveURL = this.config.getApiUrl() + '/bwlist/save';
  public _roleListRL = this.config.getApiUrl() + '/bwlist/list';
  public _roleDeleteURL = this.config.getApiUrl() + '/bwlist/delete?id=';

  public http;

  constructor(http: HttpClient, private config:ConfigService) {
    this.http = http;
  }

  public getBwListDetails(profile: BWList): Observable<BWList> {
    return this.http.post(this._bwlistDetailsURL + profile.id).map(res => res);
  }

  public getBwList(): Observable<BWList[]> {
    return this.http.post(this._roleListRL).map(res => res);
  }

  public save(bwprofile: BWList): Observable<OperationResult> {
    let body = JSON.stringify(bwprofile);
    return this.http.post(this._roleSaveURL, body).map(res => res);
  }

  public delete(bwprofile: BWList): Observable<OperationResult> {
    let body = JSON.stringify(bwprofile);

    return this.http.post(this._roleDeleteURL+bwprofile.id).map(res => res);
  }

}
