import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoamingComponent } from './page/roaming.component';
import { RoamingRoutingModule } from './roaming-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module';
import { IconsModule, RkCheckboxModule, RkModalModule, RkTableModule } from 'roksit-lib';
import { PipesModule } from '../shared/pipes/pipes.module';

@NgModule({
  declarations: [
    RoamingComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    RoamingRoutingModule,
    ProfileWizardModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IconsModule,
    RkTableModule,
    RkCheckboxModule,
    RkModalModule,
    PipesModule
  ]

})
export class RoamingModule { }
