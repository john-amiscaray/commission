import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PromptGeneratorService {

  constructor(private http: HttpClient) { }

  getRandomPrompt(roomCode: string): Observable<string>{

    return this.http.get(`${environment.apiUrl}/prompts/for/game/${roomCode}/random`, {responseType: "text"})

  }


}
