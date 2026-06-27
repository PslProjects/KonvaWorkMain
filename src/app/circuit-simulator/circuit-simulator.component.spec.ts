import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitSimulatorComponent } from './circuit-simulator.component';

describe('CircuitSimulatorComponent', () => {
  let component: CircuitSimulatorComponent;
  let fixture: ComponentFixture<CircuitSimulatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CircuitSimulatorComponent]
    });
    fixture = TestBed.createComponent(CircuitSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
