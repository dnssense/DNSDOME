import { Component, ViewChild } from '@angular/core';
import { AgentService } from 'src/app/core/services/agent.service';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile } from 'src/app/core/models/SecurityProfile';
import { ProfileWizardComponent } from '../../shared/profile-wizard/page/profile-wizard.component';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { BoxService } from 'src/app/core/services/box.service';
import { BoxConf } from '../../roaming/page/roaming.component';
import { RkAlertService, RkNotificationService, RkSelectModel, RkModalModel } from 'roksit-lib';

@Component({
    selector: 'app-securityprofiles',
    templateUrl: 'securityprofiles.component.html',
    styleUrls: ['securityprofiles.component.sass']
})
export class SecurityProfilesComponent {

    constructor(
        private agentService: AgentService,
        private notification: RkNotificationService,
        private alertService: RkAlertService,
        private staticMessageService: StaticMessageService,
        private boxService: BoxService
    ) {
        this.getProfiles();
    }

    searchKey: string;

    securityProfiles: SecurityProfile[] = [];
    securityProfilesForSelect: RkSelectModel[] = [];

    selectedAgent: Agent = new Agent();

    saveMode: 'NewProfile' | 'ProfileUpdate' | 'NotEditable';

    @ViewChild('profileModal') profileModal: RkModalModel;

    @ViewChild('profileWizard') profileWizard: ProfileWizardComponent;

    getProfiles() {
        this.agentService.getSecurityProfiles().subscribe(res => {

            this.securityProfiles = res;

            this.fillProfilesOnSelect();
        });
    }

    private fillProfilesOnSelect(selectedId?: number) {
        this.securityProfilesForSelect = this.securityProfiles.map(x => {
            return { displayText: x.name, value: x.id, selected: selectedId === x.id } as RkSelectModel;
        });
    }

    newProfile() {


        this.saveMode = 'NewProfile';
        this.profileWizard.saveMode = this.saveMode;
        this.selectedAgent = new Agent();

        this.selectedAgent.rootProfile = new SecurityProfile();
        this.profileWizard.selectedAgent = this.selectedAgent;
        this.changeProfileSelect(-1);



        // this.profileWizard.updateModels();
        this.profileModal.toggle();
    }

    editProfile(profile: SecurityProfile) {


        this.saveMode = 'ProfileUpdate';
        this.profileWizard.saveMode = this.saveMode;
        this.fillProfilesOnSelect(profile.id);

        this.selectedAgent = new Agent();

        this.selectedAgent.rootProfile = JSON.parse(JSON.stringify(profile));
        this.profileWizard.selectedAgent = this.selectedAgent;

        // this.profileWizard.updateModels();
        this.profileModal.toggle();
    }
    viewProfile(profile: SecurityProfile) {
        this.selectedAgent = new Agent();
        this.saveMode = 'NotEditable';
        this.profileWizard.saveMode = this.saveMode;
        this.selectedAgent.rootProfile = JSON.parse(JSON.stringify(profile));
        this.profileWizard.selectedAgent = this.selectedAgent;

        // this.profileWizard.updateModels();

        this.profileModal.toggle();
    }

    deleteProfile(id: number) {
        const profile = this.securityProfiles.find(p => p.id === id);
        this.boxService.getVirtualBox().subscribe(virtualBox => {
            let conf = virtualBox.conf ? JSON.parse(virtualBox.conf) as BoxConf : null;

            if (conf?.defaultRoamingSecurityProfile == id) {

                this.alertService.alertTitleAndText(this.staticMessageService.canNotDeleteMessage, this.staticMessageService.thisSecurityProfileIsUsingByDefaultRoamingSettingsMessage);

            } else if (profile.numberOfUsage > 0) {
                this.alertService.alertTitleAndText(this.staticMessageService.canNotDeleteMessage, this.staticMessageService.thisSecurityProfileIsUsingBySomeAgentsMessage);
            }
            else {
                this.alertService.alertWarningAndCancel(this.staticMessageService.areYouSureMessage, this.staticMessageService.itWillBeDeletedMessage).subscribe(
                    res => {
                        if (res) {
                            this.agentService.deleteSecurityProfile(id).subscribe(delRes => {

                                this.notification.success(this.staticMessageService.deletedProfileMessage);

                                this.getProfiles();

                            });
                        }
                    }
                );
            }
        })
    }

    changeProfileSelect(id: number) {
        this.securityProfilesForSelect = this.securityProfilesForSelect.map(x => {
            const obj = { ...x, selected: false } as RkSelectModel;

            if (x.value === id) {
                obj.selected = true;
            }

            return obj;
        });
    }

    saveProfile() {
        this.profileWizard.saveProfile();
    }

    saveSuccess() {
        this.profileModal.toggle();

        this.getProfiles();
    }

    cloneProfile(profile: SecurityProfile) {
        const cloneAgent = new Agent();

        const deepCopy = JSON.parse(JSON.stringify(profile)) as SecurityProfile;

        deepCopy.name = deepCopy.name + '-Clone';

        cloneAgent.rootProfile = deepCopy;

        this.selectedAgent = cloneAgent;

        this.selectedAgent.rootProfile.id = null;
        this.selectedAgent.rootProfile.isSystem = false;
        this.selectedAgent.rootProfile.numberOfUsage = 0;

        this.selectedAgent.rootProfile.applicationProfile.id = null;
        this.selectedAgent.rootProfile.applicationProfile.id = null;
        this.selectedAgent.rootProfile.domainProfile.id = null;
        this.selectedAgent.rootProfile.domainProfile.id = null;
        this.selectedAgent.rootProfile.blackWhiteListProfile.id = null;
        this.selectedAgent.rootProfile.blackWhiteListProfile.id = null;
        this.saveMode = 'ProfileUpdate';
        this.profileWizard.saveMode = this.saveMode;
        this.profileWizard.selectedAgent = this.selectedAgent;
        // this.profileWizard.updateModels();
        this.profileModal.toggle();
    }


}
