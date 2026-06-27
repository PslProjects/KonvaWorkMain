import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminResultSearchComponent } from './admin-result-search.component';

describe('AdminResultSearchComponent', () => {
  let component: AdminResultSearchComponent;
  let fixture: ComponentFixture<AdminResultSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminResultSearchComponent]
    });
    fixture = TestBed.createComponent(AdminResultSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
