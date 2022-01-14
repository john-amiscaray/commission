import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import { Observable } from 'rxjs';
import {AuthService} from "./auth.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor{

  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const headers = {
      'Content-Type': 'application/json',
      'Accept': req.headers.get('Accept') ? req.headers.get('Accept') : 'application/json',
      'Access-Control-Allow-Origin': environment.backEndUrl,
    }

    if(req.headers.get('notJson')){

      headers['Accept'] = 'text/plain'

    }

    req = req.clone({
      setHeaders : headers
    });

    return next.handle(req);
  }
}
