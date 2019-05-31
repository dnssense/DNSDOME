import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { Agent } from 'src/app/core/models/Agent';
import { ApplicationV2 } from 'src/app/core/models/ApplicationV2';
import { SecurityProfile, BlackWhiteListProfile, SecurityProfileItem } from 'src/app/core/models/SecurityProfile';
import { ValidationService } from 'src/app/core/services/validation.service';
import { AgentService } from 'src/app/core/services/agent.service';
import { AlertService } from 'src/app/core/services/alert.service';

declare var $: any;

export class categoryItem {
  constructor(public category: CategoryV2, public isBlocked: boolean) { }
}

export class applicationItem {
  constructor(public application: ApplicationV2, public isBlocked: boolean) { }
}
@Component({
  selector: 'app-profile-wizard',
  templateUrl: './profile-wizard.component.html',
  styleUrls: ['./profile-wizard.component.sass']
})
export class ProfileWizardComponent {
  isSafeSearchEnabled: boolean;
  isYoutubeStrictModeEnabled: boolean;
  profileName: string;
  isNewBlackListItem: boolean = false;
  isNewWhiteListItem: boolean = false;
  blackListItem: string;
  whiteListItem: string;
  categoryList: categoryItem[] = [];
  applicationList: applicationItem[] = [];
  public _selectedAgent: Agent;
  public _startWizard: boolean;
  public _saveMode: string;

  @Input() set saveMode(value: string) {
    this._saveMode = value;
  }
  get saveMode(): string {
    return this._saveMode;
  }
  @Input() set selectedAgent(value: Agent) {
    this._selectedAgent = value;
  }
  get selectedAgent(): Agent {
    return this._selectedAgent;
  }
  @Input() set startWizard(value: boolean) {
    this._startWizard = value;
    if (value) {
      console.log(this.selectedAgent);
      this.installWizard();
    }
  }
  get startWizard(): boolean {
    return this._startWizard;
  }

  @Input() updateCount: number;

  @Output() public saveEmitter = new EventEmitter();

  constructor(private notification: NotificationService, private alertService: AlertService,
    private staticService: StaticService, private agentService: AgentService) {

    this.getCategoriesAndApps();

  }

  getCategoriesAndApps(): void {
    this.staticService.getCategoryList().subscribe(res => {
      res.forEach(r => {
        this.categoryList.push(new categoryItem(r, false));
      });
      console.log(this.categoryList);
      
    });
    this.staticService.getApplicationList().subscribe(res => {
      res.forEach(r => {
        this.applicationList.push(new applicationItem(r, false));
      });
      console.log(this.applicationList);
      
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    $('#contentLink').click();
    this.updateModels();
  }

  updateModels() {
    if (this.saveMode == 'NewProfile') {

      this.categoryList.forEach(c => {
        if (c.category.isVisible) {
          c.isBlocked = false;
          this.selectedAgent.rootProfile.domainProfile.categories.push({ id: c.category.id, isBlocked: false })
        }
      });
      this.applicationList.forEach(a => {
        if (a.application.isVisible) {
          a.isBlocked = false;
          this.selectedAgent.rootProfile.applicationProfile.categories.push({ id: a.application.id, isBlocked: false })
        }
      });
    } else if (this.saveMode == 'ProfileUpdate') {
      this.selectedAgent.rootProfile.domainProfile.categories.forEach(x => {
        this.categoryList.find(y => y.category.id == x.id).isBlocked = x.isBlocked;
      });

      this.selectedAgent.rootProfile.applicationProfile.categories.forEach(x => {
        this.applicationList.find(y => y.application.id == x.id).isBlocked = x.isBlocked;
      });
    } else if (this.saveMode == 'NewProfileWithAgent') {

      this.categoryList.forEach(c => {
        if (c.category.isVisible) {
          c.isBlocked = false;
          this.selectedAgent.rootProfile.domainProfile.categories.push({ id: c.category.id, isBlocked: false })
        }
      });
      this.applicationList.forEach(a => {
        if (a.application.isVisible) {
          a.isBlocked = false;
          this.selectedAgent.rootProfile.applicationProfile.categories.push({ id: a.application.id, isBlocked: false })
        }
      });
    }
  }

  allowCategory(id: number) {
    this.categoryList.find(c => c.category.id == id).isBlocked = false;
    this.selectedAgent.rootProfile.domainProfile.categories.find(c => c.id == id).isBlocked = false;
  }

  blockCategory(id: number) {
    this.categoryList.find(c => c.category.id == id).isBlocked = true;
    this.selectedAgent.rootProfile.domainProfile.categories.find(c => c.id == id).isBlocked = true;
  }

  allowApplication(id: number) {
    this.applicationList.find(a => a.application.id == id).isBlocked = false;
    this.selectedAgent.rootProfile.applicationProfile.categories.find(c => c.id == id).isBlocked = false;
  }

  blockApplication(id: number) {
    this.applicationList.find(a => a.application.id == id).isBlocked = true;
    this.selectedAgent.rootProfile.applicationProfile.categories.find(c => c.id == id).isBlocked = true;
  }

  saveProfile() {
    if (!this.selectedAgent.rootProfile.name) {
      this.notification.error('Profile name is empty!');
      return;
    }
    console.log(JSON.stringify(this.selectedAgent.rootProfile));
    debugger
    let alertMessage = '', alertTitle = '';
    if (this.selectedAgent.rootProfile.numberOfUsage && this.selectedAgent.rootProfile.numberOfUsage > 0) {
      alertTitle = this.selectedAgent.rootProfile.numberOfUsage + ' Agent/s using this profile!';
      alertMessage = 'Profile configuration will change for all of related agents.';
    } else {
      alertTitle = 'Are You Sure?';
      alertMessage = 'Profile configuration will change.';
    }

    this.alertService.alertWarningAndCancel(alertTitle, alertMessage).subscribe(
      res => {
        if (res) {
          if (this.saveMode == 'NewProfile' || this.saveMode == 'ProfileUpdate') {
            this.agentService.saveSecurityProfile(this.selectedAgent.rootProfile).subscribe(res => {
              if (res.status == 200) {
                this.notification.success(res.message)
                this.saveEmitter.emit();
              } else {
                this.notification.error(res.message)
              }
            });
          } else if (this.saveMode == 'NewProfileWithAgent') {
            this.agentService.saveAgent(this.selectedAgent).subscribe(res => {
              if (res.status == 200) {
                this.notification.success(res.message)
                this.saveEmitter.emit();
              } else {
                this.notification.error(res.message)
              }
              console.log(res);
            });
          }
        }
      }
    );


  }

  blackListItemValidation() {
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b == this.blackListItem)) {
      this.isNewBlackListItem = false;
    } else {
      let result = ValidationService.domainValidation({ value: this.blackListItem });
      if (result == true) {
        this.isNewBlackListItem = true;
      } else {
        this.isNewBlackListItem = false;
      }
    }
  }

  addToBlackList() {
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b == this.blackListItem)) {
      this.notification.error("This domain already in black list.")
    } else {
      this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.push(this.blackListItem);
      this.blackListItem = ""
      this.isNewBlackListItem = false;
    }
  }

  removeFromBlackList(item: string) {
    debugger;
    this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.splice(
      this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.findIndex(b => b == item), 1);
  }

  whiteListItemValidation() {
    debugger;
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b == this.whiteListItem)) {
      this.isNewBlackListItem = false;
    } else {
      let result = ValidationService.domainValidation({ value: this.whiteListItem });
      if (result == true) {
        this.isNewWhiteListItem = true;
      } else {
        this.isNewWhiteListItem = false;
      }
    }
  }

  addToWhiteList() {
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b == this.whiteListItem)) {
      this.notification.warning("This domain already in white list.")
    } else {
      this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.push(this.whiteListItem);
      this.whiteListItem = ""
      this.isNewWhiteListItem = false;
    }
  }

  removeFromWhiteList(item: string) {
    this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.splice(
      this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.findIndex(b => b == item), 1);
  }

  changeSafeSearchMode() {
    this.selectedAgent.rootProfile.isSafeSearchEnabled = this.selectedAgent.rootProfile.isSafeSearchEnabled ? false : true;
  }

  changeYoutubeMode() {
    this.selectedAgent.rootProfile.isYoutubeStrictModeEnabled = this.selectedAgent.rootProfile.isYoutubeStrictModeEnabled ? false : true;
  }

  installWizard() {

    // Code for the Validator
    const $validator = $('.card-wizard form').validate({
      rules: {
        deviceName: {
          required: true,
          minlength: 3
        }
      },

      highlight: function (element) {
        $(element).closest('.form-group').removeClass('has-success').addClass('has-danger');
      },
      success: function (element) {
        $(element).closest('.form-group').removeClass('has-danger').addClass('has-success');
      },
      errorPlacement: function (error, element) {
        $(element).append(error);
      }
    });

    // Wizard Initialization
    $('.card-wizard').bootstrapWizard({
      'tabClass': 'nav nav-pills',
      'nextSelector': '.btn-next',
      'previousSelector': '.btn-previous',

      onNext: function () {
        var $valid = $('.card-wizard form').valid();
        document.getElementById('wizardPanel').scrollIntoView();
        if (!$valid) {
          $validator.focusInvalid();
          return false;
        }
      },

      onInit: function (tab: any, navigation: any, index: any) {

        // check number of tabs and fill the entire row
        let $total = navigation.find('li').length;
        let $wizard = navigation.closest('.card-wizard');

        let $first_li = navigation.find('li:first-child a').html();
        let $moving_div = $('<div class="moving-tab">' + $first_li + '</div>');
        $('.card-wizard .wizard-navigation').append($moving_div);

        $total = $wizard.find('.nav li').length;
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
        $('.moving-tab').css('transition', 'transform 0s');
      },

      onTabClick: function () {

        const $valid = $('.card-wizard form').valid();

        if (!$valid) {
          return false;
        } else {
          return true;
        }
      },

      onTabShow: function (tab: any, navigation: any, index: any) {
        let $total = navigation.find('li').length;
        let $current = index + 1;

        const $wizard = navigation.closest('.card-wizard');

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          $($wizard).find('.btn-next').hide();
          $($wizard).find('.btn-finish').show();
        } else {
          $($wizard).find('.btn-next').show();
          $($wizard).find('.btn-finish').hide();
        }

        const button_text = navigation.find('li:nth-child(' + $current + ') a').html();

        setTimeout(function () {
          $('.moving-tab').text(button_text);
        }, 150);

        const checkbox = $('.footer-checkbox');

        if (index !== 0) {
          $(checkbox).css({
            'opacity': '0',
            'visibility': 'hidden',
            'position': 'absolute'
          });
        } else {
          $(checkbox).css({
            'opacity': '1',
            'visibility': 'visible'
          });
        }
        $total = $wizard.find('.nav li').length;
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

        $current = index + 1;

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
      }
    });


    $('[data-toggle="wizard-radio"]').click(function () {
      const wizard = $(this).closest('.card-wizard');
      wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
      $(this).addClass('active');
      $(wizard).find('[type="radio"]').removeAttr('checked');
      $(this).find('[type="radio"]').attr('checked', 'true');
    });

    $('[data-toggle="wizard-checkbox"]').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).find('[type="checkbox"]').removeAttr('checked');
      } else {
        $(this).addClass('active');
        $(this).find('[type="checkbox"]').attr('checked', 'true');
      }
    });

    $('.set-full-height').css('height', 'auto');

    document.getElementById("previous").onclick = function () {
      document.getElementById('wizardPanel').scrollIntoView();
    };

  }


}
