
import {delay} from 'rxjs/operators';
import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { SmsService } from 'src/app/core/services/smsService';
import { AccountService } from 'src/app/core/services/accountService';
import { of } from 'rxjs';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../core/services/validation.service';

declare var $: any;

@Component({
  selector: 'app-accountconfirm',
  templateUrl: 'accountconfirm.component.html',
  styleUrls: ['accountconfirm.component.sass']
})

export class AccountConfirmComponent implements OnInit, OnDestroy {
  host: ConfigHost;
  toggleButton: any;
  activated = 0;
  accountActivateId: string;
  passwordMustChange: string;
  model: {password: string, passwordAgain: string} = {password: '', passwordAgain: ''};
  passwordConfirmForm: any;
  passStrength = 0;
  numStrength = false;
  upStrength = false;
  lowStrength = false;
  lengthStrength = false;
  captcha_key: string;
  private captcha: string;
  /**
   *
   */
  constructor(
      private accountService: AccountService,
      private router: Router,
      private route: ActivatedRoute,
      private configService: ConfigService,
      private formBuilder: UntypedFormBuilder,
      private captchaService: CaptchaService) {
    this.host = configService.host;
    this.captcha_key = this.host.captcha_key;
    this.passwordConfirmForm =
        this.formBuilder.group({
              'password': ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
              'passwordAgain': ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]]
            }
            , { validator: Validators.compose([ValidationService.matchingPasswords('password', 'passwordAgain')]) }
        );

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
    this.passwordMustChange = this.route.snapshot.queryParams.p;

    if (this.passwordMustChange !== '1') {
      this.accountService.activateAccount(this.accountActivateId).subscribe(() => {
        this.activated = 1;
        of(null).pipe(delay(2000)).subscribe(() => {
          this.router.navigateByUrl('/login');
        });
      }, err => {
        this.activated = -1;
        throw err;
      });
    }
  }



  activateWithPass() {
    if (!this.captchaService.validCaptcha(this.captcha)) {
      return;
    }
    this.accountService.activateAccount(this.accountActivateId, this.model).subscribe(() => {
      this.activated = 1;
      this.passwordMustChange = '';
      // this.notification.success('Account activated');
      of(null).pipe(delay(2000)).subscribe(() => {
        this.router.navigateByUrl('/login');
      });
    }, err => {
      this.activated = -1;
      throw err;
    });
  }

  checkPasswordStrength() {
    this.passStrength = 0;
    this.numStrength = false;
    this.upStrength = false;
    this.lowStrength = false;
    this.lengthStrength = false;

    if (this.model.password) {
      if (this.model.password.length > 7) {
        this.passStrength++;
        this.lengthStrength = true;
      }
      if (/[a-z]/.test(this.model.password)) {
        this.passStrength++;
        this.lowStrength = true;
      }
      if (/[A-Z]/.test(this.model.password)) {
        this.passStrength++;
        this.upStrength = true;
      }
      if (/[0-9]/.test(this.model.password)) {
        this.passStrength++;
        this.numStrength = true;
      }

      if (this.passStrength > 3) {
        $('#passDetails').hide(300);
      } else {
        $('#passDetails').show(300);
      }
    }
  }

  handleCaptcha($event) {
    this.captcha = $event;
  }

  isFormValid() {
    return this.model != null && this.passwordConfirmForm.dirty
        && this.passwordConfirmForm.valid
        && this.captcha != null;
  }
}
