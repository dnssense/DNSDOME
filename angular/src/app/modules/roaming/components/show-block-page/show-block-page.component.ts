import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import { RkSelectModel } from 'roksit-lib'
import { InputIPService } from 'src/app/core/services/inputIPService'
import { TranslatorService } from 'src/app/core/services/translator.service'
import { DEFAULT_SHOW_BLOCK_PAGE_IP, ShowBlockPageMethod } from '../../constants'
import { SSL_CERT_DOWNLOAD_URL } from './constants'

@Component({
  selector: 'app-show-block-page',
  templateUrl: './show-block-page.component.html',
})
export class ShowBlockPageComponent implements OnChanges, OnInit {
  @Input({ required: true })
  method: ShowBlockPageMethod

  @Input({ required: true })
  ipAddress = ''

  @Output()
  onMethodChange = new EventEmitter<ShowBlockPageMethod>()

  @Output()
  onIpAddressChange = new EventEmitter<string>()

  readonly ShowBlockPageMethod = ShowBlockPageMethod

  customIp = ''

  private readonly inputIPService = inject(InputIPService)
  private readonly translatorService = inject(TranslatorService)

  methodOptions: RkSelectModel[] = [
    {
      displayText: this.translatorService.translate('ShowBlockPageOptionOnlyHTTP'),
      value: ShowBlockPageMethod.ONLY_HTTP,
      selected: false,
    },
    {
      displayText: this.translatorService.translate('ShowBlockPageOptionHTTP_HTTPS'),
      value: ShowBlockPageMethod.HTTP_HTTPS,
      selected: false,
    },
    {
      displayText: this.translatorService.translate('ShowBlockPageOptionCustomIP'),
      value: ShowBlockPageMethod.CUSTOM_IP,
      selected: false,
    },
  ]

  ngOnInit(): void {
    this.updateSelectedOption(this.method)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['method']) {
      const currentValue = changes['method'].currentValue

      this.updateSelectedOption(currentValue)

      if (currentValue === ShowBlockPageMethod.HTTP_HTTPS) {
        this.onIpAddressChange.emit(DEFAULT_SHOW_BLOCK_PAGE_IP)
      } else if (currentValue === ShowBlockPageMethod.ONLY_HTTP) {
        this.onIpAddressChange.emit('')
      } else if (currentValue === ShowBlockPageMethod.CUSTOM_IP) {
        this.onIpAddressChange.emit(this.customIp)
      }
    }
  }

  onMethodSelectionChange(value: ShowBlockPageMethod) {
    this.onMethodChange.emit(value)
  }

  onDownloadSSLCertClick() {
    window.open(SSL_CERT_DOWNLOAD_URL, '_blank')
  }

  checkIPNumber(event: KeyboardEvent, inputValue: string) {
    this.inputIPService.checkIPNumber(event, inputValue)
  }

  onCustomIpChange(event: Event) {
    this.onIpAddressChange.emit((event.target as HTMLInputElement).value)
  }

  private updateSelectedOption(value: ShowBlockPageMethod) {
    this.methodOptions = this.methodOptions.map((option) => ({
      ...option,
      selected: option.value === value,
    }))
  }
}
