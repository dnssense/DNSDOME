import { CommonModule } from '@angular/common'
import { Component, EventEmitter, inject, Output, TemplateRef, ViewChild } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { FeatherModule } from 'angular-feather'
import {
  BaseTrafficDataTable,
  ColumnDef,
  ColumnDefCustomTemplateContext,
  FilterBadgeValueV2,
  FilterEvent,
  RkTableV2Component,
  RkTranslatorService,
  RoundedNumberPipe,
  RowDefaultItemComponent,
  RowItemComponent,
  RowItemDnsQueryComponent,
  RowItemTimeComponent,
  StatsTagComponent,
  TrafficColumnNames,
} from 'roksit-lib'
import { Observable } from 'rxjs'
import {
  DnsTunnelLevel,
  DnsTunnelService,
  DnsTunnelSuspiciousEventsItem,
  DnsTunnelSuspiciousEventsUIRequest,
  DnsTunnelSuspiciousEventsUIResponse,
} from '../../../../../core/services/dns-tunnel.service'
import { TunnelSeverityNamePipe } from '../../pipes/dns-tunnel-pipes'
import { DnsTunnelCommunicationService } from '../../services/dns-tunnel-communication.service'

@Component({
  selector: 'dns-tunnel-event-report',
  standalone: true,
  imports: [
    CommonModule,
    RkTableV2Component,
    StatsTagComponent,
    TranslateModule,
    RoundedNumberPipe,
    RowItemTimeComponent,
    RoundedNumberPipe,
    FeatherModule,
    RoundedNumberPipe,
    RoundedNumberPipe,
    RowItemComponent,
    TunnelSeverityNamePipe,
    RowItemDnsQueryComponent,
    RowDefaultItemComponent,
  ],
  templateUrl: './dns-tunnel-event-report.component.html',
  styleUrls: ['./dns-tunnel-event-report.component.scss'],
})
export class DnsTunnelEventReportComponent extends BaseTrafficDataTable<
  DnsTunnelSuspiciousEventsUIResponse,
  DnsTunnelSuspiciousEventsItem,
  DnsTunnelSuspiciousEventsUIRequest
> {
  public tunnelLevels = DnsTunnelLevel
  constructor() {
    super()
    this.tableConfig = {
      ...this.tableConfig,
      rowClickable: true,
      onRowClick: this.handleRowClick.bind(this),
      sortConfig: {
        sortColumn: 'event_start_date',
        sortDirection: 'desc',
      },
    }
    this.sortColumn = this.tableConfig.sortConfig.sortColumn
    this.isAscSort = false
  }
  tunnelService = inject(DnsTunnelService)
  tunnelCommunicationService = inject(DnsTunnelCommunicationService)
  translatorService = inject(RkTranslatorService)
  @ViewChild('timestampTemplate', { static: true })
  timestampTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  @ViewChild('severityTemplate', { static: true })
  severityTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  @ViewChild('breakdownTemplate', { static: true })
  breakdownTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  @ViewChild('arrayTemplate', { static: true })
  arrayTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  @ViewChild('numberTemplate', { static: true })
  numberTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  @Output() onTunnelEventDetailClick = new EventEmitter<DnsTunnelSuspiciousEventsItem>()
  translationPrefix = 'DnsTunnel'
  originColumns: ColumnDef[]
  getServiceObservable(
    request: DnsTunnelSuspiciousEventsUIRequest
  ): Observable<DnsTunnelSuspiciousEventsUIResponse> {
    return this.tunnelService.getSuspiciousEvents(request)
  }
  resetPage() {
    super.resetPage()
  }
  initColumns() {
    this.originColumns = [
      {
        name: 'event_start_date',
        translationKey: 'Columns.EventStartTime',
        sortable: true,
        maxTruncateLength: 20,
        customTemplate: this.timestampTemplate,
      },
      {
        name: TrafficColumnNames.Domain,
        translationKey: 'Columns.Domain',
        filterable: true,
        maxTruncateLength: 20,
      },
      {
        name: 'company.hits',
        translationKey: 'Columns.Hits',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company.fqdn_count',
        translationKey: 'Columns.FQDNCount',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'res_dga.ratio',
        translationKey: 'Columns.AIBasedSubdomainScore',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company.fqdn_hit_ratio',
        translationKey: 'Columns.HitAveragePerFQDN',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'severity',
        translationKey: 'Columns.Severity',
        customTemplate: this.severityTemplate,
      },
      {
        name: 'fqdns_samples',
        translationKey: 'Columns.FQDNSample',
        maxTruncateLength: 22,
        hidden: true,
        customTemplate: this.arrayTemplate,
      },
      {
        name: 'company_lw.fqdn_count',
        translationKey: 'Columns.HitAveragePerFQDNForLast7Days',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company_lw.hits',
        translationKey: 'Columns.HitsForLast7Days',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company_lw.fqdn_hit_ratio',
        translationKey: 'Columns.FQDNHitRatioForLast7Days',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company_lw.fail_ratio',
        translationKey: 'Columns.FailRatioForLast7Days',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company_lw.fqdn_count',
        translationKey: 'Columns.FQDNCountForLast7Days',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company.fail_ratio',
        translationKey: 'Columns.FailRatio',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company.fail_count',
        translationKey: 'Columns.FailCount',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company.success_count',
        translationKey: 'Columns.SuccessCount',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'query_types',
        translationKey: 'Columns.DNSQueryTypes',
        maxTruncateLength: 20,
        customTemplate: this.breakdownTemplate,
        hidden: true,
      },
      {
        name: 'company.unique_response',
        translationKey: 'Columns.UniqueDnsResponseCount',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'company_lw.queried_before',
        translationKey: 'Columns.PreviouslyQueriedFQDNCountForLast7Days',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'other.fqdn_count',
        translationKey: 'Columns.DomainTotalFQDNCount',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'other.fail_ratio',
        translationKey: 'Columns.DomainGlobalFailRatio',
        sortable: true,
        rangeFilterable: true,
        roundNumber: true,
        hidden: true,
        customTemplate: this.numberTemplate,
      },
      {
        name: 'event_end_date',
        translationKey: 'Columns.EventEndTime',
        hidden: true,
        maxTruncateLength: 20,
        customTemplate: this.timestampTemplate,
      },
      {
        name: TrafficColumnNames.SourceIp,
        translationKey: 'Columns.ClientPublicIP',
        hidden: true,
        maxTruncateLength: 20,
      },
    ]
    this.availableColumns = []
    this.originColumns.forEach((col) => {
      this.availableColumns.push({ ...col })
    })
  }

  override handleCustomFilterModels(event: FilterEvent): FilterBadgeValueV2[] {
    const list = []
    if (event.column.name === TrafficColumnNames.Category) {
      ;(event.value as string[])?.forEach((v) => {
        list.push(new FilterBadgeValueV2(v))
      })
    } else if (event.column.name === TrafficColumnNames.CategoryGroup) {
      ;(event.value as string[])?.forEach((v) => {
        const badgeValue = new FilterBadgeValueV2(v)
        badgeValue.displayValue = this.translatorService.translate(v)
        list.push(badgeValue)
      })
    } else if (typeof event.value === 'string') {
      list.push(new FilterBadgeValueV2(event.value))
    }
    return list
  }

  override onFilterChange() {
    super.onFilterChange()
  }

  onInitPage() {
    super.onInitPage()
  }

  handleRowClick = (item: DnsTunnelSuspiciousEventsItem) => {
    this.onTunnelEventDetailClick.emit(item)
  }
}
