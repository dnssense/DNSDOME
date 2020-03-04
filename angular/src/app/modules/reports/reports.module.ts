import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DndModule } from 'ng2-dnd';
import { CollapseModule, PopoverModule, PaginationModule, TooltipModule } from 'ngx-bootstrap';
import { OverlayPanelModule } from 'primeng/primeng';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { CustomReportComponent } from './customreport/customreport.component';
import { MonitorComponent } from './monitor/monitor.component';
import { MonitorResultComponent } from './monitor/result/monitor-result.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ColumnTagInputComponent } from './shared/columntaginput/column-tag-input.component';
import { TextLimitComponent } from './shared/textlimit/text-limit.component';
import { CustomReportResultComponent } from './customreport/result/customreport-result.component';
import { CustomReportResultColumnComponent } from './customreport/result/column/customreport-result-column.component';
import { NgApexchartsModule } from 'node_modules/ng-apexcharts';
import { FlatpickrModule } from 'angularx-flatpickr';
import { RkRadioModule, RkSelectModule, IconsModule, RkTableModule, RkProgressBarModule, RkModalModule } from 'roksit-lib';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    CustomReportComponent,
    CustomReportResultComponent,
    CustomReportResultColumnComponent,
    MonitorComponent,
    MonitorResultComponent,
    ColumnTagInputComponent,
    TextLimitComponent
  ],
  imports: [
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    NgApexchartsModule,
    ReportsRoutingModule,
    PipesModule,
    FlatpickrModule.forRoot(),
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
    }),
    RkRadioModule,
    RkSelectModule,
    IconsModule.forRoot(),
    RkTableModule,
    RkProgressBarModule,
    SharedModule,
    RkModalModule
  ],
  providers: [PipesModule, DatePipe]
})
export class ReportsModule { }
