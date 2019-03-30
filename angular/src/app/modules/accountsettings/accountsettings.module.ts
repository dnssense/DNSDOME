import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountSettingsComponent } from './page/accountsettings.component';
import { AccountSettingsRoutingModule } from './accountsettings-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldErrorDisplayComponent } from './components/field-error-display/field-error-display.component';
import { CountdownTimerModule } from 'ngx-countdown-timer';



@NgModule({
  declarations: [
    AccountSettingsComponent,FieldErrorDisplayComponent],
  imports: [
    CountdownTimerModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    AccountSettingsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]

})
export class AccountSettingsModule { }
