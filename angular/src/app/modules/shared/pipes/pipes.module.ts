import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from './DateFormatPipe';

@NgModule({
  imports: [CommonModule],
  declarations: [DateFormatPipe],
  exports: [DateFormatPipe]
})
export class PipesModule {}
