import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicipComponent } from './page/publicip.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { PublicipRoutingModule } from '../publicip/publicip-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';
import { FieldErrorDisplayComponent } from './components/field-error-display/field-error-display.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NouisliderModule,
    MaterialModule,
    PublicipRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [PublicipComponent,FieldErrorDisplayComponent]
})
export class PublicipModule { }
