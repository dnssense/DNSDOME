import {Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbProgressbarModule} from '@ng-bootstrap/ng-bootstrap';
import numeral from 'numeral';
import {TranslateModule} from '@ngx-translate/core';
import {TunnelChartData} from '../histogram.component';
import {DnsTunnelLevel} from '../../../../../../core/services/dns-tunnel.service';

@Component({
  selector: 'dns-tunnel-histogram-tooltip',
  standalone: true,
    imports: [CommonModule, NgbProgressbarModule, TranslateModule],
  templateUrl: './dns-tunnel-histogram-tooltip.component.html',
  styleUrls: ['./histogram-tooltip.component.sass']
})
export class DnsTunnelHistogramTooltipComponent implements OnInit {
  @Input() title: string;
  @Input() chartData: TunnelChartData;
  @Input() dataPointIndex: number;
  total: number;
  getRoundedNumber(value: number) {
        return numeral(value).format('0.0a').replace('.0', '').toUpperCase();
  }

  getProgressBarClass(type: DnsTunnelLevel) {
      switch (type) {
          case DnsTunnelLevel.High:
              return 'malicious-progressbar';
          case DnsTunnelLevel.Suspicious:
              return 'harmful-progressbar';
          default:
              return '';
      }
  }

  ngOnInit(): void {
          this.total = this.chartData.series.reduce((acc: number, curr) => {
              acc += curr.data[this.dataPointIndex];
              return acc;
          }, 0);
  }
}
