import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { IconsModule, RkCheckboxModule, RkModalModule, RkRadioModule, RkSelectModule, RkSwitchModule, RkTableModule, RkToggleButtonModule } from 'roksit-lib';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module';
import { RoamingComponent } from './page/roaming.component';
import { RoamingRoutingModule } from './roaming-routing.module';

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
    PipesModule,
    RkToggleButtonModule,
    RkSelectModule,
    RkSwitchModule,
    RkRadioModule,
  ]

})
export class RoamingModule { }
