import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesComponent } from './page/devices.component';
import { DevicesRoutingModule } from './devices-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { TimeProfileComponent } from './components/time-profile/time-profile.component';



@NgModule({
  declarations: [
    DevicesComponent,
    TimeProfileComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NouisliderModule,
    MaterialModule,
    DevicesRoutingModule,
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
export class DevicesModule { }
