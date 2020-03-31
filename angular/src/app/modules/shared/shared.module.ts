import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoksitSearchComponent } from './roksit-search/roksit-search.component';
import { RkRadioModule, RkSelectModule, RkTableModule, RkModalModule, RkLayoutModule, RkFilterBadgeModule, IconsModule, RkCheckboxModule, RkAutoCompleteModule, RkDateModule } from 'roksit-lib';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';

@NgModule({
  imports: [
    RkRadioModule,
    IconsModule,
    RkSelectModule,
    RkTableModule,
    RkModalModule,
    RkLayoutModule,
    CommonModule,
    FormsModule,
    RkFilterBadgeModule,
    RkCheckboxModule,
    RkAutoCompleteModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RkDateModule,
  ],
  declarations: [RoksitSearchComponent],
  exports: [RoksitSearchComponent],
})
export class SharedModule { }
