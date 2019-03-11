import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountSettingsComponent } from './page/accountsettings.component';
import { AccountSettingsRoutingModule } from './accountsettings-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { FieldErrorDisplayComponent } from './components/field-error-display/field-error-display.component';



@NgModule({
  declarations: [
    AccountSettingsComponent,FieldErrorDisplayComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NouisliderModule,
    MaterialModule,
    AccountSettingsRoutingModule,
    AmazingTimePickerModule,
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
