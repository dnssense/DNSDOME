import { Component } from '@angular/core';
import { AgentService } from 'src/app/core/services/agent.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';

declare var $: any;

@Component({
    selector: 'app-securityprofiles',
    templateUrl: 'securityprofiles.component.html',
    styleUrls: ['securityprofiles.component.sass']
})
export class SecurityProfilesComponent {
    searchKey: string;
    securityProfiles: SecurityProfile[];
    securityProfilesFiltered: SecurityProfile[];
    selectedAgent: Agent;
    profileList: SecurityProfile[];
    startWizard: boolean = false;
    saveMode: string;
    updateCount: number = 0;
    constructor(private agentService: AgentService, private notification: NotificationService,
        private alert: AlertService) {

        this.getProfiles();
        this.defineNewAgentForProfile();

        $('#newAgentBtn').click(function () {

            $('#closeNewAgentBtn').removeClass('d-none');
            $(this).addClass('d-none');
            $('#agent-wizard').removeClass('d-none');
        });
    }

    getProfiles() {
        this.agentService.getSecurityProfiles().subscribe(res => {
            this.securityProfiles = res;
            this.securityProfilesFiltered = this.securityProfiles;
        });
    }

    defineNewAgentForProfile() {
        this.selectedAgent = new Agent();
        this.selectedAgent.rootProfile = new SecurityProfile();
        // this.selectedAgent.rootProfile.name = "Agent1-Profile";
        this.selectedAgent.rootProfile.domainProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.applicationProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
        this.selectedAgent.rootProfile.domainProfile.categories = [];
        this.selectedAgent.rootProfile.applicationProfile.categories = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList = [];
    }

    showNewWizard() {
        $('#securityProfilesPanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

        this.saveMode = 'NewProfile';
        this.defineNewAgentForProfile();
        this.updateCount++;
        this.startWizard = true;
        document.getElementById('wizardPanel').scrollIntoView();

    }

    showEditWizard(id: number) {
        if (id) {
            $('#securityProfilesPanel').toggle("slide", { direction: "left" }, 600);
            $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

            this.selectedAgent.rootProfile = this.securityProfiles.find(p => p.id == id);
            this.updateCount++;
            this.saveMode = 'ProfileUpdate';
            this.startWizard = true;
            document.getElementById('wizardPanel').scrollIntoView();
        }
    }

    hideWizard() {
        if (this.selectedAgent.rootProfile.isSystem) {
            this.hideWizardWithoutConfirm();
        } else {
            this.alert.alertWarningAndCancel('Are You Sure?', 'If you made changes, Your Changes will be cancelled!').subscribe(
                res => {
                    if (res) {
                        this.hideWizardWithoutConfirm();
                    }
                }
            );
        }
    }

    hideWizardWithoutConfirm() {
        this.getProfiles();
        $('#wizardPanel').hide("slide", { direction: "right" }, 1000);
        $('#securityProfilesPanel').show("slide", { direction: "left" }, 1000);
    }

    deleteProfile(id: number) {

        if (this.securityProfiles.find(p => p.id == id).numberOfUsage > 0) {
            this.alert.alertTitleAndText('Can not delete!', 'This profile using by some agents.')
        } else {
            this.alert.alertWarningAndCancel('Are You Sure?', 'Item will be deleted!').subscribe(
                res => {
                    if (res) {
                        this.agentService.deleteSecurityProfile(id).subscribe(delRes => {
                            if (delRes.status == 200) {
                                this.notification.success(delRes.message);
                                this.getProfiles();
                            } else {
                                this.notification.error(delRes.message);
                            }
                        });
                    }
                }
            );
        }
    }

    cloneDefaultProfile(id: number) {
        this.selectedAgent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(p => p.id == id)));
        this.selectedAgent.rootProfile.id = null;
        this.selectedAgent.rootProfile.name = this.selectedAgent.rootProfile.name + '-Clone';
        this.selectedAgent.rootProfile.isSystem = false;
        $('#securityProfilesPanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

        this.saveMode = 'ProfileUpdate';
        this.updateCount++;
        this.startWizard = true;
        document.getElementById('wizardPanel').scrollIntoView();
    }

    searchByKeyword() {
        if (this.searchKey && this.searchKey.length > 0) {
            this.securityProfilesFiltered = this.securityProfiles.filter(f => f.name.toLowerCase().includes(this.searchKey.toLowerCase()));
        } else {
            this.securityProfilesFiltered = this.securityProfiles;
        }
    }

}
