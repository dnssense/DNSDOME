import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ValidationService } from 'src/app/core/services/validation.service';
import * as phoneNumberCodesList from "src/app/core/models/PhoneNumberCodes";
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { User } from 'src/app/core/models/User';
import { Company } from 'src/app/core/models/Company';
import { SignupBean } from 'src/app/core/models/SignupBean';
import { ErrorStateMatcher } from '@angular/material';
import { AccountService } from 'src/app/core/services/AccountService';
import { AlertService } from 'src/app/core/services/alert.service';
import { CompanyService } from 'src/app/core/services/CompanyService';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}
declare var $: any;
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
    current2FAPreference: boolean;

    public phoneNumberCodes = phoneNumberCodesList.phoneNumberCodes;

    constructor(private formBuilder: FormBuilder, private authService: AuthenticationService,
        private accountService: AccountService, private alert: AlertService, private companyService: CompanyService) {
        this.signupUser = new SignupBean();
        this.signupUser.company = new Company();
        this.signupUser.company.name = "";
        this.companyService.getCompany().subscribe(res => {
            this.signupUser.company = res; console.log(this.signupUser.company);
        });
    }

    createForms() {
        if (this.authService.currentSession) {
            this.user = this.authService.currentSession.currentUser;
            this.current2FAPreference = this.user.twoFactorAuthentication;
        }
        debugger;

        const number = `[0-9]+`;
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
                'companyName': ['', [Validators.required, Validators.minLength(3)]],
                'url': ['', [Validators.minLength(3), ValidationService.domainValidation]],
                'blockMessage': ['', [Validators.minLength(3)]],
                'industry': ['', [Validators.required, Validators.minLength(2)]],
                'personnelCount': ['', [Validators.required, Validators.minLength(2)]],
                'logo': ['', []]
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

    selectFile($event) {
        var inputValue = $event.target;
        let file = inputValue.files[0];
        let reader = new FileReader();
        let ag = this.signupUser.company;
        if (typeof file !== 'undefined') {

        }

        reader.addEventListener("load", function () {
            ag.logo = reader.result;
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    }

    userFormSubmit() {
        if (this.user && this.userInfoForm.dirty && this.userInfoForm.valid) {

            this.accountService.savePersonalSettings(this.user).subscribe(res => {
                this.user = res.object;
                if (res.status == 200) {
                    this.alert.alertSuccessMessage("Operation Successful", "User information updated.");
                    console.log(res);

                }

            });
        }
    }

    companyFormSubmit() {
        if (!this.signupUser.company || !this.signupUser.company.name || !this.signupUser.company.industry ||
            !this.signupUser.company.personnelCount || !this.signupUser.company.url || !this.signupUser.company.blockMessage) {
            return;
        }

        console.log(this.signupUser.company);
        this.companyService.save(this.signupUser.company).subscribe(res => {
            console.log(res);
            this.alert.alertSuccessMessage("Operation Successful", "Company information updated.");
            console.log(this.companyService.getCompany());

        });

    }

    changePasswordFormSubmit() {
        debugger;
        if (!this.currentPassword || !this.signupUser.password || !this.signupUser.passwordAgain) {
            return;
        } else {
            this.accountService.savePassword(this.currentPassword, this.signupUser.password, this.signupUser.passwordAgain)
                .subscribe(res => {
                    console.log(res.message);
                    console.log(res.status);
                    if (res.status == 500) {
                        this.alert.alertWarningAndCancel('Error Occured!', res.message);
                    } else {
                        this.alert.alertSuccessMessage("Operation Successful", "Password changed.");
                    }

                });

        }
    }

    change2FA() {
        debugger;
        if (this.current2FAPreference == this.user.twoFactorAuthentication) {
            return;
        } else {
            this.accountService.save(this.user).subscribe(res => {
                this.user = res.object;
                if (res.status == 200) {
                    this.alert.alertSuccessMessage("Operation Successful", "Two factor authentication updated.");
                    console.log(res);

                }

            });
        }
    }


}
