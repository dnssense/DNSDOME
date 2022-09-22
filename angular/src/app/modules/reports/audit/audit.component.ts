import { Location } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ActionClick } from 'roksit-lib';
import { RkDateTime } from 'roksit-lib/lib/modules/rk-date/rk-date.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { AuditService } from 'src/app/core/services/auditService';
import { DateFormatPipe } from '../../shared/pipes/DateFormatPipe';
import { FilterBadgeModel, RoksitSearchComponent } from '../../shared/roksit-search/roksit-search.component';
import { AuditResultComponent } from './result/audit-result.component';



@Component({
  selector: 'app-audit',
  templateUrl: 'audit.component.html',
  styleUrls: ['audit.component.scss'],
  providers: [DateFormatPipe]
})
export class AuditComponent implements OnInit, AfterViewInit {



  constructor(
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private auditService: AuditService
  ) {

  }

  public searchSettings: SearchSetting = new SearchSetting();

  filters: FilterBadgeModel[] = [];
  @ViewChild('modal') filterModal: RkModalModel;

  @ViewChild(RoksitSearchComponent)
  private roksitSearchComponent: RoksitSearchComponent;

  @ViewChild(AuditResultComponent)
  private auditResultComponent: AuditResultComponent;
  @Output() isShowRunBarOutput = new EventEmitter();
  isShowRunBar = false;
  selectedColumnFilter;
  columnsOptions: RkSelectModel[] = [];
  columns: LogColumn[] = [];
  ngOnInit() {



  }
  ngAfterViewInit() {

    this.init();
  }

  init() {



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

  public search(_searchSettings: SearchSetting) {

    this.searchSettings = _searchSettings;
    this.auditResultComponent.currentPage = 1;
    this.auditResultComponent.refresh(_searchSettings);
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
  private __deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  onEditedFilterBadge(filter: FilterBadgeModel) {

    this.selectedColumnFilter = filter.name;

    this.columnsOptions = this.columnsOptions.map(x => {
      if (x.value === filter.name) {
        x.selected = true;
      }

      return x;
    });

    this.filterModal.toggle();
  }

  apply(close = false) {


    this.setShowRunBar(false);

    if (close) {
      this.filterModal.toggle();
    }
  }

  setShowRunBar(status: boolean) {
    this.isShowRunBar = status;

    this.isShowRunBarOutput.emit(status);
  }

}
