import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgApexchartsModule } from 'node_modules/ng-apexcharts';
import { IconsModule, RkAutoCompleteModule, RkCheckboxModule, RkDateModule, RkFilterBadgeModule, RkModalModule, RkProgressBarModule, RkRadioModule, RkSelectModule, RkTableModule } from 'roksit-lib';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { SharedModule } from '../shared/shared.module';
import { AuditComponent } from './audit/audit.component';
import { AuditResultComponent } from './audit/result/audit-result.component';
import { AuditSearchComponent } from './audit/search/audit-search.component';
import { CustomReportComponent } from './customreport/customreport.component';
import { CustomReportResultColumnComponent } from './customreport/result/column/customreport-result-column.component';
import { CustomReportResultComponent } from './customreport/result/customreport-result.component';
import { MonitorComponent } from './monitor/monitor.component';
import { MonitorResultComponent } from './monitor/result/monitor-result.component';
import { ReportsRoutingModule } from './reports-routing.module';
// import { ColumnTagInputComponent } from './shared/columntaginput/column-tag-input.component';
import { TextLimitComponent } from './shared/textlimit/text-limit.component';

@NgModule({
  declarations: [
    CustomReportComponent,
    CustomReportResultComponent,
    CustomReportResultColumnComponent,
    MonitorComponent,
    MonitorResultComponent,
    TextLimitComponent,
    AuditComponent,
    AuditResultComponent,
    AuditSearchComponent
  ],
  imports: [
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    NgApexchartsModule,
    ReportsRoutingModule,
    PipesModule,
    CollapseModule.forRoot(),
    PopoverModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RkRadioModule,
    RkSelectModule,
    IconsModule.forRoot(),
    RkTableModule,
    RkProgressBarModule,
    SharedModule,
    RkModalModule,
    RkCheckboxModule,
    RkFilterBadgeModule,
    RkAutoCompleteModule,
    RkDateModule
  ],
  providers: [PipesModule, DatePipe]
})
export class ReportsModule { }
