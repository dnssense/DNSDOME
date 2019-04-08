import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from './DateFormatPipe';
import { CountryPipe } from './CountryPipe';

@NgModule({
  imports: [CommonModule],
  declarations: [DateFormatPipe, CountryPipe],
  exports: [DateFormatPipe, CountryPipe]
})
export class PipesModule { }
