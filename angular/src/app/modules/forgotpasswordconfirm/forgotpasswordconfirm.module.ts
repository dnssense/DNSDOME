import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import {HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';

import { MaterialModule } from 'src/app/material.module';
import { ForgotPasswordConfirmComponent } from './page/forgotpasswordconfirm.component';
import { ForgotPasswordConfirmComponentRoutingModule } from './forgotpasswordconfirm-routing.module';


import { FooterModule } from '../shared/footer/footer.module';
import { RecaptchaModule } from 'ng-recaptcha';


@NgModule({
  declarations: [ForgotPasswordConfirmComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TagInputModule,
    MaterialModule,
    RecaptchaModule,
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
