import {inject, Pipe, PipeTransform} from '@angular/core';
import {
    RkTranslatorService,
} from 'roksit-lib';
import {DnsTunnelLevel} from '../../../../core/services/dns-tunnel.service';

@Pipe({
    name: 'TunnelSeverityName',
    standalone: true
})
export class TunnelSeverityNamePipe implements PipeTransform {
    translatorService = inject(RkTranslatorService);
    translationPrefix = 'DnsTunnel';

    transform(level: DnsTunnelLevel): string {
        let levelName = 'N/A';
        switch (level) {
            case DnsTunnelLevel.High:
                levelName = this.translatorService.translate(this.translationPrefix + '.TunnelDetected');
                break;
            case DnsTunnelLevel.Suspicious:
                levelName = this.translatorService.translate(this.translationPrefix + '.UnderInvestigation');
                break;

        }
        return levelName;
    }
}
