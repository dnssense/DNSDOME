import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OperationResult } from '../models/OperationResult';
import { ConfigService } from './config.service';
import { User } from '../models/User';
import { Role } from '../models/Role';

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
    return this.http.get<User[]>(this._childUserListURL).map(res => res);
  }

  public getRoles(): Role[] {
    const roles: Role[] = [
      { id: 2, name: 'ROLE_CUSTOMER', description: 'Admin', clearences: null },
      { id: 5, name: 'ROLE_USER', description: 'User', clearences: null }];

    return roles;
  }

  public save(user: any): Observable<any> {
    return this.http.post<any>(this._userSaveURL, JSON.stringify(user, null, ' '), this.getOptions()).map(res => res);
  }

  public update(user: any): Observable<any> {
    return this.http.put<any>(this._userUpdateURL, JSON.stringify(user, null, ' '), this.getOptions()).map(res => res);
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
