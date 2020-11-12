import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { JwtHelper } from 'angular2-jwt';
import decodeJWT from 'jwt-decode';
import { interval, Observable, Subject } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Clearance } from '../models/Clearance';
import { OperationResult } from '../models/OperationResult';
import { RestPreloginResponse, RestUser } from '../models/RestServiceModels';
import { RestRight, RestRole, RestUserRoleRight, Role } from '../models/Role';
import { Session } from '../models/Session';
import { SignupBean } from '../models/SignupBean';
import { User } from '../models/User';
import { ConfigService } from './config.service';
import { CookieService } from './cookie.service';
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
  private userInfoUrl = this.configuration.getApiUrl() + '/user/current'; // buranin sonuna bilerek / eklendi,spinner service ekraninda gozukmesin diye
  private userRoleUrl = this.configuration.getApiUrl() + '/user/current/role';
  private preloginUrl = this.configuration.getApiUrl() + '/user/prelogin';

  public currentSession: Session;
  private jwtHelper: JwtHelper = new JwtHelper();
  private refreshTokenTimer: Observable<any>;
  currentUserPropertiesChanged: Subject<any>;
  clientId: 'if you see me';
  lastPing = new Date();
  constructor(
    private configuration: ConfigService,
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private spinner: SpinnerService,
    private idle: Idle, private keepalive: Keepalive
  ) {

    this.currentSession = this.getCurrentSession();

    this.currentUserPropertiesChanged = new Subject();
    this.refreshTokenTimer = interval(3 * 60 * 1000);
    // this.refreshTokenTimer = interval(15 * 1000);
    this.refreshTokenTimer.subscribe(() => { this.refreshToken(); });
    this.initIdle();
  }

  initIdle() {
    // sets an idle timeout of 10 minutes, for testing purposes.
    this.idle.setIdle(10 * 60);
    // sets a timeout period of 5 minutes. after 10 minutes of inactivity, the user will be considered timed out.
    this.idle.setTimeout(5 * 60);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    // this.idle.onIdleEnd.subscribe(() => console.log('no longer idle.'));
    this.idle.onTimeout.subscribe(() => {

      if (this.currentSession) {
        this.logout();
        console.log('session expired');
      }
    });
    // this.idle.onIdleStart.subscribe(() => console.log('your idle started'));
    // this.idle.onTimeoutWarning.subscribe((countdown) => this.idleState = 'You will time out in ' + countdown + ' seconds!');

    // sets the ping interval to 15 seconds
    this.keepalive.interval(15);

    this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

  }



  saveSession() {

    sessionStorage.setItem(this.STORAGENAME, JSON.stringify(this.currentSession));
    this.currentUserPropertiesChanged.next('changed');
  }

  getBasicAuthorization() {
    return btoa(this.clientId + ':i see you also');
  }

  checkSessionIsValid() {
    try {
      const sessionString = sessionStorage.getItem(this.STORAGENAME);
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
      const sessionString = sessionStorage.getItem(this.STORAGENAME);
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
        'Authorization': `Basic ${this.getBasicAuthorization()}`
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

      x.roles.forEach((y: RestRole) => {
        const role = new Role();
        role.name = y.name;
        y.rights.forEach((a: RestRight) => {
          const cleareance = new Clearance();
          cleareance.name = a.name;
          role.clearences = [];
          role.clearences.push(cleareance);
        });
        this.currentSession.currentUser.role = role;

      });
      // sessinStorage.setItem(this.STORAGENAME, JSON.stringify(this.currentSession));
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
          user.isGsmVerified = Boolean(res.isGsmVerified);
          user.active = Boolean(res.isActive);
          user.language = res.language;
          user.gsmCode = res.gsmCode;
          user.gsm = res.gsm;
          user.usageType = 1;

          const previousRoles = this.currentSession?.currentUser?.role;
          this.currentSession.currentUser = user;
          // burasi onemli once roles save edilmeli yoksa senkron sorunu olusur ve login ekrani calisir
          this.currentSession.currentUser.role = previousRoles;
          this.configuration.init(this.currentSession.currentUser.id);
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


  login(email: string, pass: string, code?: string): Observable<Session> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${this.getBasicAuthorization()}`
      })
    };


    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', email);
    body.set('password', pass);
    if (code) {
      body.set('code', code);
    }

    return this.http.post<Session>(this.loginUrl, body.toString(), httpOptions)
      .pipe(mergeMap((res: any) => {
        // this.logger.console(res);
        this.currentSession = new Session();
        this.currentSession.token = res.accessToken;
        this.currentSession.refreshToken = res.refreshToken;

        return this.getCurrentUser().pipe(x => {
          if (!this.idle.isRunning()) {
            console.log('starting idle');
            this.idle.watch();
          }

          return x;
        });
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
      const item = decodeJWT(this.currentSession.refreshToken) as any;
      const clientId = item?.client?.id;
      if (clientId) {
        this.clientId = clientId;
      }
      return this.getCurrentUser().pipe(x => {
        if (!this.idle.isRunning()) {
          this.idle.watch();
        }
        return x;
      });
    }

    return null;

  }

  clear() {

    this.currentSession = null;
    sessionStorage.removeItem(this.STORAGENAME);
    this.cookieService.clear();
    this.idle.stop();
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



  private getCurrentSession(): Session {
    const sessionString = sessionStorage.getItem(this.STORAGENAME);
    if (sessionString) {
      const session: Session = JSON.parse(sessionString);
      if (session) {
        return session;
      }
    }
    return null;
  }


}
