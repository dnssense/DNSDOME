import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, interval, Subject } from 'rxjs';
import { User } from '../models/User';
import { CookieService } from './cookie.service';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Session } from '../models/Session';
import { LoggerService } from './logger.service';
import { JwtHelper } from 'angular2-jwt';
import { SignupBean } from '../models/SignupBean';
import { OperationResult } from '../models/OperationResult';
import { Role, RestRole, RestRight, RestUserRoleRight } from '../models/Role';
import { Clearance } from '../models/Clearance';
import { RestPreloginResponse, RestUser } from '../models/RestServiceModels';
import { SpinnerService } from './spinner.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private STORAGENAME = 'currentSession';
  private _forgotPasswordSendURL = this.configuration.getApiUrl() + '/user/forgot/password';
  private _forgotPasswordChangeURL = this.configuration.getApiUrl() + '/user/forgot/password/confirm';
  private loginUrl = this.configuration.getApiUrl() + '/oauth/token';
  private refreshTokenUrl = this.loginUrl; // this.configuration.getApiUrl() + '/oauth/refresh_token';
  private userInfoUrl = this.configuration.getApiUrl() + '/user/current/'; // buranin sonuna bilerek / eklendi,spinner service ekraninda gozukmesin diye
  private userRoleUrl = this.configuration.getApiUrl() + '/user/current/role';
  private preloginUrl = this.configuration.getApiUrl() + '/user/prelogin';

  currentSession: Session;
  private jwtHelper: JwtHelper = new JwtHelper();
  private refreshTokenTimer: Observable<any>;
  currentUserPropertiesChanged: Subject<any>;

  constructor(
    private configuration: ConfigService,
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private spinner: SpinnerService
  ) {
    this.currentUserPropertiesChanged = new Subject();
    this.refreshTokenTimer = interval(3 * 60 * 1000);
    this.refreshTokenTimer.subscribe(() => { this.refreshToken(); });
  }

  saveSession() {
    localStorage.setItem(this.STORAGENAME, JSON.stringify(this.currentSession));
    this.currentUserPropertiesChanged.next('changed');
  }

   checkSessionIsValid() {
    try {
      const sessionString = localStorage.getItem(this.STORAGENAME);
      if (sessionString) {
        const session: Session = JSON.parse(sessionString);
        if (session) {
          this.currentSession = session;
          this.refreshToken();
        }
      }
    } catch (err) {

      // this.logger.console(err);
      this.logout();
    }

  }

   isCurrentSessionValid(): boolean {
    try {
      const sessionString = localStorage.getItem(this.STORAGENAME);
      if (sessionString) {
        const session: Session = JSON.parse(sessionString);
        if (session) {
          return true;
        }
      }
    } catch (err) {
      return false;
    }
  }

  refreshToken() {
    if (!this.currentSession || !this.currentSession.refreshToken) {
      return;
    }
    // this.logger.console('refreshing token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic aWYgeW91IHNlZSBtZTppIHNlZSB5b3UgYWxzbw'
      })
    };
    // const body = encodeURI('grant_type=refresh_token&refresh_token=' + this.currentSession.refreshToken);

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', this.currentSession.refreshToken);

    this.http.post<Session>(this.refreshTokenUrl, body.toString(), httpOptions).subscribe((res: any) => {

      if (res && res.accessToken && res.refreshToken) {

        this.currentSession.token = res.accessToken;
        this.currentSession.refreshToken = res.refreshToken;
        this.getCurrentUser().subscribe(x => {

        });
        // this.logger.console(res.refreshToken);
        // this.logger.console(res.token);
      } else {

      }
    });

  }

  getCurrentUserRoles(): Observable<Session> {

    return this.http.get<RestUserRoleRight>(this.userRoleUrl).pipe(map((x: RestUserRoleRight) => {
      // TODO: buranın ciddi sorunları var.
      x.roles.forEach((y: RestRole) => {
        const role = new Role();
        role.name = y.name;
        y.rights.forEach((a: RestRight) => {
          const cleareance = new Clearance();
          cleareance.name = a.name;
          role.clearences = [];
          role.clearences.push(cleareance);
        });
        this.currentSession.currentUser.roles = role;

      });
      // localStorage.setItem(this.STORAGENAME, JSON.stringify(this.currentSession));
      this.saveSession();
      return this.currentSession;
    }));
  }

  getCurrentUser(): Observable<Session> {

    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.get<RestUser>(this.userInfoUrl, options)
      .pipe(
        mergeMap((res: RestUser) => {

          //    this.logger.console(res);

          const user = new User();
          user.companyId = Number(res.companyId);
          user.id = Number(res.id);
          user.username = res.username;
          user.active = Boolean(res.isActive);
          user.locked = Boolean(res.isLocked);
          user.name = res.name;
          if (!user.name) {
            user.name = user.username || '';
          }

          user.surname = '';

          user.twoFactorAuthentication = Boolean(res.isTwoFactorAuthentication);
          user.active = Boolean(res.isActive);
          user.language = res.language;
          user.gsmCode = res.gsmCode;
          user.gsm = res.gsm;
          user.usageType = 1;
          this.currentSession.currentUser = user;

          return this.getCurrentUserRoles();
        }));
  }

  prelogin(email: string, pass: string): Observable<RestPreloginResponse> {

    return this.http.
      post<RestPreloginResponse>(this.preloginUrl, { username: email, password: pass }, this.getHttpOptions())
      .map(res => {
        return res;
      });

  }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return httpOptions;
  }

  login(email: string, pass: string): Observable<Session> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic aWYgeW91IHNlZSBtZTppIHNlZSB5b3UgYWxzbw'
      })
    };

    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', email);
    body.set('password', pass);

    return this.http.post<Session>(this.loginUrl, body.toString(), httpOptions)
      .pipe(mergeMap((res: any) => {
        // this.logger.console(res);
        this.currentSession = new Session();
        this.currentSession.token = res.accessToken;
        this.currentSession.refreshToken = res.refreshToken;
        return this.getCurrentUser();
      }), catchError(err => {
        this.currentSession = null;
        throw err;
      }));
  }

  loginWithToken(token: string, refToken: string): Observable<Session> {
    if (token && refToken) {
      this.currentSession = new Session();
      this.currentSession.token = token;
      this.currentSession.refreshToken = refToken;
      return this.getCurrentUser();
    }

    return null;

  }

  clear() {
    this.currentSession = null;
    localStorage.clear();
    this.cookieService.clear();
  }

  logout() {
    this.clear();
    this.router.navigateByUrl('/login');
  }

  forgotPassword(signupBean: SignupBean): Observable<OperationResult> {
    return this.http.post<OperationResult>(this._forgotPasswordSendURL, signupBean, this.getHttpOptions())
      .map(res => res);
  }

  forgotPasswordConfirm(key: string, password: string, passwordAgain: string): Observable<OperationResult> {
    return this.http.post<any>(this._forgotPasswordChangeURL,
      JSON.stringify({ key: key, password: password, passwordAgain: passwordAgain }), this.getHttpOptions());

  }

  getCurrentSession(): Session {
    const sessionString = localStorage.getItem(this.STORAGENAME);
    if (sessionString) {
      const session: Session = JSON.parse(sessionString);
      if (session) {
        return session;
      }
    }
    return null;
  }


}
