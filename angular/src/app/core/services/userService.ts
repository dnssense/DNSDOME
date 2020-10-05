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

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this._childUserListURL).map(res => {
      // sayfa tek role mantigi ile calisiyor
      return res.map(x => {
        if (x['roles'] && Array.isArray(x['roles']) && x['roles'].length) {
          x['role'] = x['roles'][0];
          delete x['roles'];
        }

        return x;
      });

    });
  }

  public getRoles(): Role[] {
    const roles: Role[] = [
      { id: 2, name: 'ROLE_CUSTOMER', description: 'Admin', clearences: null },
      { id: 5, name: 'ROLE_USER', description: 'User', clearences: null }];

    return roles;
  }

  public save(user: any): Observable<any> {
    // sayfa tek role mantigi ile calisiyor
    user.id = 0;
    user.roles = [user.role.name];
    delete user.role;
    return this.http.post<any>(this._userSaveURL, user, this.getOptions()).map(res => res);
  }

  public update(user: any): Observable<any> {
    // sayfa tek role mantigi ile calisiyor
    user.roles = [user.role.name];
    delete user.role;
    return this.http.put<any>(this._userUpdateURL, user, this.getOptions()).map(res => res);
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
