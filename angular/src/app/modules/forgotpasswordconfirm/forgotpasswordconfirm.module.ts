import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';

import { MaterialModule } from 'src/app/shared/components/material.module';
import { ForgotPasswordConfirmComponent } from './page/forgotpasswordconfirm.component';
import { ForgotPasswordConfirmComponentRoutingModule } from './forgotpasswordconfirm-routing.module';
import { ReCaptchaModule } from 'angular2-recaptcha';

import { FooterModule } from '../shared/footer/footer.module';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';



@NgModule({
  declarations: [ForgotPasswordConfirmComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    ReCaptchaModule,
    MatPasswordStrengthModule,
    FooterModule,
    ForgotPasswordConfirmComponentRoutingModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: translateHttpLoaderFactory,
          deps: [HttpClient]
      }
  })

  ]

})
export class ForgotPasswordConfirmModule { }
