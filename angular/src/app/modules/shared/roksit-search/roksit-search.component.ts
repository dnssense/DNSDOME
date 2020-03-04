import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { ReportService } from 'src/app/core/services/ReportService';
import { SearchSetting, SearchSettingsType } from 'src/app/core/models/SearchSetting';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { RkFilterOutput } from 'roksit-lib/lib/modules/rk-filter-badge/rk-filter-badge.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { RkRadioOutput } from 'roksit-lib/lib/modules/rk-radio/rk-radio.component';

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
    private fastReportService: FastReportService
  ) {
    this.reportService.getReportList().subscribe(res => {
      this.allSavedReports = res;

      this.savedReports = res.filter(x => !x.system);
      this.systemSavedReports = res.filter(x => x.system);
    });

    this.staticService.getCategoryList().subscribe(result => {
      this.groupedCategories = this.groupCategories(result);
    });
  }

  @Input() searchSettings: SearchSetting;

  @Input() pageTitle: string;

  @Output() searchSettingEmitter = new EventEmitter();

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

  onSelectedDateChange($event) { }

  onTypeValueChange(type: SearchSettingsType) {
    this.searchSettings.type = type;
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
    const selectedCategories = [] as GroupedCategory[];

    this.selectedItems.forEach(elem => {
      const exists = elem.items.some(x => x.selected);

      if (exists) {
        selectedCategories.push(elem);
      }
    });

    if (selectedCategories.length > 0) {
      const findedCategories = this.filters.find(x => x.name === 'Categories');

      if (findedCategories) {
        findedCategories.values = selectedCategories.map(x => x.name);
      } else {
        this.addFilterBadge(new FilterBadgeModel('Categories', true, selectedCategories.map(x => x.name)));
      }
    }

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
    if ($event.name === 'Categories') {
      $event.values.forEach(value => {
        const category = this.groupedCategories.find(x => x.name === value);

        category.items.forEach(x => x.selected = false);
      });
    }

    this.filters.splice(index, 1);
  }

  search(type?: 'savedreport') {
    if (type === 'savedreport') {
      this.searchSettingEmitter.emit(this.searchSettings);

      return;
    }

    this.apply();

    this.searchSettings.must = [];
    this.searchSettings.mustnot = [];
    this.searchSettings.should = [];

    this.filters.forEach(filter => {
      if (filter.equal) {
        if (filter.name === 'Categories') {
          filter.values.forEach(value => {
            const selectedItems = this.getItemsByCategoryName(value);

            selectedItems.forEach(item => {
              this.searchSettings.must.push(new ColumnTagInput('category', '=', item.name));
            });
          });
        } else {
          filter.values.forEach(value => {
            this.searchSettings.must.push(new ColumnTagInput(filter.name, '=', value));
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
            this.searchSettings.mustnot.push(new ColumnTagInput(filter.name, '=', value));
          });
        }
      }
    });

    this.searchSettingEmitter.emit(this.searchSettings);
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
  }

  actionChanged($event: RkRadioOutput) {
    this.actionType = $event.value;
  }

  addFilterBadge(filter: FilterBadgeModel) {
    this.filters.push(filter);
  }

  savedReportValueChange() {
    const report = this.allSavedReports.find(x => x.id === this.savedReportValue);

    this.searchSettings = report;

    this.groupedCategories.forEach(category => {
      category.items.forEach(item => item.selected = false);
    });

    report.must.forEach(elem => {
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
}
