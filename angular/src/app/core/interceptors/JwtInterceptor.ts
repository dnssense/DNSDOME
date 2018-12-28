import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    /**
     *
     */
    constructor(private inject:Injector) {
        
        
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
         
        
        // add authorization header with jwt token if available
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
             
             request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
        }

        return next.handle(request);
	    
    }
}