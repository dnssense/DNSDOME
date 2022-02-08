import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ValidationService } from 'src/app/core/services/validation.service';
import * as phoneNumberCodesList from 'src/app/core/models/PhoneNumberCodes';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { User } from 'src/app/core/models/User';
import { Company } from 'src/app/core/models/Company';
import { SignupBean } from 'src/app/core/models/SignupBean';
import { ErrorStateMatcher } from '@angular/material/core';
import { AccountService } from 'src/app/core/services/accountService';
import { AlertService } from 'src/app/core/services/alert.service';
import { CompanyService } from 'src/app/core/services/companyService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SmsService } from 'src/app/core/services/smsService';
// import { SmsInformation } from 'src/app/core/models/SmsInformation';
import { SmsType } from 'src/app/core/models/SmsType';
import { RestSmsResponse, RestSmsConfirmRequest, RestUserUpdateRequest } from 'src/app/core/models/RestServiceModels';
import { LoggerService } from 'src/app/core/services/logger.service';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { countries } from 'src/app/core/models/Countries';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { TranslateService } from '@ngx-translate/core';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { ConfigService } from '../../../core/services/config.service';

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
    passwordStrength: any;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private notification: NotificationService,
        private accountService: AccountService,
        private alert: AlertService,
        private companyService: CompanyService,
        private smsService: SmsService,
        private staticMessageService: StaticMessageService,
        private configService: ConfigService
    ) {
        this.signupUser = new SignupBean();
        this.signupUser.company = new Company();
        this.signupUser.company.name = '';

        this.companyService.getCompany().subscribe(res => {
            if (res && res.length > 0) {
                this.signupUser.company = res[0];

                this.industuryOptions = this.industuryOptions.map(x => {
                    return {
                        ...x,
                        selected: x.value === this.signupUser.company.industry
                    };
                });

                this.personCountsOptions = this.personCountsOptions.map(x => {
                    return {
                        ...x,
                        selected: x.value === this.signupUser.company.personnelCount
                    };
                });
            }
        });
    }
    userInfoForm: FormGroup;
    userPhoneForm: FormGroup;
    companyInfoForm: FormGroup;
    changePasswordForm: FormGroup;
    validEmailRegister: true | false;
    user: User;
    currentGsm: string;
    gsmCodeTemp: string;
    phoneNumberTemp: string;
    smsCode: string;
    signupUser: SignupBean;
    currentPassword: string;
    validPasswordRegister: true | false;
    matcher = new MyErrorStateMatcher();
    current2FAPreference: boolean;
    endTime: Date;
    isTimeSetted = false;
    maxRequest = 3;
    private smsInformation: RestSmsResponse;
    isConfirmTimeEnded = true;
    public phoneNumberCodes = phoneNumberCodesList.phoneNumberCodes;

    notificationIndex = 0;
    isSmsConfirming = false;

    activeTabNumber = 0;

    countryOptions: RkSelectModel[] = [];

    industuryOptions: RkSelectModel[] = [
        { displayText: 'Cloud Computing/Saas', value: 'Cloud Computing/Saas' },
        { displayText: 'Computer HW, SW', value: 'Computer HW, SW' },
        { displayText: 'Consumer Goods/Retail', value: 'Consumer Goods/Retail' },
        { displayText: 'Ecommerce/Online Advertising', value: 'Ecommerce/Online Advertising' },
        { displayText: 'Energy/Utility', value: 'Energy/Utility' },
        { displayText: 'Financial Services/Insurance', value: 'Financial Services/Insurance' },
        { displayText: 'Healthcare/Lifesciences/Pharmaceuticals', value: 'Healthcare/Lifesciences/Pharmaceuticals' },
        { displayText: 'ISP / Hosting', value: 'ISP / Hosting' },
        { displayText: 'IT Services', value: 'IT Services' },
        { displayText: 'Manufacturing', value: 'Manufacturing' },
        { displayText: 'Media/Entertainment', value: 'Media/Entertainment' },
        { displayText: 'Professional Services (Legal, Accounting, etc.)', value: 'Professional Services (Legal, Accounting, etc.)' },
        { displayText: 'Telecommunications', value: 'Telecommunications' },
        { displayText: 'University', value: 'University' },
        { displayText: 'K-12', value: 'K-12 Education' },
        { displayText: 'non-profits', value: 'Non-profits' },
        { displayText: 'Other', value: 'Other' },
    ];

    personCountsOptions: RkSelectModel[] = [
        { displayText: '1-50', value: '1-50' },
        { displayText: '50-99', value: '50-99' },
        { displayText: '100-249', value: '100-249' },
        { displayText: '250-499', value: '250-499' },
        { displayText: '500-999', value: '500-999' },
        { displayText: '1000-2499', value: '1000-2499' },
        { displayText: '5000-9999', value: '5000-9999' },
        { displayText: '10000-19999', value: '10000-19999' },
    ];

    ngOnInit() {
        if (this.authService.currentSession) {

            this.user = this.authService.currentSession.currentUser;
            this.current2FAPreference = this.user.twoFactorAuthentication;
            this.gsmCodeTemp = this.user.gsmCode || this.configService.host.defaultGSMCode;
            this.phoneNumberTemp = this.user.gsm;
            this.currentGsm = this.user.gsm;

            this.countryOptions = phoneNumberCodesList.phoneNumberCodes.map(x => {
                return {
                    value: x.dial_code,
                    displayText: x.name,
                    selected: this.gsmCodeTemp === x.dial_code
                } as RkSelectModel;
            });
        }

        const number = `[0-9]+`;
        this.userInfoForm =
            this.formBuilder.group({
                'name': ['', [Validators.required, Validators.minLength(2)]],
            });

        this.userPhoneForm =
            this.formBuilder.group({
                'gsmCode': ['', [Validators.required]],
                'gsm': ['', [Validators.required, Validators.minLength(9), Validators.maxLength(10), Validators.pattern(number)]],
                'smsCode': ['']
            });

        this.companyInfoForm =
            this.formBuilder.group({
                'companyName': ['', [Validators.required, Validators.minLength(3)]],
                'url': ['', [Validators.required, Validators.minLength(3), ValidationService.domainValidation]],
                'blockMessage': ['', [Validators.required, Validators.minLength(3)]],
                'logo': ['', []]
            });

        this.changePasswordForm =
            this.formBuilder.group({
                'currentPassword': ['', [Validators.required, Validators.minLength(6)]],
                'password': ['', [Validators.required, Validators.minLength(6)]],
                'passwordAgain': ['', [Validators.required, Validators.minLength(6)]]
            }
                , { validator: Validators.compose([ValidationService.matchingPasswords('password', 'passwordAgain')]) }
            );

        /* if (this.phoneNumberTemp === this.user.gsm) {
            $('#validateButton').prop('disabled', true);
        } else {
            $('#validateButton').prop('disabled', false);
        } */
    }

    emailValidationRegister(e) {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (regex.test(String(e).toLowerCase())) {
            this.validEmailRegister = true;
        } else {
            this.validEmailRegister = false;
        }
    }

    checkisTelNumber(event: KeyboardEvent) {
        const allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'Backspace', 'ArrowLeft', 'ArrowRight'];

        const isValid = allowedChars.some(x => x == event.key);

        if (!isValid) {
            event.preventDefault();
        }
    }

    gsmChange() {

    }

    gsmCodeChange() {

    }

    selectFile($event) {
        const inputValue = $event.target;
        const file = inputValue.files[0];
        const reader = new FileReader();
        const ag = this.signupUser.company;
        if (typeof file !== 'undefined') {

        }

        reader.addEventListener('load', function () {
            ag.logo = reader.result;
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    }

    userFormSubmit() {
        if (!this.user.name) {
            this.notification.warning(this.staticMessageService.pleaseFillTheFullName);
            return;
        }
        if (this.user && this.userInfoForm.dirty && this.userInfoForm.valid) {
            const request: RestUserUpdateRequest = {};
            request.name = this.user.name || ' ';

            this.accountService.update(request).subscribe(res => {
                this.notification.success(this.staticMessageService.nameUpdatedMessage);
                this.authService.saveSession();
            });
        } else {
            this.notification.warning(this.staticMessageService.pleaseFillRequirementFields);
        }
    }

    companyFormSubmit() {


        if (!this.signupUser.company?.name) {
            this.notification.warning(this.staticMessageService.pleaseFillTheCompanyName);
            return;
        }

        if (!this.signupUser.company?.industry) {
            this.notification.warning(this.staticMessageService.pleaseFillTheCompanyIndustry);
            return;
        }

        if (!this.signupUser.company?.url) {
            this.notification.warning(this.staticMessageService.pleaseFillTheCompanyWebSite);
            return;
        }

        if (!this.signupUser.company?.personnelCount) {
            this.notification.warning(this.staticMessageService.pleaseFillTheCompanyPersonnelCount);
            return;
        }



        if (this.companyInfoForm.valid && this.signupUser.company.industry.length > 0 && this.signupUser.company.personnelCount.length > 0) {
            this.companyService.saveCompany(this.signupUser.company).subscribe(res => {
                this.notification.success(this.staticMessageService.companyInformationUpdatedMessage);
            });
        } else {
            this.notification.error(this.staticMessageService.enterRequiredFieldsMessage);
            return;
        }
    }
    isValidateButtonDisabled() {


        if ((this.user.isGsmVerified && this.phoneNumberTemp && this.phoneNumberTemp === this.user.gsm && this.gsmCodeTemp === this.user.gsmCode)
            || this.phoneNumberTemp?.length < 9 || !this.gsmCodeTemp) { return true; }
        return false;
    }

    changePasswordFormSubmit() {
        if (!this.currentPassword) {
            this.notification.warning(this.staticMessageService.pleaseFillTheCurrentPassword);
            return;
        }
        if (!this.signupUser.password) {
            this.notification.warning(this.staticMessageService.pleaseFillTheNewPassword);
            return;
        }
        if (!this.signupUser.passwordAgain) {
            this.notification.warning(this.staticMessageService.pleaseFillTheNewPasswordAgain);
            return;
        }

        if (this.signupUser.password != this.signupUser.passwordAgain) {
            this.notification.warning(this.staticMessageService.newPasswordAndConfirmedPasswordAreNotSame);
            return;
        }

        if (this.passwordStrength != 4) {
            this.notification.warning(this.staticMessageService.passwordComplexityMustBe);
            return;
        }



        if (this.changePasswordForm.valid && this.changePasswordForm.dirty && this.signupUser.password === this.signupUser.passwordAgain && this.passwordStrength === 4) {
            this.accountService.changePassword(this.currentPassword, this.signupUser.password)
                .subscribe(res => {
                    this.notification.success(this.staticMessageService.passwordChangedMessage);
                    this.authService.saveSession();

                    this.currentPassword = '';
                    this.signupUser.password = '';
                    this.signupUser.passwordAgain = '';

                    this.activeTabNumber = 0;
                });
        } else {
            this.notification.warning(this.staticMessageService.enterRequiredFieldsMessage);
            return;
        }
    }

    change2FASubmit() {
        if (!this.user.gsmCode) {
            this.notification.warning(this.staticMessageService.pleaseFillTheGsmCode);
            return;
        }
        if (!this.user.gsm) {
            this.notification.warning(this.staticMessageService.pleaseFillThePhoneNumber);
        }

        if (this.user.gsm && this.user.gsmCode) {
            const request: RestUserUpdateRequest = {};
            request.isTwoFactorAuthentication = this.user.twoFactorAuthentication ? 0 : 1;

            this.accountService.update(request).subscribe(res => {
                this.user.twoFactorAuthentication = !this.user.twoFactorAuthentication;
                this.notification.success(this.staticMessageService.twoFactorAuthenticationMessage);
                this.authService.saveSession();
            });
        } else {
            this.notification.warning(this.staticMessageService.pleaseFillRequirementFields);
            this.user.twoFactorAuthentication = false;
        }
    }

    changePhoneNumber() {

        if (!this.gsmCodeTemp) {
            this.notification.warning(this.staticMessageService.pleaseFillTheGsmCode);
            return;
        }
        if (!this.phoneNumberTemp) {
            this.notification.warning(this.staticMessageService.pleaseFillThePhoneNumber);
            return;
        }
        if (this.phoneNumberTemp && this.phoneNumberTemp.length === 9) {
            this.user.gsm = this.phoneNumberTemp;
            this.user.gsmCode = this.gsmCodeTemp;

            this.smsService.sendSmsCommon(this.user.gsmCode + this.user.gsm).subscribe(res => {

                $('#validateButton').hide(200);
                $('#smsValidationDiv').show(300);
                this.smsInformation = res;
                this.maxRequest = 3;
                this.notificationIndex = 0;
                this.isConfirmTimeEnded = false;
                this.endTime = new Date();
                this.endTime.setMinutes(new Date().getMinutes() + 2);
                this.isTimeSetted = true;
                this.isSmsConfirming = true;
            });

        }
    }

    confirmGsm() {
        if (!this.smsCode || this.smsCode.length < 4) {
            this.notification.warning(this.staticMessageService.pleaseEnterSmsCodeMessage);
            return;
        }

        if (this.maxRequest !== 0 && !this.isConfirmTimeEnded) {
            this.maxRequest -= 1;
            if (this.smsInformation) {
                const request: RestSmsConfirmRequest = { id: this.smsInformation.id, code: this.smsCode };
                this.smsService.confirmCommonSms(request).subscribe(res1 => {

                    this.user.gsm = this.phoneNumberTemp;
                    const updateRequest: RestUserUpdateRequest = {};
                    updateRequest.gsm = this.phoneNumberTemp;
                    updateRequest.gsmCode = this.gsmCodeTemp;

                    this.accountService.update(updateRequest).subscribe(res2 => {
                        this.notification.success(this.staticMessageService.phoneNumberUpdatedMessage);
                        // $('#validateButton').prop('disabled', true);
                        this.notificationIndex++;
                        this.user.gsm = this.phoneNumberTemp;
                        this.user.gsmCode = this.gsmCodeTemp;
                        this.user.isGsmVerified = true;
                        this.authService.saveSession();

                        $('#validateButton').show(300);
                        $('#smsValidationDiv').hide(200);
                        this.isSmsConfirming = false;
                    });


                }, err => {
                    if (this.maxRequest === 0) {
                        this.notification.error(this.staticMessageService.exceededTheNumberOfAttemptsMessage);
                    } else if (err && err.error && err.error.status == 400) {

                        this.notification.error(this.staticMessageService.pleaseEnterSmsCodeMessage);

                    } else { throw err; }
                });

            }
        }
    }

    timeEnd() {
        if (this.isTimeSetted && this.notificationIndex < 1) {
            this.notification.error(this.staticMessageService.confirmationTimeIsUpMessage);
            // location.reload();
            this.notificationIndex++;
            $('#validateButton').show(300);
            $('#smsValidationDiv').hide(200);
            this.isSmsConfirming = false;

        }
    }

    checkPasswordStrength() {
        this.passwordStrength = 0;

        if (!this.signupUser.password || this.signupUser.password.length < 1) { return; }

        if (/[a-z]/.test(this.signupUser.password)) {
            this.passwordStrength++;
        }
        if (/[A-Z]/.test(this.signupUser.password)) {
            this.passwordStrength++;
        }
        if (/[0-9]/.test(this.signupUser.password)) {
            this.passwordStrength++;
        }
        if (this.signupUser.password && this.signupUser.password.length > 7) {
            this.passwordStrength++;
        }
    }
}
