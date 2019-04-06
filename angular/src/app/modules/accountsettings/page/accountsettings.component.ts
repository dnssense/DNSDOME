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
import { NotificationService } from 'src/app/core/services/notification.service';
import { SmsService } from 'src/app/core/services/SmsService';
//import { SmsInformation } from 'src/app/core/models/SmsInformation';
import { SmsType } from 'src/app/core/models/SmsType';
import { RestSmsResponse, RestSmsConfirmRequest, RestUserUpdateRequest } from 'src/app/core/models/RestServiceModels';
import { LoggerService } from 'src/app/core/services/logger.service';

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
    userPhoneForm: FormGroup;
    companyInfoForm: FormGroup;
    changePasswordForm: FormGroup;
    validEmailRegister: true | false;
    user: User;
    currentGsm: string;
    phoneNumberTemp: string;
    smsCode: string;
    signupUser: SignupBean;
    currentPassword: string;
    validPasswordRegister: true | false;
    matcher = new MyErrorStateMatcher();
    current2FAPreference: boolean;
    endTime: Date;
    maxRequest: number = 3;
    private smsInformation: RestSmsResponse;
    isConfirmTimeEnded: boolean = true;
    public phoneNumberCodes = phoneNumberCodesList.phoneNumberCodes;

    constructor(private formBuilder: FormBuilder, private authService: AuthenticationService, private notification: NotificationService,
        private accountService: AccountService, private alert: AlertService,
        private companyService: CompanyService, private smsService: SmsService) {
        this.signupUser = new SignupBean();
        this.signupUser.company = new Company();
        this.signupUser.company.name = "";

        this.companyService.getCompany().subscribe(res => {
            this.signupUser.company = res;
        });
    }

    emailValidationRegister(e) {
// tslint:disable-next-line: max-line-length
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

        if (this.phoneNumberTemp == this.user.gsm) {
            $('#changePhoneBtn').attr('disabled', 'disabled');
        } else {
            $('#changePhoneBtn').removeAttr("disabled");
        }
    }

    ngOnInit() {
        if (this.authService.currentSession) {
            this.user = this.authService.currentSession.currentUser;
            this.current2FAPreference = this.user.twoFactorAuthentication;
            this.phoneNumberTemp = this.user.gsm;
            this.currentGsm = this.user.gsm;
        }

        const number = `[0-9]+`;
        this.userInfoForm =
            this.formBuilder.group({
                "name": ["", [Validators.required, Validators.minLength(2)]],

            });

            this.userPhoneForm =
            this.formBuilder.group({

                "gsmCode": ["", [Validators.required]],
                "gsm": ["", [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(number)]],

                "smsCode": [""]
            });

        this.companyInfoForm =
            this.formBuilder.group({
                'companyName': ['', [Validators.required, Validators.minLength(3)]],
                'url': ['', [Validators.required, Validators.minLength(3), ValidationService.domainValidation]],
                'blockMessage': ['', [Validators.required, Validators.minLength(3)]],
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

            let request: RestUserUpdateRequest = {};
            request.name = this.user.name || ' ';


            this.accountService.update(request).subscribe(res => {



                this.notification.success("Updated name");
                this.authService.saveSession();


            });
        }
    }

    companyFormSubmit() {

        if (this.companyInfoForm.valid && this.companyInfoForm.dirty) {
            this.companyService.save(this.signupUser.company).subscribe(res => {
                this.alert.alertSuccessMessage("Operation Successful", "Company information updated.");
            });
        } else {
            this.notification.warning("Company form is not valid! Please enter required fields with valid values.");
            return;
        }
    }

    changePasswordFormSubmit() {
        if (this.changePasswordForm.valid && this.changePasswordForm.dirty && this.signupUser.password === this.signupUser.passwordAgain) {
            this.accountService.savePassword(this.currentPassword, this.signupUser.password)
                .subscribe(res => {

                    this.alert.alertSuccessMessage("Operation Successful", "Password changed.");
                    this.authService.saveSession();

                });
        } else {
            this.notification.warning("Password change form is not valid! Please enter required fields with valid values.");
            return;
        }
    }

    change2FASubmit() {


        if (this.user.gsm && this.user.gsmCode) {
            let request: RestUserUpdateRequest = {};
            request.isTwoFactorAuthentication = this.user.twoFactorAuthentication ? 0 : 1;


            this.accountService.update(request).subscribe(res => {


                this.user.twoFactorAuthentication = !this.user.twoFactorAuthentication;
                this.notification.success("Operation Successful Two factor authentication updated.");
                this.authService.saveSession();

            });
        }

    }

    changePhoneNumber() {

        if (this.userPhoneForm.get('gsm').valid && this.phoneNumberTemp && this.phoneNumberTemp.length == 10) {
            this.user.gsm = this.phoneNumberTemp;

            this.smsService.sendSmsCommon().subscribe(res => {

                this.smsInformation = res;
                this.maxRequest = 3;
                this.isConfirmTimeEnded = false;
                this.endTime = new Date();
                this.endTime.setMinutes(new Date().getMinutes() + 2);
                $('#smsValidationDiv').show(300);
            });

        }
    }

    confirmGsm() {

        if (this.maxRequest != 0 && !this.isConfirmTimeEnded) {
            this.maxRequest -= 1;
            if (this.smsInformation) {



                let request: RestSmsConfirmRequest = { id: this.smsInformation.id, code: this.smsCode };
                this.smsService.confirmCommonSms(request).subscribe(res => {

                    this.user.gsm = this.phoneNumberTemp;
                    let updateRequest: RestUserUpdateRequest = {};
                    updateRequest.gsm = this.phoneNumberTemp;
                    updateRequest.gsmCode = this.user.gsmCode;

                    this.accountService.update(updateRequest).subscribe(res => {

                        this.notification.success("Phone number updated");
                        this.user.gsm = this.phoneNumberTemp;
                        this.authService.saveSession();


                    });
                    $('#smsValidationDiv').hide(200);


                }, err => {

                    if (this.maxRequest === 0) {
                        this.notification.error('You have exceeded the number of attempts! Try Again!');

                    }
                    else throw err;

                });

            }
        } 1
    }

    timeEnd() {
        this.notification.error('Confirmation time is up!');
        location.reload();
    }


}
