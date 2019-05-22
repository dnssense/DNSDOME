import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
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

  constructor(private http: HttpClient, private config: ConfigService) { }

  getCategoryList(): Observable<CategoryV2[]> {
    return this.http.get<CategoryV2[]>(this.categoryListURL).map(res => res);
  }

  getApplicationList(): Observable<ApplicationV2[]> {
    return this.http.get<ApplicationV2[]>(this.applicationListURL).map(res => res);
  }
}
