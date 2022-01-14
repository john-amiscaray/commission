import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../services/auth.service";
import {PopoverController} from "@ionic/angular";
import {ToastService} from "../../../services/toast.service";

@Component({
  selector: 'app-profile-name-select',
  templateUrl: './profile-name-select.component.html',
  styleUrls: ['./profile-name-select.component.scss'],
})
export class ProfileNameSelectComponent implements OnInit {

  username: string;

  constructor(private auth: AuthService, private pop: PopoverController,
              private toast: ToastService) { }

  ngOnInit() {

    this.username = this.auth.getName();

  }

  setName(){

    if(this.validateName(this.username)){
      this.pop.dismiss(this.username);
    }else{
      this.toast.customToastMessage('Your name must not be empty and be at most 20 characters', 2000);
    }

  }

  validateName(name: string): boolean{

    return name.trim().length > 0 && name.length <= 20;

  }

}
