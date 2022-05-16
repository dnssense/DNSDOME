import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {GroupItemDom} from './group-item.component';
import {TranslateService} from '@ngx-translate/core';
import {Aggregation, GraphDto} from '../../../../core/models/report';
import {CategoryDom} from '../../../../core/models/Dashboard';
import * as numeral from 'numeral';
import {ChartDomain, ChartDomainItem, DashboardChartComponent} from './dashboard-chart.component';
import * as moment from 'moment';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard-category',
  templateUrl: 'category.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class CategoryComponent {
  constructor(private translateService: TranslateService, private router: Router) {
  }

  private _selectedDate: { startDate: Date, endDate: Date, duration: number };
  @Output() public onCategoryChanged = new EventEmitter<CategoryDom>();

  @Input() set selectedDate(val: { startDate: Date, endDate: Date, duration: number }) {
    this._selectedDate = val;
    this.onChangeSelectedDate();
  }

  get selectedDate(): { startDate: Date, endDate: Date, duration: number } {
    return this._selectedDate;
  }

  @Output() public selectedDateChange = new EventEmitter<{ startDate: Date, endDate: Date, duration: number, name: string }>();
  @ViewChild('chartComponent') chartComponent: DashboardChartComponent;
  currentGroup: GroupItemDom = {
    active: true,
    datatype: 'total',
    name: 'Total',
    color: '#4353ff',
    className: 'blue',
    val1: 0,
    val2: 0,
    description: 'DASHBOARD.TotalDnsRequestCount',
    uitype: 1
  };
  theme: any = 'light';
  categories: CategoryDom[];
  selectedCategory: CategoryDom;
  reportType: 'livereport' | 'nolivereport';
  prevNextInterval: { prevNme: string, nextName: string, interval: number };
  showDetailButton = true;

  // region direct ui methodes
  getGroupName(): string {
    if (this.currentGroup) {
      const catName = this.translate(this.currentGroup.name);
      if (this.currentGroup.datatype !== 'total') {
        return catName + ' Categories';
      }
      return catName;
    }
    return 'Total';
  }

  private onClickCategory(cat: CategoryDom) {
    this.selectedCategory = cat;
    this.onCategoryChanged.emit(cat);
  }

  // endregion

  // region inderect ui methode
  setTheme(theme) {
    this.theme = theme
    // this.chartComponent.setIcontainerId('container_river')
    this.chartComponent.setTheme(theme);
  }

  setGroup(group: GroupItemDom) {
    if (group) {
      this.currentGroup = group;
    }
    this.selectedCategory = null;
  }

  onChangeSelectedDate() {
    this.fillprevNextInf();
    this.calculateShowDetailButton();
  }

  getDataByTime(type: 'prev' | 'next') {
    if (type === 'prev') {
      this.selectedDate.startDate.setDate(this.selectedDate.startDate.getDate() - this.prevNextInterval.interval);
      this.selectedDate.endDate.setDate(this.selectedDate.endDate.getDate() - this.prevNextInterval.interval);
    } else {
      this.selectedDate.startDate.setDate(this.selectedDate.startDate.getDate() + this.prevNextInterval.interval);
      this.selectedDate.endDate.setDate(this.selectedDate.endDate.getDate() + this.prevNextInterval.interval);
    }
    this.selectedDateChange.emit({
      startDate: this.selectedDate.startDate,
      endDate: this.selectedDate.endDate,
      duration: 0,
      name: 'fromcomponent'
    });
  }

  isDisabledNextButton(): boolean {
    if (this.prevNextInterval && this.prevNextInterval.interval >= 365) {
      return true;
    }
    if (this.selectedDate.startDate && this.prevNextInterval) {
      const startDate = new Date(JSON.parse(JSON.stringify(this.selectedDate.startDate)));
      startDate.setDate(this.prevNextInterval.interval);
      return startDate > new Date();
    }
    return false;
  }

  showDetail() {
    if (this.selectedDate) {
      const url = (`/admin/reports/monitor?category=${this.selectedCategory?.name || this.currentGroup?.datatype}&startDate=${moment(this.selectedDate.startDate).toISOString()}&endDate=${moment(this.selectedDate.endDate).toISOString()}`);
      this.router.navigateByUrl(url);
    }
  }

  setCategories(cats: { items: Aggregation[] }, graphs: { items: GraphDto[] }, total: { allow: number, block: number }, isAllowChangeTableContent: boolean = true) {
    const totalHit = total.allow + total.block;
    if (isAllowChangeTableContent || this.categories.length <= 0) {
      this.categories = cats.items.map(cat => {
        return {name: cat.name, hit: cat.hit, hit_ratio: Math.floor((100 * cat.hit) / totalHit)};
      });
    }
    this.drawChart(graphs);
  }

  private drawChart(graphs: { items: GraphDto[] }) {
    const chartDomain: ChartDomain = {chartType: 'line-river', items: []};
    chartDomain.items = graphs.items.map(graph => {
      if (graph.max === undefined) {
        graph.max = 0;
      }
      if (graph.min === undefined) {
        graph.min = 0;
      }
      const item: ChartDomainItem = {date: graph.datestr, hit: graph.hit, max: graph.max, min: graph.min};
      return item;
    });
    this.chartComponent.drawChart(chartDomain);
  }

  // endregion

  // region utils methode
  calculateShowDetailButton() {
    if (this.selectedDate) {
      const startDate = moment(this.selectedDate.startDate).toDate().getTime();
      const endDate = moment(this.selectedDate.endDate).toDate().getTime();

      const lastWeek = moment().add(-7, 'days').startOf('day').toDate().getTime();
      const today = moment().toDate().getTime();
      this.showDetailButton = (lastWeek <= startDate && endDate <= today);
    } else {
      this.showDetailButton = false;
    }
  }

  fillprevNextInf() {
    const diff = this.calculateDateDiff();
    if (diff && diff >= 6) {
      if (diff <= 7) {
        this.prevNextInterval = {prevNme: 'PreviousWeek', nextName: 'NextWeek', interval: 7};
      } else if (diff >= 30 && diff < 90) {
        this.prevNextInterval = {prevNme: 'PreviousMonth', nextName: 'NextMonth', interval: 30};
      } else if (diff >= 90 && diff < 365) {
        this.prevNextInterval = {prevNme: 'Previous3Month', nextName: 'Next3Month', interval: 90};
      } else {
        this.prevNextInterval = null;
      }
    } else {
      this.prevNextInterval = null;
    }
  }

  translate(data: string): string {
    return this.translateService.instant(data);
  }

  getRoundedNumber(value: number) {
    return numeral(value).format('0.0a').replace('.0', '');
  }

  calculateDateDiff(): number | undefined {
    if (this.selectedDate) {
      const startDate = moment([this.selectedDate.startDate.getFullYear(), this.selectedDate.startDate.getMonth(), this.selectedDate.startDate.getDate()]);
      const endDate = moment([this.selectedDate.endDate.getFullYear(), this.selectedDate.endDate.getMonth(), this.selectedDate.endDate.getDate()]);
      return endDate.diff(startDate, 'days');
    }
    return undefined;
  }

  // endregion
}
