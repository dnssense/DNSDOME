import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OperationResult } from '../models/OperationResult';
import { Box } from '../models/Box';
import { ConfigService } from './config.service';
import { CategoryQuery } from '../models/CategoryQuery';
import { AuthenticationService } from './authentication.service';
import { Session } from '../models/Session';


@Injectable({ providedIn: 'root' })
export class ToolsService {
  private _reputationURL = this.config.getApiUrl() + '/tools/category/';
  private _categorizationURL = this.config.getApiUrl() + '/categorize/truefalse';

  constructor(private http: HttpClient, private config: ConfigService, private auth: AuthenticationService) {

  }

  searchCategory(d: string): Observable<CategoryQuery> {
    return this.http.get<any>(this._reputationURL + d).map(r => r);
  }

  sendCategoryRequest(domains: string[]): Observable<any> {
    if (domains && domains.length < 6) {
      const session = this.auth.getCurrentSession();

      if (session && session.currentUser && session.currentUser.username) {
        return this.http.post(this._categorizationURL, { domains: domains, emails: [session.currentUser.username] }).map(res => res);
      }
    }
  }


}


