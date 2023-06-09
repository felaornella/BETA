import { TestBed } from '@angular/core/testing';

import { GpsUtilsService } from './gps-utils.service';

describe('GpsUtilsService', () => {
  let service: GpsUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GpsUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
