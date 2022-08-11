import { AfterContentInit, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Company } from 'src/app/core/models/Company';
import * as phoneNumberCodesList from 'src/app/core/models/PhoneNumberCodes';
import { RegisterUser, SignupBean } from 'src/app/core/models/SignupBean';
import { AccountService } from 'src/app/core/services/accountService';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { ValidationService } from 'src/app/core/services/validation.service';
import { GeoLocation, GeoLocationService } from '../../../core/services/geoLocationService';

import { catchError, tap, mergeMap, map } from 'rxjs/operators';
import { of } from 'rxjs';


declare var $: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.sass']
})
export class RegisterComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {

  constructor(
    private formBuilder: FormBuilder,
    private element: ElementRef,
    private accountService: AccountService,
    private capthaService: CaptchaService,
    private configService: ConfigService,
    private router: Router,
    private staticMessageService: StaticMessageService,
    private notification: NotificationService,
    private geolocation: GeoLocationService
  ) { }

  private toggleButton: any;
  private sidebarVisible: boolean;
  matcher = new MyErrorStateMatcher();
  isFailed: boolean;
  registerForm: FormGroup;
  public user: SignupBean;
  private privacyPolicy = false;
  private captcha: string;
  public host: ConfigHost;
  public captcha_key = '';
  @ViewChild(RecaptchaComponent) captchaComponent: RecaptchaComponent;
  phoneNumberCodes = phoneNumberCodesList.phoneNumberCodes;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  validEmailRegister: true | false;
  validPasswordRegister: true | false;
  campaignCode: string;
  title: string;
  pageMode = 'register';

  passStrength = 0;
  numStrength = false;
  upStrength = false;
  lowStrength = false;
  lengthStrength = false;

  ngOnInit() {
    document.body.style.backgroundColor = 'white';

    this.isFailed = false;
    this.sidebarVisible = false;
    this.host = this.configService.host;
    this.captcha_key = this.host.captcha_key;
    this.createRegisterForm();


  }

  ngAfterViewInit(): void {

    // this.captchaComponent.ngOnInit();
  }

  ngAfterContentInit() {
    // this.captchaComponent.reset();
  }

  createRegisterForm() {
    this.user = new SignupBean();
    this.user.company = new Company();
    this.user.company.name = '';

    this.registerForm =
      this.formBuilder.group({
        'username': ['', [Validators.required, ValidationService.emailValidator]],
        'password': ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
        'passwordAgain': ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
        'company': ['', [Validators.required]],
        'gsmCode': ['', []],
        'gsm': ['', []],
        'name': ['', [Validators.required]],
        'surname': ['', [Validators.required]]
      }, { validator: Validators.compose([ValidationService.matchingPasswords('password', 'passwordAgain')]) }
      );
    this.detectGSMCode().subscribe();

  }
  detectGSMCode() {
    return this.geolocation.getCurrent().pipe(
      catchError(() => {
        this.user.gsmCode = this.host.defaultGSMCode;
        this.registerForm.controls['gsmCode'].setValue(this.user.gsmCode);
        this.registerForm.controls['gsmCode'].updateValueAndValidity();
        return of(null);
      }),
      map((value: GeoLocation) => {


        this.user.gsmCode = value.country_calling_code || this.host.defaultGSMCode;
        this.registerForm.controls['gsmCode'].setValue(this.user.gsmCode);
        this.registerForm.controls['gsmCode'].updateValueAndValidity();
        return of(null);
      }))


  }

  sidebarToggle() {
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    // if (this.sidebarVisible === false) {
    //   setTimeout(function () {
    //     toggleButton.classList.add('toggled');
    //   }, 500);
    //   body.classList.add('nav-open');
    //   this.sidebarVisible = true;
    // } else {
    //   this.toggleButton.classList.remove('toggled');
    //   this.sidebarVisible = false;
    //   body.classList.remove('nav-open');
    // }
  }

  ngOnDestroy() {
    // const body = document.getElementsByTagName('body')[0];
    // body.classList.remove('register-page');
    // body.classList.remove('off-canvas-sidebar');
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
    if (e) {
      this.user.username = e.toLowerCase();
    }
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(e).toLowerCase())) {
      this.validEmailRegister = true;
    } else {
      this.validEmailRegister = false;
    }
  }

  checkisTelNumber(event: KeyboardEvent) {
    const allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    let isValid = false;

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
    if (this.user != null && this.registerForm.dirty && this.registerForm.valid && this.captcha != null && this.capthaService.validCaptcha(this.captcha)) {

      return true;
    }
    return false;
  }

  register() {
    if (!this.capthaService.validCaptcha(this.captcha)) {
      this.captchaComponent.reset();
      return;
    } else {
      this.user.c_answer = this.captcha;
      this.captchaComponent.reset();
      this.isRegisterFormValid();
    }

    // burasi
    if (!this.user.company.name) {
      this.notification.warning(this.staticMessageService.pleaseFillTheCompanyName);
      return;
    }
    if (!this.user.name) {
      this.notification.warning(this.staticMessageService.pleaseFillFirstName);
      return;
    }

    if (!this.user.surname) {
      this.notification.warning(this.staticMessageService.pleaseFillLastName);
      return;
    }


    if (!this.validEmailRegister) {
      this.notification.warning(this.staticMessageService.pleaseEnterAValidEmail);
      return;
    }



    if (!this.user.username) {
      this.notification.warning(this.staticMessageService.pleaseEnterAValidEmail);
      return;
    }

    if (!this.user.password) {
      this.notification.warning(this.staticMessageService.pleaseFillThePassword);
      return;
    }
    if (!this.user.passwordAgain) {
      this.notification.warning(this.staticMessageService.pleaseFillThePasswordAgain);
      return;
    }

    if (this.user.password != this.user.passwordAgain) {
      this.notification.warning(this.staticMessageService.passwordAndConfirmedPasswordAreNotSame);
      return;
    }

    if (this.passStrength != 4) {
      this.notification.warning(this.staticMessageService.passwordComplexityMustBe);
      return;
    }
    if (this.user != null && this.registerForm.dirty
      && this.registerForm.valid && this.user.password === this.user.passwordAgain) {

      const rUser: RegisterUser = {
        username: this.user.username,
        password: this.user.password,
        c_answer: this.user.c_answer
      };

      rUser.name = this.user.name + ' ' + this.user.surname;
      rUser.companyName = this.user.company.name;
      rUser.gsm = this.user.gsm;
      rUser.gsmCode = this.user.gsmCode;
      rUser.brand = this.host.brand;

      this.accountService.signup(rUser).subscribe(res => {
        this.pageMode = 'mailSent';
      });
    }

  }

  userGsmCodeChanged(code) {
    this.registerForm.controls['gsmCode'].setValue(code);
    this.registerForm.controls['gsmCode'].updateValueAndValidity();
    this.user.gsmCode = code;
  }
  checkPasswordStrength() {
    this.passStrength = 0;
    this.numStrength = false;
    this.upStrength = false;
    this.lowStrength = false;
    this.lengthStrength = false;

    if (this.user.password) {
      if (this.user.password.length > 7) {
        this.passStrength++;
        this.lengthStrength = true;
      }
      if (/[a-z]/.test(this.user.password)) {
        this.passStrength++;
        this.lowStrength = true;
      }
      if (/[A-Z]/.test(this.user.password)) {
        this.passStrength++;
        this.upStrength = true;
      }
      if (/[0-9]/.test(this.user.password)) {
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


}
