import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';

import { SpinnerService } from '../services/spinner.service';



@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService,private injector:Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //debugger;
        
        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    
                    
                    
                     console.log('event--->>>', event);
                }
                return event;
            }),
            catchError(err => {
            
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout();
                location.reload(true);
            }
            
            throw err;
            //const error = err.error.message || err.statusText;
            //return throwError(error);
        }),finalize(()=>{
            

        }))
    }
}