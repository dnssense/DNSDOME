import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesComponent } from './page/devices.component';
import { DevicesRoutingModule } from './devices-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { TimeProfileComponent } from './components/time-profile/time-profile.component';
import { BoxWizardComponent } from './components/box-wizard/box-wizard.component';
import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { RkTableModule, IconsModule } from 'roksit-lib';



@NgModule({
  declarations: [
    DevicesComponent,
    TimeProfileComponent,
    BoxWizardComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PipesModule,
    MaterialModule,
    DevicesRoutingModule,
    AmazingTimePickerModule,
    ProfileWizardModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RkTableModule,
    IconsModule
  ],
  providers:[PipesModule]

})
export class DevicesModule { }
