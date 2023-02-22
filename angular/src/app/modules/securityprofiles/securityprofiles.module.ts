import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityProfilesComponent } from './page/securityprofiles.component';
import { SecurityProfilesRoutingModule } from './securityprofiles-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module';
import { IconsModule, RkTableModule, RkModalModule, RkSelectModule, RkSearchModule } from 'roksit-lib';
import { PipesModule } from '../shared/pipes/pipes.module';


@NgModule({
  declarations: [
    SecurityProfilesComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SecurityProfilesRoutingModule,
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
    PipesModule,
    RkModalModule,
    RkSelectModule,
    RkSearchModule
  ]

})
export class SecurityProfilesModule { }
