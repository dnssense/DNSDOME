import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduledReportsComponent } from './page/scheduledreports.component';
import { ScheduledReportsRoutingModule } from './scheduledreports-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldErrorDisplayComponent } from './components/field-error-display/field-error-display.component';
import { IconsModule, RkRadioModule, RkTableModule } from 'roksit-lib';

@NgModule({
  declarations: [
    ScheduledReportsComponent,
    FieldErrorDisplayComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ScheduledReportsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IconsModule,
    RkRadioModule,
    RkTableModule
  ]
})
export class ScheduledReportsModule { }
