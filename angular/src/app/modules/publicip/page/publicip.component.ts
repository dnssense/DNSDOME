import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/core/services/alert.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AgentService } from 'src/app/core/services/agent.service';
import { Agent, IpWithMask } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AgentType } from 'src/app/core/models/AgentType';
import * as introJs from 'intro.js/intro.js';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { PublicIPService } from 'src/app/core/services/publicIPService';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { ProfileWizardComponent } from '../../shared/profile-wizard/page/profile-wizard.component';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { ValidationService } from 'src/app/core/services/validation.service';

declare let $: any;

@Component({
  selector: 'app-publicip',
  templateUrl: './publicip.component.html',
  styleUrls: ['./publicip.component.sass']
})
export class PublicipComponent implements OnInit, AfterViewInit {

  ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
  publicIps: Agent[] = [];
  publicIpsFiltered: Agent[] = [];
  publicIpForm: FormGroup;
  startWizard = false;

  ipRanges: RkSelectModel[] = [
    { value: 32, displayText: '32' },
    { value: 31, displayText: '31' },
    { value: 30, displayText: '30' },
    { value: 29, displayText: '29' },
    { value: 28, displayText: '28' },
    { value: 27, displayText: '27' },
    { value: 26, displayText: '26' },
    { value: 25, displayText: '25' },
    { value: 24, displayText: '24' }
  ];

  selectedIp: Agent = new Agent();
  selectedAgent: Agent = new Agent();
  ipType = 'staticIp';
  dnsFqdn: string;
  searchKey: string;
  isNewItemUpdated = false;
  saveMode: string;
  securityProfiles: SecurityProfile[];

  securityProfilesForRkSelect: RkSelectModel[] = [];

  roleName: string;
  tooltipGuideCounter = 0;

  agentProfile: any;

  @ViewChild('agentModal') agentModal: RkModalModel;
  @ViewChild('profileModal') profileModal: RkModalModel;
  @ViewChild('profileWizard') profileWizard: ProfileWizardComponent;

  currentStep = 1;

  ip = '';

  constructor(
    private alertService: AlertService,
    private notification: NotificationService,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private agentService: AgentService,
    private publicIpService: PublicIPService,
    private staticMessageService: StaticMessageService
  ) {
    this.roleName = this.authService.currentSession.currentUser.roles.name;
    this.getPublicIpsDataAndProfiles();

    this.publicIpForm = this.formBuilder.group({
      'agentName': ['', [Validators.required]],
      'ipType': ['', [Validators.required]],
      'blockMessage': ['', []],
      'dnsFqdn': ['', []],
      'ip0': ['', [Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]],
      'cyberXRayIp': ['', []]
    });

    this.defineNewAgentForProfile();
  }

  ngOnInit() {
    this.publicIpService.getMyIp().subscribe(result => {
      this.ip = result;
    });
  }

  saveProfile() {
    this.profileWizard.saveProfile();
  }

  saveProfileEmit() {
    this.profileModal.toggle();

    this.getPublicIpsDataAndProfiles();
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  ngAfterViewInit(): void { }

  getPublicIpsDataAndProfiles(type?: string) {

    this.selectedAgent = new Agent();

    this.publicIps = [];
    this.agentService.getAgentLocation().subscribe(res => {

      if ((res == null || res.length < 1) && this.roleName !== 'ROLE_USER' && this.tooltipGuideCounter < 1) {
        this.showNewIpForm();
        this.openTooltipGuide();
      } else {
        res.forEach(r => {
          if (r.agentType && r.agentType.toString() === AgentType.LOCATION.toString()) {
            this.publicIps.push(r);
          }
        });
        this.publicIpsFiltered = this.publicIps;
      }
    });

    this.agentService.getSecurityProfiles().subscribe(res => {
      this.securityProfiles = res;

      this.fillSecurityProfilesArray();
    });
  }

  changeProfile($event) {
    this.showProfileEditWizard($event, false);
  }

  clearAgentForm() {
    this.selectedIp.agentAlias = '';
    this.selectedIp.blockMessage = '';
    this.selectedIp.dynamicIpDomain = '';
    this.selectedIp.staticSubnetIp.forEach(elem => elem.baseIp = '');
    this.securityProfilesForRkSelect.forEach(elem => elem.selected = false);
    this.selectedIp.cyberXRayIp = '';
  }

  fillSecurityProfilesArray(agent?: Agent) {
    this.securityProfilesForRkSelect = this.securityProfiles.map((elem, index) => {
      const obj = {
        displayText: elem.name,
        value: elem.id,
      } as RkSelectModel;

      if (this.saveMode === 'NewProfile') {
        if (index === this.securityProfiles.length - 1) {
          obj.selected = true;
        }
      } else if (agent) {
        // tslint:disable-next-line: triple-equals
        if (elem.id == agent.rootProfile.id) {
          obj.selected = true;
        }
      } else {
        if ((this.selectedIp.rootProfile && this.selectedIp.rootProfile.name) && this.selectedIp.rootProfile.id === elem.id) {
          obj.selected = true;
        }
      }

      return obj;
    });
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

    const allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'Backspace', 'ArrowLeft', 'ArrowRight', '.', 'Tab'];
    let isValid = false;

    for (let i = 0; i < allowedChars.length; i++) {
      if (allowedChars[i] == event.key) {
        isValid = true;
        break;
      }
    }
    if (inputValue && (event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      if (event.key !== '.') {
        inputValue += event.key;
      }
      const lastOcletStr = inputValue.substring(inputValue.lastIndexOf('.') + 1);
      const lastOclet = Number(lastOcletStr);
      if (isValid && (lastOclet > 255 || lastOclet < 0 || lastOcletStr.length > 3)) {
        isValid = false;
      }
      if (isValid && event.key === '.') {
        const oclets: string[] = inputValue.split('.');
        for (let i = 0; i < oclets.length; i++) {
          const oclet = oclets[i];
          if (Number(oclet) < 0 || Number(oclet) > 255) {
            isValid = false;
            break;
          }
        }
      }

      if (isValid && event.key === '.' && (inputValue.endsWith('.') || inputValue.split('.').length >= 4)) {
        isValid = false;
      }
    } else if (isValid && event.key === '.') {
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
    }
  }

  showProfileEditWizard(id: number, t: boolean = true) {
    let agent;

    if (t) {
      agent = this.publicIps.find(p => p.id === id);
    } else {
      agent = this.publicIps.find(p => p.rootProfile.id === id);
    }

    if (agent) {
      if (agent.rootProfile && agent.rootProfile.id > 0) {
        this.selectedAgent = JSON.parse(JSON.stringify(agent));

        this.fillSecurityProfilesArray(agent);

        this.saveMode = 'ProfileUpdate';

        this.startWizard = true;

        this.profileModal.toggle();
      } else {
        this.notification.warning('Profile can not find!');
      }
    }
  }

  searchChanged() {
    this.publicIpsFiltered = this.publicIps.filter(x => {
      const searchKey = this.searchKey.trim().toLocaleLowerCase();

      const agentAlias = x.agentAlias.toLocaleLowerCase().includes(searchKey);
      const ipType = x.staticSubnetIp ? 'static'.includes(searchKey) : 'dynamic'.includes(searchKey);
      const ipAdresses = x.staticSubnetIp ? x.staticSubnetIp.some(y => y.baseIp.toLocaleLowerCase().includes(searchKey)) : x.dynamicIpDomain.toLocaleLowerCase().includes(searchKey);
      const profile = x.rootProfile.name.toLocaleLowerCase().includes(searchKey);

      return agentAlias || ipType || ipAdresses || profile;
    });
  }

  async showNewIpForm() {
    this.isNewItemUpdated = false;
    this.selectedIp = new Agent();
    this.selectedIp.logo = null;
    this.selectedIp.staticSubnetIp = [];

    const ip0 = {} as IpWithMask;

    const findedMyPublicIp = this.publicIps.some(x => {
      if (x.staticSubnetIp) {
        return x.staticSubnetIp.some(y => y.baseIp === this.ip);
      }
    });

    if (!findedMyPublicIp) {
      ip0.baseIp = this.ip;
    }

    ip0.mask = 32;
    this.selectedIp.staticSubnetIp.push(ip0);

    this.securityProfilesForRkSelect = this.securityProfilesForRkSelect.map(x => {
      return { ...x, selected: false };
    });

    this.ipType = 'staticIp';

    this.agentModal.toggle();
  }

  hideNewWizard() {
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

    this.fillSecurityProfilesArray();

    this.agentModal.toggle();
  }

  hideWizard() {
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.yourChangesWillBeCanceledMessage}!`).subscribe(
      res => {
        if (res) {
          this.hideWizardWithoutConfirm();
        }
      }
    );
  }

  hideWizardWithoutConfirm() {
    this.hideNewWizard();
  }

  selectFile($event) {

    const inputValue = $event.target;
    const file = inputValue.files[0];

    if (typeof file === 'undefined' || !file.type.toString().startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    const ag = this.selectedIp;

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
      const img = new Image();
      img.onload = function () { callback(true); };
      img.onerror = function () { callback(false); };
      img.src = url;
    }

  }

  deletePublicIp(id: number) {
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.selectedPublicIpAndItsSettingsWillBeDeletedMessage}!`).subscribe(
      res => {
        if (res) {
          this.agentService.deleteAgent(id).subscribe(res => {

            this.notification.success(this.staticMessageService.deletedAgentLocationMessage);
            this.getPublicIpsDataAndProfiles();


          });
        }
      }
    );
  }

  onSelectionChangeIPType(type: string) {
    if (type === 'dynamicIp') {
      this.ipType = type;
      this.publicIpForm.controls['ip0'].clearValidators();
      this.publicIpForm.controls['ip0'].updateValueAndValidity();
      this.publicIpForm.controls['dnsFqdn'].setValidators([Validators.required]);
      this.publicIpForm.controls['dnsFqdn'].updateValueAndValidity();
    } else {
      this.ipType = type;
      this.publicIpForm.controls['dnsFqdn'].clearValidators();
      this.publicIpForm.controls['dnsFqdn'].updateValueAndValidity();
    }
  }

  addIpRangeToList() {
    if (this.selectedIp.staticSubnetIp.length < 10) {
      const ip0 = {} as IpWithMask;
      ip0.mask = 32;
      this.selectedIp.staticSubnetIp.push(ip0);
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
    this.selectedIp.rootProfile = this.securityProfiles.find(p => p.id === id);
  }

  savePublicIp() {
    if (!this.validatePublicIpForm()) {
      return;
    }

    const selectedProfile = this.securityProfilesForRkSelect.find(x => x.selected);

    if (selectedProfile) {
      this.selectedIp.rootProfile = this.securityProfiles.find(x => x.id === selectedProfile.value);
    }

    this.agentService.saveAgentLocation(this.selectedIp).subscribe(res => {

      this.notification.success(this.staticMessageService.savedAgentLocationMessage);
      this.getPublicIpsDataAndProfiles();

      this.agentModal.toggle();
    });
  }

  isNullOrEmpty(val: string) {
    return val && val.length > 1;
  }

  validatePublicIpForm(): boolean {
    const isDomain = ValidationService.isDomainValid(this.selectedIp.dynamicIpDomain);

    if (!this.isNullOrEmpty(this.selectedIp.agentAlias)) {
      this.notification.warning('Please enter a name');
      return false;
    } else if (this.ipType === 'staticIp' && !this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length < 1) {
      this.notification.warning('Form is not valid! Please enter IP fields with valid values.');
      return false;
    } else if (this.ipType === 'dynamicIp' && (!this.selectedIp.dynamicIpDomain || !isDomain)) {
      this.notification.warning('Form is not valid! Please enter IP fields with valid values.');
      return false;
    } else if (!this.ipType) {
      return false;
    }

    if (this.ipType === 'staticIp' && this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length > 0) {
      for (let i = 0; i < this.selectedIp.staticSubnetIp.length; i++) {
        const e = this.selectedIp.staticSubnetIp[i];
        if (e.baseIp == null || e.mask === 0) {
          this.notification.warning('Please enter IP fields with valid values and select a mask for your IP address!');
          return false;
        }
      }
    } else {
      this.selectedIp.staticSubnetIp = null;
    }

    return true;
  }

  rkSelectButtonClicked($event: { clicked: boolean }) {
    this.saveMode = 'NewProfile';

    this.profileModal.toggle();
  }
}
