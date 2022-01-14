import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HostGamePage } from '../modules/host-game/host-game.page';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";
import {FormService} from "./test-services/form.service";

describe('HostGamePage', () => {
  let component: HostGamePage;
  let fixture: ComponentFixture<HostGamePage>;
  let form: FormGroup;
  let submitBtn: DebugElement;
  let formService: FormService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HostGamePage ],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [{provide: FormService, useClass: FormService}]
    }).compileComponents();

    fixture = TestBed.createComponent(HostGamePage);
    component = fixture.componentInstance;
    form = component.gameSettings;
    submitBtn = fixture.debugElement.query(By.css('#host-button'));
    formService = new FormService();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only accept numbers for form values', () => {

    let testString = 'this is not a number';

    function testControl(name: string, defaultValue=5){

      form.controls[name].setValue(testString);
      fixture.detectChanges();
      expect(submitBtn.nativeElement.disabled).toBeTrue();
      form.controls[name].setValue(defaultValue);

    }

    testControl('players');
    testControl('seconds', 60);
    testControl('rounds');


  });

  it('should accept only values between 3 and 8 for the number of players', () => {

    formService.testControlForRange(form, submitBtn, fixture,'players', 3, 8, 0, 11);

  });

  it('should accept only values between 30 and 120 for the seconds per round', () => {

    formService.testControlForRange(form, submitBtn, fixture,'players', 3, 8, 0, 11);

  });

  it('should accept only values between 3 and 10 for the number of rounds', () => {

    formService.testControlForRange(form, submitBtn, fixture,'players', 3, 8, 0, 11);

  });

});
