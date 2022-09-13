
import {map} from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
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
  private getCompanyByIdURL = this.config.getApiUrl() + '/company/parent/company/'

  constructor(private http: HttpClient, private config: ConfigService) {
  }

  public getCompany(): Observable<Company[]> {
    return this.http.get<Company[]>(this.getCompanyURL).pipe(map(res => res));
  }

  public getCompanyById(id: string | number): Observable<Company> {
    let path = `${this.getCompanyByIdURL}${id}`
    return this.http.get<Company>(path).pipe(map(res => res))
  }

  public saveCompany(com: Company): Observable<OperationResult> {
    return this.http.put<OperationResult>(this.saveCompanyURL, com, this.getOptions()).pipe(map(res => res));
  }

  public updateCompanyWithParent(com: CompanyUpdaterDTO): Observable<any> {
    return this.http.put<any>(this.updaterCompanyURL, com, this.getOptions()).pipe(map(res=>res))
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }

}
