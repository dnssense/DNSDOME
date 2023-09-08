import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RkNSwitchModule,
  RkNSwitchModel,
  RkTranslatorService,
  BaseFilterWrapperComponent,
  RkPillComponent,
  RkWeekDayCalendarComponent,
  BaseFilterInput,
  RkTabsViewComponent,
  RkTabViewComponent,
  TrafficFilterBadgeModel,
  FilterDropDownConfig,
  FilterBadgeModelV2,
  FilterBadgeValueV2,
  DomainSelectionComponent,
  TrafficColumnNames,
  RkFilterServiceV2,
  CommonManualSelectionComponent,
  RkButtonV2Component, NestedDialogCustomConfig, CommonDialogCustomConfig
} from 'roksit-lib';
import {TranslateModule} from '@ngx-translate/core';
import {FeatherModule} from 'angular-feather';
import {DnsTunnelHistogramComponent} from './components/histogram/histogram.component';
import {Subject} from 'rxjs';
import {DnsTunnelCommunicationService} from './services/dns-tunnel-communication.service';
import {
  DnsTunnelColumns,
  DnsTunnelLevel,
  DnsTunnelSuspiciousEventsItem
} from '../../../core/services/dns-tunnel.service';
import * as moment from 'moment';
import {DnsTunnelEventReportComponent} from './components/dns-tunnel-event-report/dns-tunnel-event-report.component';
import {
  DnsTunnelTrafficReportComponent
} from './components/dns-tunnel-traffic-report/dns-tunnel-traffic-report.component';
import {
  DnsTunnelTrafficReportContainerComponent
} from './components/dns-tunnel-traffic-report-container/dns-tunnel-traffic-report-container.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ManageExceptionsComponent} from './components/manage-exceptions/manage-exceptions.component';

@Component({
  selector: 'app-dns-tunnel',
  standalone: true,
  imports: [CommonModule, RkNSwitchModule, TranslateModule, BaseFilterWrapperComponent, FeatherModule, RkPillComponent, RkWeekDayCalendarComponent, DnsTunnelHistogramComponent, RkTabsViewComponent, RkTabViewComponent, DomainSelectionComponent, DnsTunnelEventReportComponent, DnsTunnelTrafficReportComponent, CommonManualSelectionComponent, DnsTunnelTrafficReportContainerComponent, RkButtonV2Component, MatDialogModule],
  templateUrl: './dns-tunnel.component.html',
  styleUrls: ['./dns-tunnel.component.sass']
})
export default class DnsTunnelComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('histogram') histogram: DnsTunnelHistogramComponent;
  @ViewChild('calendar', {static: false}) calendar: RkWeekDayCalendarComponent;
  @ViewChild('filterWrapperComponent', {static: false}) filterComponent: BaseFilterWrapperComponent;
  @ViewChild('trafficReportContainer', {static: false}) trafficReportContainer: ElementRef;
  dialog = inject(MatDialog);
  @ViewChild('domainFilter', {static: true}) domainFilter: TemplateRef<HTMLElement>;
  translatorService = inject(RkTranslatorService);
  translationPrefix = 'DnsTunnel';
  selectedTabId = 0;
  filter: BaseFilterInput;
  options: RkNSwitchModel[] = [
    {value: 0, displayText: this.translatorService.translate(this.translationPrefix + '.EnableProtection') },
    {value: 1, displayText: this.translatorService.translate(this.translationPrefix + '.DisableProtection') },
  ];
  dnsTunnelCommunicationService = inject(DnsTunnelCommunicationService);
  private rkFilterService = inject(RkFilterServiceV2);
  selectedOption: number;
  loaded: boolean;
  ngUnsubscribe: Subject<any> = new Subject<any>();
  showPrimaryCalendar = false;
  selectedDateInterval: [Date, Date];
  hourIntervalLbl = '';
  filterTypes: Map<string, TrafficFilterBadgeModel>;
  filterDropDownList: FilterDropDownConfig;
  dateTriggeredFromCalendar = false;
  selectedTunnelEventItem: DnsTunnelSuspiciousEventsItem;
  optionChanged(option: number) {
    this.selectedOption = option;
  }

  ngOnInit(): void {
    this.loaded = true;
    this.optionChanged(0);
    const currentDate = new Date();
    let startDate = new Date(currentDate.getTime());
    const minuteInterval = 7 * 24 * 60;
    startDate.setMinutes(startDate.getMinutes() - minuteInterval);
    const dates = this.dnsTunnelCommunicationService.getDateInterval(startDate, 'days', minuteInterval);
    startDate = dates[0];
    const endDate = dates[1];
    this.initEventFilter(startDate.getTime(), endDate.getTime());
    this.updateDateInterval();
  }

  initEventFilter = (gte: number, lt: number) => {
    this.filter = {filterList: [], gte: gte, lt: lt};
    this.filter.filterList.push(new FilterBadgeModelV2(DnsTunnelColumns.ISTunnel, true, [
      new FilterBadgeValueV2(DnsTunnelLevel.High),
      new FilterBadgeValueV2(DnsTunnelLevel.Suspicious)
    ], '', false, false, true));
    this.filterTypes = new Map<string, TrafficFilterBadgeModel>([
      [TrafficColumnNames.Domain, {
        name: TrafficColumnNames.Domain,
        translationKey: 'Columns.Domain',
        equal: true,
        values: [],
        template: this.domainFilter,
        disableTabs: []
      }]
    ]);
    this.filterDropDownList = {
      firstPart: [
        {
          relatedFilter: this.filterTypes.get(TrafficColumnNames.Domain),
        }
      ]
    };
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
  onHistogramDateOptionSet = (option: number) => {
    this.showPrimaryCalendar = !option;
  }

  onHistogramGroupFilterChanged = (event: { high: boolean, suspicious: boolean}) => {
    const badgeModel = this.filter.filterList.find(f => f.name === DnsTunnelColumns.ISTunnel);
    badgeModel.values = [];
    if (event.high)
      badgeModel.values.push(new FilterBadgeValueV2(DnsTunnelLevel.High));
    if (event.suspicious)
      badgeModel.values.push(new FilterBadgeValueV2(DnsTunnelLevel.Suspicious));
    this.refreshFilter(this.filter);
  }

  refreshFilter(filter: BaseFilterInput) {
    // this.filter = filter;
    this.rkFilterService.updateFilter(filter);
  }

  dateChanged = (event: { gte: number, lt: number }) => {
    this.refreshFilter({...this.filter, gte: event.gte, lt: event.lt});
    this.updateDateInterval();
  }

  dateSelected = (dates: [Date, Date]) => {
    if (dates[0]?.getTime() !== this.filter.gte
      || dates[1]?.getTime() !== this.filter.lt) {
      this.dateTriggeredFromCalendar = true;
      this.dateChanged({gte: dates[0]?.getTime(), lt: dates[1].getTime()});
    }
  }

  removeHourFilter = () => {
    const gte = moment(this.filter.gte).startOf('day').toDate().getTime();
    const lt =  moment(this.filter.lt).endOf('day').toDate().getTime();
    this.dateChanged({gte, lt});
  }

  setManualDate = (minutes: number, unit: 'days' | 'hours') => {
    const currentDate = new Date();
    let startDate = moment(currentDate).subtract(minutes, 'minutes').toDate();
    const dates = this.dnsTunnelCommunicationService.getDateInterval(startDate, unit, minutes);
    startDate = dates[0];
    const endDate = dates[1];
    this.calendar?.setManualDate(startDate, endDate);
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

  ngAfterViewInit(): void {
  }

  onFilterApply = (base: BaseFilterInput) => {
    this.filter.gte = base.gte;
    this.filter.lt = base.lt;
    if (!this.dateTriggeredFromCalendar) {
      this.calendar?.removeSelectedWeekStyle();
      this.calendar?.fp?.clear();
    } else {
      this.dateTriggeredFromCalendar = false;
    }
    this.updateDateInterval();
    this.selectedTunnelEventItem = null;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }
  tabSelected = (tabId: number) => {
    this.selectedTabId = tabId;
  }
  onDnsTunnelEventClick = (item: DnsTunnelSuspiciousEventsItem) => {
    this.selectedTunnelEventItem = item;
    if (this.selectedTunnelEventItem) {
      setTimeout(() => {
        this.trafficReportContainer?.nativeElement?.scrollIntoView({behavior: 'smooth' });
      } , 1000);
    }
  }
  manageExceptions() {
    const dialogRef = this.dialog.open(
      ManageExceptionsComponent,
      {
        data: {
        },
        ...NestedDialogCustomConfig,
        ...CommonDialogCustomConfig});
  }
}
