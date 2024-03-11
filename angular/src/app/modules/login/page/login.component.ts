import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import {ActivatedRoute, Router} from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';
// import { SmsInformation } from 'src/app/core/models/SmsInformation';
import { RestPreloginResponse, RestPreloginSmsResponse } from 'src/app/core/models/RestServiceModels';
import { SignupBean } from 'src/app/core/models/SignupBean';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { SmsService } from 'src/app/core/services/smsService';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { environment } from 'src/environments/environment';
import { CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { RkNotificationService } from 'roksit-lib';


declare var $: any;
declare const VERSION: string;
declare const window: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
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
    private formBuilder: UntypedFormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private element: ElementRef,
    private notification: RkNotificationService,
    private smsService: SmsService,
    private capthaService: CaptchaService,
    private configService: ConfigService,
    private staticMessageService: StaticMessageService,
    private route: ActivatedRoute
  ) {
    this.isFailed = false;

    if (element) {
      this.nativeElement = element.nativeElement;
    }
    this.sidebarVisible = false;
    this.host = this.configService.host;
    this.captcha_key = this.host.captcha_key;
    this.jumpKey = this.route.snapshot.queryParams.code;
    this.version = this.getVersion();
  }

  environment = environment;
  version: string;
  test: Date = new Date();
  private toggleButton: any;
  private sidebarVisible: boolean;
  private nativeElement: Node;
  emailFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.email,
  ]);
  twoFactorFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.email,
  ]);
  @ViewChild('forgotPassCaptcha') forgotPassCaptchaComponent: RecaptchaComponent;
  @ViewChild('yandexForgotPassCaptchaContainer') yandexForgotPassCaptchaContainer!: ElementRef;
  forgotPassCaptcha: string;

  @ViewChild('loginCaptcha') loginCaptchaComponent: RecaptchaComponent;
  @ViewChild('yandexLoginCaptchaContainer') yandexLoginCaptchaContainer!: ElementRef;
  loginCaptcha: string;
  loginCaptchaRequired: boolean;

  countdownConfig: CountdownConfig;
  captcha_key: string;
  validEmailLogin: true | false;
  validPasswordLogin: true | false;
  matcher = new MyErrorStateMatcher();
  loginForm: UntypedFormGroup;
  isFailed: boolean;
  email: string;
  password: string;
  forgoterEmail: string;
  twoFactorPhone: string;
  smsCode: string;
  isConfirmTimeEnded = true;
  maxRequest = 3;
  host: ConfigHost;
  jumpKey: string
  isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);

  private smsInformation: RestPreloginSmsResponse;

  notificationIndex = 0;

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      'email': [null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      'password': ['', [Validators.required, Validators.minLength(5)]]
    });

    if (this.jumpKey) {
      this.authService.loginOauthCode(this.jumpKey).subscribe(value => {
        this.router.navigateByUrl('/admin/dashboard');
      })
    }
  }


  ngAfterViewInit(): void {
    // this.captchaComponent.reset()
    // this.captchaComponent.ngOnInit();
  }

  initLoginYandexCaptcha() {
    setTimeout(() => {
      if(this.yandexLoginCaptchaContainer.nativeElement && window.smartCaptcha) {
        (window.smartCaptcha)?.render(this.yandexLoginCaptchaContainer.nativeElement, {
          sitekey: this.host.captcha_key,
          hl: this.configService.getTranslationLanguage(),
         })
      }
    }, 0); 
  }

  initForgotPassYandexCaptcha() {
    setTimeout(() => {
      if(this.yandexForgotPassCaptchaContainer.nativeElement && window.smartCaptcha) {
        (window.smartCaptcha)?.render(this.yandexForgotPassCaptchaContainer.nativeElement, {
          sitekey: this.host.captcha_key,
          hl: this.configService.getTranslationLanguage(),
         })
      }
    }, 0); 
  }



  login() {
    if(this.loginCaptchaRequired) {
      if(this.host.captchaType === 'Yandex') {
        this.loginCaptcha =  (document.querySelector(".yandex-login input[data-testid='smart-token']") as HTMLInputElement)?.value || '';
      }
      if (!this.capthaService.validCaptcha(this.loginCaptcha)) {
        this.notification.warning(this.staticMessageService.captchaIsNotValid);
        return;
      }
    }
    if (this.loginForm.valid) {
      this.isFailed = false;

      this.authService.prelogin(this.email, this.password, this.loginCaptcha).subscribe(
        val => {
          if (val.user.isTwoFactorAuthentication) {
            this.open2FA(val);
          } else {
            this.authService.login(this.email, this.password).subscribe(val => {
              this.router.navigateByUrl('/admin/dashboard');
              //this.router.navigateByUrl('admin/deployment/roaming-clients');
            });
          }
          this.loginCaptchaRequired = false;
        },
        (err) => {
          this.loginCaptchaComponent?.reset();
          if (this.host.captchaType === 'Yandex'){
            this.initLoginYandexCaptcha();
          }
          if (err.status == 401)
            this.isFailed = true;
          else if(err?.error?.code === 'ErrRequireRecaptcha'){
            this.loginCaptchaRequired = true;
          }
          else
            throw err;
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
    if(this.host.captchaType === 'Yandex')
      this.initForgotPassYandexCaptcha();
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
      this.countdownConfig = {
        stopTime: new Date().getTime() + 1000 * 120
      };
    });

  }
  checkInput(keyEvent: KeyboardEvent) {
    if (keyEvent.key === 'Enter') {
      this.confirm2FACode()
    }
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
  timeEnd(e: CountdownEvent) {
    if (this.notificationIndex < 1 && e && e.action === 'done') {
      this.countdownConfig = undefined;
      this.notification.error('SMS Code Expired. Please Try Again.');
      this.isConfirmTimeEnded = true;
      this.openLogin();
      $('#twoFactorDiv').slideUp(400);
      this.notificationIndex++;
    }

  }

  handleLoginCaptcha($event) {

    this.loginCaptcha = $event;
  }

  handleForgotPassCaptcha($event) {

    this.forgotPassCaptcha = $event;
  }

  sendPasswordActivationCode() {
    if(this.host.captchaType === 'Yandex') {
      this.forgotPassCaptcha =  (document.querySelector(".yandex-forgot-pass input[data-testid='smart-token']") as HTMLInputElement)?.value || '';
    }
    if (!this.capthaService.validCaptcha(this.forgotPassCaptcha)) {
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


      forgoter.c_answer = this.forgotPassCaptcha;


      this.authService.forgotPassword(forgoter).subscribe(res => {

        this.notification.success(this.staticMessageService.passwordResetLinkSendedPleaseCheckYourEmail);
        this.router.navigateByUrl('/login');
        this.openLogin();
        this.forgotPassCaptchaComponent?.reset();
        if (this.host.captchaType === 'Yandex'){
          this.initForgotPassYandexCaptcha();
        }
      });
    }

  }

  getVersion = () => {
    let versionValue = '';
    try {
      const date = new Date(VERSION);
      versionValue = date.getFullYear().toString() + this.pad2(date.getMonth() + 1) + this.pad2( date.getDate()) + this.pad2( date.getHours() ) + this.pad2( date.getMinutes() ) + this.pad2( date.getSeconds());
    } catch (e) {}
    return versionValue;
  }

  pad2 = (n) => {
    return n < 10 ? '0' + n : n;
  }


}
