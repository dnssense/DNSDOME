import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardComponent } from './page/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RkProgressBarModule, RkDateModule, RkTableModule, RkInfoBoxModule } from 'roksit-lib';

@NgModule({
  declarations: [DashboardComponent],
  providers:[DatePipe],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CommonModule,
    DashboardRoutingModule,
    RkProgressBarModule,
    RkDateModule,
    RkTableModule,
    RkInfoBoxModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  schemas : [NO_ERRORS_SCHEMA]

})
export class DashboardModule { }
