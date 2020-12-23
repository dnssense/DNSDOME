import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(public auth: AuthenticationService, public router: Router) { }
    canActivate(route: ActivatedRouteSnapshot): boolean {

        const expectedRole = route.data.expectedRole;
        const roles: string[] = expectedRole.split(',');
        const ss = this.auth.currentSession;
        if (this.auth.isCurrentSessionValid() && ss && ss.currentUser
            && ss.currentUser.role && roles.includes(ss.currentUser.role.name)) {
            return true;
        } else {
            this.auth.logout();
            // console.log(`roleguard failed ${expectedRole} ${this.auth.isCurrentSessionValid()} ${JSON.stringify(ss)} `);
            //this.router.navigate(['login']);
            return false;
        }

    }
}
