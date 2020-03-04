import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagenotfoundComponent } from './page/pagenotfound/pagenotfound.component';
import { PagenotfoundRoutingModule } from './pagenotfound-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [ PagenotfoundComponent],
  imports: [
    CommonModule,
    PagenotfoundRoutingModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: translateHttpLoaderFactory,
          deps: [HttpClient]
      }
  })

  ]
})
export class PagenotfoundModule { }
