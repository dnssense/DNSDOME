import {Component, ViewChild} from "@angular/core";
import {GroupItemDom} from "./group-item.component";
import {TranslateService} from "@ngx-translate/core";
import {Aggregation, GraphDto} from "../../../../core/models/report";
import {CategoryDom} from "../../../../core/models/Dashboard";
import * as numeral from 'numeral';
import {ChartDomain, ChartDomainItem, DashboardChartComponent} from "./dashboard-chart.component";

@Component({
  selector: 'app-dashboard-category',
  templateUrl: 'category.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class CategoryComponent {
  constructor(private translateService: TranslateService) {
  }

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

  onClickCategory(cat: CategoryDom) {
    this.selectedCategory = cat
  }

  //endregion

  //region inderect ui methode
  setTheme(theme) {
    this.theme = theme
    this.chartComponent.setTheme(theme)
  }
  setGroup(group: GroupItemDom) {
    this.currentGroup = group
  }
  setCategories(cats: {items: Aggregation[]}, graphs: {items: GraphDto[]}, total:{allow: number, block: number}){
    let totalHit = total.allow + total.block
    this.categories = cats.items.map(cat => {
      return {name: cat.name, hit: cat.hit, hit_ratio: Math.floor((100 * cat.hit) / totalHit)}
    })
    if (graphs.items.length) {
      this.drawChart(graphs)
    }
  }
  drawChart(graphs: {items: GraphDto[]}){
    let chartDomain: ChartDomain = {chartType: 'line-river', items: []}
    chartDomain.items = graphs.items.map(graph => {
      let item: ChartDomainItem = {date: graph.datestr, hit: graph.hit, max: graph.hit, min: 0}
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
