import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealTimeComponent } from './page/realtime.component';
import { RealTimeRoutingModule } from './realtime-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    RealTimeComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    RealTimeRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]

})
export class RealTimeModule { }
