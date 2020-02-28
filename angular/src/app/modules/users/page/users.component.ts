import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/core/models/User';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/UserService';
import { Role } from 'src/app/core/models/Role';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import * as validator from 'validator';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';

declare var $: any;
@Component({
    selector: 'app-users',
    templateUrl: 'users.component.html',
    styleUrls: ['users.component.sass']
})
export class UsersComponent implements OnInit {

    constructor(
        private notification: NotificationService,
        private userService: UserService
    ) {

        this.user.roles = new Role();
        this.user.roles.name = 'ROLE_CUSTOMER';

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

    ngOnInit() { }

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

        if (!this.user.password || this.user.password.length < 1) { return; }

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

    newUserClick() {
        this.userModalType = 'create';

        this.userModal.toggle();
    }

    editUserClick(user: User) {
        this.user = JSON.parse(JSON.stringify(user));

        this.prepareRoleSelect(user);

        this.passwordStrength = 0;

        this.userModal.toggle();
    }

    private prepareRoleSelect(user: User) {
        const role = this.userRoles.find(x => x.name === user.roles[0].name);

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
        this.user = new User();
    }

    roleChange($event) {
        const role = this.userRoles.find(x => x.id === $event);

        if (role) {
            this.user.roles[0] = role;
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
        if (this.emailValidator(this.user.username)) {
            if (this.user.id > 0) {
                this.userService.update(this.user).subscribe(res => {
                    if (res.key) {
                        this.userModal.toggle();

                        this.notification.success('User Created.');

                        this.userService.getUsers().subscribe(result => this.users = result);
                    } else {
                        this.notification.error(res.message);
                    }
                });
            } else {
                if (this.passwordStrength > 3) {
                    this.userService.save(this.user).subscribe(res => {
                        if (res.key) {
                            this.userModal.toggle();

                            this.notification.success('User Created.');

                            this.userService.getUsers().subscribe(result => this.users = result);
                        } else {
                            this.notification.error(res.message);
                        }
                    });
                }
            }
        } else {
            this.notification.warning('Please fill required fields');
        }
    }
}
