import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoksitSearchComponent } from './roksit-search/roksit-search.component';
import { RkRadioModule, RkSelectModule, RkTableModule, RkModalModule, RkLayoutModule, RkFilterBadgeModule, IconsModule, RkCheckboxModule, RkAutoCompleteModule } from 'roksit-lib';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    RkAutoCompleteModule
  ],
  declarations: [RoksitSearchComponent],
  exports: [RoksitSearchComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
