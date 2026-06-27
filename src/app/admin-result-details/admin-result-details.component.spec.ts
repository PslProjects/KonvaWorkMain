import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminResultDetailsComponent } from './admin-result-details.component';

describe('AdminResultDetailsComponent', () => {
  let component: AdminResultDetailsComponent;
  let fixture: ComponentFixture<AdminResultDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminResultDetailsComponent]
    });
    fixture = TestBed.createComponent(AdminResultDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
