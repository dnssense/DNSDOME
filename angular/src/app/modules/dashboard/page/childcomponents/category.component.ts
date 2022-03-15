import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {GroupItemDom} from "./group-item.component";
import {TranslateService} from "@ngx-translate/core";
import {Aggregation, GraphDto} from "../../../../core/models/report";
import {CategoryDom} from "../../../../core/models/Dashboard";
import * as numeral from 'numeral';
import {ChartDomain, ChartDomainItem, DashboardChartComponent} from "./dashboard-chart.component";
import {networkInterfaces} from "os";

@Component({
  selector: 'app-dashboard-category',
  templateUrl: 'category.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class CategoryComponent {
  constructor(private translateService: TranslateService) {
  }
  private _selectedDate: { startDate: Date, endDate: Date, duration: number }
  @Output() public onCategoryChanged = new EventEmitter<CategoryDom>()
  @Input() set selectedDate (val: { startDate: Date, endDate: Date, duration: number }) {
    this._selectedDate = val
    this.onChangeSelectedDate()
  }
  get selectedDate():{ startDate: Date, endDate: Date, duration: number } {
    return this._selectedDate
  }
  @Output() selectedDateChange: EventEmitter<{ startDate: Date, endDate: Date, duration: number }> = new EventEmitter<{ startDate: Date; endDate: Date; duration: number }>()
  @ViewChild('chartComponent') chartComponent: DashboardChartComponent
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
  }
  theme: any = 'light';
  categories: CategoryDom[]
  selectedCategory: CategoryDom
  reportType: 'livereport' | 'nolivereport'
  prevNextInterval: {prevNme: string, nextName: string, interal: number}

  //region direct ui methodes
  getGroupName(): string {
    if (this.currentGroup) {
      let catName = this.translate(this.currentGroup.name)
      if (this.currentGroup.datatype != 'total') {
        return catName + ' Categories'
      }
      return catName
    }
    return "Total"
  }

  private onClickCategory(cat: CategoryDom) {
    this.selectedCategory = cat
    this.onCategoryChanged.emit(cat)
  }

  //endregion

  //region inderect ui methode
  setTheme(theme) {
    this.theme = theme
    //this.chartComponent.setIcontainerId('container_river')
    this.chartComponent.setTheme(theme)
  }

  setGroup(group: GroupItemDom) {
    if (group) {
      this.currentGroup = group
    }
    this.selectedCategory = null
  }

  onChangeSelectedDate() {

  }

  getDataByTime(type: 'prev' | 'next') {

  }

  isDisabledNextButton() {

  }

  setCategories(cats: { items: Aggregation[] }, graphs: { items: GraphDto[] }, total: { allow: number, block: number }, isAllowChangeTableContent: boolean = true) {
    let totalHit = total.allow + total.block
    if (isAllowChangeTableContent || this.categories.length <= 0) {
      this.categories = cats.items.map(cat => {
        return {name: cat.name, hit: cat.hit, hit_ratio: Math.floor((100 * cat.hit) / totalHit)}
      })
    }
    this.drawChart(graphs)
  }

  private drawChart(graphs: { items: GraphDto[] }) {
    let chartDomain: ChartDomain = {chartType: 'line-river', items: []}
    chartDomain.items = graphs.items.map(graph => {
      if (graph.max == undefined) {
        graph.max = 0
      }
      if (graph.min == undefined) {
        graph.min = 0
      }
      let item: ChartDomainItem = {date: graph.datestr, hit: graph.hit, max: graph.max, min: graph.min}
      return item
    })
    this.chartComponent.drawChart(chartDomain)
  }

  //endregion

  //region utils methode
  translate(data: string): string {
    return this.translateService.instant(data)
  }

  getRoundedNumber(value: number) {
    return numeral(value).format('0.0a').replace('.0', '');
  }

  //endregion
}
