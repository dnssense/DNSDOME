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
  styleUrls: ['monitor-search.component.sass']
})
export class MonitorSearchComponent
  implements OnInit, AfterViewInit, OnDestroy {
  public columns: LogColumn[];
  public agents: Location[];
  public mainCategories: Category[];
  public mainApplications: WApplication[];
  public categoriesMap = new Map<number, Category[]>();
  public applicationsMap = new Map<number, WApplication[]>();
  public expanded = true;

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
  ) {}

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
            if (cat.parent == null) {
              tempcategoris.push(cat);
            } else {
              let arr = this.categoriesMap.get(cat.parent.id);
              if (arr == null || !arr) {
                arr = [];
              }
              arr.push(cat);
              this.categoriesMap.set(cat.parent.id, arr);
            }
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
    // this.locationsService
    //   .getAgents()
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe((res: Location[]) => {
    //     this.agents = res;
    //   });
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
}
