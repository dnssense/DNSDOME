import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/User';
import { CookieService } from './cookie.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  loginUrl:string;

  constructor(private configuration:ConfigService,private http:HttpClient,private cookie:CookieService) { 
    
    this.loginUrl=this.configuration.getApiUrl()+"/login";
  }

  authenticate(email:string,pass:string):Observable<User>{
    
    return this.http.post<User>(this.loginUrl,{email:email,password:pass})
  }
}
