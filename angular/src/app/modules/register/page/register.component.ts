import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder } from '@angular/forms';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';
import { SignupBean } from 'src/app/core/models/SignupBean';
import { ValidationService } from 'src/app/core/services/validation.service';
import { Company } from 'src/app/core/models/Company';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import { AccountService } from 'src/app/core/services/AccountService';
import { Router } from '@angular/router';

declare var $: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit, OnDestroy {
  private toggleButton: any;
  private sidebarVisible: boolean;
  matcher = new MyErrorStateMatcher();
  isFailed: boolean;
  registerForm: FormGroup;
  public user: SignupBean;
  private privacyPolicy: boolean = false;
  private captcha: string;
  public host:ConfigHost;
  public captcha_key: string = "6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58";//"6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";// TODO: environment.API_CAPTCHA_KEY; servis tarafındaki key ile eşleşmeli
  @ViewChild(ReCaptchaComponent) captchaComponent: ReCaptchaComponent;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  validEmailRegister: true | false;
  validPasswordRegister: true | false;

  constructor(private formBuilder: FormBuilder, private element: ElementRef,
    private accountService: AccountService, private notification: NotificationService,
    private capthaService:CaptchaService,private configService:ConfigService,private router:Router) {
    this.isFailed = false;
    this.sidebarVisible = false;
      this.host=this.configService.host;
      this.captcha_key=this.host.captcha_key;
    this.createRegisterForm();

  }

  createRegisterForm() {
    const number = `[0-9]+`;

    this.registerForm =
      this.formBuilder.group({
        "username": ["", [Validators.required, ValidationService.emailValidator]],
        "password": ["", [Validators.required, Validators.minLength(6)]],
        "passwordAgain": ["", [Validators.required, Validators.minLength(6)]]
      }
        , { validator: Validators.compose([ValidationService.matchingPasswords("password", "passwordAgain")]) }
      );

    this.user = new SignupBean();
    this.user.company = new Company();
    this.user.company.name = " ";

  }

  ngOnInit() {
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('register-page');
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
    body.classList.remove('register-page');
    body.classList.remove('off-canvas-sidebar');
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  emailValidationRegister(e) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(e).toLowerCase())) {
      this.validEmailRegister = true;
    } else {
      this.validEmailRegister = false;
    }
  }

  passwordValidationRegister(e) {
    if (e.length > 5) {
      this.validPasswordRegister = true;
    } else {
      this.validPasswordRegister = false;
    }
  }

  checkisTelNumber(event: KeyboardEvent) {
    let allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "Backspace", "ArrowLeft", "ArrowRight"];
    let isValid: boolean = false;

    for (let i = 0; i < allowedChars.length; i++) {
      if (allowedChars[i] == event.key) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      event.preventDefault();
    }
  }

  handleCaptcha($event: string) {
    this.captcha = $event;
  }

  isRegisterFormValid() {
    if (this.user != null && this.registerForm.dirty && this.registerForm.valid
      && this.privacyPolicy && this.captcha != null) {
      return true;
    }
    return false;
  }

  resolved(captchaResponse: string) {
    //console.log(`Resolved captcha with response ${captchaResponse}:`);
  }

  pPolicy() {
    this.privacyPolicy = this.privacyPolicy === true ? false : true;
  }

  register() {

    if (!this.capthaService.validCaptcha(this.captcha)) {
      return;
    } else {
      this.user.c_answer = this.captcha;
    }

    if (this.user != null && this.registerForm.dirty
      && this.registerForm.valid && this.privacyPolicy
      && this.user.password===this.user.passwordAgain) {

      this.accountService.signup({username: this.user.userName, password: this.user.password}).subscribe(res => {

          this.notification.success("Registered successfuly, check your email and active your account");
          this.router.navigateByUrl('/login');

      });
    }

  }


}
