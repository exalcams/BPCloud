import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneDilaogComponent } from './phone-dilaog.component';

describe('PhoneDilaogComponent', () => {
  let component: PhoneDilaogComponent;
  let fixture: ComponentFixture<PhoneDilaogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneDilaogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneDilaogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
