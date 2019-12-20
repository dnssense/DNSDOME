import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicipComponent } from './page/publicip.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PublicipRoutingModule } from '../publicip/publicip-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';
import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module';

@NgModule({
  declarations: [PublicipComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    PublicipRoutingModule,
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
export class PublicipModule { }
