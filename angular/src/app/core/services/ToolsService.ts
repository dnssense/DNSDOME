import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OperationResult } from '../models/OperationResult';
import { Box } from '../models/Box';
import { ConfigService } from './config.service';
import { CategoryQuery } from '../models/CategoryQuery';


@Injectable({ providedIn: 'root' })
export class ToolsService {

  private _reputationURL = this.config.getApiUrl() + '/tools/category/'; // tools service acilinca oraya tasinacak

  constructor(private http: HttpClient, private config: ConfigService) {

  }

  searchCategory(d: string): Observable<CategoryQuery> {
    return this.http.get<any>(this._reputationURL + d).map(r => JSON.parse(r));
  }

}


