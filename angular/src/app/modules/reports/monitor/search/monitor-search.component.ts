import { OnInit, Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { Category } from 'src/app/core/models/Category';
import { WApplication } from 'src/app/core/models/WApplication';
import { Subject, Subscription, Observable } from 'rxjs';
import { ArrayUtils } from 'src/app/ArrayUtils';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { LocationsService } from 'src/app/core/services/LocationService';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import * as countryList from 'src/app/core/models/Countries';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { DatePipe } from '@angular/common';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith } from 'rxjs/internal/operators';
import { Location } from 'src/app/core/models/Location';
import { ValidationService } from 'src/app/core/services/validation.service';
import { ReportService } from 'src/app/core/services/ReportService';


declare var $: any;
declare var Flatpickr: any;
declare var moment: any;
declare var WebuiPopovers: any;
declare var Waypoint: any;

@Component({
  selector: 'app-monitor-search',
  templateUrl: 'monitor-search.component.html',
  styleUrls: ['monitor-search.component.css']
})
export class MonitorSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  public columns: LogColumn[];
  public agents: Location[];
  public mainCategories: Category[];
  public mainApplications: WApplication[];
  //public categoriesMap = new Map<number, Category[]>();
  //public applicationsMap = new Map<number, WApplication[]>();
  // public expanded = true;
  public startDateee: Date = null;
  public endDateee: Date = null;
  //public start_date_pickr = null;
  //public end_date_pickr = null;

  // private tableColumnsubscription: Subscription;
  // private configItemsSubscription: Subscription;
  // private applicationsSubscription: Subscription;
  // private categoriesSubscription: Subscription;
  private ngUnsubscribe: Subject<any> = new Subject<any>(); // ne icin kullaniliyor? gereksizse silelim

  @Input() searchSetting: SearchSetting;
  @Output() public searchEmitter = new EventEmitter();
  @Output() public searchSettingEmitter = new EventEmitter();

  // @ViewChild('settingNameConfirmationModal') settingNameConfirmationModal: any;
  // @ViewChild('popoverbtn') popoverbtn: ElementRef;
  // @ViewChild('dateSelect') dateSelect: ElementRef;
  // @ViewChild('startDateCal') startDateCal: ElementRef;
  // @ViewChild('endDateCal') endDateCal: ElementRef;
  // @ViewChild('customdaterange') customdaterange: ElementRef;
  // @ViewChild('btn') btn: ElementRef;
  // @ViewChild('fastSearchSetting') fastSearchSetting: ElementRef;
  // @ViewChild('dateOverlay') dateOverlay: any;


  //Yeni tasarim sonrasi
  searchSettingForHtml: SearchSetting;
  searchStartDate: string;
  searchStartDateTime: string = '08:00';
  searchEndDate: string;
  searchEndDateTime: string = '18:00';
  selectedTab: string = 'home';
  currentColumn: string = 'domain';
  currentInput: any;
  editedTag: any;
  editedTagType: string;
  countries: any = [];
  current: ColumnTagInput;
  currentOperator: string = 'is';
  currentinputValue: string;
  select2: any = null;
  inputCollapsed: boolean = true;
  inputSelected: boolean = false;
  @ViewChild('inputElement') inputElement: ElementRef;
  // @ViewChild('mainInputElement') mainInputElement: ElementRef;
  // @ViewChild('tagInput') tagInput: ElementRef;
  // @ViewChild('select') select: ElementRef;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  isOneOfCtrl = new FormControl();
  filteredIsOneOfs: Observable<string[]>;
  isOneOfList: string[] = [];
  isOneOfListItems: string[] = [];
  savedReports: SearchSetting[] = []
  selectedSavedReportName: string;
  newSavedReportName: string;
  @ViewChild('isOneOfInput') isOneOfInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(private fastReportService: FastReportService, private locationsService: LocationsService, private datePipe: DatePipe,
    private customReportService: CustomReportService, private notification: NotificationService, private alertService: AlertService,
    private reportService: ReportService) {

    this.reportService.getReportList().subscribe(res => {
      this.savedReports = res;
      console.log(res);

    });

    this.filteredIsOneOfs = this.isOneOfCtrl.valueChanges.pipe(startWith(null), map((f: string | null) => f ? this.filterChips(f) : this.isOneOfListItems.slice()));

    if (!this.searchSetting) {
      this.searchSettingForHtml = new SearchSetting();
      this.searchSetting = new SearchSetting();
      this.current = new ColumnTagInput('domain', '=', '');
      this.currentOperator = 'is';
      this.currentColumn = 'domain';

    }

  }

  ngOnInit() {
    this.countries = countryList.countries;

    this.fastReportService.tableColumns.subscribe((res: LogColumn[]) => { this.columns = res; });

    this.customReportService.applications.subscribe((res: WApplication[]) => {
      let allApplications = res;
      if (res != null) {
        // Get the main categories...
        let tempcategoris = [];
        for (let cat of allApplications) {
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
      let allCategories = res;
      if (res != null) {
        // Get the main categories...
        let tempcategoris = [];
        for (let cat of allCategories) {
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

    this.locationsService.getLocations().takeUntil(this.ngUnsubscribe).subscribe((res: Location[]) => {
      this.agents = res;
    });
  }

  ngAfterViewInit() {
    this.setDropdown();

    $('#tagsDd').click(function (e) {
      e.stopPropagation();
    });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  selectSavedReport(id: number) {
    let sr = this.savedReports.find(r => r.id == id);
    this.searchSetting = JSON.parse(JSON.stringify(sr));
    this.selectedSavedReportName = sr.name;

    if (sr.should) {
      this.searchSettingForHtml.should = [];
      let fieldMap = [];
      sr.should.forEach(s => {
        if (fieldMap && fieldMap.find(f => f.field == s.field)) {
          const i = fieldMap.findIndex(f => f.field == s.field);
          fieldMap[i] = { field: s.field, value: fieldMap[i].value + ',' + s.value };
        } else {
          fieldMap.push({ field: s.field, value: s.value });
        }
      });
      fieldMap.forEach(fm => this.searchSettingForHtml.should.push(new ColumnTagInput(fm.field, '=', fm.value)))

    }
    if (sr.mustnot) {
      this.searchSettingForHtml.mustnot = [];
      let fieldMap = [];
      sr.mustnot.forEach(s => {
        if (fieldMap && fieldMap.find(f => f.field == s.field)) {
          const i = fieldMap.findIndex(f => f.field == s.field);
          fieldMap[i] = { field: s.field, value: fieldMap[i].value + ',' + s.value };
        } else {
          fieldMap.push({ field: s.field, value: s.value });
        }
      });
      fieldMap.forEach(fm => this.searchSettingForHtml.mustnot.push(new ColumnTagInput(fm.field, '=', fm.value)))

    }

  }

  saveReportFilters() {
    this.searchSetting.name = this.newSavedReportName;
    this.reportService.saveReport(this.searchSetting).subscribe(res => {
      if (res.status == 200) {
        this.notification.success(res.message);
        this.reportService.getReportList().subscribe(res => this.savedReports = res);
      } else {
        this.notification.error(res.message);
      }
    })
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

  //date panel icin kullanilacak
  // public showDatePanel($event) {

  //   this.dateOverlay.hide();

  //   let value = $event.target.value;

  //   if (value === -1 || value.indexOf('-') > -1) {
  //     if (this.searchSetting.dateInterval.indexOf('-') > 0) {
  //       let dd = this.searchSetting.dateInterval.split('-');
  //       this.startDateee = moment(dd[0], 'DD.MM.YYYY HH:mm:ss').toDate();
  //       this.endDateee = moment(dd[1], 'DD.MM.YYYY HH:mm:ss').toDate();
  //     } else {
  //       let startDate = moment();
  //       startDate.add(-1, 'day');
  //       this.startDateee = startDate.toDate();
  //       this.endDateee = moment().toDate();
  //     }

  //     this.start_date_pickr = new Flatpickr(this.startDateCal.nativeElement, {
  //       animate: false,
  //       allowInput: false,
  //       enableTime: true,
  //       defaultDate: this.startDateee,
  //       maxDate: new Date(),
  //       dateFormat: 'd.m.Y H:i:S',
  //       time_24hr: true,
  //       utc: false,
  //       onValueUpdate: (e, args) => {
  //         this.startDateee = args;
  //         this.start_date_pickr.toggle();
  //         this.end_date_pickr.toggle();
  //       }
  //     });
  //     // alert(start_date_pickr.selectedDateObj);
  //     this.end_date_pickr = new Flatpickr(this.endDateCal.nativeElement, {
  //       animate: false,
  //       allowInput: false,
  //       enableTime: true,
  //       defaultDate: this.endDateee,
  //       maxDate: new Date(),
  //       dateFormat: 'd.m.Y H:i:S',
  //       time_24hr: true,
  //       utc: false,
  //       onValueUpdate: (e, args) => {
  //         this.endDateee = args;
  //         this.end_date_pickr.toggle();
  //       }
  //     });
  //     this.dateOverlay.show($event);
  //   } else {

  //     $(this.dateSelect.nativeElement).val(value);
  //     this.searchSetting.dateInterval = value;
  //     this.dateOverlay.hide();
  //   }
  // }

  // public hideDatePopover() {
  //   var option = this.customdaterange.nativeElement;
  //   let startDate = this.startDateee == null ? '' : moment(this.startDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
  //   let endDate = this.endDateee == null ? '' : moment(this.endDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
  //   let vall = startDate + ' - ' + endDate;
  //   this.start_date_pickr.destroy();
  //   this.end_date_pickr.destroy();

  //   if (vall !== ' - ') {
  //     this.searchSetting.dateInterval = vall;
  //     option.text = vall;
  //     option.value = vall;
  //   } else {
  //     option.innerHTML = 'Custom Range';
  //     option.value = '-1';
  //   }
  //   this.dateOverlay.hide();
  // }

  closeCalendarTab(tabId: string) {
    this.selectedTab = tabId;

    if (tabId == 'profile') {
      $('#home').removeClass('active show');

      $('.flatpickr-time ').css({ 'width': '100px', 'background-color': '#eee', 'border-radius': '5px', 'box-shadow': 'none' });
      $('.flatpickr-calendar').css('box-shadow', 'none');
      $('.flatpickr-days').css('color', '#7c86a2');
      $('.flatpickr-day').css('color', '#7c86a2');
      $('.inRange').css('background', 'transparent');
      $('.flatpickr-months').css('display', 'none');
      $('.flatpickr-disabled').css({ 'cursor': 'not-allowed', 'color': 'rgba(124,134,162,0.3)' });
      //$('.flatpickr-current-month').css({ 'display':'none', 'color': '#6c84fa', 'width': 'auto', 'padding': '0', 'left': '5px', 'font-size': '15px' });

      $('#searchBoxDropdownDate .dropdown-menu .nav-tabs li').click(function (e) {
        setTimeout(() => {
          $('#searchBoxDropdownDate').addClass('show');
        }, 1);
      });
    } else {
      $('#profile').removeClass('active show');
    }

  }

  setDropdown() {

    let dropdownId = '#searchBoxDropdownDate'
    let datepickerId = '.datepicker2'
    $(dropdownId + ' .dropdown-menu .nav-tabs li').click(function (e) {
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });

    let today = new Date();
    const last10Days = this.datePipe.transform(new Date().setDate(today.getDate() - 10), 'yyyy-MM-dd')

    $(datepickerId).flatpickr({ mode: 'range', inline: true, enableTime: false, maxDate: "today", minDate: last10Days });

    $(dropdownId + ' .flatpickr-prev-month').click(function (e) {
      $('.flatpickr-day').css('color', '#7c86a2');
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });
    $(dropdownId + ' .flatpickr-next-month').click(function (e) {
      $('.flatpickr-day').css('color', '#7c86a2');
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });
    $(dropdownId + ' .flatpickr-time').click(function (e) {
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });
    $(dropdownId + ' .flatpickr-monthDropdown-months').click(function (e) {
      $('.flatpickr-day').css('color', '#7c86a2');
    });
    $(dropdownId + ' .arrowUp').click(function (e) {
      $('.flatpickr-day').css('color', '#7c86a2');
    });
    $(dropdownId + ' .arrowDown').click(function (e) {
      $('.flatpickr-day').css('color', '#7c86a2');
    });
    $(dropdownId + ' .flatpickr-day').click(function (e) {
      $('.flatpickr-day').css('color', '#7c86a2');
      $('.flatpickr-disabled').css({ 'cursor': 'not-allowed', 'color': 'rgba(124,134,162,0.3)' });
    });
    $(dropdownId + ' .inRange').click(function (e) {
      $('.flatpickr-day').css('color', '#7c86a2');
    });
  }

  searchDateChanged() {
    $('.flatpickr-day').css('color', '#7c86a2');
    $('.inRange').css({ 'background': 'transparent', 'box-shadow': 'none' });
    $('.startRange').css({ 'border-radius': '50%', 'background': '#6c84fa', 'color': '#eee' });
    $('.endRange').css({ 'border-radius': '50%', 'background': '#6c84fa', 'color': '#eee', 'box-shadow': 'none' });
    $('.flatpickr-disabled').css({ 'cursor': 'not-allowed', 'color': 'rgba(124,134,162,0.3)' });
  }

  inputClicked($event) {
    $event.stopPropagation();
  }

  changeCurrentColumn(colName: string) {

    $('#tagsDd').click(function (e) { e.stopPropagation(); });

    this.currentColumn = colName;

    this.isOneOfListItems = [];
    if (this.currentOperator == 'isoneof' || this.currentOperator == 'isnotoneof') {
      if (colName == 'category') {
        this.mainCategories.forEach(m => this.isOneOfListItems.push(m.categoryName))
      }
      else if (colName == 'applicationName') {
        this.mainApplications.forEach(m => this.isOneOfListItems.push(m.name))
      } else if (colName == 'sourceIpCountryCode' || colName == 'destinationIpCountryCode') {
        this.countries.forEach(c => this.isOneOfListItems.push(c.name))
      } else if (colName == 'agentAlias') {
        this.agents.forEach(c => this.isOneOfListItems.push(c.agentAlias))
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
        let convertedList = [];
        this.isOneOfList.forEach(x => {
          switch (x) {
            case 'Category':
              convertedList.push('category')
              break;
            case 'Application':
              convertedList.push('application')
              break;
            case 'BlackList/Whitelist':
              convertedList.push('bwlist')
              break;
            case 'Noip Domain':
              convertedList.push('noip')
              break;
            case 'Malformed Query':
              convertedList.push('malformed')
              break;
            default:
              break;
          }
        });
        this.currentInput = convertedList.join(',');
      } else if (this.currentColumn == 'sourceIpCountryCode' || this.currentColumn == 'destinationIpCountryCode') {
        let convertedList = [];
        this.isOneOfList.forEach(x => { convertedList.push(this.countries.find(c => c.name == x).code) });
        this.currentInput = convertedList.join(',');
      } else {
        this.currentInput = this.isOneOfList.join(',');
      }

    }

    if (this.currentInput == '') {
      //this.tagInput.nativeElement.focus();
      return;
    }

    this.current.value = this.currentInput;
    this.current.operator = '=' // default and only value is equal
    this.current.field = this.currentColumn;

    if (this.currentColumn == 'sourceIp' || this.currentColumn == 'destinationIp') {
      if (!this.checkIp(this.currentInput)) {
        return;
      }
    } else if (this.currentColumn == 'domain' || this.currentColumn == 'subdomain') {
      let result = ValidationService.domainValidation({ value: this.currentInput })
      if (result != true) {
        return;
      }
    }

    var addStatus = true;
    if (this.currentOperator == 'is') {
      for (let op of this.searchSetting.must) {
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
      for (let op of this.searchSetting.mustnot) {
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
      for (let op of this.searchSetting.should) {
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

    let searchDateInput: string = $("#searchDateInput").val();
    if (searchDateInput.length > 1) {

      let dd = searchDateInput.split(' to ');

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

      let startDate = this.startDateee == null ? '' : moment(this.startDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
      let endDate = this.endDateee == null ? '' : moment(this.endDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');

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
debugger
    this.editedTag = tag;
    this.editedTagType = type;

    this.currentColumn = tag.field;
    this.currentOperator = type;

    if (type == 'isoneof' || (type == 'isnot' && tag.value.includes(','))) {

      if (this.currentColumn == 'reasonType') {
        tag.value.split(',').forEach(x => {
          switch (x) {
            case 'category':
              this.isOneOfList.push('Category')
              break;
            case 'application':
              this.isOneOfList.push('Application')
              break;
            case 'bwlist':
              this.isOneOfList.push('BlackList/Whitelist')
              break;
            case 'noip':
              this.isOneOfList.push('Noip Domain')
              break;
            case 'malformed':
              this.isOneOfList.push('Malformed Query')
              break;
            default:
              break;
          }
        });
      } else if (this.currentColumn == 'sourceIpCountryCode' || this.currentColumn == 'destinationIpCountryCode') {
        tag.value.split(',').forEach(x => { this.isOneOfList.push(this.countries.find(c => c.code == x).name) });
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
      if (tag.value.includes(',')) {
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

          let result = ValidationService.domainValidation({ value: val });
          if (result == true) {
            this.isOneOfList.push(val.trim());

          } else {
            this.notification.warning('Please enter a valid item!');
            return;
          }
        } else if (this.currentColumn == 'sourceIp' || this.currentColumn == 'destinationIp') {

          let result = ValidationService.isValidIpString(val);
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

    this.isOneOfList.push(event.option.viewValue);
    this.isOneOfInput.nativeElement.value = '';
    this.isOneOfCtrl.setValue(null);
  }

  private filterChips(value: string): string[] {
    $('#tagsDd').addClass('show');

    return this.isOneOfListItems.filter(f => f.toLowerCase().indexOf(value.toLowerCase()) === 0);
  }

  // public positionInputElement(sourcePosition) {
  //   setTimeout(() => {
  //     let position = $(sourcePosition).position();
  //     $(this.inputElement.nativeElement).css({
  //       top: position.top + 21,
  //       left: position.left - 1,
  //       position: 'absolute'
  //     });
  //   }, 50);
  // }

  // public initSelect() {
  //   if (this.select2 != null) {
  //     this.select2.select2('destroy');
  //   }
  //   this.select2 = $(this.select.nativeElement).select2({}).on(
  //     'select2:select', e => { this.currentInput = e.target.value; });
  // }

  public checkIp(ipForCheck: string) {
    let isValid =
      ipForCheck != '0.0.0.0' &&
      ipForCheck != '255.255.255.255' &&
      ipForCheck.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/);

    if (!isValid) {
      this.notification.error("Invalid IP");
      return false;
    }
    return true;
  }
}
