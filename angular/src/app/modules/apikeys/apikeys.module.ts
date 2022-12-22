import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiKeysComponent } from './page/apikeys.component';
import { ApiKeysRoutingModule } from './apikeys-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule, RkTableModule, RkModalModule, RkSelectModule, RkCheckboxModule, RkSearchModule } from 'roksit-lib';
import { PipesModule } from '../shared/pipes/pipes.module';

@NgModule({
  declarations: [
    ApiKeysComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    ApiKeysRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RkTableModule,
    IconsModule,
    PipesModule,
    RkModalModule,
    RkSelectModule,
    RkCheckboxModule,
    RkSearchModule
  ]

})
export class ApiKeysModule { }
