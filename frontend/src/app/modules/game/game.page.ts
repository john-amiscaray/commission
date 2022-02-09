import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as createjs from 'createjs-module';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {GameAction} from "../../dtos/GameAction";
import {LinkedListNode} from "../../data-structures/linked-list-node";
import {GamePlayerStatus} from "../../dtos/GamePlayerStatus";
import {GameStatusType, PauseStatus} from "../../dtos/GameStatus";
import {GameJudgeActionType} from "../../dtos/GameJudgeAction";
import {GameMessageService} from "../../services/game-message.service";
import {GameService} from "../../services/game.service";
import {ToastService} from "../../services/toast.service";
import {Subject} from "rxjs";
import {GameMessageDetails} from "../../dtos/GameMessageDetails";
import {fadeAnimation, fallInAnimation, fallOutAnimation} from "./game-animations";
import {UserLobbyStatus} from "../../dtos/UserLobbyStatus";
import {ComponentWithSplashIntro} from "../../component-interfaces/component-with-splash-intro";

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  animations: [
    fadeAnimation,
    fallOutAnimation,
    fallInAnimation
  ]
})
export class GamePage extends ComponentWithSplashIntro implements AfterViewInit, OnInit {

  colorsOnPallet: Array<string> = ['#000000', '#D3D1D1', '#D62929', '#64BC56', '#437FF3', '#F3E243'];
  colorCode: string = this.colorsOnPallet[2];
  brushSize: number = 10;
  bucketSelected: boolean = false;
  eraserSelected: boolean = false;
  playerCanvases: Map<number, any> = new Map<number, createjs.Stage>();
  activeCanvas: LinkedListNode<number>;
  score: number = 500;
  isJudge = false;
  currentJudge: number = -1;
  roundNumber: number = 1;
  colorPalletSelection: string = this.colorCode;
  displayedJudgeCanvasWarning: boolean = false;
  startEvent: Subject<number> = new Subject<any>();
  pauseEvent: Subject<boolean> = new Subject<boolean>();
  userConnectedStatus: Map<number, UserLobbyStatus>;
  currentMessageDetails: GameMessageDetails = {
    heading: '',
    message: '',
    messageType: GameStatusType.MATCH_START,
    isJudge: false,
    judgeRequest: '',
    drawingUrlMap: null,
    dismissible: true
  };
  // Used to restore the previous message if the game was paused
  messageShouldShow: boolean = false;

  private savedMessage: GameMessageDetails = null;

  constructor(public router: Router, private modal: GameMessageService, private toast: ToastService,
              public auth: AuthService,
              public game: GameService, public route: ActivatedRoute) {
    super();
  }

  ngOnInit() {

    if(!this.game.inActiveGame){

      this.router.navigate(['home']);

    }

    for (let player of this.game.participants) {
      this.playerCanvases.set(player, null);
    }
    this.initCanvasRotation();
    this.userConnectedStatus = this.game.userConnectedStatus;
  }

  private initCanvasRotation() {
    let self = this;

    this.activeCanvas = new LinkedListNode(parseInt(this.auth.getGameId()));

    let temp = this.game.participants.filter(value => {
      return value != parseInt(self.auth.getGameId())
    });
    temp.push(this.activeCanvas.value);
    let lastNode = this.activeCanvas;
    let originNode: LinkedListNode<number> = null;
    let i = 0, j = 1;
    while (i < temp.length) {

      let node = temp[i] === this.activeCanvas.value ? this.activeCanvas : new LinkedListNode(temp[i]);
      if (i === 0) {
        originNode = node;
      }
      let next: LinkedListNode<number> = j < temp.length ?
        (temp[j] === this.activeCanvas.value ? this.activeCanvas : new LinkedListNode(temp[j])) : originNode;

      node.previous = lastNode;
      node.previous.next = node;
      node.next = next;
      next.previous = node;
      lastNode = next;

      i = j + 1;
      j = i + 1;

      if (j === temp.length - 1) {
        next.next = originNode;
      }

    }
  }

  ngAfterViewInit() {

    for(let player of this.playerCanvases.keys()){
      this.canvasInit(player);

    }
    this.addCallbacks();


    this.disableInactiveCanvases();
    this.game.sendGamePlayerStatus(new GamePlayerStatus(parseInt(this.auth.getGameId()), 'CONNECT'));

  }

  private canvasInit(player: number){
    let self = this;
    let stage = new createjs.Stage(document.getElementById(`${player}`));
    this.playerCanvases.set(player, stage);
    createjs.Ticker.on('tick', () => {

      stage.update();

    });

    let shape = new createjs.Shape();
    let oldLocation;
    let drawing = false;

    createjs.Touch.enable(stage, false, true);

    shape.graphics.beginFill("#EAEEEF")
      .drawRect(0, 0, 300, 400)
      .endFill();

    stage.addChild(shape);

    this.game.addGameActionCallback(action => {
      if (player === self.currentJudge) {
        return;
      }
      if (player === action.canvas) {
        oldLocation = action.from;
        shape.graphics.setStrokeStyle(action.size, "round").beginStroke(action.color)
          .moveTo(oldLocation.x, oldLocation.y)
          .lineTo(action.to.x, action.to.y)
          .endStroke();

      }

    });

    let pressListener = (e: any) => {
      if (player === self.currentJudge) {
        return;
      }
      drawing = true;
      if (oldLocation) {
        self.game.sendGameAction(new GameAction(parseInt(self.auth.getGameId()), self.colorCode, self.brushSize,
          oldLocation, {x: e.stageX, y: e.stageY}, self.activeCanvas.value));
      }

    }

    shape.on('pressmove', pressListener);


    shape.on('pressup', _ => {
      if (player === self.currentJudge && !self.displayedJudgeCanvasWarning) {
        self.toast.customToastMessage("You cannot draw on the judge's canvas", 10000);
        self.displayedJudgeCanvasWarning = true;
        return;
      }
      drawing = false;
    });


    stage.on('stagemousemove', (e: any) => {

      if (player === self.currentJudge) {
        return;
      }

      if (!drawing) {
        oldLocation = {x: e.stageX, y: e.stageY};
      }

    });
  }

  private addCallbacks() {
    let self = this;

    this.game.addGameStatusCallback(status => {

      self.isJudge = status.judge === parseInt(self.auth.getGameId());
      self.currentJudge = status.judge;
      self.roundNumber = status.roundNumber;

      if (status.type === GameStatusType.MATCH_START) {

        self.clearCanvases();

        self.currentMessageDetails = self.modal.getMatchStartDetails(self.isJudge);
        self.messageShouldShow = true;

      } else if (status.type === GameStatusType.GAME_END) {
        console.log('trying to end the game (successfully? idk)')
        /*
        Doing this because even though the game service casts the JSON payload to the status object, the map inside
        does not have the functions of a normal map so I need to convert it to a real map. This is real dumb.
         */
        let scoresMap = new Map();
        let scores = status.scores as Object
        for (let user in scores) {
          scoresMap.set(self.userConnectedStatus.get(parseInt(user)).user,
            scores[user]);
        }
        self.modal.presentGameOverModal(new Map([...scoresMap].sort(
          (a, b) => b[1] - a[1])
          .slice(0, 3)))
          .then(_ => {
            self.router.navigate(['']);
          });
      } else if (status.type === GameStatusType.MATCH_END) {

        self.currentMessageDetails = self.modal.getMatchEndDetails(self.isJudge, self.getCanvasUrlMap());
        self.messageShouldShow = true;

      } else if (status.type === GameStatusType.GAME_PAUSE){

        self.pauseEvent.next(true);

        if(self.messageShouldShow){

          self.savedMessage = self.currentMessageDetails;

        }

        self.currentMessageDetails = self.modal.getMatchPauseDetails();
        self.messageShouldShow = true;

      } else if(status.type === GameStatusType.GAME_UNPAUSE){

        let pauseStatus = status as PauseStatus;

        if(pauseStatus.playersHaveLeft){
          if(!pauseStatus.leavingPlayers.includes(parseInt(self.auth.getGameId()))){
            let message = self.game.connectedPlayerCount < 3 ? 'Not enough players left to complete the game.' : 'A player left due to inactivity.';

              self.toast.customToastMessage(message);
              if(self.game.connectedPlayerCount < 3){

                self.leaveGame();

              }

          }else if(pauseStatus.leavingPlayers.includes(parseInt(self.auth.getGameId()))){

            self.toast.customToastMessage('Kicked due to inactivity.');
            self.leaveGame();

          }
        }

        self.pauseEvent.next(false);

        if(self.savedMessage){

          self.currentMessageDetails = self.savedMessage;

        }else{

          self.messageShouldShow = false;

        }

      }

    });

    this.game.addGameScoreCallback(score => {

      if (score.subject === parseInt(self.auth.getGameId())) {
        self.score = score.score;
      }

    });

    this.game.addJudgeActionCallback(action => {

      if (action.type === GameJudgeActionType.CHOSE_SOMETHING_TO_DRAW) {

        self.currentMessageDetails = self.modal.getJudgeRequestDetails(self.isJudge, action.drawing);
        self.startEvent.next();
        self.messageShouldShow = true;

      } else if (action.type === GameJudgeActionType.JUDGED) {

        self.currentMessageDetails = self.modal.getMatchResultsDetails(self.isJudge, action.winner);
        self.messageShouldShow = true;

      }

    });

    this.game.addGamePlayerUpdateCallback(update => {

      if(update.status === 'DISCONNECT'){

        let canvas = this.playerCanvases.get(update.subject);
        GamePage.setCanvasEnabled(canvas, false);
        this.playerCanvases.delete(update.subject);
        this.initCanvasRotation();

      }else if(update.status === 'CONNECT' && !this.playerCanvases.has(update.subject)){

        this.canvasInit(update.subject);
        this.initCanvasRotation();

      }

      this.userConnectedStatus = this.game.userConnectedStatus

    });

  }

  onClickEraser(){

    this.eraserSelected = !this.eraserSelected;
    if(this.eraserSelected){
      this.colorCode = '#EAEEEF';
    }else{
      this.colorCode = this.colorPalletSelection;
    }
  }

  onPalletColorClick(color){

    this.eraserSelected = false;
    this.colorCode = color;
    this.colorPalletSelection = color;

  }

  goToNextCanvas(){

    this.activeCanvas = this.activeCanvas.next;
    this.disableInactiveCanvases();

  }

  goToPreviousCanvas(){

    this.activeCanvas = this.activeCanvas.previous;
    this.disableInactiveCanvases();

  }

  disableInactiveCanvases(){

    for(let canvasPlayer of this.playerCanvases.entries()){

      let enabled = canvasPlayer[0] === this.activeCanvas.value;
      let canvas = canvasPlayer[1];
      GamePage.setCanvasEnabled(canvas, enabled);

    }

  }

  private static setCanvasEnabled(canvas, enabled: boolean) {
    canvas.enableDOMEvents(enabled);

    for (let child of canvas.children) {
      child.mouseEnabled = enabled;
    }
  }

  clearCanvases(){

    for(let canvas of this.playerCanvases.values()){

      for(let child of canvas.children){

        child.graphics.beginFill("#EAEEEF")
          .drawRect(0, 0, 300, 400)
          .endFill();

      }

    }

  }

  getCanvasUrlMap(): Map<number, string>{

    let urls = new Map<number, string>();
    for(let canvas of this.playerCanvases.keys()){

      if(canvas !== this.currentJudge){
        urls.set(canvas, (document.getElementById(canvas + "") as HTMLCanvasElement).toDataURL('image/png'));
      }

    }

    return urls;

  }

  onMessageBackDropClick(){

    if(this.currentMessageDetails.dismissible){
      this.messageShouldShow = false;
    }

  }

  leaveGame(callback: () => void = function () {  }) {

    this.game.clearResourcesOnComplete();
    this.router.navigate(['/home']).then(callback);

  }


}
