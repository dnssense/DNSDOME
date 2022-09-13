
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { CategoryV2 } from '../models/CategoryV2';
import { ApplicationV2 } from '../models/ApplicationV2';

@Injectable({
  providedIn: 'root'
})
export class StaticService {

  private categoryListURL = this.config.getApiUrl() + '/static/category';
  private applicationListURL = this.config.getApiUrl() + '/static/application';
  private mappingURL = this.config.getApiUrl() + '/static/category-mapping';

  constructor(private http: HttpClient, private config: ConfigService) { }

  getCategoryList(): Observable<CategoryV2[]> {
    return this.http.get<CategoryV2[]>(this.categoryListURL).pipe(map(res => res));
  }

  getApplicationList(): Observable<ApplicationV2[]> {
    return this.http.get<ApplicationV2[]>(this.applicationListURL).pipe(map(res => res));
  }

  getCategoryMapping(): Observable<{ [index: string]: string[] }> {
    return this.http.get<{[index: string]: string[]}>(this.mappingURL).pipe(map(res => res));
  }
}
