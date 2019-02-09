import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, interval } from 'rxjs';
import { User } from '../models/User';
import { CookieService } from './cookie.service';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Session } from '../models/Session';
import { LoggerService } from './logger.service';
import { AuthHttp, JwtHelper, tokenNotExpired } from 'angular2-jwt';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private STORAGENAME = 'currentSession';
  private loginUrl: string;
  private refreshTokenUrl: string;
  private logoutUrl: string;
  currentSession: Session;
  private jwtHelper: JwtHelper = new JwtHelper();
  private refreshTokenTimer: Observable<any>;

  constructor(private configuration: ConfigService, private http: HttpClient, private cookieService: CookieService, 
    private router: Router, private logger: LoggerService) {
    logger.console('constructor authenticationservice');
    this.loginUrl = this.configuration.getApiUrl() + '/auth/login';
    this.logoutUrl = this.configuration.getApiUrl() + '/auth/logout';
    this.refreshTokenUrl = this.configuration.getApiUrl() + '/auth/token';
    this.checkSessionIsValid();
    this.refreshTokenTimer = interval(3000 * 1000);
    this.refreshTokenTimer.subscribe(() => {
      this.refreshToken();
    });

  }

  checkSessionIsValid() {
    let sessionString = localStorage.getItem(this.STORAGENAME);
    if (sessionString) {
      let session: Session = JSON.parse(sessionString);
      if (session) {
        if (!this.jwtHelper.isTokenExpired(session.token)) {
          this.logger.console('token valid');
          this.currentSession = session;
         // this.logger.console(session.refreshToken);
         // this.logger.console(session.token);
        } else {
          this.http.post<any>(this.refreshTokenUrl, {}).subscribe((res: any) => {
           // debugger;
            if (res && res.token) {
              session.token = res.token;
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
  }

  refreshToken() {
    this.logger.console("refreshing token");
    this.http.post<any>(this.refreshTokenUrl, {}).subscribe((res: any) => {

      if (res && res.token) {
        this.currentSession.token = res.token;

        localStorage.setItem(this.STORAGENAME, JSON.stringify(this.currentSession));
        this.logger.console(res.refreshToken);
        this.logger.console(res.token);

      } else {

      }

    })

  }

  login(email: string, pass: string): Observable<Session> {

  //  this.loginUrl = 'https://management.dnssense.com/services/auth/login';
debugger;
    return this.http.post<Session>(this.loginUrl, { username: email, password: pass })
      .pipe(
        map(res => {
          this.logger.console(res);
          localStorage.setItem(this.STORAGENAME, JSON.stringify(res));
          this.currentSession = res;
          // this.logger.console(res.refreshToken);
          // this.logger.console(res.token);
          return res;
        }));
  }

  logout() {
    this.currentSession = null;
    localStorage.clear();
    this.cookieService.clear();
    this.router.navigateByUrl('/login');
  }
}
