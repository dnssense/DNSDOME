import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { SpinnerService } from './spinner.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;

    constructor(private router: Router) {
        // clear alert message on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next();
                }
            }
        });
    }

    success(message: string, keepAfterNavigationChange = false) {
        if (message) {
            this.keepAfterNavigationChange = keepAfterNavigationChange;
            this.subject.next({ type: 'success', text: message });
        }
    }

    error(message: string, keepAfterNavigationChange = false) {
        if (message) {
            this.keepAfterNavigationChange = keepAfterNavigationChange;
            this.subject.next({ type: 'danger', text: message });
        }
    }
    info(message: string, keepAfterNavigationChange = false) {
        if (message) {
            this.keepAfterNavigationChange = keepAfterNavigationChange;
            this.subject.next({ type: 'info', text: message });
        }
    }

    warning(message: string, keepAfterNavigationChange = false) {
        if (message) {
            this.keepAfterNavigationChange = keepAfterNavigationChange;
            this.subject.next({ type: 'warning', text: message });
        }
    }

    danger(message: string, keepAfterNavigationChange = false) {
        if (message) {
            this.keepAfterNavigationChange = keepAfterNavigationChange;
            this.subject.next({ type: 'danger', text: message });
        }
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
