import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from './DateFormatPipe';
import { CountryPipe } from './CountryPipe';
import { CustomDecimalPipe } from './CustomDecimalPipe';
import { MacAddressFormatterPipe } from './MacAddressFormatterPipe';
import { FilterPipe } from './filter.pipe';

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
      FilterPipe
   ],
   exports: [
      DateFormatPipe,
      CountryPipe,
      CustomDecimalPipe,
      MacAddressFormatterPipe,
      FilterPipe
   ]
})
export class PipesModule { }
