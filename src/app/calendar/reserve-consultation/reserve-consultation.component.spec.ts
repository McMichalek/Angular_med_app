import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveConsultationComponent } from './reserve-consultation.component';

describe('ReserveConsultationComponent', () => {
  let component: ReserveConsultationComponent;
  let fixture: ComponentFixture<ReserveConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReserveConsultationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReserveConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
