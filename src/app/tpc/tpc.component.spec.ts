import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpcComponent } from './tpc.component';

describe('TpcComponent', () => {
  let component: TpcComponent;
  let fixture: ComponentFixture<TpcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TpcComponent]
    });
    fixture = TestBed.createComponent(TpcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
