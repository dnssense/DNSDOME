import {Response} from "@angular/http";
import {Injectable} from "@angular/core";
import "rxjs/Rx";
import {AuthHttp} from "angular2-jwt";
import {ErrorService} from "./ErrorService";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs/Rx";
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/Category';
import { DomainProfile } from '../models/DomainProfile';
import { ConfigService } from './config.service';


/**
 * Created by fatih on 02.08.2016.
 */


@Injectable({
  providedIn: 'root'
})
export class DomainProfilesService {
  public _profileListURL = this.config.getApiUrl() + "/services/domain-profiles/profile-list";  // URL to graph api
  public _categoryListURL = this.config.getApiUrl() + "/services/domain-profiles/category-list";  // URL to graph api
  public _saveProfiletURL = this.config.getApiUrl() + "/services/domain-profiles/save";  // URL to graph api
  public _deleteProfiletURL = this.config.getApiUrl() + "/services/domain-profiles/delete";  // URL to graph api

  public _categories: BehaviorSubject<Category[]> = new BehaviorSubject(null);
  public _profileList: BehaviorSubject<DomainProfile[]> = new BehaviorSubject(null);


  public http;

  constructor(http: HttpClient,private config: ConfigService) {
    this.http = http;
    this.getProfileList();
    this.getCategorylist();
  }

  public getProfileData() {
    return this.http.post(this._profileListURL).map(res => res);
  }

  get profileList(): BehaviorSubject<DomainProfile[]> {
    return this._profileList;
  }

  get categories(): BehaviorSubject<Category[]> {
    return this._categories;
  }

  public getCategorylist(): Observable<Category[]> {
    return this.http.post(this._categoryListURL).map(res => res).subscribe((res: Category[]) => {
      this._categories.next(res);
    });
  }

  public getProfileList(): Observable<Object> {
    return this.http.post(this._profileListURL).map(res => res).subscribe((res:DomainProfile[])=>{
      this._profileList.next(res);
    });

  }

  public getCategories() {
    return this.http.post(this._categoryListURL).map(res=> res);
  }

  public save(profile: DomainProfile) {
    let body = JSON.stringify(profile);
    return this.http.post(this._saveProfiletURL, body).map(res => res);
  }

  public delete(profile: DomainProfile) {
    let body = JSON.stringify(profile);
    return this.http.post(this._deleteProfiletURL, body).map(res => res);
  }

}
