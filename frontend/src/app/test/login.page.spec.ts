import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginPage } from '../modules/login/login.page';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {RouterTestingModule} from "@angular/router/testing";
import {FormService} from "./test-services/form.service";
import {DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";
import {of} from "rxjs";
import {HomePageModule} from "../modules/home/home.module";

describe('LoginPage', () => {
  let component: LoginPage;
  let form: FormGroup;
  let fixture: ComponentFixture<LoginPage>;
  let formService: FormService;
  let loginBtn: DebugElement;

  beforeEach(waitForAsync(() => {

    // live and
    let spy = jasmine.createSpyObj('AuthService', ['signUp', 'login', 'loggedIn']);
    spy.login.and.returnValue(of("some-jwt-token"));

    TestBed.configureTestingModule({
      declarations: [ LoginPage ],
      imports: [IonicModule.forRoot(), HomePageModule, ReactiveFormsModule, RouterTestingModule.withRoutes(
        [{path: 'home', loadChildren: () => import('../modules/home/home.module').then(m => m.HomePageModule)},
          {path: 'profile', loadChildren: () => import('../modules/profile/profile.module').then(m => m.ProfilePageModule)},
          {path: 'login', loadChildren: () => import('../modules/signup/signup.module').then(m => m.SignupPageModule)}
        ])],
      providers: [
        {provide: AuthService, useValue: spy},
        {provide: FormService, useClass: FormService}
        ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    form = component.loginForm;
    formService = new FormService();
    loginBtn = fixture.debugElement.query(By.css('#login-btn'));
    form.controls['password'].setValue('');
    form.controls['username'].setValue('');
    fixture.detectChanges();
    sessionStorage.clear();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept usernames within 3 to 20 characters', () => {

    form.controls['password'].setValue('thisisapassword');
    let test: String = '';
    for(let i = 0; i < 30; i++){
      test += 'a';
      form.controls['username'].setValue(test);
      fixture.detectChanges();
      if(test.length >= 3 && test.length <= 20){
        expect(loginBtn.nativeElement.disabled).toBeFalse();
      }else{
        expect(loginBtn.nativeElement.disabled).toBeTrue();
      }
    }

  });

  it('should save the token when logging in successfully', () => {

    form.controls['username'].setValue('Garry');
    form.controls['password'].setValue('thisisapassword');
    fixture.detectChanges();
    console.log(`------[IMPORTANT]: ${form.controls['username'].value} ${form.controls['password'].value}`);
    loginBtn.nativeElement.click();
    expect(sessionStorage.getItem('jwt')).toBeTruthy();

  });


});
