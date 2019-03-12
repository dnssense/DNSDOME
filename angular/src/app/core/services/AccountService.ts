import { forwardRef, Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/User';
import { OperationResult } from '../models/OperationResult';
import { ConfigService } from './config.service';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  public _saveAccountURL = this.config.getApiUrl() + '/account/updateUser';
  public _savePasswordURL = this.config.getApiUrl() + '/account/savePassword';
  public _savePersonalSettingURL = this.config.getApiUrl() + '/account/savePersonalSetting';
  public _currentUserURL = this.config.getApiUrl() + '/account/currentUser';
  public _currentUserRightsURL = this.config.getApiUrl() + '/account/currentUserRights';


  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public save(user: User): Observable<OperationResult> {
    return this.http.post<OperationResult>(this._saveAccountURL, JSON.stringify(user, null, ' '), this.getOptions()).map(res => res);
  }

  public savePassword(oldPassword: string, newPassword: string, passwordAgain: string): Observable<OperationResult> {
    return this.http.post<OperationResult>(this._savePasswordURL, JSON.stringify({
      'oldPassword': oldPassword,
      'newPassword': newPassword,
      'passwordAgain': passwordAgain
    }), this.getOptions()).map(res => res);
  }

  public savePersonalSettings(user: User): Observable<OperationResult> {

    return this.http.post<OperationResult>(this._savePersonalSettingURL, JSON.stringify(user, null, ' '), this.getOptions()).map(res => res);
  }

  public getCurrentUser(): Observable<User> {
    return this.http.get<User>(this._currentUserURL).map(res => res);
  }

  public getCurrentUserRights(): Observable<User> {
    return this.http.get<User>(this._currentUserRightsURL).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    return options;
  }
}
