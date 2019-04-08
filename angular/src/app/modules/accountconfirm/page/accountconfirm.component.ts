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
import { AccountService } from 'src/app/core/services/AccountService';
import { catchError, delay, map,mergeMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

declare var $: any;




@Component({
    selector: 'app-accountconfirm',
    templateUrl: 'accountconfirm.component.html'
})

export class AccountConfirmComponent implements OnInit, OnDestroy {
    host:ConfigHost;
    toggleButton:any;
    activated:number=0;
    accountActivateId:string;
    /**
     *
     */
    constructor(private accountService:AccountService, private authService: AuthenticationService, private router: Router,
        private element: ElementRef, private notification: NotificationService,
        private smsService: SmsService, private capthaService: CaptchaService,private route:ActivatedRoute,private configService:ConfigService) {
            this.host=configService.host;


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
        this.accountActivateId=this.route.snapshot.queryParams.key;

        this.accountService.activateAccount(this.accountActivateId).subscribe(x=>{

          this.activated=1;
          this.notification.success('Account activated');
          of(null).delay(2000).subscribe(x=>{
            this.router.navigateByUrl('/login');
          })

        },err=>{

          this.activated=-1;
          throw err;
        });

      }













}
