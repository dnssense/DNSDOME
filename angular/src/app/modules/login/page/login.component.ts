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

declare var $: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
declare var $: any;

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
  @ViewChild(ReCaptchaComponent) captchaComponent: ReCaptchaComponent;
  captcha: string;
  captcha_key: string = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';// TODO: environment.API_CAPTCHA_KEY;
  validEmailLogin: true | false;
  validPasswordLogin: true | false;
  matcher = new MyErrorStateMatcher();
  loginForm: FormGroup;
  isFailed: boolean;
  email: string;
  password: string;
  forgoterEmail: string;

  constructor(private formBuilder: FormBuilder, private authService: AuthenticationService, private router: Router,
    private element: ElementRef, private notification: NotificationService) {
    this.isFailed = false;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      "email": [null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      "password": ['', Validators.required]
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

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      'has-error': this.isFieldValid(form, field),
      'has-feedback': this.isFieldValid(form, field)
    };
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.email, this.password).subscribe(
        val => {
          this.router.navigateByUrl('/admin/dashboard');
        },
        (err) => {
          this.isFailed = true;
        }
      );
    } else {
      this.validateAllFormFields(this.loginForm);
    }
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

  emailValidationLogin(e) {
    this.email = e;
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(e).toLowerCase())) {
      this.validEmailLogin = true;
    } else {
      this.validEmailLogin = false;
    }
  }

  passwordValidationLogin(e) {
    this.password = e;
    if (e.length > 5) {
      this.validPasswordLogin = true;
    } else {
      this.validPasswordLogin = false;
    }
  }

  openLogin() {
    $('#loginDiv').slideDown(300);
    $('#forgotPasswordDiv').slideUp(300);
  }

  openForgotPassword() {
    $('#loginDiv').slideUp(500);
    $('#forgotPasswordDiv').slideDown(500);
  }

  handleCaptcha($event) {
    this.captcha = $event;
  }

  sendActivationCode() {
    let forgoter: SignupBean = new SignupBean();
    forgoter.userName = this.forgoterEmail;

    if (!CaptchaService.validCaptcha(this.captcha) || !forgoter.userName) {
      return;
    } else {
      forgoter.c_answer = this.captcha;
    }

    this.authService.forgotPassword(forgoter).subscribe(res => {
      if (res.status == 200) {
        this.notification.success("Activation code sent your email." + res.message);
      } else {
        this.notification.error("Operation Failed! " + res.message);
      }
    });
  }


}
