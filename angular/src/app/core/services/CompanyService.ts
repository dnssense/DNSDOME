import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Rx";
import "rxjs/add/operator/map";  
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Company } from '../models/Company';
import { ConfigService } from './config.service';
import { OperationResult } from '../models/OperationResult';
 
@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  public _customerURL = this.config.getApiUrl() + '/company/get';
  public _roleSaveURL = this.config.getApiUrl() + '/company/save';
  public _roleUpdateURL = this.config.getApiUrl() + '/company/update';
  public _roleDeleteURL = this.config.getApiUrl() + '/company/delete';

  constructor(private http: HttpClient, private config:ConfigService) {
    
  }

  public getCompany(): Observable<Company> {
    return this.http.get<Company>(this._customerURL).map(res => res);
  }

  public save(role: Company): Observable<OperationResult> {
    let body = JSON.stringify(role, null, ' ');

    return this.http.post<OperationResult>(this._roleSaveURL, body, this.getOptions()).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }

}
