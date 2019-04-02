import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomReportComponent } from './customreport/customreport.component';
import { MonitorComponent } from './monitor/monitor.component';
import { ReportsRoutingModule } from './reports-routing.module';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';

@NgModule({
  declarations: [CustomReportComponent, MonitorComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NouisliderModule,
    MaterialModule,
    ReportsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
})
export class ReportsModule {}
