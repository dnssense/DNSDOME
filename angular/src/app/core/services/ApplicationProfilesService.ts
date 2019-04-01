import { Injectable } from "@angular/core";
import { Response, Headers, RequestOptions } from "@angular/http";
import "rxjs/Rx";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs/Rx";
import { ConfigService } from './config.service';
import { WApplication } from '../models/WApplication';
import { ApplicationProfile } from '../models/ApplicationProfile';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApplicationProfilesService {
  private _profileListURL = this.config.getApiUrl() + '/services/application-profiles/profile-list';  // URL to graph api
  private _categoryListURL = this.config.getApiUrl() + '/services/application-profiles/category-list';  // URL to graph api
  private _saveProfiletURL = this.config.getApiUrl() + '/services/application-profiles/save';  // URL to graph api
  private _deleteProfiletURL = this.config.getApiUrl() + '/services/application-profiles/delete';  // URL to graph api

  private _categories: BehaviorSubject<WApplication[]> = new BehaviorSubject(null);
  private _profileList: BehaviorSubject<ApplicationProfile[]> = new BehaviorSubject(null);

  private http;

  constructor(http: HttpClient, private config: ConfigService) {
    this.http = http;

    this.getCategorylist();

    this.getProfileData().subscribe((res: ApplicationProfile[]) => {
      this._profileList.next(res);
    });
  }

  public getCategorylist(): Observable<WApplication[]> {
    return this.http.post(this._categoryListURL).map(res => res).subscribe((res: WApplication[]) => {
      this._categories.next(res);
    });

  }

  public getProfileData(): Observable<ApplicationProfile[]> {
    return this.http.post(this._profileListURL).map(res => res);      

  }

  get profileList(): BehaviorSubject<ApplicationProfile[]> {
    return this._profileList;
  }

  get categories(): BehaviorSubject<WApplication[]> {
    return this._categories;
  }

  public getCategories() {
    return this.http.post(this._categoryListURL).map(res=> res);
  }

  public save(profile: ApplicationProfile) {
    let body = JSON.stringify(profile);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this._saveProfiletURL, body, options).map(res => res);

  }

  public delete(profile: ApplicationProfile) {
    let body = JSON.stringify(profile);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this._deleteProfiletURL, body, options).map(res => res);
  }


}
