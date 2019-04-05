import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { Messages } from 'src/app/core/messages';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { SignupBean } from 'src/app/core/models/SignupBean';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import { CaptchaService } from 'src/app/core/services/captcha.service';

import { environment } from 'src/environments/environment';
import { Session } from 'src/app/core/models/Session';
import { SmsService } from 'src/app/core/services/SmsService';
import { SmsType } from 'src/app/core/models/SmsType';
import { ValidationService } from 'src/app/core/services/validation.service';


declare var $: any;

export interface ForgotPasswordModel{
    password?:string;
    passwordAgain?:string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const isSubmitted = form && form.submitted;
      return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
  }


@Component({
    selector: 'app-forgotpasswordconfirm',
    templateUrl: 'forgotpasswordconfirm.component.html'
})

export class ForgotPasswordConfirmComponent implements OnInit, OnDestroy {
    host:ConfigHost;
    forgotPasswordConfirmForm:any;
    validPasswordLogin: true | false;
    model:ForgotPasswordModel={};
    validPasswordRegister: true | false;
    private toggleButton: any;
    private captcha: string;
    private forgotId:string;
    public captcha_key: string = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";// TODO: environment.API_CAPTCHA_KEY; servis tarafındaki key ile eşleşmeli
    @ViewChild(ReCaptchaComponent) captchaComponent: ReCaptchaComponent;
    /**
     *
     */
    constructor(private formBuilder: FormBuilder, private authService: AuthenticationService, private router: Router,
        private element: ElementRef, private notification: NotificationService,
        private smsService: SmsService, private capthaService: CaptchaService,private route:ActivatedRoute,private configService:ConfigService) {
            this.host=configService.host;
            this.forgotId=this.route.snapshot.queryParams.key;
            this.forgotPasswordConfirmForm  =
            this.formBuilder.group({
              "password": ["", [Validators.required, Validators.minLength(6)]],
              "passwordAgain": ["", [Validators.required, Validators.minLength(6)]]
            }
              , { validator: Validators.compose([ValidationService.matchingPasswords("password", "passwordAgain")]) }
            );



    }
    ngOnDestroy(): void {


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

      forgotPasswordConfirm(){
        this.authService.forgotPasswordConfirm(this.forgotId,this.model.password,this.model.passwordAgain).subscribe(x=>{
            this.router.navigateByUrl("/login");
        });
      }









}
