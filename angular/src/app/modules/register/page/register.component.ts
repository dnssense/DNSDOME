import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder } from '@angular/forms';
import { ConfigService } from 'src/app/core/services/config.service';
import * as countryList from "src/app/core/models/Countries";
import * as phoneNumberCodesList from "src/app/core/models/PhoneNumberCodes";
import { SignupBean } from 'src/app/core/models/SignupBean';
import { ValidationService } from 'src/app/core/services/validation.service';
import { Company } from 'src/app/core/models/Company';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import { AccountService } from 'src/app/core/services/AccountService';


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
  private message: string;
  private status: number = null;
  private privacyPolicy: boolean = false;
  private smsMessageActive: boolean = false;
  private countries = countryList.countries;
  public phoneNumberCodes = phoneNumberCodesList.phoneNumberCodes;
  private captcha: string;
  public captcha_key: string = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";// TODO: environment.API_CAPTCHA_KEY; servis tarafındaki key ile eşleşmeli
  @ViewChild(ReCaptchaComponent) captchaComponent: ReCaptchaComponent;
  private company: string = 'dnssense';
  private companyLogo: string = 'dnssense_logo_small.png';

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  validEmailRegister: true | false;
  validPasswordRegister: true | false;
  private usageType: boolean = true;

  constructor(private formBuilder: FormBuilder, private element: ElementRef, private config: ConfigService,
    private accountService: AccountService, private notification: NotificationService) {
    this.isFailed = false;
    this.sidebarVisible = false;

    this.createRegisterForm();

  }

  createRegisterForm() {
    const number = `[0-9]+`;

    this.registerForm =
      this.formBuilder.group({
        "username": ["", [Validators.required, ValidationService.emailValidator]],
        "name": ["", [Validators.required, Validators.minLength(2)]],
        "surname": ["", [Validators.required, Validators.minLength(2)]],
        "gsmCode": ["", [Validators.required]],
        "gsm": ["", [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(number)]],
        "password": ["", [Validators.required, Validators.minLength(6)]],
        "passwordAgain": ["", [Validators.required, Validators.minLength(6)]],
        "company": ["", []],
        "webSite": ["", []],
        "industry": ["", []],
        "personnelCount": ["", []],
        "usageType": ["", [Validators.required]]
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

  onSelectionChange(type: string) {
    this.user.usageType = type;
    if (type === "Business Account") {
      $("#companyInfoDiv").show(500);
      const site = `(http(s)?://)?([\\w-]+\\.)+[\\w-]+(/[\\w- ;,./?%&=]*)?`;
      this.registerForm.controls["webSite"].setValidators([Validators.required, Validators.pattern(site)]);
      this.registerForm.controls["webSite"].updateValueAndValidity();

      this.registerForm.controls["industry"].setValidators(Validators.required);
      this.registerForm.controls["industry"].updateValueAndValidity();

      this.registerForm.controls["personnelCount"].setValidators(Validators.required);
      this.registerForm.controls["personnelCount"].updateValueAndValidity();

      this.registerForm.controls["company"].setValidators(Validators.required);
      this.registerForm.controls["company"].updateValueAndValidity();

    } else {
      $("#companyInfoDiv").hide(400);
      this.registerForm.controls["webSite"].clearValidators();
      this.registerForm.controls["webSite"].updateValueAndValidity();

      this.registerForm.controls["industry"].clearAsyncValidators();
      this.registerForm.controls["industry"].updateValueAndValidity();

      this.registerForm.controls["personnelCount"].clearValidators();
      this.registerForm.controls["personnelCount"].updateValueAndValidity();

      this.registerForm.controls["company"].clearValidators();
      this.registerForm.controls["company"].updateValueAndValidity();
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

  handleCaptcha($event) {
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
    console.log(`Resolved captcha with response ${captchaResponse}:`);
  }

  pPolicy() {
    this.privacyPolicy = this.privacyPolicy === true ? false : true;
  }

  register() {

    if (!CaptchaService.validCaptcha(this.captcha)) {
      return;
    } else {
      this.user.c_answer = this.captcha;
    }

    if (this.user != null && this.registerForm.dirty && this.registerForm.valid && this.privacyPolicy) {
      this.accountService.signup(this.user).subscribe(res => {
        if (res.status == 200) {
          this.notification.success(res.message);
        } else {
          this.notification.error(res.message);
        }
      });
    }

  }


}
