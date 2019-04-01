import { Injectable } from "@angular/core";
import "rxjs/Rx";
import { Observable } from "rxjs/Rx";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OperationResult } from '../models/OperationResult';
import { ConfigService } from './config.service';
import { User } from '../models/User';
import { Role } from '../models/Role';

@Injectable({ providedIn: 'root' })
export class UserService {

  private _userListURL = this.config.getApiUrl() + '/services/users/user-list';
  private _userSaveURL = this.config.getApiUrl() + '/services/users/save';
  private _userDeleteURL = this.config.getApiUrl() + '/services/users/delete';
  private _roleListURL = this.config.getApiUrl() + '/services/roles/role-list';

  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public getUsers(): Observable<User[]> {
    return this.http.post<User[]>(this._userListURL, this.getOptions()).map(res => res);
  }

  public getRoles(): Observable<Role[]> {
    return this.http.post<Role[]>(this._roleListURL, this.getOptions()).map(res => res);
  }

  public save(user: User): Observable<OperationResult> {
    return this.http.post<OperationResult>(this._userSaveURL, JSON.stringify(user, null, ' '), this.getOptions()).map(res => res);
  }

  public delete(user: User): Observable<OperationResult> {
    return this.http.post<OperationResult>(this._userDeleteURL, JSON.stringify(user)).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    return options;
  }

}
