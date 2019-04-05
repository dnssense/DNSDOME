import { forwardRef, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/User';
import { OperationResult } from '../models/OperationResult';
import { ConfigService } from './config.service';
import { SignupBean } from '../models/SignupBean';
import { RestUser,  RestUserUpdateRequest, RestEmptyResponse } from '../models/RestServiceModels';

/**
 * Created by fatih on 02.08.2016.
 */

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private _signupURL = this.config.getApiUrl() + '/services/signup';
  private _updateAccountURL = this.config.getApiUrl() + '/user/current';
  private _savePasswordURL = this.config.getApiUrl() + '/user/current';
  private _savePersonalSettingURL = this.config.getApiUrl() + '/services/account/savePersonalSetting';
/*   private _currentUserURL = this.config.getApiUrl() + '/user/current';
  private _currentUserRightsURL = this.config.getApiUrl() + '/user/current/role'; */


  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public update(user: RestUserUpdateRequest): Observable<RestEmptyResponse> {
    return this.http.put<RestEmptyResponse>(this._updateAccountURL, JSON.stringify(user), this.getOptions()).map(res => res);
  }

  public savePassword(oldPassword: string, newPassword: string): Observable<OperationResult> {
    return this.http.put<any>(this._savePasswordURL, JSON.stringify({
      'oldPassword': oldPassword,
      'password': newPassword

    }), this.getOptions()).map(res => res);
  }

  public savePersonalSettings(user: User): Observable<OperationResult> {
    const body = JSON.stringify(user, null, ' ');
    return this.http.post<OperationResult>(this._savePersonalSettingURL, body, this.getOptions()).map(res => res);
  }

 /*  public getCurrentUser(): Observable<User> {
    debugger;
    return this.http.get<RestUser>(this._currentUserURL).map(res =>{
      let user=new User();
      user.id=Number(res.id);
      user.userName=res.username;
      user.active=Boolean(res.isActive);
      user.locked=Boolean(res.isLocked);
      user.name=res.name;
      if(!user.name)
      user.name=user.userName||'';

      user.surname='';

      user.twoFactorAuthentication=Boolean(res.isTwoFactorAuthentication);
      user.active=Boolean(res.isActive);

      user.language=res.language;

      user.gsmCode=res.gsmCode;
      user.gsm=res.gsm;
      user.usageType=1;
      return user;

    });
  } */

 /*  public getCurrentUserRights(): Observable<User> {
    debugger;
    return this.http.get<User>(this._currentUserRightsURL).map(res => res);
  }
 */
  public signup(user: SignupBean): Observable<OperationResult> {
    return this.http.post<OperationResult>(this._signupURL, JSON.stringify(user, null, ' '), this.getOptions()).map(res => res);
  }

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return options;
  }
}
