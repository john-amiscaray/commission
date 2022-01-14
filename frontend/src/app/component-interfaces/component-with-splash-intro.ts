import { Plugins } from '@capacitor/core';

const { SplashScreen } = Plugins;

export class ComponentWithSplashIntro{

  ionViewWillEnter(){
    SplashScreen.show({
      showDuration: 2000,
      autoHide: true
    });
  }

}
