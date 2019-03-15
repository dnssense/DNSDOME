import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './page/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { SelectModule } from 'ng2-select';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { FieldErrorDisplayComponent } from './components/field-error-display/field-error-display.component';
import { LoginRoutingModule } from './login-routing.module';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';
import { ReCaptchaModule } from 'angular2-recaptcha';


@NgModule({
  declarations: [LoginComponent, FieldErrorDisplayComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    ReCaptchaModule,
    LoginRoutingModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: translateHttpLoaderFactory,
          deps: [HttpClient]
      }
  })

  ]

})
export class LoginModule { }
