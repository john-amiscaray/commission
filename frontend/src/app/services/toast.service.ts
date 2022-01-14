import { Injectable } from '@angular/core';
import {ToastController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async failureToast(errorMessage: string = 'Whoops, something went wrong! Try again or consider sending a bug report'){
    const toast = await this.toastController.create({
      message: errorMessage,
      duration: 10000
    });
    await toast.present();
  }

  async customToastMessage(message: string, duration: number=10000){
    const toast = await this.toastController.create({
      message: message,
      duration: duration
    });
    await toast.present();
  }

}
