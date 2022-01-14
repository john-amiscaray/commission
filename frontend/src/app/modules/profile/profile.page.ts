import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import {PopoverController} from "@ionic/angular";
import {ProfilePictureSelectComponent} from "./profile-picture-select/profile-picture-select.component";
import {ProfileNameSelectComponent} from "./profile-name-select/profile-name-select.component";
import {ProfilePictureService} from "../../services/profile-picture.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  username: string
  nameInputValue: string = '';
  selectedImage: string = '';

  constructor(private http: HttpClient, private auth: AuthService,
              private pop: PopoverController, private pfp: ProfilePictureService) { }

  ionViewDidEnter() {

    if(!this.auth.getName()){
      this.http.get('/assets/files/names.txt', { responseType: 'text' })
        .subscribe(res => {

          let names: Array<string> = res.split('\n');
          // The last element is blank
          names.pop();
          this.username = names[Math.floor(Math.random() * names.length)];
          this.auth.setName(this.username);

        });
    }else{

      this.username = this.auth.getName();

    }

    let pfp = this.pfp.getProfilePicture();
    if(pfp){
      this.selectedImage = this.pfp.getProfilePictureFromName(pfp);
    }else{
      this.pfp.setProfilePicture(ProfilePictureService.Dog);
      this.selectedImage = this.pfp.getProfilePictureFromName(ProfilePictureService.Dog);
    }

  }

  async presentProfilePictures(){

    let popover = await this.pop.create({
      component: ProfilePictureSelectComponent
    });

    await popover.present();

    popover.onDidDismiss().then(res => {
      if(res.data){
        this.selectedImage = res.data;
      }
    })

  }

  async presentNameSelect(ev){

    let popover = await this.pop.create({
      component: ProfileNameSelectComponent,
      event: ev
    });

    await popover.present();

    popover.onDidDismiss().then(res => {
      if(res.data){
        this.username = res.data;
        this.auth.setName(this.username);
      }
    })

  }

}
