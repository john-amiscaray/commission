import { TestBed } from '@angular/core/testing';

import { HttpInterceptorService } from '../services/http-interceptor.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('HttpInterceptorService', () => {
  let service: HttpInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(HttpInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
