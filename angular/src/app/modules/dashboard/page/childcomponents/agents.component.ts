
import {map} from 'rxjs/operators';
import {Component, OnInit} from "@angular/core";
import {AgentCountModel} from "../../../../core/models/Dashboard";
import {forkJoin} from "rxjs";
import {AgentService} from "../../../../core/services/agent.service";
import {BoxService} from "../../../../core/services/box.service";
import {RoamingService} from "../../../../core/services/roaming.service";
import {DashBoardService, DistinctAgentResponse, DistinctBoxResponse} from "../../../../core/services/dashBoardService";
import {Agent} from "../../../../core/models/Agent";
import {Box} from "../../../../core/models/Box";
import {ConfigHost, ConfigService} from "../../../../core/services/config.service";

@Component({
  selector: 'app-dashboard-agents',
  templateUrl: 'agents.component.html',
  styleUrls: ['../dashboard.component.scss'],
  providers: [DashBoardService]
})
export class AgentsComponent implements OnInit {
  constructor(private agentService: AgentService, private boxService: BoxService,
              private roamingService: RoamingService, private dashboardService: DashBoardService, private configService: ConfigService) {
  }
  agentCounts: AgentCountModel[] = []
  ngOnInit() {
    this.agentCounts.push({ name: 'PublicIp', activeCount: 0, passiveCount: 0, link: '/admin/deployment/public-ip' });
    this.agentCounts.push({ name: 'RoamingClient', activeCount: 0, passiveCount: 0, link: '/admin/deployment/roaming-clients' });
    this.agentCounts.push({ name: 'DnsRelay', activeCount: 0, passiveCount: 0, link: '/admin/deployment/dns-relay' });
    this.fillAgentData()
  }

  //region ui methode
  fillAgentData(){
    this.getAgent(function (params: AgentCountModel[]) {
      this.agentCounts = []
      this.agentCounts = params
    }.bind(this))
  }
  //endregion

  //region network service
  getAgent(cal: Function) {
    this.getAllAgentsService().subscribe(res => {
      const publicip: AgentCountModel = { name: 'PageName.PublicIp', activeCount: 0, passiveCount: 0, link: '/admin/deployment/public-ip' };
      const roamingclient: AgentCountModel = { name: 'RoamingClient', activeCount: 0, passiveCount: 0, link: '/admin/deployment/roaming-clients'};
      const dnsrelay: AgentCountModel = { name: 'DnsRelay', activeCount: 0, passiveCount: 0, link: '/admin/deployment/dns-relay' };
      publicip.activeCount = res.disAgents.items.filter(x=>res.location.find(y=>x.id === y.id)).length
      publicip.passiveCount = res.location.length - publicip.activeCount

      roamingclient.activeCount = res.disAgents.items.filter(x=>res.roaming.find(y=>x.id === y.id)).length
      roamingclient.passiveCount = res.roaming.length - roamingclient.activeCount

      dnsrelay.activeCount = res.box.filter(x=>res.disBoxs.items.find(y=>x.serial === y.serial)).length
      dnsrelay.passiveCount = res.box.length - dnsrelay.activeCount;
      let menuItems = [publicip,roamingclient,dnsrelay]
      menuItems = menuItems.filter(item => {
        if (this.configService.host.hiddenMenus) {
          return !this.configService.host.hiddenMenus.find(it => {
            return it.length > 3 && item.link.includes(it);
          })
        }
        return true
      })
      cal(menuItems)
    })
  }
  getAllAgentsService() {
    return forkJoin([this.agentService.getAgentLocation(), this.roamingService.getClients(),
      this.boxService.getBoxes(), this.dashboardService.getDistinctAgent({duration: 24}),
      this.dashboardService.getDistinctBox({duration: 24})]).pipe(map(results => {
        const agentsLocation: Agent[] = results[0]
        const agentsRoamingClient: Agent[] = results[1]
        const agentsBox: Box[] = results[2]
        const distinctAgents: DistinctAgentResponse = results[3]
        const distinctBoxs: DistinctBoxResponse = results[4]
        return {location: agentsLocation, roaming: agentsRoamingClient, box: agentsBox, disAgents: distinctAgents,disBoxs: distinctBoxs}
    }))
  }
  //endregion
}

