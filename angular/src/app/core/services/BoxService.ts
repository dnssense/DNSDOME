import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OperationResult } from '../models/OperationResult';
import { Box } from '../models/Box';
import { ConfigService } from './config.service';


@Injectable({ providedIn: 'root' })
export class BoxService {

  public _boxesListURL = this.config.getApiUrl() + '/myboxes/box-list';
  public _activeBoxesListURL = this.config.getApiUrl() + '/myboxes/active-box-list';
  public _appUserProfilesListURL = this.config.getApiUrl() + '/application-profiles/profile-list';
  public _domainProfilesListURL = this.config.getApiUrl() + '/domain-profiles/profile-list';
  public _boxDeleteURL = this.config.getApiUrl() + '/myboxes/delete';
  public _boxUpdateURL = this.config.getApiUrl() + '/myboxes/update';
  public _boxSaveURL = this.config.getApiUrl() + '/myboxes/save';

  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public getBoxes():Observable<Box[]> {
    return this.http.get<Box[]>(this._boxesListURL).map(res => res);
  }

  public getActiveBoxes(): Observable<Box[]> {
    return this.http.get<Box[]>(this._activeBoxesListURL).map(res => res);
  }

  public getAppUserProfiles() {
    return this.http.get(this._appUserProfilesListURL).subscribe(res => res);
  }

  public getDomainProfiles() {
    return this.http.get(this._domainProfilesListURL).subscribe(res => res);
  }

  public save(box: Box): Observable<OperationResult> {

    /*
     for (let ip of agent.agentIpGroups){
     ip.initIpBlocks();
     ip.ips=null;
     //todo . burda valuyu düzenlemen gerkeebilir..Burda agentip groups u basacaz...
     }
     */
    let body = JSON.stringify(box);

    return this.http.post<OperationResult>(this._boxSaveURL, body, this.getOptions()).map(res => res);
  }


  public delete(box: Box): Observable<OperationResult> {

    let body = JSON.stringify(box);

    return this.http.post<OperationResult>(this._boxDeleteURL, body, this.getOptions()).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf8', 'Accept': 'application/json' })
    }

    return options;
  }

}


