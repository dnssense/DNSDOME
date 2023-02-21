import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { ProfileWizardRoutingModule } from './profile-wizard-routing.module';
import { ProfileWizardComponent } from './page/profile-wizard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RkLayoutModule, RkToggleButtonModule, RkCollapseModule, IconsModule, RkSearchModule } from 'roksit-lib';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PipesModule } from '../pipes/pipes.module';


@NgModule({
  declarations: [ProfileWizardComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
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
    RkSearchModule,
    IconsModule,
    NgbModule,
    NgbPaginationModule,
    PipesModule
  ],
  exports: [ ProfileWizardComponent ]

})
export class ProfileWizardModule { }
