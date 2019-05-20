import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Company } from '../models/Company';
import { ConfigService } from './config.service';
import { OperationResult } from '../models/OperationResult';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private getCompanyURL = this.config.getApiUrl() + '/companies';
  private saveCompanyURL = this.config.getApiUrl() + '/companies/save';

  constructor(private http: HttpClient, private config: ConfigService) {
  }

  public getCompany(): Observable<Company[]> {
    return this.http.get<Company[]>(this.getCompanyURL).map(res => res);
  }

  public saveCompany(com: Company): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.saveCompanyURL, com, this.getOptions()).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }

}
