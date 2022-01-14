import { Injectable } from '@angular/core';
import {ProfilePictureService} from "./profile-picture.service";
import {ToastService} from "./toast.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ParticipantInfo} from "../dtos/GameIdentity";
import {Router} from "@angular/router";
import {ERROR_MESSAGES} from "../constants/Constants";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static readonly ID = 'id';
  static readonly USERNAME = 'username';
  static readonly ROOM_CODE = 'active room';
  static readonly JWT = 'jwt';
  static readonly UUID = 'uuid';

  private _uuidAttemptedToGenerate: boolean = false;

  constructor(private pfp: ProfilePictureService, private toast: ToastService,
              private http: HttpClient, private router: Router) { }

  get uuidAttemptedToGenerate(){

    return this._uuidAttemptedToGenerate;

  }

  setGameId(id: number){

    sessionStorage.setItem(AuthService.ID, `${id}`);

  }

  getGameId(){

    return sessionStorage.getItem(AuthService.ID);

  }

  resetGameId(){

    sessionStorage.removeItem(AuthService.ID);

  }

  setName(name: string){

    sessionStorage.setItem(AuthService.USERNAME, name);

  }

  getName(){

    return sessionStorage.getItem(AuthService.USERNAME);

  }

  hasValidProfile(): boolean{

    return this.getName() !== null && this.pfp.getProfilePicture() !== null;

  }

  presentBadProfileError(){

    this.toast.customToastMessage('Please set your profile before entering a game');

  }

  getUserInfo(roomCode: string, id: number){

    return this.http.get<ParticipantInfo>(`${environment.apiUrl}/room/${roomCode}/player/${id}`);

  }

  setRoomCode(roomCode: string){

    sessionStorage.setItem(AuthService.ROOM_CODE, roomCode);

  }

  getRoomCode(){

    return sessionStorage.getItem(AuthService.ROOM_CODE);

  }

  resetRoomCode(){

    sessionStorage.removeItem(AuthService.ROOM_CODE);

  }

  getJWT(){

    return sessionStorage.getItem(AuthService.JWT);

  }

  setJWT(token: string){

    sessionStorage.setItem(AuthService.JWT, token);

  }

  getUUID(){

    return sessionStorage.getItem(AuthService.UUID);

  }

  private static setUUID(uuid: string){

    sessionStorage.setItem(AuthService.UUID, uuid);

  }

  resetUUID(){

    navigator.sendBeacon(`${environment.apiUrl}/logout-details?uuid=${this.getUUID()}`);
    sessionStorage.removeItem(AuthService.UUID);
    console.log('beacon request should have sent');

  }

  generateAndSaveUUID(then: () => void = () => {}){

    this.http.get(`${environment.apiUrl}/sessionId`, {responseType: 'text'}).subscribe(uuid => {

      AuthService.setUUID(uuid);
      this._uuidAttemptedToGenerate = true;
      then();

    }, _ => {

      this.router.navigate(['error'], {queryParams: {error: ERROR_MESSAGES.FAILED_TO_GENERATE_UUID}});
      this._uuidAttemptedToGenerate = true;
      then();

    });

  }


}
