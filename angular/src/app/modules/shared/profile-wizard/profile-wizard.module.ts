import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { ProfileWizardRoutingModule } from './profile-wizard-routing.module';
import { ProfileWizardComponent } from './page/profile-wizard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RkLayoutModule, RkToggleButtonModule, RkCollapseModule, IconsModule } from 'roksit-lib';


@NgModule({
  declarations: [ProfileWizardComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    ProfileWizardRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RkLayoutModule,
    RkToggleButtonModule,
    RkCollapseModule,
    IconsModule
  ],
  exports: [ ProfileWizardComponent ]

})
export class ProfileWizardModule { }
