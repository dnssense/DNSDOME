import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CyteLoginComponent } from './page/cytelogin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CyteLoginRoutingModule } from './cytelogin-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [CyteLoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CyteLoginRoutingModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: translateHttpLoaderFactory,
          deps: [HttpClient]
      }
  })

  ]

})
export class CyteLoginModule { }
