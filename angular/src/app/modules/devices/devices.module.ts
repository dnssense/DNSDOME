import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesComponent } from './page/devices.component';
import { DevicesRoutingModule } from './devices-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { RkTableModule, IconsModule, RkModalModule, RkRadioModule, RkCheckboxModule, RkSelectModule, RkSearchModule } from 'roksit-lib';



@NgModule({
  declarations: [
    DevicesComponent,
    ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PipesModule,
    MaterialModule,
    DevicesRoutingModule,
    ProfileWizardModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RkTableModule,
    IconsModule,
    RkModalModule,
    RkRadioModule,
    RkCheckboxModule,
    RkSelectModule,
    RkSearchModule
  ],
  providers: [PipesModule]

})
export class DevicesModule { }
