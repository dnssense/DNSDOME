import * as isIp from "is-ip";

export class IpCollection {
    private ips: string[] = [];

    get length() {
        return this.ips.length;
    }

    get isEmpty() {
        return this.ips.length === 0;
    }

    constructor(private options: {
        maxCount: number;
        onMaxCountReached?: () => void;
        onIpNotValid?: () => void;
    }) {}

    add(ip: string) {
        if (this.ips.find(t => t === ip)) {
            return;
        }

        if (this.length < this.options.maxCount) {  
            if (isIp(ip)) {
                this.ips.push(ip);
            } else {
                this.options.onIpNotValid?.();
            }
        } else {
            this.options.onMaxCountReached?.();
        }
    }

    remove(ip: string) {
        const index = this.ips.findIndex(x => x === ip);

        if (index > -1) {
            this.ips.splice(index, 1);
        }
    }

    removeByIndex(index: number) {
        this.ips.splice(index, 1);
    }

    clear() {
        this.ips = [];
    }

    setFromArray(ips: string[]) {
        this.ips = ips.filter(t => isIp(t));
    }

    setFromString(ipsString: string) {
        this.ips = ipsString.split(',').map(t => t.trim()).filter(t => !!t && isIp(t)); 
    }

    toString() {
        return this.ips.join(',');
    }

    values() {
        return this.ips;
    }
}
