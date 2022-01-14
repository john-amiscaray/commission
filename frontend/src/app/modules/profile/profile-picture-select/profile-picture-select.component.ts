import { Component, OnInit } from '@angular/core';
import {PopoverController} from "@ionic/angular";
import {ProfilePictureService} from "../../../services/profile-picture.service";

@Component({
  selector: 'app-profile-picture-select',
  templateUrl: './profile-picture-select.component.html',
  styleUrls: ['./profile-picture-select.component.scss'],
})
export class ProfilePictureSelectComponent implements OnInit {

  profilePictures: Array<string>;

  selectedProfilePicture: string;

  constructor(private pop: PopoverController, public pfp: ProfilePictureService) {

    this.profilePictures = ProfilePictureService.profilePictures;

  }

  ngOnInit() {}

  onSelectPicture(pfpName: string){

    this.pfp.setProfilePicture(pfpName);
    this.pop.dismiss(this.pfp.getProfilePictureFromName(pfpName));

  }

}
