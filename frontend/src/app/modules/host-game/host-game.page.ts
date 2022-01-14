import {Component} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {LobbyService} from "../../services/lobby.service";
import {Router} from "@angular/router";
import {GameSettings} from "../../dtos/GameSettings";
import {AuthService} from "../../services/auth.service";
import {ToastService} from "../../services/toast.service";

@Component({
  selector: 'app-host-game',
  templateUrl: './host-game.page.html',
  styleUrls: ['./host-game.page.scss'],
})
export class HostGamePage {

  gameSettings: FormGroup = this.formBuilder.group({

    players: [5, [Validators.required, numberValidator(), Validators.min(3), Validators.max(8)]],
    seconds: [60, [Validators.required, numberValidator(), Validators.min(30), Validators.max(120)]],
    rounds: [5, [Validators.required, numberValidator(), Validators.min(3), Validators.max(10)]]

  });

  loadingGame: boolean = false;

  constructor(private formBuilder: FormBuilder, private router: Router,
              private game: LobbyService, private auth: AuthService, private toast: ToastService) {}

  ionViewDidEnter(){

    if(!this.auth.hasValidProfile()){
      this.router.navigate(['profile']);
      this.auth.presentBadProfileError();
    }

  }

  submit(){

    let self = this;
    this.loadingGame = true;

    this.game.requestLobbyStart(self.gameSettings.getRawValue() as GameSettings, _ => {

      self.router.navigate(['lobby']);

    }, err => {

      setTimeout(() => {

        self.loadingGame = false;
        self.toast.failureToast('Something went wrong trying to host the game. Try refreshing or coming back later. If the problem persists, send a bug report.');

      }, 2000);

    });

  }

  ionViewDidLeave(){

    this.loadingGame = false;

  }

}

export function numberValidator(): ValidatorFn{

  return (control: AbstractControl): { [key: string]: any } | null =>
    isNaN(control.value)
      ? {badInput: control.value} : null;

}
