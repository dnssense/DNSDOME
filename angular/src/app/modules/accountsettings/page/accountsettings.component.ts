import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ValidationService } from 'src/app/core/services/validation.service';
import * as phoneNumberCodesList from "src/app/core/models/PhoneNumberCodes";
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { User } from 'src/app/core/models/User';
import { Company } from 'src/app/core/models/Company';
import { SignupBean } from 'src/app/core/models/SignupBean';
import { ErrorStateMatcher } from '@angular/material';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const isSubmitted = form && form.submitted;
      return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
  }

@Component({
    selector: 'app-accountsettings',
    templateUrl: 'accountsettings.component.html',
    styleUrls: ['accountsettings.component.sass']
})
export class AccountSettingsComponent implements OnInit {
    userInfoForm: FormGroup;
    companyInfoForm: FormGroup;
    changePasswordForm: FormGroup;
    validEmailRegister: true | false;
    user: User;
    signupUser: SignupBean;
    currentPassword: string;
    validPasswordRegister: true | false;
    matcher = new MyErrorStateMatcher();

    public phoneNumberCodes = phoneNumberCodesList.phoneNumberCodes;

    constructor(private formBuilder: FormBuilder, private authService: AuthenticationService) {
        this.signupUser = new SignupBean();
        this.signupUser.company = new Company();
        this.signupUser.name = "";
    }

    createForms() {
        if (this.authService.currentSession) {
            this.user = this.authService.currentSession.currentUser;

        }
        debugger;

        this.user.company = new Company();
        this.user.company.name = "";
        const number = `[0-9]+`;
        this.user.twoFactorAuthentication = true;
        this.userInfoForm =
            this.formBuilder.group({
                "name": ["", [Validators.required, Validators.minLength(2)]],
                "surname": ["", [Validators.required, Validators.minLength(2)]],
                "gsmCode": ["", [Validators.required]],
                "gsm": ["", [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(number)]],
                "email": ["", [Validators.required, ValidationService.emailValidator]],
            });

        this.companyInfoForm =
            this.formBuilder.group({
                "company": ["", []],
                "webSite": ["", []],
                "industry": ["", []],
                "personnelCount": ["", []]
            });

        this.changePasswordForm =
            this.formBuilder.group({
                "currentPassword": ["", [Validators.required, Validators.minLength(6)]],
                "password": ["", [Validators.required, Validators.minLength(6)]],
                "passwordAgain": ["", [Validators.required, Validators.minLength(6)]]
            }
                , { validator: Validators.compose([ValidationService.matchingPasswords("password", "passwordAgain")]) }
            );
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

    emailValidationRegister(e) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(String(e).toLowerCase())) {
            this.validEmailRegister = true;
        } else {
            this.validEmailRegister = false;
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

    public twoFactorAuthentication() {
        this.user.twoFactorAuthentication = this.user.twoFactorAuthentication === true ? false : true;
    }

    ngOnInit() {
        this.createForms();

    }


    userFormSubmit(){}
    companyFormSubmit(){}
    changePasswordFormSubmit(){}


}
