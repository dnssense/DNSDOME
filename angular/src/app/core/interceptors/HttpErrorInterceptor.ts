import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';

import { SpinnerService } from '../services/spinner.service';
import { NotificationService } from '../services/notification.service';


@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private injector: Injector) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const notificationService = this.injector.get(NotificationService);
        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // console.log('event--->>>', event);
                }
                return event;
            }),
            catchError(err => {

                if (err.status === 401) {

                    if (window.location.href.indexOf('/register') >= 0 || window.location.href.indexOf('/login') >= 0 || window.location.href.indexOf('/forgot-password-confirm') >= 0) {

                    } else {
                        // auto logout if 401 response returned from api
                        this.authenticationService.logout();
                        if (window.location.href.indexOf('/login') === -1) { // reload if not login page
                            location.href = '/#/login';
                        }

                    }


                }

                throw err;
                // const error = err.error.message || err.statusText;
                // return throwError(error);
            }), finalize(() => {


            }));
    }
}
