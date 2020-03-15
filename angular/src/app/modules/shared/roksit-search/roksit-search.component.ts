import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { ReportService } from 'src/app/core/services/ReportService';
import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { SearchSetting, SearchSettingsType } from 'src/app/core/models/SearchSetting';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { RkFilterOutput } from 'roksit-lib/lib/modules/rk-filter-badge/rk-filter-badge.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { RkRadioOutput } from 'roksit-lib/lib/modules/rk-radio/rk-radio.component';
import { ScheduledReport } from 'src/app/core/models/ScheduledReport';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/UserService';
import { User } from 'src/app/core/models/User';
import { RkAutoCompleteModel } from 'roksit-lib/lib/modules/rk-autocomplete/rk-autocomplete.component';

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

export class RoksitSearchComponent implements OnInit {

  constructor(
    private staticService: StaticService,
    private reportService: ReportService,
    private fastReportService: FastReportService,
    private notification: NotificationService,
    private userService: UserService
  ) {
    this.reportService.getReportList().subscribe(res => {
      this.allSavedReports = res;

      this.savedReports = res.filter(x => !x.system);
      this.systemSavedReports = res.filter(x => x.system);
    });

    this.staticService.getCategoryList().subscribe(result => {
      this.autocompleteItems = result.map(x => {
        return {
          text: x.name,
          value: x.name
        } as RkAutoCompleteModel;
      });
    });

    this.userService.getUsers().subscribe(result => {
      this.users = result.filter(x => x.isActive);
    });
  }

  @Input() searchSettings: SearchSetting;

  @Input() pageTitle: string;

  @Output() searchSettingEmitter = new EventEmitter();

  @Output() filtersClearEmitter = new EventEmitter();

  users: User[] = [];

  dateOptions: RkSelectModel[] = [
    { displayText: 'Last 5 Minutes', value: 5 },
    { displayText: 'Last 15 Minutes', value: 15 },
    { displayText: 'Last 30 Minutes', value: 30 },
    { displayText: 'Last 1 Hour', value: 60 },
    { displayText: 'Last 3 Hour', value: 180 },
    { displayText: 'Last 12 Hour', value: 720 },
    { displayText: 'Last 1 Day', value: 1440 },
    { displayText: 'Last 2 Day', value: 2880 },
    { displayText: 'Last 1 Week', value: 10080, selected: true }
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

  manuelFilters: FilterBadgeModel[] = [];

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

  ngOnInit() {
    this.fastReportService.tableColumns.subscribe(columns => {
      if (!!columns) {
        this.columns = columns;

        this.columnsOptions = columns.map(x => {
          return {
            displayText: x.name,
            value: x.name
          } as RkSelectModel;
        });
      }
    });
  }

  private groupCategories(categories: CategoryV2[]) {
    const groupCategories = [] as GroupedCategory[];

    categories.forEach(elem => {
      if (elem.isVisible) {
        const finded = groupCategories.find(x => x.type === elem.type);

        if (finded) {
          finded.items.push(elem);
        } else {
          groupCategories.push({
            type: elem.type,
            items: [elem],
            name: name,
          });
        }
      }
    });

    groupCategories.forEach(elem => {
      switch (elem.type) {
        case 'UNSAFE_LIST':
          elem.color = '#f95656';
          elem.name = 'Malicious';
          break;

        case 'SAFE_LIST':
          elem.color = '#3dd49a';
          elem.name = 'Safe';
          break;

        case 'SECURITY':
          elem.color = this.getRandomColor;
          elem.name = 'Security';
          break;

        case 'GRAY_LIST':
          elem.color = '#d8d8d8';
          elem.name = 'Variable';
          break;

        case 'HARMFULL_CONTENT':
          elem.color = '#d8d8d8';
          elem.name = 'Harmful Content';
          break;

        default:
          break;
      }
    });

    return groupCategories;
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

      if (this.manuelFilters.length < 2) {
        const findedColumn = this.manuelFilters.find(x => x.name === obj.name && x.equal === obj.equal);

        if (findedColumn) {
          findedColumn.values.push(this.filterText);
        } else {
          this.manuelFilters.push(obj);
        }

        this.filterText = '';
      }
    }
  }

  removeManuelFilter(filter: FilterBadgeModel, filterIndex: number, valueIndex: number) {
    filter.values.splice(valueIndex, 1);

    if (filter.values.length === 0) {
      this.manuelFilters.splice(filterIndex, 1);
    }
  }

  private __deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  apply(close = false) {
    /** Elle girilmiş olan alanlar */
    (this.__deepCopy(this.manuelFilters) as FilterBadgeModel[]).forEach(elem => {
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

    // const selectedCategories = [] as GroupedCategory[];

    // this.selectedItems.forEach(elem => {
    //   const exists = elem.items.some(x => x.selected);

    //   if (exists) {
    //     selectedCategories.push(elem);
    //   }
    // });

    // if (selectedCategories.length > 0) {
    //   const findedCategories = this.filters.find(x => x.name === 'Categories');

    //   if (findedCategories) {
    //     findedCategories.values = selectedCategories.map(x => x.name);
    //   } else {
    //     this.addFilterBadge(new FilterBadgeModel('Categories', true, selectedCategories.map(x => x.name)));
    //   }
    // }

    /** Allow Deny Butonları */
    if (this.actionType) {
      const findedActionIndex = this.filters.findIndex(x => x.name === 'action');

      if (findedActionIndex > -1) {
        this.filters.splice(findedActionIndex, 1);
      }

      if (this.actionType === 'allow') {
        this.addFilterBadge(new FilterBadgeModel('action', true, ['Allow']));
      } else {
        this.addFilterBadge(new FilterBadgeModel('action', false, ['Deny']));
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

  onEditedFilterBadge() {
    this.filterModal.toggle();
  }

  onDeletedFilterBadge($event: RkFilterOutput, index: number) {
    if ($event.name === 'category') {
      this.categoryFilters = [];
    } else if ($event.name === 'action') {
      this.actionType = null;
    }

    const findedIndex = this.manuelFilters.findIndex(x => x.name === $event.name);

    if (findedIndex > -1) {
      this.manuelFilters.splice(findedIndex, 1);
    }

    this.filters.splice(index, 1);

    this.setShowRunBar(true);
  }

  search(type?: 'savedreport' | string, showFilterModal = false) {
    if (type === 'savedreport') {
      this.searchSettingEmitter.emit(this.searchSettings);

      this.filterModal.toggle();

      return;
    }

    this.apply(showFilterModal);

    this.searchSettings.must = [];
    this.searchSettings.mustnot = [];
    this.searchSettings.should = [];

    this.filters.forEach(filter => {
      if (filter.equal) {
        if (filter.name === 'Categories') {
          filter.values.forEach(value => {
            const selectedItems = this.getItemsByCategoryName(value);

            selectedItems.forEach(item => {
              this.searchSettings.should.push(new ColumnTagInput('category', '=', item.name));
            });
          });
        } else {
          filter.values.forEach(value => {
            if (filter.name === 'action') {
              this.searchSettings.should.push(new ColumnTagInput(filter.name, '=', 'true'));
            } else {
              this.searchSettings.should.push(new ColumnTagInput(filter.name, '=', value));
            }
          });
        }
      } else {
        if (filter.name === 'Categories') {
          filter.values.forEach(value => {
            const selectedItems = this.getItemsByCategoryName(value);

            selectedItems.forEach(item => {
              this.searchSettings.mustnot.push(new ColumnTagInput('category', '=', item.name));
            });
          });
        } else {
          filter.values.forEach(value => {
            if (filter.name === 'action') {
              this.searchSettings.mustnot.push(new ColumnTagInput(filter.name, '=', 'true'));
            } else {
              this.searchSettings.mustnot.push(new ColumnTagInput(filter.name, '=', value));
            }
          });
        }
      }
    });

    this.searchSettingEmitter.emit(this.searchSettings);

    this.filterModal.toggle();
  }

  getItemsByCategoryName(name: string) {
    const items = this.groupedCategories.find(x => x.name === name).items;

    return items.filter(x => x.selected);
  }

  clear() {
    this.searchSettings.must = [];
    this.searchSettings.mustnot = [];
    this.searchSettings.should = [];

    this.groupedCategories.forEach(elem => elem.items.forEach(item => item.selected = false));

    this.manuelFilters = [];

    this.filtersClearEmitter.emit();
  }

  filtersClear() {
    this.clear();

    this.filters = [];
  }

  actionChanged($event: RkRadioOutput) {
    this.actionType = $event.value;
  }

  addFilterBadge(filter: FilterBadgeModel) {
    this.filters.push(filter);
  }

  savedReportValueChange() {
    this.filters = [];

    const report = this.allSavedReports.find(x => x.id === this.savedReportValue);

    this.searchSettings = report;

    report.should.forEach(elem => {
      if (elem.field === 'category') {
        this.groupedCategories.forEach(category => {
          const findedItem = category.items.find(x => x.name === elem.value);

          if (findedItem) {
            const findedCategory = this.filters.find(x => x.name === 'Categories');

            if (findedCategory) {
              const exists = findedCategory.values.some(x => x === category.name);

              if (!exists) {
                findedCategory.values.push(category.name);
              }
            } else {
              this.addFilterBadge(new FilterBadgeModel('Categories', true, [category.name]));
            }
          }
        });
      } else {
        const finded = this.filters.find(x => x.name === elem.field);

        if (finded) {
          finded.values.push(elem.value);
        } else {
          this.addFilterBadge(new FilterBadgeModel(elem.field, true, [elem.value]));
        }
      }
    });

    report.mustnot.forEach(elem => {
      if (elem.field === 'category') {
        this.groupedCategories.forEach(category => {
          const findedItem = category.items.find(x => x.name === elem.value);

          if (findedItem) {
            const findedCategory = this.filters.find(x => x.name === 'Categories');

            if (findedCategory) {
              const exists = findedCategory.values.some(x => x === category.name);

              if (!exists) {
                findedCategory.values.push(category.name);
              }
            } else {
              this.addFilterBadge(new FilterBadgeModel('Categories', false, [category.name]));
            }
          }
        });
      } else {
        const finded = this.filters.find(x => x.name === elem.field);

        if (finded) {
          finded.values.push(elem.value);
        } else {
          this.addFilterBadge(new FilterBadgeModel(elem.field, false, [elem.value]));
        }
      }
    });

    report.should.forEach(elem => {
      if (elem.field === 'category') {
        this.groupedCategories.forEach(category => {
          const findedItem = category.items.find(x => x.name === elem.value);

          if (findedItem) {
            const findedCategory = this.filters.find(x => x.name === 'Categories');

            if (findedCategory) {
              const exists = findedCategory.values.some(x => x === category.name);

              if (!exists) {
                findedCategory.values.push(category.name);
              }
            } else {
              this.addFilterBadge(new FilterBadgeModel('Categories', true, [category.name]));
            }
          }
        });
      } else {
        const finded = this.filters.find(x => x.name === elem.field);

        if (finded) {
          finded.values.push(elem.value);
        } else {
          this.addFilterBadge(new FilterBadgeModel(elem.field, true, [elem.value]));
        }
      }
    });

    this.search('savedreport');
  }

  changeSavedReportType($event: RkRadioOutput) {
    this.newSavedReport.scheduledReport = { period: $event.value } as ScheduledReport;
  }

  saveFilterClick() {
    this.newSavedReport = JSON.parse(JSON.stringify(this.searchSettings));

    this.saveModal.toggle();
  }

  saveReport() {
    if (this.newSavedReport.name.trim().length > 0 && this.newSavedReport.scheduledReport) {
      this.reportService.saveReport(this.newSavedReport).subscribe(res => {
        if (res.status === 200) {
          this.notification.success(res.message);
        } else {
          this.notification.error(res.message);
        }
      });
    }
  }

  toggleAllUsers($event) {
    this.users.forEach(user => user.selected = $event);
  }

  setShowRunBar(status: boolean) {
    this.isShowRunBar = status;

    this.isShowRunBarOutput.emit(status);
  }

  filterBadgeChange(filter: FilterBadgeModel) {
    filter.equal = !filter.equal;

    this.setShowRunBar(true);
  }

  categoryEnterPress($event: { value: string }) {
    if ($event.value.trim().length === 0) { return; }

    const findedCategory = this.categoryFilters.find(x => x.name.toLocaleLowerCase() === 'category' && x.equal === this.modalCategoryIsEqual);

    if (findedCategory) {
      findedCategory.values.unshift($event.value);
    } else {
      this.categoryFilters.push(new FilterBadgeModel('category', this.modalCategoryIsEqual, [$event.value]));
    }

    this.categoryAutoComplate = '';
  }

  removeCategoryFilter(filter: FilterBadgeModel, filterIndex: number, valueIndex: number) {
    filter.values.splice(valueIndex, 1);

    if (filter.values.length === 0) {
      this.categoryFilters.splice(filterIndex, 1);
    }

    const categoryFilterIndex = this.filters.findIndex(x => x.name === 'category');

    if (categoryFilterIndex > -1) {
      this.filters[categoryFilterIndex] = filter;
    }
  }
}
