import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Company, CompanyUpdaterDTO} from '../models/Company';
import { ConfigService } from './config.service';
import { OperationResult } from '../models/OperationResult';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private getCompanyURL = this.config.getApiUrl() + '/company';
  private saveCompanyURL = this.config.getApiUrl() + '/company';
  private updaterCompanyURL = this.config.getApiUrl() + '/company/parent'

  constructor(private http: HttpClient, private config: ConfigService) {
  }

  public getCompany(): Observable<Company[]> {
    return this.http.get<Company[]>(this.getCompanyURL).map(res => res);
  }

  public saveCompany(com: Company): Observable<OperationResult> {
    return this.http.put<OperationResult>(this.saveCompanyURL, com, this.getOptions()).map(res => res);
  }

  public updateCompanyWithParent(com: CompanyUpdaterDTO): Observable<any> {
    return this.http.put<any>(this.updaterCompanyURL, com, this.getOptions()).map(res=>res)
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }

}
