import { Component, OnInit } from '@angular/core';
import {ConfigHost, ConfigService} from '../../../../core/services/config.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ValidationService} from '../../../../core/services/validation.service';
import {ForgotPasswordModel} from "../../../forgotpasswordconfirm/page/forgotpasswordconfirm.component";
import '@angular/localize/init'
import {TranslatorService} from "../../../../core/services/translator.service";
import "../../../../core/extentions/string.extentions"
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../../../../core/services/authentication.service";
import {CaptchaService} from "../../../../core/services/captcha.service";
import { environment } from 'src/environments/environment';
import {RoleConstant} from "../../../../core/models/Role";
import {StaticMessageService} from "../../../../core/services/staticMessageService";
import {Company, CompanyUpdaterDTO} from "../../../../core/models/Company";
import {CompanyService} from "../../../../core/services/companyService";
import { RkNotificationService, RkSelectModel } from 'roksit-lib';

declare var $: any;

@Component({
  selector: 'app-createdparentconfirm',
  templateUrl: './createtparentconfirm.component.html',
  styleUrls: ['./createtparentconfirm.component.sass']
})
export class CreatetparentconfirmComponent implements OnInit {

  constructor(private formBuilder: UntypedFormBuilder, private configservice: ConfigService, private translateservice: TranslatorService,
              private route: ActivatedRoute, private authService: AuthenticationService, private capthaService: CaptchaService,
              private notification: RkNotificationService, private staticMessageService: StaticMessageService,
              private router: Router, private companyService: CompanyService) {
    this.host = configservice.host;
    this.captcha_key = this.host.captcha_key
    this.confirmId = this.route.snapshot.queryParams.key
    this.isFailed = false;
    this.confirmForm = this.formBuilder.group({
      'password': ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
      'passwordAgain': ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]]
    },
      {validator: Validators.compose([ValidationService.matchingPasswords('password', 'passwordAgain')])}
    );
  }

  host: ConfigHost;
  confirmForm: any;
  model: ForgotPasswordModel = {}
  private captcha: string;
  private confirmId: string
  public captcha_key: string;

  passStrength = 0;
  numStrength = false;
  upStrength = false;
  lowStrength = false;
  lengthStrength = false;
  parentRoleLevel: string
  whichPage: "password" | "login" | "security" = "password"
  loginForm: UntypedFormGroup;
  email: string;
  password: string;
  isFailed: boolean;
  validEmailLogin: true | false;
  isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
  environment = environment;
  currentCompany: Company
  parentCompany: Company
  selectedRoleLevel: RkSelectModel
  columnsOptions: RkSelectModel[] = [{name: RoleConstant.ADMIN, displayText: "Admin"}, {name: RoleConstant.USER, displayText: "Read only"},
    {name: undefined, displayText: "No Access"}];
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      'email': [null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      'password': ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  // region ui methodes

  isFormValid() {
    if (this.model != null && this.confirmForm.dirty && this.confirmForm.valid && this.captcha != null) {
      return true
    }
    return false
  }

  handleCaptcha($event) {
    this.captcha = $event
  }

  submitPassword() {
    if (!this.capthaService.validCaptcha(this.captcha))
      return
    this.authService.confirmAccountCreatedByParent(this.confirmId, this.model.password, this.model.passwordAgain).subscribe(res=>{
      this.whichPage = "login"
    })
  }

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
      } else {
        $('#passDetails').show(300);
      }
    }
  }

  getAccountStrInfo() {
    let localStr = this.translateservice.translate('MSP.AccountParentCreated').format(this.parentCompany ? this.parentCompany.name : "")
    return localStr
  }

  emailValidationLogin(e) {
    if (e) {
      this.email = String(e).toLowerCase();
    }
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(e).toLowerCase())) {
      this.validEmailLogin = true;
    } else {
      this.validEmailLogin = false;
    }
  }

  loginAndToSecurity() {
    if (this.loginForm.valid) {
      this.isFailed = false;
      this.authService.login(this.email, this.password).subscribe(val => {
        if (this.authService.currentSession && this.authService.currentSession.currentUser) {
          this.companyService.getCompanyById(this.authService.currentSession.currentUser.companyId).subscribe(res => {
            this.currentCompany = res
            if (res.parentId) {
              this.companyService.getCompanyById(res.parentId).subscribe(pres => {
                this.parentCompany = pres
                this.whichPage = "security"
              })
            } else {
              this.whichPage = "security"
            }
          })
        }
      });

    } else {
      this.notification.warning(this.staticMessageService.pleaseFillRequirementFields);
      return;
    }

  }

  filterColumnChanged(val) {
    this.selectedRoleLevel = val
  }
  login() {
    if (this.authService.currentSession && this.authService.currentSession.currentUser){
      let companyDto:CompanyUpdaterDTO = {id: this.authService.currentSession.currentUser.companyId}
      companyDto.parentRoleLevel = this.selectedRoleLevel.name
      companyDto.parentIsLocked = this.selectedRoleLevel.name ? 0 : 1
      this.companyService.updateCompanyWithParent(companyDto).subscribe(val=>{
        this.router.navigateByUrl('/admin/dashboard');
      })

    } else {
      this.whichPage = "login"
    }
  }
  // endregion

}
