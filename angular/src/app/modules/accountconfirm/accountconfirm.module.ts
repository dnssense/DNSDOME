import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { MaterialModule } from 'src/app/material.module';

import { FooterModule } from '../shared/footer/footer.module';
import { AccountConfirmComponent } from './page/accountconfirm.component';
import { AccountConfirmComponentRoutingModule } from './accountconfirm-routing.module';
import { RecaptchaModule } from 'ng-recaptcha';


@NgModule({
  declarations: [AccountConfirmComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    RecaptchaModule,
    FooterModule,
    AccountConfirmComponentRoutingModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: translateHttpLoaderFactory,
          deps: [HttpClient]
      }
  })

  ]

})
export class AccountConfirmModule { }
