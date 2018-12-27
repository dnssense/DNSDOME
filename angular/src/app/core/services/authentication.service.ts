import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/User';
import { CookieService } from './cookie.service';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  
  loginUrl:string;
  authenticatedUser:User;

  constructor(private configuration:ConfigService,private http:HttpClient,private cookieService:CookieService,private router:Router) { 
    
    console.log("constructor authenticationservice")
    this.loginUrl=this.configuration.getApiUrl()+"/login";
  }

  login(email:string,pass:string):Observable<User>{
   
    return this.http.post<User>(this.loginUrl,{email:email,password:pass})
    .pipe(map(user => {
      //debugger;
      // login successful if there's a jwt token in the response
      if (user && user.token) {
          this.authenticatedUser=user;
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
      }

      return user;
  }));

  /* ,catchError(err=>{
    debugger;
    throw err;}) */
  }
  

  logout(){
    localStorage.clear();
    this.cookieService.clear();
    this.router.navigateByUrl("/login");
  }
}
