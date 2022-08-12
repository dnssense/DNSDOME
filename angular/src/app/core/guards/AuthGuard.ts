import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad, Route, UrlSegment } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
    providedIn: 'root',
  })
export class AuthGuard implements CanActivate, CanLoad {

    constructor(private router: Router, private authService: AuthenticationService) { }

    canLoad(route: Route, segments: UrlSegment[]): boolean  {
        console.log('canLoad');
        const url = `/${route.path}`;
        return this.checkLogin(url);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log('canActivate');
        const url: string = state.url;
        return true;
    }

    checkLogin(url: string): boolean {
        if (this.authService.currentSession) {
            // logged in so return true
            return true;
        }
        console.log(`auth failed`);
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/'], { queryParams: { returnUrl: url }});
        return false; 
    }

}
