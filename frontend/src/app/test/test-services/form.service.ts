import {DebugElement, Injectable} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ComponentFixture} from "@angular/core/testing";

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

  testControlForRange(form: FormGroup, submitBtn: DebugElement, fixture: ComponentFixture<any>,
                      control: string, min: number, max: number,
                      minRand: number, maxRand: number){

    let randNum = this.random(minRand, maxRand);
    form.controls[control].setValue(randNum);
    fixture.detectChanges();

    if(randNum >= min && randNum <= max){

      expect(submitBtn.nativeElement.disabled).toBeFalse();
      console.log(randNum);

    }else{

      expect(submitBtn.nativeElement.disabled).toBeTrue();

    }

  }

  random(min, max){

    return Math.floor(Math.random() * (max - min + 1)) + min;

  }

}
