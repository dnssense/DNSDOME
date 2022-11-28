import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorResultComponent } from './result/monitor-result.component';
import { DateFormatPipe } from '../../shared/pipes/DateFormatPipe';
import { RoksitSearchComponent, FilterBadgeModel } from '../../shared/roksit-search/roksit-search.component';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { ReportService } from 'src/app/core/services/reportService';
import { RkDateTime } from 'roksit-lib/lib/modules/rk-date/rk-date.component';
import {StaticService} from '../../../core/services/staticService';
import { ActionClick } from 'roksit-lib';

export interface MonitorReportRouteParams {
  startDate?: string;
  endDate?: string;
  category?: 'total' | 'safe' | 'malicious' | 'variable' | 'harmful' | null | string;
}

@Component({
  selector: 'app-monitor',
  templateUrl: 'monitor.component.html',
  styleUrls: ['monitor.component.sass'],
  providers: [DateFormatPipe]
})
export class MonitorComponent implements OnInit, AfterViewInit {

  private queryParams: MonitorReportRouteParams;

  constructor(
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private staticService: StaticService
  ) {
    activatedRoute.queryParams.subscribe((params: MonitorReportRouteParams) => {
      this.queryParams = params;
    });
  }

  public searchSettings: SearchSetting = new SearchSetting();

  filters: FilterBadgeModel[] = [];

  @ViewChild(RoksitSearchComponent)
  private roksitSearchComponent: RoksitSearchComponent;

  @ViewChild(MonitorResultComponent)
  private monitorResultComponent: MonitorResultComponent;

  isShowRunBar = false;
  categoryMappings;

  ngOnInit() { }
  ngAfterViewInit() {
    this.staticService.getCategoryMapping().subscribe(mapping => {
      this.categoryMappings = mapping;
      this.init();
    });
  }
  // bu kod customreport.component.ts icindede var
  init() {


    if (this.queryParams.startDate && this.queryParams.endDate) {
      const startDate = new Date(this.queryParams.startDate);
      const endDate = new Date(this.queryParams.endDate);

      const _startDate = moment([startDate.getFullYear(), startDate.getMonth(), startDate.getDate()]);
      const _endDate = moment([endDate.getFullYear(), endDate.getMonth(), endDate.getDate()]);

      const difference = _endDate.diff(_startDate, 'minutes');

      this.roksitSearchComponent.searchSettings.type = 'roksit';
      this.roksitSearchComponent.searchSettings.dateInterval = difference;
      this.roksitSearchComponent.searchSettings.should = [];
      this.roksitSearchComponent.searchSettings.must = [];
      this.roksitSearchComponent.searchSettings.mustnot = [];

      this.roksitSearchComponent.date.selectTime({ value: this.searchSettings.dateInterval } as RkDateTime);
      this.roksitSearchComponent.convertTimeString(this.roksitSearchComponent.searchSettings.dateInterval);

      if (this.queryParams.category && this.queryParams.category !== 'total') {
        let category = this.queryParams.category;
        if (category === 'harmful') {
          category = 'restricted';
        }
        if (this.categoryMappings[category]) {
          this.categoryMappings[category]?.forEach(x => {
            this.roksitSearchComponent.searchSettings.should.push(new ColumnTagInput('category', '=', x));
          });
        } else if (category !== 'total') {
          this.roksitSearchComponent.searchSettings.should.push(new ColumnTagInput('category', '=', category));
        }

      }

      this.roksitSearchComponent.filters = this.filters;
      this.roksitSearchComponent.categoryFilters = this.roksitSearchComponent.searchSettings.should.map(x => new FilterBadgeModel(x.field, true, [x.value]));

      this.roksitSearchComponent.search('', false);


    } else {

      const state = this.location.getState();

      if (state['filters'] && state['searchSettings']) {
        this.filters = state['filters'];

        this.searchSettings = state['searchSettings'];

        this.roksitSearchComponent.filters = this.filters;

        this.roksitSearchComponent.searchSettings = state['searchSettings'];

        this.roksitSearchComponent.search('', false);

        if (this.searchSettings.startDate && this.searchSettings.endDate) {
          const startDate = moment(this.searchSettings.startDate);
          const endDate = moment(this.searchSettings.endDate);

          const diff = endDate.diff(startDate, 'minutes');

          this.roksitSearchComponent.date.selectTime({ value: diff } as RkDateTime, { startDate: new Date(this.searchSettings.startDate), endDate: new Date(this.searchSettings.endDate) });

          this.roksitSearchComponent.dateText = this.roksitSearchComponent.convertTimeString(diff);
        } else {
          this.roksitSearchComponent.date.selectTime({ value: this.searchSettings.dateInterval } as RkDateTime);

          this.roksitSearchComponent.convertTimeString(this.roksitSearchComponent.searchSettings.dateInterval);
        }

      }

    }

  }

  public search(_searchSettings: SearchSetting) {

    this.searchSettings = _searchSettings;
    this.monitorResultComponent.currentPage = 1;
    this.monitorResultComponent.refresh(_searchSettings);
  }

  public addValuesIntoSelected($event) {

    this.roksitSearchComponent.setSearchSetting(this.searchSettings);
  }

  actionClicked($event: ActionClick) {
    const filter = this.filters.find(x => x.name === $event.columnModel.name);

    if (filter) {
      const exists = filter.values.some(x => x === $event.value);

      if (!exists) {
        const _filterValues = JSON.parse(JSON.stringify(filter.values)) as string[];

        _filterValues.unshift($event.value);

        filter.values = _filterValues;
      }
    } else {
      this.filters.push(new FilterBadgeModel($event.columnModel.name, true, [$event.value]));
    }

    this.isShowRunBar = true;

  }

  clearFilters() {
    this.filters = [];

    this.isShowRunBar = false;

    // this.search(this.searchSettings);
  }
}
