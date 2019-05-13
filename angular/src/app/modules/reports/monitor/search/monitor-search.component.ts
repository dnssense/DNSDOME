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

declare var jQuery: any;
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
  public applicationsMap = new Map<number, WApplication[]>();
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

  constructor(
    private fastReportService: FastReportService,
    private locationsService: LocationsService,
    private customReportService: CustomReportService
  ) { }

  ngOnInit() {
    this.tableColumnsubscription = this.fastReportService.tableColumns
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: LogColumn[]) => {
        this.columns = res;
      });
    this.applicationsSubscription = this.customReportService.applications
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: WApplication[]) => {
        let allApplications = res;
        if (res != null) {
          // Get the main categories...
          let tempcategoris = [];
          for (let cat of allApplications) {
            if (cat.parent == null) {
              tempcategoris.push(cat);
            } else {
              let arr = this.applicationsMap.get(cat.parent.id);
              if (arr == null || !arr) {
                arr = [];
              }
              arr.push(cat);
              this.applicationsMap.set(cat.parent.id, arr);
            }
          }
          this.mainApplications = tempcategoris;
        }
      });
    this.categoriesSubscription = this.customReportService.categories
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: Category[]) => {
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
    // jQuery(
    //   new Waypoint.Sticky({
    //     element: this.fastSearchSetting.nativeElement,
    //     handler: direction => {
    //       if (direction === 'up') {
    //         this.expanded = true;
    //       } else {
    //         this.expanded = false;
    //       }
    //     }
    //   })
    // );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public setSearchSetting(searchSetting: SearchSetting) {
    this.searchSetting = searchSetting;
  }

  public search() {
    // todo validation...
    WebuiPopovers.hideAll();
    this.searchEmitter.emit(this.searchSetting);
  }

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
        animate:false,
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
        animate:false,
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
}
