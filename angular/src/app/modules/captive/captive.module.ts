import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptiveComponent } from './page/captive.component';
import { CaptiveRoutingModule } from './captive-routing.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';

@NgModule({
  declarations: [CaptiveComponent],
  imports: [
    CommonModule,
    CaptiveRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
})
export class CaptiveModule { }
