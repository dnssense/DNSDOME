import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ProductLicenceServiceImpl} from '../../core/services/product-licence.service';
import {take} from 'rxjs/operators';
import {TranslateModule} from '@ngx-translate/core';
import {RkButtonV2Component} from 'roksit-lib';

@Component({
  selector: 'licence-activation',
  standalone: true,
  imports: [CommonModule, TranslateModule, RkButtonV2Component],
  templateUrl: './licence-activation.component.html',
  styleUrls: ['./licence-activation.component.sass']
})
export default class LicenceActivationComponent {
    key: string;
    productLicenceService = inject(ProductLicenceServiceImpl);
    state: 'activated' | 'error';
   constructor(private route: ActivatedRoute, private router: Router) {
     this.key = this.route?.snapshot?.queryParams?.key;
     if (this.key) {
       this.productLicenceService.activateLicence(this.key).pipe(take(1)).subscribe(data => {
         if (data?.status === 200) {
           this.state = 'activated';
         } else {
           this.state = 'error';
         }
       }, error => {
         this.state = 'error';
       });
     }
   }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }
}
