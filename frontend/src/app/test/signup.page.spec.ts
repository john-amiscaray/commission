import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignupPage } from '../modules/signup/signup.page';
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";

describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupPage ],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule.withRoutes(
        [{path: 'home', loadChildren: () => import('../modules/home/home.module').then(m => m.HomePageModule)},
          {path: 'profile', loadChildren: () => import('../modules/profile/profile.module').then(m => m.ProfilePageModule)},
          {path: 'login', loadChildren: () => import('../modules/signup/signup.module').then(m => m.SignupPageModule)}
        ])],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
