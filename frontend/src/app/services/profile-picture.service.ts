import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfilePictureService {

  static readonly Dog: string = 'Dog';
  static readonly Cat: string = 'Cat';
  static readonly Bach: string = 'Bach';
  static readonly profilePictures: Array<string> = [
    ProfilePictureService.Dog,
    ProfilePictureService.Bach,
    ProfilePictureService.Cat
  ];

  static readonly pfpRef: string = 'pfp';

  constructor() { }

  getProfilePictureFromName(name: string){
    switch(name){
      case ProfilePictureService.Dog:
        return '/assets/images/profile-pictures/000.png';
      case ProfilePictureService.Cat:
        return '/assets/images/profile-pictures/001.png';
      case ProfilePictureService.Bach:
        return '/assets/images/profile-pictures/002.png';
      default:
        throw new Error('Invalid Profile Picture Name');
    }
  }

  setProfilePicture(name: string){
    let url = this.getProfilePictureFromName(name);
    if(url){
      sessionStorage.setItem(ProfilePictureService.pfpRef, name);
    }
  }

  getProfilePicture(){

    return sessionStorage.getItem(ProfilePictureService.pfpRef);

  }

}
