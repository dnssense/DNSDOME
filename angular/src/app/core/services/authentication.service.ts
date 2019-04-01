import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, interval } from 'rxjs';
import { User, RestUser } from '../models/User';
import { CookieService } from './cookie.service';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Session } from '../models/Session';
import { LoggerService } from './logger.service';
import { AuthHttp, JwtHelper, tokenNotExpired } from 'angular2-jwt';
import { SignupBean } from '../models/SignupBean';
import { OperationResult } from '../models/OperationResult';
import { Role, RestRole, RestRight, RestUserRoleRight } from '../models/Role';
import { Clearance } from '../models/Clearance';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private STORAGENAME = 'currentSession';
  private _forgotPasswordSendURL = this.configuration.getApiUrl() + "/services/forgotPasswordSend";
  private loginUrl = this.configuration.getApiUrl() + '/oauth/token';
  private refreshTokenUrl =this.loginUrl;// this.configuration.getApiUrl() + '/oauth/refresh_token';
  private userInfo = this.configuration.getApiUrl()+ '/user/current';
  private userRole = this.configuration.getApiUrl()+ '/user/current/role';

  currentSession: Session;
  private jwtHelper: JwtHelper = new JwtHelper();
  private refreshTokenTimer: Observable<any>;
  
  constructor(private configuration: ConfigService, private http: HttpClient, private cookieService: CookieService,
    private router: Router, private logger: LoggerService) {
      
    this.checkSessionIsValid();
    this.refreshTokenTimer = interval(150* 60* 1000);
    this.refreshTokenTimer.subscribe(() => {
      
      this.refreshToken();
    });

  }

  checkSessionIsValid() {
    
    try {
      let sessionString = localStorage.getItem(this.STORAGENAME);
      if (sessionString) {
        let session: Session = JSON.parse(sessionString);
        if (session) {
          if (!this.jwtHelper.isTokenExpired(session.token)) {
            this.logger.console('token valid');
            this.currentSession = session;
            //aslında adamı direk içeri alabiliriz fakat. şimdilik dışarı atalım
            this.clear();
          } else {
            const httpOptions = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic aWYgeW91IHNlZSBtZTppIHNlZSB5b3UgYWxzbw'
              })
            };
            let body = encodeURI("grant_type=refresh_token&refresh_token="+this.currentSession.refreshToken);
            this.http.post<Session>(this.refreshTokenUrl, body, httpOptions).subscribe((res: any) => {
              if (res && res.accessToken) {
                session.token = res.accessToken;
                session.refreshToken=res.refreshToken;
                this.currentSession = session;
                localStorage.setItem(this.STORAGENAME, JSON.stringify(this.currentSession));
                this.router.navigateByUrl('/admin');
              } else {

              }

            }, err => {
              //console yaz geç
              this.logger.console(err);
              this.logout();
            });

          }
        }
      }
    } catch (err) {
      this.logger.console(err);
      this.logout();
    }
  }

  refreshToken() {
    if(!this.currentSession ||  !this.currentSession.refreshToken)
    return;
    this.logger.console("refreshing token");
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic aWYgeW91IHNlZSBtZTppIHNlZSB5b3UgYWxzbw'
      })
    };
    let body =encodeURI("grant_type=refresh_token&refresh_token="+this.currentSession.refreshToken);
    this.http.post<Session>(this.refreshTokenUrl, body, httpOptions).subscribe((res: any) => {
      
      if (res && res.accessToken && res.refreshToken) {

        this.currentSession.token = res.accessToken;
        this.currentSession.refreshToken=res.refreshToken;
        localStorage.setItem(this.STORAGENAME, JSON.stringify(this.currentSession));
        this.logger.console(res.refreshToken);
        this.logger.console(res.token);
      } else {

      }
    });

  }

  getCurrentUserRoles():Observable<Session>{


    return this.http.get<RestUserRoleRight>(this.userRole).pipe(map((x:RestUserRoleRight)=>{
      
  
      
      //todo: buranın ciddi sorunları var.
      x.roles.forEach((y:RestRole)=>{
        let  role=new Role();
        role.name=y.name;
        y.rights.forEach((a:RestRight)=>{
          let cleareance=new Clearance();
          cleareance.name=a.name;
          role.clearences=[];
          role.clearences.push(cleareance);
        });
       this.currentSession.currentUser.roles=role;

      })
      localStorage.setItem(this.STORAGENAME, JSON.stringify(this.currentSession));
      return this.currentSession;
    }));
  }

  getCurrentUser(): Observable<Session> {
    
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.get<RestUser>(this.userInfo, options)
      .pipe(
        mergeMap((res: RestUser) => {
          
          
          this.logger.console(res);

          let user=new User();
          user.id=Number(res.id);
          user.userName=res.username;
          user.active=Boolean(res.isActive);
          user.locked=Boolean(res.isLocked);
          user.name=res.name;
          if(!user.name)
          user.name=user.userName||'';

          user.surname='';
          user.twoFactorAuthentication=Boolean(user.twoFactorAuthentication);
          user.language=res.language;
          user.gsmCode=res.gmsCode;
          user.gsm=res.gsm;
          
          this.currentSession.currentUser=user;


          return this.getCurrentUserRoles();
        }));
  }

  login(email: string, pass: string): Observable<Session> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic aWYgeW91IHNlZSBtZTppIHNlZSB5b3UgYWxzbw'
      })
    };
    let body = encodeURI("grant_type=password&username=" + email + "&password=" + pass);


    return this.http.post<Session>(this.loginUrl, body, httpOptions)
      .pipe(mergeMap((res: any) => {
        
        this.logger.console(res);

        
        this.currentSession=new Session();
        this.currentSession.token = res.accessToken;
        this.currentSession.refreshToken = res.refreshToken;
        return this.getCurrentUser();
      }),catchError(err=>{
        
        this.currentSession=null;
        throw err;
        
      }))
    

  }

  clear(){
    this.currentSession = null;
    localStorage.clear();
    this.cookieService.clear();
  }

  logout() {
    this.clear();
    this.router.navigateByUrl('/login');
  }

  forgotPassword(signupBean: SignupBean): Observable<OperationResult> {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<OperationResult>(this._forgotPasswordSendURL, JSON.stringify(signupBean, null, ' '), options)
      .map(res => res);
  }
}
