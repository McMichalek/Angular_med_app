import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineAbsenceComponent } from './define-absence.component';

describe('DefineAbsenceComponent', () => {
  let component: DefineAbsenceComponent;
  let fixture: ComponentFixture<DefineAbsenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefineAbsenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefineAbsenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
