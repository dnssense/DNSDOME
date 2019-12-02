import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { SmsService } from 'src/app/core/services/SmsService';
import { AccountService } from 'src/app/core/services/AccountService';
import { of } from 'rxjs';


@Component({
  selector: 'app-accountconfirm',
  templateUrl: 'accountconfirm.component.html'
})

export class AccountConfirmComponent implements OnInit, OnDestroy {
  host: ConfigHost;
  toggleButton: any;
  activated: number = 0;
  accountActivateId: string;
  /**
   *
   */
  constructor(private accountService: AccountService, private router: Router,
    private route: ActivatedRoute, private configService: ConfigService) {
    this.host = configService.host;


  }
  ngOnDestroy(): void {


  }
  ngOnInit() {
    // const navbar: HTMLElement = this.element.nativeElement;
    // this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    // const body = document.getElementsByTagName('body')[0];
    // body.classList.add('register-page');
    // body.classList.add('off-canvas-sidebar');
    // const card = document.getElementsByClassName('card')[0];
    // setTimeout(function () {
    //   // after 1000 ms we add the class animated to the login/register card
    //   card.classList.remove('card-hidden');
    // }, 700);
    this.accountActivateId = this.route.snapshot.queryParams.key;

    this.accountService.activateAccount(this.accountActivateId).subscribe(() => {
      this.activated = 1;
      // this.notification.success('Account activated');
      of(null).delay(2000).subscribe(() => {
        this.router.navigateByUrl('/login');
      })
    }, err => {
      this.activated = -1;
      throw err;
    });

  }













}
