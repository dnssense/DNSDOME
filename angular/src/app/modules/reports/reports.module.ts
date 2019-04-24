import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DndModule } from "ng2-dnd";
import { NouisliderModule } from 'ng2-nouislider';
import { CollapseModule, PopoverModule, PaginationModule, TooltipModule } from 'ngx-bootstrap';
import { OverlayPanelModule } from "primeng/primeng";
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { CustomReportComponent } from './customreport/customreport.component';
import { MonitorComponent } from './monitor/monitor.component';
import { MonitorResultComponent } from './monitor/result/monitor-result.component';
import { MonitorSearchComponent } from './monitor/search/monitor-search.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ColumnTagInputComponent } from './shared/columntaginput/column-tag-input.component';
import { TextLimitComponent } from './shared/textlimit/text-limit.component';
import { CustomReportSearchComponent } from './customreport/search/customreport-search.component';
import { CustomReportResultComponent } from './customreport/result/customreport-result.component';
import { CustomReportResultColumnComponent } from './customreport/result/column/customreport-result-column.component';
import { HistogramComponent } from './shared/histogram/histogram.component';


@NgModule({
  declarations: [
    CustomReportComponent,
    CustomReportSearchComponent,
    CustomReportResultComponent,
    CustomReportResultColumnComponent,
    MonitorComponent,
    MonitorSearchComponent,
    MonitorResultComponent,
    ColumnTagInputComponent,
    HistogramComponent,
    TextLimitComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NouisliderModule,
    MaterialModule,
    ReportsRoutingModule,
    PipesModule,
    DndModule.forRoot(),
    CollapseModule.forRoot(),
    PopoverModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    OverlayPanelModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [PipesModule]
})
export class ReportsModule { }
