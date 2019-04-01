import {Injectable} from "@angular/core"; 
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import {Observable} from "rxjs/Rx"; 
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OperationResult } from '../models/OperationResult';
import { SmsInformation } from '../models/SmsInformation';
import { User } from '../models/User';
import { SmsType } from '../models/SmsType';
 


@Injectable({providedIn : 'root'})
export class SmsService {

  private _sendSmsActivationCodeURL = this.config.getApiUrl() + '/services/sms/sendSmsActivationCode';
  private _confirmURL = this.config.getApiUrl() + '/services/sms/confirm';


  constructor(private http: HttpClient, private config: ConfigService) {
    
  }

  public sendSmsActivationCode(user: User, smsType: SmsType): Observable<OperationResult> {
    let body = JSON.stringify({'user': user, 'smsType': smsType});
    return this.http.post<OperationResult>(this._sendSmsActivationCodeURL, body, this.getOptions()).map(res=> res);
  }

  public confirm(smsInformation: SmsInformation): Observable<OperationResult> {
    return this.http.post<OperationResult>(this._confirmURL, JSON.stringify(smsInformation), this.getOptions()).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json;' })
    }
    return options;
  }


}
