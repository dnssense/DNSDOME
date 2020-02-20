import { OnInit, Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { Category } from 'src/app/core/models/Category';
import { WApplication } from 'src/app/core/models/WApplication';
import { Subject, Subscription, Observable } from 'rxjs';
import { ArrayUtils } from 'src/app/core/ArrayUtils';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { LocationsService } from 'src/app/core/services/LocationService';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import * as countryList from 'src/app/core/models/Countries';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Location } from 'src/app/core/models/Location';
import { ValidationService } from 'src/app/core/services/validation.service';
import { ReportService } from 'src/app/core/services/ReportService';
import { ScheduledReport } from 'src/app/core/models/ScheduledReport';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';

declare var $: any;
declare var moment: any;

export class GroupedCategory {
  type: string;
  name: string;
  color?= '#3397c5';
  items: CategoryV2[];
}

@Component({
  selector: 'app-roksit-search',
  templateUrl: 'roksit-search.component.html',
  styleUrls: ['roksit-search.component.scss']
})
export class RoksitSearchComponent implements OnInit {

  @Input() searchSetting: SearchSetting;

  @Output() searchEmitter = new EventEmitter();

  @Output() searchSettingEmitter = new EventEmitter();

  columns: LogColumn[] = [];
  agents: Location[] = [];
  mainCategories: Category[] = [];
  mainApplications: WApplication[] = [];
  startDateee: Date = null;
  endDateee: Date = null;

  options: any[] = [
    { displayText: 'Last 5 Minutes', value: 5 },
    { displayText: 'Last 15 Minutes', value: 15 },
    { displayText: 'Last 30 Minutes', value: 30 },
    { displayText: 'Last 1 Hour', value: 60 },
    { displayText: 'Last 3 Hour', value: 180 },
    { displayText: 'Last 12 Hour', value: 720 },
    { displayText: 'Last 1 Day', value: 1440 },
    { displayText: 'Last 2 Day', value: 2880 },
    { displayText: 'Last 1 Week', value: 10080, select: true }
  ];

  columnFilterOptions: RkSelectModel[] = [];



  // Yeni tasarim sonrasi
  searchSettingForHtml: SearchSetting;
  searchStartDate: string;
  searchStartDateTime = '08:00';
  searchEndDate: string;
  searchEndDateTime = '18:00';
  selectedTab = 'home';
  currentColumn = 'domain';
  currentInput: any;
  editedTag: any;
  editedTagType: string;
  countries: any = [];
  current: ColumnTagInput;
  currentOperator = 'is';
  currentinputValue: string;
  select2: any = null;
  inputCollapsed = true;
  inputSelected = false;
  @ViewChild('inputElement') inputElement: ElementRef;

  selectedColumnFilter;
  filterText;
  isEqual;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  isOneOfCtrl = new FormControl();
  filteredIsOneOfs: Observable<string[]>;
  isOneOfList: string[] = [];
  isOneOfListItems: string[] = [];
  savedReports: SearchSetting[] = [];
  systemSavedReports: SearchSetting[] = [];
  selectedSavedReportName: string;
  newSavedReportName: string;
  @ViewChild('isOneOfInput') isOneOfInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  categories: CategoryV2[] = [];

  groupedCategories: GroupedCategory[] = [];

  filters: Array<{ name: string, equal: boolean, values: string[] }> = [];

  constructor(
    private fastReportService: FastReportService,
    private locationsService: LocationsService,
    private customReportService: CustomReportService,
    private notification: NotificationService,
    private alertService: AlertService,
    private reportService: ReportService,
    private roamingService: RoamingService,
    private staticService: StaticService
  ) {

    this.reportService.getReportList().subscribe(res => {
      this.savedReports = res.filter(x => !x.system);
      this.systemSavedReports = res.filter(x => x.system);
    });

    this.staticService.getCategoryList().subscribe(result => {
      this.categories = result;

      this.groupedCategories = this.groupCategoies(this.categories);
    });

    this.filteredIsOneOfs = this.isOneOfCtrl.valueChanges.map((f: string | null) => f ? this.filterChips(f) : this.isOneOfListItems.slice());

    if (!this.searchSetting) {
      this.searchSettingForHtml = new SearchSetting();
      this.searchSetting = new SearchSetting();
      this.current = new ColumnTagInput('domain', '=', '');
      this.currentOperator = 'is';
      this.currentColumn = 'domain';
    }
  }

  checkboxValueChange($event: boolean, category: GroupedCategory) {
    category.items.forEach(elem => {
      elem.selected = $event;
    });
  }

  private get getRandomColor() {
    const letters = '0123456789ABCDEF';

    let color = '#';

    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  }

  private groupCategoies(categories: CategoryV2[]) {
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

  addFilter(name: string, equal: boolean, value: string) {
    const foundedFilter = this.filters.find(item => item.name === name && item.equal === equal);

    if (foundedFilter) {
      if (!foundedFilter.values.find(val => val === value)) {
        foundedFilter.values.push(value);
      }
    } else {
      this.filters.push({ name: name, equal: equal, values: [value] });
    }
  }

  onSelectedDateChange(value: string) {
    this.search();
  }

  onValueChange(val: boolean) {
    // this.searchSetting.type = val ? "roksit" : "roksitblock";
    this.searchSettingEmitter.emit(this.searchSetting);
  }

  ngOnInit() {
    this.countries = countryList.countries;

    this.fastReportService.tableColumns.subscribe((res: LogColumn[]) => { this.columns = res; });

    this.customReportService.applications.subscribe((res: WApplication[]) => {
      const allApplications = res;
      if (res != null) {
        // Get the main categories...
        const tempcategoris = [];
        for (const cat of allApplications) {
          if (cat.parent == null) {
            tempcategoris.push(cat);
          }
          //  else {
          //   let arr = this.applicationsMap.get(cat.parent.id);
          //   if (arr == null || !arr) {
          //     arr = [];
          //   }
          //   arr.push(cat);
          //   this.applicationsMap.set(cat.parent.id, arr);
          // }
        }
        this.mainApplications = tempcategoris;
      }
    });

    this.customReportService.categories.subscribe((res: Category[]) => {
      const allCategories = res;
      if (res != null) {
        // Get the main categories...
        const tempcategoris = [];
        for (const cat of allCategories) {
          // if (cat.parent == null) {
          tempcategoris.push(cat);
          // } else {
          //   let arr = this.categoriesMap.get(cat.parent.id);
          //   if (arr == null || !arr) {
          //     arr = [];
          //   }
          //   arr.push(cat);
          //   this.categoriesMap.set(cat.parent.id, arr);
          // }
        }
        this.mainCategories = tempcategoris;
        /* for (let cat of this.mainCategories) {
         let sortedArray = this.categoriesMap.get(cat.id);
         sortedArray.sort(ArrayUtils.categoryCompare);
       }
       */
        this.mainCategories.sort(ArrayUtils.categoryCompare);
      }
    });

    this.locationsService.getLocations().subscribe((res: Location[]) => {
      this.agents = res;
    });

    this.roamingService.getClients().subscribe(res => {
      res.forEach(r =>
        this.agents.push(
          {
            agentAlias: r.agentAlias,
            id: 0,
            user: null,
            profile: null,
            bwList: null,
            agentIpGroups: null,
            appUserProfile: null,
            blockMessage: null,
            blockip: null,
            etvUser: null,
            logo: null
          }));
    });

    // $(document).on('click', '.dropdown', function (e) {
    //   e.stopPropagation();
    // });

    this.searchSetting.dateInterval = this.options[this.options.length - 1].value;
  }

  selectSavedReport(id: number) {
    const sr = this.savedReports.find(r => r.id == id);
    this.searchSetting = JSON.parse(JSON.stringify(sr));
    this.selectedSavedReportName = sr.name;
    this.newSavedReportName = sr.name;

    if (sr.should) {
      this.searchSettingForHtml.should = [];
      const fieldMap = [];
      sr.should.forEach(s => {
        if (fieldMap && fieldMap.find(f => f.field == s.field)) {
          const i = fieldMap.findIndex(f => f.field == s.field);
          fieldMap[i] = { field: s.field, value: fieldMap[i].value + ',' + s.value };
        } else {
          fieldMap.push({ field: s.field, value: s.value });
        }
      });
      fieldMap.forEach(fm => this.searchSettingForHtml.should.push(new ColumnTagInput(fm.field, '=', fm.value)));

    }
    if (sr.mustnot) {
      this.searchSettingForHtml.mustnot = [];
      const fieldMap = [];
      sr.mustnot.forEach(s => {
        if (fieldMap && fieldMap.find(f => f.field == s.field)) {
          const i = fieldMap.findIndex(f => f.field == s.field);
          fieldMap[i] = { field: s.field, value: fieldMap[i].value + ',' + s.value };
        } else {
          fieldMap.push({ field: s.field, value: s.value });
        }
      });
      fieldMap.forEach(fm => this.searchSettingForHtml.mustnot.push(new ColumnTagInput(fm.field, '=', fm.value)));

    }
  }

  saveReportFilters() {

    if (this.searchSetting.system == true &&
      (this.searchSetting.scheduledReport == null || this.searchSetting.scheduledReport.period == null)) {
      this.notification.warning('System reports can only be saved with a schedule option.');
      return;
    }

    if (this.newSavedReportName) {
      if (this.searchSetting.system && this.searchSetting.system == true) {
        this.searchSetting.id = -1;
        this.searchSetting.name = 'Customized-' + this.newSavedReportName;
      } else {
        this.searchSetting.name = this.newSavedReportName;
      }

      this.searchSetting.system = false;
      this.reportService.saveReport(this.searchSetting).subscribe(res => {
        if (res.status == 200) {
          this.notification.success(res.message);
          this.reportService.getReportList().subscribe(res => this.savedReports = res);
        } else {
          this.notification.error(res.message);
        }
      });
    } else {
      this.notification.warning('Please enter a name');
    }

  }

  changeScheduledPeriod(p: string) {

    $('#saveReportDiv').addClass('show');

    this.searchSetting.scheduledReport = new ScheduledReport();
    if (p == 'd' || p == 'w') {
      this.searchSetting.scheduledReport.period = p;
    } else {
      this.searchSetting.scheduledReport.period = null;
    }

  }

  deleteSavedReport(report: any) {
    this.alertService.alertWarningAndCancel('Are You Sure?', report.name + ' report settings will be deleted!').subscribe(
      res => {
        if (res) {
          this.reportService.deleteReport(report).subscribe(res => {
            if (res.status == 200) {
              this.notification.success(res.message);
              this.selectedSavedReportName = null;
              this.reportService.getReportList().subscribe(res => this.savedReports = res);
            } else {
              this.notification.error(res.message);
            }
          });
        }
      }
    );

  }

  public setSearchSetting(searchSetting: SearchSetting) {
    this.searchSetting = searchSetting;
  }

  public search() {
    this.searchEmitter.emit(this.searchSetting);
  }

  closeCalendarTab(tabId: string) {
    this.selectedTab = tabId;
  }

  inputClicked($event) {
    $event.stopPropagation();
  }

  changeCurrentColumn(colName: string) {

    $('#tagsDd').click(function (e) { e.stopPropagation(); });

    this.currentColumn = colName;

    if (this.currentOperator == 'isoneof' || this.currentOperator == 'isnotoneof') {
      this.isOneOfListItems = [];
      if (this.currentInput && !this.isOneOfList.includes(this.currentInput)) {
        this.isOneOfList.push(this.currentInput);
      }

      if (colName == 'category') {
        this.mainCategories.forEach(m => this.isOneOfListItems.push(m.categoryName));
      } else if (colName == 'applicationName') {
        this.mainApplications.forEach(m => this.isOneOfListItems.push(m.name));
      } else if (colName == 'sourceIpCountryCode' || colName == 'destinationIpCountryCode') {
        this.countries.forEach(c => this.isOneOfListItems.push(c.name));
      } else if (colName == 'agentAlias') {
        this.agents.forEach(c => this.isOneOfListItems.push(c.agentAlias));
      } else if (colName == 'reasonType') {
        this.isOneOfListItems.push('Category');
        this.isOneOfListItems.push('Application');
        this.isOneOfListItems.push('BlackList/Whitelist');
        this.isOneOfListItems.push('Noip Domain');
        this.isOneOfListItems.push('Malformed Query');
      } else if (colName == 'action') {
        this.isOneOfListItems.push('Allow');
        this.isOneOfListItems.push('Block');
      }

    } else {
      if (this.isOneOfList && this.isOneOfList.length > 0) {
        this.currentInput = this.isOneOfList[0];
      }
    }

  }

  addTag($event) {

    $event.stopPropagation();
    if (this.editedTag) {
      this.removeTag(this.editedTag, this.editedTagType);
      this.editedTag = null;
      this.editedTagType = null;
    }

    if (this.currentOperator == 'isoneof' || this.currentOperator == 'isnotoneof') {
      if (this.currentColumn == 'reasonType') {
        const convertedList = [];
        this.isOneOfList.forEach(x => {
          switch (x) {
            case 'Category':
              convertedList.push('category');
              break;
            case 'Application':
              convertedList.push('application');
              break;
            case 'BlackList/Whitelist':
              convertedList.push('bwlist');
              break;
            case 'Noip Domain':
              convertedList.push('noip');
              break;
            case 'Malformed Query':
              convertedList.push('malformed');
              break;
            default:
              break;
          }
        });
        this.currentInput = convertedList.join(',');
      } else if (this.currentColumn == 'sourceIpCountryCode' || this.currentColumn == 'destinationIpCountryCode') {
        const convertedList = [];
        this.isOneOfList.forEach(x => { convertedList.push(this.countries.find(c => c.name == x).code); });
        this.currentInput = convertedList.join(',');
      } else {
        this.currentInput = this.isOneOfList.join(',');
      }
    }

    if (this.currentInput == '') {
      this.notification.warning('Please enter a valid input');
      return;
    }

    this.current.value = this.currentInput;
    this.current.operator = '='; // default and only value is equal
    this.current.field = this.currentColumn;

    if (this.currentColumn == 'sourceIp' || this.currentColumn == 'destinationIp' || this.currentColumn == 'clientLocalIp') {
      if (!this.checkIp(this.currentInput)) {
        return;
      }
    } else if (this.currentColumn == 'domain' || this.currentColumn == 'subdomain') {
      const result = ValidationService.domainValidation({ value: this.currentInput });
      if (result != true) {
        this.notification.warning('Please enter a valid domain');
        return;
      }
    }

    let addStatus = true;
    if (this.currentOperator == 'is') {
      for (const op of this.searchSetting.must) {
        if (op.field == this.current.field && op.operator == this.current.operator &&
          op.value == this.current.value) {
          if (op.id != this.current.id) {
            return;
          }
          op.field = this.currentColumn;
          op.operator = this.currentOperator;
          op.value = this.currentInput;
          addStatus = false;
        }
      }
      if (addStatus) {
        this.searchSetting.must.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
        this.searchSettingForHtml.must.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
      }

    } else if (this.currentOperator == 'isnot' || this.currentOperator == 'isnotoneof') {
      for (const op of this.searchSetting.mustnot) {
        if (op.field == this.current.field && op.operator == this.current.operator &&
          op.value == this.current.value) {
          if (op.id != this.current.id) {
            return;
          }
          op.field = this.currentColumn;
          op.operator = this.currentOperator;
          op.value = this.currentInput;
          addStatus = false;
        }
      }
      if (addStatus) {
        if (this.currentOperator == 'isnotoneof' && this.currentInput.includes(',')) {
          this.currentInput.split(',').forEach(x => this.searchSetting.mustnot.push(new ColumnTagInput(this.currentColumn, '=', x)));
          this.searchSettingForHtml.mustnot.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
        } else {
          this.searchSetting.mustnot.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
          this.searchSettingForHtml.mustnot.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
        }
      }
    } else if (this.currentOperator == 'isoneof') {
      for (const op of this.searchSetting.should) {
        if (op.field == this.current.field && op.operator == this.current.operator &&
          op.value == this.current.value) {
          if (op.id != this.current.id) {
            return;
          }
          op.field = this.currentColumn;
          op.operator = this.currentOperator;
          op.value = this.currentInput;
          addStatus = false;
        }
      }
      if (addStatus) {
        if (this.currentInput.includes(',')) {
          this.currentInput.split(',').forEach(x => this.searchSetting.should.push(new ColumnTagInput(this.currentColumn, '=', x)));
          this.searchSettingForHtml.should.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
        } else {
          this.searchSetting.should.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
          this.searchSettingForHtml.should.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
        }

      }
    }

    $('#tagsDd').removeClass('show');

    this.current = new ColumnTagInput('domain', '=', '');
    this.currentColumn = this.current.field;
    this.currentOperator = 'is';
    this.currentInput = this.current.value;
    this.currentinputValue = '';
    this.inputCollapsed = true;
    this.inputSelected = false;

    this.isOneOfList = [];

  }

  cancelFilterPopup() {
    $('#tagsDd').removeClass('show');
  }

  closeSearchBoxDropdownDate() {
    $('#searchBoxDropdownDate .dropdown-menu').removeClass('show');

    const searchDateInput: string = $('#searchDateInput').val();
    if (searchDateInput.length > 1) {

      const dd = searchDateInput.split(' to ');

      if (searchDateInput.includes('to')) {

        this.startDateee = moment(dd[0] + ' ' + this.searchStartDateTime, 'YYYY-MM-DD HH:mm').toDate();
        this.endDateee = moment(dd[1] + ' ' + this.searchEndDateTime, 'YYYY-MM-DD HH:mm').toDate();
        this.searchStartDate = dd[0] + ' ' + this.searchStartDateTime;
        this.searchEndDate = dd[1] + ' ' + this.searchEndDateTime;
      } else {
        this.startDateee = moment(dd[0] + ' ' + this.searchStartDateTime, 'YYYY-MM-DD HH:mm').toDate();
        this.endDateee = moment(dd[0] + ' ' + this.searchEndDateTime, 'YYYY-MM-DD HH:mm').toDate();
        this.searchStartDate = dd[0] + ' ' + this.searchStartDateTime;
        this.searchEndDate = dd[0] + ' ' + this.searchEndDateTime;
      }

      const startDate = this.startDateee == null ? '' : moment(this.startDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
      const endDate = this.endDateee == null ? '' : moment(this.endDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');

      const dateVal = startDate + ' - ' + endDate;
      this.searchSetting.dateInterval = dateVal;
    }
  }

  refreshFilterPanel() {
    this.isOneOfList = [];
    this.editedTag = null;
    this.editedTagType = null;
    this.current = new ColumnTagInput('domain', '=', '');
    this.currentColumn = this.current.field;
    this.currentOperator = 'is';
    this.currentInput = this.current.value;
    this.currentinputValue = '';
    this.inputCollapsed = true;
    this.inputSelected = false;
  }

  public inputsChanged($event, select: boolean) {
    $event.stopPropagation();

    if ($event.keyCode === 13) {
      this.addTag(event);
      return;
    }
    if (select) {
      this.currentInput = '';
    }

    if (this.inputSelected) {
      this.current.value = this.currentInput;
      this.current.operator = this.currentOperator;
      this.current.field = this.currentColumn;
      this.currentinputValue = '';
    } else {
      this.currentinputValue =
        '' + this.currentColumn + this.currentOperator + this.currentInput;
    }

    if (
      this.currentColumn == 'applicationName' ||
      this.currentColumn == 'category' ||
      this.currentColumn == 'agentAlias' ||
      this.currentColumn == 'sourceIpCountryCode' ||
      this.currentColumn == 'destinationIpCountryCode'
    ) {
      // this.initSelect();
    }
  }

  changeSearchSettingType(type: string) {
    if (type == 'roksit' || type == 'roksitblock') {
      this.searchSetting.type = type;
    }
  }

  changeSearchSettingDate(interval: string) {
    if (Number(interval) > 0) {
      this.searchSetting.dateInterval = interval;
    }
  }

  public editTag(tag: any, type: string) {

    this.editedTag = tag;
    this.editedTagType = type;

    this.currentColumn = tag.field;
    this.currentOperator = type;

    if (type == 'isoneof' || (type == 'isnot' && tag.value && tag.value.toString().includes(','))) {

      if (this.currentColumn == 'reasonType') {
        tag.value.split(',').forEach(x => {
          switch (x) {
            case 'category':
              this.isOneOfList.push('Category');
              break;
            case 'application':
              this.isOneOfList.push('Application');
              break;
            case 'bwlist':
              this.isOneOfList.push('BlackList/Whitelist');
              break;
            case 'noip':
              this.isOneOfList.push('Noip Domain');
              break;
            case 'malformed':
              this.isOneOfList.push('Malformed Query');
              break;
            default:
              break;
          }
        });
      } else if (this.currentColumn == 'sourceIpCountryCode' || this.currentColumn == 'destinationIpCountryCode') {
        tag.value.split(',').forEach(x => { this.isOneOfList.push(this.countries.find(c => c.code == x).name); });
      } else {
        this.isOneOfList = tag.value.split(',');
      }

      if (type == 'isnot') {
        this.currentOperator = 'isnotoneof';
      }
    } else {
      this.currentInput = tag.value;
    }

    $('#tagsDd').addClass('show');
    $('.filterButton').click(function (e) {
      e.stopPropagation();
    });

  }

  public removeTag(tag: any, type: string) {

    if (type == 'is') {
      this.searchSetting.must.splice(this.searchSetting.must.findIndex(a => a.field == tag.field && a.value == tag.value), 1);
    } else if (type == 'isnot') {
      if (tag.value && tag.value.toString().includes(',')) {
        this.searchSetting.mustnot.splice(this.searchSetting.mustnot.findIndex(a => a.field == tag.field));
        this.searchSettingForHtml.mustnot.splice(this.searchSettingForHtml.mustnot.findIndex(a => a.field == tag.field));
      } else {
        this.searchSetting.mustnot.splice(this.searchSetting.mustnot.findIndex(a => a.field == tag.field && a.value == tag.value), 1);
        this.searchSettingForHtml.mustnot.splice(this.searchSettingForHtml.mustnot.findIndex(a => a.field == tag.field && a.value == tag.value), 1);
      }
    } else if (type == 'isoneof') {
      this.searchSetting.should.splice(this.searchSetting.should.findIndex(a => a.field == tag.field));
      this.searchSettingForHtml.should.splice(this.searchSettingForHtml.should.findIndex(a => a.field == tag.field));
    }
    this.currentinputValue = '';

  }

  public removeAllTags() {
    this.alertService.alertWarningAndCancel('Are You Sure?', 'Your search parameters will be removed!').subscribe(
      res => {
        if (res) {

          this.searchSetting = new SearchSetting();
          this.searchSettingForHtml = new SearchSetting();
          this.selectedSavedReportName = null;
          this.newSavedReportName = null;
          this.currentinputValue = '';
        }
      }
    );
  }

  addChip(event: MatChipInputEvent): void {

    $('#tagsDd').addClass('show');

    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const val = event.value;

      if ((val || '').trim()) {
        if (this.currentColumn == 'domain' || this.currentColumn == 'subdomain') {
          const result = ValidationService.domainValidation({ value: val });
          if (result == true && this.isOneOfList) {
            this.isOneOfList.push(val.trim());
          } else {
            this.notification.warning('Please enter a valid item!');
            return;
          }
        } else if (this.currentColumn == 'sourceIp' || this.currentColumn == 'destinationIp' || this.currentColumn == 'clientLocalIp') {

          const result = this.checkIp(val); // ValidationService.isValidIpString(val);
          if (result == true) {
            this.isOneOfList.push(val.trim());
          } else {
            this.notification.warning('Please enter a valid IP!');
            return;
          }

        } else {
          this.isOneOfList.push(val.trim());
        }
      }

      if (input) { input.value = ''; }
      this.isOneOfCtrl.setValue(null);

    }
  }

  removeChip(item: string): void {
    $('#tagsDd').addClass('show');
    const index = this.isOneOfList.indexOf(item);

    if (index >= 0) {
      this.isOneOfList.splice(index, 1);
    }
  }

  selectedChip(event: MatAutocompleteSelectedEvent): void {
    $('#tagsDd').addClass('show');

    if (this.currentColumn == 'category' || this.currentColumn == 'applicationName') {
      if (this.isOneOfList.find(x => x == event.option.viewValue) != null) {
        this.notification.warning('This item is already added!');
      } else {
        this.isOneOfList.push(event.option.viewValue);

      }
    } else {
      this.isOneOfList.push(event.option.viewValue);
    }

    this.isOneOfInput.nativeElement.value = '';
    this.isOneOfCtrl.setValue(null);
  }

  private filterChips(value: string): string[] {
    $('#tagsDd').addClass('show');

    if (value) {
      return this.isOneOfListItems.filter(f => f.toLowerCase().indexOf(value.toLowerCase()) === 0);
    }
    return null;
  }

  public checkIp(ipForCheck: string): boolean {
    if (ipForCheck.includes(',')) {
      const ips = ipForCheck.split(',');
      ips.forEach(ip => {
        const res = ValidationService.isValidIpWithLocals(ip);
        if (!res) {
          this.notification.warning('Invalid IP');
          return res;
        }
      });
    } else {
      const res = ValidationService.isValidIpWithLocals(ipForCheck);
      if (!res) {
        this.notification.warning('Invalid IP');
        return res;
      }
    }

    return true;
  }

  checkIPNumber(event: KeyboardEvent, inputValue: string) {

    const allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'Backspace', 'ArrowLeft', 'ArrowRight', '.', 'Tab'];
    let isValid = false;

    for (let i = 0; i < allowedChars.length; i++) {
      if (allowedChars[i] == event.key) {
        isValid = true;
        break;
      }
    }
    if (inputValue && (event.key != 'Backspace' && event.key != 'ArrowLeft' && event.key != 'ArrowRight')) {
      if (event.key != '.') {
        inputValue += event.key;
      }
      const lastOcletStr = inputValue.substring(inputValue.lastIndexOf('.') + 1);
      const lastOclet = Number(lastOcletStr);
      if (isValid && (lastOclet > 255 || lastOclet < 0 || lastOcletStr.length > 3)) {
        isValid = false;
      }
      if (isValid && event.key == '.') {
        const oclets: string[] = inputValue.split('.');
        for (let i = 0; i < oclets.length; i++) {
          const oclet = oclets[i];
          if (Number(oclet) < 0 || Number(oclet) > 255) {
            isValid = false;
            break;
          }
        }
      }

      if (isValid && event.key == '.' && (inputValue.endsWith('.') || inputValue.split('.').length >= 4)) {
        isValid = false;
      }
    } else if (isValid && event.key == '.') {
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
    }
  }


}
