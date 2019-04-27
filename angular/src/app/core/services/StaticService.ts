import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { CategoryV2 } from '../models/CategoryV2';

@Injectable({
  providedIn: 'root'
})
export class StaticService {

  private categoryListURL = this.config.getApiUrl() + '/static/category';

  constructor(private http: HttpClient, private config: ConfigService) { }

  getCategoryList(): Observable<CategoryV2[]> {
    return this.http.get<CategoryV2[]>(this.categoryListURL).map(res => res);
  }
}
