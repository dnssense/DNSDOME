import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(public auth: AuthenticationService, public router: Router) { }
    canActivate(route: ActivatedRouteSnapshot): boolean {

        const expectedRole = route.data.expectedRole;
        const roles: string[] = expectedRole.split(',');
        const ss = this.auth.currentSession;

        if (this.auth.isCurrentSessionValid() && ss && ss.currentUser
            && ss.currentUser.roles && roles.includes(ss.currentUser.roles.name)) {
            return true;
        } else {
            this.router.navigate(['login']);
            return false;
        }

    }
}
