import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder } from '@angular/forms';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Router } from '@angular/router';
import { SignupBean } from 'src/app/core/models/SignupBean';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { environment } from 'src/environments/environment';
import { Session } from 'src/app/core/models/Session';
import { SmsService } from 'src/app/core/services/SmsService';
import { SmsType } from 'src/app/core/models/SmsType';
//import { SmsInformation } from 'src/app/core/models/SmsInformation';
import { RestPreloginResponse, RestPreloginSmsResponse } from 'src/app/core/models/RestServiceModels';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';

declare var $: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
} 

@Component({
  selector: 'app-login-cmp',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {

  test: Date = new Date();
  private toggleButton: any;
  private sidebarVisible: boolean;
  private nativeElement: Node;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  twoFactorFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  @ViewChild(ReCaptchaComponent) captchaComponent: ReCaptchaComponent;
  captcha: string;
  captcha_key: string;
  validEmailLogin: true | false;
  validPasswordLogin: true | false;
  matcher = new MyErrorStateMatcher();
  loginForm: FormGroup;
  isFailed: boolean;
  email: string;
  password: string;
  forgoterEmail: string;
  twoFactorPhone: string;
  smsCode: string;
  endTime: Date;
  isConfirmTimeEnded: boolean = true;
  maxRequest: number = 3;
  host: ConfigHost;
  isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)

  private smsInformation: RestPreloginSmsResponse;
  constructor(private formBuilder: FormBuilder, private authService: AuthenticationService, private router: Router,
    private element: ElementRef, private notification: NotificationService,
    private smsService: SmsService, private capthaService: CaptchaService, private configService: ConfigService) {
    this.isFailed = false;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    this.host = this.configService.host;
    this.captcha_key = this.host.captcha_key;
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      "email": [null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      "password": ['', [Validators.required, Validators.minLength(5)]]
    });
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];
    setTimeout(function () {
      // after 1000 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
  }

  sidebarToggle() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    const sidebar = document.getElementsByClassName('navbar-collapse')[0];
    if (this.sidebarVisible === false) {
      setTimeout(function () {
        toggleButton.classList.add('toggled');
      }, 500);
      body.classList.add('nav-open');
      this.sidebarVisible = true;
    } else {
      this.toggleButton.classList.remove('toggled');
      this.sidebarVisible = false;
      body.classList.remove('nav-open');
    }
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('login-page');
    body.classList.remove('off-canvas-sidebar');
  }

  login() {
    if (this.loginForm.valid) {

      this.authService.prelogin(this.email, this.password).subscribe(
        val => {
          if (val.user.isTwoFactorAuthentication) {
            this.open2FA(val);
          } else {
            this.authService.login(this.email, this.password).subscribe(val => {
              this.router.navigateByUrl('/admin/dashboard');
            })
          }
        },
        (err) => {
          this.isFailed = true;
        }
      );
    } else {
      return;
    }
  }

  emailValidationLogin(e) {
    this.email = e;
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(e).toLowerCase())) {
      this.validEmailLogin = true;
    } else {
      this.validEmailLogin = false;
    }
  }

  openLogin() {
    $('#loginDiv').slideDown(300);
    $('#forgotPasswordDiv').slideUp(300);
    $('#twoFactorDiv').hide();
  }

  openForgotPassword() {
    $('#loginDiv').slideUp(500);
    $('#forgotPasswordDiv').slideDown(500);
  }

  open2FA(val: RestPreloginResponse) {
    $('#twoFactorDiv').slideDown(500);
    $('#loginDiv').slideUp(500);
    $('#forgotPasswordDiv').hide();
    this.smsService.sendSmsForLogin(val).subscribe(res => {
      this.notificationIndex = 0;
      this.twoFactorPhone = val.user.gsm;
      this.smsInformation = res;
      this.maxRequest = 3;
      this.isConfirmTimeEnded = false;
      this.endTime = new Date();
      this.endTime.setMinutes(new Date().getMinutes() + 2);

    });

  }

  confirm2FACode() {
    if (this.maxRequest != 0 && !this.isConfirmTimeEnded) {
      this.maxRequest = this.maxRequest - 1;
      if (this.smsInformation !== null) {

        this.smsService.confirmSmsForLogin(this.smsInformation, this.smsCode).subscribe(res => {
          this.notification.info("Sms confirmed")
          this.authService.login(this.email, this.password).subscribe(res2 => {

            this.router.navigateByUrl("/admin/dashboard")
          })

        }, err => {
          if (this.maxRequest === 0) {
            this.openLogin()
            this.notification.error('You have exceeded the number of attempts! Try Again!');

          } else
            this.notification.error(err.statusText);

        });
      }
    }
  }

  notificationIndex = 0;
  timeEnd() {
    if (this.notificationIndex < 1) {
      this.notification.error('SMS Code Expired. Please Try Again.');
      this.isConfirmTimeEnded = true;
      this.openLogin();
      this.notificationIndex++;
    }

  }

  handleCaptcha($event) {
    this.captcha = $event;
  }

  sendPasswordActivationCode() {
    if (this.validEmailLogin) {
      let forgoter: SignupBean = new SignupBean();
      forgoter.username = this.forgoterEmail;

      if (!this.capthaService.validCaptcha(this.captcha) || !forgoter.username) {
        return;
      } else {
        forgoter.c_answer = this.captcha;
      }

      this.authService.forgotPassword(forgoter).subscribe(res => {

        this.notification.success("Activation code sent your email.");
        this.router.navigateByUrl('/login');

      });
    }
  }


}
