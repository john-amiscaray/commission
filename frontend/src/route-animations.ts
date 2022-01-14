import { AnimationController, Animation} from "@ionic/angular";

export const navigateAnimation = (baseEL: HTMLElement, opts?:any): Animation => {

  const ctrl = new AnimationController();

  return ctrl.create()
    .addElement(opts.leavingEl)
      .duration(500)
      .easing('ease-in')
      .fromTo('opacity', 1, 0)
}
