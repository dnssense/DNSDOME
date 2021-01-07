import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { RkAutoCompleteModel } from 'roksit-lib/lib/modules/rk-autocomplete/rk-autocomplete.component';
import { RkDateConfig, RkDateTime } from 'roksit-lib/lib/modules/rk-date/rk-date.component';
import { RkFilterOutput } from 'roksit-lib/lib/modules/rk-filter-badge/rk-filter-badge.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { RkRadioOutput } from 'roksit-lib/lib/modules/rk-radio/rk-radio.component';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { SearchSetting, SearchSettingsType } from 'src/app/core/models/SearchSetting';
import { AuditService } from 'src/app/core/services/auditService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { StaticService } from 'src/app/core/services/staticService';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { FilterBadgeModel } from 'src/app/modules/shared/roksit-search/roksit-search.component';



@Component({
  selector: 'app-audit-search',
  templateUrl: 'audit-search.component.html',
  styleUrls: ['audit-search.component.scss']
})

export class AuditSearchComponent implements OnInit, AfterViewInit {

  constructor(
    private auditService: AuditService,
    private staticService: StaticService,
    private notification: NotificationService,
    private router: Router,
    private staticmessageService: StaticMessageService,
    private translatorService: TranslatorService,
    private translateService: TranslateService
  ) {


    this.translateService.onLangChange.subscribe(result => {
      this.dateText = this.convertTimeString(Number(this.searchSettings.dateInterval || 5));
    });
  }

  @Input() searchSettings: SearchSetting;

  @Input() pageTitle: string;

  @Output() searchSettingEmitter = new EventEmitter();

  @Output() filtersClearEmitter = new EventEmitter();
  @ViewChild('modal') filterModal: RkModalModel;


  dateOptions: RkDateTime[] = [
    { value: 5, displayText: 'Last 5 Minutes' },
    { value: 60 * 6, displayText: '6 hour' },
    { value: 60 * 24, displayText: 'Last 1 day' },
    { value: 60 * 24 * 7, displayText: 'Last 1 week' },
  ];



  private allSavedReports: SearchSetting[] = [];

  savedReports: SearchSetting[] = [];
  systemSavedReports: SearchSetting[] = [];
  savedReportValue: number;

  @Input() filters: FilterBadgeModel[] = [];

  columns: LogColumn[] = [];
  columnsOptions: RkSelectModel[] = [];

  modalIsEqual = true;
  filterText = '';

  selectedColumnFilter;

  newSavedReport: SearchSetting = new SearchSetting();

  private _isShowRunBar = false;

  @Input()
  get isShowRunBar() { return this._isShowRunBar; }
  set isShowRunBar(val) { this._isShowRunBar = val; }

  @Output() isShowRunBarOutput = new EventEmitter();



  autocompleteItems: RkAutoCompleteModel[] = [];

  // categoryFilters: FilterBadgeModel[] = [];

  activeTabNumber = 0;

  reportActiveTabNumber = 0;

  savedReportOptions: RkSelectModel[] = [];

  dateText: string;

  @ViewChild('date') date;

  dateConfig: RkDateConfig = {
    startHourText: this.translatorService.translate('Date.StartHour'),
    endHourText: this.translatorService.translate('Date.EndHour'),
    applyText: this.translatorService.translate('Date.Apply'),
    cancelText: this.translatorService.translate('Date.Cancel'),
    customText: this.translatorService.translate('Date.Custom'),
    selectDateText: this.translatorService.translate('Date.SelectDate'),
    placeholder: this.translatorService.translate('Date.Placeholder'),
    startDate: this.translatorService.translate('Date.StartDate'),
    endDate: this.translatorService.translate('Date.EndDate'),
  };

  ngOnInit() {
    this.auditService.initTableColumns().subscribe(columns => {

      if (!!columns) {

        this.columns = columns;

        this.columnsOptions = columns.map(x => {
          return {
            displayText: x.beautyName,
            value: x.name
          } as RkSelectModel;
        });
      }
    });


    this.filters.concat(this.searchSettings.should.map(x => new FilterBadgeModel(x.field, true, [x.value])));
    this.filters.concat(this.searchSettings.must.map(x => new FilterBadgeModel(x.field, true, [x.value])));
    this.filters.concat(this.searchSettings.mustnot.map(x => new FilterBadgeModel(x.field, false, [x.value])));

    this.dateText = this.convertTimeString(Number(this.searchSettings.dateInterval || 5));
  }



  ngAfterViewInit(): void {
    this.clickedDateOption(this.dateOptions[0], true);
  }

  setActiveTabNumber(val: number) {
    this.activeTabNumber = val;
  }

  setReportActiveTabNumber(val: number) {
    this.reportActiveTabNumber = val;
  }

  private get getRandomColor() {
    const letters = '0123456789ABCDEF';

    let color = '#';

    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  }



  onSelectedDateChange($event) {
    this.searchSettingEmitter.emit(this.searchSettings);
  }

  convertTimeString(num: number) {
    const month = Math.floor(num / (1440 * 30));
    const w = Math.floor((num - (month * 1440 * 30)) / (1440 * 7));
    const d = Math.floor((num - (w * 1440 * 7)) / 1440); // 60*24
    const h = Math.floor((num - (d * 1440)) / 60);
    const m = Math.round(num % 60);

    let text = '';

    if (month > 0) {
      text = `${month} ${this.translatorService.translate('Month')}`;

      if (w > 0) {
        text += ` ${w} ${this.translatorService.translate('Week')}`;
      }
    } else if (w > 0) {
      text = `${w} ${this.translatorService.translate('Week')}`;

      if (d > 0) {
        text += ` ${d} ${this.translatorService.translate('Day')}`;
      }
    } else if (d > 0) {
      text = `${d} ${this.translatorService.translate('Day')}`;

      if (h > 0) {
        text += ` ${h} ${this.translatorService.translate('Hour')}`;
      }
    } else if (h > 0) {
      text = `${h} ${this.translatorService.translate('Hour')}`;

      if (m > 0) {
        text += ` ${m} ${this.translatorService.translate('Minute')}`;
      }
    } else {
      text = `${m} ${this.translatorService.translate('Minute')}`;
    }

    return text;
  }

  clickedDateOption(option: RkDateTime, init: boolean) {
    this.searchSettings.dateInterval = option.value;

    this.searchSettings.startDate = null;
    this.searchSettings.endDate = null;

    if (!init) {
      this.searchSettingEmitter.emit(this.searchSettings);
    }

    this.dateText = this.convertTimeString(this.searchSettings.dateInterval || 5);

    const finded = this.dateOptions.find(x => x.value === option.value);

    if (finded) {
      this.date.selectTime(finded);
    }

    this.setDateOptionBySearchSettings();
  }

  rkDateChanhed($event: { startDate: Date, endDate: Date }) {
    let startDate = moment($event.startDate);
    let endDate = moment($event.endDate);

    if (startDate > endDate) {

      startDate = moment($event.endDate);
      endDate = moment($event.startDate);
      this.date.startDate = $event.endDate;
      this.date.endDate = $event.startDate;

    }

    const diff = endDate.diff(startDate, 'minutes');

    this.dateText = this.convertTimeString(diff);

    const diffDay = endDate.diff(startDate, 'days');



    this.searchSettings.dateInterval = null;

    this.searchSettings.startDate = $event.startDate.toISOString();
    this.searchSettings.endDate = $event.endDate.toISOString();

    this.setDateOptionBySearchSettings();

    this.searchSettingEmitter.emit(this.searchSettings);
  }

  onTypeValueChange(type: SearchSettingsType) {
    this.searchSettings.type = type;

    this.searchSettingEmitter.emit(this.searchSettings);
  }

  setSearchSetting(searchSetting: SearchSetting) {
    this.searchSettings = searchSetting;
  }

  addManuelFilter() {
    if (this.selectedColumnFilter && this.filterText) {
      const obj = {
        name: this.selectedColumnFilter,
        equal: this.modalIsEqual,
        values: [this.filterText]
      } as FilterBadgeModel;

      const findedColumn = this.filters.find(x => x.name === obj.name && x.equal === obj.equal);

      if (findedColumn) {
        findedColumn.values.push(this.filterText);
      } else {
        this.filters.push(obj);
      }

      this.filterText = '';
    }
  }

  removeManuelFilter(filter: FilterBadgeModel, filterIndex: number, valueIndex: number, selectedColumn: string) {
    filter.values.splice(valueIndex, 1);

    if (filter.values.length === 0) {
      const findIndex = this.filters.findIndex(x => x.name === selectedColumn);

      this.filters.splice(findIndex, 1);
    }
  }

  private __deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  apply(close = false) {

    this.setShowRunBar(false);
    if (close) {
      this.filterModal.toggle();
    }

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

  onDeletedFilterBadge($event: RkFilterOutput, index: number) {


    const findedIndex = this.filters.findIndex(x => x.name === $event.name);

    if (findedIndex > -1) {
      this.filters.splice(findedIndex, 1);
    }

    // this.filters.splice(index, 1);

    this.setShowRunBar(true);
  }

  setDateOptionBySearchSettings(dateInterval?: number) {
    const dateOptions = this.dateOptions.map(x => {
      return { ...x, selected: x.value === (dateInterval ? dateInterval : this.searchSettings.dateInterval) };
    });

    this.dateOptions = dateOptions;
  }

  search(showFilterModal = false) {

    this.setDateOptionBySearchSettings();

    this.apply(showFilterModal);

    this.fillSearchSettingsByFilters();

    this.searchSettingEmitter.emit(this.searchSettings);

    this.setShowRunBar(false);

    if (this.searchSettings.dateInterval) {
      this.dateText = this.convertTimeString(this.searchSettings.dateInterval);
    }
    if (showFilterModal) {
      this.filterModal.toggle();
    }


  }

  private fillSearchSettingsByFilters() {
    this.searchSettings.must = [];
    this.searchSettings.mustnot = [];
    this.searchSettings.should = [];

    this.filters.forEach(filter => {

      if (filter.equal) {
        filter.values.forEach(value => {

          if (filter.name === 'time') {
            const date = moment(Date.parse(value));

            if (date.isValid()) {
              this.searchSettings.should.push(new ColumnTagInput('insertDate', '=', date.toISOString()));
            } else {
              this.notification.error(this.translatorService.translate('PleaseEnterTimeTrueValue'));
            }
          } else {
            this.searchSettings.should.push(new ColumnTagInput(filter.name, '=', value));
          }
        });
      } else {
        filter.values.forEach(value => {

          if (filter.name === 'time') {

            const date = moment(Date.parse(value));

            if (date.isValid()) {
              this.searchSettings.mustnot.push(new ColumnTagInput('insertDate', '=', date.toISOString()));
            } else {
              this.notification.error(this.translatorService.translate('PleaseEnterTimeTrueValue'));
            }
          } else {
            this.searchSettings.mustnot.push(new ColumnTagInput(filter.name, '=', value));
          }
        });
      }
    });

  }



  clear() {
    this.searchSettings = new SearchSetting();

    this.searchSettings.must = [];
    this.searchSettings.mustnot = [];
    this.searchSettings.should = [];

    this.searchSettings.dateInterval = this.dateOptions[0].value;

    this.filtersClearEmitter.emit();
  }

  filtersClear() {
    this.clear();



    this.filters = [];
  }

  actionChanged($event: RkRadioOutput) {

  }

  addFilterBadge(filter: FilterBadgeModel) {

    this.filters.push(filter);
  }




  prepareNewSaveFilter() {
    this.newSavedReport.name = '';

    this.newSavedReport.id = 0;
  }


  setShowRunBar(status: boolean) {
    this.isShowRunBar = status;

    this.isShowRunBarOutput.emit(status);
  }

  filterBadgeChange(filter: FilterBadgeModel) {
    filter.equal = !filter.equal;

    this.setShowRunBar(true);

    this.fillSearchSettingsByFilters();
  }


  getFiltersByColumn(columnName: string) {
    return columnName ? this.filters.filter(x => x.name === columnName) : [];
  }

  private distinct(value: string, index: number, self: string[]) {
    return self.indexOf(value) === index;
  }


}
