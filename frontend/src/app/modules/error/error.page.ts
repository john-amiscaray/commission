import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ERROR_MESSAGES} from "../../constants/Constants";

@Component({
  selector: 'app-error',
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
})
export class ErrorPage implements OnInit {

  public error = ERROR_MESSAGES.FAILED_TO_GENERATE_UUID

  constructor(private route: ActivatedRoute, public router: Router) { }

  ngOnInit() {
    this.error = this.route.snapshot.queryParamMap.get('error');
  }

}
