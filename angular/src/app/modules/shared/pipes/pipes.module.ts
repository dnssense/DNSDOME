import { CommonModule } from '@angular/common';
import { Injectable, NgModule } from '@angular/core';
import { CountryPipe } from './CountryPipe';
import { CustomDecimalPipe } from './CustomDecimalPipe';
import { DateFormatPipe } from './DateFormatPipe';
import { FilterPipe } from './filter.pipe';
import { MacAddressFormatterPipe } from './MacAddressFormatterPipe';
import { MultiFilterPipe } from './multifilter.pipe';

@Injectable()
@NgModule({
   imports: [
      CommonModule
   ],
   declarations: [
      DateFormatPipe,
      CountryPipe,
      CustomDecimalPipe,
      MacAddressFormatterPipe,
      FilterPipe,
      MultiFilterPipe
   ],
   exports: [
      DateFormatPipe,
      CountryPipe,
      CustomDecimalPipe,
      MacAddressFormatterPipe,
      FilterPipe,
      MultiFilterPipe
   ]
})
export class PipesModule { }
