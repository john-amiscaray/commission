import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-pallet-color',
  templateUrl: './pallet-color.component.html',
  styleUrls: ['./pallet-color.component.scss'],
})
export class PalletColorComponent implements OnInit {

  @Input()
  color: string

  @Input()
  selectedColor: string

  constructor() { }

  ngOnInit() {



  }

}
