import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoksitSearchComponent } from './roksit-search/roksit-search.component';
import { RkRadioModule, RkSelectModule } from 'roksit-lib';

@NgModule({
  imports : [RkRadioModule, RkSelectModule],
  declarations : [RoksitSearchComponent],
  exports : [RoksitSearchComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
