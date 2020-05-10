import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OperationResult } from '../models/OperationResult';
// import { SmsInformation } from '../models/SmsInformation';
import { User } from '../models/User';
import { SmsType } from '../models/SmsType';
import { RestPreloginResponse, RestPreloginSmsResponse, RestPreloginSmsConfirmRequet, RestSmsResponse, RestSmsConfirmRequest } from '../models/RestServiceModels';
import { observable } from 'rxjs';



@Injectable({providedIn : 'root'})
export class SmsService {

  private _sendSmsActivationCodeURL = this.config.getApiUrl() + '/user/prelogin/current/sms';
  private _confirmURL = this.config.getApiUrl() + '/user/prelogin/current/sms/confirm';
  private _commonSendSmsUrl = this.config.getApiUrl() + '/user/current/sms';
  private _commonSendSmsConfirmUrl = this.config.getApiUrl() + '/user/current/sms/confirm';


  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public sendSmsForLogin(data: RestPreloginResponse): Observable<RestPreloginSmsResponse> {

    const body = JSON.stringify({prelogin: data.prelogin});
    return this.http.post<RestPreloginSmsResponse>(this._sendSmsActivationCodeURL, body, this.getOptions());
  }

  public confirmSmsForLogin(data: RestPreloginSmsResponse, code: string): Observable<any> {
    const request: RestPreloginSmsConfirmRequet = {prelogin: data.prelogin, smscode: data.smscode, code: code};
    return this.http.post<any>(this._confirmURL, JSON.stringify(request), this.getOptions());
  }

  public sendSmsCommon(phoneNumber: string): Observable<RestSmsResponse> {
    // return Observable.of({id: '123456'});
    return this.http.post<RestSmsResponse>(this._commonSendSmsUrl, {gsm: phoneNumber}, this.getOptions());
  }

  public confirmCommonSms(data: RestSmsConfirmRequest): Observable<any> {
    // return Observable.of({});
    return this.http.post<any>(this._commonSendSmsConfirmUrl, JSON.stringify(data), this.getOptions());
  }





  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }


}
