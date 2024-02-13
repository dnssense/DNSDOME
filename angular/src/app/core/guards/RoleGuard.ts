import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import {ConfigService} from '../services/config.service';


@Injectable({ providedIn: 'root' })
export class RoleGuard  {
    constructor(
        public auth: AuthenticationService,
        public router: Router,
        private configService: ConfigService) { }
    canActivate(route: ActivatedRouteSnapshot): boolean {

        const expectedRole = route.data.expectedRole;
        const roles: string[] = expectedRole.split(',');
        const ss = this.auth.currentSession;
        if (this.auth.isCurrentSessionValid() && ss && ss.currentUser
            && ss.currentUser.role && ss.currentUser.role.find(ur=>roles.includes(ur.name))//roles.includes(ss.currentUser.role.name)
            && !this.configService.host.hiddenMenus.includes(route.routeConfig.path)) {
            return true;
        } else {
            this.auth.logout();
            // console.log(`roleguard failed ${expectedRole} ${this.auth.isCurrentSessionValid()} ${JSON.stringify(ss)} `);
            // this.router.navigate(['login']);
            return false;
        }

    }
}
