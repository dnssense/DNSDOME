import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardComponent } from './page/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RkProgressBarModule, RkDateModule, RkTableModule, RkInfoBoxModule, IconsModule } from 'roksit-lib';
//import { TagInputModule } from 'ngx-chips';
import {Dashboardv2Component} from './page/dashboardv2.component';
import {AgentsComponent} from './page/childcomponents/agents.component';
import {TopdateComponent} from './page/childcomponents/topdate.component';
import {GroupItemComponent} from './page/childcomponents/group-item.component';
import {GroupComponent} from './page/childcomponents/group.component';
import {CategoryComponent} from './page/childcomponents/category.component';
import {DashboardChartComponent} from './page/childcomponents/dashboard-chart.component';
import {DomainComponent} from './page/childcomponents/domain.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FeatherModule } from 'angular-feather';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

/*TagInputModule.withDefaults({
  tagInput: {
    placeholder: 'Domain...'
  }
});*/

@NgModule({
  declarations: [DashboardComponent, Dashboardv2Component, AgentsComponent,
    TopdateComponent, GroupItemComponent, GroupComponent, CategoryComponent, DashboardChartComponent, DomainComponent],
  providers: [DatePipe],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DashboardRoutingModule,
    RkProgressBarModule,
    RkDateModule,
    RkTableModule,
    RkInfoBoxModule,
    IconsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MatFormFieldModule, 
    MatChipsModule, 
    FeatherModule,
    MatAutocompleteModule
    //TagInputModule
  ],
  schemas: [NO_ERRORS_SCHEMA]

})
export class DashboardModule { }
