import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigService } from './config.service';
import { CategoryQuery } from '../models/CategoryQuery';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class ToolsService {

  private _reputationURL = this.config.getApiUrl() + '/tools/category/';
  private _categorizationURL = this.config.getApiUrl() + '/categorize/truefalseV2';

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private auth: AuthenticationService
  ) { }

  searchCategory(d: string): Observable<CategoryQuery> {



    return this.http.get<any>(this._reputationURL  + d).map(r => r);
  }
  searchCategories(domains: string[]): Observable<CategoryQuery[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      })
    };


    const body = new URLSearchParams();
    body.set('domains', domains.join(','));


    return this.http.post<any>(this._reputationURL , body.toString(), httpOptions).map(x => {

      return x.results;
    });


  }

  /* sendCategoryRequest(domains: string[]): Observable<any> {
    if (domains && domains.length < 6) {
      const session = this.auth.getCurrentSession();

      if (session && session.currentUser && session.currentUser.username) {
        return this.http.post(this._categorizationURL, { domains: domains, emails: [session.currentUser.username] }).map(res => res);
      }
    }
  } */

  sendCategoryRequestV2(request: Domain2CategorizeRequestV2): Observable<Domain2CategoriseResponseV2> {
    return this.http.post<Domain2CategoriseResponseV2>(this._categorizationURL, request).map(result => result);
  }
}

export interface Domain2CategorizeRequestV2 {
  domain: string;
  category: string;
  comment?: string;
}

export interface Domain2CategoriseItem {
  requestId: string;
  domain: string;
  category: string;
  categorySetted?: string;
  comment?: string;
  status: number;
  insertDate: string;
  doneDate?: string;
}

export interface Domain2CategoriseResponseV2 {
  items: Domain2CategoriseItem[];
}

