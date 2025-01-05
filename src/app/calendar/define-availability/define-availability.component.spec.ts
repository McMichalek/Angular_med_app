import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineAvailabilityComponent } from './define-availability.component';

describe('DefineAvailabilityComponent', () => {
  let component: DefineAvailabilityComponent;
  let fixture: ComponentFixture<DefineAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefineAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefineAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
