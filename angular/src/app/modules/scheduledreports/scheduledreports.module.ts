import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduledReportsComponent } from './page/scheduledreports.component';
import { ScheduledReportsRoutingModule } from './scheduledreports-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldErrorDisplayComponent } from './components/field-error-display/field-error-display.component';



@NgModule({
  declarations: [
    ScheduledReportsComponent,FieldErrorDisplayComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    ScheduledReportsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]

})
export class ScheduledReportsModule { }
