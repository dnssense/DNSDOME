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
  values: string[];
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

  savedReports: SearchSetting[] = [];
  systemSavedReports: SearchSetting[] = [];
  savedReportValue: number;

  filters: FilterBadgeModel[] = [];

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
        this.manuelFilters.push(obj);

        this.filterText = '';
      }
    }
  }

  removeManuelFilter(index: number) {
    this.manuelFilters.splice(index, 1);
  }

  apply(close = false) {
    this.manuelFilters.forEach(elem => {
      const exists = this.searchSettings.must.concat(this.searchSettings.mustnot).some(x => x.field === elem.name);

      if (!exists) {
        if (elem.equal) {
          this.searchSettings.must.push(new ColumnTagInput(elem.name, '=', elem.values[0]));
        } else {
          this.searchSettings.mustnot.push(new ColumnTagInput(elem.name, '=', elem.values[0]));
        }
      }
    });

    this.selectedItems.forEach(elem => {
      const model = new ColumnTagInput(elem.name, '=', elem.items.map(x => x.name).join(','));

      this.searchSettings.must.push(model);
    });

    if (this.actionType === 'allow') {
      const index = this.searchSettings.mustnot.findIndex(x => x.field === 'action');

      if (index > -1) {
        this.searchSettings.mustnot.splice(index, 1);
      }

      // const actionType = this.searchSettings.must.some(x => x.field === 'action');

      // if (!actionType) {
      //   this.searchSettings.must.push(new ColumnTagInput('action', '=', 'true'));
      // }
    } else if (this.actionType === 'deny') {
      const index = this.searchSettings.must.findIndex(x => x.field === 'deny');

      if (index > -1) {
        this.searchSettings.must.splice(index, 1);
      }

      // const actionType = this.searchSettings.mustnot.some(x => x.field === 'deny');

      // if (!actionType) {
      //   this.searchSettings.mustnot.push(new ColumnTagInput('action', '=', 'false'));
      // }
    }

    this.searchSettingEmitter.emit(this.searchSettings);

    if (close) {
      this.filterModal.toggle();
    }
  }

  private get selectedItems() {
    const newList = [] as GroupedCategory[];

    this.groupedCategories.forEach(elem => {
      const selectedItems = elem.items.filter(x => x.selected);

      if (selectedItems.length > 0) {
        elem.items = selectedItems;

        newList.push(elem);
      }
    });

    return newList;
  }

  onChangeFilterBadge($event: RkFilterOutput, type: 'must' | 'mustnot') {
    if (type === 'must') {
      const column = this.searchSettings.must[$event.index];

      if (column) {
        this.searchSettings.must.splice($event.index, 1);

        this.searchSettings.mustnot.push(column);

        const filter = this.manuelFilters.find(x => x.name === column.field);

        if (filter) {
          filter.equal = true;
        }
      }
    } else {
      const column = this.searchSettings.mustnot[$event.index];

      if (column) {
        this.searchSettings.mustnot.splice($event.index, 1);

        this.searchSettings.must.push(column);

        const filter = this.manuelFilters.find(x => x.name === column.field);

        if (filter) {
          filter.equal = false;
        }
      }
    }
  }

  onEditedFilterBadge($event: RkFilterOutput, type: 'must' | 'mustnot') {
    this.filterModal.toggle();
  }

  onDeletedFilterBadge($event: RkFilterOutput, type: 'must' | 'mustnot') {
    if (type === 'must') {
      this.searchSettings.must.splice($event.index, 1);
    } else {
      this.searchSettings.mustnot.splice($event.index, 1);
    }

    const filterIndex = this.manuelFilters.findIndex(x => x.name === $event.name);

    if (filterIndex > -1) {
      this.manuelFilters.splice(filterIndex, 1);
    }
  }

  search() {
    this.apply();
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
}
