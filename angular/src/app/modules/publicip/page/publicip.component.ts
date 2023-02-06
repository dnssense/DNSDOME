
import {map} from 'rxjs/operators';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import * as introJs from 'intro.js/intro.js';
import * as isip from 'is-ip';
import {RkModalModel} from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import {RkSelectModel} from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import {Observable} from 'rxjs';
import {Agent, IpWithMask} from 'src/app/core/models/Agent';
import {AgentType} from 'src/app/core/models/AgentType';
import {BlackWhiteListProfile, SecurityProfile, SecurityProfileItem} from 'src/app/core/models/SecurityProfile';
import {AgentService} from 'src/app/core/services/agent.service';
import {AuthenticationService} from 'src/app/core/services/authentication.service';
import {InputIPService} from 'src/app/core/services/inputIPService';
import {PublicIPService} from 'src/app/core/services/publicIPService';
import {StaticMessageService} from 'src/app/core/services/staticMessageService';
import {ValidationService} from 'src/app/core/services/validation.service';
import {ProfileWizardComponent} from '../../shared/profile-wizard/page/profile-wizard.component';
import {DashBoardService, DistinctAgentResponse} from '../../../core/services/dashBoardService';
import { RkAlertService, RkNotificationService } from 'roksit-lib';


declare let $: any;

@Component({
  selector: 'app-publicip',
  templateUrl: './publicip.component.html',
  styleUrls: ['./publicip.component.sass'],
  providers: [DashBoardService]
})
export class PublicipComponent implements OnInit, AfterViewInit {

  // ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
  // ipv4v6Pattern = '((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))';
  publicIps: Agent[] = [];
  publicIpsFiltered: Agent[] = [];
  publicIpForm: UntypedFormGroup;
  startWizard = false;

  ipCidr = {
    isIPV4: true,
    ipRanges: [
      {value: 32, displayText: '32'},
      {value: 31, displayText: '31'},
      {value: 30, displayText: '30'},
      {value: 29, displayText: '29'},
      {value: 28, displayText: '28'},
      {value: 27, displayText: '27'},
      {value: 26, displayText: '26'},
      {value: 25, displayText: '25'},
      {value: 24, displayText: '24'}
    ],
    ipRangesV4: [
      {value: 32, displayText: '32'},
      {value: 31, displayText: '31'},
      {value: 30, displayText: '30'},
      {value: 29, displayText: '29'},
      {value: 28, displayText: '28'},
      {value: 27, displayText: '27'},
      {value: 26, displayText: '26'},
      {value: 25, displayText: '25'},
      {value: 24, displayText: '24'}
    ],

    ipRangesV6: [
      {value: 128, displayText: '128'},
      {value: 127, displayText: '127'},
      {value: 126, displayText: '126'},
      {value: 125, displayText: '125'},
      {value: 124, displayText: '124'},
      {value: 123, displayText: '123'},
      {value: 122, displayText: '122'},
      {value: 121, displayText: '121'},
      {value: 120, displayText: '120'}
    ]

  };


  ipValidations: boolean[] = [];
  sinkHoleValidation: boolean[] = [];

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

  detectedPublicIp: string;
  private publicIpObs: Observable<string>;

  activeAgents: DistinctAgentResponse = {items: []};

  constructor(
    private alertService: RkAlertService,
    private notification: RkNotificationService,
    private authService: AuthenticationService,
    private formBuilder: UntypedFormBuilder,
    private agentService: AgentService,
    private publicIpService: PublicIPService,
    private staticMessageService: StaticMessageService,
    private inputIpService: InputIPService,
    private dashboardService: DashBoardService
  ) {
    let role = this.authService.currentSession.currentUser.role;
    if (role.length)
      this.roleName = role[0].name

    this.publicIpObs = new Observable(subscriber => {
      if (this.detectedPublicIp) {
        subscriber.next(this.detectedPublicIp);


      } else {
        this.publicIpService.getMyIp().subscribe(result => {
          this.detectedPublicIp = result;
          subscriber.next(this.detectedPublicIp);


        }, (err) => {
          console.log(err);
          subscriber.next('');


        });
      }

    });

    this.getPublicIpsDataAndProfiles();


    this.publicIpForm = this.formBuilder.group({
      'agentName': ['', [Validators.required]],
      'ipType': ['', [Validators.required]],
      'blockMessage': ['', []],
      'dnsFqdn': ['', []],
      'ip0': ['', [Validators.required, Validators.maxLength(39), Validators.pattern(ValidationService.ipv4v6Pattern)]],
      'cyberXRayIp': ['', []]
    });

    this.defineNewAgentForProfile();

    this.publicIpObs.subscribe(x => console.log(`public ip is ${x}`));
  }

  ngOnInit() {
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

  ngAfterViewInit() {
  }

  getPublicIpsDataAndProfiles(type?: string) {

    this.selectedAgent = new Agent();

    this.publicIps = [];
    this.agentService.getAgentLocation().subscribe(res => {

      if ((res == null || res.length < 1) && this.roleName !== 'ROLE_USER' && this.tooltipGuideCounter < 1) {
        this.showNewIpForm().subscribe(x => {
          this.openTooltipGuide();
        });

      } else {
        res.forEach(r => {
          if (r.agentType && r.agentType.toString() === AgentType.LOCATION.toString()) {
            this.publicIps.push(r);
          }
        });
        this.publicIpsFiltered = this.publicIps;

        this.dashboardService.getDistinctAgent({duration: 24}).subscribe(x => {
          x.items.forEach(y => this.activeAgents.items.push(y));
        });
      }
    });

    this.agentService.getSecurityProfiles().subscribe(res => {
      this.securityProfiles = res;

      this.fillSecurityProfilesArray();
    });
  }

  changbeProfile($event) {
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

  private fillCIDR(mask: number) {
    const isIPV4 = mask <= 32;
    this.ipCidr.isIPV4 = isIPV4;
    return isIPV4 ? this.ipCidr.ipRangesV4.map(i => ({
      value: i.value,
      displayText: i.displayText,
      selected: i.value === mask
    })) : this.ipCidr.ipRangesV6.map(i => ({
      value: i.value,
      displayText: i.displayText,
      selected: i.value === mask
    }));
  }

  changeIpCidr(isIPV4: boolean) {
    if (this.ipCidr.isIPV4 !== isIPV4) {

      this.fillCIDR(isIPV4 ? 32 : 128);
      return true;
    }
    return false;
  }

  checkIPNumberForAgent(event: KeyboardEvent | FocusEvent, inputValue: IpWithMask, index: number) {

    const isIPV4 = this.inputIpService.checkIPNumber(event, inputValue.baseIp, this.ipValidations, index);

    if (isIPV4 != null) {
      this.checkMask(isIPV4, inputValue);
    }

  }

  /*   hasOneOfChars(input: string, chars: string[]) {
      for (let ab = 0; ab < input.length; ++ab) {
        for (let ac = 0; ac < chars.length; ++ac) {
          if (input[ab] == chars[ac]) {
            return true;
          }

        }
      }
      return false;
    } */

  /*   checkIPNumber(event: KeyboardEvent, inputValue: string) {


      let isIPV4 = true;

      const specialChars = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];

      const ipv4Chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];

      const ipv6Chars = ['A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f', ':'];
      let allowedChars = [];
      allowedChars = allowedChars.concat(ipv6Chars).concat(ipv4Chars).concat(specialChars);
      let isValid = false;

      for (let i = 0; i < specialChars.length; i++) {
        if (specialChars[i] == event.key) {
         return null;
        }
      }

      // check keydown char
      for (let i = 0; i < allowedChars.length; i++) {
        if (allowedChars[i] == event.key) {
          isValid = true;
          break;
        }
      }

      if (isValid) {
        const isSpecialChar = specialChars.find(x => x == event.key);
        if (!isSpecialChar) {
          inputValue = (inputValue ? inputValue : '') + event.key;
        }
        const isipV6 = this.hasOneOfChars(inputValue, ipv6Chars);
        const isipV4 = this.hasOneOfChars(inputValue, ['.']);

        if (isipV4 && !isipV6) {// ipv4
           isIPV4 = true;
          const octets = inputValue.split(/[.]/g);
          if (octets.length && octets[octets.length - 1] == '') {
            octets.splice(octets.length - 1, 1);
          }
          if (octets.length > 4) {
            isValid = false;
          }
          if (octets.length == 4 && inputValue.endsWith('.')) {
          isValid = false;
          }
          octets.forEach(x => {
            if (x.length > 3 || x.length == 0) {
              isValid = false;
            }
            if (Number(x) < 0 || Number(x) > 255) {
              isValid = false;
            }
          });



        } else {

          isIPV4 = false;
          for (let i = 0; i < ipv6Chars.length; i++) {
            if ('.' == event.key) {
              isValid = false;
              break;
            }
          }
          const octets = inputValue.split(/[:]/g);

          if (octets.length > 8) {
            isValid = false;
          }

          octets.forEach(x => {
            if (x.length > 4) {
              isValid = false;
            }
          });
          const len = inputValue.length;
          if (len - 3 >= 0) {
            if (inputValue[len - 3] == ':' && inputValue[len - 2] == ':' && inputValue[len - 1] == ':') {
            isValid = false;
            }
          }


        }


      }
      console.log(`ipv4:${isIPV4} and isValid:${isValid}`);

      if (!isValid) {
        event.preventDefault();
        return null;
      }
      return isIPV4;

    } */

  checkIPNumberForSinkhole(event: KeyboardEvent | FocusEvent, inputValue: string) {

    const isIPV4 = this.inputIpService.checkIPNumber(event, inputValue, this.sinkHoleValidation, 0);


  }


  checkMask(isIPV4: boolean, inputValue: IpWithMask) {

    const isIpTypeChanged = this.changeIpCidr(isIPV4);
    if (isIpTypeChanged) {

      inputValue.mask = isIPV4 ? 32 : 128;
    }
  }

  showProfileEditWizard(id: number, t: boolean = true) {
    this.currentStep = 1;
    let agent;
    if (t) {
      agent = this.publicIps.find(p => p.id === id);
    } else {
      agent = this.publicIps.find(p => p.rootProfile.id === id);
    }

    if (agent) {
      if (agent.rootProfile && agent.rootProfile.id > 0) {

        this.saveMode = 'ProfileUpdate';
        this.profileWizard.saveMode = this.saveMode;
        this.selectedAgent = JSON.parse(JSON.stringify(agent));

        this.fillSecurityProfilesArray(agent);

       

        this.startWizard = true;

        this.profileModal.toggle();
      } else {
        this.notification.warning(this.staticMessageService.profileCannotFind);
      }
    }
  }

  searchChanged() {
    this.publicIpsFiltered = this.publicIps.filter(x => {
      const searchKey = this.searchKey.trim().toLocaleLowerCase();

      const agentAlias = x.agentAlias ? x.agentAlias.toLocaleLowerCase().includes(searchKey) : false;
      const ipType = x.staticSubnetIp ? 'static'.includes(searchKey) : 'dynamic'.includes(searchKey);
      const ipAdresses = x.staticSubnetIp ? x.staticSubnetIp.some(y => y.baseIp.toLocaleLowerCase().includes(searchKey)) : x.dynamicIpDomain ? x.dynamicIpDomain.toLocaleLowerCase().includes(searchKey) : false;
      const profile = x.rootProfile && x.rootProfile.name ? x.rootProfile.name.toLocaleLowerCase().includes(searchKey) : false;

      return agentAlias || ipType || ipAdresses || profile;
    });
  }

  openPublicForm() {
    this.showNewIpForm().subscribe();
  }

  showNewIpForm() {
    this.isNewItemUpdated = false;
    this.selectedIp = new Agent();
    this.selectedIp.logo = null;
    this.selectedIp.staticSubnetIp = [];


    const ip0 = {} as IpWithMask;
    // wait for detecting public ip
    return this.publicIpObs.pipe(map(ip => {

      const findedMyPublicIp = this.publicIps.some(x => {
        if (x.staticSubnetIp) {
          return x.staticSubnetIp.some(y => y.baseIp === ip);
        }
      });

      if (!findedMyPublicIp) {
        ip0.baseIp = ip;
      }
      if (!ip0.baseIp || isip.v4(ip0.baseIp)) {
        ip0.mask = 32;
        ip0.ranges = this.fillCIDR(32);
      } else {
        ip0.mask = 128;
        ip0.ranges = this.fillCIDR(128);
      }

      this.selectedIp.staticSubnetIp.push(ip0);

      this.securityProfilesForRkSelect = this.securityProfilesForRkSelect.map(x => {
        return {...x, selected: false};
      });

      this.ipType = 'staticIp';

      this.agentModal.toggle();


    }));
  }

  hideNewWizard() {
    this.getPublicIpsDataAndProfiles();
  }

  showEditWizard(id: string | number) {

    this.isNewItemUpdated = true;
    const selectedUpdateIp = this.publicIps.find(p => p.id === Number(id));

    this.selectedIp = JSON.parse(JSON.stringify(selectedUpdateIp));

    if (this.selectedIp && this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length > 0) {

      for (let i = 0; i < this.selectedIp.staticSubnetIp.length; i++) {
        this.selectedIp.staticSubnetIp[i].ranges = this.fillCIDR(this.selectedIp.staticSubnetIp[i].mask);
        const cname = 'ip' + i;
        this.publicIpForm.addControl(cname, new UntypedFormControl(cname, Validators.required));
        this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(39), Validators.pattern(ValidationService.ipv4v6Pattern)]);
        this.publicIpForm.controls[cname].updateValueAndValidity();
      }

    } else {
      this.selectedIp.staticSubnetIp = [];
      // this.selectedIp.staticSubnetIp.push({} as IpWithMask);

    }

    if (this.selectedIp.dynamicIpDomain) {
      this.ipType = 'dynamicIp';
    } else {
      this.ipType = 'staticIp';


      if (!this.selectedIp.staticSubnetIp.length) {
        const sub = this.publicIpObs.subscribe(ip => {
          if (ip) {
            this.selectedIp.staticSubnetIp.push({baseIp: ip, mask: 32, ranges: this.fillCIDR(32)});
          }
        });
      }
    }

    this.saveMode = '';
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
        console.log(error);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }

    function imageExists(url, callback) {
      const img = new Image();
      img.onload = function () {
        callback(true);
      };
      img.onerror = function () {
        callback(false);
      };
      img.src = url;
    }
  }

  clearImage() {
    this.selectedIp.logo = null;
  }

  deletePublicIp(id: number) {
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.selectedPublicIpAndItsSettingsWillBeDeletedMessage}!`).subscribe(
      res => {
        if (res) {
          this.agentService.deleteAgent(id).subscribe(res2 => {

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
      // this.selectedIp.dynamicIpDomain = null;
      this.publicIpForm.controls['dnsFqdn'].clearValidators();
      this.publicIpForm.controls['dnsFqdn'].updateValueAndValidity();
      if (!this.selectedIp.staticSubnetIp.length) {
        const sub = this.publicIpObs.subscribe(ip => {
          if (ip) {
            this.selectedIp.staticSubnetIp.push({baseIp: ip, mask: 32, ranges: this.fillCIDR(32)});
          }
        });
      }
    }
  }

  addIpRangeToList() {
    if (this.selectedIp.staticSubnetIp.length < 10) {
      const ip0 = {} as IpWithMask;
      ip0.mask = 32;
      ip0.ranges = this.fillCIDR(32);
      this.selectedIp.staticSubnetIp.push(ip0);
      const cname = 'ip' + (this.selectedIp.staticSubnetIp.length - 1);
      this.publicIpForm.addControl(cname, new UntypedFormControl(cname, Validators.required));
      this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(39), Validators.pattern(ValidationService.ipv4v6Pattern)]);
      this.publicIpForm.controls[cname].updateValueAndValidity();
    }
  }

  removeElementFromIpList(index: number) {
    const cname = 'ip' + index;
    this.selectedIp.staticSubnetIp.splice(index, 1);
    this.publicIpForm.controls[cname].clearValidators();
    this.publicIpForm.controls[cname].updateValueAndValidity();
    if (this.ipValidations.length > index) {
      this.ipValidations.splice(index, 1);
    }
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

    this.securityProfilesForRkSelect = this.securityProfilesForRkSelect.map(x => {
      return {...x, selected: x.value === id};
    });
  }

  savePublicIp() {
    if (!this.validatePublicIpForm()) {
      return;
    }

    const selectedProfile = this.securityProfilesForRkSelect.find(x => x.selected);

    if (selectedProfile) {
      this.selectedIp.rootProfile = this.securityProfiles.find(x => x.id === selectedProfile.value);
    }
    const cloned = JSON.parse(JSON.stringify(this.selectedIp)) as Agent;

    if (this.ipType === 'staticIp') {
      cloned.dynamicIpDomain = null;
    } else {
      cloned.staticSubnetIp = null;
      cloned.dynamicIpDomain = cloned.dynamicIpDomain?.trim();
    }

    this.agentService.saveAgentLocation(cloned).subscribe(res => {

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
      this.notification.warning(this.staticMessageService.pleaseFillName);
      return false;
    } else if (this.ipType === 'staticIp' && !this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length < 1) {

      this.notification.warning(this.staticMessageService.pleaseEnterValidIp);
      return false;
    } else if (this.ipType === 'dynamicIp' && (!this.selectedIp.dynamicIpDomain || !isDomain)) {
      this.notification.warning(this.staticMessageService.enterValidDomainMessage);
      return false;
    } else if (!this.ipType) {
      return false;
    }

    if (this.ipType === 'staticIp' && this.selectedIp.staticSubnetIp && this.selectedIp.staticSubnetIp.length > 0) {
      for (let i = 0; i < this.selectedIp.staticSubnetIp.length; i++) {
        const e = this.selectedIp.staticSubnetIp[i];
        if (e.baseIp == null || e.mask === 0) {
          this.notification.warning(this.staticMessageService.pleaseEnterValidIpAndMask);
          return false;
        }
        if (!isip(e.baseIp)) {
          this.notification.warning(this.staticMessageService.pleaseEnterValidIpAndMask);
          return false;
        }
      }
      if (this.selectedIp.cyberXRayIp && !isip(this.selectedIp.cyberXRayIp)) {
        this.notification.warning(this.staticMessageService.pleaseEnterValidIp);
        return false;
      }
    }

    return true;
  }

  rkSelectButtonClicked($event: { clicked: boolean }) {
    this.saveMode = 'NewProfile';
    this.profileWizard.saveMode = this.saveMode;
    this.selectedAgent = JSON.parse(JSON.stringify(this.selectedIp));
    this.selectedAgent.rootProfile = new SecurityProfile();
    this.currentStep = 1;

    this.profileModal.toggle();
  }

  getIPDetail(ip: IpWithMask) {
    return this.inputIpService.getIPDetails(ip);
  }

  profileModalClosed(event) {
    if (event.closed) {
      this.securityProfileChanged(this.selectedAgent.rootProfile.id);
    }
  }

  isActive(id: number) {
    return this.activeAgents.items.some(a => a.id === id);
  }
}
