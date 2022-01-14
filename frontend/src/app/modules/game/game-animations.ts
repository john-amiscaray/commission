import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeAnimation = trigger('fade', [
  state('void', style({ opacity: 0 })),
  transition('void <=> *', [
    animate('0.25s')
  ])
]);

export const fallOutAnimation = trigger('fallout', [
  transition('* => void', [
    animate('0.25s', style({ transform: 'translate(-50%, 100%)'}))
  ])
]);

export const fallInAnimation = trigger('fallin', [
  state('void', style({ transform: 'translate(-50%, -200%) rotate(180deg)' })),
  transition('void => *', [
    animate('0.75s')
  ])
]);
