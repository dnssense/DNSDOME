import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AgentService } from 'src/app/core/services/agent.service';
import * as introJs from 'intro.js/intro.js';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { BoxService } from 'src/app/core/services/box.service';
import { GroupAgentModel } from '../../devices/page/devices.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { StaticSymbolResolverHost, ThrowStmt } from '@angular/compiler';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { AgentGroup } from 'src/app/core/models/DeviceGroup';
import { stringify } from 'querystring';

declare let $: any;



@Component({
    selector: 'app-roaming',
    templateUrl: 'roaming.component.html',
    styleUrls: ['roaming.component.sass']
})
export class RoamingComponent implements OnInit {
    grupOperation: string;
    groupOperation: string;

    constructor(
        private formBuilder: FormBuilder,
        private agentService: AgentService,
        private alertService: AlertService,
        private notification: NotificationService,
        private roamingService: RoamingService,
        private boxService: BoxService,
        private staticMessageService: StaticMessageService
    ) { }

    clientForm: FormGroup;
    clients: Agent[];
    clientsFiltered: Agent[];
    clientsUnGroupFiltered: Agent[];
    // clientGroups: Agent[];
    // selectedClients: Agent[] = [];
    // clientListForGroup: Agent[] = [];

    selectedClient: Agent = new Agent();

    securityProfiles: SecurityProfile[];
    securityProfilesForSelect: RkSelectModel[] = [];
    selectedProfile: number;
    agentGroups;

    selectedProfileRadio: number;
    selectedProfileRadioBeforeEdit: number;

    clientType: string;
    isNewItemUpdated = false;
    fileLink: string;
    searchKey: string;
    selectedAgent: Agent = new Agent();
    saveMode: string;
    startWizard = false;
    dontDomains: string[] = [];
    confParameters: string[] = [];

    isDontDomainsValid = true;

    groupedClients: GroupAgentModel[] = [];

    searchKeyUnGroup = '';

    domain: string;

    alwaysActive = true;
    disabledNetwork = false;

    groupName = '';
    groupNameBeforeEdit = '';
    noGroupedClients: Agent[] = [];
    groupMembers: Agent[] = [];
    groupListForSelect: RkSelectModel[] = [];
    selectedGroupName;
    selectedAgentsForChangeAddGroup: Agent[] = [];


    @ViewChild('groupModal') groupModal: RkModalModel;

    @ViewChild('roamingClientModal') roamingClientModal: RkModalModel;
    @ViewChild('changeGroupModal') changeGroupModel: RkModalModel;

    ngOnInit(): void {

        this.clients = [];
        this.clientForm = this.formBuilder.group({
            'name': ['', [Validators.required]],
            'type': ['', [Validators.required]],
            'blockMessage': []
        });

        this.loadClients();

        this.getConfParameters();
        // this.defineNewAgentForProfile();
    }

    loadClients() {
        this.agentService.getSecurityProfiles().subscribe(result => {
            this.securityProfiles = result;

            this.fillSecurityProfilesSelect(result);
        });

        this.roamingService.getClients().subscribe(res => {
            this.clients = res;

            this.clientsFiltered = this.clients.filter(x => x.agentGroup);
            this.clientsUnGroupFiltered = this.clients.filter(x => !x.agentGroup);

            this.groupedClients = this.getGroupClients(this.clients);
            this.groupListForSelect = [];
            this.clients.filter(x => x.agentGroup).forEach(((x, index) => {
                const item: RkSelectModel = { displayText: x.agentGroup.groupName, value: x.agentGroup.groupName, selected: false };
                if (!this.groupListForSelect.find(y => y.displayText == item.displayText)) {
                    this.groupListForSelect.push(item);
                }
            }));

            this.groupListForSelect = this.groupListForSelect.sort((x, y) => {
                return x.displayText.localeCompare(y.displayText);
            });
            this.selectedGroupName = '';
            if (this.groupListForSelect.length) {
                this.groupListForSelect[0].selected = true;
                this.selectedGroupName = this.groupListForSelect[0].displayText;
            }


        });
    }

    private fillSecurityProfilesSelect(profiles: SecurityProfile[], id?: number) {
        const _profiles = [];

        profiles.forEach(elem => {
            const obj = {
                displayText: elem.name,
                value: elem.id,
            } as RkSelectModel;

            if (id) {
                obj.selected = elem.id === id;
            }

            _profiles.push(obj);
        });

        this.securityProfilesForSelect = _profiles;
    }

    private getGroupClients(clients: Agent[]): GroupAgentModel[] {
        const grouped = [] as GroupAgentModel[];

        clients.forEach(elem => {
            if (elem.agentGroup && elem.agentGroup.id > 0) {
                const finded = grouped.find(x => x.agentGroup.groupName === elem.agentGroup.groupName);

                if (finded) {
                    finded.memberCounts++;
                    finded.agents.push(elem);
                } else {
                    grouped.push({
                        agentGroup: elem.agentGroup,
                        securityProfile: elem.rootProfile,
                        agents: [elem],
                        memberCounts: 1
                    });
                }
            }
        });

        return grouped;
    }

    getConfParameters() {
        this.boxService.getVirtualBox().subscribe(res => {
            if (res.conf) {
                this.dontDomains = res.conf.split(',').map(x => x[0] === '.' ? x.substring(1) : x);
            }
        });
    }


    get isFormValid() {
        return this.selectedClient.agentAlias.trim().length > 0 && this.selectedClient.rootProfile.id > 0;
    }

    showEditWizard(id: number) {
        this.selectedClient = JSON.parse(JSON.stringify(this.clients.find(c => c.id === id)));
        $('#newClientRow').slideDown(300);
    }



    searchByKeyword() {
        if (this.searchKey) {
            this.clientsFiltered = this.clients.filter(f => f.agentAlias.toLowerCase().includes(this.searchKey.toLowerCase()));
        } else {
            this.clientsFiltered = this.clients;
        }
    }

    copyLink() {
        const domains = this.dontDomains.map(d => { d = '.'.concat(d); return d; }).join(',');
        this.boxService.getProgramLink({ donttouchdomains: domains }).subscribe(res => {
            if (res && res.link) {
                this.getConfParameters();
                this.fileLink = res.link;
                this.copyToClipBoard(this.fileLink);
                this.notification.info(this.staticMessageService.downloadLinkCopiedToClipboardMessage);
            } else {
                this.notification.error(this.staticMessageService.couldNotCreateDownloadLinkMessage);
            }
        });
    }

    copyToClipBoard(input: string) {
        const selBox = document.createElement('textarea');
        selBox.value = input;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }

    removeElementFromDomainList(index: number) {
        this.dontDomains.splice(index, 1);

        this.saveDomainChanges();
    }

    saveDomainChanges() {
        const domains = this.dontDomains.map(domain => domain[0] !== '.' ? '.'.concat(domain) : domain).join(',');

        if (this.isDontDomainsValid) {
            this.boxService.getProgramLink({ donttouchdomains: domains }).subscribe(res => {
                if (res && res.link) {
                    this.getConfParameters();
                } else {
                    this.notification.error(this.staticMessageService.changesCouldNotSavedMessage);
                }
            });
        }
    }

    downloadFile() {
        const domains = this.dontDomains.map(d => { d = '.'.concat(d.trim()); return d; }).join(',');

        this.boxService.getProgramLink({ donttouchdomains: domains }).subscribe(res => {
            if (res && res.link) {
                this.getConfParameters();
                this.fileLink = res.link;
                window.open('http://' + this.fileLink, '_blank');
            } else {
                this.notification.error(this.staticMessageService.couldNotCreateDownloadLinkMessage);
            }
        });
    }

    addDomainToList() {

        if (this.dontDomains && this.dontDomains.length < 10) {
            const result = this.checkIsValidDomaind(this.domain);
            if (!result) {
                this.notification.warning(this.staticMessageService.enterValidDomainMessage);
                return;
            }

            this.dontDomains.push(result);



            this.domain = '';

            this.saveDomainChanges();
        } else {
            this.notification.warning(this.staticMessageService.youReachedMaxDomainsCountMessage);
        }
    }



    checkIsValidDomaind(d: string): string | null {
        d = d.toLocaleLowerCase().replace('https://', '').replace('http://', '');

        for (let i = 0; i < d.length; i++) {
            const f = d[i];

            const res = f.match(/^[a-z0-9.-]+$/i); // alpha or num or - or .
            if (!res) {
                return null;
                break;
            }
        }
        return d;
    }


    clientsTableCheckboxChanged($event) {
        this.clientsFiltered.forEach(elem => elem.selected = $event);
    }





    editClient(client: Agent) {
        this.selectedClient = JSON.parse(JSON.stringify(client));

        this.fillSecurityProfilesSelect(this.securityProfiles, client.rootProfile.id);

        this.roamingClientModal.toggle();
    }

    clearRoamingClientForm() {

        this.selectedClient.agentAlias = '';
        this.selectedAgent.blockMessage = '';

        this.fillSecurityProfilesSelect(this.securityProfiles, -1);
    }

    profileSelectChange($event: number) {
        this.selectedClient.rootProfile = this.securityProfiles.find(x => x.id === $event);
    }

    groupSelectChange($event: string) {
        this.selectedGroupName = $event;
    }

    addToGroup() {
        this.groupModal.toggle();
    }

    changeGroup() {
        this.groupModal.toggle();
    }

    openChangeGroup() {
        this.selectedAgentsForChangeAddGroup = this.clients.filter(x => x.selected).map(x => JSON.parse(JSON.stringify(x)));
        if (!this.selectedAgentsForChangeAddGroup.length) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
            return;
        }
        this.changeGroupModel.toggle();
    }

    saveChangedGroup() {
        if (!this.selectedAgentsForChangeAddGroup.length) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
            return;
        }

        this.selectedAgentsForChangeAddGroup.forEach(x => {
            if (!x.agentGroup) {
                x.agentGroup = new AgentGroup();
                x.agentGroup.id = 0;
            }

            x.agentGroup.groupName = this.selectedGroupName;

            const findedGroup = this.groupedClients.find(group => group.agentGroup.groupName === this.selectedGroupName);

            if (findedGroup) {
                x.rootProfile = findedGroup.securityProfile;
            }
        });

        this.roamingService.saveClients(this.selectedAgentsForChangeAddGroup).subscribe(
            res => {

                this.notification.success(this.staticMessageService.savedAgentRoaminClientMessage);
                this.loadClients();
                this.changeGroupModel.toggle();

            });

    }
    cleanChangedGroup() {
        this.selectedAgentsForChangeAddGroup.forEach(x => x.selected = false);
    }

    openCreateGroup() {
        this.groupOperation = 'Create New';
        this.groupName = '';
        this.groupNameBeforeEdit = '';
        this.selectedProfileRadio = -1;
        this.selectedProfileRadioBeforeEdit = -1;

        this.noGroupedClients = this.clients.filter(x => !x.agentGroup).map(x => JSON.parse(JSON.stringify(x)));
        this.groupMembers = [];
        this.groupModal.toggle();
    }
    saveOrUpdateGroup() {
        let selectedItems: Agent[] = [];
        if (!this.groupName) {
            this.notification.warning(this.staticMessageService.needsGroupNameMessage);
            return;
        }
        if (this.groupOperation == 'Create New') {

            selectedItems = this.noGroupedClients.filter(x => x.selected);
            if (!selectedItems.length) {
                this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
                return;
            }
            // set agent groupnames
            selectedItems.forEach(x => {
                if (!x.agentGroup) {
                    x.agentGroup = new AgentGroup();
                    x.agentGroup.id = 0;
                }
                x.agentGroup.groupName = this.groupName;

            });
        } else {
            const addClients = this.noGroupedClients.filter(x => x.selected);
            addClients.forEach(x => {
                if (!x.agentGroup) {
                    x.agentGroup = new AgentGroup();
                    x.agentGroup.id = 0;
                }
                x.agentGroup.groupName = this.groupName;

            });
            selectedItems = selectedItems.concat(addClients);

            const removeClients = this.groupMembers.filter(x => !x.selected);
            removeClients.forEach(x => {
                x.agentGroup = null;

            });

            selectedItems = selectedItems.concat(removeClients);

            if (this.groupNameBeforeEdit !== this.groupName || this.selectedProfileRadio !== this.selectedProfileRadioBeforeEdit) {// name changed
                const changedItems = this.groupMembers.filter(x => x.selected).filter(x => x.agentGroup);
                changedItems.forEach(element => {
                    element.agentGroup.groupName = this.groupName;
                });
                selectedItems = selectedItems.concat(changedItems);
            }

            if (!selectedItems.length) {
                this.notification.warning(this.staticMessageService.pleaseChangeSomethingMessage);
                return;
            }
        }

        const findedProfile = this.securityProfiles.find(x => x.id === this.selectedProfileRadio);

        console.log('findedProfile => ', findedProfile);

        if (findedProfile) {
            selectedItems.forEach(elem => {
                elem.rootProfile = findedProfile;
            });
        }

        this.roamingService.saveClients(selectedItems).subscribe(
            res => {

                this.notification.success(this.staticMessageService.savedAgentRoaminClientMessage);
                this.loadClients();
                this.groupModal.toggle();

            });
    }


    cleanNewGroup() {
        this.groupName = '';

        this.noGroupedClients.forEach(x => x.selected = false);
        this.groupMembers.forEach(x => x.selected = false);
    }
    openUpdateGroup(agents: Agent[]) {
        this.groupOperation = 'Edit';
        this.groupName = agents[0].agentGroup.groupName;
        this.groupNameBeforeEdit = this.groupName;
        this.selectedProfileRadio = agents[0].rootProfile.id;
        this.selectedProfileRadioBeforeEdit = this.selectedProfileRadio;
        this.noGroupedClients = this.clients.filter(x => !x.agentGroup).map(x => JSON.parse(JSON.stringify(x)));
        this.groupMembers = this.clients.filter(x => x.agentGroup && x.agentGroup.groupName == this.groupName).map(x => JSON.parse(JSON.stringify(x)));
        this.groupMembers.forEach(x => x.selected = true);
        this.groupModal.toggle();
    }

    deleteGroup(agents: Agent[]) {

        this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.groupWillBeDeletedMessage}`).subscribe(res => {
            agents.forEach(x => x.agentGroup = null);

            this.roamingService.saveClients(agents).subscribe(
                res => {

                    this.notification.success(this.staticMessageService.groupDeletedMessage);
                    this.loadClients();


                });

        });
    }

    get getClientsFilteredDisabled() {
        if (this.clientsFiltered) {
            return this.clientsFiltered.filter(x => x.selected).length === 0;
        }

        return true;
    }

    get getUnGroupClientsFilteredDisabled() {
        if (this.clientsUnGroupFiltered) {
            return this.clientsUnGroupFiltered.filter(x => x.selected).length === 0;
        }

        return true;
    }

    saveRoamingClient() {

        if (this.selectedClient && this.isFormValid) {
            this.roamingService.saveClient(this.selectedClient).subscribe(
                res => {

                    this.notification.success(this.staticMessageService.savedAgentRoaminClientMessage);
                    this.loadClients();
                    this.roamingClientModal.toggle();

                });
        } else {
            this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
        }
    }

    deleteClient(id: number) {
        this.alertService.alertWarningAndCancel(this.staticMessageService.areYouSureMessage, this.staticMessageService.willDeleteAgentRoamingClientMessage).subscribe(
            res => {
                if (res && id && id > 0) {
                    this.roamingService.deleteClient(id).subscribe(result => {

                        this.deletedAgentRoamingClientMessage();
                        this.loadClients();

                    });
                }
            });
    }
    deletedAgentRoamingClientMessage(): void {
        this.notification.info(this.staticMessageService.deletedAgentRoamingClientMessage);
    }

}
