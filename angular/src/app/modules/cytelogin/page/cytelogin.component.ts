import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-cytelogin-cmp',
  templateUrl: 'cytelogin.component.html'
})
export class CyteLoginComponent {

  token: string;
  reftoken: string;

  constructor(private authService: AuthenticationService, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(p => {
      this.token = p['t'];
      this.reftoken = p['r'];
      this.login();
    });

  }

  login() {

    this.authService.loginWithToken(this.token, this.reftoken).subscribe(s => {
      if (s) {
        this.router.navigateByUrl('/admin/dashboard');
      } else {
        this.router.navigateByUrl('/');
      }

    });


  }



}

/* ne@cybercyte.com
Password12345
 */

 // run tusunu
