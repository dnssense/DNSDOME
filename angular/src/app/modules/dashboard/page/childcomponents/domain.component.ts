import {Component, Input, ViewChild} from "@angular/core";
import {GroupItemDom} from "./group-item.component";
import {TranslateService} from "@ngx-translate/core";
import * as numeral from 'numeral';
import {Domain, TopDomainValuesResponseV4} from "../../../../core/models/Dashboard";
import {CyberXRayService} from "../../../../core/services/cyberxray.service";
import {ValidationService} from "../../../../core/services/validation.service";
import {ClipboardService} from "ngx-clipboard";
import {NotificationService} from "../../../../core/services/notification.service";
import {StaticMessageService} from "../../../../core/services/staticMessageService";
import {GraphDto, LiveReportRequest} from "../../../../core/models/report";
import {DashBoardService} from "../../../../core/services/dashBoardService";
import {ChartDomain, ChartDomainItem, DashboardChartComponent} from "./dashboard-chart.component";

interface TagInputValue {
  value: string;
  display: string;
}

@Component({
  selector: 'app-dashboard-domain',
  templateUrl: 'domain.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class DomainComponent {
  constructor(private translateService: TranslateService, private cyberxrayService: CyberXRayService,
              private clipboardService: ClipboardService, private notificationService: NotificationService,
              private staticMesssageService: StaticMessageService, private dashboardService: DashBoardService) {
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
  @Input() reportType: 'livereport' | 'nolivereport' = 'livereport'
  @Input() selectedDate: { startDate: Date, endDate: Date, duration: number }
  theme: any = 'light';
  topDomains: Domain[] = [];
  selectedDomains: TagInputValue[] = [];
  topDomainsCountTotal: number;

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

  addDomain(domain: Domain) {
    this.selectedDomains = [{display: domain.name, value: domain.name}]
    this.search()
  }

  onItemAdded($event: TagInputValue) {
    const isDomain = ValidationService.isDomainValid($event.value);
    if (!isDomain) {
      this.selectedDomains = [];
    }
  }

  copyItem($event: TagInputValue) {
    this.clipboardService.copy($event.value);
    this.notificationService.info(this.staticMesssageService.domainCopiedToClipboardMessage);
  }

  search() {
    let domain = ''
    this.selectedDomains.forEach(el => {
      domain = el.value
    })
    if (domain.trim().length === 0) {
      return
    }
    if (this.reportType == 'livereport') {
      this.loadGraphLive(domain)
    } else {
      this.loadGraphNoLive(domain)
    }
  }

  drawChart(graphs: { items: GraphDto[] }) {
    let chartDomain: ChartDomain = {chartType: 'line', items: []}
    chartDomain.items = graphs.items.map(graph => {
      let item: ChartDomainItem = {date: graph.datestr, hit: graph.hit, max: 0, min: 0}
      return item
    })
    this.chartComponent.drawChart(chartDomain)
  }

  //endregion
  //region utils methode
  setDomains(domains: Domain[], total: { allow: number, block: number }) {
    this.topDomainsCountTotal = total.allow + total.block
    if (domains) {
      this.topDomains = domains
      if (domains.length) {
        this.addDomain(domains[0])
      }
    }


  }

  setTheme(theme) {
    this.theme = theme
    this.chartComponent.setTheme(theme)
  }

  setGroup(group: GroupItemDom) {
    this.currentGroup = group
  }

  cyberxray(event: any, domain: string) {
    this.cyberxrayService.open(domain);
    event.stopPropagation();
  }

  translate(data: string): string {
    return this.translateService.instant(data)
  }

  getRoundedNumber(value: number) {
    return numeral(value).format('0.0a').replace('.0', '');
  }

  private getGraph(result: TopDomainValuesResponseV4) {
    return result.items.map(x => {
      let graph: GraphDto = {datestr: x.date, hit: x.hit, max: 0, min: 0, timestemp: 0}
      return graph
    });
  }

  //endregion

  //region network service
  loadGraphLive(domain: string) {
    let req: LiveReportRequest = {domain: domain}
    this.dashboardService.getLiveReport(req).subscribe(res => {
      this.drawChart(res.graphs)
    })
  }

  loadGraphNoLive(domain: string) {
    let req = {
      domain: domain,
      startDate: this.selectedDate.startDate.toISOString(),
      endDate: this.selectedDate.endDate.toISOString()
    }
    this.dashboardService.getTopDomainValue(req).subscribe(result => {
      let res:{items: GraphDto[]} = {items:[]}
      res.items = this.getGraph(result)
      res.items.sort((x,y) => {
        const x1 = Date.parse(x.datestr);
        const y1 = Date.parse(y.datestr);
        return x1 - y1
      })
      this.drawChart(res)
    })
  }
//endregion
}
