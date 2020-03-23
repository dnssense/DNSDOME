import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorResultComponent, LinkClick } from './result/monitor-result.component';
import { DateFormatPipe } from '../../shared/pipes/DateFormatPipe';
import { RoksitSearchComponent, FilterBadgeModel } from '../../shared/roksit-search/roksit-search.component';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { categoryMappings } from '../../shared/profile-wizard/page/profile-wizard.component';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { ReportService } from 'src/app/core/services/reportService';

export interface MonitorReportRouteParams {
  startDate?: string;
  endDate?: string;
  category?: 'total' | 'safe' | 'malicious' | 'variable' | 'harmful'|null|string;
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
    private reportService: ReportService
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

  ngOnInit() { }

  ngAfterViewInit() {
    if (this.queryParams) {
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
        if (this.queryParams.category && this.queryParams.category != 'total') {
          if (categoryMappings[this.queryParams.category]) {
          categoryMappings[this.queryParams.category]?.forEach(x => {
            this.roksitSearchComponent.searchSettings.should.push(new ColumnTagInput('category', '=', x));
          });
          } else if (this.queryParams.category != 'total') {
            this.roksitSearchComponent.searchSettings.should.push(new ColumnTagInput('category', '=', this.queryParams.category));
          }

        }
        this.roksitSearchComponent.filters = this.filters;

        this.roksitSearchComponent.search('', false);

      }
    } else {
      const state = this.location.getState();

    if (state['filters']) {
      this.filters = state['filters'];

      this.roksitSearchComponent.filters = this.filters;

      this.roksitSearchComponent.search('', false);
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

  linkClicked($event: LinkClick) {
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

    this.search(this.searchSettings);
  }
}
