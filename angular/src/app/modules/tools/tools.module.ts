import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './page/tools.component';
import { ToolsRoutingModule } from './tools-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { AmazingTimePickerModule } from 'amazing-time-picker'; 


@NgModule({
  declarations: [
    ToolsComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NouisliderModule,
    MaterialModule,
    ToolsRoutingModule,
    AmazingTimePickerModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]

})
export class ToolsModule { }
