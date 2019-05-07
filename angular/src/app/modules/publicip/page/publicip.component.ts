import { Component, OnInit, SimpleChanges, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/core/services/alert.service';
import { ApplicationProfile } from 'src/app/core/models/ApplicationProfile';
import { ApplicationProfilesService } from 'src/app/core/services/ApplicationProfilesService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { DomainProfile } from 'src/app/core/models/DomainProfile';
import { BWList } from 'src/app/core/models/BWList';
import { DomainProfilesService } from 'src/app/core/services/DomainProfilesService';
import { BlackWhiteListService } from 'src/app/core/services/BlackWhiteListService';
import { PublicIPService } from 'src/app/core/services/PublicIPService';
import { PublicIP } from 'src/app/core/models/PublicIP';
import { MobileCategory } from 'src/app/core/models/MobileCategory';
import { AgentResponse } from 'src/app/core/models/AgentResponse';
import { CollectiveBlockRequest } from 'src/app/core/models/CollectiveBlockRequest';
import { AgentService } from 'src/app/core/services/agent.service';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AgentType } from 'src/app/core/models/AgentType';

declare var $: any;

export class IpNumber {
  ip: string = "";
  range: number = 0;
}

declare interface JsonIP {
  ip: string
}
declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'app-publicip',
  templateUrl: './publicip.component.html',
  styleUrls: ['./publicip.component.sass']
})
export class PublicipComponent implements OnInit, AfterViewInit {

  ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
  publicIps:Agent[] = [];
  publicIpsFiltered: Agent[];
  publicIpForm: FormGroup;
  // publicIpFormWithProfile: FormGroup;
  agentName: string;
  ipList: IpNumber[];
  blockMessage: string;
 
  selectedAgent: Agent;
  startWizard: boolean = false;

  ipRanges: Number[] = [32, 30, 29, 28, 27, 26, 25, 24];
  selectedIp: Agent = new Agent();
  ipType: string = 'staticIp';
  dnsFqdn: string;
  dataTable: DataTable = {} as DataTable;
  dataTableRows: string[][] = [];
  searchKey: string;
  isNewProfileSelected: boolean = false;

  securityProfiles: SecurityProfile[];

  device: AgentResponse;
  deviceForm: FormGroup;

  constructor(private alertService: AlertService, private notification: NotificationService, private bwService: BlackWhiteListService,
    private formBuilder: FormBuilder, private apService: ApplicationProfilesService, private dpService: DomainProfilesService,
    private publicIpService: PublicIPService, private agentService: AgentService) {

   
    this.agentService.getSecurityProfiles().subscribe(res => this.securityProfiles = res);

    this.getPublicIpsData();

    this.publicIpForm = this.formBuilder.group({
      "agentName": ["", [Validators.required]],
      "blockMessage": ["", [Validators.required]],
      "dnsFqdn": ["", []],
      "ip0": ["", [Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]]
    });
    this.defineNewAgentForProfile();

  }

  getPublicIpsData() {
   
    this.agentService.getAgents().subscribe(res => {
      res.forEach(r => {
        if (r.agentType && r.agentType.toString() == 'LOCATION') {
          this.publicIps.push(r);
        }
      });
      this.publicIpsFiltered = this.publicIps;
    });
  }

  ngAfterViewInit() {

    $(window).resize(() => {
      $('.card-wizard').each(function () {

        const $wizard = $(this);
        const index = 0; // $wizard.bootstrapWizard('currentIndex');
        let $total = $wizard.find('.nav li').length;
        let $li_width = 100 / $total;

        let total_steps = $wizard.find('.nav li').length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find('.nav li').css('width', $li_width + '%');

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        let $current = index + 1;

        if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
          move_distance -= 8;
        } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
        });

        $('.moving-tab').css({
          'transition': 'transform 0s'
        });
      });
    });
  }

  ngOnInit() {
    this.device = new AgentResponse();
    this.device.id = null;
    this.device.agentAlias = null;
    this.device.agentCode = null;

    this.selectedIp = new PublicIP();
    this.selectedIp.profile = new DomainProfile();
    this.selectedIp.appUserProfile = new ApplicationProfile();
    this.selectedIp.bwList = new BWList();

    // this.dpService.getProfileData().subscribe((res: DomainProfile[]) => {
    //   if (res != null) {
    //     this.domainProfiles = res;
    //     this.updateDomainProfilelist();
    //   }
    // });
    // this.apService.getProfileData().subscribe((res: ApplicationProfile[]) => {
    //   if (res != null) {
    //     this.appProfiles = res;
    //     this.updateApplicationProfilelist();
    //   }
    // });
    // this.bwService.getBwList().subscribe((res: BWList[]) => {
    //   if (res != null) {
    //     this.bwList = res;
    //     this.updateBWList();
    //   }
    // });
  }

  defineNewAgentForProfile() {
    this.selectedAgent = new Agent();
    this.selectedAgent.rootProfile = new SecurityProfile();
    this.selectedAgent.rootProfile.domainProfile = {} as SecurityProfileItem;
    this.selectedAgent.rootProfile.applicationProfile = {} as SecurityProfileItem;
    this.selectedAgent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
    this.selectedAgent.rootProfile.domainProfile.categories = [];
    this.selectedAgent.rootProfile.applicationProfile.categories = [];
    this.selectedAgent.rootProfile.blackWhiteListProfile.blackList = [];
    this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList = [];
  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      'has-error': this.isFieldValid(form, field),
      'has-feedback': this.isFieldValid(form, field)
    };
  }

  checkIPNumber(event: KeyboardEvent, inputValue: string) {

    let allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "Backspace", "ArrowLeft", "ArrowRight", "."];
    let isValid: boolean = false;

    for (let i = 0; i < allowedChars.length; i++) {
      if (allowedChars[i] == event.key) {
        isValid = true;
        break;
      }
    }
    if (inputValue && (event.key != 'Backspace' && event.key != 'ArrowLeft' && event.key != 'ArrowRight')) {
      if (event.key != '.') {
        inputValue += event.key;
      }
      let lastOcletStr = inputValue.substring(inputValue.lastIndexOf('.') + 1);
      let lastOclet = Number(lastOcletStr);
      if (isValid && (lastOclet > 255 || lastOclet < 0 || lastOcletStr.length > 3)) {
        isValid = false;
      }
      if (isValid && event.key == '.') {
        let oclets: string[] = inputValue.split('.');
        for (let i = 0; i < oclets.length; i++) {
          const oclet = oclets[i];
          if (Number(oclet) < 0 || Number(oclet) > 255) {
            isValid = false;
            break;
          }
        }
      }

      if (isValid && ((inputValue.length == 2 && inputValue == '10' && event.key == '.') ||
        inputValue == '192.168' || inputValue == '127.0.0.1')) {
        isValid = false;
        this.notification.warning('Please enter a valid Public IP Adress!', false);
      }

      if (isValid && inputValue.length >= 4 && (inputValue.substring(0, 4) == '172.')) {

        let secondOcletStr = inputValue.substring(inputValue.indexOf('.') + 1);
        let secondOclet = Number(secondOcletStr);
        if (secondOclet >= 16 && secondOclet <= 31) {
          isValid = false;
          this.notification.warning('Please enter a valid Public IP Adress!', false);
        }
      }

      if (isValid && event.key == '.' && (inputValue.endsWith('.') || inputValue.split('.').length >= 4)) {
        isValid = false;
      }
    } else if (isValid && event.key == '.') {
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
    }
  }


  showNewProfileWizard() {
   
    this.ipList = [];
    this.ipList.push(new IpNumber());
    this.selectedIp = new Agent();

    $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
    document.getElementById('wizardPanel').scrollIntoView();
   
    $('#contentLink').click();
    this.startWizard = true;

  }

  showNewIpWizard() {
    this.ipList = [];
    this.ipList.push(new IpNumber());
    this.selectedIp = new PublicIP();

    // this.publicIpService.getMyIp().subscribe(res => {
    //   let resIp: JsonIP;
    //   resIp = res;
    //   let myIp: IpNumber;
    //   myIp.ip = resIp.ip;
    //   myIp.range = 31;
    //   console.log(res);
    //   this.ipList.push(myIp)
    // });

    this.selectedAgent.rootProfile.name = "New IP Name-Profile";

    $('#newIpRow').slideDown(300);
    $('#newButtonDiv').hide();

  }

  hideNewWizard() {
    $('#newIpRow').slideUp(300);
    $('#newButtonDiv').show();
  }

  showEditWizard(id: string) {
 
    this.ipList = [];
    this.ipList.push(new IpNumber());
    this.selectedIp = this.publicIps.find(p => p.id == Number(id));

    // if (this.selectedIp && this.selectedIp.ips && this.selectedIp.ips.length > 0) {
    //   for (let i = 0; i < this.selectedIp.ips.length; i++) {
    //     let ipn = new IpNumber();
    //     ipn.ip = this.selectedIp.ips[i].slice(0, 4).join('.');

    //     const mask = Number(this.selectedIp.ips[i][4]) - Number(this.selectedIp.ips[i][3]);
    //     ipn.range = this.publicIpService.getRangeOrSubnetMask(1, mask);

    //     this.ipList[i] = ipn;
    //     const cname = 'ip' + (this.ipList.length - 1);
    //     this.publicIpForm.addControl(cname, new FormControl(cname, Validators.required));
    //     this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]);
    //     this.publicIpForm.controls[cname].updateValueAndValidity();

    //   }
    // }

    this.selectedAgent.rootProfile.name = this.selectedIp.agentAlias;

    $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
 
    $('#contentLink').click();

    this.startWizard = true;

    document.getElementById('wizardPanel').scrollIntoView();
  }

  hideWizard() {
    this.alertService.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
      res => {
        if (res) {
          this.getPublicIpsData();
          $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
          $('#publicIpPanel').toggle("slide", { direction: "left" }, 1000);
        }
      }
    );
  }

  saveIP() {
    if (!this.publicIpForm.valid) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return;
    }
    if (this.ipType == 'staticIp' && !this.ipList && this.ipList.length < 1) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return;
    } else if (this.ipType == 'dynamicIp' && !this.dnsFqdn) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return;
    } else if (!this.ipType) {
      return;
    }

    this.selectedIp.ips = [];
    if (this.ipType == 'staticIp') {
      for (let i = 0; i < this.ipList.length; i++) {
        const p = this.ipList[i];
        let ip: string[] = p.ip.split('.');
        ip.push(this.publicIpService.getRangeOrSubnetMask(2, p.range).toString());
        this.selectedIp.ips.push(ip);
      }
    } else if (this.ipType == 'dynamicIp') {
      //TODO: this.dnsFqdn alanı bir yere bağlı değil şuanda.
    }


    this.publicIpService.save(this.selectedIp).subscribe(
      res => {
        if (res.status == 200) {
          this.alertService.alertSuccessMessage("Operation Successful", "Public IP successfully saved.");
          this.getPublicIpsData();
          $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
          $('#publicIpPanel').toggle("slide", { direction: "left" }, 1000);
        } else {
          this.notification.error("Operation Failed! " + res.message);
        }
      });

  }

  deletePublicIp(id: number) {
    this.alertService.alertWarningAndCancel('Are You Sure?', 'Selected Public IP and its settings will be deleted!').subscribe(
      res => {
        if (res) {
          // this.publicIpService.delete(this.publicIps.find(p => p.id == id)).subscribe(res => {
          //   if (res.status == 200) {
          //     this.alertService.alertSuccessMessage("Operation Successful", "Public IP successfully Deleted.");
          //     this.getPublicIpsData();
          //   } else {
          //     this.notification.error("Operation Failed! " + res.message);
          //   }
          // });
        }
      }
    );
  }

  onSelectionChangeIPType(type: string) {

    if (type === 'dynamicIp') {
      this.ipType = type;
      $("#dnsFqnDiv").show();
      $('#staticIPBlock').hide();
      this.publicIpForm.controls["dnsFqdn"].setValidators([Validators.required]);
      this.publicIpForm.controls["dnsFqdn"].updateValueAndValidity();
    } else {
      this.ipType = type;
      $("#dnsFqnDiv").hide();
      $('#staticIPBlock').show();
      this.publicIpForm.controls["dnsFqdn"].clearValidators();
      this.publicIpForm.controls["dnsFqdn"].updateValueAndValidity();
    }

  }

  addIpRangeToList() {
    if (this.ipList.length < 10) {
      this.ipList.push(new IpNumber());
      const cname = 'ip' + (this.ipList.length - 1);
      this.publicIpForm.addControl(cname, new FormControl(cname, Validators.required));
      this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]);
      this.publicIpForm.controls[cname].updateValueAndValidity();
    }
  }

  removeElementFromIpList(index: number) {
    const cname = 'ip' + index;
    this.ipList.splice(index, 1);
    this.publicIpForm.controls[cname].clearValidators();
    this.publicIpForm.controls[cname].updateValueAndValidity();
  }

  ipSplit1: String[];
  ipSplit(str: String) {
    this.ipSplit1 = str.toString().split(',');
    return this.ipSplit1[0] + '.' + this.ipSplit1[1] + '.' + this.ipSplit1[2] + '.' + this.ipSplit1[3] + '-' + this.ipSplit1[4];
  }
 
  searchByKeyword(e: any) {
    if (this.searchKey && this.searchKey.length > 0) {
      this.publicIpsFiltered = this.publicIps.filter(f => f.agentAlias.toLowerCase().includes(this.searchKey.toLowerCase()));
    } else {
      this.publicIpsFiltered = this.publicIps;
    }
  }

  securityProfileChanged(agentName: any, profile: any) {
    this.isNewProfileSelected = true;
  }

  saveButton() {
    this.notification.success('successfully clicked save button.');
    $('#newIpRow').slideUp(300);
    $('#newButtonDiv').show();
  }


}
