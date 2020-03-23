import { OnInit, ElementRef, Component, ViewChild, AfterViewInit } from '@angular/core';
import { CustomReportResultComponent } from './result/customreport-result.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { FastReportService } from 'src/app/core/services/fastReportService';
import { LinkClick } from '../monitor/result/monitor-result.component';
import { FilterBadgeModel, RoksitSearchComponent } from '../../shared/roksit-search/roksit-search.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { categoryMappings } from '../../shared/profile-wizard/page/profile-wizard.component';
import { ColumnTagInput } from '../../../core/models/ColumnTagInput';
import { ReportService } from 'src/app/core/services/reportService';

export interface CustomReportRouteParams {
  startDate?: string;
  endDate?: string;
  category?: 'total' | 'safe' | 'malicious' | 'variable' | 'harmful'|undefined;
}

@Component({
  selector: 'app-customreport',
  templateUrl: 'customreport.component.html',
  styleUrls: ['customreport.component.sass']
})
export class CustomReportComponent implements OnInit, AfterViewInit {

  constructor(
    private fastReportService: FastReportService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private reportService: ReportService
  ) {
    activatedRoute.queryParams.subscribe((params: CustomReportRouteParams) => {
      if (params.startDate && params.endDate) {
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);

        const _startDate = moment([startDate.getFullYear(), startDate.getMonth(), startDate.getDate()]);
        const _endDate = moment([endDate.getFullYear(), endDate.getMonth(), endDate.getDate()]);

        const difference = _endDate.diff(_startDate, 'days');

        this.searchSetting.dateInterval = difference * 60 * 24;

        if (params.category && params.category != 'total') {
          categoryMappings[params.category].forEach(x => {
            this.searchSetting.should.push(new ColumnTagInput('category', '=', x));
          });
        }
        this.search(this.searchSetting);
      }
    });
  }

  public total = 0;
  public multiplier = 1;
  public searchSetting: SearchSetting = new SearchSetting();
  public selectedColumns: AggregationItem[];
  public columns: LogColumn[];
  public columnsTemp: LogColumn[];
  public data: any[];

  isShowRunBar = false;

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;

  @ViewChild(CustomReportResultComponent) customReportResultComponent: CustomReportResultComponent;

  @ViewChild(RoksitSearchComponent) customReportSearchComponent: RoksitSearchComponent;

  filters: FilterBadgeModel[] = [];

  ngOnInit(): void {
    this.reportService.initTableColumns().subscribe((res: LogColumn[]) => {
      this.columns = res;
    });
  }

  ngAfterViewInit() {
    const state = this.location.getState();

    if (state['filters']) {
      this.filters = state['filters'];

      this.customReportSearchComponent.filters = this.filters;

      this.customReportSearchComponent.search('', false);
    } else {
      this.search(this.searchSetting);
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

    this.search(this.searchSetting);
  }
}
