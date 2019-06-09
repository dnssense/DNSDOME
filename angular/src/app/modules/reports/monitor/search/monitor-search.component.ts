import {
  OnInit,
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { Category } from 'src/app/core/models/Category';
import { WApplication } from 'src/app/core/models/WApplication';
import { Subject, Subscription } from 'rxjs';
import { ArrayUtils } from 'src/app/ArrayUtils';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { LocationsService } from 'src/app/core/services/LocationService';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import * as countryList from 'src/app/core/models/Countries';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AlertService } from 'src/app/core/services/alert.service';

declare var jQuery: any;
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
export class MonitorSearchComponent
  implements OnInit, AfterViewInit, OnDestroy {
  public columns: LogColumn[];
  public agents: Location[];
  public mainCategories: Category[];
  public mainApplications: WApplication[];
  //public categoriesMap = new Map<number, Category[]>();
  //public applicationsMap = new Map<number, WApplication[]>();
  public expanded = true;
  public startDateee: Date = null;
  public endDateee: Date = null;
  public start_date_pickr = null;
  public end_date_pickr = null;

  private tableColumnsubscription: Subscription;
  private configItemsSubscription: Subscription;
  private applicationsSubscription: Subscription;
  private categoriesSubscription: Subscription;
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  @Input() searchSetting: SearchSetting;
  @Output() public searchEmitter = new EventEmitter();
  @Output() public searchSettingEmitter = new EventEmitter();

  @ViewChild('settingNameConfirmationModal') settingNameConfirmationModal: any;
  @ViewChild('popoverbtn') popoverbtn: ElementRef;
  @ViewChild('dateSelect') dateSelect: ElementRef;
  @ViewChild('startDateCal') startDateCal: ElementRef;
  @ViewChild('endDateCal') endDateCal: ElementRef;
  @ViewChild('customdaterange') customdaterange: ElementRef;
  @ViewChild('btn') btn: ElementRef;
  @ViewChild('fastSearchSetting') fastSearchSetting: ElementRef;
  @ViewChild('dateOverlay') dateOverlay: any;


  //Yeni tasarim sonrasi
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

  constructor(private fastReportService: FastReportService, private locationsService: LocationsService,
    private customReportService: CustomReportService, private notification: NotificationService, private alertService: AlertService) {

    if (!this.searchSetting) {
      this.searchSetting = new SearchSetting();
      this.current = new ColumnTagInput('domain', '=', '');
      this.currentOperator = 'is';
      this.currentColumn = 'domain';
    }

    this.setDropdown();
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
    jQuery('#tagsDd').click(function (e) {
      e.stopPropagation();
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public setSearchSetting(searchSetting: SearchSetting) {
    this.searchSetting = searchSetting;
  }

  public search() {
    this.searchEmitter.emit(this.searchSetting);
  }

  //date panel icin kullanilacak
  public showDatePanel($event) {
    this.dateOverlay.hide();

    let value = $event.target.value;

    if (value === -1 || value.indexOf('-') > -1) {
      if (this.searchSetting.dateInterval.indexOf('-') > 0) {
        let dd = this.searchSetting.dateInterval.split('-');
        this.startDateee = moment(dd[0], 'DD.MM.YYYY HH:mm:ss').toDate();
        this.endDateee = moment(dd[1], 'DD.MM.YYYY HH:mm:ss').toDate();
      } else {
        let startDate = moment();
        startDate.add(-1, 'day');
        this.startDateee = startDate.toDate();
        this.endDateee = moment().toDate();
      }

      this.start_date_pickr = new Flatpickr(this.startDateCal.nativeElement, {
        animate: false,
        allowInput: false,
        enableTime: true,
        defaultDate: this.startDateee,
        maxDate: new Date(),
        dateFormat: 'd.m.Y H:i:S',
        time_24hr: true,
        utc: false,
        onValueUpdate: (e, args) => {
          this.startDateee = args;
          //   this.start_date_pickr.toggle();
          //  this.end_date_pickr.toggle();
        }
      });
      // alert(start_date_pickr.selectedDateObj);
      this.end_date_pickr = new Flatpickr(this.endDateCal.nativeElement, {
        animate: false,
        allowInput: false,
        enableTime: true,
        defaultDate: this.endDateee,
        maxDate: new Date(),
        dateFormat: 'd.m.Y H:i:S',
        time_24hr: true,
        utc: false,
        onValueUpdate: (e, args) => {
          this.endDateee = args;
          // this.end_date_pickr.toggle();
        }
      });
      this.dateOverlay.show($event);
    } else {

      jQuery(this.dateSelect.nativeElement).val(value);
      this.searchSetting.dateInterval = value;
      this.dateOverlay.hide();
    }
  }

  public hideDatePopover() {
    var option = this.customdaterange.nativeElement;
    let startDate = this.startDateee == null ? '' : moment(this.startDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
    let endDate = this.endDateee == null ? '' : moment(this.endDateee, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
    let vall = startDate + ' - ' + endDate;
    this.start_date_pickr.destroy();
    this.end_date_pickr.destroy();

    if (vall !== ' - ') {
      this.searchSetting.dateInterval = vall;
      option.text = vall;
      option.value = vall;
    } else {
      option.innerHTML = 'Custom Range';
      option.value = '-1';
    }
    this.dateOverlay.hide();
  }

  setDropdown() {
    let dropdownId='#dropdownDate23'
    let datepickerId = '.datepicker2'
    $(dropdownId + ' .dropdown-menu .nav-tabs li').click(function (e) {
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });

    $(datepickerId).flatpickr({
      mode: 'range',
      inline: true
    });

    $(dropdownId + ' .flatpickr-prev-month').click(function (e) {
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });

    $(dropdownId + ' .flatpickr-next-month').click(function (e) {
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });
  }


  public inputClicked($event) {
    $event.stopPropagation();
  }

  changeCurrentColumn(colName: string) {
    jQuery('#tagsDd').click(function (e) {
      e.stopPropagation();
    });
    this.currentColumn = colName;
  }

  public addTag($event) {
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

    jQuery('#tagsDd').removeClass('show');

    this.current = new ColumnTagInput('domain', '=', '');
    this.currentColumn = this.current.field;
    this.currentOperator = 'is';
    this.currentInput = this.current.value;
    this.currentinputValue = '';
    this.inputCollapsed = true;
    this.inputSelected = false;

  }

  cancelFilterPopup() {
    jQuery('#tagsDd').removeClass('show');
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

    if (type == 'must') {
      this.searchSetting.must.splice(this.searchSetting.must.findIndex(a => a.field == tag.field && a.value == tag.value), 1);
    } else if (type == 'mustnot') {
      this.searchSetting.mustnot.splice(this.searchSetting.mustnot.findIndex(a => a.field == tag.field && a.value == tag.value), 1);
    } else if (type == 'should') {
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

  public positionInputElement(sourcePosition) {
    setTimeout(() => {
      let position = jQuery(sourcePosition).position();
      jQuery(this.inputElement.nativeElement).css({
        top: position.top + 21,
        left: position.left - 1,
        position: 'absolute'
      });
    }, 50);
  }

  public initSelect() {
    if (this.select2 != null) {
      this.select2.select2('destroy');
    }
    this.select2 = jQuery(this.select.nativeElement).select2({}).on(
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
