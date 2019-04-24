import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from './DateFormatPipe';
import { CountryPipe } from './CountryPipe';
import { CustomDecimalPipe } from './CustomDecimalPipe';

@NgModule({
  imports: [CommonModule],
  declarations: [DateFormatPipe, CountryPipe, CustomDecimalPipe],
  exports: [DateFormatPipe, CountryPipe, CustomDecimalPipe]
})
export class PipesModule { }
