import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import {catchError, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';
import {ConfigService} from '../services/config.service';
import * as moment from 'moment';
import {ProductLicenceService} from 'roksit-lib';

@Injectable({ providedIn: 'root' })
export class LicenceGuard  {
    constructor(
        public productLicence: ProductLicenceService,
        public router: Router,
        public authService: AuthenticationService,
        public configService: ConfigService) { }
    canMatch(route: ActivatedRouteSnapshot): Observable<boolean>|boolean {
        const productTypeCode = route.data.productTypeCode;
        const licenceTypeCode = route.data.licenceTypeCode;
        return this.productLicence.getCompanyLicence(productTypeCode).pipe(
          map((res) => {
            if (res && res.status === 200 && res.results && res.results.licenceType &&
                res.results.expiration && moment(res.results.expiration).toDate().getTime() > Date.now() &&
                res.results.licenceType.code >= licenceTypeCode) {
              return true;
            }
            const user = this.authService.currentSession?.currentUser;
            const gsmCodeTemp = user?.gsmCode || this.configService.host.defaultGSMCode;
            const phoneNumberTemp = user?.gsm;
            const fullName = user?.name + ' ' + user.surname;
            const email = user?.username || '';
            if (this.router.url === '/admin/product-licence') {
              this.router.navigate(['/admin', {}]).then(_ => {
                this.router.navigate(['/admin/product-licence'], {
                  state: {
                    companyLicenceData: res,
                    pageLicenceInfo: route.data,
                    personalInfo: {
                      gsmCode: gsmCodeTemp,
                      phoneNum: phoneNumberTemp,
                      fullName: fullName,
                      email: email
                    }
                  }
                });
              });
            } else {
              this.router.navigate(['/admin/product-licence'], {
                state: {
                  companyLicenceData: res,
                  pageLicenceInfo: route.data,
                  personalInfo: {
                    gsmCode: gsmCodeTemp,
                    phoneNum: phoneNumberTemp,
                    fullName: fullName,
                    email: email
                  }
                }
              });
            }
            return false;
          }),
          catchError( (err) => {
            if (this.router.url === '/admin/product-licence') {
              this.router.navigate(['/admin', {}]).then(_ => {
                this.router.navigate(['/admin/product-licence'], {state: {error: true}});
              });
            } else {
              this.router.navigate(['/admin/product-licence'], {state: {error: true}});
            }
            return of(false);
          }),
        );
    }
}
