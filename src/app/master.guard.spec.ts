import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { masterGuard } from './master.guard';

describe('masterGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => masterGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
