import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';
// import { SmsInformation } from 'src/app/core/models/SmsInformation';
import { RestPreloginResponse, RestPreloginSmsResponse } from 'src/app/core/models/RestServiceModels';
import { SignupBean } from 'src/app/core/models/SignupBean';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SmsService } from 'src/app/core/services/smsService';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { environment } from 'src/environments/environment';


declare var $: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login-cmp',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.sass'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  twoFactorPhoneClone: any;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private element: ElementRef,
    private notification: NotificationService,
    private smsService: SmsService,
    private capthaService: CaptchaService,
    private configService: ConfigService,
    private staticMessageService: StaticMessageService
  ) {
    this.isFailed = false;

    if (element) {
      this.nativeElement = element.nativeElement;
    }

    this.sidebarVisible = false;
    this.host = this.configService.host;
    this.captcha_key = this.host.captcha_key;
  }

  environment = environment;
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
  @ViewChild(RecaptchaComponent) captchaComponent: RecaptchaComponent;
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
  isConfirmTimeEnded = true;
  maxRequest = 3;
  host: ConfigHost;
  isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);

  private smsInformation: RestPreloginSmsResponse;

  notificationIndex = 0;

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      'email': [null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      'password': ['', [Validators.required, Validators.minLength(5)]]
    });
  }


  ngAfterViewInit(): void {
    // this.captchaComponent.reset()
    // this.captchaComponent.ngOnInit();
  }



  login() {
    if (this.loginForm.valid) {
      this.isFailed = false;

      this.authService.prelogin(this.email, this.password).subscribe(
        val => {
          if (val.user.isTwoFactorAuthentication) {
            this.open2FA(val);
          } else {
            this.authService.login(this.email, this.password).subscribe(val => {
              // this.router.navigateByUrl('/admin/dashboard');
              this.router.navigateByUrl('admin/deployment/roaming-clients');
            });
          }
        },
        (err) => {
          this.isFailed = true;
        }
      );
    } else {
      this.notification.warning(this.staticMessageService.pleaseFillRequirementFields);
      return;
    }
  }

  emailValidationLogin(e) {
    if (e) {
      this.email = String(e).toLowerCase();
    }
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
      this.twoFactorPhoneClone = val.user.gsm.substring(0, 5) + this.replaceStar(val.user.gsm.substring(5, 11)) + val.user.gsm.substring(11);
      this.smsInformation = res;
      this.maxRequest = 3;
      this.isConfirmTimeEnded = false;
      this.endTime = new Date();
      this.endTime.setMinutes(new Date().getMinutes() + 2);

    });

  }

  private replaceStar(val: string): string {
    let letter = '';
    for (let i = 0; i < val.length; i++) {
      letter += '*';
    }

    return letter;
  }

  confirm2FACode() {
    if (this.maxRequest != 0 && !this.isConfirmTimeEnded) {
      this.maxRequest = this.maxRequest - 1;
      if (this.smsInformation !== null) {

        this.smsService.confirmSmsForLogin(this.smsInformation, this.smsCode).subscribe(res => {
          this.notification.info('Sms confirmed');
          this.authService.login(this.email, this.password, res.code).subscribe(res2 => {

            this.router.navigateByUrl('/admin/dashboard');
          });

        }, err => {
          if (this.maxRequest === 0) {
            this.openLogin();
            this.notification.error('You have exceeded the number of attempts! Try Again!');

          } else if (err && err.error && err.error.status == 400) {

            this.notification.error(this.staticMessageService.pleaseEnterSmsCodeMessage);

          } else {
            this.notification.error(err.statusText);
          }
        });
      }
    }
  }
  timeEnd() {
    if (this.notificationIndex < 1) {
      this.notification.error('SMS Code Expired. Please Try Again.');
      this.isConfirmTimeEnded = true;
      this.openLogin();
      $('#twoFactorDiv').slideUp(400);
      this.notificationIndex++;
    }

  }

  handleCaptcha($event) {

    this.captcha = $event;
  }

  sendPasswordActivationCode() {
    if (!this.capthaService.validCaptcha(this.captcha)) {
      this.notification.warning(this.staticMessageService.captchaIsNotValid);
      return;
    }

    if (!this.validEmailLogin || !this.forgoterEmail) {
      this.notification.warning(this.staticMessageService.pleaseEnterAValidEmail);
      return;
    }
    if (this.validEmailLogin) {
      const forgoter: SignupBean = new SignupBean();
      forgoter.username = this.forgoterEmail;


      forgoter.c_answer = this.captcha;


      this.authService.forgotPassword(forgoter).subscribe(res => {

        this.notification.success(this.staticMessageService.passwordResetLinkSendedPleaseCheckYourEmail);
        this.router.navigateByUrl('/login');
        this.openLogin();
        this.captchaComponent.reset();

      });
    }
  }


}
