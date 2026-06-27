import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMasterVerifyComponent } from './admin-master-verify.component';

describe('AdminMasterVerifyComponent', () => {
  let component: AdminMasterVerifyComponent;
  let fixture: ComponentFixture<AdminMasterVerifyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminMasterVerifyComponent]
    });
    fixture = TestBed.createComponent(AdminMasterVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
