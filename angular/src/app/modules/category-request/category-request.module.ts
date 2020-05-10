import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { AmazingTimePickerModule } from 'amazing-time-picker'; 
import { IconsModule, RkSelectModule } from 'roksit-lib';
import { CategoryRequestComponent } from './category-request.component';
import { CategoryRequestRoutingModule } from './category-request-routing.module';

@NgModule({
  declarations: [
    CategoryRequestComponent
],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NouisliderModule,
    MaterialModule,
    CategoryRequestRoutingModule,
    AmazingTimePickerModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IconsModule,
    RkSelectModule
  ]

})
export class CategoryRequestModule { }
