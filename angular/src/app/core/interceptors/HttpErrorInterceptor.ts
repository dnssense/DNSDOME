import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { interval, Observable, of, throwError } from 'rxjs';
import { catchError, map, finalize, retryWhen, delayWhen, scan } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { RkNotificationService, HelpSupportModel } from 'roksit-lib';
import { HttpErrorResponse } from '@angular/common/http';
import { HelpSupportServiceImpl } from '../services/help-support.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private injector: Injector, private helpSupportService: HelpSupportServiceImpl) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const notificationService = this.injector.get(RkNotificationService);
        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // console.log('event--->>>', event);
                }
                return event;
            }),
		   retryWhen(error => {
		                return error.pipe(delayWhen(err => (err.status >= 501 || !err.status == undefined) ? interval(1000) : of(err)), scan((count, currentErr) => {
		                    if (count >= 2 || (currentErr.status && currentErr.status < 501)) {
		                        throw currentErr;
		                    } else {
		                        return count += 1;
		                    }
                }, 0));
            }),

            catchError(err => {
                if (err.status === 401) {
                    if (window.location.href.indexOf('/register') >= 0 || window.location.href.indexOf('/login') >= 0 || window.location.href.indexOf('/forgot-password-confirm') >= 0  || window.location.href.indexOf('/account-created-parent') >= 0 || window.location.href.indexOf('/activate-licence') >= 0) {
                    } else {
                        // auto logout if 401 response returned from api
                        this.authenticationService.logout();
                        if (window.location.href.indexOf('/login') === -1) { // reload if not login page
                            location.href = '/#/login';
                        }
                    }

                }else if(err instanceof HttpErrorResponse && !request?.url?.endsWith('help-support')) {
                    const hsModel: HelpSupportModel  = {
                                                         autoError: {
                                                             code: err.status?.toString(),
                                                             subject: JSON.stringify(err),
                                                             details: request ? JSON.stringify(request): null 
                                                         }
                                                     };
                     this.helpSupportService.createTicket(hsModel, []).subscribe(() => {});
                 } 
                 if(request?.url?.endsWith('help-support')) {
                      throw {name: 'helpSupport'};
                 } else {
                    throw err;
                 }
                //throw err;
                // const error = err.error.message || err.statusText;
                // return throwError(err);
            }), finalize(() => {

            }));
    }
}