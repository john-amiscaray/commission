### Commission

#### What is this project?

This project is a multiplayer drawing party game for mobile and the web. The tech stack used is Angular + Ionic + Spring Boot. The premise of this game is that in each round, each player has a turn being a judge. The judge chooses a prompt for the rest of the players to draw in a limited amount of time. Once time runs out, the judge picks whose drawing was the best awarding the player with money (in-game points). The gimmick here is that artists are allowed to draw on each other’s canvases with a money penalty depending on the size of the brush used.

#### Generating an android project

You’ll notice that in this repo there is no android project present. This is because the android project can be generated from the web project using Capacitor. To generate the android project, open your command terminal at the frontend folder and run the following command:

```bash
ionic capacitor add android --configuration=production
```
> The configuration argument is set to production to connect to the production server so it can communicate in the game with other devices. Please use this sparingly as the server is for us to just test out the application and likely cannot handle heavy usage. 

Now, the android project should have been created but the splash screen and app launcher icons will not be added to the project. To fix this, first, install the `cordova-res` command globally with npm. Then, run this next command to generate the splash screen icons (they should already exist in this repo but you should generate them again just in case):

```bash
cordova-res android
```
With the assets generated, move the splash screen assets to the appropriate folders in the android project. There should be folders in `frontend\android\app\src\main\res` with matching names to each of your splash screen images.

As for the app launcher icon, open the android project in android studio, right-click the root folder, and click **new>image asset**. For the source asset, select the file **frontend/resources/icon.png**. From there click next and finish and your IDE should generate the necessary assets in the correct locations (note this might not work the first time so if this occurs just repeat these same steps again. I’m not sure why this happens).

#### Generating an ios project

This app has never been tested for ios due to my personal limitations for ios development. However, since this project uses Capacitor it should be possible to generate an ios project in a very similar way to how we generated the android project. I haven’t done this however so consult the [docs](https://capacitorjs.com/docs/ios) to do so.

#### How does this project work?

The main application logic of this project is based on communications between our client and server-side applications via [STOMP over WebSocket](http://jmesnil.net/stomp-websocket/doc/). Clients will send JSON payloads via our WebSocket endpoints to our server to apply their player actions and send these payloads back to all the clients for them to also process player actions. To authorize the user to perform these actions, each user receives a JWT from the server and adds it to their STOMP headers which will be validated. It’s worth noting that on the client-side, we use a library called [rxstomp](https://github.com/stomp-js/rx-stomp) which provides a STOMP client that uses the familiar observable patterns you’ll see in Angular.

---

Special shout out to my friend [Hanna](https://github.com/Hanna-Frances) for designing the UI for me. Much appreciated.


