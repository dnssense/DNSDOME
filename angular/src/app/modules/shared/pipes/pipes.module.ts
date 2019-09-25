import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from './DateFormatPipe';
import { CountryPipe } from './CountryPipe';
import { CustomDecimalPipe } from './CustomDecimalPipe';
import { MacAddressFormatterPipe } from './MacAddressFormatterPipe';

@NgModule({
   imports: [
      CommonModule
   ],
   declarations: [
      DateFormatPipe,
      CountryPipe,
      CustomDecimalPipe,
      MacAddressFormatterPipe
   ],
   exports: [
      DateFormatPipe,
      CountryPipe,
      CustomDecimalPipe,
      MacAddressFormatterPipe
   ]
})
export class PipesModule { }
