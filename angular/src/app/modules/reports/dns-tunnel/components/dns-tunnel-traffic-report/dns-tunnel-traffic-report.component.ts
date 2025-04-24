import { CommonModule } from '@angular/common'
import { Component, inject, TemplateRef, ViewChild } from '@angular/core'
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
  RowItemComponent,
  RowItemCountryComponent,
  RowItemTimeComponent,
  StatsTagComponent,
  TrafficColumnNames,
} from 'roksit-lib'
import { Observable } from 'rxjs'
import {
  DnsTunnelService,
  DnsTunnelSuspiciousTrafficItem,
  DnsTunnelSuspiciousTrafficUIRequest,
  DnsTunnelSuspiciousTrafficUIResponse,
} from '../../../../../core/services/dns-tunnel.service'

@Component({
  selector: 'dns-tunnel-traffic-report',
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
    RowItemCountryComponent,
  ],
  templateUrl: './dns-tunnel-traffic-report.component.html',
  styleUrls: ['./dns-tunnel-traffic-report.component.scss'],
})
export class DnsTunnelTrafficReportComponent extends BaseTrafficDataTable<
  DnsTunnelSuspiciousTrafficUIResponse,
  DnsTunnelSuspiciousTrafficItem,
  DnsTunnelSuspiciousTrafficUIRequest
> {
  constructor() {
    super()
    this.tableConfig = {
      ...this.tableConfig,
      rowClickable: true,
      sortConfig: {
        sortColumn: 'time',
        sortDirection: 'desc',
      },
    }
    this.sortColumn = this.tableConfig.sortConfig.sortColumn
    this.isAscSort = false
  }
  tunnelService = inject(DnsTunnelService)
  translatorService = inject(RkTranslatorService)
  @ViewChild('timestampTemplate', { static: true })
  timestampTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  @ViewChild('arrayTemplate', { static: true })
  arrayTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  @ViewChild('countryTemplate', { static: true })
  countryTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  @ViewChild('actionTemplate', { static: true })
  actionTemplate: TemplateRef<ColumnDefCustomTemplateContext>
  translationPrefix = 'DnsTunnel'
  originColumns: ColumnDef[]
  getServiceObservable(
    request: DnsTunnelSuspiciousTrafficUIRequest
  ): Observable<DnsTunnelSuspiciousTrafficUIResponse> {
    return this.tunnelService.getSuspiciousTraffic(request)
  }
  initColumns() {
    this.originColumns = [
      {
        name: TrafficColumnNames.Time,
        translationKey: 'Columns.Time',
        sortable: true,
        maxTruncateLength: 20,
        customTemplate: this.timestampTemplate,
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
        customTemplate: this.arrayTemplate,
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
        customTemplate: this.actionTemplate,
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
        customTemplate: this.countryTemplate,
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
        customTemplate: this.countryTemplate,
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
    } else if (event.column.name === TrafficColumnNames.Action) {
      list.push(
        new FilterBadgeValueV2(
          event.value as string,
          false,
          true,
          event.value
            ? this.translatorService.translate('Allow')
            : this.translatorService.translate('Block')
        )
      )
    } else if (typeof event.value === 'string') {
      list.push(new FilterBadgeValueV2(event.value))
    }
    return list
  }
}
