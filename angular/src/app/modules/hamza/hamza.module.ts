import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HamzaComponent } from './page/hamza.component';
import { HamzaRoutingModule } from './hamza-routing.module';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';



@NgModule({
  declarations: [HamzaComponent],
  imports: [
    CommonModule,    
   
    HamzaRoutingModule,
   
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: translateHttpLoaderFactory,
          deps: [HttpClient]
      }
  })
    
  ]
  
})
export class HamzaModule { }
