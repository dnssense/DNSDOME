import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityProfilesComponent } from './page/securityprofiles.component';
import { SecurityProfilesRoutingModule } from './securityprofiles-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module';


@NgModule({
  declarations: [
    SecurityProfilesComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NouisliderModule,
    MaterialModule,
    SecurityProfilesRoutingModule,
    AmazingTimePickerModule,
    ProfileWizardModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]

})
export class SecurityProfilesModule { }
