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


declare var jQuery: any;
declare var Flatpickr: any;
declare var moment: any;
declare var Waypoint: any;
declare var WebuiPopovers: any;

@Component({
  selector: 'app-customreport-search',
  templateUrl: 'customreport-search.component.html',
  styleUrls: ['customreport-search.component.sass']
})
export class CustomReportSearchComponent implements OnInit, OnDestroy {

  public expanded = true;
  public start_date_pickr = null;
  public end_date_pickr = null;
  public popover: any;
  public dateShown: boolean = false;
  public columnsPopover: any;
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
  @Input() public columns: LogColumn[];
  @Input() public columnsTemp: LogColumn[];
  @Output() public searchEmitter = new EventEmitter();
  @Output() public searchSettingEmitter = new EventEmitter();

  public observable: Observable<any> = null;
  public subscription: Subscription = null;
  private ngUnsubscribe: Subject<any> = new Subject<any>();
  private applicationsSubscription: Subscription;
  private categoriesSubscription: Subscription;

  constructor(
    public customReportService: CustomReportService,
    public fastReportService: FastReportService,
    public searchSettingService: SearchSettingService,
    public locationsService: LocationsService,
    private notificationService: NotificationService) {

    this.fastReportService.tableColumns
      .subscribe((res: LogColumn[]) => {
        this.columns = res;
      });
  }

  ngOnInit() {
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
    this.columnsPopover = jQuery(this.columnsOverlay.nativeElement).webuiPopover({
      padding: true,
      animation: 'pop',
      closeable: false,
      placement: 'bottom-right',
      dismissible: true,
    });

    // jQuery(new Waypoint.Sticky({
    //   element: this.customSearchSetting.nativeElement,
    //   handler: (direction) => {
    //     if (direction == 'up') {
    //       this.expanded = true;
    //     } else {
    //       this.expanded = false;
    //     }
    //   }
    // }));
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public search() {
    WebuiPopovers.hideAll();
    // if (this.searchSetting.columns.columns.length > 0) {
    //   this.notificationService.clearToasties();
    // }
    this.searchEmitter.emit(this.searchSetting);
  }

  public setSearchSetting(searchSetting: SearchSetting) {
    this.searchSetting = searchSetting;
  }

  public showDatePanel($event) {
    let value = $event.target.value;

    if (value == -1 || value.indexOf("-") > -1) {
      if (this.searchSetting.dateInterval.indexOf("-") > 0) {
        let dd = this.searchSetting.dateInterval.split('-');
        this.startDateee = moment(dd[0], "DD.MM.YYYY HH:mm:ss").toDate();
        this.endDateee = moment(dd[1], "DD.MM.YYYY HH:mm:ss").toDate();
      } else {
        let startDate = moment();
        startDate.add(-1, 'day');
        this.startDateee = startDate.toDate();
        this.endDateee = moment().toDate();
      }

      this.start_date_pickr = new Flatpickr(this.startDateCal.nativeElement, {
        allowInput: false,
        enableTime: true,
        defaultDate: this.startDateee,
        maxDate: new Date(),
        dateFormat: "d.m.Y H:i:S",
        time_24hr: true,
        utc: false,
        onValueUpdate: (e, args) => {
          this.startDateee = args;
          //   this.start_date_pickr.toggle();
          //     this.end_date_pickr.toggle();
        }
      });
      //alert(start_date_pickr.selectedDateObj);
      this.end_date_pickr = new Flatpickr(this.endDateCal.nativeElement, {
        allowInput: false,
        enableTime: true,
        defaultDate: this.endDateee,
        maxDate: new Date(),
        dateFormat: "d.m.Y H:i:S",
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
    let startDate = this.startDateee == null ? "" : moment(this.startDateee, 'DD.MM.YYYY HH:mm:ss', true).format("DD.MM.YYYY HH:mm:ss");
    let endDate = this.endDateee == null ? "" : moment(this.endDateee, 'DD.MM.YYYY HH:mm:ss', true).format("DD.MM.YYYY HH:mm:ss");
    let vall = startDate + " - " + endDate;
    this.start_date_pickr.destroy();
    this.end_date_pickr.destroy();

    if (vall != ' - ') {
      this.searchSetting.dateInterval = vall;
      option.text = vall;
      option.value = vall;
    } else {
      option.innerHTML = "Custom Range";
      option.value = "-1";
    }

    this.dateOverlay.hide();
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
}
