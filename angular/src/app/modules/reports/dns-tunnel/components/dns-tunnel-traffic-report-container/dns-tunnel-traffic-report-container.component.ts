import {
  ActionTypeSelectionComponent,
  BaseFilterWrapperComponent,
  CategorySelectionComponent,
  CategoryTextPipe,
  CommonManualSelectionComponent,
  DomainSelectionComponent,
  FilterBadgeModelV2,
  FilterBadgeValueV2,
  FilterDropDownConfig,
  IpSelectionComponent,
  RkFilterServiceV2,
  RkWeekDayCalendarComponent,
  RowTruncatedContainerComponent,
  RowTruncatedInfoComponent,
  StatsTagComponent,
  SubdomainSelectionComponent,
  TrafficColumnNames,
  TrafficFilterBadgeModel,
  CountrySelectionComponent,
  ApplicationSelectionComponent,
  BaseFilterInput,
  ActionType, RkPillComponent
} from 'roksit-lib';
import {CommonModule} from '@angular/common';
import {Component, inject, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {NgbProgressbar} from '@ng-bootstrap/ng-bootstrap';
import {FeatherModule} from 'angular-feather';
import {TunnelSeverityNamePipe} from '../../pipes/dns-tunnel-pipes';
import * as moment from 'moment/moment';
import {DnsTunnelTrafficReportComponent} from '../dns-tunnel-traffic-report/dns-tunnel-traffic-report.component';
import {DnsTunnelSuspiciousEventsItem} from '../../../../../core/services/dns-tunnel.service';

@Component({
  selector: 'dns-tunnel-traffic-report-container',
  standalone: true,
  imports: [CommonModule, StatsTagComponent, TranslateModule, FeatherModule, RowTruncatedInfoComponent, RowTruncatedContainerComponent, NgbProgressbar, CategoryTextPipe, TunnelSeverityNamePipe, BaseFilterWrapperComponent, RkWeekDayCalendarComponent, ActionTypeSelectionComponent, DomainSelectionComponent, CommonManualSelectionComponent, IpSelectionComponent, CountrySelectionComponent, SubdomainSelectionComponent, CategorySelectionComponent, ApplicationSelectionComponent, DnsTunnelTrafficReportComponent, RkPillComponent],
  templateUrl: './dns-tunnel-traffic-report-container.component.html',
  styleUrls: ['./dns-tunnel-traffic-report-container.component.scss'],
  providers: [RkFilterServiceV2]
})
export class DnsTunnelTrafficReportContainerComponent implements OnInit {
  actionTypes = ActionType;
  rkFilterService = inject(RkFilterServiceV2);
  @ViewChild('filterWrapperComponent', {static: false}) filterComponent: BaseFilterWrapperComponent;
  @ViewChild('tunnelTrafficReportComponent', {static: false}) tunnelTrafficReportComponent: DnsTunnelTrafficReportComponent;
  @ViewChild('domainFilter', {static: true}) domainFilter: TemplateRef<HTMLElement>;
  @ViewChild('domainIpFilter', {static: true}) domainIpFilter: TemplateRef<HTMLElement>;
  @ViewChild('sourceIpFilter', {static: true}) sourceIpFilter: TemplateRef<HTMLElement>;
  @ViewChild('locationAgentFilter', {static: true}) locationAgentFilter: TemplateRef<HTMLElement>;
  @ViewChild('actionTypeFilter', {static: true}) actionTypeFilter: TemplateRef<HTMLElement>;
  @ViewChild('sourceCountryFilter', {static: true}) sourceCountryFilter: TemplateRef<HTMLElement>;
  @ViewChild('destinationCountryFilter', {static: true}) destinationCountryFilter: TemplateRef<HTMLElement>;
  @ViewChild('subdomainFilter', {static: true}) subdomainFilter: TemplateRef<HTMLElement>;
  @ViewChild('blockReasonFilter', {static: true}) blockReasonFilter: TemplateRef<HTMLElement>;
  @ViewChild('categoryFilter', {static: true}) categoryFilter: TemplateRef<HTMLElement>;
  @ViewChild('applicationFilter', {static: true}) applicationFilter: TemplateRef<HTMLElement>;
  selectedDateInterval: [Date, Date];
  hourIntervalLbl = '';
  filterDropDownList: FilterDropDownConfig;
  filterTypes: Map<string, TrafficFilterBadgeModel>;
  filter: BaseFilterInput;
  _tunnelEventItem: DnsTunnelSuspiciousEventsItem;
  @Input()
  public get tunnelEventItem() {
    return this._tunnelEventItem;
  }
  public set tunnelEventItem(item: DnsTunnelSuspiciousEventsItem) {
    this._tunnelEventItem = item;
    if (this.tunnelTrafficReportComponent) {
      this.initFilter();
    }
  }
  ngOnInit(): void {
    this.initFilter();
  }
  initFilter = () => {
      const domainFilter =  new FilterBadgeModelV2(TrafficColumnNames.Domain, true, [new FilterBadgeValueV2(this.tunnelEventItem.domain, true)], 'Columns.Domain', false, false, false, this.domainFilter);
      domainFilter.forceCreate = true;
      this.filter = {gte: moment(this.tunnelEventItem.event_start_date).toDate().getTime(), lt: moment(this.tunnelEventItem.event_end_date).toDate().getTime(), filterList: [domainFilter]};
      if (this.tunnelTrafficReportComponent) {
        this.rkFilterService.updateFilter(this.filter, true);
      }
    this.updateDateInterval();
    this.initFilterTypes();
  }
  updateDateInterval = () => {
    this.selectedDateInterval = [new Date(this.filter.gte), new Date(this.filter.lt)];
    const diff = this.filter.lt - this.filter.gte;
    const secMultiplier = 60 * 1000;
    if ( diff < 24 * 60 * secMultiplier - 1) {
      this.hourIntervalLbl = moment(this.selectedDateInterval[0]).format('HH:mm') + ' - ' + moment(this.selectedDateInterval[1]).format('HH:mm');
    } else {
      this.hourIntervalLbl = '';
    }
  }
  dateChanged = (event: { gte: number, lt: number }) => {
    this.filter.gte = event.gte;
    this.filter.lt = event.lt;
    this.rkFilterService.updateFilter(this.filter);
    this.updateDateInterval();
  }
  dateSelected = (dates: [Date, Date]) => {
    if (dates[0]?.getTime() !== this.filter.gte
      || dates[1]?.getTime() !== this.filter.lt) {
      this.dateChanged({gte: dates[0]?.getTime(), lt: dates[1].getTime()});
    }
  }
  removeHourFilter = () => {
    const gte = moment(this.filter.gte).startOf('day').toDate().getTime();
    const lt =  moment(this.filter.lt).endOf('day').toDate().getTime();
    this.dateChanged({gte, lt});
  }
  addFilterItems = (filterItem: FilterBadgeModelV2, itemValues?: string[], objectItemValues?: FilterBadgeValueV2[]) => {
    this.filterComponent?.addFilterItems(filterItem, itemValues, objectItemValues);
  }

  deleteFilterItem = (filter: FilterBadgeModelV2, itemValue: string) => {
    this.filterComponent?.deleteFilterItem(filter, itemValue);
  }

  deleteAllFilterItems = (filter: FilterBadgeModelV2) => {
    this.filterComponent?.deleteAllFilterItems(filter);
  }
  deleteMultipleFilterItems = (filter: FilterBadgeModelV2, items: string[], objectItems?: FilterBadgeValueV2[]) => {
    this.filterComponent?.deleteMultipleFilterItems(filter, items, objectItems);
  }
  mapToList(filter: FilterBadgeModelV2): string[] {
    return this.filterComponent?.mapToList(filter);
  }

  setFilterItems = (filterItem: FilterBadgeModelV2, itemValues: string[], objectItemValues?: FilterBadgeValueV2[]) => {
    this.filterComponent?.setFilterItems(filterItem, itemValues, objectItemValues);
  }
  filterApplied = (baseFilter: BaseFilterInput) => {
  }
  initFilterTypes = () => {
    this.filterTypes = new Map<string, TrafficFilterBadgeModel>([
      ['location', {
        name: 'location',
        translationKey: 'Columns.LocationAgent',
        equal: true,
        values: [],
        template: this.locationAgentFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.Domain, {
        name: TrafficColumnNames.Domain,
        translationKey: 'Columns.Domain',
        equal: true,
        values: [],
        template: this.domainFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.DomainIp, {
        name: TrafficColumnNames.DomainIp,
        translationKey: 'Columns.DestinationIp',
        equal: true,
        values: [],
        template: this.domainIpFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.DomainIp, {
        name: TrafficColumnNames.DomainIp,
        translationKey: 'Columns.DestinationIp',
        equal: true,
        values: [],
        template: this.domainIpFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.Category, {
        name: TrafficColumnNames.Category,
        translationKey: 'Columns.Category',
        equal: true,
        values: [],
        template: this.categoryFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.Application, {
        name: TrafficColumnNames.Application,
        translationKey: 'Columns.Application',
        equal: true,
        values: [],
        template: this.applicationFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.Action, {
        name: TrafficColumnNames.Action,
        translationKey: 'Columns.Action',
        equal: true,
        values: [],
        template: this.actionTypeFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.SourceIp, {
        name: TrafficColumnNames.SourceIp,
        translationKey: 'Columns.SourceIp',
        equal: true,
        values: [],
        template: this.sourceIpFilter,
        disableTabs: []
      }],
      ['sourceIpCountryCode', {
        name: 'sourceIpCountryCode',
        translationKey: 'Columns.SourceCountry',
        equal: true,
        values: [],
        template: this.sourceCountryFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.Subdomain, {
        name: TrafficColumnNames.Subdomain,
        translationKey: 'Columns.Subdomain',
        equal: true,
        values: [],
        template: this.subdomainFilter,
        disableTabs: []
      }],
      ['blockReason', {
        name: 'blockReason',
        translationKey: 'Columns.ReasonOfBlocking',
        equal: true,
        values: [],
        template: this.blockReasonFilter,
        disableTabs: []
      }],
      [TrafficColumnNames.DomainCountry, {
        name: TrafficColumnNames.DomainCountry,
        translationKey: 'Columns.DestinationCountry',
        equal: true,
        values: [],
        template: this.destinationCountryFilter,
        disableTabs: []
      }],
    ]);
    this.filterDropDownList = {
      firstPart: [
        {
          relatedFilter: this.filterTypes.get('location'),
        },
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.Domain),
        },
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.DomainIp),
        },
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.Category),
        },
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.Application),
        },
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.Action),
        },
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.SourceIp),
        },
        {
          relatedFilter: this.filterTypes.get('sourceIpCountryCode'),
        },
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.Subdomain),
        },
        {
          relatedFilter: this.filterTypes.get('blockReason'),
        },
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.DomainCountry),
        }
      ]
    };
  }
}
