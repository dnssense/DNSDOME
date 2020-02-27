import { Component, ViewChild } from '@angular/core';
import { AgentService } from 'src/app/core/services/agent.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile } from 'src/app/core/models/SecurityProfile';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { ProfileWizardComponent } from '../../shared/profile-wizard/page/profile-wizard.component';
import { StaticMessageService } from 'src/app/core/services/StaticMessageService';

@Component({
    selector: 'app-securityprofiles',
    templateUrl: 'securityprofiles.component.html',
    styleUrls: ['securityprofiles.component.sass']
})
export class SecurityProfilesComponent {

    constructor(
        private agentService: AgentService,
        private notification: NotificationService,
        private alertService: AlertService,
        private staticMessageService:StaticMessageService
    ) {
        this.getProfiles();
    }

    searchKey: string;

    securityProfiles: SecurityProfile[] = [];
    securityProfilesForSelect: RkSelectModel[] = [];

    selectedAgent: Agent = new Agent();

    saveMode: 'NewProfile' | 'ProfileUpdate';

    @ViewChild('profileModal') profileModal;

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
        this.profileModal.toggle();

        this.saveMode = 'NewProfile';

        this.selectedAgent = new Agent();

        this.selectedAgent.rootProfile = new SecurityProfile();

        this.changeProfileSelect(-1);

        // this.profileWizard.updateModels();
    }

    editProfile(profile: SecurityProfile) {
        this.profileModal.toggle();

        this.saveMode = 'ProfileUpdate';

        this.fillProfilesOnSelect(profile.id);

        this.selectedAgent = new Agent();

        this.selectedAgent.rootProfile = profile;

        // this.profileWizard.updateModels();
    }

    deleteProfile(id: number) {
        const profile = this.securityProfiles.find(p => p.id === id);

        if (profile.numberOfUsage > 0) {
            this.alertService.alertTitleAndText('Can not delete!', 'This profile using by some agents.');
        } else {
            this.alertService.alertWarningAndCancel('Are You Sure?', 'Item will be deleted!').subscribe(
                res => {
                    if (res) {
                        this.agentService.deleteSecurityProfile(id).subscribe(delRes => {
                            
                                this.notification.success(this.staticMessageService.deletedProfileMessage());

                                this.getProfiles();
                            
                        });
                    }
                }
            );
        }
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
}
