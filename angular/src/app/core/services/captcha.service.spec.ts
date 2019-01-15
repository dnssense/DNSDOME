/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CaptchaService } from './captcha.service';

describe('Service: Captcha', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CaptchaService]
    });
  });

  it('should ...', inject([CaptchaService], (service: CaptchaService) => {
    expect(service).toBeTruthy();
  }));
});
