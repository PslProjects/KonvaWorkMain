import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaultDetectionComponent } from './fault-detection.component';

describe('FaultDetectionComponent', () => {
  let component: FaultDetectionComponent;
  let fixture: ComponentFixture<FaultDetectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaultDetectionComponent]
    });
    fixture = TestBed.createComponent(FaultDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
