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
  public _profileListURL = this.config.getApiUrl() + '/application-profiles/profile-list';  // URL to graph api
  public _categoryListURL = this.config.getApiUrl() + '/application-profiles/category-list';  // URL to graph api
  public _saveProfiletURL = this.config.getApiUrl() + '/application-profiles/save';  // URL to graph api
  public _deleteProfiletURL = this.config.getApiUrl() + '/application-profiles/delete';  // URL to graph api


  public _categories: BehaviorSubject<WApplication[]> = new BehaviorSubject(null);
  public _profileList: BehaviorSubject<ApplicationProfile[]> = new BehaviorSubject(null);


  public http;

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
      // .catch((response: any, caught: any) => { 
      //   return Observable.throw(response);
      // });

  }


  public save(profile: ApplicationProfile) {

    let body = JSON.stringify(profile);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });


    return this.http.post(this._saveProfiletURL, body, options).map((res: Response) => res.json())
      .catch((response: any, caught: any) => { 
        return Observable.throw(response);
      });


  }

  public delete(profile: ApplicationProfile) {

    let body = JSON.stringify(profile);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });


    return this.http.post(this._deleteProfiletURL, body, options).map((res: Response) => res.json())
      .catch((response: any, caught: any) => { 
        return Observable.throw(response);
      });


  }


}
