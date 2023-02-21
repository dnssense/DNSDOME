import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './page/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { FieldErrorDisplayComponent } from './components/field-error-display/field-error-display.component';
import { RegisterRoutingModule } from './register-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';

import { FooterModule } from '../shared/footer/footer.module';
import { RecaptchaModule } from 'ng-recaptcha';


@NgModule({
  declarations: [RegisterComponent, FieldErrorDisplayComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TagInputModule,
    RecaptchaModule,
    RegisterRoutingModule,
    FooterModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })

  ]

})
export class RegisterModule { }
