import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { OperationResult } from '../models/OperationResult';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { ConfigService } from './config.service';

export class Roles {
  static ITEMS = [{ id: 1, name: 'ROLE_ADMIN' }, { id: 2, name: 'ROLE_CUSTOMER' }, { id: 5, name: 'ROLE_USER' }];
  static ADMIN = 'ROLE_ADMIN';
  static CUSTOMER = 'ROLE_CUSTOMER';
  static USER = 'ROLE_USER';
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private _childUserListURL = this.config.getApiUrl() + '/user/current/childUser';
  private _userSaveURL = this.config.getApiUrl() + '/user/current/childUser';
  private _userUpdateURL = this.config.getApiUrl() + '/user/current/childUser';
  private _userDeleteURL = this.config.getApiUrl() + '/user/current/childUser/';

  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public getUsers(isApiKey = false): Observable<User[]> {
    let users = this.http.get<User[]>(this._childUserListURL).map(res => {

      // sayfa tek role mantigi ile calisiyor
      return res.map(x => {
        if (x['roles'] && Array.isArray(x['roles']) && x['roles'].length) {
          x['role'] = x['roles'][0];
          delete x['roles'];
        }

        return x;
      }).filter(x => {
        if (isApiKey && x.apikey)
          return true;
        else
          if (!isApiKey && !x.apikey)
            return true;
        return false;
      });

    });

    return users;
  }

  public getRoles(isApiKey = false): Role[] {
    if (!isApiKey) {
      const roles: Role[] = [
        { id: 2, name: 'ROLE_CUSTOMER', description: 'Admin', clearences: null },
        { id: 5, name: 'ROLE_USER', description: 'User', clearences: null }]

      return roles;
    } else {
      const roles: Role[] = [
        { id: 8, name: 'ROLE_APIADMIN', description: 'Admin', clearences: null },
        { id: 7, name: 'ROLE_API', description: 'User', clearences: null },
        { id: 6, name: 'ROLE_INTEGRATION', description: 'Integration', clearences: null },
        { id: 9, name: 'ROLE_REPUTATION', description: 'Reputation', clearences: null }];
      return roles;
    }
  }

  public save(user: any): Observable<any> {
    // sayfa tek role mantigi ile calisiyor
    const temp = JSON.parse(JSON.stringify(user));
    temp.id = 0;
    temp.roles = [user.role.name];
    delete temp.role;
    return this.http.post<any>(this._userSaveURL, temp, this.getOptions()).map(res => res);
  }

  public update(user: any): Observable<any> {
    // sayfa tek role mantigi ile calisiyor
    const temp = JSON.parse(JSON.stringify(user));
    temp.roles = [user.role.name];
    delete temp.role;
    return this.http.put<any>(this._userUpdateURL, temp, this.getOptions()).map(res => res);
  }

  public delete(user: User): Observable<OperationResult> {
    return this.http.delete<OperationResult>(this._userDeleteURL + user.id).map(res => res);
  }

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };


    return options;
  }

}
