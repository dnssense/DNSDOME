import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/core/services/alert.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AgentService } from 'src/app/core/services/agent.service';
import { Agent, IpWithMask } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AgentType } from 'src/app/core/models/AgentType';
import * as introJs from 'intro.js/intro.js';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { PublicIPService } from 'src/app/core/services/PublicIPService';

declare let $: any;

@Component({
  selector: 'app-publicip',
  templateUrl: './publicip.component.html',
  styleUrls: ['./publicip.component.sass']
})
export class PublicipComponent implements AfterViewInit {

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
  roleName: string;
  tooltipGuideCounter: number = 0;

  constructor(private alertService: AlertService, private notification: NotificationService, private authService: AuthenticationService,
    private formBuilder: FormBuilder, private agentService: AgentService, private publicIpService: PublicIPService) {

    this.roleName = this.authService.currentSession.currentUser.roles.name;
    this.getPublicIpsDataAndProfiles();

    this.publicIpForm = this.formBuilder.group({
      "agentName": ["", [Validators.required]],
      "ipType": ["", [Validators.required]],
      "blockMessage": ["", []],
      "dnsFqdn": ["", []],
      "ip0": ["", [Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]],
      "cyberXRayIp": ["", []]

    });

    this.defineNewAgentForProfile();

  }

  ngAfterViewInit(): void {

    //adding select options into divs
    var container_select, i, j, selElmnt, a, b, c;
    container_select = document.getElementsByClassName("dnssense-select");
    for (i = 0; i < container_select.length; i++) {
      selElmnt = container_select[i].getElementsByTagName("select")[0];

      a = document.createElement("DIV");
      a.setAttribute("class", "select-selected");
      a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
      container_select[i].appendChild(a);

      b = document.createElement("DIV");
      b.setAttribute("class", "select-items select-hide");
      for (j = 1; j < selElmnt.length; j++) {

        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function (e) {

          var y, i, k, s, h;
          s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          h = this.parentNode.previousSibling;

          for (i = 0; i < s.length; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              y = this.parentNode.getElementsByClassName("same-as-selected");
              for (k = 0; k < y.length; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();
        });
        b.appendChild(c);
      }

      container_select[i].appendChild(b);

      a.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
      });
    }
    function closeAllSelect(elmnt) {
      /*a function that will close all select boxes in the document,
      except the current select box:*/
      var x, y, i, arrNo = [];
      x = document.getElementsByClassName("select-items");
      y = document.getElementsByClassName("select-selected");
      for (i = 0; i < y.length; i++) {
        if (elmnt == y[i]) {
          arrNo.push(i)
        } else {
          y[i].classList.remove("select-arrow-active");
        }
      }
      for (i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i)) {
          x[i].classList.add("select-hide");
        }
      }
    }
    document.addEventListener("click", closeAllSelect);

    $('#advancedBtn').click(function () {
      $('#advancedContent').toggleClass('d-none');
      $('#defaultSaveBtn').toggleClass('d-none');
    });

  }

  getPublicIpsDataAndProfiles() {

    this.publicIps = [];
    this.agentService.getAgents().subscribe(res => {
      
      if ((res == null || res.length < 1) && this.roleName != 'ROLE_USER' && this.tooltipGuideCounter < 1) {
        this.showNewIpForm();
        this.openTooltipGuide();
      } else {
        res.forEach(r => {
          if (r.agentType && r.agentType.toString() == AgentType.LOCATION.toString()) {
            this.publicIps.push(r);
          }
        });
        this.publicIpsFiltered = this.publicIps;
      }

    });

    this.agentService.getSecurityProfiles().subscribe(res => { this.securityProfiles = res });
  }

  openTooltipGuide() {
    introJs().start();
    this.tooltipGuideCounter++;
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

      // if (isValid && ((inputValue.length == 2 && inputValue == '10' && event.key == '.') ||
      //   inputValue == '192.168' || inputValue == '127.0.0.1')) {
      //   isValid = false;
      //   this.notification.warning('Please enter a valid Public IP Adress!', false);
      // }

      // if (isValid && inputValue.length >= 4 && (inputValue.substring(0, 4) == '172.')) {

      //   let secondOcletStr = inputValue.substring(inputValue.indexOf('.') + 1);
      //   let secondOclet = Number(secondOcletStr);
      //   if (secondOclet >= 16 && secondOclet <= 31) {
      //     isValid = false;
      //     this.notification.warning('Please enter a valid Public IP Adress!', false);
      //   }
      // }

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
    let agent = this.publicIps.find(p => p.id == id);
    if (agent.rootProfile && agent.rootProfile.id > 0) {
      this.selectedAgent = agent;
      this.saveMode = 'ProfileUpdate';
      $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
      $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
      this.startWizard = true;
      //$('#contentLink').click();
      document.getElementById('wizardPanel').scrollIntoView();
    } else {
      this.notification.warning('Profile can not find!');
    }

  }

  showNewIpForm() {
    this.isNewItemUpdated = false;
    this.selectedIp = new Agent();
    this.selectedIp.logo = null;
    this.selectedIp.staticSubnetIp = [];
    let ip0 = {} as IpWithMask;
    ip0.mask = 0;
    this.selectedIp.staticSubnetIp.push(ip0)

    if (this.publicIps == null || this.publicIps.length < 1) {
      this.publicIpService.getMyIp().subscribe(res => {
        ip0.baseIp = res;
        ip0.mask = 32;
      });
    }

    this.ipType = 'staticIp';

    $('#newIpRow').slideDown(300);
    $('#pi_card_btn').hide();
    $("#fileUpload").val("");

  }

  hideNewWizard() {
    $('#newIpRow').slideUp(300);
    $('#pi_card_btn').show();
    this.getPublicIpsDataAndProfiles();
  }

  showEditWizard(id: string) {

    this.isNewItemUpdated = true;
    const selectedUpdateIp = this.publicIps.find(p => p.id == Number(id));

    this.selectedIp.id = selectedUpdateIp.id;
    this.selectedIp.agentAlias = selectedUpdateIp.agentAlias;
    this.selectedIp.agentType = selectedUpdateIp.agentType;
    this.selectedIp.blockMessage = selectedUpdateIp.blockMessage;
    this.selectedIp.captivePortalIp = selectedUpdateIp.captivePortalIp;
    this.selectedIp.dynamicIpDomain = selectedUpdateIp.dynamicIpDomain;
    this.selectedIp.cyberXRayIp = selectedUpdateIp.cyberXRayIp;
    this.selectedIp.rootProfile = selectedUpdateIp.rootProfile;
    this.selectedIp.staticSubnetIp = selectedUpdateIp.staticSubnetIp;
    this.selectedIp.isCpEnabled = selectedUpdateIp.isCpEnabled;
    this.selectedIp.logo = selectedUpdateIp.logo;

    if (this.selectedIp && this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length > 0) {

      for (let i = 1; i < this.selectedIp.staticSubnetIp.length; i++) {
        const cname = 'ip' + i;
        this.publicIpForm.addControl(cname, new FormControl(cname, Validators.required));
        this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]);
        this.publicIpForm.controls[cname].updateValueAndValidity();
      }

    } else {
      this.selectedIp.staticSubnetIp = [];
      this.selectedIp.staticSubnetIp.push({} as IpWithMask);

    }

    if (this.selectedIp.dynamicIpDomain && this.selectedIp.dynamicIpDomain.length > 0) {
      this.ipType = 'dynamicIp';
    } else {
      this.ipType = 'staticIp';
    }

    $('#newIpRow').slideDown(300);
    $('#pi_card_btn').hide();


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

  selectFile($event) {

    var inputValue = $event.target;
    let file = inputValue.files[0];

    if (typeof file == 'undefined' || !file.type.toString().startsWith('image/')) {
      return;
    }

    let reader = new FileReader();
    let ag = this.selectedIp;

    reader.onload = function (e) {
      try {
        imageExists(reader.result, function (exists) {
          if (exists) {
            ag.logo = reader.result;
          }
        });
      } catch (error) {
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }

    function imageExists(url, callback) {
      var img = new Image();
      img.onload = function () { callback(true); };
      img.onerror = function () { callback(false); };
      img.src = url;
    }

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
      // $("#dnsFqnDiv").show();
      // $('#staticIPBlock').hide();
      this.publicIpForm.controls["ip0"].clearValidators();
      this.publicIpForm.controls["ip0"].updateValueAndValidity();
      this.publicIpForm.controls["dnsFqdn"].setValidators([Validators.required]);
      this.publicIpForm.controls["dnsFqdn"].updateValueAndValidity();
    } else {
      this.ipType = type;
      // $("#dnsFqnDiv").hide();
      // $('#staticIPBlock').show();
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

    this.agentService.saveAgent(this.selectedIp).subscribe(res => {
      if (res.status == 200) {
        this.notification.success(res.message);
        this.getPublicIpsDataAndProfiles();

      } else {
        this.notification.error(res.message);
      }
    });

    $('#newIpRow').slideUp(300);
    $('#pi_card_btn').show();
  }

  validatePublicIpForm(): boolean {
    const $validator = $('.publicIpForm').validate({
      rules: {
        agentName: {
          required: true
        },
        blockMessage: {
          required: false
        }
      }
    });

    var $valid = $('.publicIpForm').valid();
    if (!$valid) {
      this.notification.warning("Public Ip form is not valid. Please enter required fields. ")
      $validator.focusInvalid();
      return false;
    }

    if (!this.publicIpForm.valid) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return false;

    }

    if (this.ipType == 'staticIp' && this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length > 0) {
      for (let i = 0; i < this.selectedIp.staticSubnetIp.length; i++) {
        const e = this.selectedIp.staticSubnetIp[i];
        if (e.baseIp == null || e.mask == 0) {
          this.notification.warning('Select a mask for your IP address!');
          return false;
        }
      }
    } else {
      this.selectedIp.staticSubnetIp = null;
    }

    if (this.ipType == 'staticIp' && !this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length < 1) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return false;
    } else if (this.ipType == 'dynamicIp' && !this.selectedIp.dynamicIpDomain && !this.dnsFqdn) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return false;
    } else if (!this.ipType) {
      return false;
    }

    return true;
  }


}
