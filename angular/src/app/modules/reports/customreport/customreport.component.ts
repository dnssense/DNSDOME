import { OnInit, ElementRef, Component, ViewChild, AfterViewInit } from '@angular/core';
import { CustomReportResultComponent } from './result/customreport-result.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { FilterBadgeModel, RoksitSearchComponent } from '../../shared/roksit-search/roksit-search.component';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { ColumnTagInput } from '../../../core/models/ColumnTagInput';
import { ReportService } from 'src/app/core/services/reportService';
import {StaticService} from '../../../core/services/staticService';
import { ActionClick, RkDateTime } from 'roksit-lib';

export interface CustomReportRouteParams {
  startDate?: string;
  endDate?: string;
  category?: 'total' | 'safe' | 'malicious' | 'variable' | 'harmful' | null | string;
}

@Component({
  selector: 'app-customreport',
  templateUrl: 'customreport.component.html',
  styleUrls: ['customreport.component.sass']
})
export class CustomReportComponent implements OnInit, AfterViewInit {

  private queryParams: CustomReportRouteParams;
  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private reportService: ReportService,
    private staticService: StaticService
  ) {
    activatedRoute.queryParams.subscribe((params: CustomReportRouteParams) => {
      this.queryParams = params;
    });
  }

  public total = 0;
  public multiplier = 1;
  public searchSetting: SearchSetting = new SearchSetting();
  public selectedColumns: AggregationItem[];
  public columnsTemp: LogColumn[];
  public data: any[];

  isShowRunBar = false;
  categoryMappings;

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;

  @ViewChild(CustomReportResultComponent) customReportResultComponent: CustomReportResultComponent;

  @ViewChild(RoksitSearchComponent) customReportSearchComponent: RoksitSearchComponent;

  filters: FilterBadgeModel[] = [];

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.staticService.getCategoryMapping().subscribe(mapping => {
      this.categoryMappings = mapping;
      this.init();
    });
  }

  // bu kod monitor component .ts  icindede aynen var
  init() {


    if (this.queryParams.startDate && this.queryParams.endDate) {
      const startDate = new Date(this.queryParams.startDate);
      const endDate = new Date(this.queryParams.endDate);

      const _startDate = moment([startDate.getFullYear(), startDate.getMonth(), startDate.getDate()]);
      const _endDate = moment([endDate.getFullYear(), endDate.getMonth(), endDate.getDate()]);

      const difference = _endDate.diff(_startDate, 'minutes');

      this.customReportSearchComponent.searchSettings.type = 'roksit';
      this.customReportSearchComponent.searchSettings.dateInterval = difference;
      this.customReportSearchComponent.searchSettings.should = [];
      this.customReportSearchComponent.searchSettings.must = [];
      this.customReportSearchComponent.searchSettings.mustnot = [];

      if (this.queryParams.category && this.queryParams.category != 'total') {
        if (this.categoryMappings[this.queryParams.category]) {
          this.categoryMappings[this.queryParams.category]?.forEach(x => {
            this.customReportSearchComponent.searchSettings.should.push(new ColumnTagInput('category', '=', x));
          });
        } else if (this.queryParams.category != 'total') {
          this.customReportSearchComponent.searchSettings.should.push(new ColumnTagInput('category', '=', this.queryParams.category));
        }

      }

      this.customReportSearchComponent.filters = this.filters;
      this.customReportSearchComponent.categoryFilters = this.customReportSearchComponent.searchSettings.should.map(x => new FilterBadgeModel(x.field, true, [x.value]));

      this.customReportSearchComponent.search('', false);


    } else {

      const state = this.location.getState();

      if (state['filters'] && state['searchSettings']) {
        this.filters = state['filters'];

        this.searchSetting = state['searchSettings'];

        this.customReportSearchComponent.searchSettings = this.searchSetting;

        this.customReportSearchComponent.filters = this.filters;

        this.customReportSearchComponent.search('', false);

        if (this.searchSetting.startDate && this.searchSetting.endDate) {
          const startDate = moment(this.searchSetting.startDate);
          const endDate = moment(this.searchSetting.endDate);

          const diff = endDate.diff(startDate, 'minutes');

          this.customReportSearchComponent.date.selectTime({ value: diff } as RkDateTime, { startDate: new Date(this.searchSetting.startDate), endDate: new Date(this.searchSetting.endDate) });

          this.customReportSearchComponent.dateText = this.customReportSearchComponent.convertTimeString(diff);
        } else {
          this.customReportSearchComponent.date.selectTime({ value: this.searchSetting.dateInterval } as RkDateTime);

          this.customReportSearchComponent.convertTimeString(this.customReportSearchComponent.searchSettings.dateInterval);
        }
      } else {
        this.search(this.searchSetting);
      }

    }

  }

  public search(setting: SearchSetting) {
    this.searchSetting = setting;
    if (this.searchSetting.columns.columns.length === 0) {
      this.searchSetting.columns.columns = [
        {
          column: {
            name: 'domain',
            beautyName: 'Domain',
            hrType: '',
            aggsType: 'TERM',
            checked: true
          }, label: 'Domain'
        },
        {
          column: {
            name: 'category',
            beautyName: 'Category',
            hrType: '',
            aggsType: 'TERM',
            checked: true
          }, label: 'Category'
        }
      ] as AggregationItem[];
    }

    if (this.customReportResultComponent) {
      this.customReportResultComponent.search(this.searchSetting);
    }
  }

  public addValuesIntoSelected() {
    this.customReportSearchComponent.setSearchSetting(this.searchSetting);
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

    // this.search(this.searchSetting);
  }
}
