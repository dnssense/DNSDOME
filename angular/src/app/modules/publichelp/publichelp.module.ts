import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicHelpComponent } from './page/publichelp.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { PublicHelpRoutingModule } from './publichelp-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';
import { CountdownTimerModule } from 'ngx-countdown-timer';
import { FooterModule } from '../shared/footer/footer.module';

@NgModule({
  declarations: [PublicHelpComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PublicHelpRoutingModule,
    FooterModule,
    CountdownTimerModule.forRoot(),
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: translateHttpLoaderFactory,
          deps: [HttpClient]
      }
  })

  ]

})
export class PublicHelpModule { }
