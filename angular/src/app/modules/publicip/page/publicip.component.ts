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
import { Agent, IpWithMask } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AgentType } from 'src/app/core/models/AgentType';

declare var $: any;

// export class IpNumber {
//   ip: string = "";
//   range: number = 0;
// }

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
export class PublicipComponent {

  ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
  publicIps: Agent[] = [];
  publicIpsFiltered: Agent[];
  publicIpForm: FormGroup;
  startWizard: boolean = false;
  ipRanges: Number[] = [32, 31, 30, 29, 28, 27, 26, 25, 24];
  selectedIp: Agent = new Agent();
  selectedAgent: Agent = new Agent();
  ipType: string = 'staticIp';
  dnsFqdn: string;
  searchKey: string;
  isNewItemUpdated: boolean = false;
  saveMode: string;
  securityProfiles: SecurityProfile[];

  constructor(private alertService: AlertService, private notification: NotificationService,
    private formBuilder: FormBuilder, private agentService: AgentService) {


    this.getPublicIpsDataAndProfiles();

    this.publicIpForm = this.formBuilder.group({
      "agentName": ["", [Validators.required]],
      "blockMessage": ["", [Validators.required]],
      "dnsFqdn": ["", []],
      "ip0": ["", [Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]],
      "cyberXRayIp": ["", []]

    });

    this.defineNewAgentForProfile();

  }

  getPublicIpsDataAndProfiles() {
    this.publicIps = [];
    this.agentService.getAgents().subscribe(res => {
      res.forEach(r => {
        if (r.agentType && r.agentType.toString() == AgentType.LOCATION.toString()) {
          this.publicIps.push(r);
        }
      });
      this.publicIpsFiltered = this.publicIps;
      console.log(this.publicIps);

    });

    this.agentService.getSecurityProfiles().subscribe(res => { this.securityProfiles = res });
  }

  defineNewAgentForProfile() {

    this.selectedAgent.rootProfile = new SecurityProfile();
    this.selectedAgent.rootProfile.domainProfile = {} as SecurityProfileItem;
    this.selectedAgent.rootProfile.applicationProfile = {} as SecurityProfileItem;
    this.selectedAgent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
    this.selectedAgent.rootProfile.domainProfile.categories = [];
    this.selectedAgent.rootProfile.applicationProfile.categories = [];
    this.selectedAgent.rootProfile.blackWhiteListProfile.blackList = [];
    this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList = [];
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

    if (!this.validatePublicIpForm()) {
      return;
    }

    this.selectedAgent = this.selectedIp;
    this.defineNewAgentForProfile();
    this.selectedAgent.rootProfile.name = this.selectedIp.agentAlias + "-Profile";

    this.saveMode = 'NewProfileWithAgent';

    $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
    this.startWizard = true;
    $('#contentLink').click();
    document.getElementById('wizardPanel').scrollIntoView();
  }

  showProfileEditWizard(id: number) {
    debugger

    let agent = this.publicIps.find(p => p.id == id);
    if (agent.rootProfile && agent.rootProfile.id > 0) {
      this.selectedAgent = agent;
      this.saveMode = 'ProfileUpdate';
      $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
      $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
      this.startWizard = true;
      $('#contentLink').click();
      document.getElementById('wizardPanel').scrollIntoView();
    } else {
      this.notification.warning('Profile can not find!');
    }

  }

  showNewIpForm() {
    this.isNewItemUpdated = false;
    this.selectedIp = new Agent();
    this.selectedIp.staticSubnetIp = [];
    this.selectedIp.staticSubnetIp.push({} as IpWithMask)

    // this.publicIpService.getMyIp().subscribe(res => {
    //   let resIp: JsonIP;
    //   resIp = res;
    //   let myIp: IpNumber;
    //   myIp.ip = resIp.ip;
    //   myIp.range = 31;
    //   console.log(res);
    //   this.ipList.push(myIp)
    // });

    $('#newIpRow').slideDown(300);
    $('#newButtonDiv').hide();

  }

  hideNewWizard() {
    $('#newIpRow').slideUp(300);
    $('#newButtonDiv').show();
    this.getPublicIpsDataAndProfiles();
  }

  showEditWizard(id: string) {
    this.isNewItemUpdated = true;
    debugger
    this.selectedIp = this.publicIps.find(p => p.id == Number(id));

    if (this.selectedIp && this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length > 0) {
      for (let i = 0; i < this.selectedIp.staticSubnetIp.length; i++) {
        const cname = 'ip' + (this.selectedIp.staticSubnetIp.length - 1);
        this.publicIpForm.addControl(cname, new FormControl(cname, Validators.required));
        this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]);
        this.publicIpForm.controls[cname].updateValueAndValidity();
      }
    } else {
      this.selectedIp.staticSubnetIp = [];
      this.selectedIp.staticSubnetIp.push({} as IpWithMask);
    }

    $('#newIpRow').slideDown(300);
    $('#newButtonDiv').hide();
  }

  hideWizard() {
    this.alertService.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
      res => {
        if (res) {
          this.hideWizardWithoutConfirm();
        }
      }
    );
  }

  hideWizardWithoutConfirm() {
    $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
    $('#publicIpPanel').toggle("slide", { direction: "left" }, 1000);
    this.hideNewWizard();
  }


  deletePublicIp(id: number) {
    this.alertService.alertWarningAndCancel('Are You Sure?', 'Selected Public IP and its settings will be deleted!').subscribe(
      res => {
        if (res) {
          this.agentService.deleteAgent(id).subscribe(res => {
            if (res.status == 200) {
              this.notification.success(res.message);
              this.getPublicIpsDataAndProfiles();
            } else {
              this.notification.error("Operation Failed! " + res.message);
            }
          });
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
    if (this.selectedIp.staticSubnetIp.length < 10) {
      this.selectedIp.staticSubnetIp.push({} as IpWithMask);
      const cname = 'ip' + (this.selectedIp.staticSubnetIp.length - 1);
      this.publicIpForm.addControl(cname, new FormControl(cname, Validators.required));
      this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]);
      this.publicIpForm.controls[cname].updateValueAndValidity();
    }
  }

  removeElementFromIpList(index: number) {
    const cname = 'ip' + index;
    this.selectedIp.staticSubnetIp.splice(index, 1);
    this.publicIpForm.controls[cname].clearValidators();
    this.publicIpForm.controls[cname].updateValueAndValidity();
  }

  searchByKeyword(e: any) {
    if (this.searchKey && this.searchKey.length > 0) {
      this.publicIpsFiltered = this.publicIps.filter(f => f.agentAlias.toLowerCase().includes(this.searchKey.toLowerCase()));
    } else {
      this.publicIpsFiltered = this.publicIps;
    }
  }

  securityProfileChanged(id: number) {
    this.isNewItemUpdated = true;
    this.selectedIp.rootProfile = this.securityProfiles.find(p => p.id == id);
  }

  savePublicIp() {

    if (!this.validatePublicIpForm()) {
      return;
    }

    console.log(JSON.stringify(this.selectedIp));

    this.agentService.saveAgent(this.selectedIp).subscribe(res => {
      if (res.status == 200) {
        this.notification.success(res.message);
      } else {
        this.notification.error(res.message);
      }
    })


    $('#newIpRow').slideUp(300);
    $('#newButtonDiv').show();
  }

  validatePublicIpForm(): boolean {
    const $validator = $('.publicIpForm').validate({
      rules: {
        agentName: {
          required: true
        },
        blockMessage: {
          required: true
        },
        ip0: {
          required: true,
          minlength: 15
        }
      }
    });

    var $valid = $('.publicIpForm').valid();
    if (!$valid) {
      $validator.focusInvalid();
      return false;
    }

    if (!this.publicIpForm.dirty || !this.publicIpForm.valid) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return false;
    }
    if (this.ipType == 'staticIp' && !this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length < 1) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.1");
      return false;
    } else if (this.ipType == 'dynamicIp' && !this.dnsFqdn) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.2");
      return false;
    } else if (!this.ipType) {
      return false;
    }

    return true;
  }


}
