import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import { CaptchaService } from 'src/app/core/services/captcha.service';
import { SmsService } from 'src/app/core/services/SmsService';
import { ValidationService } from 'src/app/core/services/validation.service';


declare var $: any;

export interface ForgotPasswordModel {
  password?: string;
  passwordAgain?: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
  selector: 'app-forgotpasswordconfirm',
  templateUrl: 'forgotpasswordconfirm.component.html',
  styleUrls: ['forgotpasswordconfirm.component.sass']
})
export class ForgotPasswordConfirmComponent implements OnInit {
  host: ConfigHost;
  forgotPasswordConfirmForm: any;
  validPasswordLogin: true | false;
  model: ForgotPasswordModel = {};
  validPasswordRegister: true | false;
  private toggleButton: any;
  private captcha: string;
  private forgotId: string;
  public captcha_key: string;
  @ViewChild(ReCaptchaComponent, { static : false }) captchaComponent: ReCaptchaComponent;
  matcher = new MyErrorStateMatcher(); 

  constructor(private formBuilder: FormBuilder, private authService: AuthenticationService, private router: Router,
    private element: ElementRef, private notification: NotificationService,
    private capthaService: CaptchaService, private route: ActivatedRoute, private configService: ConfigService) {
    this.host = configService.host;
    this.captcha_key = this.host.captcha_key;
    this.forgotId = this.route.snapshot.queryParams.key;
    this.forgotPasswordConfirmForm =
      this.formBuilder.group({
        "password": ["", [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
        "passwordAgain": ["", [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]]
      }
        , { validator: Validators.compose([ValidationService.matchingPasswords("password", "passwordAgain")]) }
      );



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

  }


  isFormValid() {
    if (this.model != null && this.forgotPasswordConfirmForm.dirty
      && this.forgotPasswordConfirmForm.valid
      && this.captcha != null) {
      return true;
    }
    return false;
  }

  handleCaptcha($event) {
    this.captcha = $event;    
  }

  forgotPasswordConfirm() {
    if (!this.capthaService.validCaptcha(this.captcha)) {
      return;
    } else {
      //this.user.c_answer = this.captcha;
    }

    this.authService.forgotPasswordConfirm(this.forgotId, this.model.password, this.model.passwordAgain).subscribe(x => {
      this.router.navigateByUrl("/login");
    });
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
      }else{
        $('#passDetails').show(300);
      }
    }


  }

}
