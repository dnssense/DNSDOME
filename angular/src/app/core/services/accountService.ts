import { Injectable } from '@angular/core';
import { Observable ,  of} from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OperationResult } from '../models/OperationResult';
import { ConfigService } from './config.service';
import { RegisterUser } from '../models/SignupBean';
import { RestUserUpdateRequest, RestEmptyResponse } from '../models/RestServiceModels';
import { catchError, mergeMap, map } from 'rxjs/operators';
import { countries } from 'countries-list';
import { GeoLocation, GeoLocationService } from 'src/app/core/services/geoLocationService';


@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private _signupURL = this.config.getApiUrl() + '/user';
  private _accountActiveURL = this.config.getApiUrl() + '/user/confirm';
  private _updateAccountURL = this.config.getApiUrl() + '/user/current';
  private _savePasswordURL = this.config.getApiUrl() + '/user/current';
  /*   private _currentUserURL = this.config.getApiUrl() + '/user/current';
    private _currentUserRightsURL = this.config.getApiUrl() + '/user/current/role'; */


  constructor(private http: HttpClient, private config: ConfigService, private geoLocation: GeoLocationService) {
  }

  public update(user: RestUserUpdateRequest): Observable<RestEmptyResponse> {
    // return Observable.of({});

    return this.http.put<RestEmptyResponse>(this._updateAccountURL, user, this.getOptions());
  }

  public changePassword(oldPassword: string, newPassword: string): Observable<OperationResult> {
    return this.http.put<any>(this._savePasswordURL, {
      'oldPassword': oldPassword,
      'password': newPassword

    }, this.getOptions());
  }

  /*   public savePersonalSettings(user: User): Observable<OperationResult> {
      const body = JSON.stringify(user, null, ' ');
      return this.http.post<OperationResult>(this._savePersonalSettingURL, body, this.getOptions()).map(res => res);
    } */


  public signup(user: RegisterUser): Observable<any> {
    user.language = navigator.language;

    // eskiye uyumlu olsun diye böyle yazıldı
    if (user.language && user.language.indexOf('-') > 0) {
      user.language = user.language.slice(0, user.language.indexOf('-'));
    }

    return this.geoLocation.getCurrent().pipe(
      catchError(() => {
        return of(null);
      }),
      map((value: GeoLocation) => {
        if (value) {
          user.city = value.city;
          user.country = value.country_name;
          user.countryCode = value.country;
          user.timezone = value.timezone;
          user.ip = value.ip;
          if (user.countryCode && countries[user.countryCode]) {
            if (countries[user.countryCode].languages && countries[user.countryCode].languages.length > 0) {
              user.language = countries[user.countryCode].languages[0];
            }
          }
          // eskiye uyumlu olsun diye başına + konuldu
          if (user.gsmCode && user.gsmCode.indexOf('+') < 0) {
            user.gsmCode = '+' + user.gsmCode;
          }
        }

      }), mergeMap(() => {

        return this.http.post<any>(this._signupURL, user, this.getOptions());

      }));
  }

  activateAccount(accountActivateId: string, pass?: { password: string, passwordAgain: string }): Observable<any> {
    return this.http.post<any>(this._accountActiveURL, { key: accountActivateId, ...pass }, this.getOptions());
  }

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return options;
  }
}
