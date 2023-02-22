import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule, RkSelectModule } from 'roksit-lib';
import { CategoryRequestComponent } from './category-request.component';
import { CategoryRequestRoutingModule } from './category-request-routing.module';

@NgModule({
  declarations: [
    CategoryRequestComponent
],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CategoryRequestRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IconsModule,
    RkSelectModule
  ]

})
export class CategoryRequestModule { }
