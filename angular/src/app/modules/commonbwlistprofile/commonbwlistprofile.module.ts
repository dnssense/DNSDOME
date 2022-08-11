import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonBWListProfileComponent } from './page/commonbwlistprofile.component';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { AmazingTimePickerModule } from 'amazing-time-picker';
import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module';
import { IconsModule, RkTableModule, RkModalModule, RkSelectModule, RkCheckboxModule } from 'roksit-lib';
import { PipesModule } from '../shared/pipes/pipes.module';
import { CommonBWListProfileRoutingModule } from './commonbwlistprofile-routing.module';


@NgModule({
  declarations: [
    CommonBWListProfileComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    CommonBWListProfileRoutingModule,
    //AmazingTimePickerModule,
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
    RkCheckboxModule,
  ]

})
export class CommonBWListProfileModule { }
