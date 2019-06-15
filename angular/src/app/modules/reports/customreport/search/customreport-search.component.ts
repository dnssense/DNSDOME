import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Category } from 'src/app/core/models/Category';
import { ConfigItem } from 'src/app/core/models/ConfigItem';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { WApplication } from 'src/app/core/models/WApplication';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ColumnTagInputComponent } from '../../shared/columntaginput/column-tag-input.component';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { SearchSettingService } from 'src/app/core/services/SearchSettingService';
import { LocationsService } from 'src/app/core/services/LocationService';
import { ArrayUtils } from 'src/app/ArrayUtils';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { AlertService } from 'src/app/core/services/alert.service';
import * as countryList from 'src/app/core/models/Countries';
import { DatePipe } from '@angular/common';

declare var $: any;
//declare var Flatpickr: any;
declare var moment: any;
//declare var Waypoint: any;
//declare var WebuiPopovers: any;

@Component({
  selector: 'app-customreport-search',
  templateUrl: 'customreport-search.component.html',
  styleUrls: ['customreport-search.component.css']
})
export class CustomReportSearchComponent implements OnInit, OnDestroy {

  public expanded = true;
  public start_date_pickr = null;
  public end_date_pickr = null;
  public popover: any;
  public dateShown: boolean = false;
  // public columnsPopover: any;
  public configItem: ConfigItem;
  startDateee: Date = null;
  endDateee: Date = null;
  public mainApplications: WApplication[];
  public applicationsMap = new Map<number, WApplication[]>();
  public mainCategories: Category[];
  public categoriesMap = new Map<number, Category[]>();
  public agents: Location[];

  @ViewChild('settingNameConfirmationModal') settingNameConfirmationModal: ElementRef;
  @ViewChild('popoverbtn') popoverbtn: ElementRef;
  @ViewChild('dateSelect') dateSelect: ElementRef;
  @ViewChild('startDateCal') startDateCal: ElementRef;
  @ViewChild('endDateCal') endDateCal: ElementRef;
  @ViewChild('customdaterange') customdaterange: ElementRef;
  @ViewChild('columnsOverlay') columnsOverlay: ElementRef;
  @ViewChild('customSearchSetting') customSearchSetting: ElementRef;
  @ViewChild('dateOverlay') dateOverlay: any;
  @ViewChildren(ColumnTagInputComponent)
  public columnTagInputComponents: QueryList<ColumnTagInputComponent>;
  // @ViewChild(SavedReportSelectComponent)
  // public savedReportsSelectComponent: SavedReportSelectComponent;

  @Input() searchSetting: SearchSetting;
  @Input() set columns(value: LogColumn[]) {
    if (value && value.length > 0) {
      value.forEach(c => { if (c.name == 'domain') { c.checked = true; } else { c.checked = false } });
      this._columns = value;

      this.search();
    }

  }
  @Input() public columnsTemp: LogColumn[];
  @Output() public searchEmitter = new EventEmitter();
  @Output() public searchSettingEmitter = new EventEmitter();

  public observable: Observable<any> = null;
  public subscription: Subscription = null;
  private ngUnsubscribe: Subject<any> = new Subject<any>();
  private applicationsSubscription: Subscription;
  private categoriesSubscription: Subscription;

  _columns: LogColumn[];
  columnListLength: number = 10;
  currentColumn: string = 'domain';
  currentInput: any;
  countries: any = [];
  current: ColumnTagInput;
  currentOperator: string = 'is';
  currentinputValue: string;
  select2: any = null;
  inputCollapsed: boolean = true;
  inputSelected: boolean = false;
  @ViewChild('inputElement') inputElement: ElementRef;
  @ViewChild('mainInputElement') mainInputElement: ElementRef;
  @ViewChild('tagInput') tagInput: ElementRef;
  @ViewChild('select') select: ElementRef;
  public selectedColumns: LogColumn[];
  editedTag: any;
  editedTagType: string;
  searchStartDate: string;
  searchStartDateTime: string='08:00';
  searchEndDate: string;
  searchEndDateTime: string='18:00';
  selectedTab: string = 'home';

  constructor(public customReportService: CustomReportService, public fastReportService: FastReportService,
    public searchSettingService: SearchSettingService, public locationsService: LocationsService,
    private notification: NotificationService, private alertService: AlertService , private datePipe:DatePipe) {

    this.selectedColumns = [];
    if (!this.searchSetting) {
      this.searchSetting = new SearchSetting();
      this.current = new ColumnTagInput('domain', '=', '');
      this.currentOperator = 'is';
      this.currentColumn = 'domain';
    }

  }

  ngOnInit() {
    this.countries = countryList.countries;
    this.applicationsSubscription = this.customReportService.applications.subscribe((res: WApplication[]) => {
      let allApplications = res;
      if (res != null) {
        let tempcategoris = [];
        for (let cat of allApplications) {
          tempcategoris.push(cat);
        }
        this.mainApplications = tempcategoris;
      }
    });

    this.categoriesSubscription = this.customReportService.categories.subscribe((res: Category[]) => {
      let allCategories = res;
      if (res != null) {
        let tempcategoris = [];
        for (let cat of allCategories) {
          tempcategoris.push(cat);
        }
        this.mainCategories = tempcategoris;
        this.mainCategories.sort(ArrayUtils.categoryCompare);
      }
    });

    // this.locationsService.getAgents().subscribe((res: Location[]) => {
    //   this.agents = res;
    // });
    this.locationsService.getLocations().subscribe((res: Location[]) => {
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

  public search() {

    this.searchSetting.columns.columns = []
    this._columns.filter(c => c.checked == true).forEach(c => {
      this.searchSetting.columns.columns.push({ column: c, label: c.beautyName });
    })
    this.searchEmitter.emit(this.searchSetting);
  }

  public setSearchSetting(searchSetting: SearchSetting) {
    this.searchSetting = searchSetting;
  }

  public checkUncheckColumn(col: LogColumn) {

    if (this._columns.find(c => c.name == col.name).checked == false && this._columns.filter(c => c.checked == true).length >= 5) {
      this.notification.warning('You can selecy 5 columns!');
      return;
    }
    for (let a of this._columns) {
      if (a.name == col.name) {
        col.checked = !a.checked;
        a.checked = col.checked;
        break;
      }
    }

    this.addColumnToSelectedColumns(col)
    // this.inputChecked(col);
  }

  changeColumnListLength() {
    if (this.columnListLength == 10) {
      this.columnListLength = this._columns.length;
    } else {
      this.columnListLength = 10;
    }
  }

  // public inputChecked(column: LogColumn) {
  //   if (column.checked) {
  //     this.selectedColumns.push(column);
  //   } else {
  //     for (let a of this.selectedColumns) {
  //       if (a.name == column.name) {
  //         let cindex = this.selectedColumns.indexOf(a);
  //         this.selectedColumns.splice(cindex, 1);
  //         break;
  //       }
  //     }
  //   }
  // }

  // public showDatePanel($event) {
  //   let value = $event.target.value;

  //   if (value == -1 || value.indexOf("-") > -1) {
  //     if (this.searchSetting.dateInterval.indexOf("-") > 0) {
  //       let dd = this.searchSetting.dateInterval.split('-');
  //       this.startDateee = moment(dd[0], "DD.MM.YYYY HH:mm:ss").toDate();
  //       this.endDateee = moment(dd[1], "DD.MM.YYYY HH:mm:ss").toDate();
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
  //       dateFormat: "d.m.Y H:i:S",
  //       time_24hr: true,
  //       utc: false,
  //       onValueUpdate: (e, args) => {
  //         this.startDateee = args;
  //         //   this.start_date_pickr.toggle();
  //         //     this.end_date_pickr.toggle();
  //       }
  //     });
  //     //alert(start_date_pickr.selectedDateObj);
  //     this.end_date_pickr = new Flatpickr(this.endDateCal.nativeElement, {
  //       animate: false,
  //       allowInput: false,
  //       enableTime: true,
  //       defaultDate: this.endDateee,
  //       maxDate: new Date(),
  //       dateFormat: "d.m.Y H:i:S",
  //       time_24hr: true,
  //       utc: false,
  //       onValueUpdate: (e, args) => {
  //         this.endDateee = args;
  //         // this.end_date_pickr.toggle();
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
  //   let startDate = this.startDateee == null ? "" : moment(this.startDateee, 'DD.MM.YYYY HH:mm:ss', true).format("DD.MM.YYYY HH:mm:ss");
  //   let endDate = this.endDateee == null ? "" : moment(this.endDateee, 'DD.MM.YYYY HH:mm:ss', true).format("DD.MM.YYYY HH:mm:ss");
  //   let vall = startDate + " - " + endDate;
  //   this.start_date_pickr.destroy();
  //   this.end_date_pickr.destroy();

  //   if (vall != ' - ') {
  //     this.searchSetting.dateInterval = vall;
  //     option.text = vall;
  //     option.value = vall;
  //   } else {
  //     option.innerHTML = "Custom Range";
  //     option.value = "-1";
  //   }

  //   this.dateOverlay.hide();
  // }

  closeCalendarTab(tabId: string) {
    this.selectedTab = tabId;
    if (tabId == 'profile') {
      $('#home').removeClass('active show');

      $('.flatpickr-time ').css({ 'width':'100px', 'background-color': '#eee', 'border-radius': '5px', 'box-shadow': 'none' });
      $('.flatpickr-calendar').css('box-shadow', 'none');
      $('.flatpickr-days').css('color', '#7c86a2');
      $('.flatpickr-day').css('color', '#7c86a2');
      $('.inRange').css('background', 'transparent');
      $('.flatpickr-months').css('display', 'none');
      $('.flatpickr-disabled').css({'cursor': 'not-allowed', 'color':'rgba(124,134,162,0.3)'}); 
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
    const last10Days= this.datePipe.transform(new Date().setDate(today.getDate() - 10), 'yyyy-MM-dd')

    $(datepickerId).flatpickr({ mode: 'range', inline: true, enableTime:false, maxDate:"today", minDate:last10Days });

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
      $('.flatpickr-disabled').css({'cursor': 'not-allowed', 'color':'rgba(124,134,162,0.3)'}); 
    });
    $(dropdownId + ' .inRange').click(function (e) {
      $('.flatpickr-day').css('color', '#7c86a2');
    });
  }

  searchDateChanged() {
    $('.flatpickr-day').css('color', '#7c86a2');
    $('.inRange').css({ 'background': 'transparent', 'box-shadow': 'none' });
    $('.startRange').css({ 'border-radius': '50%', 'background': '#6c84fa', 'color': '#eee' });
    $('.endRange').css({ 'border-radius': '50%', 'background': '#6c84fa', 'color': '#eee', 'box-shadow':'none' });
    $('.flatpickr-disabled').css({'cursor': 'not-allowed', 'color':'rgba(124,134,162,0.3)'}); 
  }

  public addColumnToSelectedColumns(col: LogColumn) {

    // this.notificationService.clearToasties();

    let selectedColumns = this.searchSetting.columns.columns;
    let cindex = -1;
    for (let ci = 0; ci < selectedColumns.length; ci++) {
      if (selectedColumns[ci].label == col.beautyName) {
        cindex = ci;
        break;
      }
    }
    if (cindex > -1) {
      return; //todo growl da message goster . aynı kolon var diye..
    }
    let item = new AggregationItem(col, col.beautyName);
    this.searchSetting.columns.columns.push(item);
  }

  public removeColumn(col: AggregationItem) {
    let selectedColumns = this.searchSetting.columns.columns;
    for (let c of selectedColumns) {
      if (c.column.name == col.column.name) {
        let cindex = selectedColumns.indexOf(c);
        selectedColumns.splice(cindex, 1);
        break;
      }
    }
  }

  public inputClicked($event) {
    $event.stopPropagation();
  }

  changeCurrentColumn(colName: string) {
    $('#tagsDd').click(function (e) {
      e.stopPropagation();
    });
    this.currentColumn = colName;
  }

  public addTag($event) {
    if (this.editedTag) {
      this.removeTag(this.editedTag, this.editedTagType);
      this.editedTag = null;
      this.editedTagType = null;
    }
    this.current.value = this.currentInput;
    this.current.operator = '=' // default and only value is equal
    this.current.field = this.currentColumn;

    if (
      this.currentColumn == 'sourceIp' ||
      this.currentColumn == 'destinationIp'
    ) {
      if (!this.checkIp()) {
        return;
      }
    }
    $event.stopPropagation();
    if (this.currentInput == '') {
      //this.tagInput.nativeElement.focus();
      return;
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
        this.searchSetting.mustnot.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
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
        this.searchSetting.should.push(new ColumnTagInput(this.currentColumn, '=', this.currentInput));
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

  }

  editTag(tag: any, type: string) {
    this.editedTag = tag;
    this.editedTagType = type;
    this.currentInput = tag.value;
    this.currentColumn = tag.field;

    $('#tagsDd').addClass('show');
  }

  refreshFilterPanel() {
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

  cancelFilterPopup() {
    $('#tagsDd').removeClass('show');
  }

  closeSearchBoxDropdownDate(){
    $('#searchBoxDropdownDate .dropdown-menu').removeClass('show');

    let searchDateInput: string = $("#searchDateInput").val();
    if (searchDateInput.length > 1) {

      let dd = searchDateInput.split(' to ');
 
      if (searchDateInput.includes('to')) {
        
        this.startDateee = moment(dd[0] +' ' + this.searchStartDateTime, 'YYYY-MM-DD HH:mm').toDate();
        this.endDateee = moment(dd[1] + ' ' + this.searchEndDateTime, 'YYYY-MM-DD HH:mm').toDate();
        this.searchStartDate = dd[0]+' ' + this.searchStartDateTime;
        this.searchEndDate = dd[1]+' ' + this.searchEndDateTime;
      } else {
        this.startDateee = moment(dd[0]+' ' + this.searchStartDateTime, 'YYYY-MM-DD HH:mm').toDate();
        this.endDateee = moment(dd[0]+' ' + this.searchEndDateTime, 'YYYY-MM-DD HH:mm').toDate();
        this.searchStartDate = dd[0]+' ' + this.searchStartDateTime;
        this.searchEndDate = dd[0]+' ' + this.searchEndDateTime;
      }

      let startDate = this.startDateee == null ? '' : moment(this.startDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
      let endDate = this.endDateee == null ? '' : moment(this.endDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');

      const dateVal = startDate + ' - ' + endDate;
      this.searchSetting.dateInterval = dateVal;
    }
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
      this.initSelect();
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

  public removeTag(tag: any, type: string) {

    if (type == 'is') {
      this.searchSetting.must.splice(this.searchSetting.must.findIndex(a => a.field == tag.field && a.value == tag.value), 1);
    } else if (type == 'isnot' || type == 'isnotoneof') {
      this.searchSetting.mustnot.splice(this.searchSetting.mustnot.findIndex(a => a.field == tag.field && a.value == tag.value), 1);
    } else if (type == 'isoneof') {
      this.searchSetting.should.splice(this.searchSetting.should.findIndex(a => a.field == tag.field && a.value == tag.value), 1);
    }
    this.currentinputValue = '';
  }

  public removeAllTags() {
    if (this.searchSetting.must.length > 0 || this.searchSetting.mustnot.length > 0 || this.searchSetting.should.length > 0) {
      this.alertService.alertWarningAndCancel('Are You Sure?', 'Your search parameters will be removed!').subscribe(
        res => {
          if (res) {
            this.searchSetting.must = [];
            this.searchSetting.mustnot = [];
            this.searchSetting.should = [];
            this.currentinputValue = '';
          }
        }
      );
    }
  }

  public initSelect() {
    if (this.select2 != null) {
      this.select2.select2('destroy');
    }
    this.select2 = $(this.select.nativeElement).select2({}).on(
      'select2:select', e => { this.currentInput = e.target.value; });
  }

  public checkIp() {
    let isValid =
      this.currentInput != '0.0.0.0' &&
      this.currentInput != '255.255.255.255' &&
      this.currentInput.match(
        /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/
      );
    if (!isValid) {
      this.notification.error("Invalid IP");
      return false;
    }
    return true;
  }
}
