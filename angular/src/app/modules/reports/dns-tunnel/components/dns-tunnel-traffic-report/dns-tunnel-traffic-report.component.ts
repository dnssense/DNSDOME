import {
  BaseTrafficDataTable,
  CategoryTextPipe,
  ColumnDef,
  FilterAddEventModel,
  FilterBadgeValueV2,
  IconStatsComponent,
  RkPillComponent,
  RkTableV2Component,
  RkTranslatorService,
  RoundedNumberPipe,
  RowItemBadgeComponent,
  RowItemComponent,
  RowItemCountryComponent,
  RowItemDnsQueryComponent,
  RowItemLinkComponent,
  RowItemProgressComponent,
  RowItemTimeComponent,
  RowTruncatedContainerComponent,
  RowTruncatedInfoComponent,
  StatsTagComponent,
  TrafficColumnNames,
} from 'roksit-lib';
import {CommonModule} from '@angular/common';
import {Component, inject, TemplateRef, ViewChild} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {NgbProgressbar} from '@ng-bootstrap/ng-bootstrap';
import {FeatherModule} from 'angular-feather';
import {
  DnsTunnelService,
  DnsTunnelSuspiciousTrafficItem,
  DnsTunnelSuspiciousTrafficUIRequest,
  DnsTunnelSuspiciousTrafficUIResponse
} from '../../../../../core/services/dns-tunnel.service';
import {TunnelSeverityNamePipe} from '../../pipes/dns-tunnel-pipes';

@Component({
  selector: 'dns-tunnel-traffic-report',
  standalone: true,
  imports: [CommonModule, IconStatsComponent, RkTableV2Component, RowItemBadgeComponent, StatsTagComponent, TranslateModule, RowItemLinkComponent, RoundedNumberPipe, RowItemTimeComponent, RoundedNumberPipe, FeatherModule, RowTruncatedInfoComponent, RoundedNumberPipe, RowTruncatedContainerComponent, RowItemProgressComponent, NgbProgressbar, RoundedNumberPipe, RowItemLinkComponent, RowItemComponent, CategoryTextPipe, RowItemCountryComponent, TunnelSeverityNamePipe, RowItemDnsQueryComponent, RkPillComponent],
  templateUrl: './dns-tunnel-traffic-report.component.html',
  styleUrls: ['./dns-tunnel-traffic-report.component.scss'],
})
export class DnsTunnelTrafficReportComponent extends BaseTrafficDataTable<DnsTunnelSuspiciousTrafficUIResponse, DnsTunnelSuspiciousTrafficItem, DnsTunnelSuspiciousTrafficUIRequest> {
  constructor() {
    super();
    this.tableConfig = {
      ...this.tableConfig,
      rowClickable: true,
      sortConfig: {
        sortColumn: 'time',
        sortDirection: 'desc'
      }
    };
    this.sortColumn = this.tableConfig.sortConfig.sortColumn;
    this.isAscSort = false;
  }
  tunnelService = inject(DnsTunnelService);
  translatorService = inject(RkTranslatorService);
  @ViewChild('timestampTemplate', {static: true}) timestampTemplate: TemplateRef<HTMLElement>;
  @ViewChild('arrayTemplate', {static: true}) arrayTemplate: TemplateRef<HTMLElement>;
  @ViewChild('countryTemplate', {static: true}) countryTemplate: TemplateRef<HTMLElement>;
  @ViewChild('actionTemplate', {static: true}) actionTemplate: TemplateRef<HTMLElement>;
  translationPrefix = 'DnsTunnel';
  originColumns: ColumnDef[];
  getServiceObservable(request: DnsTunnelSuspiciousTrafficUIRequest): Observable<DnsTunnelSuspiciousTrafficUIResponse> {
    return this.tunnelService.getSuspiciousTraffic(request);
  }
  initColumns() {
    this.originColumns = [
      {
        name: TrafficColumnNames.Time,
        translationKey: 'Columns.Time',
        sortable: true,
        maxTruncateLength: 20,
        customTemplate: this.timestampTemplate
      },
      {
        name: 'location',
        translationKey: 'Columns.LocationAgent',
        filterable: true,
        maxTruncateLength: 20,
      },
      {
        name: TrafficColumnNames.Subdomain,
        translationKey: 'Columns.Subdomain',
        filterable: true,
        maxTruncateLength: 20,
      },
      {
        name: TrafficColumnNames.DomainIp,
        translationKey: 'Columns.DestinationIp',
        filterable: true,
        maxTruncateLength: 20,
      },
      {
        name: TrafficColumnNames.Category,
        translationKey: 'Columns.Category',
        filterable: true,
        maxTruncateLength: 20,
        customTemplate: this.arrayTemplate
      },
      {
        name: TrafficColumnNames.Application,
        translationKey: 'Columns.Application',
        filterable: true,
        maxTruncateLength: 20,
      },
      {
        name: TrafficColumnNames.Action,
        translationKey: 'Columns.Action',
        filterable: true,
        maxTruncateLength: 20,
        customTemplate: this.actionTemplate
      },
      {
        name: TrafficColumnNames.SourceIp,
        translationKey: 'Columns.SourceIp',
        filterable: true,
        hidden: true,
        maxTruncateLength: 20,
      },
      {
        name: 'sourceIpCountryCode',
        translationKey: 'Columns.SourceCountry',
        filterable: true,
        hidden: true,
        maxTruncateLength: 20,
        customTemplate: this.countryTemplate
      },
      {
        name: TrafficColumnNames.Domain,
        translationKey: 'Columns.Domain',
        filterable: true,
        hidden: true,
        maxTruncateLength: 20,
      },
      {
        name: 'blockReason',
        translationKey: 'Columns.ReasonOfBlocking',
        hidden: true,
        filterable: true,
        maxTruncateLength: 20,
      },
      {
        name: TrafficColumnNames.DomainCountry,
        translationKey: 'Columns.DestinationCountry',
        filterable: true,
        hidden: true,
        maxTruncateLength: 20,
        customTemplate: this.countryTemplate
      }
    ];
    this.availableColumns = [];
    this.originColumns.forEach(col => {
      this.availableColumns.push({...col});
    });
  }

  override handleCustomFilterModels(event: FilterAddEventModel): FilterBadgeValueV2[] {
    const list = [];
    if (event.column.name === TrafficColumnNames.Category) {
      (event.value as string[])?.forEach(v => {
        list.push(new FilterBadgeValueV2(v));
      });
    } else if (event.column.name === TrafficColumnNames.CategoryGroup) {
      (event.value as string[])?.forEach(v => {
        const badgeValue = new FilterBadgeValueV2(v);
        badgeValue.displayValue = this.translatorService.translate(v);
        list.push(badgeValue);
      });
    }else if (event.column.name === TrafficColumnNames.Action) {
      list.push(new FilterBadgeValueV2(event.value as string, false, true, event.value ? this.translatorService.translate('Allow') : this.translatorService.translate('Block')));
    } else if (typeof event.value === 'string') {
      list.push(new FilterBadgeValueV2(event.value));
    }
    return list;
  }
}
