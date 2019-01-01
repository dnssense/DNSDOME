import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { PasswordValidation } from './password-validator.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { CompileTemplateMetadata } from '@angular/compiler';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/User';
import { first } from 'rxjs/operators';

declare var $: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
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


  validEmailLogin: false;
  validPasswordLogin: false;
  matcher = new MyErrorStateMatcher();
  login: FormGroup;
  isFailed: boolean;
  email: string;
  password: string;

  constructor(private formBuilder: FormBuilder, private authService: AuthenticationService, private router: Router, private element: ElementRef) {
    this.isFailed = false;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
  }

  ngOnInit() {
    this.login = this.formBuilder.group({
      // To add a validator, we must first convert the string value into an array. The first item in the array
      // is the default value if any, then the next item in the array is the validator. Here we are adding a
      // required validator meaning that the firstName attribute must have a value in it.
      email: [null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      // We can use more than one validator per field. If we want to use more than one validator 
      // we have to wrap our array of validators with a Validators.compose function. Here we are using a required,
      // minimum length and maximum length validator.
      password: ['', Validators.required]
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

  authenticate() {
    this.authService.login(this.email, this.password).subscribe(
      val => {
           debugger;
        this.router.navigateByUrl('/admin');
      },
      (err) => {
         debugger;
        this.isFailed = true;
      }
    );

  }
  onLogin() {
    if (this.login.valid) {
      this.authenticate();
    } else {
      this.validateAllFormFields(this.login);
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




}
