
import {of as observableOf, Observable, Subscriber} from 'rxjs';
import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RkModalModel} from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import {RkSelectModel} from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import {Agent} from 'src/app/core/models/Agent';
import {AgentType} from 'src/app/core/models/AgentType';
import {Box} from 'src/app/core/models/Box';
import {AgentGroup, AgentInfo, DeviceGroup} from 'src/app/core/models/DeviceGroup';
import {BlackWhiteListProfile, SecurityProfile, SecurityProfileItem} from 'src/app/core/models/SecurityProfile';
import {AgentService} from 'src/app/core/services/agent.service';
import {AlertService} from 'src/app/core/services/alert.service';
import {BoxService} from 'src/app/core/services/box.service';
import {NotificationService} from 'src/app/core/services/notification.service';
import {StaticMessageService} from 'src/app/core/services/staticMessageService';
import {MacAddressFormatterPipe} from 'src/app/modules/shared/pipes/MacAddressFormatterPipe';
import {TranslatorService} from '../../../core/services/translator.service';
import {ADIntegrationService} from '../../../core/services/adintegration.service';
import * as moment from 'moment';
import {ADUserDHCP} from '../../../core/models/ADUserDHCP';
import {LDAPUserGroup} from '../../../core/models/LdapUserGroup';
import {AgentRule, AgentRuledBy} from '../../../core/models/AgentRule';
import {ProfileWizardComponent} from '../../shared/profile-wizard/page/profile-wizard.component';


export function validLength(val: string) {
  return val.trim().length > 0;
}

export class GroupAgentModel {
  agentGroup: AgentGroup;
  securityProfile: SecurityProfile;
  agents: Agent[];
  memberCounts? = 0;
  name: string;
}

@Component({
  selector: 'app-devices',
  templateUrl: 'devices.component.html',
  styleUrls: ['devices.component.sass'],
  providers: [MacAddressFormatterPipe]
})
export class DevicesComponent implements OnInit {

  constructor(private agentService: AgentService,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private boxService: BoxService,
              private notification: NotificationService,
              private staticMessageService: StaticMessageService,
              private translateService: TranslatorService,
              private adIntegrationService: ADIntegrationService) {

    this.loadClients();
  }
  ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';

  private _registereds: Agent[] = [];
  registereds: Agent[] = [];

  private _unregistereds: AgentInfo[] = [];
  unregistereds: AgentInfo[] = [];

  devicesForGroup: AgentInfo[] = [];
  deviceGroup: DeviceGroup = new DeviceGroup();

  private _groupList: GroupAgentModel[] = [];
  groupList: GroupAgentModel[] = [];
  agentGroups: AgentGroup[] = [];

  boxForm: FormGroup;
  isNewProfileSelected = false;
  private _boxes: Box[] = [];
  boxes: Box[] = [];
  selectedAgent: Agent = new Agent();
  securityProfiles: SecurityProfile[] = [];
  startWizard: boolean;
  saveMode: String;
  isNewItemUpdated = true;
  currentStep = 0;

  deviceCache: AgentInfo[] = [];

  previousGroupId = 0;
  currentCss = '';

  activeTabNumber = 0;
  selectedGroup = 'all';
  category = '';
  categoryOptions: RkSelectModel[] = [
    {
      displayText: 'All Groups',
      value: 'all',
      selected: true
    },
    {
      displayText: 'Groups',
      value: 'group'
    },
    {
      displayText: 'Ungroups',
      value: 'ungroup'
    }
  ];

  clickedSelect(event) {
    this.selectedGroup = event;
  }


  @ViewChild('editClientDeviceModal') editClientDeviceModal: RkModalModel;


  @ViewChild('groupAgentModal') groupAgentModal: RkModalModel;

  selectedGroupAgent: GroupAgentModel = {
    agentGroup: {}
  } as GroupAgentModel;

  securityProfilesForSelect: RkSelectModel[] = [];

  groupListForSelect: RkSelectModel[] = [];

  @ViewChild('changeGroupModal') changeGroupModal: RkModalModel;

  selectedGroupMembers: Agent[] | AgentInfo[] = [];

  showGB = false;

  groupName = '';
  groupNameBeforeEdit = '';


  @ViewChild('selectedBoxModal') selectedBoxModal: RkModalModel;

  selectedBox: Box;

  enable: 'enable' | 'disabled';

  selectedGroupId: number | string;

  selectedProfileId: number | string = 41;
  selectedProfileIdBeforeEdit: number | string;

  selectedAgentGroupType: 'create' | 'edit' = 'create';

  localDNSRelaySearch: string;

  groupAgentSearch: string;

  groupMemberSearch: string;

  ungroupMemberSearch: string;

  @ViewChild('ruleModal') ruleModal: RkModalModel;
  @ViewChild('profileModal') profileModal: RkModalModel;
  @ViewChild('profileWizard') profileWizard: ProfileWizardComponent;

  isProfileSaved = false;

  selectedRule: AgentRule = {agent: {rootProfile: {}}} as AgentRule;
  ruledByForSelect: RkSelectModel[];
  private static RULEDBY_LIST = [AgentRuledBy.ADUSR, AgentRuledBy.ADGRP, AgentRuledBy.MAC, AgentRuledBy.LOCIP, AgentRuledBy.BOX];

  selectedRuleOrder = 1;

  adClients: ADUserDHCP[] = [];
  adClientsFiltered: ADUserDHCP[] = [];
  adClientsPage: ADUserDHCP[] = [];
  adClientsFilterText = '';
  adClientTableViewCnt = 10;
  adClientTableCurrentPage = 1;

  adGroups: LDAPUserGroup[] = [];
  adGroupsFiltered: LDAPUserGroup[] = [];
  adGroupsPage: LDAPUserGroup[] = [];
  adGroupsFilterText = '';
  adGroupTableViewCnt = 10;
  adGroupTableCurrentPage = 1;

  boxFilterText = '';
  boxPage: Box[] = [];

  ruleUserTableViewCnt = 10;
  ruleUserTableCurrentPage = 1;
  ruleUsers: ADUserDHCP[] = [];
  ruleUsersFiltered: ADUserDHCP[] = [];
  ruleUsersPage: ADUserDHCP[] = [];
  ruleUserFilterText = '';

  ruleGroupTableViewCnt = 10;
  ruleGroupTableCurrentPage = 1;
  ruleGroups: LDAPUserGroup[] = [];
  ruleGroupsFiltered: LDAPUserGroup[] = [];
  ruleGroupsPage: LDAPUserGroup[] = [];
  ruleGroupFilterText = '';

  ruleHostTableViewCnt = 10;
  ruleHostTableCurrentPage = 1;
  ruleHosts: ADUserDHCP[] = [];
  ruleHostsPage: ADUserDHCP[] = [];

  ruleLocIpTableViewCnt = 10;
  ruleLocIpTableCurrentPage = 1;
  ruleLocIps: ADUserDHCP[] = [];
  ruleLocIpsPage: ADUserDHCP[] = [];

  ruleBoxTableViewCnt = 10;
  ruleBoxTableCurrentPage = 1;
  ruleBox: Box[] = [];
  ruleBoxPage: Box[] = [];

  private _adClientFilter = '';
  set adClientFilter(val) {
    this._adClientFilter = val;
    this.adClientsFiltered = this.adClients.filter(c => {
      if (val === 'user')
        return !this.isNullOrEmptyOrNA(c.adUser);
      else if (val === 'host')
        return !this.isNullOrEmptyOrNA(c.host);
      else
        return true;
    });
  }
  get adClientFilter() {
    return this._adClientFilter;
  }

  loadDevices(subs?: Subscriber<any>) {
    this.agentService.getSecurityProfiles().subscribe(res => {
      this.securityProfiles = res;

      this.securityProfilesForSelect = [];

      this.securityProfiles.forEach((elem, index) => {
        let isSelected = false;
        if (this.saveMode === 'NewProfile') {
          if (index === this.securityProfiles.length - 1) {
            isSelected = true;
          }
        } else {
          isSelected = (this.selectedProfileId == elem.id);
        }

        if (isSelected) {
          this.selectedRule.agent.rootProfile = elem;
        }

        this.securityProfilesForSelect.push({
          displayText: elem.name,
          value: elem.id,
          selected: isSelected
        });

      });
    });

    this.adIntegrationService.getBoxes().subscribe(res => {
      this.boxes = res;
      this.boxes.forEach(b =>  {
        const members = this.adClients.filter(c => c.boxSerial === b.boxSerial);
        b.clientCount =  members.length;
        const lst = members.map(m => m.lastValidTime).sort().reverse()[0];
        if (lst)
          b.lastSyncTime = moment(lst).add(-1, 'd').format('YYYY-MM-DD HH:mm:ss');
      });
      // this.ruleBox = this.boxes.filter(b => b.rules?.length);
      this.filterTableData('box');
      // this.filterTableData('ruleBox');
      if (subs)
        subs.next('b');
    });

    // this.agentService.getRegisteredDevices().subscribe(res => {
    //   this.groupList = [];
    //   this.groupListForSelect = [];
    //   res.forEach((r, index) => {
    //     if (r.agentGroup && r.agentGroup.id > 0) {
    //       //fill agent groups
    //       const group = this.agentGroups.find(x => x.id == r.agentGroup.id);
    //       if (!group)
    //         this.agentGroups.push({ id: r.agentGroup.id, groupName: r.agentGroup.groupName });
    //
    //
    //       const finded = this.groupList.find(g => g.agentGroup.groupName === r.agentGroup.groupName);
    //       if (!finded) {
    //         this.groupList.push({
    //           name: r.agentGroup.groupName,
    //           agentGroup: r.agentGroup,
    //           securityProfile: r.rootProfile,
    //           agents: [r]
    //         });
    //
    //         this.groupListForSelect.push({
    //           name: r.agentGroup.groupName,
    //           displayText: r.agentGroup.groupName,
    //           value: r.agentGroup.id,
    //           selected: index === 0
    //         });
    //
    //       } else {
    //         finded['memberCounts']++;
    //         finded.agents.push(r);
    //       }
    //     }
    //   });
    //
    //   this._groupList = JSON.parse(JSON.stringify(this.groupList));
    //
    //   this.registereds = res.sort((x, y) => {
    //     if (!x.agentGroup) {
    //       return 1;
    //     } else if (!y.agentGroup) {
    //       return -1;
    //     } else if (x.agentGroup.groupName > y.agentGroup.groupName) {
    //       return 1;
    //     }
    //     return -1;
    //   });
    //
    //   this._registereds = this.deepCopy(this.registereds);
    // });
    //
    // this.agentService.getUnregisteredDevices().subscribe(res => {
    //   this.unregistereds = [];
    //   if (res && res instanceof Array) {
    //     res.forEach(d => {
    //       const a = new AgentInfo();
    //       a.agentType = AgentType.DEVICE;
    //       a.mac = d.mac;
    //       a.agentAlias = d.hostName;
    //       this.unregistereds.push(a);
    //     });
    //
    //     this._unregistereds = this.deepCopy(this.unregistereds);
    //   }
    // });
  }

  closeGroupAgentModal($event) {
    if ($event.closed) {
      this.selectedGroupAgent = {
        agentGroup: {}
      } as GroupAgentModel;
    }
  }

  createNewGroup() {

    this.selectedGroupAgent = new GroupAgentModel();
    this.selectedProfileId = 41;
    this.groupName = '';
    this.groupNameBeforeEdit = '';
    this.securityProfileForSelectInit(this.selectedProfileId);
    const defaultAgentGroup = this.agentGroups.find(x => x);
    this.groupListForSelectInit(defaultAgentGroup?.groupName || '')

    this.groupAgentModal.toggle();
  }

  editGroupAgentModal(groupAgent: GroupAgentModel) {
    this.selectedGroupAgent = this.deepCopy(groupAgent);

    this.groupName = this.selectedGroupAgent.agentGroup.groupName;
    this.groupNameBeforeEdit = this.selectedGroupAgent.agentGroup.groupName;

    this.selectedGroupAgent.agents.forEach(elem => {
      elem.selected = true;
    });
    this.selectedProfileIdBeforeEdit = this.selectedGroupAgent.securityProfile.id;
    this.selectedProfileId = this.selectedGroupAgent.securityProfile.id;


    this.securityProfileForSelectInit(this.selectedProfileId);
    const defaultAgentGroup = this.agentGroups.find(x => x.groupName == this.groupName);
    this.groupListForSelectInit(defaultAgentGroup?.groupName || '')
    this.groupAgentModal.toggle();
  }

  editGroupAgentSelectProfile(id) {
    this.selectedProfileId = id;
  }

  ngOnInit() {
    this.boxForm = this.formBuilder.group({
      boxName: ['', [Validators.required]],
      blockMessage: [''],
      captivePortalIp: ['']
    });
  }

  openTooltipGuide() {
    // tooltip istenirse eklenecek
  }

  saveBox() {
    if (this.isBoxFormValid()) {
      this.boxService.saveBox(this.selectedBox).subscribe(res => {
        this.selectedBoxModal.toggle();
        this.notification.success(this.staticMessageService.savedAgentBoxMessage);

        this.loadDevices();

      });
    } else {
      this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
    }
  }

  private isBoxFormValid() {
    return validLength(this.selectedBox.host) && this.selectedBox.agent.rootProfile.id > 0;
  }

  removeDeviceFromRegistereds(id: number) {
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.settingsForThisDeviceWillBeDeletedMessage}!`).subscribe(
      res => {
        if (res) {

          this.agentService.deleteAgentDevice([id]).subscribe(_res => {
            this.notification.success(this.staticMessageService.deletedDeviceMessage);
            this.loadDevices();
          });
        }
      }
    );
  }

  deleteDeviceGroup(groupName: string) {
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.settingsForThisGroupWillBeDeletedMessage}!`).subscribe(
      res => {
        if (res) {
          const ids = [];

          for (let i = 0; i < this.registereds.length; i++) {
            const e = this.registereds[i];
            if (e.agentGroup && e.agentGroup.groupName === groupName) {
              ids.push(e.id);
            }
          }

          this.agentService.deleteAgentDevice(ids).subscribe(_res => {

            this.closeModal();
            this.notification.success(this.staticMessageService.deletedDevicesMessage);
            this.loadDevices();

          });
        }
      }
    );
  }

  deleteBox(id: number) {
    if (id) {
      this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.agentOfThisBoxWillBeDeletedMessage}!`).subscribe(
        res => {
          if (res) {
            this.boxService.deleteBox(id).subscribe(resu => {

              this.notification.success(this.staticMessageService.deletedAgentBoxMessage);
              this.loadDevices();

            });
          }
        }
      );
    }
  }



  checkKeydown($event: KeyboardEvent) {
    this.checkIPNumber($event, this.selectedBox.agent.captivePortalIp);
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

  closeModal() { }

  groupMembersTableCheckboxChanged($event) {
    this.registereds.forEach(elem => elem.selected = $event);
  }

  ungroupMemberTableCheckboxChanged($event) {
    this.unregistereds.forEach(elem => elem.selected = $event);
  }

  tableCheckboxChanged($event) {
    if (this.selectedGroup === 'group') {
      this.groupMembersTableCheckboxChanged($event);
    } else if (this.selectedGroup === 'ungroup') {
      this.ungroupMemberTableCheckboxChanged($event);
    } else {
      this.groupMembersTableCheckboxChanged($event);
      this.ungroupMemberTableCheckboxChanged($event);
    }
  }

  // can be set value true for selected id
  securityProfileForSelectInit(id) {
    this.securityProfilesForSelect = this.securityProfilesForSelect.map(elem => {
      if (id === elem.value) {
        elem.selected = true;
      }
      else elem.selected = false;
      return elem;
    });
  }
  groupListForSelectInit(name) {
    this.groupListForSelect = this.groupListForSelect.map(elem => {
      if (name === elem.name) {
        elem.selected = true;
      }
      else elem.selected = false;
      return elem;
    });
  }


  selectRow(ev: boolean, item) { }

  changeTableGroup(type: 'edit' | 'create') {
    let selecteds: Agent[] | AgentInfo[];

    if (type === 'edit') {
      selecteds = this.registereds.filter(x => x.selected);
    } else {
      selecteds = this.unregistereds.filter(x => x.selected);
    }

    if (!selecteds.length) {
      this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
      return;
    }

    this.selectedAgentGroupType = type;
    this.selectedGroupMembers = selecteds;
    this.changeGroupModal.toggle();
  }

  get getEditDisabled() {
    return this.registereds.filter(x => x.selected).length === 0;
  }

  get getCreateDisabled() {
    return this.unregistereds.filter(x => x.selected).length === 0;
  }

  groupNameKeyup($event) {
    if ($event.keyCode === 13) {
      // group ekleme yapılacak.
    }
  }

  saveGroupAgent() {

    const groupName = this.groupName;
    const selectedProfile = this.securityProfiles.find(x => x.id === Number(this.selectedProfileId));

    const selectedGroupAgentsAdded = this.unregistereds.filter(x => x.selected);

    let selectedGroupAgentsRemoved: AgentInfo[] = [];
    let selectedGroupAgentsExits: AgentInfo[] = [];

    if (this.selectedGroupAgent.agents) {
      selectedGroupAgentsRemoved = this.selectedGroupAgent.agents.filter(x => !x.selected).map(x => {
        return {
          id: x.id,
          agentAlias: x.agentAlias,
          agentType: x.agentType,
          blockMessage: x.blockMessage,
          mac: x.mac,
          rootProfile: x.rootProfile,
          agentGroup: x.agentGroup
        } as AgentInfo;
      });

      selectedGroupAgentsExits = this.selectedGroupAgent.agents.filter(x => x.selected).map(x => {
        return {
          id: x.id,
          agentAlias: x.agentAlias,
          agentType: x.agentType,
          blockMessage: x.blockMessage,
          mac: x.mac,
          rootProfile: x.rootProfile,
          agentGroup: x.agentGroup
        } as AgentInfo;
      });
    }
    if (this.groupName.trim().length === 0) {
      this.notification.warning(this.staticMessageService.needsGroupNameMessage);
      return;
    }
    if (!selectedProfile || selectedProfile?.id <= 0) {
      this.notification.warning(this.staticMessageService.needsToSelectSecurityProfileMessage);
      return;
    }
    const groupNameChanged = this.groupName !== this.groupNameBeforeEdit;
    const securityProfileChanged = this.selectedProfileIdBeforeEdit !== selectedProfile?.id;
    const selectionOfGroupMembedsChanged = (selectedGroupAgentsAdded.length > 0 || selectedGroupAgentsRemoved.length > 0);
    if (!groupNameChanged && !securityProfileChanged && !selectionOfGroupMembedsChanged) {
      this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
      return;
    }

    if (this.groupNameBeforeEdit === '' && !selectionOfGroupMembedsChanged) {
      this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
      return;
    }

    const deviceGroup = new DeviceGroup();

    deviceGroup.agentGroup = { id: 0, groupName: groupName };

    deviceGroup.agents = selectedGroupAgentsAdded.map(x => x);
    selectedGroupAgentsExits.forEach(x => deviceGroup.agents.push(x));

    let observable: Observable<any>;
    if (selectedGroupAgentsRemoved.length)
      observable = this.agentService.deleteAgentDevice(selectedGroupAgentsRemoved.map(x => x.id))
    else
      observable = observableOf([]);

    observable.subscribe(x => {

      deviceGroup.rootProfile = selectedProfile;
      if (deviceGroup.agents.length) {
        this.agentService.saveAgentDevice(deviceGroup).subscribe(result => {

          this.groupAgentModal.toggle();

          this.notification.success(this.staticMessageService.savedDevicesMessage);

          this.loadDevices();

        });
      } else {
        this.groupAgentModal.toggle();
        this.notification.success(this.staticMessageService.savedDevicesMessage);
        this.loadDevices();
      }
    })

  }

  editBox(box: Box) {

    this.selectedBox = this.deepCopy(box);
    this.securityProfileForSelectInit(this.selectedBox?.agent?.rootProfile?.id);
    const defaultAgentGroup = this.agentGroups.find(x => x);
    this.groupListForSelectInit(this.selectedBox?.agent?.agentGroup?.id || defaultAgentGroup?.id || 0)
    this.selectedBoxModal.toggle();

  }

  private deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  cleanBoxForm() {
    this.selectedBox.host = '';
    this.selectedBox.agent.blockMessage = '';
    this.selectedBox.agent.captivePortalIp = '';
  }

  changeGroupModalApplyClick() {

    // const selectedProfile =  this.securityProfiles.find(x => x.id === this.selectedProfileId);

    const selectedGroup = this.groupList.find(x => x.agentGroup.id === this.selectedGroupId);
    const selectedProfile = selectedGroup?.securityProfile;
    const selectedAgents = this.selectedGroupMembers?.filter(x => x.selected);

    const deviceGroup = new DeviceGroup();
    deviceGroup.agentGroup = selectedGroup.agentGroup;
    deviceGroup.rootProfile = selectedProfile;
    deviceGroup.agents = selectedAgents;

    if (!selectedProfile || !selectedGroup || !selectedAgents || selectedAgents.length === 0) {
      this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);

      return;
    }

    this.agentService.saveAgentDevice(deviceGroup).subscribe(result => {
      this.changeGroupModal.toggle();
      this.notification.success(this.staticMessageService.savedDevicesMessage);
      this.loadDevices();
    });


  }

  localDNSRelaySearchChanged() {
    this.boxes = this._boxes.filter(x => {
      const term = this.localDNSRelaySearch.trim().toLocaleLowerCase();

      const host = x.host.toLocaleLowerCase().includes(term);
      const profile = x.agent.rootProfile.name.toLocaleLowerCase().includes(term);
      const captivePortalIp = x.agent.captivePortalIp ? x.agent.captivePortalIp.includes(term) : false;

      return host || profile || captivePortalIp;
    });
  }

  groupAgentSearchChanged() {
    this.groupList = this._groupList.filter(x => {
      const term = this.groupAgentSearch.trim().toLocaleLowerCase();

      const name = x.agentGroup.groupName.toLocaleLowerCase().includes(term);
      const profile = x.securityProfile.name.toLocaleLowerCase().includes(term);

      return name || profile;
    });
  }

  groupMemberSearchChanged() {
    this.registereds = this._registereds.filter(x => {
      const term = this.memberSearch.trim().toLocaleLowerCase();
      //    const term = this.groupMemberSearch.trim().toLocaleLowerCase();

      const agentAlias = x.agentAlias.toLocaleLowerCase().includes(term);
      const mac = x.mac.toLocaleLowerCase().match(/.{1,2}/g).join(':').includes(term);
      const agentGroup = x.agentGroup ? x.agentGroup?.groupName?.toLocaleLowerCase()?.includes(term) : false;
      const rootprofile = x.rootProfile ? x.rootProfile?.name?.toLocaleLowerCase()?.includes(term) : false;

      return agentAlias || mac || agentGroup || rootprofile;
    });

  }

  ungroupMemberSearchChanged(search?: boolean) {
    this.unregistereds = this._unregistereds.filter(x => {
      const term = this.memberSearch.trim().toLocaleLowerCase();
      //     const term =  this.ungroupMemberSearch.trim().toLocaleLowerCase();

      const agentAlias = x.agentAlias.toLocaleLowerCase().includes(term);
      const mac = x.mac.toLocaleLowerCase().match(/.{1,2}/g).join(':').includes(term);

      return agentAlias || mac;
    });
  }

  memberSearch: string;
  memberSearchChanged() {
    if (this.selectedGroup === 'all') {
      this.ungroupMemberSearchChanged();
      this.groupMemberSearchChanged();
    } else if (this.selectedGroup === 'group') {
      this.groupMemberSearchChanged();
    } else if (this.selectedGroup === 'ungroup') {
      this.ungroupMemberSearchChanged();
    }
  }

  editClientDeviceName: string;
  editClientDeviceMacAdress: string;
  editClientSelectedGroupId: string;
  editClientDeviceType: 'group' | 'nogroup';
  editSelectedType: 'group' | 'securityProfile' = 'group';
  selectedDeviceForEdit: Agent | AgentInfo = new AgentInfo();

  editClientDevice(device: Agent | AgentInfo) {

    this.selectedDeviceForEdit = this.deepCopy(device);

    if (this.selectedDeviceForEdit.agentGroup && this.selectedDeviceForEdit.agentGroup.groupName) {
      this.editSelectedType = 'group';


      this.securityProfileForSelectInit(this.selectedDeviceForEdit.rootProfile?.id || 41);
      const defaultAgentGroup = this.agentGroups.find(x => x);
      this.groupListForSelectInit(this.selectedDeviceForEdit.agentGroup?.groupName || defaultAgentGroup?.groupName || '')

    } else if (this.selectedDeviceForEdit.rootProfile) {
      this.editSelectedType = 'securityProfile';

      if (!this.selectedDeviceForEdit.rootProfile?.id)
        this.selectedDeviceForEdit.rootProfile = this.securityProfiles.find(x => x.id == 41);

      this.securityProfileForSelectInit(this.selectedDeviceForEdit.rootProfile?.id || 41);
      const defaultAgentGroup = this.agentGroups.find(x => x);
      this.groupListForSelectInit(this.selectedDeviceForEdit.agentGroup?.groupName || defaultAgentGroup?.groupName || '')

    } else {
      this.editSelectedType = 'securityProfile';
      if (!this.selectedDeviceForEdit.rootProfile?.id)
        this.selectedDeviceForEdit.rootProfile = this.securityProfiles.find(x => x.id == 41);


      this.securityProfileForSelectInit(this.selectedDeviceForEdit.rootProfile?.id || 41);
      const defaultAgentGroup = this.agentGroups.find(x => x);
      this.groupListForSelectInit(this.selectedDeviceForEdit.agentGroup?.groupName || defaultAgentGroup?.groupName || '')
    }

    //this.editClientDeviceType = type;
    this.editClientDeviceModal.toggle();
  }

  showSelectedListForType(val: "group" | "securityProfile") {
    this.editSelectedType = val;
  }

  selectedAgentGroupForEdit(event) {

    this.selectedDeviceForEdit.agentGroup = this.agentGroups.find(x => x.id == event);
    const otherDeviceWithInSameGroup = this.registereds.find(x => x.id != this.selectedDeviceForEdit.id && x.agentGroup?.groupName == this.selectedDeviceForEdit.agentGroup?.groupName);
    this.selectedDeviceForEdit.rootProfile = this.securityProfiles.find(x => x.id == otherDeviceWithInSameGroup.rootProfile.id);
    this.securityProfileForSelectInit(this.selectedDeviceForEdit.rootProfile.id);
  }
  selectedSecurityProfileForEdit(event) {

    this.selectedDeviceForEdit.rootProfile = this.securityProfiles.find(x => x.id == event);
    this.selectedDeviceForEdit.agentGroup = null;
    const defaultAgentGroup = this.agentGroups.find(x => x);
    this.groupListForSelectInit(defaultAgentGroup?.groupName || '')
  }

  editClientDeviceChanges() {
    const device = this.selectedDeviceForEdit;
    const deviceGroup = new DeviceGroup();

    deviceGroup.agentGroup = device.agentGroup;
    deviceGroup.rootProfile = device.rootProfile;
    delete device.selected;
    deviceGroup.agents.push(device);



    if (!deviceGroup.rootProfile || !deviceGroup.rootProfile.id || !deviceGroup.agents.length || !deviceGroup.agents[0].agentAlias || !deviceGroup.agents[0].mac) {
      this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
      return;
    } else {

      this.agentService.saveAgentDevice(deviceGroup).subscribe(result => {
        this.editClientDeviceModal.toggle();
        this.notification.success(this.staticMessageService.savedDevicesMessage);
        this.loadDevices();
      });
    }
  }

  removeDeviceFromUnregistereds(device: Agent | AgentInfo) {
    // This area empty for now
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.settingsForThisDeviceWillBeDeletedMessage}!`).subscribe(
      res => {
        if (res) {
          this.agentService.deleteUnregisteredDevices(device.mac).subscribe(_res => {
            this.notification.success(this.staticMessageService.deletedDeviceMessage);
            this.loadDevices();
          });
        }
      }
    );
  }

  private filterTableData(table: string) {
    if (table === 'ruleUser') {
      const starti = (this.ruleUserTableCurrentPage - 1) * this.ruleUserTableViewCnt;
      const endi = starti + this.ruleUserTableViewCnt;
      this.ruleUsersPage = this.ruleUsers.filter(r => {
        if (this.ruleUserFilterText && this.ruleUserFilterText.length > 2) {
          const searchText = this.ruleUserFilterText.toLowerCase();
          return r.ip?.includes(searchText) || r.rules[0]?.agent?.rootProfile?.name?.toLowerCase()?.includes(searchText) ||
              r.host?.toLowerCase()?.includes(searchText) || r.adUser?.toLowerCase()?.includes(searchText) ||
              r.adDomain?.toLowerCase()?.includes(searchText);
        } else
          return true;
      }).slice(starti, endi);
    } else if (table === 'adClient') {
      const starti = (this.adClientTableCurrentPage - 1) * this.adClientTableViewCnt;
      const endi = starti + this.adClientTableViewCnt;
      this.adClientsPage = this.adClientsFiltered.filter(c => {
        if (this.adClientsFilterText && this.adClientsFilterText.length > 2) {
          const searchText = this.adClientsFilterText.toLowerCase();
          return c.ip?.includes(searchText) || c.rules[0]?.agent?.rootProfile?.name.toLowerCase()?.includes(searchText) ||
              c.host?.toLowerCase()?.includes(searchText) || c.adUser?.toLowerCase()?.includes(searchText) ||
              c.adDomain?.toLowerCase()?.includes(searchText) || c.rules[0]?.ruledBy.includes(searchText) ||
              c.groupNames?.includes(searchText);
        } else
          return true;
      }).slice(starti, endi);
    } else if (table === 'box') {
      this.boxPage = this.boxes.filter(b => {
        if (this.boxFilterText && this.boxFilterText.length > 2) {
          const searchText = this.boxFilterText.toLowerCase();
          return b.host?.includes(searchText) || b.rules[0]?.agent?.rootProfile?.name.toLowerCase()?.includes(searchText);
        } else
          return true;
      });
    } else if (table === 'ruleBox') {
      const starti = (this.ruleBoxTableCurrentPage - 1) * this.ruleBoxTableViewCnt;
      const endi = starti + this.ruleBoxTableViewCnt;
      this.ruleBoxPage = this.ruleBox.slice(starti, endi);
    } else if (table === 'adGroup') {
      const starti = (this.adGroupTableCurrentPage - 1) * this.adGroupTableViewCnt;
      const endi = starti + this.adGroupTableViewCnt;
      this.adGroupsPage = this.adGroups.filter(g => {
        if (this.adGroupsFilterText && this.adGroupsFilterText.length > 2) {
          const searchText = this.adGroupsFilterText.toLowerCase();
          return g.groupName?.includes(searchText) || g.rules[0]?.agent?.rootProfile?.name.toLowerCase()?.includes(searchText);
        } else
          return true;
      }).slice(starti, endi);
    } else if (table === 'ruleGroup') {
      const starti = (this.ruleGroupTableCurrentPage - 1) * this.ruleGroupTableViewCnt;
      const endi = starti + this.ruleGroupTableViewCnt;
      this.ruleGroupsPage = this.ruleGroups.filter(g => {
        if (this.ruleGroupFilterText && this.ruleGroupFilterText.length > 2) {
          const searchText = this.ruleGroupFilterText.toLowerCase();
          return g.groupName?.includes(searchText) || g.rules[0]?.agent?.rootProfile?.name.toLowerCase()?.includes(searchText);
        } else
          return true;
      }).slice(starti, endi);
    } else if (table === 'ruleHost') {
      const starti = (this.ruleHostTableCurrentPage - 1) * this.ruleHostTableViewCnt;
      const endi = starti + this.ruleHostTableViewCnt;
      this.ruleHostsPage = this.ruleHosts.slice(starti, endi);
    } else if (table === 'ruleLocIp') {
      const starti = (this.ruleLocIpTableCurrentPage - 1) * this.ruleLocIpTableViewCnt;
      const endi = starti + this.ruleLocIpTableViewCnt;
      this.ruleLocIpsPage = this.ruleLocIps.slice(starti, endi);
    }
  }

  onPageChange(pageNumber: number, table: string) {
    switch (table) {
      case 'ruleUser':
        this.ruleUserTableCurrentPage = pageNumber;
        break;
      case 'adClient':
        this.adClientTableCurrentPage = pageNumber;
        break;
      case 'ruleBox':
        this.ruleBoxTableCurrentPage = pageNumber;
        break;
      case 'adGroup':
        this.adGroupTableCurrentPage = pageNumber;
        break;
      case 'ruleGroup':
        this.ruleGroupTableCurrentPage = pageNumber;
        break;
      case 'ruleHost':
        this.ruleHostTableCurrentPage = pageNumber;
        break;
      case 'ruleLocIp':
        this.ruleLocIpTableCurrentPage = pageNumber;
        break;
    }

    this.filterTableData(table);
  }

  onPageViewCountChange(cnt: number, table: string) {
    switch (table) {
      case 'ruleUser':
        this.ruleUserTableViewCnt = cnt;
        break;
      case 'adClient':
        this.adClientTableViewCnt = cnt;
        break;
      case 'ruleBox':
        this.ruleBoxTableViewCnt = cnt;
        break;
      case 'adGroup':
        this.adGroupTableViewCnt = cnt;
        break;
      case 'ruleGroup':
        this.ruleGroupTableViewCnt = cnt;
        break;
      case 'ruleHost':
        this.ruleHostTableViewCnt = cnt;
        break;
      case 'ruleLocIp':
        this.ruleLocIpTableViewCnt = cnt;
        break;
    }

    this.filterTableData(table);
  }

  ruleTableHeaderClicked(order: number) {
    this.selectedRuleOrder = order;
  }

  loadRules() {
    this.adIntegrationService.getRules().subscribe(rules => {
      this.ruleUsers = rules.filter(r => r.rules?.find(_r => _r.ruledBy === AgentRuledBy.ADUSR)).map(r => {
        if (r.lastValidTime)
          r.lastValidTime = moment(r.lastValidTime).format('YYYY-MM-DD HH:mm:ss');
        return r;
      });
      this.ruleHosts = rules.filter(r => r.rules?.find(_r => _r.ruledBy === AgentRuledBy.MAC)).map(r => {
        if (r.lastValidTime)
          r.lastValidTime = moment(r.lastValidTime).format('YYYY-MM-DD HH:mm:ss');
        return r;
      });
      this.ruleLocIps = rules.filter(r => r.rules?.find(_r => _r.ruledBy === AgentRuledBy.LOCIP)).map(r => {
        if (r.lastValidTime)
          r.lastValidTime = moment(r.lastValidTime).format('YYYY-MM-DD HH:mm:ss');
        return r;
      });
      this.ruleGroups = rules.filter(r => r.rules?.find(_r => _r.ruledBy === AgentRuledBy.ADGRP)).map(g => {
        const grp = this.adGroups.find(_g => _g.groupName === g.groupName);
        if (grp) {
          g.lastSyncTime = grp.lastSyncTime;
          g.memberCount = grp.memberCount;
        }
        return g;
      }).filter(r => r);
      this.ruleBox = rules.filter(r => r.rules?.find(_r => _r.ruledBy === AgentRuledBy.BOX)).map(b => {
        const bx = this.boxes.find(_b => _b.boxSerial === b.boxSerial);
        if (bx) {
          b.lastSyncTime = bx.lastSyncTime;
          b.clientCount = bx.clientCount;
        }
        return b;
      }).filter(r => r);

      this.filterTableData('ruleUser');
      this.filterTableData('ruleGroup');
      this.filterTableData('ruleHost');
      this.filterTableData('ruleLocIp');
      this.filterTableData('ruleBox');
    });
  }

  loadClients() {
    this.adIntegrationService.getClients().subscribe(clients => {
        this.adClients = clients.map(c => {
          c.lastValidTime = moment(c.lastValidTime).format('YYYY-MM-DD HH:mm:ss');
          c.groupNames = c.groups?.map(g => g.groupName)?.join(',');
          return c;
        });
        this.adClientFilter = '';
        // this.ruleUsers = this.adClients.filter(c => c.rules?.filter(r => r.ruledBy === AgentRuledBy.ADUSR).length);
        // this.ruleHosts = this.adClients.filter(c => c.rules?.filter(r => r.ruledBy === AgentRuledBy.MAC).length);
        // this.ruleLocIps = this.adClients.filter(c => c.rules?.filter(r => r.ruledBy === AgentRuledBy.LOCIP).length);
        this.filterTableData('adClient');
        // this.filterTableData('ruleUser');
        // this.filterTableData('ruleHost');
        // this.filterTableData('ruleLocIp');
        const ret = [];
        const subs = new Observable(subscriber => {
          this.loadDevices(subscriber);
          this.loadGroups(subscriber);
        }).subscribe(s => {
          ret.push(s);
          if (ret.includes('g') && ret.includes('b')) {
            subs.unsubscribe();
            this.loadRules();
          }
        });
    });
  }

  loadGroups(subs?: Subscriber<any>) {
    this.adIntegrationService.getGroups().subscribe(groups => {
      this.adGroups = groups.map(g => {
        const members = this.adClients.filter(c => c.groups.find(_g => _g.groupName === g.groupName));
        g.memberCount = members.length;

        const lst = members.map(m => m.lastValidTime).sort().reverse()[0];
        if (lst)
          g.lastSyncTime = moment(lst).add(-1, 'd').format('YYYY-MM-DD HH:mm:ss');

        return g;
      });
      // this.ruleGroups = this.adGroups.filter(g => g.rules?.length);
      this.filterTableData('adGroup');
      // this.filterTableData('ruleGroup');
      if (subs)
        subs.next('g');
    });
  }

  getMatchingCount(field?: string) {
    if (field)
      return this.adClients.filter(c => !this.isNullOrEmptyOrNA(c[field])).length;
    else
      return this.adClients.length;
  }

  getRuleWithRuledBy(rules: AgentRule[], ruleBy: AgentRuledBy): AgentRule {
    return rules.find(r => r.ruledBy === ruleBy);
  }

  getClientRuleByNames(client: ADUserDHCP) {
    return client.rules.map(r => this.translateService.translate('RuleBy.' + r.ruledBy)).join(',');
  }

  getClientRuleProfileNames(client: ADUserDHCP) {
    return client.rules.map(r => r.agent?.rootProfile?.name).join(',');
  }

  changeMatchType(type?: string) {
    this.adClientFilter = type || '';
    this.adClientTableCurrentPage = 1;
    this.filterTableData('adClient');
  }

  search(table: string) {
    if (table === 'ruleUser')
      this.ruleUserTableCurrentPage = 1;
    else if (table === 'ruleGroup')
      this.ruleGroupTableCurrentPage = 1;
    else if (table === 'adClient')
      this.adClientTableCurrentPage = 1;

    this.filterTableData(table);
  }

  getRuledByWithTable(table: string) {
    switch (table) {
      case 'ruleUser':
        return AgentRuledBy.ADUSR;
      case 'ruleGroup':
        return AgentRuledBy.ADGRP;
      case 'ruleHost':
        return AgentRuledBy.MAC;
      case 'ruleLocIp':
        return AgentRuledBy.LOCIP;
      case 'ruleBox':
        return AgentRuledBy.BOX;
    }
  }

  getTableWithRuledBy(ruleBy: AgentRuledBy|string) {
    switch (ruleBy) {
      case AgentRuledBy.ADUSR:
        return 'ruleUser';
      case AgentRuledBy.ADGRP:
        return 'ruleGroup';
      case AgentRuledBy.MAC:
        return 'ruleHost';
      case AgentRuledBy.LOCIP:
        return 'ruleLocIp';
      case AgentRuledBy.BOX:
        return 'ruleBox';
    }
  }

  private setProfile(table?: string) {
    delete this.selectedRule.agent.selected;
    this.selectedRule.agent.agentType = table === 'ruleBox' ? AgentType.BOX : AgentType.DEVICE;
    this.selectedRule.agent.rootProfile = new SecurityProfile();
    this.selectedRule.agent.rootProfile.domainProfile = {} as SecurityProfileItem;
    this.selectedRule.agent.rootProfile.applicationProfile = {} as SecurityProfileItem;
    this.selectedRule.agent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
    this.selectedRule.agent.rootProfile.domainProfile.categories = [];
    this.selectedRule.agent.rootProfile.applicationProfile.categories = [];
    this.selectedRule.agent.rootProfile.blackWhiteListProfile.blackList = [];
    this.selectedRule.agent.rootProfile.blackWhiteListProfile.whiteList = [];
  }

  openRuleModal(table: string, keyword?: string) {
    this.selectedRule = {
      ruledBy: this.getRuledByWithTable(table),
      keyword: keyword,
      agent: new AgentInfo()
    } as AgentRule;

    this.setProfile();

    this.editRule();
  }

  editRule(rule?: AgentRule) {
    if (rule)
      this.selectedRule = this.deepCopy(rule);

    if (!this.selectedRule.agent) {
      this.selectedRule.agent = new AgentInfo();
      this.setProfile(this.getTableWithRuledBy(this.selectedRule.ruledBy));
      this.selectedRule.agentId = 0;
    }

    if (!this.selectedRule.agent.rootProfile.domainProfile)
      this.selectedRule.agent.rootProfile.domainProfile = {} as SecurityProfileItem;
    if (!this.selectedRule.agent.rootProfile.applicationProfile)
      this.selectedRule.agent.rootProfile.applicationProfile = {} as SecurityProfileItem;
    if (!this.selectedRule.agent.rootProfile.blackWhiteListProfile)
      this.selectedRule.agent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
    if (!this.selectedRule.agent.rootProfile.domainProfile.categories)
      this.selectedRule.agent.rootProfile.domainProfile.categories = [];
    if (!this.selectedRule.agent.rootProfile.applicationProfile.categories)
      this.selectedRule.agent.rootProfile.applicationProfile.categories = [];
    if (!this.selectedRule.agent.rootProfile.blackWhiteListProfile.blackList)
      this.selectedRule.agent.rootProfile.blackWhiteListProfile.blackList = [];
    if (!this.selectedRule.agent.rootProfile.blackWhiteListProfile.whiteList)
      this.selectedRule.agent.rootProfile.blackWhiteListProfile.whiteList = [];

    this.ruledByForSelect = DevicesComponent.RULEDBY_LIST.map(r => ({
      selected: r === this.selectedRule.ruledBy,
      value: r,
      displayText: this.translateService.translate('RuleBy.' + r)
    } as RkSelectModel));

    this.securityProfileForSelectInit(this.selectedRule.agent?.rootProfile?.id);

    this.ruleModal.toggle();
  }

  editOrCreateRule(client: ADUserDHCP, ruleBy: AgentRuledBy) {
    const rule = this.getRuleWithRuledBy(client.rules, ruleBy);
    if (rule)
      this.editRule(rule);
    else {
      switch (ruleBy) {
        case AgentRuledBy.ADUSR:
          this.openRuleModal('ruleUser', client.adUser);
          break;
        case AgentRuledBy.MAC:
          this.openRuleModal('ruleHost', client.host);
          break;
        case AgentRuledBy.LOCIP:
          this.openRuleModal('ruleLocIp', client.ip);
          break;
      }
    }
  }

  assignRule() {
    if (!this.selectedRule.ruledBy)
      return this.notification.warning(this.staticMessageService.fillRuleBy);

    if (!this.selectedRule.keyword && this.selectedRule.ruledBy !== '05BOX')
      return this.notification.warning(this.staticMessageService.fillRuleKeyword);

    if (!this.selectedRule.agent?.rootProfile?.id)
      return this.notification.warning(this.staticMessageService.needsToSelectSecurityProfileMessage);

    this.selectedRule.agent.agentAlias = this.boxes.find(b => b.boxSerial === this.adClients.find(c => {
      switch (this.selectedRule.ruledBy) {
        case AgentRuledBy.ADUSR:
          return c.adUser === this.selectedRule.keyword;
        case AgentRuledBy.ADGRP:
          return !!c.groups.find(g => g.groupName === this.selectedRule.keyword);
        case AgentRuledBy.MAC:
          return c.mac === this.selectedRule.keyword || c.host === this.selectedRule.keyword;
        case AgentRuledBy.LOCIP:
          return c.ip === this.selectedRule.keyword;
        case AgentRuledBy.BOX:
          return c.boxSerial === this.selectedRule.keyword;
      }
    })?.boxSerial)?.host || `${this.selectedRule.ruledBy}-${this.selectedRule.keyword}`;

    this.selectedRule.agent.agentType = this.selectedRule.ruledBy === AgentRuledBy.BOX ? AgentType.BOX : AgentType.DEVICE;

    this.adIntegrationService.setRule(this.selectedRule).subscribe(r => {
      this.notification.success(this.staticMessageService.ruleSaved);
      this.loadClients();
      this.ruleModal.toggle();
    });
  }

  newProfileClicked($event: { clicked: boolean }) {
    this.saveMode = 'NewProfile';
    this.selectedAgent = this.deepCopy(this.selectedRule.agent);
    this.selectedAgent.rootProfile = new SecurityProfile();
    this.currentStep = 1;
    this.isProfileSaved = false;

    this.profileModal.toggle();
  }

  profileModalClosed(event) {
    if (event.closed && this.isProfileSaved) {
      this.securityProfileChanged(this.selectedAgent.rootProfile.id);
    }
  }

  securityProfileChanged(id: number) {
    this.isNewItemUpdated = true;
    this.selectedRule.agent.rootProfile = this.securityProfiles.find(p => p.id === id);

    this.securityProfilesForSelect = this.securityProfilesForSelect.map(x => {
      return {...x, selected: x.value === id};
    });
  }

  saveProfile() {
    this.profileWizard.saveProfile();
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  saveProfileEmit() {
    this.isProfileSaved = true;
    this.profileModal.toggle();

    this.loadDevices();
  }

  ruleModalClosed(event) {
    if (event.closed)
      this.selectedRule = {agent: {rootProfile: {}}} as AgentRule;
  }

  isNullOrEmptyOrNA(val: any) {
    return !val || val === 'N/A';
  }

  deleteRule(ent: ADUserDHCP | Box | LDAPUserGroup, ruleBy: AgentRuledBy) {
    this.alertService.alertWarningAndCancel(this.staticMessageService.deleteRule, this.staticMessageService.areYouSureMessage)
        .subscribe(r => {
          if (r) {
            const rule = ent.rules.find(r => r.ruledBy === ruleBy);
            this.adIntegrationService.deleteRule(rule).subscribe(r => {
              this.loadClients();
              this.notification.success(this.staticMessageService.ruleDeleted);
            });
          }
        });
  }
}
