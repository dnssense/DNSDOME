import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder } from '@angular/forms';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';
import { SignupBean, RegisterUser } from 'src/app/core/models/SignupBean';
import { ValidationService } from 'src/app/core/services/validation.service';
import { Company } from 'src/app/core/models/Company';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import { AccountService } from 'src/app/core/services/AccountService';
import { Router } from '@angular/router';
import * as phoneNumberCodesList from "src/app/core/models/PhoneNumberCodes";
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
export class RegisterComponent implements OnInit, OnDestroy {
  private toggleButton: any;
  private sidebarVisible: boolean;
  matcher = new MyErrorStateMatcher();
  isFailed: boolean;
  registerForm: FormGroup;
  public user: SignupBean;
  private privacyPolicy: boolean = false;
  private captcha: string;
  public host: ConfigHost;
  public captcha_key: string = ""
  @ViewChild(ReCaptchaComponent) captchaComponent: ReCaptchaComponent;
  phoneNumberCodes = phoneNumberCodesList.phoneNumberCodes;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  validEmailRegister: true | false;
  validPasswordRegister: true | false;
  campaignCode: string;
  title: string;
  pageMode: string = 'register'

  constructor(private formBuilder: FormBuilder, private element: ElementRef, private accountService: AccountService,
    private capthaService: CaptchaService, private configService: ConfigService, private router: Router) { }

  ngOnInit() {
    document.body.style.backgroundColor = "white";

    this.isFailed = false;
    this.sidebarVisible = false;
    this.host = this.configService.host;
    this.captcha_key = this.host.captcha_key;
    this.createRegisterForm();

    // const navbar: HTMLElement = this.element.nativeElement;
    // this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    //const body = document.getElementsByTagName('body')[0];
    // body.classList.add('register-page');
    // body.classList.add('off-canvas-sidebar');
    // const card = document.getElementsByClassName('card')[0];
    // setTimeout(function () {
    //   // after 1000 ms we add the class animated to the login/register card
    //   card.classList.remove('card-hidden');
    // }, 700);

  }

  createRegisterForm() {
    this.user = new SignupBean();
    this.user.company = new Company();
    this.user.company.name = "";

    this.registerForm =
      this.formBuilder.group({
        "username": ["", [Validators.required, ValidationService.emailValidator]],
        "password": ["", [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
        "passwordAgain": ["", [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
        "company": ["", [Validators.required]],
        "gsmCode": ["", [Validators.required]],
        "gsm": ["", [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        "name": ["", [Validators.required]],
        "surname": ["", [Validators.required]]
      }, { validator: Validators.compose([ValidationService.matchingPasswords("password", "passwordAgain")]) }
      );


    if (this.host.brand == 'CyberCyte') {
      this.user.gsmCode = '+44';
      this.registerForm.controls['gsmCode'].setValue('+44');
      this.registerForm.controls['gsmCode'].updateValueAndValidity();
    } else {
      this.user.gsmCode = '+90';
      this.registerForm.controls['gsmCode'].setValue('+90');
      this.registerForm.controls['gsmCode'].updateValueAndValidity();
    }

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
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(e).toLowerCase())) {
      this.validEmailRegister = true;
    } else {
      this.validEmailRegister = false;
    }
  }
 
  checkisTelNumber(event: KeyboardEvent) {
    let allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "Backspace", "ArrowLeft", "ArrowRight", "Tab"];
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
    if (this.user != null && this.registerForm.dirty && this.registerForm.valid && this.captcha != null) {
      const ca = this.captchaComponent.getResponse();
      if (ca == this.captcha) {
        return true
      }
      return false;
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
      this.isRegisterFormValid()
    }
    

    if (this.user != null && this.registerForm.dirty
      && this.registerForm.valid && this.user.password === this.user.passwordAgain) {

      let rUser: RegisterUser = {
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
        this.pageMode = 'mailSent'
      });
    }

  }

  userGsmCodeChanged(code) {
    this.registerForm.controls['gsmCode'].setValue(code);
    this.registerForm.controls['gsmCode'].updateValueAndValidity();
    this.user.gsmCode = code
  }

  passStrength = 0;
  numStrength = false;
  upStrength = false;
  lowStrength = false;
  lengthStrength = false;
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
