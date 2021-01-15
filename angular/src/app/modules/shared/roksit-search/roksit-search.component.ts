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
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { ScheduledReport } from 'src/app/core/models/ScheduledReport';
import { SearchSetting, SearchSettingsType } from 'src/app/core/models/SearchSetting';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ReportService } from 'src/app/core/services/reportService';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { StaticService } from 'src/app/core/services/staticService';
import { TranslatorService } from 'src/app/core/services/translator.service';

export class GroupedCategory {
  type: string;
  name: string;
  color?= '#3397c5';
  items: CategoryV2[];
}

export class FilterBadgeModel {
  name: string;
  equal = false;
  values: string[] = [];

  constructor(name: string, equal: boolean, values: string[]) {
    this.name = name;
    this.equal = equal;
    this.values = values;
  }
}

@Component({
  selector: 'app-roksit-search',
  templateUrl: 'roksit-search.component.html',
  styleUrls: ['roksit-search.component.scss']
})

export class RoksitSearchComponent implements OnInit, AfterViewInit {

  constructor(
    private staticService: StaticService,
    private reportService: ReportService,
    private notification: NotificationService,
    private router: Router,
    private staticmessageService: StaticMessageService,
    private translatorService: TranslatorService,
    private translateService: TranslateService
  ) {
    this.getSavedReports();

    this.staticService.getCategoryList().subscribe(result => {
      result.forEach(elem => {
        const finded = this.autocompleteItems.find(x => x.text === translatorService.translate(elem.type));

        if (finded) {
          finded.groupItems.push({ text: elem.name, value: elem.name });
        } else {
          this.autocompleteItems.push({ text: translatorService.translate(elem.type), value: elem.name, groupItems: [{ text: elem.name, value: elem.name }] });
        }
      });

      this.autocompleteItems.forEach(elem => {
        elem.groupItems.sort((a, b) => a.text > b.text ? 1 : -1);
      });
    });

    /* this.userService.getUsers().subscribe(result => {
      this.users = result.filter(x => x.isActive);
    }) */

    this.translateService.onLangChange.subscribe(result => {
      this.dateText = this.convertTimeString(Number(this.searchSettings.dateInterval || 5));
    });
  }

  @Input() searchSettings: SearchSetting;

  @Input() pageTitle: string;

  @Output() searchSettingEmitter = new EventEmitter();

  @Output() filtersClearEmitter = new EventEmitter();



  dateOptions: RkDateTime[] = [
    { value: 5, displayText: 'Last 5 Minutes' },
    { value: 60 * 6, displayText: '6 hour' },
    { value: 60 * 24, displayText: 'Last 1 day' },
    { value: 60 * 24 * 7, displayText: 'Last 1 week' },
  ];

  groupedCategories: GroupedCategory[] = [];

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

  actionType: 'allow' | 'deny';

  @ViewChild('modal') filterModal: RkModalModel;

  @ViewChild('saveModal') saveModal: RkModalModel;

  newSavedReport: SearchSetting = new SearchSetting();

  private _isShowRunBar = false;

  @Input()
  get isShowRunBar() { return this._isShowRunBar; }
  set isShowRunBar(val) { this._isShowRunBar = val; }

  @Output() isShowRunBarOutput = new EventEmitter();

  modalCategoryIsEqual = true;

  categoryAutoComplate;

  autocompleteItems: RkAutoCompleteModel[] = [];

  categoryFilters: FilterBadgeModel[] = [];

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
    this.reportService.initTableColumns().subscribe(columns => {

      if (!!columns) {
        this.columns = columns;

        this.columnsOptions = columns.map(x => {
          return {
            displayText: x.beautyName,
            value: x.name
          } as RkSelectModel;
        }).filter(x => x.value !== 'action' && x.value !== 'category');
      }
    });

    this.filters.concat(this.searchSettings.should.map(x => new FilterBadgeModel(x.field, true, [x.value])));
    this.filters.concat(this.searchSettings.mustnot.map(x => new FilterBadgeModel(x.field, false, [x.value])));

    this.dateText = this.convertTimeString(Number(this.searchSettings.dateInterval || 5));
  }

  private getSavedReports() {
    this.reportService.getReportList().subscribe(res => {
      this.allSavedReports = res;



      this.savedReports = res.filter(x => !x.system);
      this.systemSavedReports = res.filter(x => x.system);
      this.savedReportOptions = this.savedReports.map(x => {
        return { displayText: x.name, value: x.id } as RkSelectModel;
      });
    });
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

  checkboxValueChange($event: boolean, category: GroupedCategory) {
    category.items.forEach(elem => {
      elem.selected = $event;
    });
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

    if (diffDay > 7) {
      this.notification.warning(this.translatorService.translate('DateDifferenceWarning'));

      return;
    }

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
    /** Seçilen Kategoriler */
    (this.__deepCopy(this.categoryFilters) as FilterBadgeModel[]).forEach(elem => {
      const filter = this.filters.find(x => x.name === elem.name && elem.equal === x.equal);

      if (filter) {
        elem.values.forEach(value => {
          const findedValue = filter.values.some(x => x === value);

          if (!findedValue) {
            filter.values.unshift(value);
          }
        });
      } else {
        this.addFilterBadge(elem);
      }
    });

    /** Allow Deny Butonları */
    if (this.actionType) {
      const findedActionIndex = this.filters.findIndex(x => x.name === 'action');

      if (findedActionIndex > -1) {
        this.filters.splice(findedActionIndex, 1);
      }

      if (this.actionType === 'allow') {
        this.addFilterBadge(new FilterBadgeModel('action', true, ['Allow']));
      } else {
        this.addFilterBadge(new FilterBadgeModel('action', true, ['Deny']));
      }
    }

    this.setShowRunBar(false);

    if (close) {
      this.filterModal.toggle();
    }
  }

  private get selectedItems() {
    const newList = [] as GroupedCategory[];

    this.__deepCopy(this.groupedCategories).forEach(elem => {
      const selectedItems = elem.items.filter(x => x.selected);

      if (selectedItems.length > 0) {
        elem.items = selectedItems;

        newList.push(elem);
      }
    });

    return newList;
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
    if ($event.name === 'category') {
      this.categoryFilters = [];
    } else if ($event.name === 'action') {
      this.actionType = null;
    }

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

  search(type?: 'savedreport' | string, showFilterModal = false) {

    this.setDateOptionBySearchSettings();

    if (type === 'savedreport') {
      this.searchSettingEmitter.emit(this.searchSettings);

      this.filterModal.toggle();

      this.setShowRunBar(false);

      return;
    }

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
          if (filter.name === 'action') {
            if (filter.values[0] === 'Deny') {
              this.searchSettings.mustnot.push(new ColumnTagInput(filter.name, '=', 'true'));
              this.actionType = 'deny';
            } else {
              this.searchSettings.should.push(new ColumnTagInput(filter.name, '=', 'true'));
              this.actionType = 'allow';
            }
          } else
            if (filter.name === 'time') {
              const date = moment(Date.parse(value));

              if (date.isValid()) {
                this.searchSettings.should.push(new ColumnTagInput(filter.name, '=', date.toISOString()));
              } else {
                this.notification.error(this.translatorService.translate('PleaseEnterTimeTrueValue'));
              }
            } else {
              this.searchSettings.should.push(new ColumnTagInput(filter.name, '=', value));
            }
        });
      } else {
        filter.values.forEach(value => {
          if (filter.name === 'action') {
            if (filter.values[0] === 'Deny') {
              this.searchSettings.mustnot.push(new ColumnTagInput(filter.name, '=', 'false'));
              this.actionType = 'allow';
            } else {
              this.searchSettings.mustnot.push(new ColumnTagInput(filter.name, '=', 'true'));
              this.actionType = 'deny';
            }
          } else
            if (filter.name === 'time') {
              const date = moment(Date.parse(value));

              if (date.isValid()) {
                this.searchSettings.mustnot.push(new ColumnTagInput(filter.name, '=', date.toISOString()));
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

  getItemsByCategoryName(name: string) {
    const items = this.groupedCategories.find(x => x.name === name).items;

    return items.filter(x => x.selected);
  }

  clear() {
    this.searchSettings = new SearchSetting();

    this.searchSettings.must = [];
    this.searchSettings.mustnot = [];
    this.searchSettings.should = [];

    this.searchSettings.dateInterval = this.dateOptions[0].value;

    this.groupedCategories.forEach(elem => elem.items.forEach(item => item.selected = false));

    this.filtersClearEmitter.emit();
  }

  filtersClear() {
    this.clear();

    this.actionType = null;

    this.filters = [];
  }

  actionChanged($event: RkRadioOutput) {
    this.actionType = $event.value;
  }

  addFilterBadge(filter: FilterBadgeModel) {

    this.filters.push(filter);
  }

  savedReportValueChange() {
    debugger;
    this.filters.splice(0);

    const report = this.allSavedReports.find(x => x.id === this.savedReportValue);

    this.dateText = this.convertTimeString(report.dateInterval);

    const finded = this.dateOptions.find(x => x.value === Number(report.dateInterval));

    if (finded) {
      this.date.selectTime(finded);
    }

    this.setDateOptionBySearchSettings(Number(report.dateInterval));

    this.searchSettings = JSON.parse(JSON.stringify({ ...report, dateInterval: report.dateInterval }));

    const should = this.searchSettings.should.map(x => new FilterBadgeModel(x.field, true, [x.value]));
    const mustnot = this.searchSettings.mustnot.map(x => new FilterBadgeModel(x.field, false, [x.value]));

    const newArr = [] as FilterBadgeModel[];

    should.concat(mustnot).forEach(filter => {
      const finded = newArr.find(x => x.name === filter.name);

      if (finded) {
        finded.values.push(filter.values[0]);
      } else {
        newArr.push(filter);
      }
    });

    newArr.forEach(elem => {
      this.filters.push(elem);
    });



    this.setShowRunBar(true);
  }

  changeSavedReportType($event: RkRadioOutput) {
    this.newSavedReport.scheduledReport = { period: $event.value } as ScheduledReport;
  }

  saveFilterClick() {
    debugger;
    if (this.searchSettings.name.length > 0) {
      this.reportActiveTabNumber = 1;

      this.savedReportOptions = this.savedReportOptions.map(x => {
        return { ...x, selected: x.value === this.searchSettings.id };
      });
      this.fillSearchSettingsByFilters();
      this.newSavedReport = JSON.parse(JSON.stringify(this.searchSettings));
      this.newSavedReport.name = this.searchSettings.name;

      this.newSavedReport.id = this.searchSettings.id;


    } else {
      this.fillSearchSettingsByFilters();

      this.newSavedReport = JSON.parse(JSON.stringify(this.searchSettings));

      this.searchSettings.system = false;
      this.prepareNewSaveFilter();
    }

    this.saveModal.toggle();
  }

  prepareNewSaveFilter() {
    this.newSavedReport.name = '';

    this.newSavedReport.id = 0;
  }

  savedReportSelectChanged($event: number) {
    const savedReport = this.allSavedReports.find(x => x.id === $event);

    if (savedReport) {
      // this.fillSearchSettingsByFilters();

      this.newSavedReport = JSON.parse(JSON.stringify(this.searchSettings));
      this.newSavedReport.name = savedReport.name;
      this.newSavedReport.id = savedReport.id;

    }
  }

  saveReport() {
    debugger;
    if (this.newSavedReport.name.trim().length > 0) {
      this.reportService.saveReport(this.newSavedReport).subscribe(res => {

        this.notification.success(res.message);
        this.getSavedReports();
        this.saveModal.toggle();

      });
    } else {
      this.notification.warning(this.staticmessageService.needsToFillInRequiredFieldsMessage);
    }
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

  categoryEnterPress($event: { value: string }) {
    if ($event.value.trim().length === 0) { return; }

    const findedCategory = this.filters.find(x => x.name.toLocaleLowerCase() === 'category' && x.equal === this.modalCategoryIsEqual);

    if (findedCategory) {
      const findedValue = findedCategory.values.some(x => x === $event.value);

      if (!findedValue) {
        findedCategory.values.unshift($event.value);
      }
    } else {
      this.filters.push(new FilterBadgeModel('category', this.modalCategoryIsEqual, [$event.value]));
    }
  }

  removeCategoryFilter(filter: FilterBadgeModel, filterIndex: number, valueIndex: number) {
    filter.values.splice(valueIndex, 1);

    if (filter.values.length === 0) {
      this.filters.splice(filterIndex, 1);
    }

    const categoryFilterIndex = this.filters.findIndex(x => x.name === 'category');

    if (categoryFilterIndex > -1) {
      this.filters[categoryFilterIndex] = filter;
    }
  }

  routeReportPage(pageName: 'monitor' | 'custom-reports') {
    this.router.navigateByUrl(`/admin/reports/${pageName}`, {
      state: {
        filters: this.filters,
        searchSettings: this.searchSettings
      }
    });
  }

  getFiltersByColumn(columnName: string) {
    return columnName ? this.filters.filter(x => x.name === columnName) : [];
  }

  private distinct(value: string, index: number, self: string[]) {
    return self.indexOf(value) === index;
  }

  get getCategoryFilters() {
    return this.filters.filter(x => x.name === 'category');
  }

  revertReport() {
    this.savedReportValueChange();
  }
}
