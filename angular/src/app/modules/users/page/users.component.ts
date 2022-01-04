import {Component, OnInit, ViewChild} from '@angular/core';
import {RkModalModel} from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import {RkSelectModel} from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import {Role} from 'src/app/core/models/Role';
import {User} from 'src/app/core/models/User';
import {AlertService} from 'src/app/core/services/alert.service';
import {AuthenticationService} from 'src/app/core/services/authentication.service';
import {NotificationService} from 'src/app/core/services/notification.service';
import {StaticMessageService} from 'src/app/core/services/staticMessageService';
import {UserService} from 'src/app/core/services/userService';
import * as validator from 'validator';

declare var $: any;

@Component({
  selector: 'app-users',
  templateUrl: 'users.component.html',
  styleUrls: ['users.component.sass']
})
export class UsersComponent implements OnInit {

  constructor(
    private notification: NotificationService,
    private userService: UserService,
    private staticMessageService: StaticMessageService,
    private authenticatonService: AuthenticationService,
    private alertService: AlertService
  ) {

    let role = new Role();
    role.id = 2;
    role.name = 'ROLE_CUSTOMER';
    if (!this.user.role)
      this.user.role = []
    this.user.role.push(role)
    this.userService.getUsers().subscribe(res => {
      this.users = res;
    });

    this.userRoles = this.userService.getRoles();

    this.userRoles.forEach(elem => {
      this.userRolesForSelect.push({
        displayText: elem.description,
        value: elem.id
      });
    });
  }

  @ViewChild('userModal') userModal: RkModalModel;
  userModalType: 'create' | 'edit';

  user: User = new User();

  users: User[] = [];

  userRoles: Role[] = [];
  userRolesForSelect: RkSelectModel[] = [];

  passwordStrength = 0;

  searchKey: string;

  selectedRoleId;

  isActive: boolean;

  ngOnInit() {
  }

  userFriendlyRoleName(role: string) {
    if (role === 'ROLE_CUSTOMER') {
      return 'Admin';
    } else if (role === 'ROLE_USER') {
      return 'User';
    } else {
      return 'Not Defined';
    }
  }

  checkPasswordStrength() {
    this.passwordStrength = 0;

    if (!this.user.password || this.user.password.length < 1) {
      return;
    }

    if (/[a-z]/.test(this.user.password)) {
      this.passwordStrength++;
    }

    if (/[A-Z]/.test(this.user.password)) {
      this.passwordStrength++;
    }

    if (/[0-9]/.test(this.user.password)) {
      this.passwordStrength++;
    }

    if (this.user.password && this.user.password.length > 7) {
      this.passwordStrength++;
    }
  }

  get isCurrentUserAdmin() {
    const role = this.authenticatonService.currentSession?.currentUser?.role;
    if (role && role.find(r => r.name == 'ROLE_MSP_ADMIN') /*role.name == 'ROLE_CUSTOMER'*/) {
      return true;
    }
    return false;
  }

  canDeleteThisRow(user: User) {

    if (this.isCurrentUserAdmin && user.id != this.authenticatonService.currentSession?.currentUser?.id) {
      return true;
    }
    return false;
  }

  newUserClick() {
    this.userModalType = 'create';

    this.user = new User();
    let role = this.userRoles.filter(x => x.name == 'ROLE_MSP_USER').find(x => x);
    if(role){
      this.user.role = [role]
    } else {
      this.user.role = []
    }


    this.prepareRoleSelect(this.user);
    this.userModal.toggle();
  }

  clean() {

    this.user = new User();
  }

  isUpdateUser(user: User) {
    return Number(user.id) > 0;
  }

  editUserClick(user: User) {

    this.user = JSON.parse(JSON.stringify(user));

    this.prepareRoleSelect(user);

    this.passwordStrength = 0;

    this.userModal.toggle();
  }

  private prepareRoleSelect(user: User) {
    console.log(user.role)
    const role = this.userRoles.find(x => user.role.find(ur => ur.name === x.name));
    if (!role?.id)
      return
    this.selectedRoleId = role.id;

    this.userRolesForSelect = [];

    this.userRoles.forEach(elem => {
      const obj = {
        displayText: elem.description,
        value: elem.id
      } as RkSelectModel;

      if (elem.id === role.id) {
        obj.selected = true;
      }

      this.userRolesForSelect.push(obj);
    });
  }

  modalClosed($event) {

    if ($event.closed) {
      this.user = new User();
    }
  }

  roleChange($event) {

    const role = this.userRoles.find(x => x.id === $event);

    if (role) {

      this.user.role = [JSON.parse(JSON.stringify(role))];
    }
  }

  private emailValidator(value: string): boolean {
    if (!value) {
      return false;
    } else if (!value.match(/^((?!yopmail.com|boximail.com|eelmail.com|maildrop.cc|mailnesia.com|mintemail.com|mt2015.com|mt2014.com|thankyou2010.com|trash2009.com|mt2009.com|trashymail.com|mytrashmail.com|dispostable.com|trbvn.com|mailinator.com).)*$/)) {
      return false;
    } else {
      return validator.isEmail(value);
    }
  }

  save() {

    if (!this.user.name) {
      this.notification.warning(this.staticMessageService.pleaseFillName);
      return;
    }
    if (!this.user.username) {
      this.notification.warning(this.staticMessageService.pleaseEnterAValidEmail);
      return;
    }
    if (!this.emailValidator(this.user.username)) {
      this.notification.warning(this.staticMessageService.pleaseEnterAValidEmail);
      return;
    }

    var isHaveRole = false
    if (this.user.role.length) {
      for (let role of this.user.role) {
        if (role.name) {
          isHaveRole = true
          break
        }
      }
    }

    if (!this.user.role || !isHaveRole) {
      this.notification.warning(this.staticMessageService.pleaseSelectARole);
    }


    if (this.emailValidator(this.user.username)) {
      if (this.user.id > 0) {
        this.userService.update(this.user).subscribe(res => {

          this.userModal.toggle();

          this.notification.success(this.staticMessageService.savedUserMessage);

          this.userService.getUsers().subscribe(result => {

            this.users = result;
          });

        });
      } else {
        // if (!this.user.password) {
        //     this.notification.warning(this.staticMessageService.pleaseFillThePassword);
        //     return;
        // }
        // if (this.passwordStrength != 4) {
        //     this.notification.warning(this.staticMessageService.passwordComplexityMustBe);
        //     return;
        // }
        // if (this.passwordStrength > 3) {
        this.userService.save(this.user).subscribe(res => {
          if (res.key) {
            this.userModal.toggle();

            this.notification.success(this.staticMessageService.savedUserMessage);

            this.userService.getUsers().subscribe(result => this.users = result);
          } else {
            this.notification.error(res.message);
          }
        });
        // }
      }
    } else {
      this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
    }
  }

  isActiveChanged($event: boolean) {
    this.user.isLocked = $event ? 0 : 1;
  }

  isLockedChanged($event: boolean) {
    this.user.isActive = $event ? 0 : 1;
  }

  deleteUser(user: User) {
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.selectedUserWillBeDeletedMessage}!`).subscribe(
      res => {
        if (res) {

          this.userService.delete(user).subscribe(res => {

            this.notification.success(this.staticMessageService.deletedSelectedUserMessage);
            this.userService.getUsers().subscribe(res => {
              this.users = res;
            });

          });
        }
      }
    );
  }
}
