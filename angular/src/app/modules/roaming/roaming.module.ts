import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import {
  IconsModule,
  RkCheckboxModule,
  RkModalModule,
  RkRadioModule,
  RkSearchModule,
  RkSelectModule,
  RkSwitchModule,
  RkTableModule,
  RkToggleButtonModule,
} from 'roksit-lib'
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper'
import { PipesModule } from '../shared/pipes/pipes.module'
import { ProfileWizardModule } from '../shared/profile-wizard/profile-wizard.module'
import { ShowBlockPageComponent } from './components/show-block-page/show-block-page.component'
import { RoamingComponent } from './page/roaming.component'
import { RoamingRoutingModule } from './roaming-routing.module'

@NgModule({
  declarations: [RoamingComponent, ShowBlockPageComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RoamingRoutingModule,
    ProfileWizardModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
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
    RkSearchModule,
  ],
})
export class RoamingModule {}
